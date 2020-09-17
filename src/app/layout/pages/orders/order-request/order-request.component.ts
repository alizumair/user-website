import { MultimediaViewerComponent } from './../../../shared/layout-shared/components/multimedia-viewer/multimedia-viewer.component';
import { DialogService } from 'primeng/dynamicdialog';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { PaginationModel } from './../../../../shared/models/pagination.model';
import { HttpService } from './../../../../services/http/http.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiUrl } from './../../../../core/apiUrl';
import { AppSettings } from './../../../../shared/models/appSettings.model';

@Component({
  selector: 'app-order-request',
  templateUrl: './order-request.component.html',
  styleUrls: ['./order-request.component.scss']
})
export class OrderRequestComponent implements OnInit, OnDestroy {

  isLoading: boolean = false;
  noData: boolean = false;
  styleSubscription: Subscription;
  settingsSubscription: Subscription;
  pagination: PaginationModel;
  orders: Array<any> = [];
  settings: AppSettings;
  style: StyleVariables;
  request_status: Array<string> = [];

  constructor(
    private util: UtilityService,
    private http: HttpService,
    private message: MessagingService,
    public dialogService: DialogService
  ) {

    this.pagination = new PaginationModel();
    this.pagination.perPageOrder = 6;
    this.request_status = [
      'Pending',
      'Approved',
      'Rejected By Admin',
      'Cancelled By User'
    ]
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      });

    this.getOrderResuestList();
  }

  getOrderResuestList() {
    this.isLoading = true;
    let param_data = {
      offset: this.pagination.offset,
      limit: this.pagination.perPageOrder
    };

    this.noData = false;
    this.http.getData(ApiUrl.orders.requestList, param_data)
      .subscribe(response => {
        this.noData = true;
        if (!!response && response.data) {
          this.pagination.count = response.data.totalCount;
          this.orders = response.data.data;
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  rejectRequest(orders) {
    this.message.confirm(`reject this request`).then(data => {
      if (data.value) {
        let param_data = {
          id: orders.id,
          reason: ''
        }
        this.http.putData(ApiUrl.orders.rejectOrderRequest, param_data)
          .subscribe(response => {
            if (!!response) {
              this.message.toast('success', 'Request Rejected');
              this.getOrderResuestList();
            }
          });
      }
    });
  }

  viewAttachment(url: string) {
    const dialogRef = this.dialogService.open(MultimediaViewerComponent, {
      dismissableMask: true,
      showHeader: false,
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      data: {
        url: url,
        type: 'image'
      }
    });
  }

  ngOnDestroy() {
    this.styleSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
  }

}
