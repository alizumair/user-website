import { SeoService } from './../../../services/seo/seo.service';
import { GlobalVariable } from './../../../core/global';
import { DataCacheService } from './../../../services/data-cache/data-cache.service';
import { CartService } from './../../../services/cart/cart.service';
import { HttpService } from './../../../services/http/http.service';
import { UtilityService } from './../../../services/utility/utility.service';
import { AppSettings } from './../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { skip } from 'rxjs/operators';
import { ApiUrl } from '../../../core/apiUrl';
import { SingleVendorComponent } from '../../shared/home/components/single-vendor/single-vendor.component';

@Component({
  selector: 'app-ecom-home',
  templateUrl: './ecom-home.component.html',
  styleUrls: ['./ecom-home.component.scss']
})
export class EcomHomeComponent implements OnInit {

  @ViewChild(SingleVendorComponent, { static: false }) single_vendor: SingleVendorComponent;

  settingsSubscription: Subscription;
  offerSubscription: Subscription;
  styleSubscription: Subscription;
  locationSubscription: Subscription;
  categorySubscription: Subscription;

  settings: AppSettings;
  homeData: any;
  categories: Array<any> = [];
  topBanner: any = [];
  bannerImage: string = "";
  style: StyleVariables;
  selectedTab: number = 1;

  siteName: string = '';

  showBrands: boolean = false;
  isLoading: boolean = false;
  recentlyViewed: Array<any> = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private util: UtilityService,
    private http: HttpService,
    private seo: SeoService,
    private data_cache: DataCacheService
  ) {

    this.siteName = GlobalVariable.SITE_NAME;

    this.settingsSubscription = this.util.getSettings.subscribe(
      (settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      }
    );
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe(
      (style: StyleVariables) => {
        this.style = style;
      }
    );
    this.categorySubscription = this.util.getLanguageCategoryData.subscribe((data) => {
      if (data && data.english) {
        this.categories = data.english;
        this.getHomeData();
        this.getRecent();
      }
      if (data && data.brands && data.brands.length) {
        this.showBrands = true;
      }
    })
    this.locationSubscription = this.util.getUserLocation.pipe(skip(1)).subscribe((location) => {
      this.data_cache.removeKey(ApiUrl.getSpecialOffers);
      this.getHomeData();
      if (this.settings.app_type == 1 && this.settings.is_single_vendor) {
        this.data_cache.removeKey(ApiUrl.getSupplierDetailProduct);
        this.single_vendor.getDetails();
      }
    })
  }

  getHomeData() {
    this.isLoading = true;
    const params: any = {
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude || 0,
      longitude: this.util.handler.longitude || 0
    };

    if (this.settings.isCustomFlow) {
      let categoryId = this.route.snapshot.queryParams['cat_flow_id'];
      params.categoryId = categoryId || (this.categories.find(c => c.type == this.settings.app_type)).id;

      if (categoryId) {
        let catData = this.categories.find(c => c.type == this.settings.app_type && categoryId == c.id);
        this.seo.updateTitle(`${catData.name} | ${GlobalVariable.SITE_NAME}`);
      }
    }

    this.http.getData(ApiUrl.getSpecialOffers, params, true, !this.settings.isCustomFlow)
      .subscribe(response => {
        if (!!response && response.data) {
          this.homeData = response.data;
        }
        this.isLoading = false;
      }, err => this.isLoading = false);
  }

  getRecent() {
    let params = {
      latitude: this.util.handler.latitude || 0,
      longitude: this.util.handler.longitude || 0,
      languageId: this.util.handler.languageId,
      offset: 0
    }
    
    this.http.getData(ApiUrl.recentlyViewed, params)
      .subscribe(response => {
        if (!!response && response.data) {
          this.recentlyViewed = response.data.recentActivity;
        }
      });
  }

  ngOnDestroy() {
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
    if (!!this.offerSubscription) this.offerSubscription.unsubscribe();
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.locationSubscription) this.locationSubscription.unsubscribe();
    if (!!this.categorySubscription) this.categorySubscription.unsubscribe();
  }

}
