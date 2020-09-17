import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { UserService } from '../../../services/user/user.service';
import { Subscription } from 'rxjs';
import { WINDOW } from '../../../services/window/window.service';
import { HttpService } from '../../../services/http/http.service';
import { ApiUrl } from '../../../../app/core/apiUrl';
// import { ShareService } from '@ngx-share/core';
import { GlobalVariable } from './../../../core/global';
import { AppSettings } from '../../../shared/models/appSettings.model';
import { UtilityService } from '../../../services/utility/utility.service';


@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.component.html',
  styleUrls: ['./referrals.component.scss']
})
export class ReferralsComponent implements OnInit {

  user: any = {};

  myReferralList: Array<any> = [];

  userSubscription: Subscription;
  settingsSubscription: Subscription;

  view_share_buttons: boolean = false;

  shareable: any = { description: '', link: '' };

  currency: string = '';

  settings: AppSettings;

  constructor(
    @Inject(WINDOW) private window: Window,
    private userService: UserService,
    private httpService: HttpService,
    private utilityService: UtilityService) {
  }

  ngOnInit() {
     this.currency = GlobalVariable.CURRENCY;

     this.settingsSubscription = this.utilityService.getSettings.subscribe((settings: AppSettings) => {
       if (settings) {
         this.settings = settings;
       }
     })

    this.userSubscription = this.userService.currentUser.subscribe((user) => {
      this.user = user;
      this.shareable.link = `${this.window.origin}`;
      this.shareable.description = `Use code ${user.referral_id} to get ${this.currency + this.settings.referral_receive_price} as referral bonus here: `;
    });

    this.fetchMyReferral();
  }

  onCopy(): void {
    const copyText: any = this.window.document.getElementById("referralInput");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand("copy");
  }

  fetchMyReferral() {
    this.httpService.getData(ApiUrl.getMyReferral, {}).subscribe((response) => {
      if (response.status == 200) {
        this.myReferralList = response.data.referalData;
      }
    })
  }

  ngOnDestroy(): void {
    if (this.userSubscription) this.userSubscription.unsubscribe();
    if (this.settingsSubscription) this.settingsSubscription.unsubscribe();
  }

}
