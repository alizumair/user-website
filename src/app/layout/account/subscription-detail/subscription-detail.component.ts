import { Router } from '@angular/router';
import { AppSettings } from './../../../shared/models/appSettings.model';
import { PaginationModel } from './../../../shared/models/pagination.model';
import { UserService } from './../../../services/user/user.service';
import { MessagingService } from './../../../services/messaging/messaging.service';
import { ApiUrl } from './../../../core/apiUrl';
import { GlobalVariable } from './../../../core/global';
import { UtilityService } from './../../../services/utility/utility.service';
import { HttpService } from './../../../services/http/http.service';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { WINDOW } from '../../../services/window/window.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-subscription-detail',
  templateUrl: './subscription-detail.component.html',
  styleUrls: ['./subscription-detail.component.scss']
})
export class SubscriptionDetailComponent implements OnInit, OnDestroy {

  isLoading: boolean = false;
  selectedSubscription: any;

  user: any;
  userSubscription: Subscription;

  styleSubscription: Subscription;
  style: StyleVariables;

  settings: AppSettings;
  settingSubscription: Subscription;

  pagination: PaginationModel;
  currency: string = '';

  isPayOnline: boolean = false;
  paymentOrderModel: any = {}
  subscriptions: Array<any> = [];

  constructor(
    private message: MessagingService,
    private translate: TranslateService,
    private userService: UserService,
    private httpService: HttpService,
    private utilityService: UtilityService,
    private router: Router,
    @Inject(WINDOW) private window: Window

  ) {
    this.currency = GlobalVariable.CURRENCY;
    this.pagination = new PaginationModel();
    this.pagination.perPage = 4;
    this.pagination.currentPage = 1;
    this.pagination.offset = 0;
  }


  ngOnInit() {

    this.styleSubscription = this.utilityService.getStyles.subscribe((style: StyleVariables) => {
      this.style = style;
    })

    this.userSubscription = this.userService.currentUser
      .subscribe(user => {
        if (!!user) {
          this.user = user;
        }
      });

    this.settingSubscription = this.utilityService.getSettings.subscribe((settings: AppSettings) => {
      if (!!settings) {
        this.settings = settings;
      }
    });

    this.getSubscriptions();
  }

  getSubscriptions(): void {
    this.isLoading = true;

    const query = {
      'skip': this.pagination.offset,
      'limit': this.pagination.perPage
    }

    this.httpService.getData(ApiUrl.getMySubscriptionList, query).subscribe((response: any) => {
      if (response && response.data) {
        this.subscriptions = response.data.list;
        this.pagination.count = response.data.count;
        this.selectedSubscription = this.subscriptions[0];
      }
      this.isLoading = false;
    }, (err) => this.isLoading = false)
  }

  buySubscription(): void {
    this.paymentOrderModel = {
      amount: parseInt(this.selectedSubscription.price),
      user: this.user,
      address: {}
    }
    this.isPayOnline = true;
    this.utilityService.setLocalData('transactionType', 'subscription');
  }

  onPaymentError(err) {
    this.message.toast('error', err);
    this.isPayOnline = false;
  }

  onPaymentSuccess(transaction) {
    this.isPayOnline = false;
    const payload: any = {
      subscription_plan_id: this.selectedSubscription.subscription_plan_id,
      end_date: this.selectedSubscription.end_date,
      renew_id: this.selectedSubscription.renew_id,
      type: this.selectedSubscription.type,
      price: this.paymentOrderModel.amount,
      action: 2,
      paymentType: 1
      // languageId: `${this.utilityService.handler.languageId}`
    };

    payload['benefit_type'] = this.selectedSubscription.benefits.map(benefit => benefit.benefit_type).toString();

    if (transaction) {
      payload['gateway_unique_id'] = transaction.paymentGatewayId;
      payload['currency'] = GlobalVariable.CURRENCY_NAME;
      if (transaction.token) {
        payload['payment_token'] = transaction.token;
      } else if (transaction.mobile_no) {
        payload['mobile_no'] = transaction.mobile_no;
      } else {
        payload['customer_payment_id'] = transaction.customer_payment_id;
        payload['card_id'] = transaction.card_id;
      }
    }

    this.isLoading = true;
    this.utilityService.setLocalData('gop', payload, true);
    if (transaction && transaction.waitForSuccess) {
      const a = document.createElement('a');
      a.href = transaction['paymentUrl'];
      a.click();
      return
    }

    this.httpService.postData(ApiUrl.buySubscription, payload).subscribe((response) => {
      if (response) {
        this.message.toast('info', this.translate.instant('Subscription Successfully Renew'));
        this.getSubscriptions();
      }
      this.isLoading = false;
    }, (err) => this.isLoading = false)
  }

  cancelSubscription(): void {
    this.isLoading = true;
    const payload = {
      subscription_plan_id: this.selectedSubscription.subscription_plan_id,
      action: 1                        //1 - cancel, 2 - delete
    }
    this.httpService.postData(ApiUrl.cancelSubscription, payload).subscribe((response) => {
      this.isLoading = false;
      this.router.navigate(['/', 'account', 'subscriptions']);
    }, (err) => this.isLoading = false)
  }

  pageChange(event) {
    this.pagination.currentPage = event;
    this.pagination.offset = event > 1 ? (event - 1) * this.pagination.perPage : 0;
    this.getSubscriptions();
    this.window.scrollTo(0, 0);
  }

  ngOnDestroy() {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.settingSubscription) this.settingSubscription.unsubscribe();
    if (!!this.userSubscription) this.userSubscription.unsubscribe();
  }

}
