import { ApiUrl } from './../../../../../core/apiUrl';
import { HttpService } from './../../../../../services/http/http.service';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { DataCacheService } from './../../../../../services/data-cache/data-cache.service';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { skip } from 'rxjs/operators';


@Component({
  selector: "app-suppliers",
  templateUrl: "./suppliers.component.html",
  styleUrls: ["./suppliers.component.scss"]
})
export class SuppliersComponent implements OnInit, OnDestroy {
  styleSubscription: Subscription;
  settingsSubscription: Subscription;
  themeSubscription: Subscription;
  pickupSubscription: Subscription;
  locationSubscription: Subscription;
  categorySubscription: Subscription;

  style: StyleVariables;
  settings: AppSettings;
  supplierId: string = "";
  allSuppliers: Array<any> = [];
  categories: Array<any> = [];
  count: number = 0;
  childIndex: number = -1;
  parentIndex: number = -1;
  isDarkTheme: boolean = false;
  isLoading: boolean = false;
  sortBy: number = 1; // distance wise sort

  constructor(
    private cacheService: DataCacheService,
    public util: UtilityService,
    private http: HttpService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe(
      (style: StyleVariables) => {
        this.style = style;
      }
    );

    this.makeSubscription();

    this.themeSubscription = this.util.getDarkTheme.subscribe((darkTheme) => {
      this.isDarkTheme = darkTheme;
    });

    this.locationSubscription = this.util.getUserLocation.pipe(skip(1)).subscribe((location) => {
      this.cacheService.removeKey(ApiUrl.getHomeSuppliers);
      this.getSuppliers();
    });

    this.categorySubscription = this.util.getLanguageCategoryData.subscribe((data) => {
      if (data && data.english) {
        this.categories = data.english;
        this.getSuppliers();
      }
    })

  }

  makeSubscription() {
    this.settingsSubscription = this.util.getSettings.subscribe(
      (settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
          this.pickupSubscription = this.util.getSelfPickup.pipe(skip(1)).subscribe(() => {
            this.cacheService.removeKey(ApiUrl.getHomeSuppliers);
            this.getSuppliers();
          });
        }
      }
    );
  }

  getSuppliers() {
    this.isLoading = true;
    let param_data = {
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude,
      sort_by: this.sortBy
    };

    if (this.settings.app_type == 1) {
      param_data['self_pickup'] = this.util.handler.selfPickup;
    }

    if (this.settings.isCustomFlow) {
      let categoryId = this.route.snapshot.queryParams['cat_flow_id'];
      param_data['categoryId'] = categoryId || (this.categories.find(c => c.type == this.settings.app_type)).id
    }

    this.http.getData(ApiUrl.getHomeSuppliers, param_data, true, !this.settings.isCustomFlow)
      .subscribe(response => {
        if (!!response && response.data) {
          this.allSuppliers = [];
          this.count = response.data.length;
          this.allSuppliers = response.data.slice(0, 12);
          this.allSuppliers.map(data => {
            data["display_supplier_image"] = this.util.thumbnail(
              data["supplier_image"]
            );
            data["display_logo"] = this.util.thumbnail(data["logo"]);
          });
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  onSortBy(sortBy: number) {
    this.sortBy = sortBy;
    this.cacheService.removeKey(ApiUrl.getHomeSuppliers);
    this.getSuppliers();
  }

  onLogoLoad(supplier) {
    supplier["display_logo"] = supplier["logo"];
  }

  onImageLoad(supplier) {
    supplier["display_supplier_image"] = supplier["supplier_image"];
  }

  productList(supplier) {
    if (this.settings.app_type == 1) {
      this.router.navigate(["/products", "listing"], {
        queryParams: {
          supplierId: supplier.id
        }
      });
    } else {
      let cat_ids: Array<any> = [];
      supplier["category"].forEach(element => {
        cat_ids.push(element.category_id);
      });
      this.router.navigate(['/supplier', 'supplier-detail'], {
        queryParams: {
          sup_id: supplier.id,
          branch_id: supplier.supplier_branch_id,
          cat_ids: cat_ids.join(),
        }
      });
    }
  }

  onSeeMore() {
    this.router.navigate(['/supplier', 'supplier-list'], {
      queryParams: {
        all: 1,
        sort: this.sortBy
      }
    })
  }

  ngOnDestroy() {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
    if (!!this.themeSubscription) this.themeSubscription.unsubscribe();
    if (!!this.locationSubscription) this.locationSubscription.unsubscribe();
    if (!!this.pickupSubscription) this.pickupSubscription.unsubscribe();
    if (!!this.categorySubscription) this.categorySubscription.unsubscribe();
  }
}
