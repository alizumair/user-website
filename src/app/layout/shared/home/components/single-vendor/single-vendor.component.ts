import { DateService } from './../../../../../services/date/date.service';
import { PaginationModel } from './../../../../../shared/models/pagination.model';
import { Router } from '@angular/router';
import { ApiUrl } from './../../../../../core/apiUrl';
import { GlobalVariable } from './../../../../../core/global';
import { WINDOW } from './../../../../../services/window/window.service';
import { CartService } from './../../../../../services/cart/cart.service';
import { UserService } from './../../../../../services/user/user.service';
import { HttpService } from './../../../../../services/http/http.service';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Component, OnInit, OnDestroy, Inject, HostListener, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { _ } from 'underscore';
import { DOCUMENT } from "@angular/common";
import { DialogService } from 'primeng/dynamicdialog';
import { trigger, transition, style, animate } from '@angular/animations';
import { AddOnComponent } from '../../../product/components/add-on/add-on.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import * as moment from 'moment'

@Component({
  selector: 'app-single-vendor',
  templateUrl: './single-vendor.component.html',
  styleUrls: ['./single-vendor.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SingleVendorComponent implements OnInit, OnDestroy {

  @Input() offerData: any = [];

  styleSubscription: Subscription;
  settingsSubscription: Subscription;
  cartSubscription: Subscription;
  userSubscription: Subscription;
  getDataSubscription: Subscription;

  style: StyleVariables;
  settings: AppSettings;

  products: Array<any> = [];
  allProducts: Array<any> = [];
  categoryData: Array<any> = [];
  popularProducts: Array<any> = [];
  cart: Array<any> = [];
  supplierDetail: any;
  currency: string = '';
  supplierId: string = '';
  search: string = '';
  tabOffset: number = 0;

  loggedIn: boolean = false;
  hoverIndex: number = -1;
  categoryIndex: number = 0;

  pagePosition: object = {};

  productstate: any = {
    hideSupplier: true
  }

  pagination: PaginationModel;
  isLoading: boolean = false;

  slideConfig = {
    "slidesToShow": 5,
    "slidesToScroll": 1,
    "dots": true,
    "arrows": true,
    "infinite": false,
    "autoplay": true,
    "autoplaySpeed": 3000
  };

  constructor(
    public util: UtilityService,
    private http: HttpService,
    private user: UserService,
    public cartService: CartService,
    public dialogService: DialogService,
    private translate: TranslateService,
    private router: Router,
    private dateService: DateService,
    @Inject(DOCUMENT) private document,
    @Inject(WINDOW) private window: Window) {

    // this.currency = GlobalVariable.CURRENCY;
    this.pagination = new PaginationModel();
    this.pagination.perPage = 10;
    this.pagination.currentPage = 1;
    this.pagination.offset = 0;

    this.userSubscription = this.user.currentUser
      .subscribe(user => {
        if (!!user && user['access_token']) {
          this.loggedIn = true;
        } else {
          this.loggedIn = false;
        }
      });

    this.onResize()
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    let width = window.innerWidth;
    if (width <= 400) {
      this.slideConfig.slidesToShow = 1;
    } else if (width > 400 && width <= 812) {
      this.slideConfig.slidesToShow = 2;
    } else if (width > 812 && width <= 1024) {
      this.slideConfig.slidesToShow = 3;
    } else {
      this.slideConfig.slidesToShow = 5;
    }
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {

    for (let key in this.pagePosition) {
      this.pagePosition[key] = this.document.getElementById(key)
        ? this.pagePosition[key] < (this.document.getElementById(key).offsetTop - 180) ? this.document.getElementById(key).offsetTop - 180 : this.pagePosition[key]
        : null;
    }

    const positions = Object.keys(this.pagePosition);
    const lastIndex = positions.length - 1;
    const offset = this.window.pageYOffset - 650;

    for (let index = 0; index < positions.length; index++) {
      if (index === 0) {
        if (this.pagePosition[`${positions[index]}`] !== undefined &&
          offset < this.pagePosition[`${positions[index + 1]}`]) {
          this.categoryIndex = index;
          break;
        } else { continue; }
      } else if (index === lastIndex) {
        if (this.pagePosition[`${positions[lastIndex]}`] &&
          offset > this.pagePosition[`${positions[lastIndex]}`]) {
          this.categoryIndex = lastIndex;
          break;
        } else {
          continue;
        }
      } else {
        if (this.pagePosition[`${positions[index]}`]
          && offset > this.pagePosition[`${positions[index]}`] &&
          offset < this.pagePosition[`${positions[index + 1]}`]) {
          this.categoryIndex = index;
          break;
        }
      }
    }
  }

  ngOnInit() {

    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
      });

    this.cartSubscription = this.util.getCart.subscribe(cart => {
      if (cart) {
        this.cart = cart;
      }
    });

    this.getSettings();
    this.dataSubscribe();
    this.getCategories();
    this.getPopularProducts();
  }

  getCategories() {
    this.util.getLanguageCategoryData
      .subscribe(categories => {
        if (categories) {
          this.categoryData = (categories.english).slice();
        }
      })
  }

  dataSubscribe() {
    this.getDataSubscription = this.util.callGetData.
      subscribe((data) => {
        if (data) {
          this.currency = GlobalVariable.CURRENCY;
          this.getDetails();
        }
      });
  }

  getSettings() {
    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      });
  }

  getDetails() {
    this.isLoading = true;
    let param_data = {
      languageId: this.util.handler.languageId,
      supplier_id: this.settings.single_vendor_id,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude,
      offset: this.pagination.offset,
      limit: this.pagination.perPage
    }
    this.http.getData(ApiUrl.getSupplierDetailProduct, param_data)
      .subscribe(response => {

        if (!!response && response.data) {
          this.pagination.count = response.data.count;
          this.supplierDetail = response.data.supplier_detail;
          this.todaySupplierTimings();

          this.allProducts = new Array();
          this.allProducts.push(...response.data.product);
          if (this.offerData.length) {
            this.allProducts.unshift(
              {
                sub_cat_name: this.translate.instant('Special Offers'),
                value: this.offerData
              }
            );
          }
          this.allProducts.forEach(data => {
            if (!data.value || !data.value.length) return;
            data.value.map(product => {
              product['image'] = this.util.thumbnail(product['image_path']);
              if (product.display_price != product.fixed_price) {
                product["discount"] = Math.round(
                  ((product.display_price - product.fixed_price) / product.display_price) * 100
                );
              }
              product["selectedQuantity"] = 0;
              if (this.cart.length) {
                this.cart.forEach(cartProduct => {
                  if (cartProduct.productId == product.product_id) {
                    product['selectedQuantity'] = cartProduct['selectedQuantity'];
                    product['customization'] = cartProduct['customization'];
                  }
                });
              }
              this.util.productPriceToFloat(product);
              product["discount"] = Math.round(((product.display_price - product.fixed_price) / product.display_price) * 100);
            });
          });

          if (this.settings.isCustomFlow) {
            let selectedCat = this.util.getLocalData('selected_category', true);
            this.products = this.allProducts.filter(el => el.category_id == selectedCat.id);
          } else {
            this.products = this.allProducts.slice();
          }
          this.initialPagePosition();
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  initialPagePosition() {
    if (this.products && this.products.length) {
      for (let i = 0; i < this.products.length; i++) {
        this.pagePosition[`${i}`] = 0;
      }
    }
  }

  onImageLoad(product) {
    product.image = product.image_path;
  }

  categorySelect(index) {
    let el = this.document.getElementById(index);
    el.scrollIntoView({ behavior: "smooth" });
  }

  /********* Open Add On Dialog *********/
  openAddOnDialog(product) {
    const dialogRef = this.dialogService.open(AddOnComponent, {
      header: product['name'],
      width: '50%',
      showHeader: false,
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      data: {
        product: product,
        addOnItems: product['adds_on']
      }
    })
    dialogRef.onClose.subscribe(() => {
    })
  }

  addProduct(product) {
    if (product['adds_on'] && product['adds_on'].length && this.settings.app_type == 1) {
      this.openAddOnDialog(product);
    } else {
      this.cartService.addToCart(product, this.products);
    }
  }

  removeProduct(product) {
    if (product['customization'] && product['customization'].length) {
      this.openAddOnDialog(product);
    } else {
      this.cartService.removeFromCart(product)
    }
  }

  getPopularProducts() {
    const queryParams: any = {
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude,
      languageId: this.util.handler.languageId,
      // type: this.settings.app_type,
      offset: 0,
      limit: 8
    }

    this.isLoading = true;

    this.http.getData(ApiUrl.getPopularProduct, queryParams, true, true).subscribe((serverResponse) => {
      if (serverResponse && serverResponse.status == 200) {
        this.popularProducts = serverResponse.data.product.map((item) => {
          item['avg_rating'] = Number.parseFloat(item['avg_rating']).toFixed(1);
          item['image'] = this.util.thumbnail(item['image_path']);
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
            this.util.productPriceToFloat(item);
            item["discountPercentage"] = parseFloat((((item.display_price - item.fixed_price) / item.display_price) * 100).toFixed(2));
            item["discount"] = Math.round(item.discountPercentage);
          }
          return item;
        });

      }
      this.isLoading = false;
    }, (err) => this.isLoading = false);
  }

  todaySupplierTimings() {
    if (this.supplierDetail.timing && this.supplierDetail.timing.length) {
      const today = this.dateService.getDay(moment().format('dddd').toLowerCase())
      const todayTimes = this.supplierDetail.timing.find((i) => i.week_id == today);

      if (todayTimes) {
        let startTime = todayTimes.start_time.split(':');
        let endTime = todayTimes.end_time.split(':');

        const openingTime = moment().set('h', startTime[0]).set('m', startTime[1]).set('s', startTime[2]);
        const closeTime = moment().set('h', endTime[0]).set('m', endTime[1]).set('s', endTime[2])


        this.supplierDetail['todayTimes'] = {
          is_open: todayTimes.is_open,
          startTime: openingTime.format('LT'),
          endTime: closeTime.format('LT'),
          day: this.dateService.getDayName(today)
        }

        if (moment().isBefore(openingTime, 'm') || moment().isAfter(closeTime)) {
          this.supplierDetail['todayTimes']['is_open'] = 0;
        }

        this.productstate.hideQuantity = this.supplierDetail['todayTimes']['is_open'] == 0 ? true : false;
      }
    }
  }


  supplierList(category: any) {
    // const queryParams = { cat_id: category.id, cat_name: category.name }
    // if (category.menu_type == 1 && category.sub_category && category.sub_category.length) {
    //   queryParams['n_lvl'] = 1
    // }
    // let queryParams = { supplierId:  }
    // this.router.navigate(['/products/listing'], { queryParams });
    // let queryParams = {
    //   supplierId: this.settings.single_vendor_id,
    //   cat_id: category.id
    // }
    // this.router.navigate(["products/listing"], {
    //   queryParams: queryParams
    // });

    let seoValue = (category.name).replace(/ &/g, '-');
    let param_obj = {};
    Object.assign(param_obj, this.util.handler);
    param_obj['subCatId'] = [category.id];
    param_obj['category'] = category.id;
    param_obj['path'] = [category.name];
    param_obj['supplierId'] = [this.settings.single_vendor_id];
    param_obj['multi_b'] = this.supplierDetail.is_multi_branch;
    this.router.navigate(['/products', 'product-listing', seoValue], {
      queryParams: { f: this.util.encryptData(param_obj) }
    });
  }

  pageChange(event) {
    this.pagination.currentPage = event;
    this.pagination.offset = event > 1 ? (event - 1) * this.pagination.perPage : 0;
    this.getDetails();
    this.window.scrollTo(0, 350);
    // this.categorySelect(1);
  }

  ngOnDestroy() {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
    if (!!this.getDataSubscription) this.getDataSubscription.unsubscribe();
    if (!!this.cartSubscription) this.cartSubscription.unsubscribe();
    if (!!this.userSubscription) this.userSubscription.unsubscribe();
    let componentInstance = this.dialogService.dialogComponentRef;
    if (componentInstance) {
      componentInstance.destroy()
    }
  }

}
