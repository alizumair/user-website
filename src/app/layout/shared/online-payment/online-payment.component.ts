import { AppSettings } from './../../../shared/models/appSettings.model';
import { UtilityService } from './../../../services/utility/utility.service';
import { GlobalVariable } from './../../../core/global';
import { Component, OnInit, Output, Input, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PaymentGateway } from '../../../shared/models/payment-gateway.model';


@Component({
  selector: 'app-online-payment',
  templateUrl: './online-payment.component.html',
  styleUrls: ['./online-payment.component.scss']
})
export class OnlinePaymentComponent implements OnInit, OnDestroy {

  @Input() order: any;
  @Input() settings: AppSettings;
  @Input() geofencedGateways: Array<string> = [];

  @Output() onSuccess: EventEmitter<any> = new EventEmitter<any>();
  @Output() onError: EventEmitter<any> = new EventEmitter<any>();
  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();


  paymentGateways: Array<PaymentGateway>;
  selectedGateway: PaymentGateway;

  subscription: Subscription;

  db_key: string = GlobalVariable.SECRET_DB_KEY;

  constructor(
    private utilService: UtilityService
  ) { }

  ngOnInit() {
    this.subscription = this.utilService.getKeys.subscribe(({ paymentGateways }) => {
      if (paymentGateways && paymentGateways.length) {
        if (this.geofencedGateways.length) {
          this.paymentGateways = paymentGateways.filter((gateway) => gateway.is_active == 1 && this.geofencedGateways.includes((gateway.name).toLowerCase()));
        } else {
          this.paymentGateways = paymentGateways.filter((gateway) => gateway.is_active == 1);
        }
        if (this.paymentGateways && this.paymentGateways.length == 1) {
          this.selectedGateway = this.paymentGateways[0];
        }
      }
    });

  }

  success($event) {
    this.onSuccess.emit($event);
  }

  errorHandler($event) {
    this.onError.emit($event);
  }

  close(event: boolean) {
    this.onClose.emit(event);
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe()
  }
}
