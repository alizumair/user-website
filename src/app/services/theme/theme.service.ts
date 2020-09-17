import { Injectable, Inject, OnInit, OnDestroy } from '@angular/core';
import { UtilityService } from './../utility/utility.service';
import { DOCUMENT } from '@angular/common';
import { StyleVariables } from '../../core/theme/styleVariables.model';
import { AppSettings } from '../../shared/models/appSettings.model';
import { StyleConstants } from '../../core/theme/styleConstants.model';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnDestroy {
  body: StyleConstants;

  isDarkTheme: boolean = false;
  style: StyleVariables;
  settings: AppSettings

  settingSubscription: Subscription;
  styleSubscription: Subscription;
  themeSubscription: Subscription;

  constructor(
    private util: UtilityService,
    @Inject(DOCUMENT) private document) {

    this.style = new StyleVariables();
    this.body = new StyleConstants();

    this.settingSubscription = this.util.getSettings.subscribe(
      (settings: AppSettings) => {
        this.settings = settings;
      }
    );

    this.themeSubscription = this.util.getDarkTheme.subscribe((isDark: boolean) => {
      this.isDarkTheme = isDark;
      if (this.settings)
        this._setThemeColor(this.isDarkTheme);
    });
  }

  addScripts(script: Array<string>, app_type: number): void {
    script.map((link: string, index: number) => {
      const head = this.document.getElementsByTagName('head')[0];
      const scriptLink = this.document.createElement('script');
      scriptLink.id = `app-script-${app_type}${index}`;
      scriptLink.setAttribute("type", "text/javascript");
      scriptLink.setAttribute("src", link);
      head.appendChild(scriptLink);
    });
  }

  addStyleSheets(style_sheets: Array<string>, app_type: number): void {
    style_sheets.map((link: string, index: number) => {
      if (this.document.getElementById(`app-${app_type}${index}`)) return;
      const head = this.document.getElementsByTagName('head')[0];
      const styleLink = this.document.createElement('link');
      styleLink.id = `app-${app_type}${index}`;
      styleLink.rel = 'stylesheet';
      styleLink.type = 'text/css';
      styleLink.href = link
      head.appendChild(styleLink);
    });
  }

  getStyleSheets(app_type): Array<string> {
    let style_sheets: Array<string> = [];

    switch (app_type) {
      case 1:  //Food
        switch (this.settings.selected_template) {
          case 0:
            style_sheets.push('/assets/styles/food.css');
            break;
          case 1:
            style_sheets.push('/assets/styles/food-template-one/inner.css');
            style_sheets.push('/assets/styles/food-template-one/style.css');
            break;
          case 2:
            style_sheets.push('/assets/styles/food-template-two/inner.css');
            style_sheets.push('/assets/styles/food-template-two/style.css');
            break;
        }
        break;

      case 2:  //Ecommerce
        switch (this.settings.selected_template) {
          case 0:
            style_sheets.push('/assets/styles/ecommerce.css');
            break;
          case 1: case 2:
            style_sheets.push('/assets/styles/ecom-template-one/inner.css');
            style_sheets.push('https://fonts.googleapis.com/css?family=Lato:300,400,400i,700|Montserrat:300,400,500,600,700|Merriweather:300,400,300i,400i');
            style_sheets.push('/assets/styles/ecom-template-one/animate.css');
            style_sheets.push('/assets/styles/ecom-template-one/ecommerce.css');
            style_sheets.push('/assets/styles/ecom-template-one/font-icons.css');
            style_sheets.push('/assets/styles/ecom-template-one/fonts.css');
            style_sheets.push('/assets/styles/ecom-template-one/responsive.css');
            style_sheets.push('/assets/styles/ecom-template-one/shop.css');
            style_sheets.push('/assets/styles/ecom-template-one/style.css');
            style_sheets.push('/assets/styles/ecom-template-one/swipper.css');
            break;
          case 3:
            style_sheets.push('/assets/styles/ecom-template-one/inner.css');
            style_sheets.push('https://fonts.googleapis.com/css?family=Lato:300,400,400i,700|Montserrat:300,400,500,600,700|Merriweather:300,400,300i,400i');
            style_sheets.push('/assets/styles/ecom-template-one/animate.css');
            style_sheets.push('/assets/styles/ecom-template-one/ecommerce.css');
            style_sheets.push('/assets/styles/ecom-template-one/font-icons.css');
            style_sheets.push('/assets/styles/ecom-template-one/fonts.css');
            style_sheets.push('/assets/styles/ecom-template-one/responsive.css');
            style_sheets.push('/assets/styles/ecom-template-one/shop.css');
            // style_sheets.push('/assets/styles/ecom-template-one/style.css');
            style_sheets.push('/assets/styles/ecom-template-three/style.css');
            style_sheets.push('/assets/styles/ecom-template-three/inner.css');
            style_sheets.push('/assets/styles/ecom-template-one/swipper.css');
            break;

          case 4:
            style_sheets.push('/assets/styles/ecom-template-four/inner.css');
            style_sheets.push('/assets/styles/ecom-template-four/style.css');
        }
        break;

      case 5:  //Rental
        style_sheets.push('/assets/styles/rental.css');
        break;

      case 8:  //Home Service
        style_sheets.push('/assets/styles/home-service.css');
        break;

      default:
        style_sheets.push('/assets/styles/custom.css');
    }

    return style_sheets;
  }

  public setStyles(appColor?: any): void {

    let style_sheets: Array<string> = this.getStyleSheets(this.settings.app_type);

    this.addStyleSheets(style_sheets, this.settings.app_type);

    if (this.settings.isCustomFlow) {
      let flow_data = this.util.getLocalData('selected_category', true);
      if (!!flow_data && flow_data.type < 11) {
        this.addStyleSheets(['/assets/styles/custom.css'], this.settings.type);
      }
    }

    this._setThemeColor(this.isDarkTheme, appColor || this.style);

    this.styleSubscription = this.util.getStyles.subscribe((style: StyleVariables) => {
      this.body.fontFamily = style.fontFamily;
      this.body.backgroundColor = style.backgroundColor;
    });
  }

  private _setThemeColor(is_dark: boolean, appColor?: any): void {
    if (is_dark) {
      this.style.primaryColor = appColor.primaryColor || '#DF284E';
      this.style.backgroundColor = '#191926'
      this.style.cardBackgroundColor = '#232331';
      this.style.baseColor = '#ffffff';
      this.style.secondaryColor = "#191926"
    } else {
      switch (this.settings.app_type) {
        case 1:  //Food
          this.style.primaryColor = appColor.primaryColor || '#DF284E';
          this.style.backgroundColor = '#ffffff'
          this.style.cardBackgroundColor = '#ffffff';
          this.style.baseColor = appColor.baseColor || '#2f313a';
          this.style.secondaryColor = '#ccc';
          this.style.headerBackgroundColor = appColor.headerBackgroundColor;
          this.style.headerFontFamily = appColor.headerFontFamily;
          this.style.headerTextColor = appColor.headerTextColor || this.style.baseColor;
          this.style.topHeaderBackgroundColor = appColor.topHeaderBackgroundColor || appColor.headerBackgroundColor;
          this.style.topHeaderTextColor = appColor.topHeaderTextColor || this.style.headerTextColor
          break;

        case 2:  //Ecommerce
          this.style.primaryColor = appColor.primaryColor || '#25494D';
          this.style.baseColor = appColor.baseColor || '#484848';
          this.style.backgroundColor = '#ffffff';
          this.style.cardBackgroundColor = '#f8f8f8';
          this.style.headerBackgroundColor = appColor.headerBackgroundColor;
          this.style.headerFontFamily = appColor.headerFontFamily;
          this.style.headerTextColor = appColor.headerTextColor || this.style.baseColor;
          this.style.topHeaderBackgroundColor = appColor.topHeaderBackgroundColor || appColor.headerBackgroundColor;
          this.style.topHeaderTextColor = appColor.topHeaderTextColor || this.style.headerTextColor
          break;

        case 5:  //Rental
          this.style.primaryColor = '#F03A76';
          this.style.cardBackgroundColor = '#ffffff';
          this.style.fontFamily = 'gilroy-bold';
          break;

        case 8:  //Home Service
          this.style.primaryColor = appColor.primaryColor || '#45AFB0';
          this.style.baseColor = appColor.baseColor || '#000000';
          this.style.backgroundColor = '#f3f3f3';
          this.style.cardBackgroundColor = '#f3f3f3';
          this.style.headerBackgroundColor = appColor.headerBackgroundColor;
          this.style.headerFontFamily = appColor.headerFontFamily;
          this.style.headerTextColor = appColor.headerTextColor || this.style.baseColor;
          this.style.topHeaderBackgroundColor = appColor.topHeaderBackgroundColor || appColor.headerBackgroundColor;
          this.style.topHeaderTextColor = appColor.topHeaderTextColor || this.style.headerTextColor
          break;
        default:
          this.style.primaryColor = appColor.primaryColor || '#25494D';
          this.style.baseColor = appColor.baseColor || '#484848';
          this.style.backgroundColor = '#ffffff';
          this.style.cardBackgroundColor = '#f8f8f8';
          this.style.headerBackgroundColor = appColor.headerBackgroundColor;
          this.style.headerFontFamily = appColor.headerFontFamily;
          this.style.headerTextColor = appColor.headerTextColor || this.style.baseColor;
          this.style.topHeaderBackgroundColor = appColor.topHeaderBackgroundColor || appColor.headerBackgroundColor;
          this.style.topHeaderTextColor = appColor.topHeaderTextColor || this.style.headerTextColor
          this.style.footerColor = appColor.footerColor || this.style.primaryColor
          this.style.footerSecColor = appColor.footerSecColor || this.style.primaryColor
          this.style.footerTextColor = appColor.footerTextColor || this.style.baseColor
      }
    }
    this.setRootColorProperties(this.style);
    this.util.setStyles(this.style);
  }

  setRootColorProperties(style: StyleVariables) {
    this.document.documentElement.style.setProperty('--primaryColor', style.primaryColor);
    this.document.documentElement.style.setProperty('--baseColor', style.baseColor);
    this.document.documentElement.style.setProperty('--secondaryColor', style.secondaryColor);
    this.document.documentElement.style.setProperty('--backgroundColor', style.backgroundColor);
    this.document.documentElement.style.setProperty('--cardBackgroundColor', style.cardBackgroundColor);
    this.document.documentElement.style.setProperty('--headerTextColor', style.headerTextColor);
    this.document.documentElement.style.setProperty('--headerBackgroundColor', style.headerBackgroundColor);
    this.document.documentElement.style.setProperty('--topHeaderTextColor', style.topHeaderTextColor);
    this.document.documentElement.style.setProperty('--topHeaderBackgroundColor', style.topHeaderBackgroundColor);
  }

  removeStyleLink(app_type) {
    let style_sheets: Array<string> = this.getStyleSheets(app_type);
    style_sheets.map((sheet, index) => {
      let id = 'app-' + app_type + index;
      let styleLinkElement = this.document.getElementById(id);
      if (styleLinkElement) {
        styleLinkElement.parentNode.removeChild(styleLinkElement);
      }
    });
  }

  ngOnDestroy(): void {
    if (!!this.settingSubscription) this.settingSubscription.unsubscribe();
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.themeSubscription) this.themeSubscription.unsubscribe();
  }
}
