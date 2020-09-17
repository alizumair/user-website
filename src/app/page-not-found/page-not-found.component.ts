import { AppLoadService } from './../services/app-load/app-load.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { AppSettings } from '../shared/models/appSettings.model';
import { UtilityService } from '../services/utility/utility.service';

@Component({
  selector: "app-page-not-found",
  templateUrl: "./page-not-found.component.html",
  styleUrls: ["./page-not-found.component.scss"]
})
export class PageNotFoundComponent implements OnInit, OnDestroy {

  settings: AppSettings;
  settingsSubscription: Subscription;
  settingsLoaded: boolean = false;
  public site_logo: string = '/assets/images/emoji.png';

  constructor(
    public router: Router,
    private appInitService: AppLoadService,
    private util: UtilityService) { }

  ngOnInit() {
    if (this.util.getLocalData('site_logo')) {
      this.site_logo = this.util.getLocalData('site_logo');
    }

    this.settingsSubscription = this.util.getSettings
      .subscribe(settings => {
        this.settingsLoaded = !!settings;
      });
  }

  toHome() {
    if (this.settingsLoaded) {
      this.router.navigate(['']);
    } else {
      this.appInitService.init().then(
        (val) => {
          console.log('welcome')
          this.router.navigate(['']);
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  ngOnDestroy() {
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
  }
}
