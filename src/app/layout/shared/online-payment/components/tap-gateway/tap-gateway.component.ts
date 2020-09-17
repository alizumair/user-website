import { GlobalVariable } from './../../../../../core/global';
import { ApiUrl } from './../../../../../core/apiUrl';
import { PaymentBaseComponent } from './../payment-base.component';
import { Component, OnInit } from '@angular/core';

/*** */
import { HttpService } from './../../../../../services/http/http.service';


@Component({
  selector: 'app-tap-gateway',
  template: `<app-processing-indicator *ngIf="isLoading"></app-processing-indicator>`,
  styles: []
})
export class TapGatewayComponent extends PaymentBaseComponent implements OnInit {

  isLoading: boolean = false;

  constructor(
    private http: HttpService
  ) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.http.getData(ApiUrl.getTapPaymentUrl, {
      email: this.order.user.email,
      phone: this.order.user.mobile_no,
      name: this.order.user.firstname,
      amount: this.order.amount,
      currency: GlobalVariable.CURRENCY_NAME,
      country_code: GlobalVariable.COUNTRY,
      post_url: `${window.location.origin}/success`,
      redirect_url: `${window.location.origin}/success`
      // failure_url: `${window.location.origin}/failure`
    }).subscribe((response) => {
      if (response && response.status == 200) {
        this.onSuccess.emit({
          'paymentGatewayId': 'tap',
          'token': 'xxxx',
          'waitForSuccess': true,
          'paymentUrl': response.data['transaction']['url']
        });
      }
      this.isLoading = false;
    }, (err) => {
      this.isLoading = false;
      this.onClose.emit(false);
    });
  }

}
