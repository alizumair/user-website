import { PaymentBaseComponent } from './components/payment-base.component';
/************************ CORE MODULES ***************************/
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/************************** MODULES *************************/
import { LayoutSharedModule } from './../layout-shared/layout-shared.module';

/************************* DRIVECTIVES **************************/
// import { CreditCardDirectivesModule } from 'angular-cc-library';
import { BlockCopyPasteDirective } from './../layout-shared/directives/block-copy-paste.directive';

/********************** COMPONENTS *******************************/
import { OnlinePaymentComponent } from './online-payment.component';
import { StripeGatewayComponent } from './components/stripe-gateway/stripe-gateway.component';
import { ConektaGatewayComponent } from './components/conekta-gateway/conekta-gateway.component';
import { RazorpayGatewayComponent } from './components/razorpay-gateway/razorpay-gateway.component';
import { PaystackGatewayComponent } from './components/paystack-gateway/paystack-gateway.component';
import { PaypalGatewayComponent } from './components/paypal-gateway/paypal-gateway.component';
import { VenmoGatewayComponent } from './components/venmo-gateway/venmo-gateway.component';
import { ZelleGatewayComponent } from './components/zelle-gateway/zelle-gateway.component';
import { CybersourceGatewayComponent } from './components/cybersource-gateway/cybersource-gateway.component';
import { AddCardComponent } from './components/add-card/add-card.component';
import { CheckoutGatewayComponent } from './components/checkout-gateway/checkout-gateway.component';
import { MyFatoorahGatewayComponent } from './components/my-fatoorah-gateway/my-fatoorah-gateway.component';
import { SadadGatewayComponent } from './components/sadad-gateway/sadad-gateway.component';
import { MumybeneGatewayComponent } from './components/mumybene-gateway/mumybene-gateway.component';
import { SquareGatewayComponent } from './components/square-gateway/square-gateway.component';
import { TapGatewayComponent } from './components/tap-gateway/tap-gateway.component';
import { PaytabsGatewayComponent } from './components/paytabs-gateway/paytabs-gateway.component';
import { ElavonConvergeGatewayComponent } from './components/elavon-converge-gateway/elavon-converge-gateway.component';
import { WindcaveGatewayComponent } from './components/windcave-gateway/windcave-gateway.component';
import { MpaisaGatewayComponent } from './components/mpaisa-gateway/mpaisa-gateway.component';
import { PayhereGatewayComponent } from './components/payhere-gateway/payhere-gateway.component';
import { CashappGatewayComponent } from './components/cashapp-gateway/cashapp-gateway.component';
import { PeachGatewayComponent } from './components/peach-gateway/peach-gateway.component';
import { BraintreeGatewayComponent } from './components/braintree-gateway/braintree-gateway.component';
import { AamarPayGatewayComponent } from './components/aamarpay-gateway/aamarpay-gateway.component';
import { DatatransGatewayComponent } from './components/datatrans-gateway/datatrans-gateway.component';
import { AuthorizeNetGatewayComponent } from './components/authorize-net-gateway/authorize-net-gateway.component';
import { CredMovilGatewayComponent } from './components/cred-movil-gateway/cred-movil-gateway.component';

const components = [
  PaymentBaseComponent,
  OnlinePaymentComponent,
  StripeGatewayComponent,
  ConektaGatewayComponent,
  RazorpayGatewayComponent,
  PaystackGatewayComponent,
  PaypalGatewayComponent,
  VenmoGatewayComponent,
  ZelleGatewayComponent,
  AddCardComponent,
  CybersourceGatewayComponent,
  CheckoutGatewayComponent,
  BlockCopyPasteDirective,
  PaytabsGatewayComponent,
  MyFatoorahGatewayComponent,
  SadadGatewayComponent,
  MumybeneGatewayComponent,
  TapGatewayComponent,
  SquareGatewayComponent,
  ElavonConvergeGatewayComponent,
  WindcaveGatewayComponent,
  MpaisaGatewayComponent,
  CashappGatewayComponent,
  PayhereGatewayComponent,
  PeachGatewayComponent,
  BraintreeGatewayComponent,
  AamarPayGatewayComponent,
  AuthorizeNetGatewayComponent
]

@NgModule({
  declarations: [
    ...components,
    DatatransGatewayComponent,
    CredMovilGatewayComponent
  ],
  imports: [
    CommonModule,
    LayoutSharedModule
  ],
  entryComponents: [
    OnlinePaymentComponent
  ],
  exports: [
    ...components
  ]
})
export class OnlinePaymentModule { }
