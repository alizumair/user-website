import { GlobalVariable } from './../../../../core/global';
import { Router, ActivatedRoute } from '@angular/router';
import { UtilityService } from './../../../../services/utility/utility.service';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-ecom-recommended-suppliers',
  templateUrl: './ecom-recommended-suppliers.component.html',
  styleUrls: ['./ecom-recommended-suppliers.component.scss']
})
export class EcomRecommendedSuppliersComponent implements OnInit {

  @Input() recommendedData: any;
  @Input() settings: AppSettings;
  @Input() style: StyleVariables;
  @Input() isLoading: boolean = false;

  currency: string = "";
  supplier: any;
  showSupplier: boolean = false;
  suppliers: Array<any> = [];
  parentIndex: number = -1;
  childIndex: number = -1;

  siteName: string = '';

  constructor(
    public util: UtilityService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.siteName = GlobalVariable.SITE_NAME;
    this.style = new StyleVariables();
  }

  ngOnInit() {
  }

  onImgError(event) {
    if (this.settings.app_type == 2 && this.settings.selected_template == 2) {
      event.target.src = './assets/images/placeholder_new.jpeg';
    } else {
      event.target.src = './assets/images/placeholder_image.svg';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.recommendedData && changes.recommendedData.currentValue) {
      this.getSuppliers();
    }
  }

  getSuppliers() {
    console.log(this.recommendedData)
    if (!this.recommendedData) { return }
    this.recommendedData.map((data: any) => {
      this.currency = GlobalVariable.CURRENCY;
      parseFloat(data["rating"]);
      data["display_supplier_image"] = this.util.thumbnail(
        data["supplier_image"]
      );
      data["display_logo"] = this.util.thumbnail(data["logo"]);
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

  productList(supplier) {
    if (this.settings.app_type == 1) {
      this.router.navigate(["/products/listing"], {
        queryParams: {
          supplierId: supplier.id
        }
      });
    } else if (this.settings.app_type == 2) {
      let cat_ids: Array<any> = [];

      if (supplier.category && supplier.category.length) {
        supplier["category"].forEach(element => {
          cat_ids.push(element.category_id);
        });
      }
      let seoValue = supplier.name;
      let param_obj = {};
      Object.assign(param_obj, this.util.handler);
      param_obj["supplierId"] = [supplier.id];
      param_obj["showSupplier"] = true;
      param_obj['branch_id'] = supplier.supplier_branch_id;
      param_obj['categoryId'] = cat_ids.join();
      this.router.navigate(["/products/product-listing", seoValue], {
        queryParams: { f: this.util.encryptData(param_obj) }
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

      param_obj['subCatId'] = Object.values(queryParams).filter(value => {
        let parsed = Number.parseInt(value);
        if (!Number.isNaN(parsed)) return parsed;
      });

      if (this.router.url.startsWith('/')) {
        this.util.clearLocalData('ques_data');
        this.util.setCart([]);
        param_obj["showSupplier"] = true;
      }

      this.router.navigate(["/products/product-listing", supplier.name], {
        queryParams: { f: this.util.encryptData(param_obj) }
      });
    } else {
      let cat_ids: Array<any> = [];

      if (supplier.category && supplier.category.length) {
        supplier["category"].forEach(element => {
          cat_ids.push(element.category_id);
        });
      }

      this.router.navigate(["", "supplier", "supplier-detail"], {
        queryParams: {
          sup_id: supplier.id,
          branch_id: supplier.supplier_branch_id,
          cat_ids: cat_ids.join()
        }
      });
    }
  }

}
