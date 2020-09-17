import { GlobalVariable } from './../../../../core/global';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-food-banner',
  templateUrl: './food-banner.component.html',
  styleUrls: ['./food-banner.component.scss']
})
export class FoodBannerComponent {

  @Input() settings: AppSettings;
  @Input() style: StyleVariables;

  is_mobile: boolean = GlobalVariable.IS_MOBILE;

  constructor() {}

}
