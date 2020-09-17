import { Component, OnInit } from '@angular/core';

import { HttpService } from './../../../../../services/http/http.service';
import { GlobalVariable } from './../../../../../core/global';
import { PaymentBaseComponent } from './../payment-base.component';

import { ScriptService } from './../../../../../services/script/script.service';
import { ScriptModel } from './../../../../../shared/models/script.model';
import { environment } from './../../../../../../environments/environment';
import { ApiUrl } from './../../../../../core/apiUrl';

declare const payhere: any;


@Component({
  selector: 'app-payhere-gateway',
  template: `<app-processing-indicator *ngIf="isProcessing"></app-processing-indicator>`,
  styles: []
})
export class PayhereGatewayComponent extends PaymentBaseComponent implements OnInit {

  isProcessing: boolean = false;

  constructor(
    private scriptService: ScriptService,
    private httpService: HttpService
  ) {
    super()
  }

  ngOnInit() {
    const payhereScript = new ScriptModel('payhere', 'https://www.payhere.lk/lib/payhere.js');
    this.scriptService.loadScript(payhereScript).then((script: ScriptModel) => {
      if (!script.isLoaded) {
        console.log('unable to load payhere script');
        this.onError.emit('unable to load payhere script');
        return;
      }
      this.initializeGateway();
    })
  }

  initializeGateway() {
    const { key, value } = this.gateway.key_value_front.find((item) => item.for_front == 1);
    const self = this;

    payhere.onCompleted = function onCompleted(orderId) {
      console.log("Payment completed. OrderID:" + orderId);
      self.checkPaymentStatus(orderId);
    };

    payhere.onDismissed = function onDismissed() {
      console.log("Payment dismissed");
      self.onError.emit('Payment dismissed');
    };

    payhere.onError = function onError(error) {
      console.log("Error:" + error);
      self.onError.emit(error);
    };

    var payment = {
      "sandbox": true,
      "merchant_id": value,       // Replace your Merchant ID
      "return_url": "",
      "cancel_url": "",
      "notify_url": `${environment.BASE_API_URL}/payhere_notify_url?secretdbkey=${GlobalVariable.SECRET_DB_KEY}`,
      "order_id": (new Date()).getTime(),
      "items": "order",
      "amount": this.order.amount,
      "currency": `${GlobalVariable.CURRENCY_NAME}`,
      "first_name": this.order.user.firstname,
      "last_name": this.order.user.firstname,
      "email": this.order.user.email,
      "phone": this.order.user.mobile_no,
      "address": this.order.address.address_line_1,
      "city": this.order.address.customer_address,
      "country": `${GlobalVariable.COUNTRY}`,
      "delivery_address": this.order.address.address_line_1,
      "delivery_city": this.order.address.customer_address,
      "delivery_country": `${GlobalVariable.COUNTRY}`,
      "custom_1": "",
      "custom_2": ""
    };

    console.log('notify url:', payment.notify_url);

    payhere.startPayment(payment);
  }

  checkPaymentStatus(orderId: number) {
    this.isProcessing = true;
    this.httpService.postData(ApiUrl.checkPayherePaymentStatus, { order_id: orderId }).subscribe((response) => {
      this.isProcessing = false;
      if (response && response.data && response.data.payment_id) {
        this.onSuccess.emit({
          'paymentGatewayId': 'payhere',
          'token': response.data['payment_id']
        })
      } else {
        this.onError.emit('unable to make payment');
      }
    }, (err) => {
      this.isProcessing = false;
      this.onError.emit(err);
    })
  }

}
