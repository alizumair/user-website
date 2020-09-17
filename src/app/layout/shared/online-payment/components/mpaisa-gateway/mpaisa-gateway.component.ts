import { Component, OnInit } from '@angular/core';
import { GlobalVariable } from './../../../../../core/global';
import { PaymentBaseComponent } from './../payment-base.component';
import { ApiUrl } from './../../../../../core/apiUrl';
import { HttpService } from './../../../../../services/http/http.service';

@Component({
  selector: 'app-mpaisa-gateway',
  template: `<app-processing-indicator *ngIf="isLoading"></app-processing-indicator>`,
  styles: []
})
export class MpaisaGatewayComponent extends PaymentBaseComponent implements OnInit {

  isLoading: boolean = false;

  constructor(
    private http: HttpService
  ) {
    super();
  }

  ngOnInit() {
    this.isLoading = true;
    this.http.postData(ApiUrl.getmPaisaPaymentUrl, {
      amount: this.order.amount,
      items_details: 'order',
      checkout_url: `${window.location.origin}/success`,
      // failure_url: `${window.location.origin}/failure`
    }).subscribe((response) => {
      if (response && response.status == 200) {
        const data = response.data;
        this.onSuccess.emit({
          'paymentGatewayId': 'mpaisa',
          'token': 'xxxx',
          'waitForSuccess': true,
          'paymentUrl': `${data.destinationurl}?tID=${data.tID}&amt=${data.amt}&cID=${data.cID}&iDet=${data.iDet}&rID=${data.rID}&token=${data.token}&url=${data.url}`
        });
      }
      this.isLoading = false;
    }, (err) => {
      this.isLoading = false;
      this.onClose.emit(false)
    });
  }

}
