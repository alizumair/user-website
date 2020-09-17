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
  selector: 'app-ecom-popular-products',
  templateUrl: './ecom-popular-products.component.html',
  styleUrls: ['./ecom-popular-products.component.scss']
})
export class EcomPopularProductsComponent implements OnInit {

  @Input() settings: AppSettings;
  @Input() style: StyleVariables;

  isLoading: boolean = false;

  cart: Array<any> = [];

  popularProducts: Array<any> = [];
  loggedIn: boolean = false;

  userSubscription: Subscription;
  cartSubscription: Subscription;
  currency = GlobalVariable.CURRENCY

  slideConfig = {
    'slidesToShow': 3,
    'slidesToScroll': 1,
    'dots': false,
    'arrows': true,
    'infinite': false
  };
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
    const queryParams: any = {
      latitude: this.utilityService.handler.latitude,
      longitude: this.utilityService.handler.longitude,
      languageId: this.utilityService.handler.languageId,
      // type: this.settings.app_type,
      offset: 0,
      limit: 8
    }

    if (this.settings.isCustomFlow) {
      let category = this.utilityService.getLocalData('selected_category', true);
      queryParams.categoryId = category.id;
    }

    this.isLoading = true;

    this.http.getData(ApiUrl.getPopularProduct, queryParams, true, true).subscribe((serverResponse) => {
      if (serverResponse && serverResponse.status == 200) {
        this.popularProducts = serverResponse.data.product.map((item) => {
          item['avg_rating'] = Number.parseFloat(item['avg_rating']).toFixed(1);
          item['image'] = this.utilityService.thumbnail(item['image_path']);
          item['selectedQuantity'] = 0;

          if (this.cart.length) {
            this.cart.forEach(cartProduct => {
              if (cartProduct.productId == item.product_id) {
                item['selectedQuantity'] = cartProduct['selectedQuantity'];
              }
            });
          }

          if (item['price_type']) {
            item['maxHour'] = item['hourly_price'][item['hourly_price'].length - 1]['max_hour'] - this.settings.interval;
            if (item['discount'] && item['hourly_price'][0]['discount_price']) {
              item['fixed_price'] = item['hourly_price'][0]['discount_price'];
              item['display_price'] = item['hourly_price'][0]['price_per_hour'];
              item['discountPercentage'] = parseFloat((((item.display_price - item.fixed_price) / item.display_price) * 100).toFixed(2));
            } else {
              item['fixed_price'] = item['hourly_price'][0]['price_per_hour'];
            }
          } else {
            this.utilityService.productPriceToFloat(item);
            item['discountPercentage'] = parseFloat((((item.display_price - item.fixed_price) / item.display_price) * 100).toFixed(2));
            item['discount'] = Math.round(item.discountPercentage);
          }
          return item;
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
      data.name = data.name.replace(/ &/g, '-');
      obj = { ...this.utilityService.handler, ...obj };
      this.router.navigate(['/products', 'product-detail', data.name], {
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
      width: '45%',
      showHeader: false,
      // contentStyle: { 'max-height': '350px', 'overflow': 'auto' },
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
