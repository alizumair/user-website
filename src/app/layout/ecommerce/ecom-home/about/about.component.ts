import { Component, OnInit, Input } from '@angular/core';
import { StyleVariables } from '../../../../core/theme/styleVariables.model';
import { AppSettings } from '../../../../shared/models/appSettings.model';
import { GlobalVariable } from '../../../../core/global';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  @Input() settings: AppSettings;
  @Input() style: StyleVariables;
  site_name: string = GlobalVariable.SITE_NAME;

  constructor() { }

  ngOnInit() {
  }

}
