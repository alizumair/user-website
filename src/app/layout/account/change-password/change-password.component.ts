import { Subscription } from 'rxjs';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';

import { ApiUrl } from './../../../core/apiUrl';
import { HttpService } from './../../../services/http/http.service';
import { MessagingService } from './../../../services/messaging/messaging.service';
import { UtilityService } from './../../../services/utility/utility.service';
import { UserService } from './../../../services/user/user.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  // form
  form: FormGroup;
  showError: boolean = false;
  btnDisabled: boolean = false;
  id: string = '';
  styleSubscription: Subscription;
  style: StyleVariables;

  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private http: HttpService,
    private message: MessagingService, private util: UtilityService,
    private userService: UserService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe(style => {
      this.style = style;
    });
    this.makeForm();
  }

  makeForm() {
    this.form = this.fb.group({
      'oldPassword': ['', Validators.compose([Validators.required])],
      'newPassword': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(20)])],
      'languageId': [this.util.handler.languageId],
      'accessToken': [this.userService.getUserToken],
      'confirmPassword': ['', Validators.compose([Validators.required])]
    });
  }

  onSubmit(value) {
    this.showError = true;
    if (this.form.valid) {
      if (value.newPassword == value.confirmPassword) {
        this.isLoading = true;
        this.http.postData(ApiUrl.auth.changePassword, value)
          .subscribe(response => {
            this.isLoading = false;
            if (!!response && response.data) {
              this.message.toast('success', `${this.translate.instant('Password Changed Successfully')}!`);
              this.form.reset();
              this.showError = false;
            }
          }, error => { this.isLoading = false });
      } else {
        this.message.toast('info', this.translate.instant('New Password And Confirm Password Not Matched'));
      }
    }
  }

  ngOnDestroy() {
    this.styleSubscription.unsubscribe();
  }

}
