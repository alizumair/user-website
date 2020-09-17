import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleConstants } from './../../../../core/theme/styleConstants.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { ApiUrl } from './../../../../core/apiUrl';
import { UtilityService } from './../../../../services/utility/utility.service';
import { HttpService } from './../../../../services/http/http.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-category-selection',
  templateUrl: './category-selection.component.html',
  styleUrls: ['./category-selection.component.scss']
})
export class CategorySelectionComponent implements OnInit, OnDestroy {

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
  no_subcategory = 1;

  constructor(
    private http: HttpService,
    private util: UtilityService,
    private router: Router,
    private route: ActivatedRoute) {

    this.style = new StyleVariables();
    this.checkbox = new StyleConstants();
    this.catBtn = new StyleConstants();

  }


  ngOnInit() {
    this.util.getStyles.subscribe(style => {
      this.style = style;
      this.catBtn.color = '#ffffff';
      this.catBtn.backgroundColor = style.primaryColor;
      this.catBtn.borderColor = style.primaryColor;
      this.checkbox.borderColor = style.primaryColor;
      this.checkbox.backgroundColor = style.primaryColor;
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
    this.http.getData(ApiUrl.getCategories, param_data, true)
      .subscribe(response => {
        if (!!response && response.data) {
          if (this.settings.isCustomFlow) {
            const category = response['data'].find((c) => c.type == this.settings.app_type);
            this.categories = category ? category['sub_category'] || [] : [];
          } else {
            this.categories = response['data'];
          }
        }
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
    if (!isHover) {
      this.selectedCategory = category['id'];
      this.viewProducts();
    } else {
      this.selectCat(category);
    }
  }

  removePickUpDateTime() {
    this.util.clearLocalData('pickUp_DT');
  }

  selectCat(category: any) {
    this.showSubcat = true;
    this.selectedCategory = category.id;

    this.subCategories[0] = category;
    this.selectedMulSubCat = [];

    if (category.sub_category && category.sub_category.length) {

    } else {
      this.showSubcat = false;
      this.selectedMulSubCat = [];
    }
  }

  viewProducts() {
    this.removePickUpDateTime();
    let selectedCatPath: Array<string> = [];
    this.selectedMulSubCat = [];

    this.subCategories.forEach(cat => {
      selectedCatPath.push(cat['name']);
      this.selectedMulSubCat.push(this.selectedCategory);
      cat.sub_category.forEach(subCat => {
        this.selectedMulSubCat.push(subCat.id);
      });
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
    this.toggleCatBtn.nativeElement.click();
    this.router.navigate(['/products', 'product-listing', seoValue], {
      queryParams: { f: this.util.encryptData(param_obj) }
    });
  }

  ngOnDestroy() {
    this.getDataSubscribe.unsubscribe();
  }

}
