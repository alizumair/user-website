import { Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { UtilityService } from './../../../../services/utility/utility.service';
import { GlobalVariable } from './../../../../core/global';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { Component, OnInit, Input } from '@angular/core';
import { EmailComponent } from './../../../../layout/shared/layout-shared/components/email/email.component';

@Component({
  selector: 'app-food-footer',
  templateUrl: './food-footer.component.html',
  styleUrls: ['./food-footer.component.scss']
})
export class FoodFooterComponent implements OnInit {

  @Input() settings: AppSettings;
  @Input() style: StyleVariables;
  siteName: string = '';
  registrationUrl: string = '';
  image_paths: string = '';
  is_new_badge: boolean = false;

  contact: {
    phoneNumber: string;
    email: string;
    country: string
  };

  appLink: {
    android: string,
    ios: string;
  }

  constructor(
    public util: UtilityService,
    public dialogService: DialogService,
    public router: Router
  ) {

    this.siteName = GlobalVariable.SITE_NAME;
    this.registrationUrl = `${GlobalVariable.admin_domain}/#!/supplier-registration`;

    this.contact = {
      phoneNumber: GlobalVariable.PHONE_NUMBER,
      email: GlobalVariable.EMAIL,
      country: GlobalVariable.COUNTRY
    }

    this.style = new StyleVariables();

    if(GlobalVariable.SECRET_DB_KEY === 'd1fda7d1a7680267aaefb8d6c8c320b5') {
      this.is_new_badge = true;
    }
  }

  ngOnInit() {
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
