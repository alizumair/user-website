import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ecom-banner',
  templateUrl: './ecom-banner.component.html',
  styleUrls: ['./ecom-banner.component.scss']
})
export class EcomBannerComponent {

  @Input() settings: AppSettings;
  @Input() style: StyleVariables;  

}
