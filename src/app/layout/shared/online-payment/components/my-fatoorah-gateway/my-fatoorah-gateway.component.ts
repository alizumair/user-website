import { GlobalVariable } from './../../../../../core/global';
import { ApiUrl } from './../../../../../core/apiUrl';
import { HttpService } from './../../../../../services/http/http.service';
import { PaymentBaseComponent } from './../payment-base.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-fatoorah-gateway',
  template: '<app-processing-indicator *ngIf="isLoading"></app-processing-indicator>'
})
export class MyFatoorahGatewayComponent extends PaymentBaseComponent implements OnInit {

  isLoading: boolean = false;

  constructor(
    private http: HttpService
  ) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.http.postData(ApiUrl.getMyFatoorahPaymentUrl, {
      currency: GlobalVariable.CURRENCY_NAME,
      amount: this.order.amount,
      success_url: `${window.location.origin}/success`,
      failure_url: `${window.location.origin}/failure`
    }).subscribe((response) => {
      if (response && response.status == 200) {
        this.onSuccess.emit({
          'paymentGatewayId': 'myfatoorah',
          'token': 'xxxx',
          'waitForSuccess': true,
          'paymentUrl': response.data['PaymentURL']
        });
      }
      this.isLoading = false;
    }, (err) => {
      this.isLoading = false;
      this.onClose.emit(false);
    });
  }


}
