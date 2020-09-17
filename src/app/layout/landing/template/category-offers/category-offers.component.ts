import { ThemeService } from './../../../../services/theme/theme.service';
import { Router } from '@angular/router';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { CartService } from './../../../../services/cart/cart.service';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { UtilityService } from './../../../../services/utility/utility.service';
import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-category-offers',
  templateUrl: './category-offers.component.html',
  styleUrls: ['./category-offers.component.scss']
})
export class CategoryOffersComponent implements OnInit, OnChanges {

  @Input() offerCategories: Array<any> = [];
  @Input() settings: AppSettings;
  @Input() style: StyleVariables;

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private cartService: CartService,
    private utilityService: UtilityService
  ) { }


  ngOnInit() {
    this.mapData();
  }

  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    this.mapData();
  }


  mapData() {
    this.offerCategories.map(category => {
      category.value.map((offer: any) => {
        offer['avg_rating'] = Number.parseFloat(offer['avg_rating']).toFixed(1);
        offer['image'] = this.utilityService.thumbnail(offer['image_path']);
        offer["selectedQuantity"] = 0;
        // if (this.cart.length) {
        //   this.cart.forEach(cartProduct => {
        //     if (cartProduct.productId == offer.product_id) {
        //       offer['selectedQuantity'] = cartProduct['selectedQuantity'];
        //     }
        //   });
        // }
        if (offer['price_type']) {
          offer['maxHour'] = offer['hourly_price'][offer['hourly_price'].length - 1]['max_hour'] - this.settings.interval;
          if (offer['discount'] && offer['hourly_price'][0]['discount_price']) {
            offer['fixed_price'] = offer['hourly_price'][0]['discount_price'];
            offer['display_price'] = offer['hourly_price'][0]['price_per_hour'];
            offer['discount_price'] = Math.round(((offer['hourly_price'][0]['price_per_hour'] - offer['hourly_price'][0]['discount_price']) / offer['hourly_price'][0]['price_per_hour']) * 100);
            offer["discountPercentage"] = parseFloat((((offer.display_price - offer.fixed_price) / offer.display_price) * 100).toFixed(2));
          } else {
            offer['fixed_price'] = offer['hourly_price'][0]['price_per_hour'];
          }
        } else {
          this.utilityService.productPriceToFloat(offer);
          offer["discountPercentage"] = parseFloat((((offer.display_price - offer.fixed_price) / offer.display_price) * 100).toFixed(2));
          offer["discount"] = Math.round(offer.discountPercentage);
        }
      });
    })
  }

  onViewDetail(data: any) {
    const category = this.utilityService.getLocalData('selected_category', true) || {};
    category.type = data.type;
    this.utilityService.setLocalData('selected_category', category, true);

    this.utilityService.clearLocalData('ques_data');
    this.cartService.emptyCart();
    let obj = {
      productId: data.parent_id || data.product_id,
      supplierBranchId: data.supplier_branch_id,
      category: data.category_id
    };
    data.name = data.name.replace(/ &/g, "-");
    obj = { ...this.utilityService.handler, ...obj };
    this.router.navigate(["/", "products", "product-detail", data.name], {
      queryParams: { f: this.utilityService.encryptData(obj) }
    }).then(() => {
      this.settings.app_type = category.type;
      this.utilityService.setSettings(this.settings);
      this.themeService.setStyles();
    });
  }


  onViewAll(data: any) {
    const category = this.utilityService.getLocalData('selected_category', true) || {};
    category.type = data.type;
    this.utilityService.setLocalData('selected_category', category, true);
    this.router.navigate(['/products', 'all-discounted-products']).then(() => {
      this.settings.app_type = category.type;
      this.utilityService.setSettings(this.settings);
      this.themeService.setStyles();
    });
  }

}
