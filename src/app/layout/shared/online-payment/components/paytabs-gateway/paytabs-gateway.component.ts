import { GlobalVariable } from './../../../../../core/global';
import { WINDOW } from './../../../../../services/window/window.service';
import { DOCUMENT } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { UtilityService } from '../../../../../services/utility/utility.service';
import { ScriptService } from '../../../../../services/script/script.service';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { ScriptModel } from '../../../../../shared/models/script.model';
import { PaymentBaseComponent } from '../payment-base.component';

declare var Paytabs: any;

@Component({
  selector: 'app-paytabs-gateway',
  templateUrl: './paytabs-gateway.component.html',
  styleUrls: ['./paytabs-gateway.component.scss']
})
export class PaytabsGatewayComponent extends PaymentBaseComponent implements OnInit, OnDestroy {


  style: StyleVariables;
  showAddCard: boolean = false;
  disabled: boolean = false;

  styleSubscription: Subscription;

  constructor(
    private utilService: UtilityService,
    private scriptService: ScriptService,
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document
  ) {
    super();
    this.style = new StyleVariables();
  }

  ngOnInit() {
    this.styleSubscription = this.utilService.getStyles.subscribe((style: StyleVariables) => {
      this.style = style;
    })
    this.initializePaytab();
    setTimeout(() => {
      Paytabs.openPaymentPage();
    }, 1500);


    // http://localhost:4200/cart?pt=1
    // http://localhost:4200/


    // const { key, value } = this.gateway.key_value_front.find((item) => item.for_front == 1);

    // const checkoutScript = new ScriptModel('paytab', 'https://www.paytabs.com/express/express_checkout_v3.js');

    // this.scriptService.loadScript(checkoutScript).then((script: ScriptModel) => {
    //   if (!script.isLoaded) {
    //     console.log('unable to load stripe script');
    //     this.onError.emit('unable to load stripe script');
    //     return;
    //   }

    //   // Paytabs.openPaymentPage();

    //     Paytabs("#express_checkout").expresscheckout({
    //       //   amount: "100.0",
    //       //   currency: "INR",
    //       //   title: "Cbl Dev",
    //       settings: {
    //         merchant_id: "10057663",
    //         secret_key: "QGj2hCvxNdFnoA9QZe9jm8QSr2S44FcUmvWD7sbUFRh4rrUrG4L2cCUEENJJsVDPqAsy3EtIvLNXdHoTM9WYLRDqEm97hNWIophr",
    //         amount: "10.00",
    //         currency: "USD",
    //         title: "Mr. John Doe",
    //         product_names: "Product1,Product2,Product3",
    //         order_id: 25,
    //         url_redirect: "http://localhost:4200",
    //         display_customer_info: 1,
    //         display_billing_fields: 0,
    //         display_shipping_fields: 0,
    //         language: "en",
    //         redirect_on_reject: 0,
    //         // style: {
    //         //   css: "custom",
    //         //   linktocss: "https://www.YOURSTORE.com/css/style.css"
    //         // },
    //         is_iframe: {
    //           load: "onbuttonclick",// 'onbodyload',
    //           show: 1
    //         },
    //         is_self: 1,
    //         // url_cancel: "http://www.YOURSTORE.com/mypage/payment_cancel"
    //         tokenization: {
    //           is_tokenization: 1
    //       }

    //       },
    //       customer_info: {
    //         first_name: "John",
    //         last_name: "Smith",
    //         phone_number: "5486253",
    //         email_address: "john@test.com",
    //         country_code: "973"
    //       },
    //       billing_address: {
    //         full_address: "Manama, Bahrain",
    //         city: "Manama",
    //         state: "Manama",
    //         country: "BHR",
    //         postal_code: "00973"
    //       },
    //       shipping_address: {
    //         shipping_first_name: "Jane",
    //         shipping_last_name: "Abdulla",
    //         full_address_shipping: "Manama, Bahrain",
    //         city_shipping: "Manama",
    //         state_shipping: "Manama",
    //         country_shipping: "BHR",
    //         postal_code_shipping: "00973"
    //       },
    //       checkout_button: {
    //         width: 150,
    //         height: 30,
    //         // img_url: "https://www.YOURSTORE.com/image/yourimage.jpg"
    //       },
    //       pay_button: {
    //         width: 150,
    //         height: 30,
    //         // img_url: "https://www.YOURSTORE.com/image/yourimage.jpg"
    //       }
    //     });
    // });
  }


  initializePaytab() {
    console.log('order', this.order);
    const scriptLink = this.document.createElement('script');
    scriptLink.id = `paytabs-express-checkout`;
    scriptLink.setAttribute("type", "text/javascript");
    scriptLink.setAttribute("src", 'https://paytabs.com/express/v4/paytabs-express-checkout.js');
    scriptLink.setAttribute("data-secret-key", 'QGj2hCvxNdFnoA9QZe9jm8QSr2S44FcUmvWD7sbUFRh4rrUrG4L2cCUEENJJsVDPqAsy3EtIvLNXdHoTM9WYLRDqEm97hNWIophr');
    scriptLink.setAttribute("data-merchant-id", '10057663');
    scriptLink.setAttribute("data-url-redirect", this.window.origin + '/cart?pt=1');
    // scriptLink.setAttribute("data-is-self", true);
    scriptLink.setAttribute("data-amount", this.order.amount);
    scriptLink.setAttribute("data-currency", GlobalVariable.CURRENCY_NAME);
    scriptLink.setAttribute("data-title", this.order.user.firstname);
    scriptLink.setAttribute("data-product-names", 'Product');
    scriptLink.setAttribute("data-order-id", this.order.user.id);
    scriptLink.setAttribute("data-customer-phone-number", this.order.address.phone_number);
    scriptLink.setAttribute("data-customer-email-address", this.order.user.email);
    scriptLink.setAttribute("data-customer-country-code", this.order.user.country_code);
    scriptLink.setAttribute("data-color", this.style.primaryColor);
    scriptLink.setAttribute("data-redirect-on-reject", true);
    scriptLink.setAttribute("data-is-popup", true);
    // scriptLink.setAttribute("data-billing-full-address", "")
    // scriptLink.setAttribute("data-ui-show-billing-address", false)
    this.document.body.appendChild(scriptLink);
  }
  // id="paytabs-express-checkout"
  // data-ui-element-id="payment-form"


  ngOnDestroy(): void {
    if (this.styleSubscription) this.styleSubscription.unsubscribe();
  }

}
