import { ApiKeys } from "./../../shared/models/apiKeys.model";
import { FiltersModel } from "./../../shared/models/filters.model";
import { LOCAL_STORAGE, WINDOW } from "@ng-toolkit/universal";
import { StyleVariables } from "./../../core/theme/styleVariables.model";
import { GlobalVariable } from "./../../core/global";
import { AppSettings } from "./../../shared/models/appSettings.model";
import { Injectable, Inject } from "@angular/core";
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { AppHandler } from "./../../shared/models/appHandler.model";
import { Location } from "@angular/common";
import * as CryptoJS from "crypto-js";
import { LoaderService } from '../loader/loader.service';
import { IForegroundNotification } from '../../core/models/foreground-notification.interface';
import { NavigationExtras, Params, Router } from '@angular/router';
declare var dataLayer;

@Injectable({
  providedIn: "root"
})
export class UtilityService {
  style: StyleVariables = new StyleVariables();
  defaultFilters: FiltersModel;
  handler: AppHandler;
  siteName: string = "";
  private _redirectUrl: string = "/";

  constructor(
    @Inject(LOCAL_STORAGE) private localStorage: any,
    @Inject(WINDOW) public window: Window,
    private _location: Location) {
    this.defaultFilters = new FiltersModel();
    this.handler = new AppHandler();
    this.setFilters(this.defaultFilters);
    this.siteName = GlobalVariable.SITE_NAME;

    this.initializeLocation();
  }

  recomendedSupplier = new Subject();

  // Settings change call function
  settingsLoaded = new BehaviorSubject(false);

  // location change call function
  callGetData = new BehaviorSubject(false);

  // location toggle function
  locationToggle = new BehaviorSubject(false);

  // location toggle function
  authToggle = new BehaviorSubject(false);

  walletRefresh = new BehaviorSubject(false);

  diableCart = new BehaviorSubject(false);

  /********* Share UI data **********/
  private ui: BehaviorSubject<StyleVariables> = new BehaviorSubject(this.style);
  getStyles: Observable<StyleVariables> = this.ui.asObservable();
  setStyles(data: StyleVariables) {
    this.ui.next(data);
  }

  /********* Share Key data **********/
  private key: BehaviorSubject<ApiKeys> = new BehaviorSubject(null);
  getKeys: Observable<ApiKeys> = this.key.asObservable();
  setKeys(data: ApiKeys) {
    this.key.next(data);
  }

  /********* Share settings data **********/
  private settings: BehaviorSubject<AppSettings> = new BehaviorSubject(null);
  getSettings: Observable<AppSettings> = this.settings.asObservable();
  setSettings(data: AppSettings) {
    this.settings.next(data);
  }

  /********* Share Promotion data **********/
  private promotions: BehaviorSubject<any> = new BehaviorSubject(null);
  getPromotions: Observable<any> = this.promotions.asObservable();
  setPromotions(data: any) {
    this.promotions.next(data);
  }

  /********* Share Offer data **********/
  private offers: BehaviorSubject<any> = new BehaviorSubject(null);
  getOffers: Observable<any> = this.offers.asObservable();
  setOffers(data: any) {
    this.offers.next(data);
  }

  /********* Share Supplier data **********/
  private suppliers: BehaviorSubject<any> = new BehaviorSubject(null);
  getSuppliers: Observable<any> = this.suppliers.asObservable();
  setSuppliers(data: any) {
    this.suppliers.next(data);
  }


  /********* Share language data **********/
  private languageCategory: BehaviorSubject<any> = new BehaviorSubject(null);
  getLanguageCategoryData: Observable<any> = this.languageCategory.asObservable();
  setLanguageCategoryData(data: any) {
    this.languageCategory.next(data);
  }

  /********* Share Category data **********/
  // private categories: BehaviorSubject<any> = new BehaviorSubject(null);
  // getCategories: Observable<any> = this.categories.asObservable();
  // setCategories(data: any) {
  //   this.categories.next(data);
  // }

  /********* Filter data **********/
  private filter: BehaviorSubject<FiltersModel> = new BehaviorSubject(
    this.defaultFilters
  );
  getFilters: Observable<FiltersModel> = this.filter.asObservable();
  setFilters(data: FiltersModel) {
    this.filter.next(data);
  }

  /********* Product detail type **********/
  private productList: BehaviorSubject<any> = new BehaviorSubject(null);
  getProductListType: Observable<any> = this.productList.asObservable();
  setProductListType(data: any) {
    this.productList.next(data);
  }

  /********* Share data between siblings through observable **********/
  private dataSource: BehaviorSubject<any> = new BehaviorSubject(null);
  getData: Observable<any> = this.dataSource.asObservable();
  setData(data: any) {
    this.dataSource.next(data);
  }

  /********* Share data between siblings through observable **********/
  private checkDbKey: BehaviorSubject<any> = new BehaviorSubject(null);
  getDBKey: Observable<any> = this.checkDbKey.asObservable();
  setDBKey(data: any) {
    this.checkDbKey.next(data);
  }

  /********* Share cart data **********/
  private cartSource: BehaviorSubject<any> = new BehaviorSubject(
    this.getLocalData("cart", true)
  );
  getCart: Observable<any> = this.cartSource.asObservable();
  setCart(data: any) {
    this.setLocalData("cart", data, true);
    this.cartSource.next(data);
  }

  /******************************* self pick ***************************************/
  private selfPickup: BehaviorSubject<number> = new BehaviorSubject(0);
  getSelfPickup: Observable<number> = this.selfPickup.asObservable();
  setSelfPickup(value: number) {
    /** check for self pick */
    if (this.handler.selfPickup == value) {
      return;
    }
    this.handler.selfPickup = value;
    this.selfPickup.next(value);
  }

  /************************************* foreground notification*************************************/
  private foregroundNotification: BehaviorSubject<IForegroundNotification> = new BehaviorSubject({ showChat: true, showOrder: true });
  getForegroundNotification: Observable<IForegroundNotification> = this.foregroundNotification.asObservable();
  setForegroundNotification(value: IForegroundNotification) { this.foregroundNotification.next(value) };

  /************************** user location  ********************************/
  private userLocation: BehaviorSubject<any> = new BehaviorSubject(
    this.getLocalData("user_location", true)
  );
  getUserLocation: Observable<any> = this.userLocation.asObservable();
  setUserLocation(location: any) {
    const latitude = location.lat || location.latitude;
    const longitude = location.lng || location.longitude;
    /** check for location change */
    if (this.handler.latitude == latitude && this.handler.longitude == longitude) {
      return;
    }
    this.setLocalData('user_location', location, true);
    this.handler.address = location.address;
    this.handler.latitude = latitude;
    this.handler.longitude = longitude;
    this.userLocation.next(location);
    this.callGetData.next(true);
  }

  setDefaultLocation() {
    this.setUserLocation({
      address: "Chandigarh, India",
      latitude: 30.7333148,
      longitude: 76.7794179
    });
  }

  initializeLocation() {
    const location = this.getLocalData("user_location", true);

    if (this.handler.latitude && this.handler.longitude) {
      this.setUserLocation({
        lat: this.handler.latitude,
        lng: this.handler.longitude,
        address: this.handler.address
      })
    } else if (location) {
      this.handler.latitude = location.lat || location.latitude;
      this.handler.longitude = location.lng || location.longitude;
      this.handler.address = location.address;
      this.callGetData.next(true);
    }
  }

  /************************** dark theme ****************************/

  private darkTheme: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    this.getLocalData('dark_theme', true)
  );
  getDarkTheme: Observable<boolean> = this.darkTheme.asObservable();

  setDarkTheme(isDark: boolean): void {
    this.setLocalData('dark_theme', isDark, true);
    this.darkTheme.next(isDark);
  }

  /********* Set data in local storage **********/
  setLocalData(key: string, data: any, json?: boolean) {
    this.localStorage.setItem(key, json ? JSON.stringify(data) : data);
  }

  /********* Get data from local storage **********/
  getLocalData(key: string, json?: boolean) {
    let _data: any = null;
    try {
      _data = json
        ? JSON.parse(this.localStorage.getItem(key))
        : this.localStorage.getItem(key);
      return _data;
    } catch (error) {
      if (error instanceof SyntaxError) this.clearLocalData(key);
      return null;
    }
  }

  /********* Remove data from local storage **********/
  clearLocalData(key: string) {
    this.localStorage.removeItem(key);
  }

  thumbnail(img_path: string): string {
    // if (img_path) {
    //   var index = img_path.lastIndexOf("/") + 1;
    //   var start = img_path.substring(0, index);
    //   var end = img_path.substring(index, img_path.length);
    //   return start + 'thumb_' + end;
    // }
    return img_path;
  }

  // make unique
  findUnique(ar1, ar2) {
    let map = {};
    let ar3 = ar1.concat(ar2);
    let responseArray = [];
    for (let i = 0; i < ar3.length; i++) {
      if (ar3[i].name in map) {
        responseArray[map[ar3[i].name]].values = responseArray[
          map[ar3[i].name]
        ].values.concat(ar3[i].values);
      } else {
        map[ar3[i].name] = responseArray.length;
        responseArray.push(ar3[i]);
      }
    }
    return responseArray;
  }

  //  cart total count
  getTotalCountCart() {
    let totalCart = 0;
    let cart = this.getLocalData("cart", true);
    if (cart && cart.length) {
      cart.forEach(element => {
        totalCart += element["selectedQuantity"];
      });
    }
    return totalCart;
  }

  decimalCartCount() {
    let totalCart = 0;
    let cart = this.getLocalData("cart", true);
    if (cart && cart.length) {
      cart.forEach(element => {
        totalCart += element["selectedQuantity"];
      });
    }
    return Math.round(totalCart * 100 + Number.EPSILON) / 100;
  }

  productPriceToFloat(productData: any): any {
    const decimalLength = this.settings.getValue().price_decimal_length;
    ["price", "display_price", "fixed_price"].forEach(price => {
      productData[price] = Number.parseFloat(productData[price]).toFixed(decimalLength);
    });
    return productData;
  }

  goBack() {
    this._location.back();
  }

  convertIntoNumber(value) {
    if (value) {
      return parseFloat(value);
    }
  }

  getFormattedTime(minutes) {
    let s = "";
    if (minutes < 60 || minutes % 60 != 0) {
      s = minutes + " " + "Min (s)";
    } else {
      let hours = minutes / 60;

      if (hours >= 24) {
        let day = hours / 24;
        if (day > 1) s = day + " " + "Days";
        else s = day + " " + "Day";
      } else {
        if (hours <= 1) s = hours + " " + "Hour";
        else s = hours + " " + "Hours";
      }
    }
    return s;
  }

  encryptData(data) {
    try {
      return CryptoJS.AES.encrypt(
        JSON.stringify(data),
        this.siteName
      ).toString();
    } catch (e) {
      console.log(e);
    }
  }

  decryptData(data) {
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.siteName);
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      }
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  public generateFakeList(count: number): Array<number> {
    const indexes = [];
    for (let i = 0; i < count; i++) {
      indexes.push(i);
    }
    return indexes;
  }

  goToTop() {
    // $("html, body").animate({ scrollTop: 0 }, "slow");
    this.window.scrollTo(0, 0);
  }

  setRedirectUrl(url: string) {
    this._redirectUrl = url;
  }

  getRedirectUrl(): string {
    return this._redirectUrl;
  }

  getSelectedCategory(): string | number | null {
    let category = this.getLocalData('selected_category', true);
    return category ? category.id : null;
  }

  private flow: BehaviorSubject<any> = new BehaviorSubject<any>(
    this.getLocalData('selected_category', true)
  );
  getFlow: Observable<any> = this.flow.asObservable();

  setFlow(_flow: any): void {
    this.setLocalData('selected_category', _flow, true);
    this.flow.next(_flow);
  }

  // private module: BehaviorSubject<any> = new BehaviorSubject(null);
  // getApptype: Observable<any> = this.module.asObservable();
  // setApptype(type: any) {
  //   this.module.next(type);
  // }


  //////////////////////////////// GTM Data layer (starts)///////////////////////////////////////
  addToDatalayer(objToPush) {
    dataLayer.push(objToPush);
  }
  //////////////////////////////// GTM Data layer (ends)///////////////////////////////////////

}
