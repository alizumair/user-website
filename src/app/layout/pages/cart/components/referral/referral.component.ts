import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { HttpService } from './../../../../../services/http/http.service';
import { ApiUrl } from './../../../../../core/apiUrl';
import { GlobalVariable } from './../../../../../core/global';
import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-referral',
  templateUrl: './referral.component.html',
  styleUrls: ['./referral.component.scss']
})
export class ReferralComponent implements OnInit {

  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Output() referralAmount: EventEmitter<number> = new EventEmitter<number>(null);

  currency: string = '';
  referral_applied: boolean = false;
  referral_amount: number = 0;

  constructor(
    private http: HttpService,
    private message: MessagingService,
    private translate: TranslateService,
  ) {

    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit(): void {
    this.getReferralAmount();
  }

  getReferralAmount(): void {
    this.http.getData(ApiUrl.getReferralAmount, {})
      .subscribe(response => {
        if (!!response && response.data) {
          this.referral_amount = response.data.referalAmount;
        }
      });
  }

  applyReferral(): void {
    this.referral_applied = !this.referral_applied;
    this.message.toast('success', `${this.translate.instant('Referral Amount')} ${this.referral_applied ? this.translate.instant('Applied') : this.translate.instant('Removed')} ${this.translate.instant('Successully')}`);
    this.referralAmount.emit(this.referral_applied ? this.referral_amount : 0);
  }

}
