import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../shared/models/appSettings.model';

@Component({
  selector: 'app-ecom-about',
  templateUrl: './ecom-about.component.html',
  styleUrls: ['./ecom-about.component.scss']
})
export class EcomAboutComponent implements OnInit {

  @Input() style: StyleVariables;
  @Input() settings: AppSettings;

  appLink: {
    android: string,
    ios: string;
  }

  constructor() { }

  ngOnInit() {
    this.appLink = {
      android: this.settings.android_app_url,
      ios: this.settings.ios_app_url
    }
  }

}
