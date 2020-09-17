import { CartService } from './../../../../services/cart/cart.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { Router } from '@angular/router';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-ecom-recently-viewed',
  templateUrl: './ecom-recently-viewed.component.html',
  styleUrls: ['./ecom-recently-viewed.component.scss']
})
export class EcomRecentlyViewedComponent implements OnInit {

  @Input() settings: AppSettings;
  @Input() style: StyleVariables;
  @Input() isLoading: boolean;
  @Input() recentlyViewed: Array<any>;

  slideConfig = {
    'slidesToShow': 3,
    'slidesToScroll': 1,
    'dots': false,
    'arrows': true,
    'infinite': false
  };

  constructor(
    private router: Router,
    private utilityService: UtilityService,
    private cartService: CartService
  ) { }

  ngOnInit() {
  }

  addProduct(product) {
    this.cartService.addToCart(product);
  }

  removeProduct(product) {
      this.cartService.removeFromCart(product)
  }

  productDetail(data: any) {
    if (this.settings.app_type != 1) {
      let obj = {
        productId: data.parent_id || data.product_id,
        supplierBranchId: data.supplier_branch_id,
        category: data.category_id
      };
      data.name = data.name.replace(/ &/g, "-");
      obj = { ...this.utilityService.handler, ...obj };
      this.router.navigate(["/products", "product-detail", data.name], {
        queryParams: { f: this.utilityService.encryptData(obj) }
      });
    }
  }

}
