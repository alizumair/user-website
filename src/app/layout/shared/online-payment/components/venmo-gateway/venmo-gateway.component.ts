import { Component, OnInit } from '@angular/core';
import { ScriptService } from '../../../../../services/script/script.service';
import { ScriptModel } from '../../../../../shared/models/script.model';
import { PaymentBaseComponent } from '../payment-base.component';
import { HttpService } from '../../../../../services/http/http.service';
import { ApiUrl } from '../../../../../core/apiUrl';

declare const braintree: any;

@Component({
  selector: 'app-venmo-gateway',
  templateUrl: './venmo-gateway.component.html',
  styleUrls: ['./venmo-gateway.component.scss']
})
export class VenmoGatewayComponent extends PaymentBaseComponent implements OnInit {

  constructor(
    private scriptService: ScriptService,
    private httpService: HttpService
  ) {
    super();
  }

  ngOnInit() {
    const scripts: ScriptModel[] = [
      new ScriptModel('client', 'https://js.braintreegateway.com/web/3.58.0/js/client.min.js'),
      new ScriptModel('venmo', 'https://js.braintreegateway.com/web/3.58.0/js/venmo.min.js'),
      new ScriptModel('data-collector', 'https://js.braintreegateway.com/web/3.58.0/js/data-collector.min.js')
    ];

    const promises = [];

    scripts.forEach((script) => {
      promises.push(this.scriptService.loadScript(script));
    })

    Promise.all(promises).then((result: ScriptModel[]) => {
      if (result.find(script => !script.isLoaded)) {
        this.onError.emit('unable to load venmo gateway script');
        return;
      } else {
        this.httpService.getData(ApiUrl.getBraintreeClientToken, {}).subscribe((response) => {
          if (response.status == 200) {
            this.init(response.data.client_token);
          }
        })
      }
    })

  }

  init(clientToken: string) {
    const { key, value } = this.gateway.key_value_front.find((item) => item.for_front == 1);

    var venmoButton = document.getElementById('venmo-button');

    // Create a client.
    braintree.client.create({
      authorization: clientToken
    }).then((clientInstance) => {
      // You may need to polyfill Promise
      // if used on older browsers that
      // do not natively support it.
      return Promise.all([
        braintree.dataCollector.create({
          client: clientInstance,
          paypal: true
        }),
        braintree.venmo.create({
          client: clientInstance,
          // Add allowNewBrowserTab: false if your checkout page does not support
          // relaunching in a new tab when returning from the Venmo app. This can
          // be omitted otherwise.
          allowNewBrowserTab: false
        })
      ]);
    }).then((results) => {
      var dataCollectorInstance = results[0];
      var venmoInstance = results[1];

      // At this point, you should access the deviceData value and provide it
      // to your server, e.g. by injecting it into your form as a hidden input.

      // Verify browser support before proceeding.
      if (!venmoInstance.isBrowserSupported()) {
        alert('Browser does not support Venmo');
        return;
      }

      displayVenmoButton(venmoInstance);

      // Check if tokenization results already exist. This occurs when your
      // checkout page is relaunched in a new tab. This step can be omitted
      // if allowNewBrowserTab is false.
      if (venmoInstance.hasTokenizationResult()) {
        venmoInstance.tokenize().then(handleVenmoSuccess).catch(handleVenmoError);
      }
    });

    function displayVenmoButton(venmoInstance) {
      // Assumes that venmoButton is initially display: none.
      venmoButton.style.display = 'block';

      venmoButton.addEventListener('click', function () {
        // venmoButton.disabled = true;

        venmoInstance.tokenize().then(handleVenmoSuccess).catch(handleVenmoError).then(function () {
          venmoButton.removeAttribute('disabled');
        });
      });
    }

    function handleVenmoError(err) {
      if (err.code === 'VENMO_CANCELED') {
        console.log('App is not available or user aborted payment flow');
      } else if (err.code === 'VENMO_APP_CANCELED') {
        console.log('User canceled payment flow');
      } else {
        console.error('An error occurred:', err.message);
      }
    }

    function handleVenmoSuccess(payload) {
      // Send the payment method nonce to your server, e.g. by injecting
      // it into your form as a hidden input.
      this.onSuccess.emit({
        'paymentGatewayId': 'venmo',
        'token': payload.nonce
      });
    }
  }

}
