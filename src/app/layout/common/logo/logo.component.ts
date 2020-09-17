import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppSettings } from '../../../shared/models/appSettings.model';
import { UtilityService } from '../../../services/utility/utility.service';
import { GlobalVariable } from '../../../core/global';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss']
})
export class LogoComponent implements OnInit, OnDestroy {

  logoText: string = '';

  settings: AppSettings;

  settingsSubscription: Subscription;

  @Input() width: any;
  @Input() height: any;
  @Input() logoColor: any;
  @Input() logoPadding: any;
  @Input() logoRadius: any = 5; 


  constructor(
    private util: UtilityService
  ) {
    this.logoText = GlobalVariable.SITE_NAME;
  }

  ngOnInit() {
    this.settingsSubscription = this.util.getSettings.subscribe((settings: AppSettings) => {
      if (!!settings) {
        this.settings = settings;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription) this.settingsSubscription.unsubscribe();
  }

}
