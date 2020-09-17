import { ApiUrl } from './../../../../../core/apiUrl';
import { LocalizationPipe } from './../../../../../shared/pipes/localization.pipe';
import { UserService } from './../../../../../services/user/user.service';
import { HttpService } from './../../../../../services/http/http.service';
import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { Slots } from './../../../../../shared/models/slots.model';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy, Input, SimpleChange, SimpleChanges, OnChanges, EventEmitter, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import * as _ from 'underscore'
import { TranslateService } from '@ngx-translate/core';
declare const $;

@Component({
  selector: 'app-cart-date-time',
  templateUrl: './cart-date-time.component.html',
  styleUrls: ['./cart-date-time.component.scss']
})
export class CartDateTimeComponent implements OnInit, OnChanges, OnDestroy {

  @Input() dateTimeData: any;
  @Output() payNow: EventEmitter<any> = new EventEmitter<any>(null);

  styleSubscription: Subscription;
  settingsSubscription: Subscription;
  style: StyleVariables;
  timeInterval: number = 0;
  time: any;
  date: any = new Date();
  min: any = new Date();
  data: any = {};
  cart: Array<any> = [];
  settings: AppSettings;
  addressDetail: any = {};
  priceObj: any = {};
  headers: Array<any> = [];
  is_slot_selection: boolean = false;
  slotData: Slots;
  hover: any = {
    index: -1,
    tab: null
  };
  slotTime: string = '';
  noData: boolean = false;
  isLoading: boolean = false;

  constructor(
    private util: UtilityService,
    private router: Router,
    private message: MessagingService,
    private http: HttpService,
    private user: UserService,
    private localization: LocalizationPipe,
    private translate: TranslateService) {

    this.slotData = new Slots();
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles
      .subscribe(styles => {
        this.style = styles;
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
          this.timeInterval = settings['interval'];
        }
      });

    this.getAgentKeys();
  }

  ngOnChanges(changes: SimpleChanges) {
    const dateTimeData: SimpleChange = changes.dateTimeData;
    if (dateTimeData.currentValue.is_open) {
      this.cart = dateTimeData.currentValue.cart ? dateTimeData.currentValue.cart : [];
      $("#cartDateModal").modal('show');
      this.data = dateTimeData.currentValue.data;
      this.addressDetail = dateTimeData.currentValue.addressDetail;
      this.priceObj = dateTimeData.currentValue.priceObj;
      if (this.data['date_time']) {
        let date = moment.unix(this.data['date_time']);
        this.date = new Date(date.format('YYYY-MM-DD'));
        // this.time = new Date(date.format('HH:mm:ss'));
      }
    }
  }

  getAgentKeys() {
    this.isLoading = true;
    this.http.postData(ApiUrl.agent.getAgentKeys, {})
      .subscribe(response => {
        if (!!response && response.data) {
          this.headers = response.data;
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  getSlots() {
    let params = {
      date: moment(this.date).format('YYYY-MM-DD'),
      offset: moment().format('Z'),
    }
    this.noData = false;
    this.isLoading = true;
    this.http.getAgentData(ApiUrl.agent.getAllSlots, params, this.headers)
      .subscribe(response => {
        if (!!response && response.data) {
          let slots: Array<any> = response.data;
          if (moment(this.date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
            slots = _.filter(slots, (slot: any) => moment(moment(this.date).format('YYYY-MM-DD') + ' ' + slot).isAfter(moment(), 'minutes'));
          }
          slots = _.sortBy(slots, (o) => { return o; });
          if (slots.length) {
            this.slotData = new Slots();
            slots.forEach(time => {
              switch (true) {
                case this.getHours(time) >= 0 && this.getHours(time) < 12:
                  this.slotData.Morning.push(this.timeFormat(time));
                  break;
                case this.getHours(time) >= 12 && this.getHours(time) < 16:
                  this.slotData.Afternoon.push(this.timeFormat(time));
                  break;
                case this.getHours(time) >= 16 && this.getHours(time) < 21:
                  this.slotData.Evening.push(this.timeFormat(time));
                  break;
                case this.getHours(time) >= 21 && this.getHours(time) < 24:
                  this.slotData.Night.push(this.timeFormat(time));
                  break;
              }
            });
          } else {
            this.slotData = new Slots();
          }
          this.noData = true;
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  getHours(time): number {
    return moment.duration(time).asHours();
  }

  timeFormat(time): string {
    return moment(time, ["HH:mm:ss"]).format('h:mm A');
  }

  selectSlot(slot) {
    this.slotTime = slot;
    this.time = moment(slot, ["h:mm A"]).format('HH:mm:ss');
  }

  submit() {
    if (this.cart.length) {
      let agent_list = this.cart.some(product => {
        return product['agent_list'] == 1;
      });
      if (agent_list && this.settings.hideAgentList == 0) {
        this.toAgentList();
      } else {
        if (this.dateTimeData.isOnlinePayment) {
          this.payNow.emit({ date_time: moment(this.date).format('YYYY-MM-DD') + ' ' + this.time });
          $("#cartDateModal").modal('hide');
        } else {
          this.generateOrder();
        }
      }
    } else {
      this.toAgentList();
    }
  }

  toAgentList() {
    let date;
    // if (this.settings.service_booking_flow != 1) {
    //   if (!this.date || !this.time || this.time == 'Invalid Date') {
    //     this.message.toast('info', 'Please select slot');
    //     return;
    //   }
    //   date = moment(this.date).format('YYYY-MM-DD') + ' ' + this.time;
    // } else {
    if (!this.date) {
      this.message.toast('info', 'Please select slot');
      return;
    }
    date = moment(this.date).format('YYYY-MM-DD') + ' ' + this.time;
    // }

    let params = {};
    Object.assign(params, this.data);
    params['date_time'] = moment(date).unix();
    this.router.navigate(['/cart/agent'], {
      queryParams: params
    });
  }

  generateOrder() {
    let offset = moment().format('Z');
    let obj = {
      cartId: this.data.cart_id,
      languageId: this.util.handler.languageId,
      isPackage: '0',
      paymentType: this.data.payType,
      accessToken: this.user.getUserToken,
      offset: offset,
      date_time: moment(this.date).format('YYYY-MM-DD') + ' ' + this.time,
      type: this.settings.app_type
    }

    if (this.data.promo) {
      obj['promoCode'] = this.data.promo;
      obj['discountAmount'] = this.priceObj.discountAmount;
      obj['promoId'] = this.data.promoId;
    }

    if (this.data.paymentGatewayId) {
      obj['gateway_unique_id'] = this.data.paymentGatewayId;
      obj['payment_token'] = this.data.token;
    }

    if (this.settings.extra_instructions == 1) {
      obj['parking_instructions'] = this.data.parking_instruction;
      obj['area_to_focus'] = this.data.area_to_focus;
    }

    obj['duration'] = 0;
    this.cart.forEach(data => {
      if (data['price_type']) {
        obj['duration'] += (this.settings.interval * data['selectedQuantity']);
      } else {
        obj['duration'] += (data['duration'] * data['selectedQuantity']);
      }
    });

    this.isLoading = true;

    this.http.postData(ApiUrl.generateOrder, obj, false)
      .subscribe(response => {
        if (!!response && response.data) {
          this.router.navigate(['/orders/order-detail'], { queryParams: { orderId: response.data } });
          this.util.setCart([]);
          setTimeout(() => {
            this.message.alert('success', this.localization.transform('order') + `${this.translate.instant('Placed Successfully')}!`);
          }, 800);
          this.util.clearLocalData('cart_id');
          this.util.clearLocalData('ques_data');
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }


  ngOnDestroy() {
    $("#cartDateModal").modal('hide');
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
  }

}
