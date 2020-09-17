import { transition } from '@angular/animations';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { HttpService } from './../../../../services/http/http.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from './../../../../services/cart/cart.service';
import { DialogService } from 'primeng/dynamicdialog';
import { UserService } from './../../../../services/user/user.service';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { GlobalVariable } from './../../../../core/global';
import { ApiUrl } from './../../../../core/apiUrl';
import { LocalizationPipe } from './../../../../shared/pipes/localization.pipe';
import { AddOnComponent } from './../../../../layout/shared/product/components/add-on/add-on.component';
import { TranslateService } from '@ngx-translate/core';
import { DataCacheService } from './../../../../services/data-cache/data-cache.service';

@Component({
  selector: 'app-discounted-products',
  templateUrl: './discounted-products.component.html',
  styleUrls: ['./discounted-products.component.scss']
})
export class DiscountedProductsComponent implements OnInit, OnDestroy {

  @Input() categoryId: any;

  style: StyleVariables;
  styleSubscription: Subscription;
  getDataSubscribe: Subscription;
  settingsSubscription: Subscription;
  cartSubscription: Subscription;
  userSubscription: Subscription;
  themeSubscription: Subscription;

  specialOffers: any = [];
  currency = '';
  allOffers = false;
  noData = false;
  settings: AppSettings;
  cart: Array<any> = [];
  loggedIn: boolean = false;
  isDarkTheme: boolean = false;

  isLoading: boolean = true;
  productFor: number; // 0 popular prod,1 spl offer.
  constructor(
    private http: HttpService,
    public util: UtilityService,
    private route: ActivatedRoute,
    private router: Router,
    public cartService: CartService,
    public dialogService: DialogService,
    private user: UserService,
    private message: MessagingService,
    private localization: LocalizationPipe,
    private translate: TranslateService,
    private data_cache: DataCacheService
  ) {
    this.style = new StyleVariables();

    this.userSubscription = this.user.currentUser
      .subscribe(user => {
        if (!!user && user['access_token']) {
          this.loggedIn = true;
        } else {
          this.loggedIn = false;
        }
      });
    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe(
      (style: StyleVariables) => {
        this.style = style;
      }
    );

    this.cartSubscription = this.util.getCart.subscribe(cart => {
      if (cart) {
        this.cart = cart;
      }
    });

    this.settingsSubscription = this.util.getSettings.subscribe(
      (settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      }
    );

    this.themeSubscription = this.util.getDarkTheme.subscribe((darkTheme) => {
      this.isDarkTheme = darkTheme;
    });
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams.type) {
      this.productFor = queryParams.type;
      }
      this.makeSubscribe();
    });
  }

  productDetail(data: any) {
    if (this.settings.app_type != 1) {
      let obj = {
        productId: data.product_id,
        supplierBranchId: data.supplier_branch_id,
        category: data.category_id
      };
      data.name = data.name.replace(/ &/g, "-");
      obj = { ...this.util.handler, ...obj };
      this.router.navigate(['/products', 'product-detail', data.name], {
        queryParams: { f: this.util.encryptData(obj) }
      });
    }
  }

  makeSubscribe() {
    this.getDataSubscribe = this.util.callGetData.subscribe(data => {
      if (data) {
        this.getAllOffers();
      }
    });
  }

  getAllOffers() {
    this.isLoading = true;
    const params = {
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    };
    let apiPath = '';
    let objForRes = '';
    if (this.settings.selected_template == 3 && this.categoryId) {
      this.data_cache.removeKey(this.productFor == 1 ? ApiUrl.getSpecialOffers : ApiUrl.getPopularProduct);
      params['categoryId'] = this.categoryId;
    }
    console.log(this.productFor);
    switch (this.productFor) {
      case 1:
        apiPath = ApiUrl.getSpecialOffers;
        objForRes = 'offerEnglish';
        break;

      default:
        apiPath = ApiUrl.getPopularProduct;
        objForRes = 'product';
        break;
    }
    console.log(apiPath,objForRes);
    this.http.getData(apiPath, params, true, true).subscribe(response => {
      this.noData = true;
      this.isLoading = false;

      if (!!response && response.data) {
        this.specialOffers = this.mapData(response.data[objForRes]);
      }
    }, (err) => this.isLoading = false);
  }

  onImageLoad(offer) {
    offer.image = offer.image_path;
  }

  mapData(offerData: Array<any>): Array<any> {
    offerData.map((offer: any) => {
      offer['avg_rating'] = Number.parseFloat(offer['avg_rating']).toFixed(1);
      offer['image'] = this.util.thumbnail(offer['product_image']);
      offer["selectedQuantity"] = 0;
      if (this.cart.length) {
        this.cart.forEach(cartProduct => {
          if (cartProduct.productId == offer.product_id) {
            offer['selectedQuantity'] = cartProduct['selectedQuantity'];
          }
        });
      }
      if (offer["price_type"]) {
        try {
          offer["fixed_price"] = JSON.parse(offer.fixed_price);
          let price = offer.fixed_price[0];
          offer["discount"] = Math.round(
            ((price.price_per_hour - price.discount_price) /
              price.price_per_hour) *
            100
          );
        } catch (err) {
          console.log(err);
        }
      } else {
        this.util.productPriceToFloat(offer);
        offer["discount"] = Math.round(
          ((offer.display_price - offer.fixed_price) / offer.display_price) * 100
        );
      }
    });
    return offerData;
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
        product: product,
        addOnItems: product['adds_on']
      }
    })

    dialogRef.onClose.subscribe(() => {
      if (product.customization && product.customization.length) {
        delete product.customization;
        this.router.navigate(['/cart']);
      }
    })
  }

  addProduct(product) {
    if (product.adds_on && product.adds_on.length && this.settings.app_type == 1) {
      this.openAddOnDialog(product);
    } else {
      this.cartService.addToCart(product, this.specialOffers.slice(0, 24));
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

  wishlist(status, detail) {
    if (!this.loggedIn) {
      this.message.alert('warning', this.translate.instant('Please Login First'));
      return;
    }
    let param_data = {
      status: +status,
      product_id: detail.id
    }
    this.http.postData(ApiUrl.addToWishlist, param_data, true)
      .subscribe(response => {
        if (!!response && response.data) {
          this.message.toast('success', `${this.localization.transform('product')} ${this.translate.instant('Has Been Successfully')} ${status ? this.translate.instant('Added To') : this.translate.instant('Removed From')} ${this.localization.transform('wishlist')}`);
          detail.is_favourite = status;
        }
      });
  }

  ngOnDestroy() {
    if (!!this.userSubscription) this.userSubscription.unsubscribe();
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.getDataSubscribe) this.getDataSubscribe.unsubscribe();
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
    if (!!this.themeSubscription) this.themeSubscription.unsubscribe();

    let componentInstance = this.dialogService.dialogComponentRef;
    if (componentInstance) {
      componentInstance.destroy()
    }
  }

}
