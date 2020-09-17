import { SeoService } from './../../../../services/seo/seo.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpService } from '../../../../services/http/http.service';
import { ApiUrl } from '../../../../core/apiUrl';
import { UtilityService } from '../../../../services/utility/utility.service';
import { Subscription } from 'rxjs';
import { PaginationModel } from '../../../../shared/models/pagination.model';
import { StyleVariables } from '../../../../core/theme/styleVariables.model';
import { AppSettings } from '../../../../shared/models/appSettings.model';
import { CartService } from '../../../../services/cart/cart.service';
import { Router } from '@angular/router';
import { GlobalVariable } from '../../../../core/global';
import { UserService } from '../../../../services/user/user.service';
import { DataCacheService } from '../../../../services/data-cache/data-cache.service';
import { DialogService } from 'primeng/dynamicdialog';
import { AddOnComponent } from '../../../shared/product/components/add-on/add-on.component';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss']
})
export class WishlistComponent implements OnInit, OnDestroy {

  isLoading: boolean = false;
  isloggedIn: boolean = false;
  noData: boolean = false;
  products: Array<any> = [];
  currency: string = '';
  cart: Array<any> = [];

  pagination: PaginationModel;
  settings: AppSettings;
  style: StyleVariables;

  dataSubscription: Subscription;
  styleSubscription: Subscription;
  settingsSubscription: Subscription;
  cartSubscription: Subscription;
  userSubscription: Subscription;


  constructor(
    private http: HttpService,
    public util: UtilityService,
    private userService: UserService,
    public cartService: CartService,
    private cacheService: DataCacheService,
    public dialogService: DialogService,
    private seo: SeoService,
    private router: Router) {

    this.pagination = new PaginationModel();
    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit() {
    this.seo.updateTitle(`Wishlist | ${GlobalVariable.SITE_NAME}`);

    this.styleSubscription = this.util.getStyles
      .subscribe(style => {
        this.style = style;
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      });

    this.cartSubscription = this.util.getCart.subscribe(cart => {
      if (cart) {
        this.cart = cart;
      }
    });

    this.userSubscription = this.userService.currentUser.subscribe((user) => {
      if (!!user) {
        this.isloggedIn = true;
      }
    })

    this.subscribeData();
  }

  subscribeData() {
    this.dataSubscription = this.util.callGetData.subscribe(showData => {
      if (showData) {
        this.getWishlist();
      }
    });
  }

  getWishlist() {
    let param_data = {
      language_id: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    }
    this.isLoading = true;
    this.http.getData(ApiUrl.getWishList, param_data)
      .subscribe(response => {
        if (!!response && response.data) {
          this.products = response.data;
          this.products.map(data => {
            this.util.productPriceToFloat(data);
            data['discount_price'] = Math.round(((data.display_price - data.fixed_price) / data.display_price) * 100);
            data['selectedQuantity'] = 0;
            if (data['price_type']) {
              data['maxHour'] = data['hourly_price'][data['hourly_price'].length - 1]['max_hour'];
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
                }
              });
            }
          });
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
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

  addProduct(product) {

    if (product.adds_on && product.adds_on.length) {
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

  /********* Product detail **********/
  productDetail(data: any) {
    let obj = {
      productId: data.product_id,
      supplierBranchId: data.supplier_branch_id,
      category: data['category_id']
    }
    data.name = data.name.replace(/ &/g, '-');
    obj = { ...this.util.handler, ...obj };
    this.router.navigate(['products/product-detail', data.name], {
      queryParams: { f: this.util.encryptData(obj) }
    });
  }

  onFavourite(productId: string) {
    this.products = this.products.filter((product) => product.product_id !== productId);
    this.cacheService.removeKey(ApiUrl.getSpecialOffers);
    this.cacheService.removeKey(ApiUrl.getPopularProduct);
  }

  ngOnDestroy() {
    if (!!this.dataSubscription) this.dataSubscription.unsubscribe();
    if (!!this.styleSubscription) this.dataSubscription.unsubscribe();
    if (!!this.dataSubscription) this.settingsSubscription.unsubscribe();
    if (!!this.cartSubscription) this.dataSubscription.unsubscribe();
    if (!!this.userSubscription) this.dataSubscription.unsubscribe();
  }
}
