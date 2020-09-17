import { Component, OnInit, OnDestroy } from '@angular/core';
import { UtilityService } from '../../../../../services/utility/utility.service';
import { ScriptService } from '../../../../../services/script/script.service';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { ScriptModel } from '../../../../../shared/models/script.model';
import { PaymentBaseComponent } from '../payment-base.component';

declare const Frames: any;

@Component({
  selector: 'app-checkout-gateway',
  templateUrl: './checkout-gateway.component.html',
  styleUrls: ['./checkout-gateway.component.scss']
})
export class CheckoutGatewayComponent extends PaymentBaseComponent implements OnInit, OnDestroy {

  style: StyleVariables;
  showAddCard: boolean = false;
  disabled: boolean = false;

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

    const { key, value } = this.gateway.key_value_front.find((item) => item.for_front == 1);

    const checkoutScript = new ScriptModel('checkout', 'https://cdn.checkout.com/js/framesv2.min.js');

    this.scriptService.loadScript(checkoutScript).then((script: ScriptModel) => {
      if (!script.isLoaded) {
        console.log('unable to load stripe script');
        this.onError.emit('unable to load stripe script');
        return;
      }

      var payButton = document.getElementById("pay-button");
      var form = document.getElementById("payment-form");

      Frames.init({
        publicKey: value,
        style: {
          base: {
            color: "#515151"
          },
          invalid: {
            color: '#fa755a'
          }
        }
      });

      Frames.addEventHandler(
        Frames.Events.CARD_VALIDATION_CHANGED,
        (event) => {
          var errorElement = document.getElementById('card-errors');
          errorElement.textContent = Frames.isCardValid() ? '' : 'Your card details are invalid';
          this.disabled = !Frames.isCardValid();
        }
      );
      Frames.addEventHandler(
        Frames.Events.CARD_TOKENIZATION_FAILED,
        function (error) {
          // catch the error
          console.log(error, 'error');

        }
      );
      // Frames.addEventHandler(
      //   Frames.Events.CARD_TOKENIZED,
      //   function (event) {
      //     // var el = document.querySelector(".success-payment-message");
      //     // el.innerHTML = "Card tokenization completed<br>" +
      //     //   "Your card token is: <span class=\"token\">" + event.token + "</span>";
      //   }
      // );

      // form.addEventListener("submit", function (event) {
      //   event.preventDefault();
      //   console.log(event);
      //   console.log(Frames.isCardValid());

      //   Frames.submitCard();
      // });

    })
    // }
  }

  makeSubscription() {
    this.styleSubscription = this.utilService.getStyles.subscribe((style: StyleVariables) => {
      this.style = style;
    })
  }

  onSubmit() {
    this.disabled = true;
    Frames.submitCard()
      .then((data) => {
        console.log(data);
        this.onSuccess.emit({
          'paymentGatewayId': 'checkout',
          'token': data.token
        });
        // Frames.addCardToken(form, data.token);
      })
      .catch((error) => {
        // handle error
        console.log(error);
        this.disabled = false;
        var errorElement = document.getElementById('card-errors');
        errorElement.textContent = 'Your card details are invalid';
      });

  }

  ngOnDestroy(): void {
    if (this.styleSubscription) this.styleSubscription.unsubscribe();
  }

}


