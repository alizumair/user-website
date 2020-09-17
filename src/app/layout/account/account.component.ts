import { Component, OnInit, OnDestroy } from '@angular/core';
import { StyleVariables } from '../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { UtilityService } from '../../services/utility/utility.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {

  style: StyleVariables;
  styleSubscription: Subscription;


  constructor(
    private util: UtilityService,
  ) {
    this.style = new StyleVariables();
   }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe(style => {
      this.style = style;
    });
  }

  ngOnDestroy() {
    this.styleSubscription.unsubscribe();
  }

}
