import { environment } from './../../../../../../environments/environment';
import { Component, OnInit } from '@angular/core';

import { PaymentBaseComponent } from './../payment-base.component';
import { HttpService } from './../../../../../services/http/http.service';
import { ApiUrl } from './../../../../../core/apiUrl';

@Component({
  selector: 'app-elavon-converge-gateway',
  template: `<app-processing-indicator *ngIf="isLoading"></app-processing-indicator>`,
  styles: []
})
export class ElavonConvergeGatewayComponent extends PaymentBaseComponent implements OnInit {

  isLoading: boolean = false;

  constructor(
    private http: HttpService
  ) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.http.postData(ApiUrl.getConvergePaymentToken, {
      amount: this.order.amount,
      // success_url: `${window.location.origin}/success`,
      // failure_url: `${window.location.origin}/failure`
    }).subscribe((response) => {
      if (response && response.status == 200) {
        this.onSuccess.emit({
          'paymentGatewayId': 'converge',
          'token': 'xxxx',
          'waitForSuccess': true,
          'paymentUrl': `${environment.CONVERGEPAY_API_URL}?ssl_txn_auth_token=${encodeURIComponent(response.data)}`
        });
      }
      this.isLoading = false;
    }, (err) => {
      this.isLoading = false;
      this.onClose.emit(false)
    });
  }
}
