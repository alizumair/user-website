import { Subscription } from 'rxjs';
import { AppSettings } from './../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { PaginationModel } from './../../../shared/models/pagination.model';
import { UserService } from './../../../services/user/user.service';
import { ApiUrl } from './../../../core/apiUrl';
import { UtilityService } from './../../../services/utility/utility.service';
import { HttpService } from './../../../services/http/http.service';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { WINDOW } from './../../../services/window/window.service';


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {

  notificationList: Array<any> = [];

  settings: AppSettings;
  style: StyleVariables;
  pagination: PaginationModel;

  styleSubscription: Subscription;

  constructor(
    private httpService: HttpService,
    private utilityService: UtilityService,
    private userService: UserService,
    @Inject(WINDOW) private window: Window
  ) {
    this.pagination = new PaginationModel();
    this.pagination.perPage = 10;
    this.pagination.currentPage = 1;
    this.pagination.offset = 0;
  }


  ngOnInit() {
    this.styleSubscription = this.utilityService.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
      });

    this.fetch();
  }

  fetch() {
    const payload: any = {
      'accessToken': this.userService.getUserToken,
      'offset': this.pagination.offset,
      'limit': this.pagination.perPage
    }

    this.httpService.getData(ApiUrl.getNotification, payload).subscribe((response) => {
      if (response && response.data && response.data.notification) {
        this.notificationList = response.data.notification;
        this.pagination.count = response.data.count || response.data.notification.length;
      }
    })
  }

  /********* On Page Change **********/
  pageChange(event) {
    this.pagination.currentPage = event;
    this.pagination.offset = event > 1 ? (event - 1) * this.pagination.perPage : 0;
    this.fetch();
    this.window.scrollTo(0, 0);
  }

  ngOnDestroy(): void {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
  }


}
