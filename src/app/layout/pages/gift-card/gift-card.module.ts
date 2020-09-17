import { GiftCardListComponent } from './gift-card-list/gift-card-list.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GiftCardRoutingModule } from './gift-card-routing.module';
import { LayoutSharedModule } from '../../shared/layout-shared/layout-shared.module';
import { OnlinePaymentModule } from '../../shared/online-payment/online-payment.module';


@NgModule({
  declarations: [
    GiftCardListComponent
  ],
  imports: [
    CommonModule,
    LayoutSharedModule,
    OnlinePaymentModule,
    GiftCardRoutingModule
  ]
})
export class GiftCardModule { }
