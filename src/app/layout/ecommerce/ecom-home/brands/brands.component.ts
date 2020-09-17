import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { AppSettings } from '../../../../shared/models/appSettings.model';
import { StyleVariables } from '../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { UtilityService } from '../../../../services/utility/utility.service';
import { FiltersModel } from '../../../../shared/models/filters.model';
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit, OnChanges, OnDestroy {

  style: StyleVariables;
  styleSubscription: Subscription;
  dataSubscription: Subscription;
  settingsSubscription: Subscription;
  brands: Array<any> = [];
  settings: AppSettings;
  filters: FiltersModel;

  slideConfig = {
    "slidesToShow": 3,
    "slidesToScroll": 3,
    "dots": true,
    "arrows": false,
    "infinite": true,
    "autoplay": true,
    "autoplaySpeed": 3000
  };

  constructor(
    private util: UtilityService,
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.filters = new FiltersModel();
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        this.settings = settings;
      });

    this.getBrands();
  }

  ngOnChanges() {
  }

  getBrands() {
    this.dataSubscription = this.util.getLanguageCategoryData
      .subscribe(
        data => {
          if (data) {
            let brands = data['brands'].slice();
            if (brands.length) {
              this.brands = brands.splice(0, 12);
              if (this.settings.isCustomFlow) {
                let categoryId = this.route.snapshot.queryParams['cat_flow_id'];
                this.brands = this.brands.filter(brand => !!brand.cat_id && brand.cat_id == categoryId);
              }
            }
          }
        });
  }

  productListing(brand) {
    this.filters.brand_ids = [brand.id];
    this.util.setFilters(this.filters);
    let param_obj = this.util.handler;
    this.router.navigate(['/products/product-listing', brand.name.replace(/ &/g, '-')], {
      queryParams: { f: this.util.encryptData(param_obj) },
      queryParamsHandling: 'merge'
    });
  }

  ngOnDestroy() {
    if (!!this.dataSubscription) this.dataSubscription.unsubscribe();
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
  }

}
