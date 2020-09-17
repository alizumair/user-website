import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { FiltersModel } from './../../../../shared/models/filters.model';
import { Router } from '@angular/router';
import { UtilityService } from './../../../../services/utility/utility.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AppSettings } from './../../../../shared/models/appSettings.model';

@Component({
  selector: 'app-ecom-brands',
  templateUrl: './ecom-brands.component.html',
  styleUrls: ['./ecom-brands.component.scss']
})
export class EcomBrandsComponent implements OnInit, OnDestroy {

  @Input() style: StyleVariables;
  @Input() settings: AppSettings;

  dataSubscription: Subscription;
  filters: FiltersModel;
  brands: Array<any> = [];
  slideConfig = {
    'slidesToShow': 4,
    'slidesToScroll': 1,
    'dots': false,
    'arrows': true,
    'infinite': false
  };
  constructor(
    private util: UtilityService,
    private router: Router
  ) {

    this.filters = new FiltersModel();
  }

  ngOnInit() {

    this.getBrands();
  }

  getBrands() {
    this.dataSubscription = this.util.getLanguageCategoryData
      .subscribe(
        data => {
          if (data) {
            let brands = data['brands'].slice();
            if (brands.length) {
              if(brands.length < 7) {
                this.brands = brands.splice(0, 12);
              } else {
                this.brands = [{class: 'col-md-7'}, {class: 'col-md-5'}, {class: 'col-md-4'}, {class: 'col-md-4'}, {class: 'col-md-4'}, {class: 'col-md-5'}, {class: 'col-md-7'}];
                this.brands.map((brand, index) => {
                  Object.assign(brand, brands[index]);
                  // brand['image'] = brands[index];
                });
              }
              console.log(this.brands)
            }
          }
        });
  }

  productListing(brand) {
    this.filters.brand_ids = [brand.id];
    this.util.setFilters(this.filters);
    let param_obj = this.util.handler;
    this.router.navigate(['products/product-listing', brand.name.replace(/ &/g, '-')], {
      queryParams: { f: this.util.encryptData(param_obj) },
      queryParamsHandling: 'merge'
    });
  }

  ngOnDestroy() {
    if (!!this.dataSubscription) this.dataSubscription.unsubscribe();
  }
}
