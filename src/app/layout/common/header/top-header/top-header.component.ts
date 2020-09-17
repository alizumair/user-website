import { EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UtilityService } from './../../../../services/utility/utility.service';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { Component, OnInit, Input, OnDestroy, Inject } from '@angular/core';

export class Language {
  id: number;
  language_code: string;
  language_name: string;
  rtl: number
}

@Component({
  selector: 'app-top-header',
  templateUrl: './top-header.component.html',
  styleUrls: ['./top-header.component.scss']
})
export class TopHeaderComponent implements OnInit, OnDestroy {

  @Input() showSearchbar: boolean = false;
  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Input() loggedIn: boolean = false;
  @Input() openAuth: boolean = false;
  @Input() userData: any;
  @Output() authType: EventEmitter<string> = new EventEmitter<string>();
  @Output() searchBar: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() triggerAuthModal: EventEmitter<boolean> = new EventEmitter<boolean>();

  is_dark: boolean = false;
  themeSubscription: Subscription;
  selectedLang: Language;
  langData: Array<Language> = [];

  constructor(
    public router: Router,
    private util: UtilityService,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document) {

    this.langData.push({
      id: 14,
      language_code: "en",
      language_name: "English",
      rtl: 0
    });
  }

  setLanguage(langData: any) {
    this.util.handler.languageId = langData['id'] || this.util.handler.languageId;
    this.util.handler.rtl = langData['rtl'];
    this.selectedLang = langData;
    this.translate.setDefaultLang(langData['language_code']);
    this.document.getElementsByTagName('html')[0].setAttribute('lang', langData['language_code']);
    this.util.setLocalData('langData', langData, true);
  }

  ngOnInit() {
    this.themeSubscription = this.util.getDarkTheme.subscribe((isDark: boolean) => {
      this.is_dark = isDark;
    });

    if (!!this.settings.secondary_language) {
      let lang_obg = new Language();
      switch (this.settings.secondary_language) {
        case 'es':
          lang_obg.id = 15;
          lang_obg.language_code = 'es';
          lang_obg.language_name = 'Spanish';
          lang_obg.rtl = 0;
          break;

        case 'ar':
          lang_obg.id = 15;
          lang_obg.language_code = 'ar';
          lang_obg.language_name = 'Arabic';
          lang_obg.rtl = 1;
          break;
      }
      this.langData.push(lang_obg);
      let langObj = this.util.getLocalData('langData', true);
      if (this.settings.default_language == 1 && !langObj) {
        this.setLanguage(this.langData[1]);
      } else {
        this.setLanguage(langObj || this.langData[0]);
      }
    }
  }

  themeChange(is_dark) {
    this.util.setDarkTheme(is_dark);
  }

  languageSelect(langData: any) {
    this.util.setLocalData('langData', langData, true);
    this.util.window.location.reload();
  }

  setBackgroundColor() {
    var color = "";
    if (this.settings.is_custom_category_template === '1') {
      return color = "#01a14e";
    }
    else {
      if (this.is_dark) {
        return color = this.style.backgroundColor;
      }
      else {
        return color = this.style.topHeaderBackgroundColor;
      }
    }
  }

  ngOnDestroy() {
    this.themeSubscription.unsubscribe();
  }

}
