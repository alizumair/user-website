import { PipeTransform, Pipe, OnDestroy } from '@angular/core';
import { LocalizationModel } from './../../core/localization';
import { UtilityService } from './../../services/utility/utility.service';
import { AppSettings } from '../models/appSettings.model';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'localization'
})
export class LocalizationPipe implements PipeTransform, OnDestroy {

  localization: LocalizationModel;
  app_type: number = 0;

  settings: AppSettings;

  langType: 'english' | 'other' = 'english';
  terminology: object = {};
  categories: Array<any> = [];

  settingSubscription: Subscription;
  categorySubscription: Subscription;


  constructor(private util: UtilityService) {

    this.categorySubscription = this.util.getLanguageCategoryData.subscribe((data) => {
      if (data && data.english) {
        this.categories = data.english;
      }
    })

    this.settingSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.app_type = settings['app_type'];
          this.settings = settings;
          this.terminology = settings.terminology;
        }
      });

    let langData = this.util.getLocalData('langData', true) || { id: this.util.handler.languageId };
    this.langType = !langData || langData.id != 14 ? 'other' : 'english';

    this.localization = new LocalizationModel();
    this.localization.recommended_supplier = `Recommended ${this.transform('suppliers', 0, 1)} For You`;
    this.localization.top_suppliers_near_you = `Top ${this.transform('suppliers', 0, 1)} Near You`;
    this.localization.popular_brands = `Popular ${this.transform('brands', 0, 1)}`;
    this.localization.popular_products = `Popular ${this.transform('products', 0, 1)}`;
    this.localization.recently_viewed_products = `Popular ${this.transform('products', 0, 1)}`;

    if(!!this.terminology['english']) {
      this.localization.choose_supplier = `Choose ${this.terminology['english'].supplier}`;
      this.localization.suppliers_near_you = `${this.terminology['english'].suppliers} Near You`;
      this.localization.supplier_service_fee = `${this.terminology['english'].supplier} Service Fee`;
    }
  }

  selectTerminology(type) {
    if (this.settings.isCustomFlow) {
      const category = this.categories.find(category => category.type == type);
      if (category && category.terminology) {
        this.terminology = JSON.parse(category.terminology);
      }
    } else {
      this.terminology = this.settings.terminology || {};
    }
  }

  transform(value: string, type?: number, only_english?: number): LocalizationModel {
    if (type) this.app_type = type;
    if (only_english == 1) this.langType = 'english';
    if(!!this.settings) {
      this.selectTerminology(this.app_type);
    }

    //Ecommerce is default
    switch (this.app_type) {

      case 1: //food
        this.localization.supplier = 'Restaurant';
        this.localization.suppliers = 'Restaurants';
        this.localization.product = 'Food Item';
        this.localization.products = 'Food Items';
        this.localization.agent = 'Delivery Boy';
        this.localization.category = 'Cuisine';
        this.localization.viewDetail = 'View Menu';
        this.localization.emptyCartMsg = 'Your cart is empty.'
        break;

      case 5: //car rental
        this.localization.order = 'Booking';
        this.localization.orders = 'Bookings';
        this.localization.product = 'Vehicle';
        this.localization.products = 'Vehicles';
        this.localization.agent = 'Driver';
        break;

      case 8: //home service
        this.localization.supplier = 'Service Provider';
        this.localization.suppliers = 'Service Providers';
        this.localization.order = 'Booking';
        this.localization.orders = 'Bookings';
        this.localization.product = 'Service';
        this.localization.products = 'Services';
        this.localization.agent = 'Agent';
        this.localization.viewDetail = 'View All Services';
        this.localization.emptyCartMsg = 'Please Select Service.'

        break;
    }



    for (let key in this.localization) {
      this.localization[key] = this.terminology && this.terminology[this.langType] && this.terminology[this.langType][key] ? this.terminology[this.langType][key] : this.localization[key];
    }

    return this.localization[value];
  }

  ngOnDestroy() {
    if (!!this.settingSubscription) this.settingSubscription.unsubscribe();
    if (!!this.categorySubscription) this.categorySubscription.unsubscribe();
  }
}
