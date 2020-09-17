import { ActivatedRoute, Router } from '@angular/router';
import { ScriptModel } from './../../../shared/models/script.model';
import { ScriptService } from './../../../services/script/script.service';
import { UserService } from './../../../services/user/user.service';
import { PaginationModel } from './../../../shared/models/pagination.model';
import { HttpService } from './../../../services/http/http.service';
import { GlobalVariable } from './../../../core/global';
import { ApiUrl } from './../../../core/apiUrl';
import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { CountryISO } from 'ngx-intl-tel-input';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from '../../../services/utility/utility.service';
import { MessagingService } from '../../../services/messaging/messaging.service';
import { StyleVariables } from '../../../core/theme/styleVariables.model';
import { AppSettings } from '../../../shared/models/appSettings.model';
import { Subscription } from 'rxjs';
import { WINDOW } from '../../../services/window/window.service';

@Component({
  selector: 'app-my-wallet',
  templateUrl: './my-wallet.component.html',
  styleUrls: ['./my-wallet.component.scss']
})
export class MyWalletComponent implements OnInit {

  sendMode: 'phone' | 'email' = 'email';

  isLoading: boolean = false;
  submitted: boolean = false;
  transactions: Array<any> = [];
  walletAmount = '';
  currency: string = '';
  sendMoneyForm: FormGroup;
  addMoneyForm: FormGroup;
  pagination: PaginationModel;

  style: StyleVariables;
  styleSubscription: Subscription;

  settings: AppSettings;
  settingSubscription: Subscription;

  isPayOnline: boolean = false;
  paymentOrderModel: any = {}
  selectedGateway: any;
  paymentGateways: Array<any>;
  gatewaySubscription: Subscription;

  user: any;
  userSubscription: Subscription;

  countryISO: CountryISO | string = CountryISO.UnitedStates;
  preferredCountries: Array<CountryISO> | Array<string> = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  @ViewChild('sendMoneyClose', { static: false }) sendMoneyModel: ElementRef;
  @ViewChild('addMoneyClose', { static: false }) addMoneyModel: ElementRef;

  backToCart: boolean = false;

  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private util: UtilityService,
    private httpService: HttpService,
    private message: MessagingService,
    private scriptService: ScriptService,
    private route: ActivatedRoute,
    private router: Router,
    @Inject(WINDOW) private window: Window
  ) {
    this.currency = GlobalVariable.CURRENCY;
    this.pagination = new PaginationModel();
    this.pagination.perPage = 6;
    this.pagination.currentPage = 1;
    this.pagination.offset = 0;

    const stripeScript = new ScriptModel('stripe', 'https://js.stripe.com/v3/');

    this.scriptService.loadScript(stripeScript).then((script: ScriptModel) => {
      if (!script.isLoaded) {
        console.log('unable to load stripe script');
        // this.onError.emit('unable to load stripe script');
        return;
      }
    })
  }

  ngOnInit() {

    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
      });

    this.route.queryParams
      .subscribe(params => {
        if (params && params.from_cart == 1) {
          this.backToCart = true;
        }
      });

    this.settingSubscription = this.util.getSettings.subscribe((settings: AppSettings) => {
      if (!!settings) {
        this.settings = settings;
        if (!!settings.countryISO) {
          this.countryISO = (settings.countryISO).toLowerCase();
          this.preferredCountries = [(settings.countryISO).toLowerCase()];
        }
      }
    });

    this.userSubscription = this.userService.currentUser
      .subscribe(user => {
        if (!!user) {
          this.user = user;
        }
      });

    this.gatewaySubscription = this.util.getKeys.subscribe(({ paymentGateways }) => {
      if (paymentGateways && paymentGateways.length) {
        this.paymentGateways = paymentGateways.filter((gateway) => gateway.is_active == 1);
      }
    });

    this.createSendMoneyForm();
    this.createAddMoneyForm();
    this.fetchTransactions();
  }

  fetchTransactions(): void {
    this.isLoading = true;

    const query = {
      'skip': this.pagination.offset,
      'limit': this.pagination.perPage
    }

    this.httpService.getData(ApiUrl.getUserWalletTransactions, query).subscribe((response) => {
      this.transactions = response.data.transactions;
      this.pagination.count = response.data.count;
      this.walletAmount = response.data.userDetails.wallet_amount;
      this.isLoading = false;
    }, (err) => this.isLoading = false)

  }

  createSendMoneyForm(): void {
    this.sendMoneyForm = this.formBuilder.group({
      amount: [null, [Validators.required]],
      comment: ['']
    });

    if (this.sendMode == 'email') {
      this.sendMoneyForm.addControl('email', new FormControl('', [Validators.required, Validators.email]))
      this.sendMoneyForm.removeControl('phoneNumber')
    } else {
      this.sendMoneyForm.addControl('phoneNumber', new FormControl(null, [Validators.required]))
      this.sendMoneyForm.removeControl('email')
    }
  }

  createAddMoneyForm(): void {
    this.addMoneyForm = this.formBuilder.group({
      amount: [null, [Validators.required]],
      gateway: ['', [Validators.required]]
    });
  }

  get addMoney() { return this.addMoneyForm.controls; }

  get moneyForm() { return this.sendMoneyForm.controls; }


  modeChange($event): void {
    this.sendMode = $event.target.value;
    this.createSendMoneyForm();
  }

  onSendMoney(): void {
    if (this.sendMoneyForm.invalid) {
      this.submitted = true;
      setTimeout(() => {
        this.submitted = false;
      }, 100000)

      return;
    }

    const payload = {
      amount: this.sendMoneyForm.value.amount,
      comment: this.sendMoneyForm.value.comment
    }

    if (this.sendMode == 'phone') {
      payload['phone_number'] = this.sendMoneyForm.value.phoneNumber.number
      payload['countryCode'] = this.sendMoneyForm.value.phoneNumber.dialCode
    } else {
      payload['user_email'] = this.sendMoneyForm.value.email
    }

    this.isLoading = true;
    this.httpService.postData(ApiUrl.shareWalletMoney, payload).subscribe((response) => {
      if (response) {
        this.message.toast('info', 'Amount Send Successfully');
        this.closeModel();
        this.fetchTransactions();
      }
      this.isLoading = false;
    }, (err) => this.isLoading = false)
  }

  onAddMoney(): void {
    if (this.addMoneyForm.invalid) {
      this.submitted = true;
      setTimeout(() => {
        this.submitted = false;
      }, 100000)

      return;
    }

    this.selectedGateway = this.addMoneyForm.value.gateway.toLowerCase();

    this.paymentOrderModel = {
      amount: parseInt(this.addMoneyForm.value.amount),
      user: this.user,
      address: {}
    }
    this.isPayOnline = true;
    this.util.setLocalData('transactionType', 'wallet');
    this.closeModel();
  }

  onPaymentError(err) {
    this.message.toast('error', err);
    this.isPayOnline = false;
  }

  onPaymentSuccess(transaction) {
    this.isPayOnline = false;
    const payload: any = {
      user_id: this.user.id,
      amount: this.paymentOrderModel.amount,
      languageId: `${this.util.handler.languageId}`
    };

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
    this.util.setLocalData('gop', payload, true);
    if (transaction && transaction.waitForSuccess) {
      const a = document.createElement('a');
      a.href = transaction['paymentUrl'];
      a.click();
      return
    }

    this.httpService.postData(ApiUrl.addWalletMoney, payload).subscribe((response) => {
      if (response) {
        this.message.toast('info', this.translate.instant('Amount Added Successfully'));
        if(this.settings.show_wallet_on_home == 1) {
          this.util.walletRefresh.next(true);
        }
        if (this.backToCart) {
          this.router.navigate(['cart'], { queryParams: { p_mode: 4 } });
        } else {
          this.fetchTransactions();
        }
      }
      this.isLoading = false;
    }, (err) => this.isLoading = false)
  }


  pageChange(event) {
    this.pagination.currentPage = event;
    this.pagination.offset = event > 1 ? (event - 1) * this.pagination.perPage : 0;
    this.fetchTransactions();
    this.window.scrollTo(0, 0);
  }


  closeModel(): void {
    this.sendMoneyModel.nativeElement.click();
    this.addMoneyModel.nativeElement.click();
  }

  ngOnDestroy() {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.settingSubscription) this.settingSubscription.unsubscribe();
    if (!!this.gatewaySubscription) this.gatewaySubscription.unsubscribe();
    if (!!this.userSubscription) this.userSubscription.unsubscribe();
    this.closeModel()
  }
}
