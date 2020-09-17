import { FeedbackComponent } from './feedback/feedback.component';
import { LoyaltyComponent } from './loyalty/loyalty.component';
import { Routes } from '@angular/router';

//guard
import { AuthGuardService } from './../../core/guards/auth-guard/auth-guard.service';

//components
import { AccountComponent } from './account.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ManageAddressComponent } from './manage-address/manage-address.component';
import { PersonalInformationComponent } from './personal-information/personal-information.component';
import { AddressComponent } from './address/address.component';
import { ReferralsComponent } from './referrals/referrals.component';
import { MyWalletComponent } from './my-wallet/my-wallet.component';
import { MyGiftCardsComponent } from './my-gift-cards/my-gift-cards.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { SubscriptionDetailComponent } from './subscription-detail/subscription-detail.component';
import { TableBookingsComponent } from './table-bookings/table-bookings.component';


export const AccountRoutes: Routes = [
  {
    path: '',
    component: AccountComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile', component: PersonalInformationComponent,
        data: { title: 'Personal Information', breadcrumb: 'Personal Information' },
      },
      {
        path: 'notifications', component: NotificationsComponent,
        data: { title: 'Notifications', breadcrumb: 'Notifications' },
      },
      {
        path: 'change-password', component: ChangePasswordComponent,
        data: { title: 'Sale Report', breadcrumb: 'Sale Report' },
      },
      {
        path: 'referrals', component: ReferralsComponent,
        data: { title: 'Referrals', breadcrumb: 'Referrals' },
      },
      {
        path: 'my-gift-cards', component: MyGiftCardsComponent,
        data: { title: 'My Gift Cards', breadcrumb: 'My Gift Cards' },
      },
      {
        path: 'loyalty', component: LoyaltyComponent,
        data: { title: 'My Loyalty', breadcrumb: 'My Loyalty' },
      },
      {
        path: 'feedback', component: FeedbackComponent,
        data: { title: 'My Feedback', breadcrumb: 'My Feedback' },
      },
      {
        path: 'my-wallet', component: MyWalletComponent,
        data: { title: 'My Wallet', breadcrumb: 'My Wallet' },
      },
      {
        path: 'table-bookings', component: TableBookingsComponent,
        data: { title: 'Table Bookings', breadcrumb: 'Table Bookings' },
      },
      {
        path: 'subscriptions',
        data: { title: 'Subscriptions', breadcrumb: 'Subscriptions' },
        children: [{
          path: '', component: SubscriptionsComponent,
        }, {
          path: ':id', component: SubscriptionDetailComponent,
          data: { title: 'Subscription Detail', breadcrumb: 'Subscription Detail' }
        }]
      },
      {
        path: 'address',
        data: { title: 'Address', breadcrumb: 'Address' },
        children: [
          {
            path: '', component: AddressComponent,
          },
          {
            path: 'add-edit-address', component: ManageAddressComponent,
            data: { title: 'Add/Edit Address', breadcrumb: 'Add/Edit Address' }
          },
        ]
      }
    ]
  }
];
