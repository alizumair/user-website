import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { NgModule } from '@angular/core';
import { BrowserTransferStateModule } from '@angular/platform-browser';
// import { ServiceWorkerModule } from '@angular/service-worker';
// import { environment } from '../environments/environment';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
      return new TranslateHttpLoader(http);
}

@NgModule({
       bootstrap: [AppComponent],
       imports: [
              AppModule,
              BrowserTransferStateModule,
              HttpClientModule,
              // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
              TranslateModule.forRoot({
                     loader: {provide: TranslateLoader, useFactory: HttpLoaderFactory, deps: [HttpClient]}
              })
       ]
})
export class AppBrowserModule { }
