import { SeoService } from './../../../../services/seo/seo.service';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleConstants } from './../../../../core/theme/styleConstants.model';
import { ApiUrl } from './../../../../core/apiUrl';
import { UtilityService } from './../../../../services/utility/utility.service';
import { HttpService } from './../../../../services/http/http.service';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { PaginationModel } from './../../../../shared/models/pagination.model';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from './../../../../services/cart/cart.service';
import { WINDOW } from './../../../../services/window/window.service';
import { FiltersModel } from './../../../../shared/models/filters.model';
import { DialogService } from 'primeng/dynamicdialog';
import { UserService } from './../../../../services/user/user.service';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import * as moment from 'moment';
import { RentalSearch } from './../../../../shared/models/rentalSearch.model';
import { LocalizationPipe } from './../../../../shared/pipes/localization.pipe';
import { GlobalVariable } from './../../../../core/global';
import { trigger, transition, style, animate } from '@angular/animations';
import { QuestionsComponent } from './../../../../layout/shared/layout-shared/components/questions/questions.component';
import { AddOnComponent } from './../../../../layout/shared/product/components/add-on/add-on.component';
import { TranslateService } from '@ngx-translate/core';
declare var  dataLayer;

@Component({
  selector: 'app-product-listing',
  templateUrl: './product-listing.component.html',
  styleUrls: ['./product-listing.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ProductListingComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  private getDataSubscribe: Subscription;
  private styleSubscription: Subscription;
  private filterSubscription: Subscription;
  private cartSubscription: Subscription;
  settingsSubscription: Subscription;
  routeSubscription: Subscription;
  userSubscription: Subscription;
  themeSubscription: Subscription;
  categorySubscription: Subscription;

  pagination: PaginationModel;
  style: StyleVariables;
  btnInverse: StyleConstants;
  btn: StyleConstants;
  settings: AppSettings;

  supplierData: any = {};
  branchId: string = "";
  showSupplier: boolean = false;
  loggedIn: boolean = false;
  userToken: string = "";
  isShowFilters: boolean = true;

  productList: Array<any> = [];
  subCategoryIds: Array<any> = [];
  subCategories: Array<any> = [];
  selectedCatIds: Array<any> = [];
  path: Array<any> = [];
  cart: Array<any> = [];
  showSubCat: boolean = false;
  subCatIndex: number = 0;


  showFilter: object = {};
  filterData: any = {};
  currency: string = '';
  searchedVal: string = '';
  hoverIndex: any = '';
  categoryId: any;
  supplierIds: any;
  need_agent: any = 0;
  noData: boolean = false;
  is_filter: boolean = true;
  timeInterval: number = 0;

  rental_search: RentalSearch;

  isDarkTheme: boolean = false;
  isLoading: boolean = false;
  isProcessing: boolean = false;

  categoryFlowId: any = '';

  productstate: any = {
    hideSupplier: false
  }

  showBranches: boolean = false;

  is_multi_branch: number = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    public util: UtilityService,
    private router: Router,
    private user: UserService,
    private message: MessagingService,
    public cartService: CartService,
    public dialogService: DialogService,
    private localization: LocalizationPipe,
    private translate: TranslateService,
    private seo: SeoService,
    @Inject(WINDOW) private window: Window) {

    this.pagination = new PaginationModel();
    this.btnInverse = new StyleConstants();
    this.btn = new StyleConstants();
    this.filterData = new FiltersModel();
    this.rental_search = new RentalSearch();


    this.userSubscription = this.user.currentUser.subscribe(user => {
      if (!!user && user["access_token"]) {
        this.userToken = user["access_token"];
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
    });
    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit() {
    this.seo.updateTitle(`${this.localization.transform('products')} | ${GlobalVariable.SITE_NAME}`);

    this.styleSubscription = this.util.getStyles
      .subscribe(style => {
        this.style = style;
        this.btnInverse.color = style.primaryColor;
        this.btnInverse.backgroundColor = '#ffffff';
        this.btnInverse.borderColor = style.primaryColor;
        this.btn.color = '#ffffff';
        this.btn.backgroundColor = style.primaryColor;
        this.btn.borderColor = style.primaryColor;
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.timeInterval = settings['interval'];
          this.settings = settings;
          this.productstate.hideSupplier = !!this.settings.is_single_vendor;
        }
      });

    this.categorySubscription = this.util.getLanguageCategoryData.subscribe((data) => {
      if (data && data.english) {
        if (this.settings.isCustomFlow) {
          const category = data.english.find(c => c.type == this.settings['app_type']);
          this.categoryFlowId = this.util.getSelectedCategory() || category.id;
        }
      }
    });

    this.cartSubscription = this.util.getCart.subscribe(cart => {
      if (cart) {
        this.cart = cart;
      }
    });

    this.themeSubscription = this.util.getDarkTheme.subscribe((darkTheme) => {
      this.isDarkTheme = darkTheme;
    });

    this.makeSubscribe();
  }

  getLocalData() {
    if (this.showSupplier && this.settings.app_type == 8) {
      this.showSubCat = true;
    }
  }

  onImageLoad(category) {
    category["display_image"] = category["image"];
  }

  onSubCatSelect(subCatData: any, append: boolean) {
    this.selectedCatIds.push(subCatData["id"]);
    if (subCatData["is_subcategory"]) {
      let param_data = {
        categoryId: subCatData.id || subCatData['category_id'],
        languageId: this.util.handler.languageId,
        supplierId: this.supplierData['id']
      };

      this.isProcessing = true;
      this.http.postData(ApiUrl.getSubcategory, param_data, true)
        .subscribe(response => {
          if (!!response && response.data) {
            response.data.map(data => {
              data["id"] = data["sub_category_id"];
            });
            this.subCategories.push(response.data);
            if (append) {
              this.subCatIndex++;
            }
          }
          this.isProcessing = false;
        });
    } else {
      if (subCatData.is_question) {
        const dialogRef = this.dialogService.open(QuestionsComponent, {
          width: '60%',
          showHeader: false,
          transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
          data: {
            cat_id: subCatData['id'] || subCatData['category_id'],
          }
        });

        dialogRef.onClose.subscribe((navigate: boolean) => {
          if (navigate) {
            this.subCategoryIds = [subCatData['id'] || subCatData['category_id']];
            setTimeout(() => {
              this.showSubCat = false;
            }, 500);
            if (this.settings.branch_flow == 0 || (this.settings.branch_flow == 1 && this.is_multi_branch == 0)) {
              this.filterProducts(false);
            }
          }
        });
      } else {
        this.subCategoryIds = [subCatData['id'] || subCatData['category_id']];

        this.showSubCat = false;
        if (this.settings.branch_flow == 0 || (this.settings.branch_flow == 1 && this.is_multi_branch == 0)) {
          this.filterProducts(false);
        }

      }
    }
  }

  /********* Supplier Detail *********/

  getSupplierDetail() {
    let obj = {
      languageId: this.util.handler.languageId,
      branchId: this.branchId,
      supplierId: this.supplierIds[0],
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    };

    if (this.categoryId) {
      obj['categoryId'] = this.categoryId.split(',')[0];
    } else {
      obj['categoryId'] = '1';
    }

    if (this.loggedIn) {
      obj["accessToken"] = this.userToken;
    }

    this.http.postData(ApiUrl.getSupplierDetail, obj).subscribe(response => {
      if (!!response && response.data) {
        this.supplierData = { ...this.supplierData, ...response.data };
        this.seo.updateTitle(`${this.supplierData.name ? this.supplierData.name : ''} | ${this.localization.transform('products')} | ${GlobalVariable.SITE_NAME}`);

        this.is_multi_branch = this.supplierData.is_multi_branch;
        if (this.settings.app_type == 8 && this.settings.branch_flow == 1 && this.is_multi_branch == 1) {
          this.showBranches = true;
        }

        this.supplierData.business_start_date = new Date(
          this.supplierData.business_start_date
        ).getFullYear();
        this.supplierData["images"] = [];
        if (this.supplierData.supplier_image && this.supplierData.supplier_image.length) {
          this.supplierData.supplier_image.forEach(image => {
            this.supplierData["images"].push({
              image: image,
              display_image: this.util.thumbnail(image)
            });
          });
        }
        this.subCategories.push(this.supplierData.category);
      }
    });
  }

  /********* Wait till true is returned **********/
  makeSubscribe() {
    this.getDataSubscribe = this.util.callGetData
      .subscribe((showData) => {
        if (showData) {
          this.subscribeRoute();
        }
      });
  }

  /********* Route Subscription **********/
  subscribeRoute() {
    this.subscription = this.route.queryParams
      .subscribe(_params => {
        if (_params.f) {
          let params = this.util.decryptData(_params.f);
          this.showFilter = {
            show: true,
            catId: params['category'],
            subCatIds: params['subCatId']
          };
          this.categoryId = params['category'] || params['categoryId'] || null;
          this.searchedVal = params.product ? params.product : null;
          this.subCategoryIds = params.subCatId ? params.subCatId : [];
          this.supplierIds = params.supplierId ? params.supplierId : [];
          this.path = params.path ? params.path : [];
          this.showSupplier = params["showSupplier"];
          this.branchId = params["branch_id"];
          this.need_agent = parseFloat(params['agent']);

          if (this.settings.app_type === 5) {
            this.rental_search.pick_up_latitude = parseFloat(params['lat']);
            this.rental_search.pick_up_longitude = parseFloat(params['lng']);
            this.rental_search.booking_from_date = moment.unix(params.from).format('YYYY-MM-DD HH:mm:ss');
            this.rental_search.booking_to_date = moment.unix(params.to).format('YYYY-MM-DD HH:mm:ss');
            this.rental_search.need_agent = parseFloat(params['agent']);
          }

          if (this.path.length) {
            this.seo.updateTitle(`${this.path[this.path.length - 1]} | ${GlobalVariable.SITE_NAME}`);
          }

          this.getLocalData();

          if (params['multi_b'] == 1) {
            this.is_multi_branch = 1;
            this.showBranches = true;
          } else {
            this.getFilters();
          }

          if (this.showSupplier) {
            this.getSupplierDetail();
          }
        }
      });
  }

  getFilters() {
    this.filterSubscription = this.util.getFilters
      .subscribe(filterData => {
        if (filterData) {
          this.filterData = filterData;
          if (!this.showSubCat) {
            this.filterProducts(false);
          }
          this.isShowFilters = true;
        }
      });
  }

  setFilter($event) {
    // setTimeout(() => {
    //   this.isShowFilters = true;
    // }, 0)
  }

  /********* Get filtered product list **********/
  filterProducts(is_page_change: boolean) {
    this.showBranches = false;
    this.isLoading = true;
    if (!is_page_change) {
      this.pagination.currentPage = 1;
      this.pagination.offset = 0;
    }
    this.showFilter['filter'] = {
      variant_ids: this.filterData.variant_ids,
      brand_ids: this.filterData.brand_ids,
    };

    this.noData = false;

    let param_data = { ...this.filterData };
    param_data['languageId'] = this.util.handler.languageId;
    if (!param_data.subCategoryId.length) {
      param_data['subCategoryId'] = this.subCategoryIds;
    }
    param_data['offset'] = this.pagination.offset;
    param_data['limit'] = this.pagination.perPage;
    param_data['latitude'] = this.util.handler.latitude;
    param_data['longitude'] = this.util.handler.longitude;
    param_data['need_agent'] = this.need_agent || 0;

    if (this.searchedVal) param_data['product_name'] = this.searchedVal;
    if (this.supplierIds) param_data['supplier_ids'] = this.supplierIds;

    if (this.settings.app_type === 5) {
      param_data['latitude'] = this.rental_search.pick_up_latitude;
      param_data['longitude'] = this.rental_search.pick_up_longitude;
      param_data['booking_from_date'] = this.rental_search.booking_from_date;
      param_data['booking_to_date'] = this.rental_search.booking_to_date;
      param_data['need_agent'] = this.rental_search.need_agent;
    }
    
    if(param_data['low_to_high'] == -1 && this.settings.no_default_product_sort == 1) {
      delete param_data['low_to_high'];
    }

    // if (this.settings.isCustomFlow) {
    //   param_data['categoryId'] = Number(this.categoryFlowId);
    // }

    // if (this.settings.app_type == 1) {
    //   param_data['is_discount'] = 2;
    // }

    this.http.postData(ApiUrl.filterProducts, param_data, false)
      .subscribe((response: any) => {
        this.productList = [];
        if (!!response && response.data) {
          this.addProductsToGoogleDataLayer(response.data);
          this.pagination.count = response.data.count;
          this.productList = response.data.product;
          this.productList.map(data => {
            this.util.productPriceToFloat(data);
            data['avg_rating'] = Number.parseFloat(data['avg_rating']).toFixed(1);
            data['discount_price'] = Math.round(((data.display_price - data.fixed_price) / data.display_price) * 100);
            data['selectedQuantity'] = 0;
            if (data['price_type']) {
              data['maxHour'] = data['hourly_price'][data['hourly_price'].length - 1]['max_hour'] - this.timeInterval;
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
        this.noData = true;
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  addProductsToGoogleDataLayer(productArray) {
    if (!productArray.count) {
      return;
    }
    let item = [];

    productArray.product.forEach((product,i) => {
      item.push({
        item_name: product.name,
        item_id: product.product_id,
        index: i,
        price: product.discount ? product.display_price : product.fixed_price,
        item_list_name: 'Search Results',
        img: product.image_path
      });
    });

    dataLayer.push({
      event: 'view_item_list',
      ecommerce: {
        items: item
      }
    });
  }

  /********* On Page Change **********/
  pageChange(event) {
    this.pagination.currentPage = event;
    this.pagination.offset = event > 1 ? (event - 1) * this.pagination.perPage : 0;
    this.filterProducts(true);
    this.window.scrollTo(0, 0);
  }

  /********* Product detail **********/
  productDetail(data: any) {
    let obj = {
      productId: data.product_id,
      supplierBranchId: data.supplier_branch_id,
      category: this.categoryId
    }
    data.name = data.name.replace(/ &/g, '-');
    obj = { ...this.util.handler, ...obj };
    this.router.navigate(['/products', 'product-detail', data.name], {
      queryParams: { f: this.util.encryptData(obj) }
    });
  }

  back() {
    if (this.subCatIndex > 0) {
      this.subCategories.splice(this.subCatIndex, 1);
      this.subCatIndex--;
    }
  }

  /********* Open Add On Dialog *********/

  openAddOnDialog(product) {
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
        // this.router.navigate(['/', this.settings.app_type, 'cart']);
      }
    })
  }

  addProduct(product) {
    if (product['is_product_adds_on'] !== 1) {
      this.cartService.addToCart(product, this.productList);
      return;
    }

    this.openAddOnDialog(product);
  }

  removeProduct(product) {
    if (product['customization'] && product['customization'].length) {
      this.openAddOnDialog(product);
    } else {
      this.cartService.removeFromCart(product)
    }
  }

  addRemoveFavourites(is_favourite) {
    if (!this.loggedIn) {
      this.message.alert('warning', this.translate.instant('Please Login To Continue'));
      return;
    }
    let url: string = '';
    if (is_favourite) {
      url = ApiUrl.favourite.removeFromFavourites
    } else {
      url = ApiUrl.favourite.addToFavourites
    }
    let form_data = {
      supplierId: this.supplierIds[0],
      accessToken: this.user.getUserToken
    }
    this.http.postData(url, form_data, true)
      .subscribe(response => {
        if (!!response && response.data) {
          this.message.toast('success', `${this.localization.transform('supplier')} ${is_favourite ? this.translate.instant('Removed From') : this.translate.instant('Added To')} ${this.translate.instant('Favourites')}`);
          this.supplierData['Favourite'] = !is_favourite;
        }
      });
  }

  onServiceAddOrRemove(service: any, value: number): void {

    if ((this.settings.laundary_service_flow == 1 || this.settings.hideAgentList == 1) && service['price_type'] == 0 && this.settings.app_type == 8) {
      if (value > 0) {
        this.cartService.addToCart(service);
      } else {
        this.cartService.removeFromCart(service);
      }

    } else {
      if (value < 0 && service.selectedQuantity <= 0) {
        return;
      }

      if (service.selectedQuantity * this.timeInterval >= service.maxHour && value > 0) {
        this.message.alert('info', this.translate.instant('Maximum Limit Reached'));
        return;
      }

      if (service['price_type']) {
        if (value > 0)
          service.selectedQuantity += service.duration / this.timeInterval;
        else
          service.selectedQuantity -= service.duration / this.timeInterval;
      } else {
        if (value > 0) {
          service.selectedQuantity = ++service.selectedQuantity;
        } else {
          service.selectedQuantity = --service.selectedQuantity;
        }
      }
      this.cartService.calculateProductHourlyPrice(service);
    }

  }

  onBookNow(service: any) {
    if ((this.settings.laundary_service_flow == 1 || this.settings.hideAgentList == 1) && service['price_type'] == 0 && this.settings.app_type == 8) {
      if (service.selectedQuantity > 0) {
        this.router.navigate(['cart']);
      } else {
        this.cartService.addToCart(service, null, true);
      }
    } else {
      if (this.settings.product_detail == 1) {
        this.productDetail(service);
        return;
      }
      if (!this.util.getLocalData('ques_data') && service.is_question) {
        // this.util.clearLocalData('ques_data');
        this.cartService.emptyCart();
        this.openQuestions(service);
      } else {
        this.toAgentList(service);
      }
    }
  }

  toAgentList(service: any) {
    if (!this.loggedIn) {
      this.util.authToggle.next(true);
      return;
    }

    const url: any = this.router.url;
    this.util.setRedirectUrl(url);

    if (!service.selectedQuantity) {
      if (service['price_type']) {
        service.selectedQuantity += service.duration / this.timeInterval;
      } else {
        service.selectedQuantity = 1;
      }
    }


    this.util.setLocalData('selected_service', service, true);

    let params = {
      isPkg: '0',
      service_ids: service.id || service.product_id
    };
    this.router.navigate(['/', 'cart', 'agent'], {
      queryParams: params
    });
  }

  addToCart(service) {
    if (service['price_type'] && !service.selectedQuantity) {
      service.selectedQuantity += service.duration / this.timeInterval;
    }
    this.cartService.addToCart(service, null, true);
  }

  openQuestions(service): void {
    const dialogRef = this.dialogService.open(QuestionsComponent, {
      width: '60%',
      showHeader: false,
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      data: {
        cat_id: service['detailed_sub_category_id'] || service['sub_category_id'] || service['categories_id'] || service['category_id'],
      }
    });

    dialogRef.onClose.subscribe((navigate: boolean) => {
      if (navigate) {
        // this.toAgentList(service);
        if ((this.settings.laundary_service_flow == 1 || this.settings.hideAgentList == 1) && service['price_type'] == 0 && this.settings.app_type == 8) {
          this.cartService.addToCart(service);
        } else {
          this.toAgentList(service);
        }
      }
    });
  }

  wishlist(product, status) {
    if (!this.loggedIn) {
      this.message.alert('warning', 'please login first');
      return;
    }
    let param_data = {
      status: +status,
      product_id: product.id || product.product_id
    }
    this.http.postData(ApiUrl.addToWishlist, param_data, true)
      .subscribe(response => {
        if (!!response && response.data) {
          this.message.toast('success', `${this.localization.transform('product')} ${this.translate.instant('Has Been Successfully')} ${status ? this.translate.instant('Added To') : this.translate.instant('Removed From')} ${this.localization.transform('wishlist')}`);
          product.is_favourite = status;
        }
      });
  }

  /********* Unsubscribe Subscriptions **********/
  ngOnDestroy() {
    let ele = document.getElementById('searchText');
    if (!!ele) ele['value'] = '';

    if (this.subscription) this.subscription.unsubscribe();
    if (this.getDataSubscribe) this.getDataSubscribe.unsubscribe();
    if (this.styleSubscription) this.styleSubscription.unsubscribe();
    if (this.filterSubscription) this.filterSubscription.unsubscribe();
    if (this.cartSubscription) this.cartSubscription.unsubscribe()
    if (this.settingsSubscription) this.settingsSubscription.unsubscribe();
    if (!!this.routeSubscription) this.routeSubscription.unsubscribe();
    if (!!this.themeSubscription) this.themeSubscription.unsubscribe();
    if (!!this.categorySubscription) this.themeSubscription.unsubscribe();

    let componentInstance = this.dialogService.dialogComponentRef;
    if (componentInstance) {
      componentInstance.destroy()
    }
  }

}
