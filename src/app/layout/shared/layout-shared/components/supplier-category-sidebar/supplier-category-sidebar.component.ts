import { ApiUrl } from './../../../../../core/apiUrl';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { HttpService } from './../../../../../services/http/http.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-supplier-category-sidebar',
  templateUrl: './supplier-category-sidebar.component.html',
  styleUrls: ['./supplier-category-sidebar.component.scss']
})
export class SupplierCategorySidebarComponent implements OnInit {

  subCategories: Array<any> = [];

  @Input()
  supplierId: string;

  @Input()
  categories: Array<any> = [];

  @Input()
  display: boolean = true;

  @Input()
  position: 'left' | 'right' | 'top' | 'bottom' = 'bottom';

  @Output()
  onHide: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private router: Router,
    private http: HttpService,
    private util: UtilityService
  ) { }

  ngOnInit() {
    this.subCategories = [...this.categories]
  }

  close() {
    this.onHide.emit(true);
  }

  onImageLoad(category) {
    category["display_image"] = category["image"];
  }

  getSubCategories(category) {
    const param_data = {
      categoryId: category.id,
      languageId: this.util.handler.languageId,
      supplierId: this.supplierId
    }

    this.http.postData(ApiUrl.getSubcategory, param_data, true)
      .subscribe(response => {
        if (!!response && response.data) {
          if (!response.data.length) {
            let param_obj = { ...this.util.handler };
            param_obj["supplierId"] = [this.supplierId];
            return this.router.navigate(["products/product-listing", 'supplier'], {
              queryParams: { f: this.util.encryptData(param_obj) }
            });
          }
          response.data.map(data => {
            data["display_image"] = this.util.thumbnail(data["image"]);
            data["id"] = data["sub_category_id"];
          });
          this.subCategories.push(response.data);
        }
      });
  }

}
