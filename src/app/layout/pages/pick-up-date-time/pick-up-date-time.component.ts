import { MessagingService } from './../../../services/messaging/messaging.service';
import { ApiUrl } from './../../../core/apiUrl';
import { UserService } from './../../../services/user/user.service';
import { HttpService } from './../../../services/http/http.service';
import { AppSettings } from './../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { UtilityService } from './../../../services/utility/utility.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pick-up-date-time',
  templateUrl: './pick-up-date-time.component.html',
  styleUrls: ['./pick-up-date-time.component.scss']
})
export class PickUpDateTimeComponent implements OnInit, OnDestroy {

  @ViewChild('closeAddressModal', { static: false }) closeAddressModal: ElementRef;
  routeSubscription: Subscription;
  styleSubscription: Subscription;
  settingsSubscription: Subscription;
  userSubscription: Subscription;
  dataSubscription: Subscription;
  style: StyleVariables;
  categoryId: string = '';
  categoryName: string = '';
  date: Date = new Date();
  minDate: Date = new Date();
  time: any;
  loggedIn: boolean = false;
  addressDetail: Array<any> = [];
  selectedAreaIndex: number = 0;
  timeInterval: number = 0;
  settings: AppSettings

  constructor(
    private route: ActivatedRoute,
    private util: UtilityService,
    private router: Router,
    private http: HttpService,
    private user: UserService,
    private message: MessagingService,
    private translate: TranslateService) {

    this.time = moment().startOf('hour');
    if (this.time.hour() === moment().hour()) {
      this.time.add(1, 'hours');
    }
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles
      .subscribe(styles => {
        this.style = styles;
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.timeInterval = settings['interval'];
          this.time = moment(this.time).add(this.timeInterval, 'minutes');
          this.settings = settings;
        }
      });

    this.routeSubscription = this.route.queryParams
      .subscribe(params => {
        this.categoryId = params['cat_id'];
        this.categoryName = params['cat_name'];
      });

    this.userSubscription = this.user.currentUser
      .subscribe(user => {
        if (!!user && user['access_token']) {
          this.loggedIn = true;
          this.dataSubscription = this.util.callGetData
            .subscribe((data) => {
              if (data) {
                this.getAddress();
              }
            });
        } else {
          this.loggedIn = false;
        }
      });
  }

  getAddress() {
    let obj = {
      accessToken: this.user.getUserToken,
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    }

    this.http.postData(ApiUrl.address.getAddress, obj)
      .subscribe(response => {
        if (!!response && response.data) {
          this.addressDetail = response.data.address;
          this.addressDetail.map(data => {
            if (data.pincode) data.pincode = data.pincode.replace(/,@#/g, ', ');
            data.address_line_2 = data.address_line_2.replace(/,@#/g, ', ');
          });
        }
      });
  }

  supplierList() {
    let date_time = moment(this.date).format('YYYY-MM-DD') + ' ' + moment(this.time).format('HH:mm:ss');
    if (moment(date_time).add(1, 'minutes') < moment()) {
      this.message.alert('warning', this.translate.instant('Invalid Time'), this.translate.instant('Selected date-time cannot be less than current date-time'));
      return;
    }
    let pickUp_DateTime = {
      address: this.addressDetail[this.selectedAreaIndex],
      date_time: date_time
    };
    this.util.setLocalData('pickUp_DT', pickUp_DateTime, true);
    this.router.navigate(['/', 'supplier', 'supplier-list'], { queryParams: { cat_id: this.categoryId, cat_name: this.categoryName } });
  }

  changeTime(type) {
    switch (type) {
      case '+':
        this.time = moment(this.time).add(this.timeInterval, 'minutes');
        break;
      case '-':
        this.time = moment(this.time).subtract(this.timeInterval, 'minutes');
        break;
    }
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
    this.styleSubscription.unsubscribe();
    this.settingsSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
    this.closeAddressModal.nativeElement.click();
  }

}
