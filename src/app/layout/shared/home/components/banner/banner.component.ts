import { ApiUrl } from './../../../../../core/apiUrl';
import { HttpService } from './../../../../../services/http/http.service';
import { skip } from 'rxjs/operators';
import { GlobalVariable } from './../../../../../core/global';
import { ThemeService } from './../../../../../services/theme/theme.service';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { StyleConstants } from './../../../../../core/theme/styleConstants.model';
import { AppHandler } from './../../../../../shared/models/appHandler.model';
import { Subscription } from "rxjs";
import { Component, OnInit, HostListener, Inject } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { DOCUMENT } from '@angular/common';

@Component({
  selector: "app-banner",
  templateUrl: "./banner.component.html",
  styleUrls: ["./banner.component.scss"]
})
export class BannerComponent implements OnInit {

  handler: AppHandler;
  banners: Array<any> = [];
  primaryButton: StyleConstants;
  bannerText: StyleConstants;
  styleSubscription: Subscription;
  getDataSubscribe: Subscription;
  locationSubscription: Subscription;
  supplier: any;
  showSupplier: boolean = false;
  banner_height: number = 0;
  style: StyleVariables
  selectedIndex: number = 0;
  settings: AppSettings;
  settingsSubscription: Subscription;
  temp_banners: Array<any> = [];

  showHeaderSearch: boolean = false;
  isLoading: boolean = false;
  is_mobile: boolean = GlobalVariable.IS_MOBILE;
  size: string = '1500x375';

  slideConfig = {
    "slidesToShow": 1,
    "slidesToScroll": 1,
    "dots": true,
    "arrows": false,
    "infinite": false,
    "autoplay": true,
    "autoplaySpeed": 3000
  };

  constructor(
    @Inject(DOCUMENT) private document,
    private util: UtilityService,
    private themeService: ThemeService,
    private router: Router,
    private http: HttpService) {

    this.primaryButton = new StyleConstants();
    this.bannerText = new StyleConstants();
    this.getScreenSize();
  }

  @HostListener("window:resize", ["$event"])
  getScreenSize(event?) {
    this.banner_height = GlobalVariable.IS_MOBILE ? window.innerWidth * (2 / 4) : window.innerWidth * (1 / 4);
    this.size = `${window.innerWidth + 100}x${this.banner_height + 100}`;
  }

  ngOnInit() {

    this.styleSubscription = this.util.getStyles.subscribe(
      (style: StyleVariables) => {
        this.style = style;
        this.primaryButton.color = "#ffffff";
        this.primaryButton.backgroundColor = style.primaryColor;
        this.bannerText.color = "#ffffff";
      }
    );

    this.settingsSubscription = this.util.getSettings.subscribe(
      (settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
          this.temp_banners = settings['temp_banners'];
        }
      }
    );
    this.makeSubscribe();

    this.locationSubscription = this.util.getUserLocation.pipe(skip(1)).subscribe((location) => {
      if (location) {
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
              this.mapCategories(response.data);
            }
          });
      }
    });
  }

  makeSubscribe() {
    this.isLoading = true;
    this.banners = [];
    this.getDataSubscribe = this.util.getLanguageCategoryData
      .subscribe(data => {
        this.mapCategories(data);
      });
  }

  mapCategories(data) {
    if (data) {
      this.banners = [];
      if (data.topBanner.length) {
        let category = this.util.getLocalData('selected_category', true);
        data.topBanner.forEach(banner => {
          if (this.settings.isCustomFlow && category && banner.category_id !== category.id && this.router.url != '/') return;
          this.banners.push(banner);
        });
      } else {
        this.banner_height += 150;
        this.banners = this.temp_banners;
      }
      this.banners.reverse();
      this.isLoading = false;
    }
  }

  viewSupplier(banner) {
    if (!banner || !banner.supplier_id || (this.settings.is_single_vendor != 0) || banner.flow_banner_type == 2) {
      return;
    }

    const bannerType = banner['type'] || this.settings.app_type;

    this.supplier = banner;
    this.showSupplier = true;

    if (banner.flow_banner_type == "3") {
      if (this.settings.is_user_subscription == 1) {
        this.router.navigate(["/account/subscriptions"]);
      }
      return;
    }

    if (bannerType == 1) {

      if (banner.is_subcategory == 1) {
        this.supplierList(banner);
        return;
      }

      this.router.navigate(["products/listing"], {
        queryParams: {
          supplierId: banner.supplier_id,
        }
      }).then(() => this.setAppType(banner));
    } else {
      let seoValue = banner['supplier_name'];
      let param_obj = {};
      Object.assign(param_obj, this.util.handler);
      param_obj["supplierId"] = [banner.supplier_id];
      param_obj["showSupplier"] = true;
      param_obj['branch_id'] = banner.branch_id;
      param_obj['categoryId'] = banner.category_id

      if (bannerType == 8) {
        param_obj["showSupplier"] = false;
        param_obj["agent"] = 1;
        if (banner.is_subcategory == 1) {
          this.supplierList(banner);
          return;
        }
      }

      this.router.navigate(['/', 'products', 'product-listing', seoValue], {
        queryParams: { f: this.util.encryptData(param_obj) }
      }).then(() => this.setAppType(banner));

    }
  }

  supplierList(banner: any) {
    const queryParams = { cat_id: banner.category_id, cat_name: banner.category_name }
    if (banner.menu_type == 1 && banner.is_subcategory == 1) {
      queryParams['n_lvl'] = 1
    }
    this.router.navigate(['/', 'supplier', 'supplier-list'], { queryParams }).then(() => this.setAppType(banner));
  }

  setAppType(banner: any) {
    if (this.settings.app_type > 10) {
      const category = this.util.getLocalData('selected_category', true) || {};
      category.type = banner.type;
      category.id = banner.category_id;
      this.util.setLocalData('selected_category', category, true);
      this.settings.app_type = banner.type;
      this.util.setSettings(this.settings);
      this.themeService.setStyles();
    }
  }

  ngOnDestroy() {
    this.styleSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
    if (!!this.locationSubscription) this.locationSubscription.unsubscribe();
  }
}
