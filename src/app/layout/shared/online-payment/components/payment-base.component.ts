import { AppSettings } from './../../../../shared/models/appSettings.model';
import { Input, Output, EventEmitter, Component } from '@angular/core';
import { PaymentGateway } from '../../../../shared/models/payment-gateway.model';

@Component({
  selector: 'app-payment-base',
  template: '',
  styleUrls: []
})
export class PaymentBaseComponent {

  @Input() order: any;
  @Input() gateway: PaymentGateway;
  @Input() settings: AppSettings;

  @Output() onSuccess: EventEmitter<any> = new EventEmitter<any>();
  @Output() onError: EventEmitter<any> = new EventEmitter<any>();
  @Output() onClose: EventEmitter<boolean> = new EventEmitter<boolean>(true);

  close(): void {
    this.onClose.emit(false)
  }

}
