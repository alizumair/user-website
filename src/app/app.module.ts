import { Router } from '@angular/router';
import { AppLoadService } from './services/app-load/app-load.service';
import { TimeoutInterceptor, DEFAULT_TIMEOUT } from './core/interceptors/timeout.interceptor';
import { environment } from './../environments/environment';

/********** Imports **********/
import { NgtUniversalModule } from '@ng-toolkit/universal';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { NgModule, SystemJsNgModuleLoader, NgModuleFactoryLoader, APP_INITIALIZER } from '@angular/core';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app.routing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserModule } from '@angular/platform-browser';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { CartInitModule } from '@sh_mayank/cart-init';

/********** Declarations **********/
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { AppComponent } from './app.component';
import { LoaderComponent } from './core/loader/loader.component';
import { AddressComponent } from './address/address.component';
import { PaymentFailureComponent } from './payment/pages/payment-failure/payment-failure.component';
import { PaymentSuccessComponent } from './payment/pages/payment-success/payment-success.component';

/********** Providers **********/
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { TransferStateInterceptor } from './core/interceptors/transferState.interceptor';
import { WINDOW_PROVIDERS } from './services/window/window.service';
import { TermsComponent } from './terms/terms.component';

export function initializeApp(appInitService: AppLoadService, router: Router) {
  return (): Promise<any> => { 
    return appInitService.init().then(
      (val) => {
        console.log('welcome');
      },
      (err) => {
        console.error(err);
      }
    );
  }
}

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    LoaderComponent,
    TermsComponent,
    AddressComponent,
    PaymentFailureComponent,
    PaymentSuccessComponent,
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    BrowserModule.withServerTransition({ appId: 'saas-website' }),
    NgtUniversalModule,
    TransferHttpCacheModule,
    HttpClientModule,
    TranslateModule,
    DeviceDetectorModule,
    CartInitModule.forRoot(environment),
    AppRoutingModule,
    SharedModule,
  ],
  providers: [
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: TransferStateInterceptor,
    //   multi: true
    // },
    { 
      provide: APP_INITIALIZER,
      useFactory: initializeApp, 
      deps: [AppLoadService], 
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TimeoutInterceptor,
      multi: true
    },
    {
      provide: DEFAULT_TIMEOUT,
      useValue: 20000
    },
    { 
      provide: NgModuleFactoryLoader, 
      useClass: SystemJsNgModuleLoader 
    },
    WINDOW_PROVIDERS
  ],
})
export class AppModule { }


