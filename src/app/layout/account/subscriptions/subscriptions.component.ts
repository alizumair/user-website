import { AppSettings } from './../../../shared/models/appSettings.model';
import { UserService } from './../../../services/user/user.service';
import { MessagingService } from './../../../services/messaging/messaging.service';
import { Subscription } from 'rxjs';
import { GlobalVariable } from './../../../core/global';
import { PaginationModel } from './../../../shared/models/pagination.model';
import { ApiUrl } from './../../../core/apiUrl';
import { HttpService } from './../../../services/http/http.service';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { UtilityService } from '../../../services/utility/utility.service';
import { WINDOW } from '../../../services/window/window.service';
import { StyleVariables } from '../../../core/theme/styleVariables.model';
import { TranslateService } from '@ngx-translate/core';
import { Route, Router } from '@angular/router';
import { LocalizationPipe } from '../../../shared/pipes/localization.pipe';
declare const $;
@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.scss']
})
export class SubscriptionsComponent implements OnInit, OnDestroy {

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
  activeSubscription: any;

  paymentSource: number = 1;
  is_subscribed: boolean = false;

  constructor(
    private message: MessagingService,
    private translate: TranslateService,
    private userService: UserService,
    private httpService: HttpService,
    private utilityService: UtilityService,
    private router: Router,
    @Inject(WINDOW) private window: Window,
    private localization: LocalizationPipe,

  ) {
    this.currency = GlobalVariable.CURRENCY;
    this.pagination = new PaginationModel();
    this.pagination.perPage = 12;
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

    this.httpService.getData(ApiUrl.getSubscriptions, query).subscribe((response: any) => {
      if (response && response.data) {
        this.subscriptions = response.data.list;
        if (!this.is_subscribed) {
          this.is_subscribed = this.subscriptions.some(subscription => {
            return subscription['is_subscribed'] == 1;
          });
        }
        this.pagination.count = response.data.count;
        this.activeSubscription = this.subscriptions.find(sub => sub.is_subscribed == 1);
      }
      this.isLoading = false;
    }, (err) => this.isLoading = false)
  }

  buySubscription(subscription): void {
    this.selectedSubscription = subscription;
    this.paymentOrderModel = {
      amount: parseInt(subscription.price),
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
    debugger
    this.isPayOnline = false;
    const payload: any = {
      subscription_plan_id: this.selectedSubscription.id,
      type: this.selectedSubscription.type,
      price: this.paymentSource == 4 ? parseFloat(this.selectedSubscription.price) : this.paymentOrderModel.amount,
      action: 1,
      paymentType: this.paymentSource
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
        if (transaction.paymentGatewayId != "authorize_net") {
          payload['customer_payment_id'] = transaction.customer_payment_id;
          payload['card_id'] = transaction.card_id;
        } if (transaction.paymentGatewayId == "authorize_net") {
          payload['authnet_profile_id'] = this.paymentOrderModel.user.authnet_profile_id;
          payload['authnet_payment_profile_id'] = transaction.card_id;
        }
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
        this.message.toast('info', this.translate.instant('Subscription Bought Successfully'));
        this.getSubscriptions();
      }
      this.isLoading = false;
    }, (err) => this.isLoading = false)
  }

  pageChange(event) {
    this.pagination.currentPage = event;
    this.pagination.offset = event > 1 ? (event - 1) * this.pagination.perPage : 0;
    this.getSubscriptions();
    this.window.scrollTo(0, 0);
  }

  selectPaymentSource(subscription) {
    this.selectedSubscription = subscription;
    $('#paymentSelection').modal('toggle');
  }

  proceedPayment() {
    debugger
    if (this.paymentSource == 1) {
      this.buySubscription(this.selectedSubscription);
    } else {
      this.onPaymentSuccess(null);
    }
  }

  viewSubsDetails() {
    this.router.navigate(['/account/subscriptions', this.activeSubscription.id]);
  }

  ngOnDestroy() {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.settingSubscription) this.settingSubscription.unsubscribe();
    if (!!this.userSubscription) this.userSubscription.unsubscribe();
  }

}
