import { CartPriceModel } from './../../../../../shared/models/cart-price.model';
import { TranslateService } from '@ngx-translate/core';
import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { GlobalVariable } from './../../../../../core/global';

@Component({
  selector: 'app-loyalty-discount',
  templateUrl: './loyalty-discount.component.html',
  styleUrls: ['./loyalty-discount.component.scss']
})
export class LoyaltyDiscountComponent implements OnInit {

  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Input() loyalty_amount: number = 0;
  @Input() priceObj: CartPriceModel;
  @Output() loyaltylAmount: EventEmitter<number> = new EventEmitter<number>(null);

  currency: string = '';
  loyalty_applied: boolean = false;
  applied_admount: number = 0;

  constructor(
    private message: MessagingService,
    private translate: TranslateService,
  ) {

    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit(): void {}

  applyReferral(): void {
    this.loyalty_applied = !this.loyalty_applied;
    this.message.toast('success', `Loyalty Points Discount ${this.loyalty_applied ? this.translate.instant('Applied') : this.translate.instant('Removed')} ${this.translate.instant('Successully')}`);
    if(this.loyalty_applied) {
      this.applied_admount = this.loyalty_amount > this.priceObj.netTotal ? this.priceObj.netTotal : this.loyalty_amount;
    } else {
      this.applied_admount =  0;
    }
    this.loyaltylAmount.emit(this.applied_admount);

  }
}
