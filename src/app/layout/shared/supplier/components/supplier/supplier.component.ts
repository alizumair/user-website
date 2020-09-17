import { UserService } from './../../../../../services/user/user.service';
import { LocalizationPipe } from './../../../../../shared/pipes/localization.pipe';
import { TranslateService } from '@ngx-translate/core';
import { ApiUrl } from './../../../../../core/apiUrl';
import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { HttpService } from './../../../../../services/http/http.service';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { StyleConstants } from './../../../../../core/theme/styleConstants.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SupplierComponent implements OnInit {

  @Input() loggedIn: boolean;
  @Input() supplier: any;
  @Input() darkTheme: boolean;
  @Input() isBranch: boolean = false;

  @Input() settings: AppSettings;
  @Input() style: StyleVariables;

  @Output() onFavourite: EventEmitter<any> = new EventEmitter<any>();

  btnStyle: StyleConstants;

  constructor(
    private translate: TranslateService,
    private localization: LocalizationPipe,
    private http: HttpService,
    private message: MessagingService,
    private route: ActivatedRoute,
    private util: UtilityService,
    private router: Router,
    private userService: UserService
  ) {
    this.style = new StyleVariables();
    this.btnStyle = new StyleConstants();
  }

  ngOnInit() {
    this.setBtnStyle();
  }

  onBtnHover() {
    this.btnStyle = {
      backgroundColor: this.style.baseColor,
      color: '#ffffff',
      borderColor: this.style.baseColor,
      transition: '1s'
    }
  }

  setBtnStyle() {
    this.btnStyle = {
      color: this.style.baseColor,
      borderColor: this.style.baseColor
    }
  }

  onLogoLoad(supplier) {
    supplier["display_logo"] = supplier["logo"];
  }

  onImageLoad(supplier) {
    supplier["display_supplier_image"] = supplier["supplier_image"];
  }

  productList(supplier) {
    if (this.settings.app_type == 1) {
      let queryParams = {
        supplierId: supplier.id,
      }
      if(this.isBranch) {
        queryParams['branchId'] = supplier.supplier_branch_id;
      }
      this.router.navigate(["products/listing"], {
        queryParams: queryParams
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
      this.router.navigate(["products/product-listing", seoValue], {
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
      param_obj['multi_b'] = supplier.is_multi_branch;

      const queryParams = this.route.snapshot.queryParams;

      if(queryParams['cat_id']) {
        param_obj['subCatId'] = [queryParams['cat_id']];
      }

      // param_obj['subCatId'] = Object.values(queryParams).filter(value => {
      //   console.log(value)
      //   let parsed = Number.parseInt(value);
      //   if (!Number.isNaN(parsed)) return parsed;
      // });

      if (this.router.url == '/' || this.router.url.includes('/home-service/home')) {
        this.util.clearLocalData('ques_data');
        this.util.setCart([]);
        param_obj["showSupplier"] = true;
      }

      this.router.navigate(["products/product-listing", supplier.name], {
        queryParams: { f: this.util.encryptData(param_obj) }
      });
    } else {
      let cat_ids: Array<any> = [];

      if (supplier.category && supplier.category.length) {
        supplier["category"].forEach(element => {
          cat_ids.push(element.category_id);
        });
      }

      this.router.navigate(["/", "supplier", "supplier-detail"], {
        queryParams: {
          sup_id: supplier.id,
          branch_id: supplier.supplier_branch_id,
          cat_ids: cat_ids.join()
        }
      });
    }
  }

  wishlist(status, detail) {
    this.loggedIn = !!this.userService.getUserToken;
    if (!this.loggedIn) {
      this.message.alert('warning', this.translate.instant('Please Login First'));
      return;
    }
    let param_data = {
      status: +status,
      supplierId: detail['id'],
      accessToken: this.userService.getUserToken
    }

    const api = param_data.status == 1 ? ApiUrl.favourite.addToFavourites : ApiUrl.favourite.removeFromFavourites;

    this.http.postData(api, param_data, true)
      .subscribe(response => {
        if (!!response && response.data) {
          this.message.toast('success', `${this.localization.transform('supplier')} ${this.translate.instant('Has Been Successfully')} ${status ? this.translate.instant('Added To') : this.translate.instant('Removed From')} ${this.localization.transform('wishlist')}`);
          this.supplier.Favourite = +status;
          this.onFavourite.emit(this.supplier.Favourite);
        }
      });
  }

  ngOnDestroy() {

  }

}
