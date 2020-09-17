import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { HttpService } from './../../../../../services/http/http.service';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { StyleConstants } from './../../../../../core/theme/styleConstants.model';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { ApiUrl } from './../../../../../core/apiUrl';

@Component({
  selector: 'app-ecom-mega-menu',
  templateUrl: './ecom-mega-menu.component.html',
  styleUrls: ['./ecom-mega-menu.component.scss']
})
export class EcomMegaMenuComponent implements OnInit, OnDestroy {

  categories: Array<any> = [];
  subCategories: Array<any> = [];
  selectedMulSubCat: Array<any> = [];
  mulCatPath: Array<any> = [];

  getDataSubscribe: Subscription;
  settingsSubscription: Subscription;
  style: StyleVariables;
  checkbox: StyleConstants;
  hoverIndex = -1;
  hoverCatIndex = -1;
  hoverParentIndex = -1;

  showSubcat = false;
  selectedCategory = '';
  parent_id: any = '';

  settings: AppSettings;

  selectedCategoryId = '';

  isLoading = false;
  slideConfig = {
    'slidesToShow': 8,
    'slidesToScroll': 1,
    'dots': false,
    'arrows': true,
    'infinite': false
  };

  constructor(
    private http: HttpService,
    public util: UtilityService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.util.getStyles.subscribe(style => {
      this.style = style;
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
          this.categories = response.data;
        }
        this.isLoading = false;
      });
  }

  showSubCat(category) {
    this.selectedCategoryId = category.id;
    this.subCategories = category.sub_category;
  }

  openCategorySelection() {
    this.subCategories = [];
    this.mulCatPath = [];
    this.selectedMulSubCat = [];
    this.showSubcat = false;
  }

  removePickUpDateTime() {
    this.util.clearLocalData('pickUp_DT');
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

    this.viewProducts(category);
  }

  viewProducts(allCategory) {
    // stop click if there is any subcategory
    if(allCategory.sub_category) {
      if(allCategory.sub_category.length) {
        return;
      }
    }

    const selectedCatPath: Array<string> = [];
    const subCatArr = [];

    this.subCategories.forEach(cat => {
      selectedCatPath.push(cat['name']);
      subCatArr.push();
    });
    if (this.mulCatPath.length) {
      selectedCatPath.push(this.mulCatPath.join(', '));
    }
    let seoValue = selectedCatPath.length ? selectedCatPath[selectedCatPath.length - 1].replace(/ &/g, '-') : '';
    let param_obj = {};
    Object.assign(param_obj, this.util.handler);
    param_obj['subCatId'] = allCategory.id ? [allCategory.id] : [this.selectedCategoryId];
    param_obj['category'] = this.selectedCategoryId;
    param_obj['product'] = this.route.snapshot.queryParamMap.get('product');
    param_obj['path'] = selectedCatPath;
    this.router.navigate(['/products', 'product-listing', seoValue], {
      queryParams: { f: this.util.encryptData(param_obj) }
    });
  }

  ngOnDestroy() {
    this.getDataSubscribe.unsubscribe();
  }

}
