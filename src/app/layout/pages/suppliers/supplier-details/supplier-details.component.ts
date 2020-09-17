import { SeoService } from './../../../../services/seo/seo.service';
import { AppSettings } from "./../../../../shared/models/appSettings.model";
import { MessagingService } from "./../../../../services/messaging/messaging.service";
import { ApiUrl } from "./../../../../core/apiUrl";
import { HttpService } from "./../../../../services/http/http.service";
import { UserService } from "./../../../../services/user/user.service";
import { UtilityService } from "./../../../../services/utility/utility.service";
import { StyleConstants } from "./../../../../core/theme/styleConstants.model";
import { StyleVariables } from "./../../../../core/theme/styleVariables.model";
import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  HostListener,
  Inject
} from "@angular/core";
import { Subscription } from "rxjs";
import { Router, ActivatedRoute } from "@angular/router";
import { WINDOW } from "./../../../../services/window/window.service";
import { LocalizationPipe } from './../../../../shared/pipes/localization.pipe';
import { GlobalVariable } from './../../../../core/global';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: "app-supplier-details",
  templateUrl: "./supplier-details.component.html",
  styleUrls: ["./supplier-details.component.scss"]
})
export class SupplierDetailsComponent implements OnInit, OnDestroy {
  @ViewChild("closeModal", { static: false }) closeModal: ElementRef;
  styleSubscription: Subscription;
  userSubscription: Subscription;
  categorySubscription: Subscription;
  routeSubscription: Subscription;
  getDataSubscribe: Subscription;

  subCategories: Array<any> = [];
  selectedCatPath: Array<string> = [];
  categoryIds: Array<any> = [];
  selectedCatIds: Array<any> = [];

  currency: string = "";
  supplierData: any;
  supplierId: string = "";
  branchId: string = "";
  userToken: string = "";
  categoryId: string = "";
  categoryName: string = ""

  btn: StyleConstants;
  style: StyleVariables;

  loggedIn: boolean = false;

  subCatIndex: number = 0;
  selectedTab: number = 0;
  hoverIndex: number = -1;
  banner_height: number = 0;
  selectedIndex: number = 0;

  show_subcat: boolean = true;
  cat_flow: boolean = false;
  settings: AppSettings;
  loading: boolean = false;

  constructor(
    public util: UtilityService,
    private http: HttpService,
    private router: Router,
    private user: UserService,
    private route: ActivatedRoute,
    private message: MessagingService,
    private localization: LocalizationPipe,
    private translate: TranslateService,
    private seo: SeoService,
    @Inject(WINDOW) private window: Window
  ) {
    this.style = new StyleVariables();
    this.btn = new StyleConstants();
    this.currency = GlobalVariable.CURRENCY;

    this.userSubscription = this.user.currentUser.subscribe(user => {
      if (!!user && user["access_token"]) {
        this.userToken = user["access_token"];
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
    });

    this.routeSubscription = this.route.queryParams.subscribe(params => {
      this.supplierId = params["sup_id"];
      this.branchId = params["branch_id"];
      this.cat_flow = params['cat_flow'] ? params['cat_flow'] : false;
      this.categoryIds = !!params["cat_ids"] && params["cat_ids"].split(",").length ? params["cat_ids"].split(",") : [];
      this.categoryId = params['cat_id'];
      this.categoryName = params['name'];
    });

    this.getScreenSize();
  }

  @HostListener("window:resize", [])
  getScreenSize() {
    this.banner_height = this.window.innerWidth * (2 / 7);
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe(
      (style: StyleVariables) => {
        this.style = style;
        this.btn.borderColor = style.primaryColor;
        this.btn.color = style.primaryColor;
      }
    );

    this.makeSubscribe();
  }

  makeSubscribe() {
    this.getDataSubscribe = this.util.callGetData.subscribe(data => {
      if (data) {
        this.getSupplierDetail();
      }
    });

    this.categorySubscription = this.util.getLanguageCategoryData.subscribe(
      categories => {
        if (categories) {

          if (this.categoryId) {
            let cat = (categories.english).find(data => {
              return data.id == this.categoryId;
            });
            let categoryFlow: Array<any> = (cat.category_flow).split('>');
            let index = categoryFlow.indexOf("SupplierInfo");
            if (index > -1) {
              if (categoryFlow[index + 1] === "SubCategory") {
                this.show_subcat = true;
              } else if (categoryFlow[index + 1] === "Pl") {
                this.show_subcat = false;
                this.selectedTab = 1;
              }
            }
            this.onSubCatSelect({ name: this.categoryName, id: this.categoryId, is_cub_category: 1 }, false);
          } else {
            let categoryData: Array<any> = [];
            categories.english.forEach(element => {
              if (this.categoryIds.includes(element.id.toString())) {
                categoryData.push(element);
              }
            });
            categoryData.map(data => {
              data["display_image"] = this.util.thumbnail(data["image"]);
              data["is_cub_category"] = 1;
            });
            this.subCategories.push(categoryData);
          }
        }
      }
    );
  }

  getSupplierDetail() {
    let obj = {
      languageId: this.util.handler.languageId,
      branchId: this.branchId,
      supplierId: this.supplierId,
      categoryId: this.categoryId ? this.categoryId : this.categoryIds[0],
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    };
    if (this.loggedIn) {
      obj["accessToken"] = this.userToken;
    }

    this.http.postData(ApiUrl.getSupplierDetail, obj).subscribe(response => {
      if (!!response && response.data) {
        this.supplierData = { ...this.supplierData, ...response.data };
        this.seo.updateTitle(`${this.supplierData.name} | ${GlobalVariable.SITE_NAME}`);
        this.seo.updateDescription(this.supplierData.address);

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
      }
    });
  }

  onBannerImageLoad(banner) {
    banner["display_image"] = banner["image"];
  }

  rateSupplier() {
    if (this.loggedIn) {
      let obj = {
        supplierId: this.supplierId,
        supplierBranchId: this.branchId,
        categoryId: this.categoryIds[0]
      };
      this.router.navigate(["orders/rating"], { queryParams: obj });
    } else {
      this.message.alert("warning", `${this.translate.instant("Please login to continue!")}`);
    }
  }

  onSubCatSelect(subCatData: any, append: boolean) {
    if (this.categoryIds.length && !this.subCatIndex) {
      let flow = (subCatData.category_flow).split('>');
      let index = flow.indexOf('SupplierInfo');
      if (index > -1) {
        if (flow[index + 1] === 'Pl') {
          this.selectedCatPath.push(subCatData.name)
          this.navigateToProducts(subCatData.id);
          return;
        }
      }
    }
    this.selectedCatPath.push(subCatData["name"]);
    this.selectedCatIds.push(subCatData["id"]);
    if (subCatData["is_cub_category"]) {
      let param_data = {
        categoryId: subCatData.id,
        languageId: this.util.handler.languageId,
        supplierId: this.supplierId
      };

      this.loading = true;
      this.http.postData(ApiUrl.getSubcategory, param_data, true)
        .subscribe(response => {
          if (!!response && response.data) {
            response.data.map(data => {
              data["display_image"] = this.util.thumbnail(data["image"]);
              data["id"] = data["sub_category_id"];
            });
            this.subCategories.push(response.data);
            if (append) {
              this.subCatIndex++;
            }
          }
          this.loading = false;
        });
    } else {
      this.navigateToProducts(subCatData.id);
    }
  }

  onImageLoad(category) {
    category["display_image"] = category["image"];
  }

  navigateToProducts(cat_id?: any) {
    let seoValue = this.selectedCatPath[0].replace(/ &/g, "-");
    let param_obj = {};
    Object.assign(param_obj, this.util.handler);
    param_obj["subCatId"] = [cat_id];
    param_obj["category"] = this.selectedCatIds.length ? this.selectedCatIds[0] : this.categoryId;
    param_obj["product"] = this.route.snapshot.queryParamMap.get("product");
    param_obj["supplierId"] = [this.supplierId];
    param_obj["path"] = this.selectedCatPath;

    this.router.navigate(["products/product-listing", seoValue], {
      queryParams: { f: this.util.encryptData(param_obj) }
    });
  }

  back() {
    if (this.subCatIndex > 0) {
      this.subCategories.splice(this.subCatIndex, 1);
      this.selectedCatPath.splice(this.subCatIndex, 1);
      this.selectedCatIds.splice(this.subCatIndex, 1);
      this.subCatIndex--;
    }
  }

  clear() {
    this.subCategories = [];
    this.selectedCatPath = [];
    this.subCatIndex = 0;
  }

  addRemoveFavourites(is_favourite) {
    let url: string = "";
    if (is_favourite) {
      url = ApiUrl.favourite.removeFromFavourites;
    } else {
      url = ApiUrl.favourite.addToFavourites;
    }
    let form_data = {
      supplierId: this.supplierId,
      accessToken: this.user.getUserToken
    };
    this.http.postData(url, form_data, true).subscribe(response => {
      if (!!response && response.data) {
        this.message.toast(
          "success",
          `${this.localization.transform('supplier')} ${
          is_favourite ? this.translate.instant("Removed From") : this.translate.instant("Added To")
          } ${this.translate.instant('Favourites')}`
        );
        this.supplierData["Favourite"] = !is_favourite;
      }
    });
  }

  ngOnDestroy() {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.getDataSubscribe) this.getDataSubscribe.unsubscribe();
    if (!!this.routeSubscription) this.routeSubscription.unsubscribe();
    if (!!this.userSubscription) this.userSubscription.unsubscribe();
    this.closeModal.nativeElement.click();
    if (!!this.categorySubscription) this.categorySubscription.unsubscribe();
  }
}
