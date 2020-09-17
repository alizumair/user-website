import { UtilityService } from './../../../../../services/utility/utility.service';
import { GlobalVariable } from './../../../../../core/global';
import { ApiUrl } from './../../../../../core/apiUrl';
import { HttpService } from './../../../../../services/http/http.service';
import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-order-payment',
  templateUrl: './order-payment.component.html',
  styleUrls: ['./order-payment.component.scss']
})
export class OrderPaymentComponent implements OnInit {

  @Input() order: any;
  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Output() paymentComplete: EventEmitter<any> = new EventEmitter<any>();

  service_charge: number = 0;
  transaction: any = {};
  isPayOnline: boolean = false;
  loading: boolean = false;
  currency: string = '';
  paymentType: number = 1;
  geofencedGateways: Array<string> = [];
  hidePaymentModeSelection: boolean = false;

  constructor(
    private message: MessagingService,
    private http: HttpService,
    private util: UtilityService,
    private translate: TranslateService
  ) {

    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit() {

    if(this.settings.is_tax_geofence == 1) {
      this.getGeofenceArea();
    }
  }

  orderPayment() {
    if ((this.paymentType == 1 && this.order.payment_type == 3) || this.order.payment_type == 1) {
      this.isPayOnline = true;
    } else {
      this.makePayment();
    }
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

  getGeofenceArea() {
    let params = {
      lat: this.order.to_latitude,
      long: this.order.to_longitude
    }
    this.http.getData(ApiUrl.orders.geofenceAreas, params)
      .subscribe(response => {
        if(!!response && response.data) {
          this.geofencedGateways = response.data.gateways; 
          if(this.geofencedGateways.length) {
            let cod_index = this.geofencedGateways.findIndex(el => el === 'cod');
            if(cod_index > -1) {
              this.geofencedGateways.splice(cod_index, 1);
              if(!this.geofencedGateways.length) {
                this.hidePaymentModeSelection = true;
                this.paymentType = 0;
              }
            } else {
              this.paymentType = 1;
              this.hidePaymentModeSelection = true;
            }
          }
        }
      });
  }

  makePayment() {
    this.loading = true;
    let form_data = {
      order_id: (this.order.order_id).toString(),
      currency: GlobalVariable.CURRENCY_NAME,
      card_id: '',
      payment_token: this.transaction.token,
      gateway_unique_id: this.transaction.paymentGatewayId,
      languageId: this.util.handler.languageId,
    }

    let api = '';
    if (this.order.remaining_amount) {
      api = ApiUrl.orders.payRmainingAmount;
    } else {
      form_data['payment_type'] = (this.order.payment_after_confirmation == 1 && this.order.payment_type == 3) ? this.paymentType : this.order.payment_type;
      api = ApiUrl.orders.orderPayment;
    }

    this.http.postData(api, form_data)
      .subscribe(response => {
        if (!!response) {
          this.message.toast('success', this.translate.instant('Payment Successfully'));
          this.paymentComplete.emit();
        }
        this.loading = false;
      }), err => { this.loading = false };
  }

}
