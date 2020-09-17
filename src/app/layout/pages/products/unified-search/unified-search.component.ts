import { UserService } from '../../../../services/user/user.service';
import { DialogService } from 'primeng/dynamicdialog';
import { CartService } from '../../../../services/cart/cart.service';
import { AddOnComponent } from '../../../shared/product/components/add-on/add-on.component';
import { FiltersModel } from '../../../../shared/models/filters.model';
import { WINDOW } from '../../../../services/window/window.service';
import { StyleVariables } from '../../../../core/theme/styleVariables.model';
import { AppSettings } from '../../../../shared/models/appSettings.model';
import { PaginationModel } from '../../../../shared/models/pagination.model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http/http.service';
import { UtilityService } from '../../../../services/utility/utility.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { ApiUrl } from '../../../../core/apiUrl';

@Component({
  selector: 'app-unified-search',
  templateUrl: './unified-search.component.html',
  styleUrls: ['./unified-search.component.scss']
})
export class UnifiedSearchComponent implements OnInit, OnDestroy {

  routeSubscription: Subscription;
  styleSubscription: Subscription;
  settingsSubscription: Subscription;
  cartSubscription: Subscription;
  userSubscription: Subscription;

  productPagination: PaginationModel;
  supplierPagination: PaginationModel;
  settings: AppSettings;
  style: StyleVariables;
  search: string = "";
  products: Array<any> = [];
  suppliers: Array<any> = [];
  cart: Array<any> = [];
  isLoading: boolean = false;
  timeInterval: number = 0;
  loggedIn: boolean = false;
  productstate: any = {
    hideSupplier: false
  };
  productClass: string = 'col-md-3';
  supplierClass: string = 'col-md-3';

  constructor(
    private route: ActivatedRoute,
    public util: UtilityService,
    private http: HttpService,
    private cartService: CartService,
    private dialogService: DialogService,
    private user: UserService,
    @Inject(WINDOW) private window: Window
  ) {

    this.productPagination = new PaginationModel();
    this.supplierPagination = new PaginationModel();
    this.productPagination.perPage = 10;
    this.supplierPagination.perPage = 10;
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles
      .subscribe((styles: StyleVariables) => {
        this.style = styles;
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          switch(settings.app_type) {
            case 1:
              if (settings.selected_template == 1) {
                this.productClass = 'col-md-6';
                this.supplierClass = 'col-md-6';
              }
          }
          this.timeInterval = settings['interval'];
          this.productstate.hideSupplier = !!settings.is_single_vendor;
          this.settings = settings;
        }
      });

    this.userSubscription = this.user.currentUser.subscribe(user => {
      if (!!user && user["access_token"]) {
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
    });

    this.cartSubscription = this.util.getCart.subscribe(cart => {
      if (cart) {
        this.cart = cart;
      }
    });

    this.routeSubscription = this.route.queryParams.subscribe(params => {
      if (params) {
        this.search = params.search;
        this.getProducts(false);
        this.getSuppliers();
      }
    });
  }

  getProducts(is_page_change: boolean) {
    this.isLoading = true;
    if (!is_page_change) {
      this.productPagination.currentPage = 1;
      this.productPagination.offset = 0;
    }

    let param_data = {
      ...new FiltersModel(),
      languageId: this.util.handler.languageId,
      offset: this.productPagination.offset,
      limit: this.productPagination.perPage,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude,
      product_name: this.search
    };

    const category = this.util.getLocalData('selected_category', true);
    if (this.settings.isCustomFlow && category) {
      param_data['categoryId'] = category.id;
    }

    this.http.postData(ApiUrl.filterProducts, param_data, false)
      .subscribe((response: any) => {
        if (!!response && response.data) {
          this.productPagination.count = response.data.count;
          this.products = response.data.product;
          this.products.map(data => {
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
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  getSuppliers() {
    this.isLoading = true;
    let param_data = {
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude,
      search: this.search,
      sort_by: 0
    };

    const category = this.util.getLocalData('selected_category', true);
    if (this.settings.isCustomFlow && category) {
      param_data['categoryId'] = category.id;
    }

    this.http.getData(ApiUrl.getHomeSuppliers, param_data)
      .subscribe(response => {
        if (!!response && response.data) {
          this.suppliers = response.data;
          this.suppliers.map((data: any) => {
            parseFloat(data["rating"]);
            data["display_supplier_image"] = data["supplier_image"]
            data["display_logo"] = data["logo"];
          });
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  pageChange(event) {
    this.productPagination.currentPage = event;
    this.productPagination.offset = event > 1 ? (event - 1) * this.productPagination.perPage : 0;
    this.getProducts(true);
    this.window.scrollTo(0, 0);
  }

  addProduct(product) {
    if (product['is_product_adds_on'] !== 1) {
      this.cartService.addToCart(product, this.products);
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

  openAddOnDialog(product) {
    const dialogRef = this.dialogService.open(AddOnComponent, {
      header: product['name'],
      width: '45%',
      showHeader: false,
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      data: {
        product: product,
        addOnItems: product['adds_on']
      }
    });
  }

  ngOnDestroy() {
    if(!!this.userSubscription) this.userSubscription.unsubscribe();
    if(!!this.routeSubscription) this.routeSubscription.unsubscribe();
    if(!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if(!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
    if(!!this.cartSubscription) this.cartSubscription.unsubscribe();
  }
}
