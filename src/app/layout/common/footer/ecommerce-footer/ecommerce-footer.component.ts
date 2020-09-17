import { GlobalVariable } from './../../../../core/global';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { Component, OnInit, Input } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { EmailComponent } from './../../../../layout/shared/layout-shared/components/email/email.component';

@Component({
  selector: 'app-ecommerce-footer',
  templateUrl: './ecommerce-footer.component.html',
  styleUrls: ['./ecommerce-footer.component.scss']
})
export class EcommerceFooterComponent implements OnInit {

  @Input() settings: AppSettings;
  @Input() style: StyleVariables;

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

  siteName: string = '';
  registrationUrl: string = '';

  constructor(
    public dialogService: DialogService,

  ) { }

  ngOnInit() {
    this.siteName = GlobalVariable.SITE_NAME;
    this.registrationUrl = `${GlobalVariable.admin_domain}/#!/supplier-registration`;

    this.contact = {
      phoneNumber: GlobalVariable.PHONE_NUMBER,
      email: GlobalVariable.EMAIL,
      country: GlobalVariable.COUNTRY
    }

    this.image_paths = this.settings.site_logo;
    this.appLink = {
      android: this.settings.android_app_url,
      ios: this.settings.ios_app_url
    }
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

}
