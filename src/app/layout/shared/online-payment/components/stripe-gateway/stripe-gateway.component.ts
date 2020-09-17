import { Component, OnInit, OnDestroy } from '@angular/core';
import { UtilityService } from '../../../../../services/utility/utility.service';
import { ScriptService } from '../../../../../services/script/script.service';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { ScriptModel } from '../../../../../shared/models/script.model';
import { PaymentBaseComponent } from '../payment-base.component';

declare const Stripe: any;

@Component({
  selector: 'app-stripe-gateway',
  templateUrl: './stripe-gateway.component.html',
  styleUrls: ['./stripe-gateway.component.scss']
})
export class StripeGatewayComponent extends PaymentBaseComponent implements OnInit, OnDestroy {

  style: StyleVariables;
  showAddCard: boolean = false;

  private stripe: any;
  private card: any;

  styleSubscription: Subscription;

  constructor(
    private utilService: UtilityService,
    private scriptService: ScriptService
  ) {
    super();
    this.style = new StyleVariables();
  }

  ngOnInit() {
    this.makeSubscription();

    if (this.settings.card_gateway['stripe'] == 1) {
      this.showAddCard = true;
    } else {
      const { key, value } = this.gateway.key_value_front.find((item) => item.for_front == 1);

      const stripeScript = new ScriptModel('stripe', 'https://js.stripe.com/v3/');

      this.scriptService.loadScript(stripeScript).then((script: ScriptModel) => {
        if (!script.isLoaded) {
          this.onError.emit('unable to load stripe script');
          return;
        }

        this.stripe = Stripe(value);
        const elements = this.stripe.elements();

        var style = {
          base: {
            color: '#515151',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: '#ccc'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        };

        this.card = elements.create('card', { style: style });
        this.card.mount('#card-element');
      })
    }
  }

  makeSubscription() {
    this.styleSubscription = this.utilService.getStyles.subscribe((style: StyleVariables) => {
      this.style = style;
    })
  }

  onSubmit() {
    this.stripe.createToken(this.card).then((result) => {
      if (result.error) {
        var errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.message;
      } else {
        this.onSuccess.emit({
          'paymentGatewayId': 'stripe',
          'token': result.token.id
        });
      }
    });
  }

  onCardSelect($event) {
    this.onSuccess.emit($event);
  }

  ngOnDestroy(): void {
    if (this.styleSubscription) this.styleSubscription.unsubscribe();
  }

}

