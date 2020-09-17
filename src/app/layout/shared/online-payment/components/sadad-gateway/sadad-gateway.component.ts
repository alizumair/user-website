import { PaymentBaseComponent } from './../payment-base.component';
import { ApiUrl } from './../../../../../core/apiUrl';
import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { HttpService } from './../../../../../services/http/http.service';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-sadad-gateway',
  template: '',
})
export class SadadGatewayComponent extends PaymentBaseComponent implements OnInit {

  isLoading: boolean = false;

  constructor(
    private http: HttpService
  ) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.http.getData(ApiUrl.getSadadPaymentUrl, {
      email: this.order.user.email,
      name: this.order.user.firstname,
      amount: this.order.amount,
      // success_url: `${window.location.origin}/success`,
      // failure_url: `${window.location.origin}/failure`
    }).subscribe((response) => {
      if (response && response.status == 200) {
        this.onSuccess.emit({
          'paymentGatewayId': 'sadded',
          'token': response.data['transaction-reference'],
          'waitForSuccess': true,
          'paymentUrl': response.data['payment-url']
        });
      }
    }, (err) => this.onClose.emit(false));
  }

}
