import { SeoService } from './../../services/seo/seo.service';
import { AppSettings } from './../../shared/models/appSettings.model';
import { UtilityService } from './../../services/utility/utility.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  settings: AppSettings;

  constructor(
    private util: UtilityService,
    private seo: SeoService
  ) { }

  ngOnInit() {
    this.getSettings();
    this.seo.setDefault();
  }

  getSettings() {
    this.util.getSettings.subscribe((settings: AppSettings) => {
      if(!!settings) {
        this.settings = settings;
      }
    });
  }

}
