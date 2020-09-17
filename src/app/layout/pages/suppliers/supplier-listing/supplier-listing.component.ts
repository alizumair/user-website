import { LocalizationPipe } from './../../../../shared/pipes/localization.pipe';
import { GlobalVariable } from './../../../../core/global';
import { SeoService } from './../../../../services/seo/seo.service';
import { QuestionsComponent } from './../../../shared/layout-shared/components/questions/questions.component';
import { DialogService } from 'primeng/dynamicdialog';
import { AppSettings } from "./../../../../shared/models/appSettings.model";
import { StyleVariables } from "./../../../../core/theme/styleVariables.model";
import { PaginationModel } from "./../../../../shared/models/pagination.model";
import { ApiUrl } from "./../../../../core/apiUrl";
import { HttpService } from "./../../../../services/http/http.service";
import { UtilityService } from "./../../../../services/utility/utility.service";
import { Subscription } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { UserService } from "./../../../../services/user/user.service";
import { CategoryFilter } from '../../../../shared/models/categoryFilter';
import { DataCacheService } from '../../../../services/data-cache/data-cache.service';

@Component({
  selector: "app-supplier-listing",
  templateUrl: "./supplier-listing.component.html",
  styleUrls: ["./supplier-listing.component.scss"] 
})
export class SupplierListingComponent implements OnInit, OnDestroy {
  routeSubscription: Subscription;
  dataSubscription: Subscription;
  styleSubscription: Subscription;
  settingsSubscription: Subscription;
  categorySubscription: Subscription;

  pagination: PaginationModel;
  style: StyleVariables;

  tags: Array<string> = [];
  isTagSearch: boolean = false;

  search: string = "";
  categoryId: string = "";
  categoryName: string = "";
  suppliers: Array<any> = [];
  noData: boolean = false;
  hoverIndex: any = -1;
  isRecommendedSuppliers: boolean = false;
  is_subCat: number = 0;
  is_favourite: number = 0;
  is_all: number = 0;
  settings: AppSettings;

  selectedSupplierId: string;
  showSidebar: boolean = false;
  sidebarCategories: Array<any> = [];
  categories: Array<any> = [];
  categoryFlowId: any;

  categoryFilter: CategoryFilter;

  isLoading: boolean = true;

  is_n_level: number = 0;
  showSubCat: number = 0;
  subCategories: Array<any> = [];
  subCatIndex: number = -1;
  subCategoryIds: Array<any> = [];
  selectedCatIds: Array<any> = [];
  isProcessing: boolean = false;
  sortBy: number = 0;
  public catShortValue: number;
  
  constructor(
    private route: ActivatedRoute,
    public util: UtilityService,
    private http: HttpService,
    private router: Router,
    private user: UserService,
    private seo: SeoService,
    private localization: LocalizationPipe,
    public dialogService: DialogService,
    private cacheService: DataCacheService
  ) {
    this.style = new StyleVariables();
    this.pagination = new PaginationModel();
    this.categoryFilter = new CategoryFilter();
  }

  ngOnInit() {
    this.seo.updateTitle(`${this.localization.transform('suppliers')} | ${GlobalVariable.SITE_NAME}`);

    this.styleSubscription = this.util.getStyles.subscribe(styles => {
      this.style = styles;
    });

    this.settingsSubscription = this.util.getSettings.subscribe(
      (settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      }
    );

    this.routeSubscription = this.route.queryParams.subscribe(params => {
      this.categoryId = params["cat_id"] ? params["cat_id"] : null;
      this.isRecommendedSuppliers = params["rec"] && params["rec"] == 1 ? true : false;
      this.is_subCat = params["is_subCat"] ? parseInt(params["is_subCat"]) : 0;
      this.is_all = params["all"] ? parseInt(params["all"]) : 0;
      this.is_favourite = params["favourites"] ? parseInt(params["favourites"]) : 0;
      this.categoryFilter.catId = this.categoryId;
      this.categoryFilter.subCatId = params['subCat_id'];
      this.categoryFilter.childCatId = params['childCat_id'];
      this.search = params['search'];
      this.tags = params['tags'] ? params['tags'].split(',') : [];
      this.isTagSearch = params['tag_search'] && params['tag_search'] == 1 ? true : false;
      let previousCatName = this.categoryName;
      this.categoryName = params["cat_name"];
      this.showSubCat = parseInt(params['n_lvl']);
      this.is_n_level = parseInt(params['n_lvl']);
      this.sortBy = params['sort'] ? parseInt(params['sort']) : 0;
      if(params['mode']) this.catShortValue = parseInt(params['mode']);
      if (this.showSubCat) {
        this.getNlevelData();
      } else {
        this.subscribeData();
      }
      if (previousCatName && previousCatName != this.categoryName) this.subscribeData();
    });

    if (this.categoryName) {
      this.seo.updateTitle(`${this.categoryName} | ${GlobalVariable.SITE_NAME}`);
    }

    this.categorySubscription = this.util.getLanguageCategoryData.subscribe((data) => {
      if (data && data.english) {
        if (this.settings.isCustomFlow) {
          const category = this.util.getLocalData('selected_category', true) || data.english.find(c => c.type == this.settings['app_type']);
          this.categoryFlowId = category.id;
          this.categories = category['sub_category'] || [];
        } else {
          this.categories = data.english;
        }
      }

      this.subscribeData();
    });

  }

  subscribeData() {
    this.dataSubscription = this.util.callGetData.subscribe(showData => {
      if (showData) {
        if (this.isRecommendedSuppliers) {
          this.getRecommendedSuppliers();
        } else if (this.is_favourite) {
          this.getFavourites();
        } else if (this.is_all) {
          this.getAllSuppliers();
        } else if (this.isTagSearch) {
          this.getProductSupplierList();
        } else {
          this.getSuppliers();
        }
      }
    });
  }

  onSortBy(sortBy: number) {
    this.sortBy = sortBy;
    this.cacheService.removeKey(ApiUrl.getHomeSuppliers);
    this.getAllSuppliers();
  }

  onCatSortBy(catShortBy: number) {
    this.catShortValue = catShortBy;
    this.cacheService.removeKey(ApiUrl.getHomeSuppliers);
    this.getAllSuppliers();
  }


  getNlevelData() {
    if (this.showSubCat) {
      let param_data = {
        categoryId: this.categoryFilter.subCatId || this.categoryFilter.catId,
        languageId: this.util.handler.languageId,
      };
      this.isProcessing = true;
      this.http.postData(ApiUrl.getSubcategory, param_data, true)
        .subscribe(response => {
          if (!!response && response.data) {
            if (this.settings.app_type == 1) {
              if (response.data.length == 0 || response.data[0].menu_type == 0) {
                this.gotoSupplierList({ id: param_data.categoryId, name: this.categoryName });
              }
              this.subCategories.push(response.data);
              this.subCatIndex++;
              return;
            }
            let selected_cat = (response.data).find(el => el.sub_category_id == this.categoryFilter.childCatId);
            if (!!selected_cat) {
              selected_cat['id'] = selected_cat['sub_category_id'];
              this.onSubCatSelect(selected_cat, true);
            }
          }
        });
    }
  }

  getSuppliers() {
    if (this.settings.isCustomFlow && !this.categoryFlowId) return;
    this.isLoading = true;
    let param_data = {
      languageId: this.util.handler.languageId,
      categoryId: this.categoryId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude,
      search: this.search,
      sort_by: this.sortBy
    };

    if (this.settings.isCustomFlow) {
      param_data.categoryId = this.categoryFlowId;
      param_data['subCat'] = this.categoryId;
    }

    this.noData = false;
    this.http
      .postData(ApiUrl.getSupplierList, param_data)
      .subscribe(response => {
        if (!!response && response.data) {
          if (response.data.supplierList.length == 1 && !this.showSubCat) {
            this.supplierDetail(response.data.supplierList[0]);
            return;
          }
          this.suppliers = response.data.supplierList;
          this.suppliers.map((data: any) => {
            parseFloat(data["rating"]);
            data["display_supplier_image"] = this.util.thumbnail(
              data["supplier_image"]
            );
            data["display_logo"] = this.util.thumbnail(data["logo"]);
          });
        }
        this.noData = true;
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  getAllSuppliers() {
    this.isLoading = true;
    let param_data = {
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude,
      sort_by: this.sortBy,
      search: this.search
    };
    if (this.settings.app_type == 1) {
      param_data['self_pickup'] = this.util.handler.selfPickup;
      switch (this.catShortValue) {
        case 0:
          param_data['self_pickup'] = 0;
          param_data['is_dine_in'] = 0;
          break;
        case 1:
          param_data['self_pickup'] = 1;
          param_data['is_dine_in'] = 0;
          break;
        case 2:
          param_data['is_dine_in'] = 1;
          param_data['self_pickup'] = 0;
          break;
      }
    }
    this.noData = false;
    this.http
      .getData(ApiUrl.getHomeSuppliers, param_data)
      .subscribe(response => {
        if (!!response && response.data) {
          this.suppliers = response.data;
          this.suppliers.map((data: any) => {
            parseFloat(data["rating"]);
            data["display_supplier_image"] = this.util.thumbnail(
              data["supplier_image"]
            );
            data["display_logo"] = this.util.thumbnail(data["logo"]);
          });
        }
        this.noData = true;
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  getRecommendedSuppliers() {
    this.isLoading = true;
    let params = {
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    };
    this.noData = false;
    this.http.getData(ApiUrl.getSpecialOffers, params).subscribe(response => {
      this.noData = true;
      if (!!response && response.data) {
        this.suppliers = response.data.SupplierInArabic;
        this.suppliers.map((data: any) => {
          parseFloat(data["rating"]);
          data["display_supplier_image"] = this.util.thumbnail(
            data["supplier_image"]
          );
          data["display_logo"] = this.util.thumbnail(data["logo"]);
        });
      }
      this.isLoading = false;
    }, (err) => this.isLoading = false);
  }

  getFavourites() {
    this.isLoading = true;
    this.suppliers = [];
    let param_data = {
      languageId: this.util.handler.languageId,
      accessToken: this.user.getUserToken,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    };
    this.noData = false;
    this.http
      .postData(ApiUrl.favourite.getFavourites, param_data)
      .subscribe(response => {
        if (!!response && response.data) {
          this.suppliers = response.data.favourites;
          this.suppliers.map((data: any) => {
            parseFloat(data["rating"]);
            data["id"] = data["supplier_id"];
            data["display_supplier_image"] = this.util.thumbnail(
              data["supplier_image"]
            );
            data["display_logo"] = this.util.thumbnail(data["logo"]);
          });
        }
        this.noData = true;
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  getProductSupplierList() {
    this.isLoading = true;
    let param_data = {
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude,
      productName: this.tags
    };
    this.noData = false;
    this.http
      .postData(ApiUrl.productSupplierList, param_data)
      .subscribe(response => {
        if (!!response && response.data) {
          this.suppliers = response.data.supplier;
          this.suppliers.map((data: any) => {
            parseFloat(data["rating"]);
            data["display_supplier_image"] = this.util.thumbnail(
              data["supplier_image"]
            );
            data["display_logo"] = this.util.thumbnail(data["logo"]);
          });
        }
        this.noData = true;
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  onLogoLoad(supplier) {
    supplier["display_logo"] = supplier["logo"];
  }

  onImageLoad(supplier) {
    supplier["display_supplier_image"] = supplier["supplier_image"];
  }

  supplierDetail(supplier: any) {
    if (this.settings.app_type == 1) {
      this.router.navigate(["products/listing"], {
        queryParams: {
          supplierId: supplier.id
        }
      });
    } else if (this.settings.app_type == 8) {
      let cat_ids: Array<any> = [];

      if (supplier.category && supplier.category.length) {
        supplier["category"].forEach(element => {
          cat_ids.push(element.category_id);
        });
      }

      const param_obj = Object.assign({}, this.util.handler);
      param_obj['agent'] = 1;
      param_obj["supplierId"] = [supplier.id];
      param_obj['categoryId'] = cat_ids.join();
      param_obj["showSupplier"] = false;
      param_obj['branch_id'] = supplier.supplier_branch_id;

      const queryParams = this.route.snapshot.queryParams;

      if (this.is_n_level) {
        param_obj['subCatId'] = [this.selectedCatIds[this.selectedCatIds.length - 1]];
      } 
      // else {
      //   param_obj['subCatId'] = Object.values(queryParams).filter(value => {
      //     let parsed = Number.parseInt(value);
      //     if (!Number.isNaN(parsed)) return parsed;
      //   });
      // }

      // if (this.router.url.startsWith('/')) {
      //   this.util.clearLocalData('ques_data');
      //   this.util.setCart([]);
      //   param_obj["showSupplier"] = true;
      // }

      this.router.navigate(["/products/product-listing", supplier.name], {
        queryParams: { f: this.util.encryptData(param_obj) }
      });
    } else {
      this.isLoading = true;

      this.showSidebar = false;
      this.selectedSupplierId = supplier.id;

      const query_params = {
        categoryId: this.categoryId,
        languageId: this.util.handler.languageId,
        supplierId: supplier.id
      }

      this.http.postData(ApiUrl.getSubcategory, query_params, false)
        .subscribe((response) => {
          if (!!response && response.data) {
            if (response.data && response.data.length) {
              this.sidebarCategories = response.data;
              this.showSidebar = true;
            } else {
              this.sidebarCategories = [];
              this.showSidebar = false;
            }
          }
          this.isLoading = false;

        }, (err) => this.isLoading = false);
    }

    //   if (this.categoryId) {
    //     this.router.navigate(["supplier/supplier-detail"], {
    //       queryParams: {
    //         sup_id: supplier.id,
    //         branch_id: supplier.supplier_branch_id,
    //         cat_id: this.categoryId,
    //         name: this.categoryName
    //       }
    //     });
    //   } else {
    //     let cat_ids: Array<any> = [];
    //     supplier["category"].forEach(element => {
    //       cat_ids.push(element.category_id);
    //     });
    //     this.router.navigate(["supplier/supplier-detail"], {
    //       queryParams: {
    //         sup_id: supplier.id,
    //         branch_id: supplier.supplier_branch_id,
    //         cat_ids: cat_ids.join(),
    //       }
    //     });
    //   }
    // }
  }

  onFavourite(id: string) {
    if (this.is_favourite != 1) return;
    this.suppliers = this.suppliers.filter((supplier) => supplier.id !== id);
  }

  closeSidebar($event: boolean) {
    this.showSidebar = $event;
  }

  onSubCatSelect(subCatData: any, append: boolean) {
    this.selectedCatIds.push(subCatData["id"]);
    if (subCatData["is_subcategory"] && (this.settings.app_type == 8 || this.settings.app_type == 1 && subCatData.menu_type == 1)) {
      let param_data = {
        categoryId: subCatData.id || subCatData['category_id'],
        languageId: this.util.handler.languageId,
        // supplierId: this.supplierData['id']
      };

      this.isProcessing = true;
      this.http.postData(ApiUrl.getSubcategory, param_data, true)
        .subscribe(response => {
          if (!!response && response.data) {
            response.data.map(data => {
              data["id"] = data["sub_category_id"];
            });

            if (response.data.length == 0 || response.data[0].menu_type == 0) {
              this.gotoSupplierList(subCatData)
            }

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
            this.showSubCat = 0;
            this.subCategoryIds = [subCatData['id'] || subCatData['category_id']];
            this.categoryName = subCatData['name'];
            this.getSuppliers();
            // this.filterProducts(false);
          }
        });
      } else {
        this.showSubCat = 0;
        this.subCategoryIds = [subCatData['id'] || subCatData['category_id']];
        this.categoryName = subCatData['name'];
        this.getSuppliers();
        // this.filterProducts(false);
      }
    }
  }

  gotoSupplierList(subCatData: any) {
    this.showSubCat = 0;
    this.subCategoryIds = [subCatData['id'] || subCatData['category_id']];
    this.categoryName = subCatData['name'];
    this.getSuppliers();
  }


  ngOnDestroy() {
    if (!!this.routeSubscription) this.routeSubscription.unsubscribe();
    if (!!this.dataSubscription) this.dataSubscription.unsubscribe();
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
    if (!!this.categorySubscription) this.categorySubscription.unsubscribe();
  }
}
