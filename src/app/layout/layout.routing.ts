import { GroupOrderingComponent } from './pages/group-ordering/group-ordering.component';
import { FlavorOfTheWeekComponent } from './pages/flavor-of-the-week/flavor-of-the-week.component';
import { CateringComponent } from './pages/catering/catering.component';
import { SupplierRegistrationComponent } from './pages/supplier-registration/supplier-registration.component';
import { AgentRegistrationComponent } from './pages/agent-registration/agent-registration.component';
import { SitemapComponent } from './pages/sitemap/sitemap.component';
import { PrivacyTermsComponent } from './pages/privacy-terms/privacy-terms.component';
import { TermsAndPolicyService } from './../services/terms-and-policy/terms-and-policy.service';
import { CustomFlowGuard } from './../core/guards/custom-flow/custom-flow.guard';
import { HomeComponent } from './home/home.component';
import { FoodListingComponent } from './food/food-listing/food-listing.component';
import { PickUpDateTimeComponent } from './pages/pick-up-date-time/pick-up-date-time.component';
import { AuthGuardService } from './../core/guards/auth-guard/auth-guard.service';
import { LayoutComponent } from './layout.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialEcommerceComponent } from './pages/social-ecommerce/social-ecommerce.component';

var routes: Routes = [
  {
    path: '', component: LayoutComponent, children: [

      {
        path: '', component: HomeComponent, data: {
          title: 'Home',
          description: 'Home Description',
          keyword: 'shopping, ecommerce'
        }
      },

      {
        path: 'pick-up-date-time', component: PickUpDateTimeComponent, data: {
          title: 'PickUp Date-Time',
          description: 'PickUp Date-Time Description',
          keyword: 'shopping, ecommerce'
        }
      },

      {
        path: ':products/listing', component: FoodListingComponent, data: {
          title: 'Listing',
          description: 'Description',
          keyword: 'shopping, ecommerce'
        }
      },

      {
        path: 'supplier', loadChildren: () => import('./pages/suppliers/suppliers.module').then(m => m.SuppliersModule)
      },

      {
        path: 'products', loadChildren: () => import('./pages/products/products.module').then(m => m.ProductsModule)
      },

      {
        path: 'cart', loadChildren: () => import('./pages/cart/cart.module').then(m => m.CartModule), data: { preload: true, delay: false }
      },

      {
        path: 'gift-card', loadChildren: () => import('./pages/gift-card/gift-card.module').then(m => m.GiftCardModule)
      },

      {
        path: 'orders', loadChildren: () => import('./pages/orders/orders.module').then(m => m.OrdersModule), canActivate: [AuthGuardService]
      },

      {
        path: 'account', loadChildren: () => import('./account/account.module').then(m => m.AccountModule), canActivate: [AuthGuardService]
      },

      {
        path: ':flowName/home', canActivate: [CustomFlowGuard], component: HomeComponent, data: {
          title: 'Home',
          description: 'Home Description',
          keyword: 'shopping, ecommerce'
        }
      },
      {
        path: 'agent-registration', component: AgentRegistrationComponent
      },
      {
        path: 'vendor-registration', component: SupplierRegistrationComponent
      },
      {
        path: 'catering', component: CateringComponent
      },
      {
        path: 'flavor-of-the-week', component: FlavorOfTheWeekComponent
      },
      {
        path: 'group-ordering', component: GroupOrderingComponent
      },
      {
        path: 'terms-and-conditions', component: PrivacyTermsComponent,
        resolve: { termsAndPolicy: TermsAndPolicyService },
        data: {
          type: 1,
          title: 'Terms And Condition'
        }
      },
      {
        path: 'privacy-policy', component: PrivacyTermsComponent,
        resolve: { termsAndPolicy: TermsAndPolicyService },
        data: {
          type: 2,
          title: 'Policy'
        }
      },
      {
        path: 'about', component: PrivacyTermsComponent,
        resolve: { termsAndPolicy: TermsAndPolicyService },
        data: {
          type: 3,
          title: 'About Us'
        }
      },
      {
        path: 'faq', component: PrivacyTermsComponent,
        resolve: { termsAndPolicy: TermsAndPolicyService },
        data: {
          type: 4,
          title: 'Frequently Asked Questions'
        }
      },
      {
        path: 'sitemap', component: SitemapComponent
      },
      {
        path: 'social-ecom', component: SocialEcommerceComponent,
        data: {
          title: 'Social Ecommerce'
        }
      },
    ]
  },
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }

