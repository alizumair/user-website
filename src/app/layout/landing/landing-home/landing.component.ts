import { ThemeService } from './../../../services/theme/theme.service';
import { GlobalVariable } from './../../../core/global';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { AppSettings } from './../../../shared/models/appSettings.model';
import { MessagingService } from './../../../services/messaging/messaging.service';
import { LocationService } from './../../../services/location/location.service';
import { UtilityService } from './../../../services/utility/utility.service';
import { ApiUrl } from './../../../core/apiUrl';
import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { HttpService } from './../../../services/http/http.service';
import { Router } from '@angular/router';

declare const $;

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']

})
export class LandingComponent implements OnInit, OnDestroy {

  sitename: string = '';

  settings: AppSettings;
  style: StyleVariables;

  settingSubscription: Subscription;
  styleSubscription: Subscription;

  isLoading: boolean = false;

  data: any = {};
  suppliers: Array<any> = [];
  offers: Array<any> = [];

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private message: MessagingService,
    private httpService: HttpService,
    private themeSerive: ThemeService,
    private utilityService: UtilityService,
    private locationService: LocationService
  ) {
    this.sitename = GlobalVariable.SITE_NAME;
  }


  ngOnInit() {

    this.styleSubscription = this.utilityService.getStyles.subscribe(
      (style: StyleVariables) => {
        this.style = style;
      }
    );

    this.settingSubscription = this.utilityService.getSettings
      .subscribe((settings: AppSettings) => {
        this.settings = settings;
      })


    // this.detectLocation();
    this.fetchData();

    $('.next').click(function () { $('.carousel').carousel('next'); return false; });
    $('.prev').click(function () { $('.carousel').carousel('prev'); return false; });
  }


  detectLocation() {
    this.locationService.openTracker().subscribe((address) => {
      this.ngZone.run(() => {
        this.utilityService.setUserLocation(address);
      })
    }, (err) => {
      this.message.alert('error', err.message);
    });
  }

  fetchData() {
    this.isLoading = true;
    let params = {
      languageId: this.utilityService.handler.languageId,
      latitude: this.utilityService.handler.latitude || 0,
      longitude: this.utilityService.handler.longitude || 0
    };
    this.httpService.getData(ApiUrl.getSpecialOffers, params, true, true)
      .subscribe(response => {
        if (!!response && response.data) {
          this.data = response.data;

          if (this.data.SupplierInArabic && this.data.SupplierInArabic.length) {
            for (let i = 0; i < this.data.SupplierInArabic.length; i += 3) {
              this.suppliers.push(this.data.SupplierInArabic.slice(i, i + 3));
            }
          }
          this.offers = response.data.getOfferByCategory;
        }
        this.isLoading = false;
      }, err => this.isLoading = false);
  }

  onSupplierViewDetail(supplier) {
    const type = supplier.type;
    const category = this.utilityService.getLocalData('selected_category', true) || {};
    category.type = type;
    this.utilityService.setLocalData('selected_category', category, true);

    if (type == 1) {
      this.router.navigate(["/products/listing"], {
        queryParams: {
          supplierId: supplier.id
        }
      }).then(() => {
        this.settings.app_type = type;
        this.utilityService.setSettings(this.settings);
        this.themeSerive.setStyles();
      })
    } else if (type == 2) {
      let cat_ids: Array<any> = [];

      if (supplier.category && supplier.category.length) {
        supplier["category"].forEach(element => {
          cat_ids.push(element.category_id);
        });
      }
      let seoValue = supplier.name;
      let param_obj = {};
      Object.assign(param_obj, this.utilityService.handler);
      param_obj["supplierId"] = [supplier.id];
      param_obj["showSupplier"] = true;
      param_obj['branch_id'] = supplier.supplier_branch_id;
      param_obj['categoryId'] = cat_ids.join();
      this.router.navigate(["/products/product-listing", seoValue], {
        queryParams: { f: this.utilityService.encryptData(param_obj) }
      }).then(() => {
        this.settings.app_type = type;
        this.utilityService.setSettings(this.settings);
        this.themeSerive.setStyles();
      });
    } else if (type == 8) {
      let cat_ids: Array<any> = [];

      if (supplier.category && supplier.category.length) {
        supplier["category"].forEach(element => {
          cat_ids.push(element.category_id);
        });
      }

      const param_obj = Object.assign({}, this.utilityService.handler);
      param_obj['agent'] = 1;
      param_obj["supplierId"] = [supplier.id];
      param_obj['categoryId'] = cat_ids.join();
      param_obj["showSupplier"] = false;
      param_obj['branch_id'] = supplier.supplier_branch_id;

      // const queryParams = this.route.snapshot.queryParams;

      // param_obj['subCatId'] = Object.values(queryParams).filter(value => {
      //   let parsed = Number.parseInt(value);
      //   if (!Number.isNaN(parsed)) return parsed;
      // });

      this.utilityService.clearLocalData('ques_data');
      this.utilityService.setCart([]);
      param_obj["showSupplier"] = true;

      this.router.navigate(["/products/product-listing", supplier.name], {
        queryParams: { f: this.utilityService.encryptData(param_obj) }
      }).then(() => {
        this.settings.app_type = type;
        this.utilityService.setSettings(this.settings);
        this.themeSerive.setStyles();
      });
    } else {
      let cat_ids: Array<any> = [];

      if (supplier.category && supplier.category.length) {
        supplier["category"].forEach(element => {
          cat_ids.push(element.category_id);
        });
      }

      this.router.navigate(["/", "supplier", "supplier-detail"], {
        queryParams: {
          sup_id: supplier.id,
          branch_id: supplier.supplier_branch_id,
          cat_ids: cat_ids.join()
        }
      }).then(() => {
        this.settings.app_type = type;
        this.utilityService.setSettings(this.settings);
        this.themeSerive.setStyles();
      });
    }
  }


  ngOnDestroy(): void {
    if (this.settingSubscription) this.settingSubscription.unsubscribe();
    if (this.styleSubscription) this.styleSubscription.unsubscribe();
  }

}
