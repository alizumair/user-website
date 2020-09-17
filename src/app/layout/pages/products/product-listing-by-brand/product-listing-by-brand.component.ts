import { GlobalVariable } from './../../../../core/global';
import { Router } from '@angular/router';
import { ApiUrl } from './../../../../core/apiUrl';
import { DialogService } from 'primeng/dynamicdialog';
import { UserService } from './../../../../services/user/user.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { HttpService } from './../../../../services/http/http.service';
import { CartService } from './../../../../services/cart/cart.service';
import { Subscription } from 'rxjs';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input } from '@angular/core';
import { AddOnComponent } from './../../../../layout/shared/product/components/add-on/add-on.component';

@Component({
  selector: 'app-product-listing-by-brand',
  templateUrl: './product-listing-by-brand.component.html',
  styleUrls: ['./product-listing-by-brand.component.scss']
})
export class ProductListingByBrandComponent implements OnInit {

  @Input() settings: AppSettings;
  @Input() style: StyleVariables;
  @Input() brandId: string = '';

  isLoading: boolean = false;

  cart: Array<any> = [];

  sameBrandProducts: Array<any> = [];
  loggedIn: boolean = false;

  userSubscription: Subscription;
  cartSubscription: Subscription;
  currency = GlobalVariable.CURRENCY

  constructor(
    private cartService: CartService,
    public utilityService: UtilityService,
    private http: HttpService,
    private userService: UserService,
    public dialogService: DialogService,
    public router: Router
  ) { }

  ngOnInit() {
    this.cartSubscription = this.utilityService.getCart.subscribe(cart => {
      if (cart) {
        this.cart = cart;
      }
    });

    this.userSubscription = this.userService.currentUser
      .subscribe(user => {
        if (!!user && user['access_token']) {
          this.loggedIn = true;
        } else {
          this.loggedIn = false;
        }
      });

    this.fetch();
  }

  fetch() {
    let brand_ids = [];
    brand_ids.push(this.brandId);
    const param_data: any = {
      latitude: this.utilityService.handler.latitude,
      longitude: this.utilityService.handler.longitude,
      languageId: this.utilityService.handler.languageId,
      // type: this.settings.app_type,
      offset: 0,
      limit: 4,
      subCategoryId: [],
      supplier_ids: [],
      variant_ids: [],
      need_agent: 0,
      is_availability: 1,
      brand_ids,
      is_discount: 0,
      low_to_high: 1,
      max_price_range: 50000,
      min_price_range: 0
    }

    this.isLoading = true;

    this.isLoading = true;
    this.http.postData(ApiUrl.filterProducts, param_data, false)
      .subscribe((response: any) => {
        if (!!response && response.data) {
          this.sameBrandProducts = response.data.product;
          this.sameBrandProducts.map(data => {
            this.utilityService.productPriceToFloat(data);
            data['avg_rating'] = Number.parseFloat(data['avg_rating']).toFixed(1);
            data['discount_price'] = Math.round(((data.display_price - data.fixed_price) / data.display_price) * 100);
            data['selectedQuantity'] = 0;
            if (data['price_type']) {
              data['maxHour'] = data['hourly_price'][data['hourly_price'].length - 1]['max_hour'] - this.settings.interval;
              if (data['discount'] && data['hourly_price'][0]['discount_price']) {
                data['fixed_price'] = data['hourly_price'][0]['discount_price'];
                data['display_price'] = data['hourly_price'][0]['price_per_hour'];
                data['discount_price'] = Math.round(((data['hourly_price'][0]['price_per_hour'] - data['hourly_price'][0]['discount_price']) / data['hourly_price'][0]['price_per_hour']) * 100);
              } else {
                data['fixed_price'] = data['hourly_price'][0]['price_per_hour'];
              }
            }
            if (this.cart.length) {
              this.cart.forEach(cartProduct => {
                if (cartProduct.productId == data.product_id) {
                  data['selectedQuantity'] = cartProduct['selectedQuantity'];
                  if (data['price_type']) {
                    data['fixed_price'] = cartProduct['fixed_price'];
                  }
                  if (!!cartProduct['customization']) {
                    data['customization'] = cartProduct['customization'];
                  }
                }
              });
            }
          });
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  addProduct(product) {
    if (product.adds_on && product.adds_on.length && this.settings.app_type == 1) {
      this.openAddOnDialog(product);
    } else {
      this.cartService.addToCart(product);
      return;
    }

  }

  removeProduct(product) {
    let item = this.cart.find(p => p.productId == product.product_id);
    if (item['customization'] && item['customization'].length) {
      this.openAddOnDialog(product);
    } else {
      this.cartService.removeFromCart(product)
    }
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
      this.router.navigate(["/", this.settings.app_type, "products", "product-detail", data.name], {
        queryParams: { f: this.utilityService.encryptData(obj) }
      });
    }
  }

  /********* Open Add On Dialog *********/

  openAddOnDialog(product) {
    let item = this.cart.find(p => p.productId == product.product_id);
    if (item) {
      product.customization = item.customization;
    }

    const dialogRef = this.dialogService.open(AddOnComponent, {
      header: product['name'],
      width: '50%',
      showHeader: false,
      // contentStyle: { "max-height": "350px", "overflow": "auto" },
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',

      data: {
        product: Object.assign({}, product),
        addOnItems: product['adds_on']
      }
    })

    dialogRef.onClose.subscribe(() => {
      if (product.customization && product.customization.length) {
        delete product.customization;
      }
    })
  }

}

