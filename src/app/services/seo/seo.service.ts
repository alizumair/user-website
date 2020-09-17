import { UtilityService } from './../utility/utility.service';
import { Subscription } from 'rxjs';
import { GlobalVariable } from './../../core/global';
import { AppSettings } from './../../shared/models/appSettings.model';
import { Injectable, OnDestroy } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService implements OnDestroy {

  settings: AppSettings;
  settingsSubscription: Subscription;

  constructor(
    private title: Title,
    private meta: Meta,
    private util: UtilityService) {

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        this.settings = settings;
      });
  }

  updateTitle(title: string) {
    this.title.setTitle(title);
  }

  updateDescription(desc: string) {
    this.meta.updateTag({ name: 'description', content: desc });
  }

  updateKeyWords(keyword: string) {
    this.meta.updateTag({ name: 'keyword', content: keyword })
  }

  setDefault() {
    this.title.setTitle(GlobalVariable.SITE_NAME);
    if (!!this.settings.webMetaDescription) {
      this.meta.updateTag({ name: 'description', content: this.settings.webMetaDescription });
    }
  }

  // updateOgUrl(url: string) {
  //   this.meta.updateTag({ name: 'og:url', content: url })
  // }

  ngOnDestroy() {
    if(!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
  }
}
