import { ApiUrl } from '../../../../core/apiUrl';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';

import { GlobalVariable } from './../../../../core/global';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { HttpService } from './../../../../services/http/http.service';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { UserService } from '../../../../services/user/user.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-gift-card-list',
  templateUrl: './gift-card-list.component.html',
  styleUrls: ['./gift-card-list.component.scss']
})
export class GiftCardListComponent implements OnInit {

  isPayOnline: boolean = false;
  isLoading: boolean = false;
  loggedIn: boolean = false;
  seeMore: boolean = false;

  max: number = 2;

  giftList: Array<any> = [];
  transaction: any = {};
  paymentOrderModel: any = {};
  selectedGift: any = {};
  currency: string = '';

  style: StyleVariables;
  settings: AppSettings;

  settingsSubscription: Subscription;
  styleSubscription: Subscription;
  userSubscription: Subscription;

  constructor(
    private http: HttpService,
    private util: UtilityService,
    private message: MessagingService,
    private userService: UserService,
    private translate: TranslateService
  ) {
    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit() {
    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      });

    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        if (style) {
          this.style = style;
        }
      });

    this.userSubscription = this.userService.currentUser
      .subscribe(user => {
        if (!!user && user['access_token']) {
          this.paymentOrderModel.user = user;
          this.loggedIn = true;
        } else {
          this.loggedIn = false;
        }
      });

    this.getGiftCards();
  }

  getGiftCards() {
    this.isLoading = true;
    let params = {
      languageId: this.util.handler.languageId,
      zoneOffset: moment().format('Z')
    }
    this.http.getData(ApiUrl.giftCard.list, params)
      .subscribe(response => {
        if (!!response && response.data) {
          this.giftList = response.data.gift;
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  onBuyNow(gift: any) {
    if (!this.loggedIn) {
      this.message.alert('info', `${this.translate.instant('Please Login First')}!`);
      return;
    }
    this.selectedGift = gift;
    this.paymentOrderModel.amount = gift.amount;
    this.isPayOnline = true;
  }

  onPaymentError(error: string) {
    this.isPayOnline = false;
    this.message.toast('error', error);
  }

  onPaymentSuccess(transaction) {
    this.transaction = transaction;
    this.isPayOnline = false;
    this.makePayment();
  }

  makePayment() {
    this.isLoading = true;
    let form_data = {
      gift_id: `${this.selectedGift.id}`,
      gateway_unique_id: this.transaction.paymentGatewayId,
      customer_payment_id: this.paymentOrderModel.user.customer_payment_id,
      card_id: this.transaction.card_id,
      currency: GlobalVariable.CURRENCY_NAME,
      zone_offset: moment().format('Z'),
      languageId: this.util.handler.languageId,
      quantity: 1
    }

    this.http.postData(ApiUrl.giftCard.purchase, form_data)
      .subscribe(response => {
        if (!!response) {
          this.message.alert('success', this.translate.instant('Gift Card Successfully Purchased'));
        }
        this.isLoading = false;
      }), (err) => { this.isLoading = false };
  }

  ngOnDestroy() {
    this.settingsSubscription.unsubscribe();
    this.styleSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
  }

}
