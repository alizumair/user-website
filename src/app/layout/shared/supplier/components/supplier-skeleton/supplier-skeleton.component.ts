import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-supplier-skeleton',
  templateUrl: './supplier-skeleton.component.html',
  styleUrls: ['./supplier-skeleton.component.scss']
})
export class SupplierSkeletonComponent implements OnInit {

  @Input() settings: AppSettings;
  
  @Input()  style: StyleVariables;

  constructor() { }

  ngOnInit() {
  }

}
