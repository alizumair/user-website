import { AppSettings } from './../../shared/models/appSettings.model';
import { LOCAL_STORAGE } from '@ng-toolkit/universal';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Injectable, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from '../utility/utility.service';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {

  settings: AppSettings;
  settingsSubscription: Subscription;

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  logoutSocialUser = new BehaviorSubject(false);

  constructor(
    private util: UtilityService,
    @Inject(LOCAL_STORAGE) private localStorage: any,
    private router: Router) {

    this.util.getSettings.subscribe((settings: AppSettings) => {
      this.settings = settings;
    })

    /********* Check JSON parse error on fetching currentUser from local storage **********/
    let _user: any = null;
    try {
      _user = JSON.parse(localStorage.getItem('web_user'));
    } catch (error) {
      if (error instanceof SyntaxError) this.removeUser();
    }
    this.currentUserSubject = new BehaviorSubject<any>(_user);
    this.currentUser = this.currentUserSubject.asObservable();
  }


  /********* Get the current value of the logged in user **********/
  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  /********* Get the current user token **********/
  public get getUserToken(): string {
    if (!!this.currentUserValue) return this.currentUserValue.access_token;
  }

  /********* Set user in local storage **********/
  setUserLocalData(userData: any) {
    this.localStorage.setItem('web_user', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
  }

  /********* Remove user from local storage **********/
  removeUser() {
    this.localStorage.removeItem('web_user');
    this.logoutSocialUser.next(true);
    if (this.currentUserSubject) {
      this.currentUserSubject.next(null);
    }
  }

  /********* User Sign-Out **********/
  userSignOut() {
    this.removeUser();
    this.router.navigate([''])
  }

  isUserType(type) {
    if (type == 'seller') {
      return true;
    }
  }

  ngOnDestroy(): void {
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
  }
}
