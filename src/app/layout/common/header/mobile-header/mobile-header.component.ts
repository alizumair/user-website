import { TranslateService } from '@ngx-translate/core';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { UserService } from './../../../../services/user/user.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GlobalVariable } from './../../../../core/global';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-mobile-header',
  templateUrl: './mobile-header.component.html',
  styleUrls: ['./mobile-header.component.scss']
})
export class MobileHeaderComponent implements OnInit, OnDestroy {

  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  userSubscription: Subscription;

  viewSearch: boolean = false;
  loggedIn: boolean = false
  userData: any;


  constructor(
    public router: Router,
    private util: UtilityService,
    public user: UserService,
    private message: MessagingService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.userSubscription = this.user.currentUser
      .subscribe(user => {
        this.userData = user;
        this.loggedIn = !!user && user['access_token'] ? true : false;
      });
  }

  account() {
    if (!this.loggedIn) {
      this.util.authToggle.next(true);
    }
  }

  signOutConfirmation() {
    this.message.confirm(`${this.translate.instant('Sign Out')}`).then(data => {
      if (data.value) {
        this.user.userSignOut();
        this.message.toast('success', this.translate.instant('Sign Out Successfully'));
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

}
