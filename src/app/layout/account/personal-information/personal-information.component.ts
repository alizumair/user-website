import { TranslateService } from '@ngx-translate/core';
import { StyleConstants } from './../../../core/theme/styleConstants.model';
import { StyleVariables } from './../../../core/theme/styleVariables.model';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ApiUrl } from './../../../core/apiUrl';
import { HttpService } from './../../../services/http/http.service';
import { MessagingService } from './../../../services/messaging/messaging.service';
import { UtilityService } from './../../../services/utility/utility.service';
import { UserService } from './../../../services/user/user.service';
import { GlobalVariable } from './../../../core/global';
import { Subscription } from 'rxjs';
import { ValidationService } from './../../../services/validation/validation.service';
import { AppSettings } from './../../../shared/models/appSettings.model';


@Component({
  selector: 'app-personal-information',
  templateUrl: './personal-information.component.html',
  styleUrls: ['./personal-information.component.scss']
})
export class PersonalInformationComponent implements OnInit, OnDestroy {

  // form
  settingSubscription: Subscription;
  form: FormGroup;
  showError: boolean = false;
  btnDisabled: boolean = false;
  id: string = '';
  user: any = {};
  imageType = GlobalVariable.imageType;
  primaryButton: StyleConstants;
  style: StyleVariables;
  styleSubscription: Subscription;

  isLoading: boolean = false;

  settings: AppSettings;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private userService: UserService,
    private message: MessagingService,
    private util: UtilityService,
    private validator: ValidationService,
    private translate: TranslateService
  ) {

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
    this.makeForm();
    this.getSettings();
  }

  getSettings() {
    this.settingSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        this.settings = settings;
      })
  }

  makeForm() {
    this.user = this.util.getLocalData('web_user', true);
    this.form = this.fb.group({
      'name': [this.user.firstname, Validators.compose([Validators.required, this.validator.noWhitespaceValidator])],
      'profilePic': [''],
      'accessToken': this.userService.getUserToken,
      'abn_number': [''],
      'business_name': [''],
    });
  }



  /********** On selection of image insert the value in form **********/
  onImageSelect(event: any) {
    if (event.target.files && event.target.files[0]) {
      let file = event.target.files[0];
      if (file.size / 1024 / 1024 < 5) {
        if (this.imageType.includes(file.type)) {
          this.form.value.profilePic = event.target.files[0];
          let reader: FileReader = new FileReader();
          reader.readAsDataURL(event.target.files[0]);
          reader.onload = (e: any) => {
            this.user.user_image = e.target.result;
          }
        } else this.message.toast('warning', this.translate.instant('Invalid File Type'));
      } else this.message.toast('warning', this.translate.instant('Image Size Should Be Less Than 5 Mb'));
    }
  }

  onSubmit(value) {
    this.showError = true;
    let formData = this.http.appendFormData(value);
    if (this.form.valid) {
      this.isLoading = true;
      this.http.postData(ApiUrl.auth.signUp_step3, formData)
        .subscribe(response => {
          this.isLoading = false;
          if (!!response && response.data) {
            this.userService.setUserLocalData(response.data);
            this.user = this.util.getLocalData('web_user', true);
            this.message.toast('success', `${this.translate.instant('Profile Updated Successfully')}!`);
          }
        }, error => { this.isLoading = false });
    }
  }

  ngOnDestroy() {
    if (!!this.settingSubscription) this.settingSubscription.unsubscribe();
  }

}