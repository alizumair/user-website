import { GoogleLoginProvider } from 'angularx-social-login';
import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import {
  AuthService,
  FacebookLoginProvider,
  SocialUser
} from 'angularx-social-login';
import { ApiUrl } from './../../../core/apiUrl';
import { GlobalVariable } from './../../../core/global';
import { UserService } from './../../../services/user/user.service';
import { UtilityService } from './../../../services/utility/utility.service';
import { HttpService } from './../../../services/http/http.service';
import { MessagingService } from './../../../services/messaging/messaging.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-social-login',
  templateUrl: './social-login.component.html',
  styleUrls: ['./social-login.component.scss']
})
export class SocialLoginComponent implements OnInit, OnDestroy {

  @Input() isSignUp: boolean = false;

  @Output() closeModal = new EventEmitter<boolean>();

  @Output() onSocialLogin = new EventEmitter<any>();

  @Output() enterEmail = new EventEmitter<any>(null);

  authSubscription: Subscription;

  is_facebook_login: boolean = false;

  is_google_login: boolean = false;

  constructor(
    private socialAuthService: AuthService,
    private user: UserService,
    private util: UtilityService,
    private http: HttpService,
    private message: MessagingService,
    private translate: TranslateService
  ) {

    this.is_facebook_login = GlobalVariable.facebook_appId ? true : false;
    this.is_google_login = GlobalVariable.google_clientId ? true : false;
  }

  ngOnInit() {}

  socialSignIn(socialPlatform: string) {
    if (socialPlatform === "facebook") {
      this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID);
    } else if (socialPlatform === "google") {
      this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
    }
    this.authSubscription = this.socialAuthService.authState.subscribe((userData) => {
      if (userData) {
        if (socialPlatform === "facebook" && userData.provider === 'FACEBOOK') {
          this.loginFacebook(userData);
        } else if (socialPlatform === "google" && userData.provider === 'GOOGLE') {
          this.loginGoogle(userData);
        }
      }
    });
  }

  loginGoogle(userData) {
    let obj = {
      googleToken: userData.authToken,
      name: userData.name,
      email: userData.email ? userData.email : `${userData.id}@gmail.com`,
      image: userData['photoUrl'],
      deviceToken: GlobalVariable.device_token,
      deviceType: GlobalVariable.device_type,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    }
    const firebaseToken = this.util.getLocalData('fcm_token');
    if (firebaseToken) {
      obj['deviceToken'] = firebaseToken;
    }
    this.http.postData(ApiUrl.auth.googleLogin, obj)
      .subscribe(response => {
        if (!!response && response.data) {
          this.afterSubmit(response);
        }
      });
  }

  loginFacebook(userData) {
    let obj = {
      facebookToken: userData.id,
      name: userData.name,
      email: userData.email,
      image: userData['photoUrl'],
      deviceToken: GlobalVariable.device_token,
      deviceType: GlobalVariable.device_type,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    }
    const firebaseToken = this.util.getLocalData('fcm_token');
    if (firebaseToken) {
      obj['deviceToken'] = firebaseToken;
    }

    if(!userData.email && this.isSignUp) {
      this.enterEmail.emit(obj);
      return;
    }

    this.http.postData(ApiUrl.auth.facebookLogin, obj)
      .subscribe(response => {
        if (!!response && response.data) {
          this.afterSubmit(response);
        }
      });
  }

  afterSubmit(response) {
    response['data']['is_social_login'] = true;
    this.onSocialLogin.emit(response['data']);
    this.user.setUserLocalData(response['data']);
    this.message.toast('success', this.translate.instant('Logged-In Successfully'));
    // this.util.callGetData.next(true);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) this.authSubscription.unsubscribe();
  }


}
