import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observer, Observable } from 'rxjs';
import * as en from './../assets/i18n/en.json';
import * as ar from './../assets/i18n/ar.json';
import * as fr from './../assets/i18n/fr.json';
import * as ml from './../assets/i18n/ml.json';

const TRANSLATIONS = {
    en: en,
    ar: ar,
    fr: fr,
    ml: ml,
};

export function universalLoader(): TranslateLoader {
    return {
        getTranslation: (lang: string) => {
            return Observable.create((observer: Observer<any>) => {
                observer.next(TRANSLATIONS[lang]);
                observer.complete();
            });
        }
    } as TranslateLoader;
 }

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        AppModule,
        ServerModule,
        NoopAnimationsModule,
        ServerTransferStateModule,
        TranslateModule.forRoot({
            loader: {provide: TranslateLoader, useFactory: universalLoader}
        })
    ]
})
export class AppServerModule { }
