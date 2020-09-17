import { transition } from '@angular/animations';
import { AppSettings } from './../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { StyleConstants } from './../../../core/theme/styleConstants.model';
import { MessagingService } from './../../../services/messaging/messaging.service';
import { ApiUrl } from './../../../core/apiUrl';
import { HttpService } from './../../../services/http/http.service';
import { UtilityService } from './../../../services/utility/utility.service';
import { AppHandler } from './../../../shared/models/appHandler.model';
import { UserService } from './../../../services/user/user.service';
import { GlobalVariable } from './../../../core/global';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TooltipLabel, SearchCountryField, CountryISO } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  @Output() closeModal = new EventEmitter<boolean>();
  @Output() openForgot = new EventEmitter<boolean>();
  @Output() onIncompleteProfile = new EventEmitter<any>();

  loginType: 'email' | 'phone' = 'email';
  siteName: string = '';
  loginForm: FormGroup;
  submitted: boolean = false;
  emailPattern: RegExp;
  handler: AppHandler;
  primaryButton: StyleConstants;
  style: StyleVariables;
  styleSubscription: Subscription;
  settings: AppSettings;
  image_paths: string = '';
  passwordType: string = 'password';

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  TooltipLabel = TooltipLabel;
  countryISO: CountryISO | string = CountryISO.UnitedStates;
  preferredCountries: Array<CountryISO> | Array<string> = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];

  isLoading: boolean = false;

  otpView: boolean;
  otpForm: FormGroup;
  otpSubmitted: boolean;
  counter = 180;
  interval = 1000;
  count: number;
  userCreatedId: string;

  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private user: UserService,
    private util: UtilityService,
    private http: HttpService,
    private message: MessagingService) {

    this.siteName = GlobalVariable.SITE_NAME;
    this.style = new StyleVariables();
    this.primaryButton = new StyleConstants();
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
        this.primaryButton.backgroundColor = style.primaryColor;
        this.primaryButton.color = '#ffffff';
      });

    this.util.getSettings.subscribe((settings: AppSettings) => {
      if (!!settings) {
        this.settings = settings;
        this.image_paths = settings.site_logo;
        this.loginType = settings.phone_registration_flag == 1 ? 'phone' : 'email';
        if (!!settings.countryISO) {
          this.countryISO = (settings.countryISO).toLowerCase();
          this.preferredCountries = [(settings.countryISO).toLowerCase()];
        }
      }
    });
    this.createLoginForm();
  }

  createLoginForm() {
    this.loginForm = this.formBuilder.group({
      deviceToken: GlobalVariable.device_token,
      deviceType: GlobalVariable.device_type,
      languageId: this.util.handler.languageId
    });
    if (this.loginType == 'email') {
      this.loginForm.addControl('email', new FormControl('', [Validators.required, Validators.email]));
    } else {
      this.loginForm.addControl(this.settings.phone_registration_flag == 0 ? 'phoneNumber' : 'mobileNumber', new FormControl(null, [Validators.required]))
    }

    // login with otp (whatsApp)
    if (this.settings.phone_registration_flag == 0 || this.loginType == 'email') {
      this.loginForm.addControl('password', new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]));
    } else {
      this.loginForm.addControl('latitude', new FormControl(this.util.handler.latitude)),
        this.loginForm.addControl('longitude', new FormControl(this.util.handler.longitude));
    }

  }

  loginMethod(type: any) {
    if (this.loginType == type) return;
    this.loginType = type;
    this.createLoginForm();
    this.submitted = false;
  }

  get userForm() { return this.loginForm.controls; }

  onSubmit() {

    this.submitted = true;
    if (this.loginForm.invalid) {
      setTimeout(() => {
        this.submitted = false;
      }, 10000);
      return;
    }

    const payload = { ...this.loginForm.value };
    if (this.loginType == 'phone') {
      payload.countryCode = payload[this.settings.phone_registration_flag == 0 ? 'phoneNumber' : 'mobileNumber'].dialCode;
      payload[this.settings.phone_registration_flag == 0 ? 'phoneNumber' : 'mobileNumber'] =
        Number(payload[this.settings.phone_registration_flag == 0 ? 'phoneNumber' : 'mobileNumber'].number.replace(/ +/g, ''));
    }

    if (this.settings.phone_registration_flag == 1) {
      payload['mobileNumber'] =
        JSON.stringify(payload['mobileNumber']);
    }

    const firebaseToken = this.util.getLocalData('fcm_token');
    if (firebaseToken) {
      payload['deviceToken'] = firebaseToken;
      payload['deviceType'] = '2';
    }

    this.isLoading = true;
    this.http.postData(this.settings.phone_registration_flag == 0 ? ApiUrl.auth.login : ApiUrl.auth.whatsappSendOtp, payload)
      .subscribe(response => {
        this.isLoading = false;
        if (!!response && response.data) {
          if (this.settings.phone_registration_flag == 1) { // login with otp
            this.userCreatedId = response.data.userCreatedId;
            this.createOtpForm();
            this.otpView = true;
            return;
          }

          this.afterLogin(response);
        }
      },
        (err) => {
          this.isLoading = false;
        });
  }

  /********** login OTP check start **********/
  createOtpForm() {
    this.otpForm = this.formBuilder.group({
      userCreatedId: [this.userCreatedId, Validators.required],
      languageId: this.util.handler.languageId,
      otp: ['', [Validators.required, Validators.maxLength(5)]]
    });
  }

  get otpfm() { return this.otpForm.controls; }

  confirmOTP() {
    this.otpSubmitted = true;
    if (this.otpForm.invalid) {
      setTimeout(() => {
        this.otpSubmitted = false;
      }, 10000);
      return;
    }

    this.isLoading = true;
    this.http.postData(ApiUrl.auth.whatsappOtpVerify, this.otpForm.value)
      .subscribe(response => {
        this.isLoading = false;
        if (!!response && response.data) {
          this.otpView = false;
          this.otpSubmitted = false;
          this.afterLogin(response);
        }
      }, error => {
        this.isLoading = false;
      });
  }

  resendOTP() {
    this.isLoading = true;
    this.counter = 0;
    this.http.postData(ApiUrl.auth.whatsappResendOtp, { userCreatedId: this.userCreatedId })
      .subscribe(response => {
        this.isLoading = false;
        if (!!response && response.data) {
          this.counter = 180;
          this.message.toast('success', 'OTP Has Been Sent Again');
        }
      });
  }

  afterLogin(response) {
    if (!response.data.firstname && this.settings.phone_registration_flag == 0) {
      this.onIncompleteProfile.emit(response.data);
      return;
    }
    if (response['data']['accessToken']) {
      response['data']['access_token'] = response['data']['accessToken'];
    }
    this.closeModal.emit(true);
    this.user.setUserLocalData(response['data']);
    this.message.toast('success', this.translate.instant('Logged-In Successfully'));
    // this.util.callGetData.next(true);
  }

  openForgotPassword() {
    this.openForgot.emit(true);
  }

  onSocialLogin(event) {
    if (event && event.access_token) {
      this.closeModal.emit(true);
    }
  }

  ngOnDestroy() {
    this.styleSubscription.unsubscribe();
  }

}
