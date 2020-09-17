import { GlobalVariable } from './../../../../../core/global';

import { Component, OnInit } from '@angular/core';
import { ApiUrl } from './../../../../../core/apiUrl';
import { HttpService } from './../../../../../services/http/http.service';
import { PaymentBaseComponent } from './../payment-base.component';

@Component({
  selector: 'app-windcave-gateway',
  template: `<p></p>`
})
export class WindcaveGatewayComponent extends PaymentBaseComponent implements OnInit {

  isLoading: boolean = false;

  constructor(
    private http: HttpService
  ) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.http.postData(ApiUrl.getWindcavePaymentUrl, {
      email: this.order.user.email,
      // phone: this.order.user.mobile_no,
      // name: this.order.user.firstname,
      amount: (this.order.amount).toFixed(2),
      currency: GlobalVariable.CURRENCY_NAME,
      // country_code: GlobalVariable.COUNTRY,
      success_url: `${window.location.origin}/success`,
      failure_url: `${window.location.origin}/failure`
    }).subscribe((response) => {
      if (response && response.status == 200) {
        this.onSuccess.emit({
          'paymentGatewayId': 'windcave',
          'token': 'xxxx',
          'waitForSuccess': true,
          'paymentUrl': response.data['Request']['URI']
        });
      }
    }, (err) => this.onClose.emit(false));
  }


}
