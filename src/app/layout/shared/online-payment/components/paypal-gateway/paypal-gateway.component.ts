import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../../../services/http/http.service';
import { ApiUrl } from '../../../../../core/apiUrl';
import { PaymentBaseComponent } from '../payment-base.component';
import { GlobalVariable } from './../../../../../core/global';

declare const paypal: any;

@Component({
  selector: 'app-paypal-gateway',
  templateUrl: './paypal-gateway.component.html',
  styles: []
})
export class PaypalGatewayComponent extends PaymentBaseComponent implements OnInit {

  constructor(
    private httpService: HttpService
  ) {
    super();
  }

  ngOnInit(): void {
    const { key, value } = this.gateway.key_value_front.find((item) => item.for_front == 1);

    var PAYPAL_SCRIPT = `https://www.paypal.com/sdk/js?client-id=${value}`;
    var script = document.createElement('script');
    script.setAttribute('src', PAYPAL_SCRIPT);
    document.head.appendChild(script);
    script.onload = () => {
      paypal.Buttons({
        createOrder: () => {
          return new Promise((resolve, reject) => {
            this.httpService.getData(ApiUrl.paypalCreateOrder, { 'net_amount': this.order.amount, 'currency': GlobalVariable.CURRENCY })
              .subscribe((res) => {
                return resolve(res.data.id);
              });
          })
        },

        onApprove: (data) => {
          this.onSuccess.emit({
            'paymentGatewayId': 'paypal',
            'token': data['orderID']
          })
          return Promise.resolve();
        }
      }).render('#paypal-button');
    };
  }
}
