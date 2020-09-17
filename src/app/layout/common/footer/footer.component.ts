import { WINDOW } from './../../../services/window/window.service';
import { AppSettings } from './../../../shared/models/appSettings.model';
import { Subscription } from 'rxjs';
import { GlobalVariable } from './../../../core/global';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { UtilityService } from './../../../services/utility/utility.service';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import {DialogService} from 'primeng/dynamicdialog';
import { EmailComponent } from '../../shared/layout-shared/components/email/email.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {

  siteName: string = '';
  registrationUrl: string = '';
  styleSubscription: Subscription;
  settingsSubscription: Subscription;
  style: StyleVariables;
  image_paths: string = '';
  settings: AppSettings

  contact: {
    phoneNumber: string;
    email: string;
    country: string
  };

  appLink: {
    android: string,
    ios: string;
  }

  is_mobile: boolean = GlobalVariable.IS_MOBILE;

  constructor(
    public util: UtilityService,
    public dialogService: DialogService,
    @Inject(WINDOW) private window: Window
  ) {

    this.siteName = GlobalVariable.SITE_NAME;
    this.registrationUrl = `${GlobalVariable.admin_domain}/#!/supplier-registration`;

    this.contact = {
      phoneNumber: GlobalVariable.PHONE_NUMBER,
      email: GlobalVariable.EMAIL,
      country: GlobalVariable.COUNTRY
    }

    this.style = new StyleVariables();
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (!!settings) {
          this.settings = settings;
          this.image_paths = settings.site_logo;
          this.appLink = {
            android: settings.android_app_url,
            ios: settings.ios_app_url
          }
        }
      });
  }

  onHelp() {
    const dialogRef = this.dialogService.open(EmailComponent, {
      width: '50%',
      style: { 'background-color': `${this.style.primaryColor} !important` },
      showHeader: false,
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
    })

    dialogRef.onClose.subscribe(() => {
    })
  }

  mailTo() {
    this.window.location.href = `mailto:${this.contact.email}`;
  }

  ngOnDestroy() {
    this.styleSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
  }
}
