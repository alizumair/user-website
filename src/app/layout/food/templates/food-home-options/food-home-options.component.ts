import { Router } from '@angular/router';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-food-home-options',
  templateUrl: './food-home-options.component.html',
  styleUrls: ['./food-home-options.component.scss']
})
export class FoodHomeOptionsComponent implements OnInit {

  @Input() settings: AppSettings;
  @Input() style: StyleVariables;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  navigate(type) {
    switch (type) {
      case 0:
        this.router.navigate(['flavor-of-the-week']);
        break;
      case 1:
        this.router.navigate(['vendor-registration']);
        break;
      case 2:
        this.router.navigate(['agent-registration']);
        break;
      case 3:
        this.router.navigate(['group-ordering']);
        break;
      case 4:
        this.router.navigate(['catering']);
        break;
    }
  }

}
