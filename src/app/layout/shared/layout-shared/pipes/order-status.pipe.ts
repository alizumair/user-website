import { UtilityService } from './../../../../services/utility/utility.service';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { PipeTransform, Pipe, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';


@Pipe({
  name: 'orderStatus'
})
export class OrderStatusPipe implements PipeTransform, OnDestroy {

  settingSubscription: Subscription;
  categorySubscription: Subscription;

  settings: AppSettings;

  app_type: number = 0;
  is_single_vendor: number = 0;

  langType: 'english' | 'other' = 'english';
  terminology: object = {};
  categories: Array<any> = [];


  constructor(private util: UtilityService) {

    this.categorySubscription = this.util.getLanguageCategoryData.subscribe((data) => {
      if (data && data.english) {
        this.categories = data.english;
      }
    })

    this.settingSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.app_type = settings['app_type'];
          this.is_single_vendor = settings['is_single_vendor'];
          this.settings = settings;
        }
      });

    let langData = this.util.getLocalData('langData', true) || { id: this.util.handler.languageId };
    this.langType = !langData || langData.id != 14 ? 'other' : 'english';
  }

  selectTerminology(type) {
    if (this.settings.isCustomFlow) {
      const category = this.categories.find(category => category.type == type);
      if (category && category.terminology) {
        this.terminology = JSON.parse(category.terminology);
      }
    } else {
      this.terminology = this.settings.terminology || {};
    }
  }

  transform(value: number, order?: any): string {
    if (order && order.type) {
      this.app_type = order.type;
    }
    this.selectTerminology(this.app_type);

    let status: string = '';

    switch (value) {
      case 0:
        status = 'Pending';
        break;
      case 1:
        switch (this.app_type) {
          case 2:
            status = 'Approved';
            break;
          case 1: case 8:
            status = 'Confirmed';
            break;
        }
        break;
      case 2:
        status = 'Rejected';
        break;
      case 3:
        switch (this.app_type) {
          case 1: case 3: case 4:
            if (order && order.self_pickup == 3 && order.is_dine_in == 1) {
              status = 'Ready To Serve';
            }
            else {
              status = 'On The Way';
            }
            break;
          case 2:
            status = 'Out For Delivery';
            break;
          case 8:
            status = 'Started';
            break;
        }
        break;
      case 4:
        switch (this.app_type) {
          case 1:
            status = 'Arrived';
            break;
          default:
            status = 'Near You';
            break;
        }
        break;
      case 5:
        switch (this.app_type) {
          case 8:
            status = 'Ended';
            break;
          default:
            if (order && order.self_pickup == 3 && order.is_dine_in == 1) {
              status = 'Served';
            }
            else {
              status = 'Delivered';
            }
            break;
        }
        break;
      case 6:
        status = 'Rating Given';
        break;
      case 7:
        status = 'Track';
        break;
      case 8:
        status = 'Customer Canceled';
        break;
      case 9:
        status = 'Scheduled';
        break;
      case 10:
        switch (this.app_type) {
          case 8:
            status = 'Reached';
            break;
          case 1:
            status = 'Ready To Be Picked';
            break;
          default:
            status = 'Shipped';
            break;
        }
        break;
      case 11:
        switch (this.app_type) {
          case 2: case 4: case 3:
            status = 'Packed';
            break;
          case 1:
            status = 'In Kitchen';
            break;
          case 8:
            if (order && order.self_pickup == 3 && order.is_dine_in == 1) {
              status = 'Ready To Serve';
            }
            else {
              status = 'On The Way';
            }
            break;
        }
        break;
    }

    if (order && order.self_pickup != 3 && order.is_dine_in != 1) {
      status = this.terminology && this.terminology[this.langType] && this.terminology[this.langType]['status'] && this.terminology[this.langType]['status'][`${value}`] ? this.terminology[this.langType]['status'][`${value}`] : status;
    }
    return status;

  }

  ngOnDestroy() {
    if (!!this.settingSubscription) this.settingSubscription.unsubscribe();
    if (!!this.categorySubscription) this.categorySubscription.unsubscribe();
  }
}
