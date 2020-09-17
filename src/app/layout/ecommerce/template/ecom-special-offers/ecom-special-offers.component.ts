import { TranslateService } from '@ngx-translate/core';
import { ApiUrl } from './../../../../core/apiUrl';
import { GlobalVariable } from './../../../../core/global';
import { LocalizationPipe } from './../../../../shared/pipes/localization.pipe';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { UserService } from './../../../../services/user/user.service';
import { DialogService } from 'primeng/dynamicdialog';
import { CartService } from './../../../../services/cart/cart.service';
import { Router } from '@angular/router';
import { UtilityService } from './../../../../services/utility/utility.service';
import { HttpService } from './../../../../services/http/http.service';
import { Subscription } from 'rxjs';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { AddOnComponent } from './../../../../layout/shared/product/components/add-on/add-on.component';

@Component({
  selector: 'app-ecom-special-offers',
  templateUrl: './ecom-special-offers.component.html',
  styleUrls: ['./ecom-special-offers.component.scss']
})
export class EcomSpecialOffersComponent implements OnInit {

  @Input() offerData: any = [];
  @Input() settings: AppSettings;
  @Input() style: StyleVariables;
  @Input() isLoading: boolean = false;

  getDataSubscribe: Subscription;
  cartSubscription: Subscription;
  userSubscription: Subscription;
  themeSubscription: Subscription;

  specialOffers: any = [];
  currency: string = "";
  allOffers: boolean = false;
  hoverIndex: number = -1;
  cart: Array<any> = [];
  loggedIn: boolean = false;
  isDarkTheme: boolean = false;

  isLoading1: boolean = false;

  productstate: any = {
    is_pointer: true
  };

  timeInterval: number = 0;
  slideConfig = {
    'slidesToShow': 3,
    'slidesToScroll': 1,
    'dots': false,
    'arrows': true,
    'infinite': false
  };

  constructor(
    private translate: TranslateService,
    private http: HttpService,
    public util: UtilityService,
    private router: Router,
    public cartService: CartService,
    public dialogService: DialogService,
    private user: UserService,
    private message: MessagingService,
    private localization: LocalizationPipe
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
    this.timeInterval = this.settings.interval;
    this.productstate.hideSupplier = !!this.settings.is_single_vendor;
    if (this.settings.app_type == 1) {
      this.productstate.is_pointer = false;
    }

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
    this.isLoading1 = true;
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
      this.isLoading1 = false;
    }, err => {
      this.isLoading1 = false;
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
          this.message.toast('success', `${this.localization.transform('products')} ${this.translate.instant('Has Been Successfully')} ${status ? this.translate.instant('Added To') : this.translate.instant('Removed From')} ${this.localization.transform('wishlist')}`);
          detail.is_favourite = status;
        }
      });
  }

  onSeeMore() {
    this.router.navigate(['/', 'products', 'all-discounted-products'])
  }

}
