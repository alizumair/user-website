import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GlobalVariable } from './../../../../../core/global';
import { Component, OnInit, OnDestroy, EventEmitter, Output, Input, ChangeDetectionStrategy } from '@angular/core';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { AppSettings } from '../../../../../shared/models/appSettings.model';
import { UtilityService } from '../../../../../services/utility/utility.service';

@Component({
  selector: 'app-cart-payment-mode',
  templateUrl: './cart-payment-mode.component.html',
  styleUrls: ['./cart-payment-mode.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartPaymentModeComponent implements OnInit, OnDestroy {

  paymentType: '0' | '1' | '4' = '0';

  currency: string = ''
  routeSubscription: Subscription;
  @Input() selfPickup: any;
  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Input() walletAmount: number = 0;

  @Output() paymentMode: EventEmitter<string> = new EventEmitter<string>();
  @Output() changeInRequest: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private util: UtilityService, private route: ActivatedRoute) {
    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.queryParams
      .subscribe(params => {
        if (params['p_mode']) {
          this.paymentType = params['p_mode'];
          this.paymentMode.emit(params['p_mode']);
        } else {
          if (this.settings.payment_method == '1') {
            this.paymentType = '1';
            this.paymentMode.emit(this.paymentType);
          } else {
            this.paymentMode.emit(this.paymentType);
          }
        }
      });
  }

  ngOnDestroy(): void {
    if (!!this.routeSubscription) this.routeSubscription.unsubscribe();
  }

}
