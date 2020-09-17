import { Component, OnInit, Input } from '@angular/core';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { AppSettings } from '../../../../../shared/models/appSettings.model';
import { UtilityService } from '../../../../../services/utility/utility.service';

@Component({
  selector: 'app-order-list-item-skeleton',
  templateUrl: './order-list-item-skeleton.component.html',
  styleUrls: ['./order-list-item-skeleton.component.scss']
})
export class OrderListItemSkeletonComponent implements OnInit {

  @Input() style: StyleVariables;

  @Input() settings: AppSettings;

  constructor(
    public util: UtilityService
  ) { }

  ngOnInit() {
  }

}
