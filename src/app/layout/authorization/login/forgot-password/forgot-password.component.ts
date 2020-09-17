import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { StyleConstants } from './../../../../core/theme/styleConstants.model';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { ApiUrl } from './../../../../core/apiUrl';
import { HttpService } from './../../../../services/http/http.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { AppHandler } from './../../../../shared/models/appHandler.model';
import { UserService } from './../../../../services/user/user.service';
import { GlobalVariable } from './../../../../core/global';
import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  @Output() closeModal = new EventEmitter<boolean>();

  loginForm: FormGroup;
  submitted: boolean = false;
  emailPattern: RegExp;
  handler: AppHandler;
  primaryButton: StyleConstants;
  style: StyleVariables;
  styleSubscription: Subscription;
  siteName: string = '';
  settings: AppSettings;
  image_paths: string = '';

  isLoading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private util: UtilityService,
    private http: HttpService,
    private message: MessagingService,
    private translate: TranslateService) {

    this.siteName = GlobalVariable.SITE_NAME;
    // this.emailPattern = new RegExp(GlobalVariable.PATTERNS.email);
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
      }
    });

    this.createLoginForm();
  }

  createLoginForm() {
    this.loginForm = this.formBuilder.group({
      emailId: ['', [Validators.required, Validators.email]]
    });
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

    this.isLoading = true;
    this.http.postData(ApiUrl.auth.forgotPassword, this.loginForm.value)
      .subscribe(response => {
        if (!!response && response.data) {
          this.closeModal.emit(true);
          this.message.toast('success', this.translate.instant('Email With Password Sent Successfully'));
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  ngOnDestroy() {
    this.styleSubscription.unsubscribe();
  }

}
