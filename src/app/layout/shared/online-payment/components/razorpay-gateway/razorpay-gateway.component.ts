import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppSettings } from '../../../../../shared/models/appSettings.model';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { UtilityService } from '../../../../../services/utility/utility.service';
import { ScriptService } from '../../../../../services/script/script.service';
import { ScriptModel } from '../../../../../shared/models/script.model';
import { PaymentBaseComponent } from '../payment-base.component';

declare const Razorpay: any;

@Component({
  selector: 'app-razorpay-gateway',
  templateUrl: './razorpay-gateway.component.html',
  styleUrls: ['./razorpay-gateway.component.scss']
})
export class RazorpayGatewayComponent extends PaymentBaseComponent implements OnInit, OnDestroy {

  razorpay: any;
  settings: AppSettings;
  style: StyleVariables;

  styleSubscription: Subscription;
  settingSubscription: Subscription;

  constructor(
    private util: UtilityService,
    private scriptService: ScriptService
  ) {
    super();
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles
      .subscribe(style => {
        this.style = style;
      });

    this.settingSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        this.settings = settings;
      })

    const { key, value } = this.gateway.key_value_front.find((item) => item.for_front == 1);

    const options = {
      key: value,
      amount: Math.round(this.order.amount) * 100,
      currency: "INR",
      method: 'card',
      image: this.settings.site_logo,
      handler: (response) => {
        let self = this;
        self.onSuccess.emit({
          'paymentGatewayId': 'razorpay',
          'token': response['razorpay_payment_id']
        });
      },
      modal: {
        ondismiss: () => {
          let self = this;
          self.onClose.emit(false);
        }
      },

      prefill: {
        name: this.order.user.firstname,
        email: this.order.user.email,
        contact: this.order.user.mobile_no
      },
      theme: {
        color: this.style.primaryColor
      }
    };

    const razorPayScript = new ScriptModel('razorpay', 'https://checkout.razorpay.com/v1/checkout.js');

    this.scriptService.loadScript(razorPayScript).then((script: ScriptModel) => {
      if (!script.isLoaded) {
        console.log('unable to load razorpay script');
        this.onError.emit('unable to load razorpay script');
        return;
      }
      this.razorpay = new Razorpay(options);
      this.razorpay.open();
    })
  }

  ngOnDestroy(): void {
    if (this.styleSubscription) this.styleSubscription.unsubscribe();
    if (this.settingSubscription) this.settingSubscription.unsubscribe();
  }

}


