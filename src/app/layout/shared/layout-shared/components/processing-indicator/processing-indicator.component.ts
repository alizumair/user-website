import { UtilityService } from './../../../../../services/utility/utility.service';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-processing-indicator',
  templateUrl: './processing-indicator.component.html',
  styleUrls: ['./processing-indicator.component.scss']
})
export class ProcessingIndicatorComponent implements OnInit {

  style: StyleVariables;

  settings: AppSettings;

  @Input() loaderImage: string = '';

  @Input() width: string = '250';

  @Input() height: string = '250';

  @Input() message: string = '';

  styleSubscription: Subscription;
  settingsSubscription: Subscription;

  constructor(
    private util: UtilityService
  ) {
    this.style = new StyleVariables();
  }

  ngOnInit() {

    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      });

    if (!this.loaderImage) {
      this.initLoaderImage();
    }
  }

  initLoaderImage(): void {
    switch (this.settings.app_type) {
      case 1:
        this.loaderImage = 'food_loader';
      default:
        this.loaderImage = ''
    }
  }



}
