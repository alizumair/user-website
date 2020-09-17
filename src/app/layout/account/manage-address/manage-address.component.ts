import { StyleConstants } from './../../../core/theme/styleConstants.model';
import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { ApiUrl } from './../../../core/apiUrl';
import { HttpService } from './../../../services/http/http.service';
import { UserService } from './../../../services/user/user.service';
import { UtilityService } from './../../../services/utility/utility.service';
import { MessagingService } from './../../../services/messaging/messaging.service';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { ValidationService } from './../../../services/validation/validation.service';
import { TranslateService } from '@ngx-translate/core';

declare const google: any;

@Component({
  selector: 'app-manage-address',
  templateUrl: './manage-address.component.html',
  styleUrls: ['./manage-address.component.scss']
})
export class ManageAddressComponent implements OnInit {

  addEdit: string = 'Add New';
  private subscription: Subscription;
  getDataSubscription: Subscription;
  private getSettingSubscription: Subscription;

  style: StyleVariables;
  cancelBtn: StyleConstants;
  saveBtn: StyleConstants;

  form: FormGroup;
  showError: boolean = false;
  btnDisabled: boolean = false;
  id: string = '';
  location: any = {};
  setting: any = {};

  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private user: UserService,
    private http: HttpService,
    private message: MessagingService,
    public util: UtilityService,
    private router: Router,
    private validator: ValidationService,
    private translate: TranslateService
  ) {

    this.style = new StyleVariables();
    this.cancelBtn = new StyleConstants();
    this.saveBtn = new StyleConstants();
  }

  ngOnInit() {
    this.util.getStyles
      .subscribe(style => {
        this.style = style;
        this.cancelBtn.color = style.defaultColor;
        this.cancelBtn.borderColor = style.defaultColor;
        this.saveBtn.backgroundColor = style.primaryColor;
        this.saveBtn.borderColor = style.primaryColor;
        this.saveBtn.color = '#ffffff';
      })


    this.getSettingSubscription = this.util.getSettings.
      subscribe((data) => {
        if (data) {
          this.setting = data;
        }
      });

    this.makeForm();
    this.subscribeRoute();
  }


  makeForm() {
    this.form = this.fb.group({
      'name': ['', Validators.compose([Validators.required, this.validator.noWhitespaceValidator])],
      'houseNo': ['', Validators.compose([Validators.required, this.validator.noWhitespaceValidator])],
      'collectNo': ['', Validators.compose([Validators.required, this.validator.noWhitespaceValidator])],
      'addressLineFirst': ['', Validators.compose([Validators.required])],
      'latitude': ['', Validators.compose([Validators.required])],
      'longitude': ['', Validators.compose([Validators.required])],
      'phone_number': ['', Validators.compose([Validators.required, Validators.pattern(this.validator.mobile)])]
    });

    if (this.setting.addCollectFieldInAddress == 0) {
      this.form.controls['collectNo'].setValidators(null);
      this.form.controls['collectNo'].updateValueAndValidity();
    }

    // this.getDataSubscription = this.util.callGetData.
    // subscribe((data) => {
    //   if (data) {
    //     this.getGeoLocation(this.util.handler.latitude, this.util.handler.longitude);
    //   }
    // });
  }

  // subscribe route
  subscribeRoute() {
    let self = this;
    this.subscription = this.route.queryParams.subscribe(params => {
      if (params['id']) {
        self.id = params['id'];
        self.getAddress();
        self.addEdit = 'Edit';
      }
    });
  }

  getAddress() {
    let data = this.util.getLocalData('locationData', true);
    this.form.controls.name.setValue(data.name);
    this.form.controls.houseNo.setValue(data.address_line_1);

    if (this.setting.addCollectFieldInAddress == 1) {
      this.form.controls.collectNo.setValue(data.collectNumber);
    }
    this.form.controls.addressLineFirst.setValue(data.customer_address);
    this.form.controls.latitude.setValue(data.latitude);
    this.form.controls.longitude.setValue(data.longitude);
    this.form.controls.phone_number.setValue(data.phone_number);
    this.getLatLong(data.customer_address);
  }

  getLatLong(address) {
    let self = this;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        var latitude = results[0].geometry.location.lat();
        var longitude = results[0].geometry.location.lng();
        self.form.controls.latitude.setValue(latitude);
        self.form.controls.longitude.setValue(longitude);
      }
    });
  }

  address(data: any) {
    this.form.controls.addressLineFirst.setValue(data.formatted_address);
    this.form.controls.latitude.setValue(data.lat);
    this.form.controls.longitude.setValue(data.lng);
  }

  onSubmit(value) {
    this.showError = true;
    if (this.form.valid) {
      let obj = {
        name: value.name.trim(),
        addressLineFirst: value.houseNo.trim(),
        customer_address: value.addressLineFirst.trim(),
        phone_number: value.phone_number,
        accessToken: this.user.getUserToken,
        latitude: value.latitude,
        longitude: value.longitude,
        languageId: this.util.handler.languageId
      };
      if (this.setting.addCollectFieldInAddress == 1) {
        obj['collectNumber'] = value.collectNo.trim();
      }

      this.addEditAddress(obj);
    }
  }

  addEditAddress(value) {
    this.isLoading = true;
    let url = ApiUrl.address.addAddress;
    if (this.id) {
      value['addressId'] = this.id;
      url = ApiUrl.address.editAddress;
    }

    this.http.postData(url, value)
      .subscribe(response => {
        this.isLoading = false;

        if (response.status === 200) {
          this.message.toast('success', `${this.translate.instant('Address')} ${this.id ? this.translate.instant('Updated') : this.translate.instant('Added')} ${this.translate.instant('Successfully')}!`);
          this.util.goBack();
          this.util.clearLocalData('locationData');
        }

      }, error => {
        this.isLoading = false;
      });
  }

  getGeoLocation(lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(lat, lng);
    const request = { latLng: latlng };
    geocoder.geocode(request, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          this.form.patchValue({
            addressLineFirst: results[0].formatted_address,
            latitude: lat,
            longitude: lng
          });
        }
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (!!this.getDataSubscription) this.getDataSubscription.unsubscribe();
    if (!!this.getSettingSubscription) this.getSettingSubscription.unsubscribe();
  }

}
