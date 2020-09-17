import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SelectivePreloadingService } from './services/selective-preloading/selective-preloading.service';
import { AddressComponent } from './address/address.component';
import { TermsComponent } from './terms/terms.component';
import { TermsAndPolicyService } from './services/terms-and-policy/terms-and-policy.service';
import { AppSettingGuard } from './core/guards/app-setting-guard/app-setting-guard.guard';
import { PaymentSuccessComponent } from './payment/pages/payment-success/payment-success.component';
import { PaymentFailureComponent } from './payment/pages/payment-failure/payment-failure.component';

const routes: Routes = [
  {
    path: 'error', component: PageNotFoundComponent
  },
  {
    path: '', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule), data: { preload: true, delay: false }
  },
  {
    path: 'terms', component: TermsComponent,
    resolve: { termsAndPolicy: TermsAndPolicyService },
    data: {
      type: 1,
      title: 'Terms And Condition'
    }
  },
  {
    path: 'policy', component: TermsComponent,
    resolve: { termsAndPolicy: TermsAndPolicyService },
    data: {
      type: 2,
      title: 'Policy'
    }
  },
  {
    path: 'about-us', component: TermsComponent,
    resolve: { termsAndPolicy: TermsAndPolicyService },
    data: {
      type: 3,
      title: 'About Us' 
    }
  },
  {
    path: 'faqs', component: TermsComponent,
    resolve: { termsAndPolicy: TermsAndPolicyService },
    data: {
      type: 4,
      title: 'faqs'
    }
  },
  {
    path: 'address', component: AddressComponent, data: {
      title: 'Address',
      description: "User Current Address",
      keyword: 'food'
    }
  },
  {
    path: 'success',
    canActivate: [AppSettingGuard],
    component: PaymentSuccessComponent,
    data: {
      title: 'Payment Success',
      description: "Order Payment Success",
      keyword: 'Payment'
    }
  },

  {
    path: 'failure',
    canActivate: [AppSettingGuard],
    component: PaymentFailureComponent,
    data: {
      title: 'Payment Failure',
      description: "Order Payment Failure",
      keyword: 'Payment'
    }
  },
  {
    path: '**', component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { initialNavigation: 'enabled', preloadingStrategy: SelectivePreloadingService, enableTracing: false }),
    CommonModule
  ],
  exports: [RouterModule],
  providers: [
    TermsAndPolicyService
  ]
})

export class AppRoutingModule { }

