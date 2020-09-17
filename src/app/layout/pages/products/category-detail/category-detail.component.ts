import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-detail',
  templateUrl: './category-detail.component.html',
  styleUrls: ['./category-detail.component.scss']
})
export class CategoryDetailComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  cat_Id = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.subscription = this.route.queryParams
      .subscribe(params => {
        if (params.cat_id) {
          this.cat_Id = JSON.parse(params.cat_id);
          console.log(typeof params.cat_id, params.cat_id);
          
        }
      });
  }

  /********* Unsubscribe Subscriptions **********/
  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }

}
