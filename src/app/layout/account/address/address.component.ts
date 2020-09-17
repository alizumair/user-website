import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';

import { ApiUrl } from './../../../core/apiUrl';
import { HttpService } from './../../../services/http/http.service';
import { UserService } from './../../../services/user/user.service';
import { UtilityService } from './../../../services/utility/utility.service';
import { MessagingService } from './../../../services/messaging/messaging.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit, OnDestroy {

  private getDataSubscribe: Subscription;
  address: any = [];
  styleSubscription: Subscription;
  style: StyleVariables;

  isLoading: boolean = false;

  constructor(
    private user: UserService,
    private http: HttpService,
    private router: Router,
    private util: UtilityService,
    private message: MessagingService,
    private translate: TranslateService) { }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe(style => {
      this.style = style;
    });
    this.makeSubscribe();
  }

  makeSubscribe() {
    this.getDataSubscribe = this.util.callGetData.
      subscribe((data) => {
        if (data) {
          if (this.user.getUserToken)
            this.getAddress();
        }
      });
  }

  getAddress() {
    this.isLoading = true;
    let obj = {
      accessToken: this.user.getUserToken,
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    }
    this.http.postData(ApiUrl.address.getAddress, obj)
      .subscribe(response => {
        if (response.status === 200) {
          this.address = response.data.address;
        }
        this.isLoading = false;

      }, (err) => this.isLoading = false);
  }

  confirmDelete(address, i) {
    this.message.confirm(`${this.translate.instant('Delete This Address')}`).then(data => {
      if (data.value) {
        this.deleteAddress(address, i);
      }
    });
  }

  setDataInLocal(data) {
    this.util.setLocalData('locationData', data, true);
    this.router.navigate(['/account/address/add-edit-address'], { queryParams: { id: data.id } });
  }

  deleteAddress(data, i) {
    this.isLoading = true;
    let obj = {
      addressId: data.id,
      accessToken: this.user.getUserToken
    }
    this.http.postData(ApiUrl.address.deleteAddress, obj)
      .subscribe(response => {
        this.isLoading = false;
        this.address.splice(i, 1);
        this.message.toast('success', `${this.translate.instant('Address Deleted Successfully')}!`);
      }, error => { this.isLoading = false; });
  }


  defaultAdress(addressId) {
    this.isLoading = true;
    this.http.putData(ApiUrl.address.setDefault, { id: addressId }).subscribe((response) => {
      if (response.status === 200) {
        this.message.toast('success', `${this.translate.instant('Address')} ${addressId ? this.translate.instant('Updated') : this.translate.instant('Added')} ${this.translate.instant('Successfully')}!`);
        this.getAddress();
      }
    }, (err) => this.isLoading = false)
  }

  ngOnDestroy() {
    this.getDataSubscribe.unsubscribe();
    this.styleSubscription.unsubscribe();
  }

}
