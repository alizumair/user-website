import { GlobalVariable } from './../../../core/global';
import { UtilityService } from './../../../services/utility/utility.service';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { MessagingService } from './../../../services/messaging/messaging.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { UserService } from './../../../services/user/user.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AppSettings } from '../../../shared/models/appSettings.model';
import { filter } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { LocalizationPipe } from '../../../shared/pipes/localization.pipe';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit, OnDestroy {

  user: any = {};
  getDataSubscribe: Subscription;
  styleSubscription: Subscription;
  settingsSubscription: Subscription;

  style: StyleVariables;
  settings: AppSettings;
  activeParentRoute: string = '';

  isSocialLogedIn: boolean = false;
  isMobile: boolean = GlobalVariable.IS_MOBILE;

  constructor(
    public userService: UserService,
    private message: MessagingService,
    private util: UtilityService,
    public router: Router,
    private translate: TranslateService,
    private localization: LocalizationPipe,
  ) {
    /** page reload */
    this.activeParentRoute = this.router.url.split('/')[2];

    this.style = new StyleVariables();
    this.router.events.pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe(event => {
        if (event && event.url) {
          this.activeParentRoute = (event.url).split('/')[2];
        }
      });
  }

  ngOnInit() {
    this.makeSubscribe();
  }

  makeSubscribe() {
    this.settingsSubscription = this.util.getSettings.subscribe((settings) => {
      this.settings = settings;
    });

    this.styleSubscription = this.util.getStyles.subscribe(style => {
      this.style = style;
    });

    this.getDataSubscribe = this.userService.currentUser
      .subscribe(userData => {
        if (userData && userData['access_token']) {
          this.user = userData;
          this.isSocialLogedIn = this.user['fb_access_token'] ? true : false;
        }
      });
  }

  signOutConfirmation() {
    this.message.confirm(`${this.translate.instant('Sign Out')}`).then(data => {
      if (data.value) {
        this.userService.userSignOut();
        this.message.toast('success', this.translate.instant('Sign Out Successfully'));
      }
    });
  }


  ngOnDestroy() {
    this.getDataSubscribe.unsubscribe();
    this.styleSubscription.unsubscribe();
  }

}
