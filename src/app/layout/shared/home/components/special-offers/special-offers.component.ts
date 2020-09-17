import { ApiUrl } from './../../../../../core/apiUrl';
import { GlobalVariable } from './../../../../../core/global';
import { LocalizationPipe } from './../../../../../shared/pipes/localization.pipe';
import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { UserService } from './../../../../../services/user/user.service';
import { CartService } from './../../../../../services/cart/cart.service';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { HttpService } from './../../../../../services/http/http.service';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from "@angular/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { DialogService } from 'primeng/dynamicdialog';
import { AddOnComponent } from '../../../product/components/add-on/add-on.component';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: "app-special-offers",
  templateUrl: "./special-offers.component.html",
  styleUrls: ["./special-offers.component.scss"],

})
export class SpecialOffersComponent implements OnInit, OnChanges, OnDestroy {

  @Input() offerData: any = [];

  @Input() isLoading: boolean = false;

  style: StyleVariables;
  styleSubscription: Subscription;
  getDataSubscribe: Subscription;
  settingsSubscription: Subscription;
  cartSubscription: Subscription;
  userSubscription: Subscription;
  themeSubscription: Subscription;

  specialOffers: any = [];
  currency: string = "";
  allOffers: boolean = false;
  hoverIndex: number = -1;
  settings: AppSettings;
  cart: Array<any> = [];
  loggedIn: boolean = false;
  isDarkTheme: boolean = false;

  productstate: any = {
    is_pointer: true
  }

  timeInterval: number = 0;

  constructor(
    private http: HttpService,
    public util: UtilityService,
    private router: Router,
    public cartService: CartService,
    public dialogService: DialogService,
    private user: UserService,
    private message: MessagingService,
    private localization: LocalizationPipe,
    private translate: TranslateService
  ) {
    this.currency = GlobalVariable.CURRENCY;

    this.style = new StyleVariables();
    if (this.router.url == "/all-discounted-products") {
      this.allOffers = true;
    }

    this.userSubscription = this.user.currentUser
      .subscribe(user => {
        if (!!user && user['access_token']) {
          this.loggedIn = true;
        } else {
          this.loggedIn = false;
        }
      });
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe(
      (style: StyleVariables) => {
        this.style = style;
      }
    );

    this.settingsSubscription = this.util.getSettings.subscribe(
      (settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
          this.timeInterval = this.settings.interval;
          this.productstate.hideSupplier = !!this.settings.is_single_vendor;
          if (settings.app_type == 1) {
            this.productstate.is_pointer = false;
          }
        }
      }
    );

    this.cartSubscription = this.util.getCart.subscribe(cart => {
      if (cart) {
        this.cart = cart;
        this.mapData(this.offerData);
        this.specialOffers = this.offerData;
      }
    });

    this.themeSubscription = this.util.getDarkTheme.subscribe((darkTheme) => {
      this.isDarkTheme = darkTheme;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.offerData && changes.offerData.currentValue) {
      this.mapData(this.offerData);
      this.specialOffers = this.offerData;
    }
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
      this.router.navigate(["/products", "product-detail", data.name], {
        queryParams: { f: this.util.encryptData(obj) }
      });
    }
  }

  getAllOffers() {
    this.isLoading = true;

    let params = {
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude,
      self_pickup: this.util.handler.selfPickup
    };
    this.http.postData(ApiUrl.getAllOffers, params).subscribe(response => {
      if (!!response && response.data) {
        this.offerData = response.data.list;
        this.mapData(this.offerData);
      }
      this.isLoading = false;
    }, err => {
      this.isLoading = false;
    });
  }

  onImageLoad(offer) {
    offer.image = offer.image_path;
  }

  mapData(offerData: Array<any>): Array<any> {
    if (!offerData || !offerData.length) {
      return offerData;
    }

    offerData.map((offer: any) => {
      offer['avg_rating'] = Number.parseFloat(offer['avg_rating']).toFixed(1);
      offer['image'] = this.util.thumbnail(offer['image_path']);
      offer["selectedQuantity"] = 0;
      if (this.cart.length) {
        this.cart.forEach(cartProduct => {
          if (cartProduct.productId == offer.product_id) {
            offer['selectedQuantity'] = cartProduct['selectedQuantity'];
          }
        });
      }
      if (offer['price_type']) {
        offer['maxHour'] = offer['hourly_price'][offer['hourly_price'].length - 1]['max_hour'] - this.timeInterval;
        if (offer['discount'] && offer['hourly_price'][0]['discount_price']) {
          offer['fixed_price'] = offer['hourly_price'][0]['discount_price'];
          offer['display_price'] = offer['hourly_price'][0]['price_per_hour'];
          offer['discount_price'] = Math.round(((offer['hourly_price'][0]['price_per_hour'] - offer['hourly_price'][0]['discount_price']) / offer['hourly_price'][0]['price_per_hour']) * 100);
          offer["discountPercentage"] = parseFloat((((offer.display_price - offer.fixed_price) / offer.display_price) * 100).toFixed(2));
        } else {
          offer['fixed_price'] = offer['hourly_price'][0]['price_per_hour'];
        }
      } else {
        this.util.productPriceToFloat(offer);
        offer["discountPercentage"] = parseFloat((((offer.display_price - offer.fixed_price) / offer.display_price) * 100).toFixed(2));
        offer["discount"] = Math.round(offer.discountPercentage);
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
      this.message.alert('warning', `${this.translate.instant('Please Login First')}!`);
      return;
    }
    let param_data = {
      status: +status,
      product_id: detail.id
    }
    this.http.postData(ApiUrl.addToWishlist, param_data, true)
      .subscribe(response => {
        if (!!response && response.data) {
          this.message.toast('success', `${this.localization.transform('products')} ${this.translate.instant('Has Been Successfully')} ${status ? this.translate.instant('Added To') : this.translate.instant('Removed From')} ${this.localization.transform('wishlist')}`);
          detail.is_favourite = status;
        }
      });
  }

  onSeeMore() {
    this.router.navigate(['/products', 'all-discounted-products'])
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
