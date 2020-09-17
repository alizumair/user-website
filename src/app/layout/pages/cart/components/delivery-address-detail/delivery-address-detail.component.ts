import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { AppSettings } from '../../../../../shared/models/appSettings.model';
import { UtilityService } from '../../../../../services/utility/utility.service';
import { HttpService } from '../../../../../services/http/http.service';
import { UserService } from '../../../../../services/user/user.service';
import { MessagingService } from '../../../../../services/messaging/messaging.service';
import { ApiUrl } from '../../../../../core/apiUrl';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../../../services/validation/validation.service';
import { StyleConstants } from '../../../../../core/theme/styleConstants.model';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-delivery-address-detail',
  templateUrl: './delivery-address-detail.component.html',
  styleUrls: ['./delivery-address-detail.component.scss']
})
export class DeliveryAddressDetailComponent implements OnInit, OnChanges, OnDestroy {

  isLoading: boolean = false;
  showError: boolean = false;
  is_self_pickup: number = 0;
  addressList: Array<any> = [];
  selectedAreaIndex: number = 0;
  localAreaIndex: number = 0;

  addressModel: any = {};
  form: FormGroup;
  display: string = "none";
  defaultLocation : any  = JSON.parse(localStorage.getItem('user_location'));
  loginData : any  = JSON.parse(localStorage.getItem('web_user'));

  @Input() cart: Array<any> = [];
  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Input() loggedIn: boolean = false;
  @Input() addAddressModel: Observable<boolean>;
  @Input() isAddressHide: number = 0;

  cancelBtn: StyleConstants;
  saveBtn: StyleConstants;
  routeSubscription: Subscription;

  @ViewChild('closeAddressModal', { static: false }) closeAddressModal: ElementRef;
  @ViewChild('closeNewAddress', { static: false }) closeNewAddress: ElementRef;

  @Output() addressDetail: EventEmitter<any> = new EventEmitter<any>();
  @Output() serviceCharge: EventEmitter<any> = new EventEmitter<any>(null);

  addressId: number = 0;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private user: UserService,
    private util: UtilityService,
    private message: MessagingService,
    private validator: ValidationService,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {
    this.cancelBtn = new StyleConstants();
    this.saveBtn = new StyleConstants();

    this.routeSubscription = this.route.queryParams
      .subscribe(params => {
        if (params['place_order'] == 1 && params['adrs_id']) {
          this.addressId = parseInt(params['adrs_id']);
        }
      });
  }

  ngOnInit(): void {
    if (this.settings && this.settings.app_type == 7) {
      this.is_self_pickup = 1;
    }

    this.cancelBtn.color = this.style.defaultColor;
    this.cancelBtn.borderColor = this.style.defaultColor;
    this.saveBtn.backgroundColor = this.style.primaryColor;
    this.saveBtn.borderColor = this.style.primaryColor;
    this.saveBtn.color = '#ffffff';

    this.makeNewAddressForm();
    this.addAddressModel.subscribe(item => {
      if (item && this.settings.header_theme == 2) {
        this.display = 'block';
      }
    });
  }

  ngOnChanges(): void {
    if (this.loggedIn) {
      this.getAddress();
    }
  }

  makeNewAddressForm() {
    this.form = this.fb.group({
      'name': ['', Validators.compose([Validators.required, this.validator.noWhitespaceValidator])],
      'houseNo': ['', Validators.compose([Validators.required, this.validator.noWhitespaceValidator])],
      'collectNo': ['', Validators.compose([Validators.required, this.validator.noWhitespaceValidator])],
      'addressLineFirst': ['', Validators.compose([Validators.required])],
      'latitude': ['', Validators.compose([Validators.required])],
      'longitude': ['', Validators.compose([Validators.required])],
      'phone_number': ['', Validators.compose([Validators.required, Validators.pattern(this.validator.mobile)])]
    });

    if (this.settings.addCollectFieldInAddress == 0) {
      this.form.controls['collectNo'].setValidators(null);
      this.form.controls['collectNo'].updateValueAndValidity();
    }

    this.defaultLocation['formatted_address'] = this.defaultLocation.address;
    this.onAddressSearch(this.defaultLocation);

    this.form.controls.name.setValue(this.loginData.firstname);
    this.form.controls.phone_number.setValue(this.loginData.mobile_no);

  }


  getAddress() {
    let obj = {
      accessToken: this.user.getUserToken,
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    };
    if (this.cart.length) {
      obj['supplierBranchId'] = this.cart[0].supplier_branch_id;
    }

    this.http.postData(ApiUrl.address.getAddress, obj, true)
      .subscribe(response => {
        if (!!response && response.data) {
          this.addressModel = response.data;
          this.addressList = response.data.address;
          let index = -1;
          if(this.addressId) {
            index = response.data.address.findIndex((add) => add.id == this.addressId);
          } else {
            index = response.data.address.findIndex((add) => add.is_default == 1);
          }
          if (index > -1) {
            this.selectedAreaIndex = index;
            this.localAreaIndex = index;
          }
          if (this.settings.supplier_service_fee == 1 && response.data.user_service_charge) {
            this.serviceCharge.emit(response.data.user_service_charge);
          }
          this.onAddressSelect();
        }
      });
  }

  onAddressSelect(): void {
    this.selectedAreaIndex = this.localAreaIndex;
    let completeInfo = Object.assign({}, this.addressModel);
    completeInfo.address = this.addressList[this.selectedAreaIndex];
    this.addressDetail.emit(completeInfo);
    this.closeAddressModal.nativeElement.click();
  }

  addAddress() {
    if (this.loggedIn) {
      this.router.navigate(['/account/address/add-edit-address']);
    } else {
      this.message.alert('info', `${this.translate.instant('Please Login First')}!`);
    }
  }

  openNewAddressDialog() {
    if (!this.loggedIn) {
      this.message.alert('info', `${this.translate.instant('Please Login First')}!`);
    } else {
      this.display = 'block';
    }
  }

  onAddressSearch(data) {
    console.log('32432',data);
    this.form.controls.addressLineFirst.setValue(data.formatted_address);
    this.form.controls.latitude.setValue(data.lat);
    this.form.controls.longitude.setValue(data.lng);
  }

  onAdd(value) {
    if (this.form.invalid) {
      this.showError = true;
      setTimeout(() => {
        this.showError = false;
      }, 300000);
      return;
    }
    let payload = {
      name: value.name.trim(),
      addressLineFirst: value.houseNo.trim(),
      customer_address: value.addressLineFirst.trim(),
      phone_number: value.phone_number,
      accessToken: this.user.getUserToken,
      latitude: value.latitude,
      longitude: value.longitude,
      languageId: this.util.handler.languageId
    }

    if (this.settings.addCollectFieldInAddress == 1) {
      payload['collectNumber'] = value.collectNo.trim();
    }

    this.isLoading = true;
    this.http.postData(ApiUrl.address.addAddress, payload)
      .subscribe(response => {
        if (response && response.status === 200) {
          this.addressList.push(response.data);

          this.message.toast('success', `${this.translate.instant('Address Added Successfully')}!`);

          let completeInfo = Object.assign({}, this.addressModel);
          completeInfo.address = response.data;

          this.selectedAreaIndex = this.addressList.length - 1;
          this.addressDetail.emit(completeInfo);

          this.makeNewAddressForm();
          this.closeNewAddress.nativeElement.click();
        }
        this.isLoading = false;
      }, (err) => {
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.closeAddressModal.nativeElement.click();
    this.closeNewAddress.nativeElement.click();
    if (!!this.routeSubscription) this.routeSubscription.unsubscribe();
  }
}
