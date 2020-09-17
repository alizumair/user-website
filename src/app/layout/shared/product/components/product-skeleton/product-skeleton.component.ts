import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { Component, OnInit, Input } from '@angular/core';


@Component({
  selector: 'app-product-skeleton',
  templateUrl: './product-skeleton.component.html',
  styleUrls: ['./product-skeleton.component.scss']
})
export class ProductSkeletonComponent implements OnInit {

  @Input() settings: AppSettings;

  @Input() style: StyleVariables;

  constructor() { }

  ngOnInit() { }

}
