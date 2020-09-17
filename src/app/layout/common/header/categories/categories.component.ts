import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleConstants } from './../../../../core/theme/styleConstants.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { ApiUrl } from './../../../../core/apiUrl';
import { UtilityService } from './../../../../services/utility/utility.service';
import { HttpService } from './../../../../services/http/http.service';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, OnDestroy {

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
          let selectedCategory = this.util.getLocalData('selected_category', true);
          if (this.settings.isCustomFlow && !!selectedCategory) {
            const category = response['data'].find((c) => c.type == selectedCategory.type && c.id == selectedCategory.id);
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

  // flowCheck(category: any, isHover: boolean) {
  //   let categoryFlow = category['category_flow'].split('>');
  //   this.showSubcat = !isHover;

  //   switch (categoryFlow[1]) {
  //     case 'Pl':
  //       if (isHover) return;
  //       this.subCategories = [];
  //       this.selectedCategory = category.id;
  //       this.subCategories.push(category);
  //       this.viewProducts();
  //       break;

  //     case 'Suppliers':
  //       if (isHover) return;
  //       this.subCategories = [];
  //       this.supplierList(category);
  //       break;

  //     case 'SubCategory':
  //       if (!isHover) return;
  //       this.selectCat(category);
  //       break;

  //     case 'PickUpTime':
  //       if (isHover) return;
  //       this.subCategories = [];
  //       this.pickUpDateTime(category);
  //       break;
  //   }
  // }

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

  pickUpDateTime(category) {
    this.toggleCatBtn.nativeElement.click();
    this.router.navigate(['/pick-up-date-time'], { queryParams: { cat_id: category.id, cat_name: category.name } });
  }

  supplierList(category: any) {
    this.removePickUpDateTime();
    this.toggleCatBtn.nativeElement.click();
    this.router.navigate(['/supplier/supplier-list'], { queryParams: { cat_id: category.id, cat_name: category.name } });
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
  }

  selectSubCat(subCategory, index) {
    if (subCategory.sub_category && subCategory.sub_category.length) {
      if (this.subCategories.length === (index + 1)) {
        this.subCategories.push(subCategory);
      } else {
        this.subCategories[index + 1] = subCategory;
        if (this.subCategories.length > (index + 1)) {
          this.subCategories.splice(index + 2, this.subCategories.length - (index + 1));
        }
      }
    } else {
      this.subCategories.splice(index + 1, this.subCategories.length - (index + 1));
    }
  }

  selectMulSubCat(subCategory) {
    if (!this.parent_id) {
      this.parent_id = subCategory.parent_id;
    } else {
      if (this.parent_id != subCategory.parent_id) {
        this.selectedMulSubCat = [];
        this.mulCatPath = [];
        this.parent_id = subCategory.parent_id;
      }
    }

    if (this.selectedMulSubCat.includes(subCategory.id)) {
      this.selectedMulSubCat.splice(this.selectedMulSubCat.indexOf(subCategory.id), 1);
      this.mulCatPath.splice(this.mulCatPath.indexOf(subCategory.name), 1)
    } else {
      this.selectedMulSubCat.push(subCategory.id);
      this.mulCatPath.push(subCategory.name);
    }

    if (this.settings.app_type == 2 && this.settings.selected_template == 2)
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
    this.toggleCatBtn.nativeElement.click();
    this.router.navigate(['/products', 'product-listing', seoValue], {
      queryParams: { f: this.util.encryptData(param_obj) }
    });

    // this.router.navigate(['/', this.settings.app_type, 'products', 'product-listing', searchedVal.replace(/ &/g, '-')], {
    //   queryParams: { f: this.utilityService.encryptData(this.allParams) }
    // });
  }

  ngOnDestroy() {
    this.getDataSubscribe.unsubscribe();
  }

}
