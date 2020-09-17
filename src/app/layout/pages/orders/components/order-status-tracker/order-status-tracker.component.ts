import { Component, OnInit, Input } from '@angular/core';
import { AppSettings } from '../../../../../shared/models/appSettings.model';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { UtilityService } from '../../../../../services/utility/utility.service';

@Component({
  selector: 'app-order-status-tracker',
  templateUrl: './order-status-tracker.component.html',
})
export class OrderStatusTrackerComponent implements OnInit {

  @Input() settings: AppSettings;

  @Input() style: StyleVariables;

  @Input() order: any = {};

  constructor(
    public util: UtilityService
  ) { }

  ngOnInit() {
  }
  

}
