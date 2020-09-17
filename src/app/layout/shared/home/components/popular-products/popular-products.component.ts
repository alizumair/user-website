import { DataCacheService } from './../../../../../services/data-cache/data-cache.service';
import { skip } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { ApiUrl } from './../../../../../core/apiUrl';
import { UserService } from './../../../../../services/user/user.service';
import { HttpService } from './../../../../../services/http/http.service';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { CartService } from './../../../../../services/cart/cart.service';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { AddOnComponent } from '../../../product/components/add-on/add-on.component';

@Component({
  selector: 'app-popular-products',
  templateUrl: './popular-products.component.html',
  styleUrls: ['./popular-products.component.scss']
})
export class PopularProductsComponent implements OnInit, OnDestroy {

  isLoading: boolean = false;

  cart: Array<any> = [];
  categories: Array<any> = [];

  popularProducts: Array<any> = [];
  loggedIn: boolean = false;

  settings: AppSettings;
  style: StyleVariables;

  styleSubscription: Subscription;
  settingSubscription: Subscription;
  userSubscription: Subscription;
  cartSubscription: Subscription;
  categorySubscription: Subscription;
  locationSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private cartService: CartService,
    public utilityService: UtilityService,
    private http: HttpService,
    private userService: UserService,
    private data_cache: DataCacheService,
    public dialogService: DialogService

  ) {
    this.style = new StyleVariables();
  }

  ngOnInit(): void {

    this.styleSubscription = this.utilityService.getStyles.subscribe((style: StyleVariables) => {
      this.style = style;
    })

    this.settingSubscription = this.utilityService.getSettings.subscribe((settings: AppSettings) => {
      if (settings) {
        this.settings = settings;
      }
    })

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


    this.categorySubscription = this.utilityService.getLanguageCategoryData.subscribe((data) => {
      if (data && data.english) {
        this.categories = data.english;
        this.fetch();
      }
    });

    this.locationSubscription = this.utilityService.getUserLocation.pipe(skip(1)).subscribe((location) => {
      this.data_cache.removeKey(ApiUrl.getPopularProduct);
      this.fetch();
    });

  }

  fetch() {
    const queryParams: any = {
      latitude: this.utilityService.handler.latitude,
      longitude: this.utilityService.handler.longitude,
      languageId: this.utilityService.handler.languageId,
      offset: 0,
      limit: 10
    }

    if (this.settings.isCustomFlow) {
      let category = this.utilityService.getLocalData('selected_category', true);
      queryParams.categoryId = category.id;
    }

    this.isLoading = true;

    this.http.getData(ApiUrl.getPopularProduct, queryParams, true, !this.settings.isCustomFlow).subscribe((serverResponse) => {
      if (serverResponse && serverResponse.status == 200) {
        this.popularProducts = serverResponse.data.product.map((item) => {
          item['avg_rating'] = Number.parseFloat(item['avg_rating']).toFixed(1);
          item['image'] = this.utilityService.thumbnail(item['image_path']);
          item["selectedQuantity"] = 0;

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
              item["discountPercentage"] = parseFloat((((item.display_price - item.fixed_price) / item.display_price) * 100).toFixed(2));
            } else {
              item['fixed_price'] = item['hourly_price'][0]['price_per_hour'];
            }
          } else {
            this.utilityService.productPriceToFloat(item);
            item["discountPercentage"] = parseFloat((((item.display_price - item.fixed_price) / item.display_price) * 100).toFixed(2));
            item["discount"] = Math.round(item.discountPercentage);
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

  ngOnDestroy(): void {
    if (this.styleSubscription) this.styleSubscription.unsubscribe();
    if (this.settingSubscription) this.settingSubscription.unsubscribe();
    if (this.userSubscription) this.userSubscription.unsubscribe();
    if (this.categorySubscription) this.categorySubscription.unsubscribe();
    if(this.locationSubscription) this.locationSubscription.unsubscribe();
  }

}
