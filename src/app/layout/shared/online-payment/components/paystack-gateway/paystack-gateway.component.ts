import { Component, OnInit } from '@angular/core';
import { ScriptService } from '../../../../../services/script/script.service';
import { ScriptModel } from '../../../../../shared/models/script.model';
import { PaymentBaseComponent } from '../payment-base.component';

declare const PaystackPop: any;

@Component({
  selector: 'app-paystack-gateway',
  templateUrl: './paystack-gateway.component.html',
  styleUrls: ['./paystack-gateway.component.scss']
})
export class PaystackGatewayComponent extends PaymentBaseComponent implements OnInit {

  constructor(
    private scriptService: ScriptService
  ) {
    super();
  }

  ngOnInit() {
    const paystackScript = new ScriptModel('paystack', 'https://js.paystack.co/v1/inline.js');
    this.scriptService.loadScript(paystackScript).then((script: ScriptModel) => {
      if (!script.isLoaded) {
        console.log('unable to load paystack script');
        this.onError.emit('unable to load paystack script');
        return;
      }
      this.initializeGateway();
    })
  }

  initializeGateway() {
    const { key, value } = this.gateway.key_value_front.find((item) => item.for_front == 1);
    var handler = PaystackPop.setup({
      key: value,
      email: this.order.user.email,
      amount: Math.round(this.order.amount * 100),
      currency: "NGN",
      callback: (response: any) => {
        if (response.status === 'success') {
          this.onSuccess.emit({
            'paymentGatewayId': 'paystack',
            'token': response['reference']
          });
        } else {
          this.onError.emit('Payment Failed');
        }
      },
      onClose: () => {
        this.onClose.emit(false);
      }
    });
    handler.openIframe();
  }
}
