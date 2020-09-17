import { AppSettings } from './../../../../shared/models/appSettings.model';
import { GlobalVariable } from './../../../../core/global';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input, Inject, EventEmitter, Output } from '@angular/core';
import { WINDOW } from './../../../../services/window/window.service';


@Component({
  selector: 'app-landing-footer',
  templateUrl: './landing-footer.component.html',
  styleUrls: ['./landing-footer.component.scss']
})
export class LandingFooterComponent implements OnInit {

  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Output() onHelp: EventEmitter<any> = new EventEmitter<any>();

  registrationUrl: string = '';
  siteName: string = '';
  image_paths: string = '';

  contact: {
    phoneNumber: string;
    email: string;
    country: string
  };

  appLink: {
    android: string,
    ios: string;
  }

  constructor(@Inject(WINDOW) private window: Window) {
    this.contact = {
      phoneNumber: GlobalVariable.PHONE_NUMBER,
      email: GlobalVariable.EMAIL,
      country: GlobalVariable.COUNTRY
    }
  }

  ngOnInit() {
    this.registrationUrl = `${GlobalVariable.admin_domain}/#!/supplier-registration`;
    if (!!this.settings) {
      this.settings = this.settings;
      this.image_paths = this.settings.site_logo;
      this.appLink = {
        android: this.settings.android_app_url,
        ios: this.settings.ios_app_url
      }
    }
  }
  mailTo() {
    this.window.location.href = `mailto:${this.contact.email}`;
  }

}
