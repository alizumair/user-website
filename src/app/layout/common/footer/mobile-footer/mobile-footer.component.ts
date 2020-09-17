import { MessagingService } from './../../../../services/messaging/messaging.service';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from './../../../../services/user/user.service';
import { Subscription } from 'rxjs';
import { UtilityService } from './../../../../services/utility/utility.service';
import { GlobalVariable } from './../../../../core/global';
import { Router } from '@angular/router';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-mobile-footer',
  templateUrl: './mobile-footer.component.html',
  styleUrls: ['./mobile-footer.component.scss']
})
export class MobileFooterComponent implements OnInit, OnDestroy {

  @Input() style: StyleVariables;
  @Input() settings: AppSettings;

  // userSubscription: Subscription;
  isMobile: boolean = GlobalVariable.IS_MOBILE;
  viewSearch: boolean = false;
  // loggedIn: boolean = false
  // userData: any;

  constructor(
    public router: Router,
    private util: UtilityService,
    // public user: UserService,
    private message: MessagingService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    // this.userSubscription = this.user.currentUser
    //   .subscribe(user => {
    //     this.userData = user;
    //     this.loggedIn = !!user && user['access_token'] ? true : false;
    //   });
  }

  // account() {
  //   if(!this.loggedIn) {
  //     this.util.authToggle.next(true);
  //   }
  // }

  // signOutConfirmation() {
  //   this.message.confirm(`${this.translate.instant('Sign Out')}`).then(data => {
  //     if (data.value) {
  //       this.user.userSignOut();
  //       this.message.toast('success', this.translate.instant('Sign Out Successfully'));
  //     }
  //   });
  // }

  ngOnDestroy() {
    // this.userSubscription.unsubscribe();
  }
}
