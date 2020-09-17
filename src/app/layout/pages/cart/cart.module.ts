import { CartSharedModule } from '../../shared/layout-shared/cart-shared/cart-shared.module';
import { OnlinePaymentModule } from './../../shared/online-payment/online-payment.module';
import { CartComponent } from './../cart/cart-detail/cart.component';
import { CartRoutingModule } from './cart.routing';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// components
import { AgentComponent } from './agent/agent.component';
import { DialogService } from 'primeng/dynamicdialog';
import { RentalBookingComponent } from './rental-booking/rental-booking.component';

//********************************************* components *************************************************/
import { CartProductsListComponent } from './components/cart-products-list/cart-products-list.component';
import { CartProductComponent } from './components/cart-product/cart-product.component';
import { CartPriceDetailComponent } from './components/cart-price-detail/cart-price-detail.component';
import { CartPaymentModeComponent } from './components/cart-payment-mode/cart-payment-mode.component';
import { CartSkeletonComponent } from './components/cart-skeleton/cart-skeleton.component';
import { AgentTipComponent } from './components/agent-tip/agent-tip.component';
import { ReferralComponent } from './components/referral/referral.component';
import { CartImageUploadComponent } from './components/cart-image-upload/cart-image-upload.component';
import { InstructionsComponent } from './components/instructions/instructions.component';
import { LayoutSharedModule } from '../../shared/layout-shared/layout-shared.module';
import { CartGiftCardsComponent } from './components/cart-gift-cards/cart-gift-cards.component';
import { DeliveryAddressDetailComponent } from './components/delivery-address-detail/delivery-address-detail.component';
import { LoyaltyDiscountComponent } from './components/loyalty-discount/loyalty-discount.component';

@NgModule({
  declarations: [
    CartComponent,
    AgentComponent,
    RentalBookingComponent,
    CartProductsListComponent,
    CartProductComponent,
    CartPriceDetailComponent,
    CartPaymentModeComponent,
    ReferralComponent,
    CartSkeletonComponent,
    AgentTipComponent,
    CartImageUploadComponent,
    InstructionsComponent,
    CartGiftCardsComponent,
    DeliveryAddressDetailComponent,
    LoyaltyDiscountComponent
  ],
  imports: [
    CartSharedModule,
    OnlinePaymentModule,
    CartRoutingModule
  ],
  providers: [
    DialogService
  ]
})
export class CartModule { }
