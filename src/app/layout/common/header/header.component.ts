import { SeoService } from './../../../services/seo/seo.service';
import { AuthComponent } from './../../authorization/auth.component';
import { AppSettings } from './../../../shared/models/appSettings.model';
import { FiltersModel } from './../../../shared/models/filters.model';
import { LocationComponent } from './location/location.component';
import { UserService } from './../../../services/user/user.service';
import { Subscription } from 'rxjs';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { UtilityService } from './../../../services/utility/utility.service';
import { ThemeService } from './../../../services/theme/theme.service';
import { Component, OnInit, OnDestroy, ViewChild, SimpleChanges, SimpleChange, OnChanges, Input, Inject } from '@angular/core';
import { HttpService } from './../../../services/http/http.service';
import { ApiUrl } from './../../../core/apiUrl';
import { Router, ActivatedRoute, NavigationEnd, Event, NavigationStart } from '@angular/router';
import { GlobalVariable } from './../../../core/global';
import { DOCUMENT } from "@angular/common";
import { take, skip } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  host: {
    "(window:resize)": "onWindowResize($event)"
  }
})
export class HeaderComponent implements OnInit, OnChanges, OnDestroy {

  @Input() nav_fixed: any;
  @Input() fix_search: boolean;

  @ViewChild(LocationComponent, { static: false }) location: any;
  @ViewChild(AuthComponent, { static: false }) authModal: AuthComponent;

  searchBy: number = 0;  // 0 or 1
  globalVariable = GlobalVariable;

  style: StyleVariables;
  styleSubscription: Subscription;
  userSubscription: Subscription;
  getDataSubscribe: Subscription;
  cartValueChange: Subscription;
  routeSubscription: Subscription;
  settingsSubscription: Subscription;
  paramSubscription: Subscription;

  sidenav: 0 | 1 | 2 = 0;
  loggedIn: boolean = false;
  authType: string = '';
  userData: any;

  localSearchedData: Array<string> = [];
  search: string = '';
  filters: FiltersModel;
  allParams: any = {};
  image_paths: string = '';
  settings: AppSettings;
  isNavFixed: boolean = false;
  show_continue: boolean = false;
  showSearchbar: boolean = false;
  categories: Array<any> = [];
  openAuth: boolean = false;
  totalCart: number = 0;
  isLoading: boolean = false;
  is_mobile: boolean = GlobalVariable.IS_MOBILE;
  public userWalletBalance: number = 0;
  isNavigating: boolean = false;

  constructor(
    private http: HttpService,
    private util: UtilityService,
    private user: UserService,
    public router: Router,
    private route: ActivatedRoute,
    private themeSerive: ThemeService,
    private seo: SeoService,
    @Inject(DOCUMENT) private document) {

    this.style = new StyleVariables();
    this.filters = new FiltersModel();
  }

  ngOnInit() {
    this.subscriptions();
    let localSearchData = this.util.getLocalData('product-search', true);
    if (localSearchData) this.localSearchedData = localSearchData;

    this.util.walletRefresh.subscribe(data => {
      if (data) {
        this.getCategories(false);
      }
    });

    this.getCategories(true);
  }

  ngOnChanges(changes: SimpleChanges) {
    const is_nav_fixed: SimpleChange = changes.nav_fixed;
    if (!!is_nav_fixed) {
      this.isNavFixed = is_nav_fixed.currentValue;
    }
  }

  onWindowResize(event) {
    const width = event.target.innerWidth;
    if (width > 812) {
      this.sidenav = 0;
    }
  }

  subscriptions() {
    this.routeSubscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.isNavigating = true;
      }
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          this.isNavigating = false;
        }, 200);

        this.seo.setDefault();
        let flow_data = this.util.getLocalData('selected_category', true);
        if (!!flow_data && event.url === '/') {
          this.themeSerive.removeStyleLink(flow_data.type);
          this.util.clearLocalData('selected_category');
          this.settings.app_type = this.settings.type;
          this.util.setSettings(this.settings);
        }

        let urlPath = (event.url).split('/');
        if (['products', 'supplier'].includes(urlPath[1])) {
          this.show_continue = true;
        } else {
          this.show_continue = false;
        }
      }
    });

    this.settingsSubscription = this.util.getSettings.subscribe((settings: AppSettings) => {
      if (!!settings) {
        this.settings = settings;
        if (settings.isCustomFlow) {
          let flow_data = this.util.getLocalData('selected_category', true);
          if (this.router.url !== '/' && !flow_data) {
            this.router.navigate(['']);
          } else if (this.router.url === '/' && !!flow_data) {
            let path = (flow_data.name).replace(/\s+/g, '-').toLowerCase() + '/home';
            this.router.navigate([path], { queryParams: { app: flow_data.type, cat_flow_id: flow_data.id } })
          }
        }
        this.image_paths = settings.site_logo;
        if (!this.searchBy)
          this.searchBy = this.settings.search_by !== 2 ? this.settings.search_by : 0;
      }
    });

    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
      });


    this.paramSubscription = this.route.queryParams.subscribe(params => {
      this.searchBy = params.searchBy ? parseInt(params.searchBy) : 0;
      if (params.f) {
        this.allParams = this.util.decryptData(params.f);
        this.search = this.allParams.product ? this.allParams.product : null;
      } else {
        this.allParams = {};
        // this.search = '';
      }
    });


    this.totalCart = this.util.getTotalCountCart();

    this.cartValueChange = this.util.getCart
      .subscribe(cart => {
        if (cart) {
          this.totalCart = this.util.getTotalCountCart();
        }
      });

    this.util.authToggle.subscribe(is_toggle => {
      if (is_toggle) {
        this.openAuth = true;
        this.authType = 'LOGIN';
        if (this.openAuth) {
          setTimeout(() => {
            this.authModal.openModal();
          }, 100);
        }
      }
    });

    this.userSubscription = this.user.currentUser
      .subscribe(userData => {
        if (!!userData && userData[this.settings.phone_registration_flag != 1 ? 'access_token' : 'accessToken']) {
          this.loggedIn = true;
          this.userData = userData;
          if (this.settings.wallet_module == 1 && this.settings.show_wallet_on_home == 1) {
            this.getCategories(false);
          }
        } else {
          this.loggedIn = false;
        }
      });
  }

  getCategories(refresh?: boolean) {
    const userData = this.util.getLocalData('web_user', true);
    let paramData = {
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    };
    if (userData && userData.access_token) {
      paramData['accessToken'] = userData['access_token'];
    }
    this.http.getData(ApiUrl.getAllCategories, paramData)
      .subscribe(response => {
        if (!!response && response.data) {
          if(refresh) {
            this.util.setLanguageCategoryData(response.data);
          }
          this.categories = response.data.english;
          this.userWalletBalance = response.data.user_wallet_amount;
        }
      });
  }

  /********** Product Search **********/
  searchProduct(searchedVal: string) {
    let searchResults = [];
    if (searchedVal.trim()) {
      if (!this.allParams['supplierId'] || !this.allParams['subCatId']) {
        this.util.clearLocalData('pickUp_DT');
      }
      if (this.localSearchedData) {
        if (!this.localSearchedData.includes(searchedVal)) {
          if (this.localSearchedData.length > 2) {
            this.localSearchedData.pop();
          }
          this.localSearchedData.unshift(searchedVal);
        }
        searchResults = [...this.localSearchedData];
      } else {
        searchResults.push(searchedVal);
      }
      this.util.setLocalData('product-search', searchResults, true);
      this.allParams.product = searchedVal;

      if (this.searchBy === 1) {
        this.router.navigate(['/supplier', 'supplier-list'], {
          queryParams: {
            all: 1,
            search: searchedVal,
            searchBy: this.searchBy
          }
        });
      } else {
        this.router.navigate(['/products', 'product-listing', searchedVal.replace(/ &/g, '-')], {
          queryParams: { f: this.util.encryptData(this.allParams), searchBy: this.searchBy }
        });
      }
      if (!!this.document.getElementById('recentSearch')) {
        this.document.getElementById('recentSearch').classList.remove("show");
      }
    }
  }

  cancelSearch() {
    if (this.router.url.startsWith(`/`)) {
      this.search = '';
    } else {
      this.allParams.product = null;
      this.router.navigate(['/products', 'product-listing', 'all-product'], {
        queryParams: { f: this.util.encryptData(this.allParams) }
      });
    }
  }

  onCategorySelect(category: any) {
    this.isLoading = true;
    const previousSelectedCategroyId = this.util.getLocalData('last_categoryId') || category.id;
    this.util.setLocalData('selected_category', category, true);
    let path = (category.name).replace(/\s+/g, '-').toLowerCase() + '/home';
    this.router.navigate([path], { queryParams: { app: category.type, cat_flow_id: category.id } }).then(() => {
      this.settings.app_type = category.type;
      this.util.setSettings(this.settings);
      this.themeSerive.setStyles();
      this.util.setLocalData('last_categoryId', category.id);
      if (previousSelectedCategroyId != category.id) {
        this.util.setCart([]);
      }
      setTimeout(() => {
        this.isLoading = false
      }, 1000);
    });
  }

  onLogo() {
    this.router.navigate(['']);
  }

  closeAuth(event) {
    this.openAuth = event;
    this.util.authToggle.next(false);
  }

  ngOnDestroy() {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.userSubscription) this.userSubscription.unsubscribe();
    if (!!this.routeSubscription) this.routeSubscription.unsubscribe();
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
    if (!!this.getDataSubscribe) this.getDataSubscribe.unsubscribe();
    if (!!this.paramSubscription) this.paramSubscription.unsubscribe();
  }
}
