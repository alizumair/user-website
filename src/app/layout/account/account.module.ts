import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
// import { ShareButtonsModule } from '@ngx-share/buttons';

// components
import { AccountComponent } from './account.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ManageAddressComponent } from './manage-address/manage-address.component';
import { PersonalInformationComponent } from './personal-information/personal-information.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { AddressComponent } from './address/address.component';
import { ReferralsComponent } from './referrals/referrals.component';

//routing
import { AccountRoutes } from "./account.routing";
import { LayoutSharedModule } from '../shared/layout-shared/layout-shared.module';
import { MyGiftCardsComponent } from './my-gift-cards/my-gift-cards.component';
import { MyWalletComponent } from './my-wallet/my-wallet.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { OnlinePaymentModule } from '../shared/online-payment/online-payment.module';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { SubscriptionDetailComponent } from './subscription-detail/subscription-detail.component';
import { LoyaltyComponent } from './loyalty/loyalty.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { TableBookingsComponent } from './table-bookings/table-bookings.component';

import { ShareButtonsModule } from 'ngx-sharebuttons/buttons';
import { ShareIconsModule } from 'ngx-sharebuttons/icons';

@NgModule({
  declarations: [
    AccountComponent,
    NotificationsComponent,
    ChangePasswordComponent,
    ManageAddressComponent,
    PersonalInformationComponent,
    SideNavComponent,
    AddressComponent,
    ReferralsComponent,
    MyGiftCardsComponent,
    MyWalletComponent,
    SubscriptionsComponent,
    SubscriptionDetailComponent,
    LoyaltyComponent,
    FeedbackComponent,
    TableBookingsComponent
  ],
  imports: [
    LayoutSharedModule,
    CommonModule,
    // ShareButtonsModule,
    ShareButtonsModule.withConfig({
      debug: true
    }),
    ShareIconsModule,
    NgxIntlTelInputModule,
    OnlinePaymentModule,
    RouterModule.forChild(AccountRoutes)
  ]
})
export class AccountModule { }
