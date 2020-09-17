import { AppSettings } from '../../../shared/models/appSettings.model';
import { StyleConstants } from '../../../core/theme/styleConstants.model';
import { StyleVariables } from '../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { ApiUrl } from '../../../core/apiUrl';
import { UtilityService } from '../../../services/utility/utility.service';
import { HttpService } from '../../../services/http/http.service';
import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ecom-categories',
  templateUrl: './ecom-categories.component.html',
  styleUrls: ['./ecom-categories.component.scss']
})
export class EcomCategoriesComponent implements OnInit, OnDestroy {

  @Input() categoryId: any;

  @ViewChild('toggleCatBtn', { static: false }) toggleCatBtn: ElementRef
  categories: Array<any> = [];
  subCategories: Array<any> = [];
  selectedMulSubCat: Array<any> = [];
  mulCatPath: Array<any> = [];

  getDataSubscribe: Subscription;
  settingsSubscription: Subscription;
  style: StyleVariables;
  checkbox: StyleConstants;
  catBtn: StyleConstants;
  hoverIndex: number = -1;
  hoverCatIndex: number = -1;
  hoverParentIndex: number = -1;

  showSubcat: boolean = false;
  selectedCategory: string = '';
  parent_id: any = '';

  settings: AppSettings;
  isLoading: boolean = false;

  constructor(
    private http: HttpService,
    public util: UtilityService,
    private router: Router,
    private route: ActivatedRoute) {

    this.style = new StyleVariables();
    this.checkbox = new StyleConstants();
    this.catBtn = new StyleConstants();
  }


  ngOnInit() {
    this.util.getStyles.subscribe(style => {
      this.style = style;
      this.catBtn.color = style.primaryColor;
    });

    this.settingsSubscription = this.util.getSettings.subscribe(
      (settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      });

    this.dataSubscribe();
  }

  dataSubscribe() {
    this.getDataSubscribe = this.util.callGetData.
      subscribe((data) => {
        if (data) {
          this.getCategories();
        }
      });
  }

  getCategories() {
    let param_data = {
      language_id: this.util.handler.languageId
    }
    this.isLoading = true;
    this.http.getData(ApiUrl.getCategories, param_data, true)
      .subscribe(response => {
        if (!!response && response.data) {
          if (this.settings.isCustomFlow) {
            const category = response['data'].find((c) => c.type == this.settings.app_type);
            this.categories = category ? category['sub_category'] || [] : [];
          } else {
            if (!this.categoryId) {
              this.categories = response['data'];
            } else {
              const data = response['data'].find(o => o.id == this.categoryId);
              this.categories = data.sub_category;
            }

          }
        }
        this.isLoading = false;
      });
  }

  openCategorySelection() {
    this.subCategories = [];
    this.mulCatPath = [];
    this.selectedMulSubCat = [];
    this.showSubcat = false;
  }

  flowCheck(category: any, isHover: boolean) {
    this.showSubcat = !isHover;
    if (category['sub_category'] && category['sub_category'].length) {
      this.selectCat(category);
    } else {
      if (!isHover) {
        this.selectedCategory = category['id'];
        this.viewProducts();
      }
    }
  }

  removePickUpDateTime() {
    this.util.clearLocalData('pickUp_DT');
  }

  supplierList(category: any) {
    this.removePickUpDateTime();
    this.toggleCatBtn.nativeElement.click();
    this.router.navigate(['/supplier/supplier-list'], { queryParams: { cat_id: category.id, cat_name: category.name } });
  }

  categoryDetail(category: any) {
    if (!this.categoryId && category.sub_category && category.sub_category.length) {
      this.router.navigate(['/products/category-details'], { queryParams: { cat_id: category.id } });
    } else {
      this.subCategories.push(category);
      this.selectedMulSubCat = [];
      if (!!this.categoryId) { this.selectedMulSubCat.push(this.categoryId); }

      this.selectedMulSubCat.push(category.id);
      this.viewProducts();
    }
  }

  selectCat(category: any) {
    if (category.sub_category && category.sub_category.length) {
      this.showSubcat = true;
      this.selectedCategory = category.id;
      if (!this.subCategories.length) {
        this.subCategories.push(category);
      } else {
        this.subCategories[0] = category;
        this.subCategories.splice(1, this.subCategories.length - 1);
        this.selectedMulSubCat = [];
      }
    } else {
      this.showSubcat = false;
      this.selectedMulSubCat = [];
    }

    this.viewProducts();
  }

  viewProducts() {
    this.removePickUpDateTime();
    let selectedCatPath: Array<string> = [];
    this.subCategories.forEach(cat => {
      selectedCatPath.push(cat['name']);
    });
    if (this.mulCatPath.length) {
      selectedCatPath.push(this.mulCatPath.join(', '));
    }

    let seoValue = selectedCatPath.length ? selectedCatPath[selectedCatPath.length - 1].replace(/ &/g, '-') : '';
    let param_obj = {};
    Object.assign(param_obj, this.util.handler);
    param_obj['subCatId'] = this.selectedMulSubCat.length ? this.selectedMulSubCat : [this.selectedCategory];
    param_obj['category'] = this.selectedCategory;
    param_obj['product'] = this.route.snapshot.queryParamMap.get("product");
    param_obj['path'] = selectedCatPath;
    this.router.navigate(['/products', 'product-listing', seoValue], {
      queryParams: { f: this.util.encryptData(param_obj) }
    });

  }

  ngOnDestroy() {
    this.getDataSubscribe.unsubscribe();
  }

}
