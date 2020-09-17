import { GlobalVariable } from './../../../../core/global';
import { SeoService } from './../../../../services/seo/seo.service';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { ApiUrl } from './../../../../core/apiUrl';
import { UserService } from './../../../../services/user/user.service';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { HttpService } from './../../../../services/http/http.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { StyleConstants } from './../../../../core/theme/styleConstants.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LocalizationPipe } from './../../../../shared/pipes/localization.pipe';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss']
})
export class RatingComponent implements OnInit, OnDestroy {

  routeSubscription: Subscription;
  getDataSubscribe: Subscription;
  settingsSubscription: Subscription;

  style: StyleVariables;
  submit: StyleConstants;

  branchId: string = '';
  productId: string = '';
  product: any;
  rating: number = 0;
  title: string = '';
  review: string = '';
  orderIds: Array<any> = [];
  type: string = '';
  supplierId: string = '';
  categoryId: string = '';
  image: string = '';
  supplier: any = '';
  settings: AppSettings;

  agentId: '';
  agentName: '';


  isLoading: boolean = false;

  constructor(
    private util: UtilityService,
    private http: HttpService,
    private route: ActivatedRoute,
    private message: MessagingService,
    private localization: LocalizationPipe,
    private translate: TranslateService,
    private seo: SeoService,
    private user: UserService) {

    this.style = new StyleVariables();
    this.submit = new StyleConstants();
  }

  ngOnInit() {
    this.seo.updateTitle(`Rating | ${GlobalVariable.SITE_NAME}`);

    this.util.getStyles
      .subscribe(style => {
        this.style = style;
        this.submit.backgroundColor = style.primaryColor;
        this.submit.borderColor = style.primaryColor;
        this.submit.color = '#ffffff';
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      });

    this.subscribeRoute();
  }

  /********* Route Subscription **********/
  subscribeRoute() {
    this.routeSubscription = this.route.queryParams
      .subscribe(params => {
        this.type = params.type;
        this.branchId = params.supplierBranchId;
        this.productId = params.productId ? params.productId : null;
        this.supplierId = params.supplierId ? params.supplierId : null;
        this.orderIds = params.orderId ? params.orderId : null;
        this.categoryId = params.categoryId ? params.categoryId : null;
        this.agentId = params.categoryId ? params.agentId : null;
        this.agentName = params.categoryId ? params.agentName : null;
        if (this.type == 'product') {
          this.getProductDetail();
        } else if (this.type == 'supplier') {
          this.supplierDetail();
        }
      });

    const data = this.route.snapshot.data;
    console.log(data);
  }

  supplierDetail() {
    let obj = {
      languageId: this.util.handler.languageId,
      branchId: this.branchId,
      supplierId: this.supplierId,
      categoryId: this.categoryId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    };
    this.http.postData(ApiUrl.getSupplierDetail, obj)
      .subscribe(response => {
        if (!!response && response.data) {
          this.image = response.data['logo'];
          this.supplier = response.data;
        }
      });
  }

  getProductDetail() {
    let obj = {
      languageId: this.util.handler.languageId,
      productId: this.productId,
      supplierBranchId: this.branchId,
      offer: 0,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    };
    this.http.postData(ApiUrl.getProductDetail, obj)
      .subscribe(response => {
        if (!!response && response.data) {
          this.product = response.data;
          this.image = this.product.image_path[0];
        }
      });
  }

  rateProduct(rating) {
    if (this.rating === rating) {
      if (this.rating > 0) {
        this.rating--;
      }
    } else {
      this.rating = rating;
    }
  }

  onSubmit() {
    if (this.rating === 0) {
      this.message.toast('warning', `${this.translate.instant('Please Rate')} ${this.type === 'PRODUCT' ? this.localization.transform('product') : this.localization.transform('supplier')}`);
      return;
    }

    if (this.type === 'product') {
      let param_data = {
        title: this.title,
        reviews: this.review,
        product_id: this.productId,
        value: this.rating,
        order_id: this.orderIds[0] || ''
      };

      this.isLoading = true;
      this.http.postData(ApiUrl.rateProduct, param_data)
        .subscribe(response => {
          if (!!response) {
            this.moveTo();
          }
          this.isLoading = false;
        }, (err) => this.isLoading = false);

    } else if (this.type === 'supplier') {
      let param_data = {
        accessToken: this.user.getUserToken,
        comment: this.review,
        supplierId: this.product ? this.product.supplier_id : this.supplierId,
        rating: this.rating,
        orderId: this.orderIds
      };

      this.isLoading = true;
      this.http.postData(ApiUrl.rateSupplier, param_data)
        .subscribe(response => {
          if (!!response) {
            this.moveTo();
          }
          this.isLoading = false;
        }, (err) => this.isLoading = false);
    } else if (this.type == 'agent') {
      let param_data = {
        accessToken: this.user.getUserToken,
        comment: this.review,
        agnetId: this.agentId,
        rating: this.rating,
        orderId: this.orderIds,
        languageId: this.util.handler.languageId
      };

      this.isLoading = true;
      this.http.postData(ApiUrl.rateAgent, param_data)
        .subscribe(response => {
          if (!!response) {
            this.moveTo();
          }
          this.isLoading = false;
        }, (err) => this.isLoading = false);
    }
  }

  moveTo() {
    switch (this.type) {
      case 'PRODUCT':
        this.message.toast('success', `${this.localization.transform('product')} ${this.translate.instant('Rated Successfully')}`);
        break;

      case 'SUPPLIER':
        this.message.toast('success', `${this.localization.transform('supplier')} ${this.translate.instant('Rated Successfully')}`);
        break;
      case 'AGENT':
        this.message.toast('success', `${this.localization.transform('agent')} ${this.translate.instant('Rated Successfully')}`);
    }

    this.util.goBack();
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
  }

}
