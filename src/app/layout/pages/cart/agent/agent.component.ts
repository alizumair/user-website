import { SeoService } from './../../../../services/seo/seo.service';
import { GlobalVariable } from './../../../../core/global';
import { CartService } from './../../../../services/cart/cart.service';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { UserService } from './../../../../services/user/user.service';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiUrl } from './../../../../core/apiUrl';
import { HttpService } from './../../../../services/http/http.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'underscore'
import { Slots } from './../../../../shared/models/slots.model';
import { LocalizationPipe } from '../../../../shared/pipes/localization.pipe';
import { QuestionsModel } from './../../../../shared/models/questions.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss']
})
export class AgentComponent implements OnInit, OnDestroy {

  dataSubscription: Subscription;
  routeSubscription: Subscription;
  styleSubscription: Subscription;
  settingSubscription: Subscription;
  cartSubscription: Subscription;
  style: StyleVariables;
  params: any = {};
  agents: Array<any> = [];
  headers: Array<any> = [];
  datesArr: Array<any> = [];
  cart: Array<any> = [];
  dateCount: number = 5;
  slotData: Slots;
  selectedSlot: string = '';
  selectedDate: string = '';
  hover: any = {
    index: -1,
    tab: null
  }
  slotTime: string = '';
  a_id: number = -1;
  noData: boolean = false;
  noAgent: boolean = false;
  is_service: boolean = false;
  settings: AppSettings;
  duration: number = 0;
  date_time: any = '';
  cartDateTimeData: any = { is_open: false, data: {} };
  questions: Array<QuestionsModel> = [];

  isLoading: boolean = false;

  constructor(
    private util: UtilityService,
    private http: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private message: MessagingService,
    private user: UserService,
    private cartService: CartService,
    private localization: LocalizationPipe,
    private seo: SeoService,
    private translate: TranslateService) {

    this.slotData = new Slots();
  }

  ngOnInit() {
    this.seo.updateTitle(`${this.localization.transform('agent')} | ${GlobalVariable.SITE_NAME}`);

    this.styleSubscription = this.util.getStyles
      .subscribe(style => {
        this.style = style;
      });

    this.cartSubscription = this.util.getCart
      .subscribe(cart => {
        this.cart = cart && cart.length ? cart : [this.util.getLocalData('selected_service', true)];
        this.is_service = this.cart.some(product => {
          return product['is_product'] == 0;
        });

        this.routeSubscription = this.route.queryParams
          .subscribe(params => {
            if (params) {
              this.params = params;
              this.date_time = params.date_time ? moment.unix(params.date_time).format('YYYY-MM-DD HH:mm:ss') : '';
              this.cartDateTimeData.is_open = false;
              this.makeSubscribe();
            }
          });
      });
  }

  /********* Wait till true is returned **********/
  makeSubscribe() {
    this.dataSubscription = this.util.callGetData
      .subscribe((showData: boolean) => {
        if (showData) {
          this.settingSubscription = this.util.getSettings
            .subscribe((settings: AppSettings) => {
              this.settings = settings;
              if (this.util.getLocalData('ques_data', true) && settings.app_type == 8) {
                this.questions = this.util.getLocalData('ques_data', true);
              }
              this.getDuration();
            });
          if (!this.headers || !this.headers.length) {
            this.getAgentKeys();
          } else {
            this.getAgents();
          }
        }
      });
  }

  getDuration() {
    if (this.is_service) {
      this.duration = 0;
      this.cart.forEach(data => {
        if (data['price_type']) {
          this.duration += (this.settings.interval * data['selectedQuantity']);
        } else {
          this.duration += (data['duration'] * data['selectedQuantity']);
        }
      });
    }
  }

  getAgentKeys() {
    this.isLoading = true;
    this.http.postData(ApiUrl.agent.getAgentKeys, {})
      .subscribe(response => {
        if (!!response && response.data) {
          this.headers = response.data;
          this.getAgents();
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  getAgents() {
    let form_data = {
      serviceIds: this.params['service_ids'].split(','),
      duration: this.duration
    }

    if (this.date_time) {
      form_data['datetime'] = this.date_time;
    }

    this.noAgent = false;
    this.isLoading = true;
    this.http.postAgentData(ApiUrl.agent.getAgents, form_data, this.headers)
      .subscribe(response => {
        if (!!response && response.data) {
          this.agents = response.data;
        }
        this.noAgent = true;
        this.isLoading = false
      }, (err) => this.isLoading = false);
  }

  getAvailability(agent) {
    if (this.a_id === agent.cbl_user.id) {
      this.a_id = -1;
      return;
    }
    else {
      this.a_id = agent.cbl_user.id;
      this.selectedSlot = '';
      this.slotTime = '';
    }
    this.isLoading = true;
    this.http.getAgentData(ApiUrl.agent.availability, { id: agent.cbl_user.id }, this.headers)
      .subscribe(response => {
        if (!!response && response.data) {
          let datesArr: Array<any> = response.data[0].cbl_user_avail_dates;
          this.datesArr = [];
          this.dateCount = 5;
          if (datesArr.length) {
            datesArr.forEach(el => {
              this.datesArr.push(el['from_date']);
            });
            let repeatingDaysCheck: boolean = response.data[0].cbl_user_availablities.some(day => {
              return day.status === 1;
            });
            if (repeatingDaysCheck) {
              this.daysSlots(response.data[0], agent);
            } else {
              this.getSlots(this.datesArr[0], agent);
            }
          } else {
            this.daysSlots(response.data[0], agent);
          }
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  daysSlots(data, agent) {
    let avalability: Array<any> = data.cbl_user_availablities;
    avalability.forEach(day => {
      if (day.status) {
        if (moment().day() <= day.day_id) {
          this.repeatingDates(moment().isoWeekday(day.day_id));
        } else {
          this.repeatingDates(moment().add(1, 'weeks').isoWeekday(day.day_id))
        }
      }
    });
    let datesArr: Array<any> = _.uniq(this.datesArr.slice());
    this.datesArr = _.sortBy(datesArr, (o) => { return o; });
    this.datesArr = this.datesArr.slice().filter(date => {
      return moment(date).format('YYYY-MM-DD') >= moment().format('YYYY-MM-DD');
    })
    this.getSlots(this.datesArr[0], agent);
  }

  repeatingDates(first) {
    let i = 0
    while (i < 4) {
      this.datesArr.push(moment(first).add(7 * i, 'd').format('YYYY-MM-DD'));
      i++;
    }
  }

  getSlots(date, agent) {
    this.selectedDate = date;
    let params = {
      date: date,
      id: agent.cbl_user.id,
      offset: moment().format('Z')
    }

    this.noData = false;
    this.isLoading = true;
    this.http.getAgentData(ApiUrl.agent.getSlots, params, this.headers, true)
      .subscribe(response => {
        if (!!response && response.data) {
          let slots: Array<any> = response.data;
          const selectedDate = this.date_time || date ? moment(this.date_time || date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
          if (selectedDate == moment().format('YYYY-MM-DD')) {
            slots = _.filter(slots, (slot: any) => moment(selectedDate + ' ' + slot).isAfter(moment(), 'minutes'));
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
        }
        this.noData = true;
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  getHours(time): number {
    return moment.duration(time).asHours();
  }

  timeFormat(time): string {
    return moment(time, ["HH:mm:ss"]).format('h:mm A')
  }

  selectSlot(slot) {
    this.slotTime = slot;
    this.selectedSlot = this.selectedDate + ' ' + moment(slot, ["h:mm A"]).format('HH:mm:ss');
  }

  getDates(): any[] {
    return this.datesArr.slice(this.dateCount - 5, this.dateCount);
  }

  increment() {
    this.dateCount += 5;
    this.getDates();
  }

  decrement() {
    this.dateCount -= 5;
    this.getDates();
  }

  checkSlot(selectedAgent: any) {

    if ((!this.selectedSlot || !this.slotTime) && !this.date_time) {
      this.message.toast('warning', this.translate.instant('Please Select Agent Slot'));
      return;
    }

    const payload: any = {
      id: selectedAgent.cbl_user.id,
      duration: this.duration,
      offset: moment().format('Z'),
      datetime: this.selectedSlot || this.date_time
    }

    this.isLoading = true;

    this.http.getAgentData(ApiUrl.agent.checkAgentSlot, payload, this.headers).subscribe((response: any) => {
      if (response && response.statusCode == 200) {
        this.addToCart(selectedAgent);
      }
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
    })
  }

  addToCart(selectedAgent: any) {
    if ((!this.selectedSlot || !this.slotTime) && !this.date_time) {
      this.message.toast('warning', this.translate.instant('Please Select Agent Slot'));
      return;
    }
    const agentSlot: any = {
      date_time: this.selectedSlot || this.date_time,
      agent: selectedAgent,
      isPackage: this.params.isPkg
    }

    const service = this.util.getLocalData('selected_service', true);
    if(!!service) {
      service['agent_slot'] = agentSlot;
    }

    this.cartService.addToCart(service, [], true);
    this.util.setLocalData('selected_service', null);
    return;
  }

  // generateOrder(selectedAgent) {
  // let obj = {
  //   cartId: this.params.cart_id,
  //   languageId: this.util.handler.languageId,
  //   isPackage: this.params.isPkg,
  //   paymentType: this.params.payType,
  //   accessToken: this.user.getUserToken,
  //   offset: moment().format('Z'),
  //   agentIds: [selectedAgent.cbl_user.id],
  //   // date_time: this.selectedSlot
  //   date_time: this.date_time,
  //   duration: this.duration,
  //   type: this.settings.app_type
  // }

  // if (this.params.promo) {
  //   obj['promoCode'] = this.params.promo;
  //   obj['discountAmount'] = this.params.discount;
  //   obj['promoId'] = this.params.promoId;
  // }

  // if (this.params.paymentGatewayId) {
  //   obj['gateway_unique_id'] = this.params.paymentGatewayId;
  //   obj['payment_token'] = this.params.token;
  // }

  // if (this.settings.extra_instructions == 1) {
  //   obj['parking_instructions'] = this.params.parking_instructions;
  //   obj['area_to_focus'] = this.params.area_to_focus;
  // }

  // obj['duration'] = 0;
  // if (this.is_service) {
  //   obj['duration'] = 0;
  //   this.cart.forEach(data => {
  //     if (data['price_type']) {
  //       obj['duration'] += (this.settings.interval * data['selectedQuantity']);
  //     } else {
  //       obj['duration'] += (data['duration'] * data['selectedQuantity']);
  //     }
  //   });
  // }

  // if (this.settings.app_type == 8 && this.questions.length) {
  //   obj['questions'] = this.questions.slice();
  // }

  // this.isLoading = true;
  // this.http.postData(ApiUrl.generateOrder, obj, false)
  //   .subscribe(response => {
  //     if (!!response && response.data) {
  //       this.router.navigate(['/orders/order-detail'], { queryParams: { orderId: response.data } });
  //       this.util.setCart([]);
  //       setTimeout(() => {
  //         this.message.alert('success', `${this.localization.transform('order')} Placed Successfully!`);
  //       }, 500);
  //       this.util.clearLocalData('cart_id');
  //       this.util.clearLocalData('pickUp_DT');
  //     }
  //     this.isLoading = false;
  //   }, (err) => this.isLoading = false);
  // }

  selectDate() {
    this.cartDateTimeData = {
      is_open: true,
      data: this.params
    }
  }

  onBack() {
    const url = this.util.getRedirectUrl();
    if (url && url == '/') {
      this.router.navigate(['/', 'cart']);
    } else {
      this.router.navigateByUrl(url);
    }
  }

  ngOnDestroy() {
    this.styleSubscription.unsubscribe();
    this.dataSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
    this.settingSubscription.unsubscribe();
    this.cartSubscription.unsubscribe();
  }
}
