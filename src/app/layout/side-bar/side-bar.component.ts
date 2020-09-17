import { AppSettings } from './../../shared/models/appSettings.model';
import { StyleConstants } from './../../core/theme/styleConstants.model';
import { GlobalVariable } from './../../core/global';
import { StyleVariables } from './../../core/theme/styleVariables.model';
import { FiltersModel } from './../../shared/models/filters.model';
import { Component, OnInit, Input, SimpleChanges, OnChanges, OnDestroy, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { ApiUrl } from './../../core/apiUrl';
import { UtilityService } from './../../services/utility/utility.service';
import { HttpService } from './../../services/http/http.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit, OnChanges, OnDestroy {

  @Input() showFilters: any;
  @Input() settings: AppSettings;

  @Input() isLoading: boolean = true;

  @ViewChild('closeModal', { static: false }) closeModal: ElementRef;

  @Output()
  displayFilter: EventEmitter<boolean> = new EventEmitter<boolean>();

  styleSubscription: Subscription;
  filterSubscription: Subscription;
  settingsSubscription: Subscription;
  categorySubscription: Subscription;

  priceCollapse: boolean = true;
  sortCollapse: boolean = true;
  subCatBtn: boolean = false;
  isShowFilter: boolean = false;

  style: StyleVariables;
  submitBtn: StyleConstants;
  checkbox: StyleConstants;
  catBtn: StyleConstants;

  brands: Array<any> = [];
  allBrands: Array<any> = [];
  variants: Array<any> = [];
  selectedVariants: Array<any> = [];
  selectedBrands: Array<any> = [];
  selectedBrandsFromModal: Array<any> = [];
  // supplierId: Array<any> = [];
  categoryData: Array<any> = [];
  subCategoryData: any = [];
  selectedCatPath: Array<any> = [];
  selectedMulSubCat: Array<any> = [];
  selectedMulCatPath: Array<any> = [];

  filters: FiltersModel;
  colorPattern: RegExp;

  selectedCategory: string = '';
  brandSearch: string = '';
  subCatIndex: number = 0;

  selectedCategoryId: string = '';
  subCategoryAr: Array<any> = [];
  selectedSubCategory: Array<any> = [];

  constructor(
    private http: HttpService,
    public util: UtilityService,
    private router: Router,
    private route: ActivatedRoute) {

    this.filters = new FiltersModel();
    this.style = new StyleVariables();
    this.submitBtn = new StyleConstants();
    this.checkbox = new StyleConstants();
    this.catBtn = new StyleConstants();
    this.colorPattern = new RegExp(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles
      .subscribe((styleData: StyleVariables) => {
        this.style = styleData;
        this.submitBtn.backgroundColor = '#ffffff';
        this.submitBtn.color = styleData.primaryColor;
        this.submitBtn.borderColor = styleData.primaryColor;
        this.checkbox.borderColor = styleData.primaryColor;
        this.checkbox.backgroundColor = styleData.primaryColor;
        this.catBtn.backgroundColor = styleData.primaryColor;
        this.catBtn.borderColor = styleData.primaryColor;
        this.catBtn.color = '#ffffff';
      });
    this.getFilterData();

    if (this.settings) {
      if (this.settings.app_type == 1) {
        this.getCategories();
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    const check: any = changes.showFilters['currentValue'];
    if (check['show'] && check['catId']) {
      this.variants = [];
      this.brands = [];
      this.getVariants(check['catId']);
      this.selectedCategory = check['catId'];
    } else {
      this.displayFilter.emit(this.isShowFilter);
    }
    if (check['filter']) {
      this.selectedVariants = check['filter'].variant_ids;
      this.selectedBrands = check['filter'].brand_ids;
    }

    if (this.settings.category_selection == 1 &&
      check['subCatIds'] && check['subCatIds'].length) {
      this.selectedCategoryId = check['subCatIds'][0];
      this.getCategories();
    }

    if (this.settings.selected_template == 3) {
      if (check['subCatIds'] && check['subCatIds'].length) {
        this.selectedCategoryId = check['subCatIds'][0];
        if (check['subCatIds'].length > 1) {
          this.selectedSubCategory = [...check['subCatIds']];
          this.selectedSubCategory.shift();
        }
      }
      this.getCategories();
    }

    if (this.settings.selected_template == 4) {
      if (check['subCatIds'] && check['subCatIds'].length) {
        this.selectedCategoryId = check['subCatIds'][0];
        if (check['subCatIds'].length > 1) {
          this.selectedSubCategory = [...check['subCatIds']];
          this.selectedSubCategory.shift();
        }
      }
      this.getCategories();
    }
  }

  getCategories() {
    this.categorySubscription = this.util.getLanguageCategoryData
      .subscribe(categories => {
        if (categories) {
          this.categoryData = (categories.english).slice();
          const x = this.categoryData.find(o => o.id == this.selectedCategoryId);
          if (!!x) {
            this.subCategoryAr = [...x.sub_category];
          }
        }
      });
  }

  blurEvent() {
    this.subCategoryData = [];
    this.selectedCatPath = [];
    this.selectedMulSubCat = [];
    this.selectedMulCatPath = [];
    this.subCatIndex = 0;
  }

  catSelect(category: any, is_category: boolean) {
    if (is_category) {
      this.blurEvent();
    }
    let paramData = {
      categoryId: is_category ? category.id : category.sub_category_id,
      languageId: this.util.handler.languageId
    };
    this.http.postData(ApiUrl.getSubcategory, paramData, true)
      .subscribe(response => {
        if (!!response && response.data) {
          let subCatData = {
            subCategories: response.data,
            categoryName: category.name
          };
          this.selectedCatPath.push(category.name);
          this.subCategoryData.push(subCatData);
          if (!is_category) {
            this.subCatIndex++;
          }
        }
      });
  }

  goBack() {
    if (this.subCatIndex > 0) {
      this.subCategoryData.splice(this.subCatIndex, 1);
      this.selectedCatPath.splice(this.subCatIndex, 1);
      this.selectedMulSubCat = [];
      this.selectedMulCatPath = [];
      this.subCatIndex--;
    }
  }

  viewProducts() {
    if (this.selectedMulCatPath.length) {
      this.selectedCatPath.push(this.selectedMulCatPath.join(', '));
    }
    let seoValue = this.selectedCatPath[this.selectedCatPath.length - 1].replace(/ &/g, '-');
    let param_obj = { ...this.util.handler };
    param_obj['subCatId'] = [];
    param_obj['subCatId'] = this.selectedMulSubCat;
    param_obj['category'] = this.selectedCategory;
    param_obj['product'] = this.route.snapshot.queryParamMap.get("product");
    param_obj['supplierId'] = null;
    param_obj['path'] = this.selectedCatPath;

    this.router.navigate(['/', 'products', 'product-listing', seoValue], {
      queryParams: { f: this.util.encryptData(param_obj) },
      queryParamsHandling: 'merge'
    });
    this.subCategoryData = [];
  }


  selectMulSubCat(subCategory) {
    if (this.selectedMulSubCat.includes(subCategory.sub_category_id)) {
      this.selectedMulSubCat.splice(this.selectedMulSubCat.indexOf(subCategory.sub_category_id), 1);
      this.selectedMulCatPath.splice(this.selectedMulSubCat.indexOf(subCategory.name), 1)
    } else {
      this.selectedMulSubCat.push(subCategory.sub_category_id);
      this.selectedMulCatPath.push(subCategory.name);
    }
  }

  getFilterData() {
    this.filterSubscription = this.util.getFilters
      .subscribe(filterData => {
        this.filters.is_availability = filterData.is_availability;
        this.filters.is_discount = filterData.is_discount;
        this.filters.max_price_range = filterData.max_price_range;
        this.filters.min_price_range = filterData.min_price_range;
        this.filters.low_to_high = filterData.low_to_high;
        this.filters.subCategoryId = filterData.subCategoryId;
      });
  }

  getVariants(catId: any) {
    this.selectedVariants = [];
    let param_data = {
      category_id: catId,
      languageId: this.util.handler.languageId
    }
    this.http.postData(ApiUrl.getVariantList, param_data)
      .subscribe(response => {
        if (!!response) {
          this.brands = response.brands;
          this.allBrands = [...response.brands];
          this.variants = response.data;
          if ((this.allBrands && this.allBrands.length) || (this.variants && this.variants.length)) {
            this.isShowFilter = true;
          } else {
            this.isShowFilter = false;
          }
          this.displayFilter.emit(this.isShowFilter);
        }
      });
  }

  filterProducts() {
    this.filters.is_availability = +this.filters.is_availability;
    this.filters.is_discount = +this.filters.is_discount;
    this.filters.low_to_high = +this.filters.low_to_high;
    this.filters.variant_ids = this.selectedVariants;
    this.filters.brand_ids = this.selectedBrands;
    this.filters.subCategoryId = this.selectedSubCategory;
    this.util.setFilters(this.filters);
  }

  selectVariant(variantId) {
    if (this.selectedVariants.includes(variantId))
      this.selectedVariants.splice(this.selectedVariants.indexOf(variantId), 1);
    else
      this.selectedVariants.push(variantId);
    this.filterProducts();
  }

  selectSubCategory(subCatId: any) {
    if (this.selectedSubCategory.includes(subCatId)) {
      this.selectedSubCategory.splice(this.selectedBrands.indexOf(subCatId), 1);
    } else {
      this.selectedSubCategory.push(subCatId);
    }
    this.filterProducts();
  }

  selectCategory(category) {
    if (!!category.sub_category && category.sub_category.length) {

    } else {
      this.selectSingleSubCategory(category.id, category.id);
    }
  }

  selectSingleSubCategory(catId: any, subCatId: any) {
    this.selectedSubCategory = [];
    this.selectedCategoryId = catId;
    this.selectedSubCategory.push(subCatId);
    this.filterProducts();
  }

  selectBrand(brandId: any, type: string) {
    if (this.selectedBrands.includes(brandId))
      this.selectedBrands.splice(this.selectedBrands.indexOf(brandId), 1);
    else
      this.selectedBrands.push(brandId);
    if (type === 'min') this.filterProducts();
  }

  submitBrands() {
    this.filters.brand_ids = this.selectedBrands;
    this.util.setFilters(this.filters);
  }

  resetFilters() {
    this.filters = new FiltersModel();
    this.selectedBrands = [];
    this.selectedVariants = [];
    this.util.setFilters(this.filters);
  }

  searchBrand(brandName) {
    if (brandName) {
      let regex = new RegExp(brandName, "i");
      let arr = [];
      this.brands.forEach(element => {
        if (element['name'].match(regex)) {
          arr.push(element);
        }
      });
      this.allBrands = arr;
    } else {
      this.allBrands = this.brands;
    }
  }

  onDiscount($event) {
    this.filters.is_discount = $event.target.checked;
    this.filterProducts();
  }

  ngOnDestroy() {
    if(this.selectedSubCategory.length) this.selectedSubCategory = [];

    this.filters.subCategoryId = this.selectedSubCategory;
    this.util.setFilters(this.filters);
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.filterSubscription) this.filterSubscription.unsubscribe();
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
    if (!!this.categorySubscription) this.categorySubscription.unsubscribe();
  }
}
