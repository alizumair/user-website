import { SeoService } from './../../../../services/seo/seo.service';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { ApiUrl } from './../../../../core/apiUrl';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { UserService } from './../../../../services/user/user.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { HttpService } from './../../../../services/http/http.service';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { StyleConstants } from './../../../../core/theme/styleConstants.model';
import { PaginationModel } from './../../../../shared/models/pagination.model';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { WINDOW } from './../../../../services/window/window.service';
import { GlobalVariable } from './../../../../core/global';
import { LocalizationPipe } from '../../../../shared/pipes/localization.pipe';

@Component({
  selector: 'app-order-listing',
  templateUrl: './order-listing.component.html',
  styleUrls: ['./order-listing.component.scss']
})
export class OrderListingComponent implements OnInit, OnDestroy {

  getDataSubscribe: Subscription;
  styleSubscription: Subscription;
  settingsSubscription: Subscription;
  pagination: PaginationModel;
  cancelButton: StyleConstants;

  orders: Array<any> = [];
  status: Array<any> = [];

  style: StyleVariables;
  orderType: string;
  currency: string;
  currentPage: 1;
  noData: boolean = false;
  settings: AppSettings;

  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    public util: UtilityService,
    private user: UserService,
    private message: MessagingService,
    private localization: LocalizationPipe,
    private translate: TranslateService,
    private seo: SeoService,
    @Inject(WINDOW) private window: Window) {

    this.style = new StyleVariables();
    this.cancelButton = new StyleConstants();
    this.orderType = 'pending_orders';
    this.currency = GlobalVariable.CURRENCY;

    this.pagination = new PaginationModel();
    this.pagination.perPageOrder = 6;

  }

  ngOnInit() {
    this.seo.updateTitle(`${this.localization.transform('order')} Listing | ${GlobalVariable.SITE_NAME}`);

    if (this.route.snapshot.queryParams['orderType']) {
      this.orderType = this.route.snapshot.queryParams['orderType'];
      this.pagination.offset = this.route.snapshot.queryParams['offset'] || 0;
    }

    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
        this.cancelButton.color = style.primaryColor;
        this.cancelButton.borderColor = style.primaryColor;
        this.cancelButton.backgroundColor = '#ffffff';
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      });

    this.makeSubscribe();
  }

  makeSubscribe() {
    this.getDataSubscribe = this.util.callGetData
      .subscribe((showData) => {
        if (showData) {
          this.getOrders();
        }
      });
  }



  getOrders() {
    this.isLoading = true;
    let orderApi = '';

    switch (this.orderType) {
      case 'orders':
        orderApi = ApiUrl.orders.getOrderHistory;
        break;

      case 'pending_orders':
        orderApi = ApiUrl.orders.getUpcomingOrders;
        break;

      case 'schedule_orders':
        orderApi = ApiUrl.orders.getScheduledOrders;
        break;
    }

    let param_data = {
      languageId: this.util.handler.languageId,
      accessToken: this.user.getUserToken,
      offset: this.pagination.offset,
      limit: this.pagination.perPageOrder
    };

    this.noData = false;
    this.http.postData(orderApi, param_data)
      .subscribe(response => {
        this.isLoading = false;
        this.noData = true;
        if (!!response && response.data) {
          this.pagination.count = response.data.count;
          this.orders = response.data.orderHistory;
        }
        this.navigateTo();
      }, (err) => this.isLoading = false);
  }

  navigateTo() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        orderType: this.orderType,
        offset: this.pagination.offset
      }
      // skipLocationChange: true
    }).then(() => {
      this.seo.updateTitle(`${this.localization.transform('order')} Listing | ${GlobalVariable.SITE_NAME}`);
    });
  }

  /********* On Page Change **********/
  pageChange(event) {
    this.pagination.currentPage = event;
    this.pagination.offset = event > 1 ? (event - 1) * this.pagination.perPageOrder : 0;
    this.getOrders();
    this.window.scrollTo(0, 0);
  }

  orderTypeSelect(type: string) {
    if (this.orderType == type) { return; }
    this.orderType = type;
    this.pagination.currentPage = 1;
    this.pagination.offset = 0;
    this.getOrders();
  }

  cancelOrder(order: any) {
    this.message.confirm(`${this.translate.instant('Cancel This')} ${this.localization.transform('order')}`).then(data => {
      if (data.value) {
        let param_data = {
          languageId: this.util.handler.languageId,
          accessToken: this.user.getUserToken,
          orderId: order['order_id'],
          isScheduled: order['schedule_order']
        };
        this.http.postData(ApiUrl.orders.cancelOrder, param_data)
          .subscribe(response => {
            if (!!response && response.data) {
              this.message.toast('success', `${this.localization.transform('order')} ${this.translate.instant('Cancelled Successfully')}`);
              this.getOrders();
            }
          });
      }
    });
  }

  ngOnDestroy() {
    this.styleSubscription.unsubscribe();
    this.getDataSubscribe.unsubscribe();
    this.settingsSubscription.unsubscribe();
  }

}
