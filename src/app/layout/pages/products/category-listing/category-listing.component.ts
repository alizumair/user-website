import { Router } from '@angular/router';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { Subscription } from 'rxjs';
import { ApiUrl } from './../../../../core/apiUrl';
import { HttpService } from './../../../../services/http/http.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-category-listing',
  templateUrl: './category-listing.component.html',
  styleUrls: ['./category-listing.component.scss']
})
export class CategoryListingComponent implements OnInit, OnDestroy {

  settingsSubscription: Subscription;
  settings: AppSettings;
  categories: Array<any> = [];
  subCatIndex: number = 0;
  isLoading: boolean = false;
  selectedCatIds: Array<any> = [];
  selectedCatId: string | number = 0;

  constructor(
    private util: UtilityService,
    private http: HttpService,
    private router: Router
  ) { }

  ngOnInit() {

    this.settingsSubscription = this.util.getSettings.subscribe(
      (settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      });

      this.getCategories();
  }

  getCategories() {
    this.isLoading = true;
    let param_data = {
      language_id: this.util.handler.languageId
    }
    this.http.getData(ApiUrl.getCategories, param_data, true)
      .subscribe(response => {
        if (!!response && response.data) {
          this.categories = [];
          if (this.settings.isCustomFlow) {
            const category = response['data'].find((c) => c.type == this.settings.app_type);
            if(!!category && category['sub_category']) {
              this.categories.push(category['sub_category']);
            }
          } else {
            this.categories.push(response['data']);
          }
        }
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
      });
  }

  getSubCat(category) {
    if(this.subCatIndex == 0) {
      this.selectedCatId = category.id;
    }
    if((category.is_subcategory && this.subCatIndex > 0) || (this.subCatIndex == 0 && category.sub_category.length)) {
      let param_data = {
        categoryId: category.id || category.category_id,
        languageId: this.util.handler.languageId,
      };
      this.http.postData(ApiUrl.getSubcategory, param_data, true)
      .subscribe(response => {
        if (!!response && response.data) {
          this.categories.push(response.data);
          this.subCatIndex++;
        }
      });
    } else {
      this.viewProducts(category);
    } 
  }


  viewProducts(category) {
    let selectedCatPath: Array<string> = [category['name']];
    let seoValue = selectedCatPath.length ? selectedCatPath[selectedCatPath.length - 1].replace(/ &/g, '-') : '';
    let param_obj = {};
    Object.assign(param_obj, this.util.handler);
    if(this.subCatIndex > 0) {
      param_obj['subCatId'] = [category.id || category.category_id];
    }
    param_obj['category'] = this.selectedCatId;
    param_obj['path'] = selectedCatPath;
    this.router.navigate(['/products', 'product-listing', seoValue], {
      queryParams: { f: this.util.encryptData(param_obj) }
    });
  }

  ngOnDestroy() {
    this.settingsSubscription.unsubscribe();
  }

}
