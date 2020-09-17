import { GlobalVariable } from './../../../../../core/global';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChanges } from "@angular/core";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: "app-recommended-suppliers",
  templateUrl: "./recommended-suppliers.component.html",
  styleUrls: ["./recommended-suppliers.component.scss"]
})
export class RecommendedSuppliersComponent implements OnInit, OnChanges, OnDestroy {


  @Input() recommendedData: any;
  @Input() isLoading: boolean = false;

  style: StyleVariables;
  styleSubscription: Subscription;
  settingsSubscription: Subscription;
  currency: string = "";
  supplier: any;
  showSupplier: boolean = false;
  suppliers: Array<any> = [];
  settings: AppSettings;
  parentIndex: number = -1;
  childIndex: number = -1;

  siteName: string = '';

  constructor(
    public util: UtilityService,
    private router: Router,
  ) {
    this.siteName = GlobalVariable.SITE_NAME;
    this.style = new StyleVariables();
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe(
      (style: StyleVariables) => {
        this.style = style;
      }
    );

    this.settingsSubscription = this.util.getSettings.subscribe(
      (settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      }
    );

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.recommendedData && changes.recommendedData.currentValue) {
      this.getSuppliers();
    }
  }

  getSuppliers() {
    if (!this.recommendedData) { return }
    this.recommendedData.map((data: any) => {
      this.currency = GlobalVariable.CURRENCY;
      parseFloat(data["rating"]);
      data["display_supplier_image"] = this.util.thumbnail(
        data["supplier_image"]
      );
      data["display_logo"] = data["logo"];
    });
    this.suppliers = this.recommendedData;
  }

  onSeeMore() {
    this.router.navigate(['/supplier/supplier-list'], {
      queryParams: {
        'rec': 1
      }
    })
  }

  ngOnDestroy() {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
  }
}
