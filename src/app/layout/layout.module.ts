import { CartModule } from './pages/cart/cart.module';
/********** Imports **********/
import { LayoutRoutingModule } from './layout.routing';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocialLoginModule, AuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider } from "angularx-social-login";
import { CarouselModule } from 'ngx-owl-carousel-o';
import { LandingModule } from './landing/landing.module';
import { HomeServiceModule } from './home-service/home-service.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService, CONFIG } from '@angular/fire/analytics';

/********** Declarations **********/
import { SignUpComponent } from './authorization/sign-up/sign-up.component';
import { LoginComponent } from './authorization/login/login.component';
import { AuthComponent } from './authorization/auth.component';
import { LayoutComponent } from './layout.component';
import { FooterComponent } from './common/footer/footer.component';
import { HeaderComponent } from './common/header/header.component';
import { ForgotPasswordComponent } from './authorization/login/forgot-password/forgot-password.component';
import { SocialLoginComponent } from './authorization/social-login/social-login.component';
import { CategoriesComponent } from './common/header/categories/categories.component';
import { PickUpDateTimeComponent } from './pages/pick-up-date-time/pick-up-date-time.component';
import { ChatBotComponent } from './common/chat-bot/chat-bot.component';
import { BotMessageComponent } from './common/chat-bot/bot-message/bot-message.component';
import { DialogService } from 'primeng/dynamicdialog';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { ClickOutsideModule } from 'ng-click-outside';
import { LogoComponent } from './common/logo/logo.component';
import { EcommerceFooterComponent } from './common/footer/ecommerce-footer/ecommerce-footer.component';
import { EcomHeaderComponent } from './common/header/template/ecom-header/ecom-header.component';
import { TopHeaderComponent } from './common/header/top-header/top-header.component';
import { FunctionListComponent } from './common/header/function-list/function-list.component';
import { FoodFooterComponent } from './common/footer/food-footer/food-footer.component';
import { FoodHeaderComponent } from './common/header/template/food-header/food-header.component';
import { LandingFooterComponent } from './common/footer/landing-footer/landing-footer.component';
import { LayoutSharedModule } from './shared/layout-shared/layout-shared.module';
import { LanguageComponent } from './common/header/language/language.component';
import { HomeComponent } from './home/home.component';
import { FoodModule } from './food/food.module';
import { EcommerceModule } from './ecommerce/ecommerce.module';
import { CategorySelectionComponent } from './common/header/category-selection/category-selection.component';
// import { EcomCategoriesComponent } from './shared/ecom-categories/ecom-categories.component';
import { HeaderCartComponent } from './common/header/header-cart/header-cart.component';
import { PrivacyTermsComponent } from './pages/privacy-terms/privacy-terms.component';
import { MobileFooterComponent } from './common/footer/mobile-footer/mobile-footer.component';
import { MobileHeaderComponent } from './common/header/mobile-header/mobile-header.component';

import { FirebaseAnalyticsService } from '../services/firebase-analytics/firebase-analytics.service';
import { SocialEcommerceComponent } from './pages/social-ecommerce/social-ecommerce.component';
import { AgentRegistrationComponent } from './pages/agent-registration/agent-registration.component';
import { SupplierRegistrationComponent } from './pages/supplier-registration/supplier-registration.component';
import { FlavorOfTheWeekComponent } from './pages/flavor-of-the-week/flavor-of-the-week.component';
import { GroupOrderingComponent } from './pages/group-ordering/group-ordering.component';
import { CateringComponent } from './pages/catering/catering.component';
import { SitemapComponent } from './pages/sitemap/sitemap.component';
import { GlobalVariable } from './../core/global';
import { FcmService } from './../services/fcm/fcm.service';


export function getAuthServiceConfigs() {
  let providers = [];
  if(GlobalVariable.facebook_appId) {
    providers.push(
      {
        id: FacebookLoginProvider.PROVIDER_ID,
        provider: new FacebookLoginProvider(GlobalVariable.facebook_appId)
      }
    );
  }
  if(GlobalVariable.google_clientId) {
    providers.push(
      {
        id: GoogleLoginProvider.PROVIDER_ID,
        provider: new GoogleLoginProvider(GlobalVariable.google_clientId)
      }
    )
  }
  let config = new AuthServiceConfig(providers);
  return config;
}

@NgModule({
  declarations: [
    LayoutComponent,
    HeaderComponent,
    FooterComponent,
    AuthComponent,
    LoginComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    SocialLoginComponent,
    CategoriesComponent,
    PickUpDateTimeComponent,
    ChatBotComponent,
    BotMessageComponent,
    LogoComponent,
    EcommerceFooterComponent,
    FoodFooterComponent,
    EcomHeaderComponent,
    FunctionListComponent,
    TopHeaderComponent,
    TopHeaderComponent,
    FunctionListComponent,
    FoodHeaderComponent,
    LandingFooterComponent,
    LanguageComponent,
    HomeComponent,
    CategorySelectionComponent,
    HeaderCartComponent,
    PrivacyTermsComponent,
    SitemapComponent,
    MobileFooterComponent,
    MobileHeaderComponent,
    SocialEcommerceComponent,
    AgentRegistrationComponent,
    SupplierRegistrationComponent,
    FlavorOfTheWeekComponent,
    GroupOrderingComponent,
    CateringComponent
  ],
  imports: [
    LayoutSharedModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFireMessagingModule,
    AngularFireModule.initializeApp(GlobalVariable.FIREBASE_CONFIG),
    LandingModule,
    FoodModule,
    EcommerceModule,
    HomeServiceModule,
    LayoutRoutingModule,
    SocialLoginModule,
    CarouselModule,
    NgxIntlTelInputModule,
    ClickOutsideModule,
    AngularFireAnalyticsModule,
  ],
  providers: [
    FcmService,
    DialogService,
    {
      provide: AuthServiceConfig,
      useFactory: getAuthServiceConfigs
    },
    {
      provide: CONFIG, useValue: {
        send_page_view: false,
        allow_ad_personalization_signals: false,
        anonymize_ip: true
      }
    },
    FirebaseAnalyticsService,
    ScreenTrackingService,
    UserTrackingService
  ]
})
export class LayoutModule { }