import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { ScriptModel } from './../../../../../shared/models/script.model';
import { ScriptService } from './../../../../../services/script/script.service';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { PaymentBaseComponent } from './../payment-base.component';
import { Subscription } from 'rxjs';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Component, OnInit, OnDestroy } from '@angular/core';

declare const SqPaymentForm: any;

@Component({
  selector: 'app-square-gateway',
  templateUrl: './square-gateway.component.html',
  styleUrls: ['./square-gateway.component.scss']
})
export class SquareGatewayComponent extends PaymentBaseComponent implements OnInit, OnDestroy {

  settings: AppSettings;
  style: StyleVariables;

  styleSubscription: Subscription;
  settingSubscription: Subscription;

  paymentForm: any;
  is_loaded: boolean = false;
  showAddCard: boolean = false;

  constructor(
    private util: UtilityService,
    private scriptService: ScriptService,
    private message: MessagingService
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
      });

    if (this.settings.card_gateway['squareup'] == 1) {
      this.showAddCard = true;
    } else {
      const { key, value } = this.gateway.key_value_front.find((item) => item.for_front == 1);
      if (value) {
        this.init(value);
      }
    }
  }

  init(app_id: string | number) {
    const squarePayScript = new ScriptModel('square', 'https://js.squareupsandbox.com/v2/paymentform');

    this.scriptService.loadScript(squarePayScript).then((script: ScriptModel) => {

      if (!script.isLoaded) {
        console.log('unable to load stripe script');
        this.onError.emit('unable to load stripe script');
        return;
      }

      const self = this;

      this.paymentForm = new SqPaymentForm({
        applicationId: app_id,
        inputClass: 'sq-input',
        autoBuild: false,
        inputStyles: [{
          fontSize: '16px',
          lineHeight: '24px',
          padding: '16px',
          placeholderColor: '#a0a0a0',
          backgroundColor: 'transparent'
        }],
        cardNumber: {
          elementId: 'sq-card-number',
          placeholder: 'Card Number'
        },
        cvv: {
          elementId: 'sq-cvv',
          placeholder: 'CVV'
        },
        expirationDate: {
          elementId: 'sq-expiration-date',
          placeholder: 'MM/YY'
        },
        postalCode: {
          elementId: 'sq-postal-code',
          placeholder: 'Postal'
        },
        callbacks: {
          cardNonceResponseReceived: function (errors, nonce, cardData) {
            if (errors) {
              self.message.alert('error', errors[0].message);
              return;
            } 
            if(nonce) {
              self.onSuccess.emit({
                'paymentGatewayId': 'squareup',
                'token': nonce
              });
            }
          }
        }
      });

      this.paymentForm.build();
      this.is_loaded = true;
    });
  }

  onGetCardNonce(event) {
    event.preventDefault();
    this.paymentForm.requestCardNonce();
  }

  ngOnDestroy(): void {
    if (this.styleSubscription) this.styleSubscription.unsubscribe();
    if (this.settingSubscription) this.settingSubscription.unsubscribe();
  }

}
