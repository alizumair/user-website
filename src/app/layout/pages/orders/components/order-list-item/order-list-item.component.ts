import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { AppSettings } from '../../../../../shared/models/appSettings.model';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { Router } from '@angular/router';
import { GlobalVariable } from '../../../../../core/global';
import { StyleConstants } from '../../../../../core/theme/styleConstants.model';

@Component({
  selector: 'app-order-list-item',
  templateUrl: './order-list-item.component.html',
})
export class OrderListItemComponent implements OnInit, OnChanges {

  @Input() style: StyleVariables;

  @Input() settings: AppSettings;

  @Input() order: any;

  @Output() cancel: EventEmitter<null> = new EventEmitter<null>();

  currency: string;
  cancelButton: StyleConstants;

  constructor(
    private router: Router
  ) {
    this.currency = GlobalVariable.CURRENCY;
    this.cancelButton = new StyleConstants();
  }

  ngOnInit() {
    this.cancelButton.color = this.style.primaryColor;
    this.cancelButton.borderColor = this.style.primaryColor;
    this.cancelButton.backgroundColor = '#ffffff';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.style) {
      this.cancelButton.color = this.style.primaryColor;
      this.cancelButton.borderColor = this.style.primaryColor;
    }
  }

  makeProductCount(data) {
    let count = 0;
    for (let value in data) {
      count = count + data[value].quantity;
    }
    return count;
  }

  orderPrice(order) {
    let price = parseFloat(order.net_amount);
    price = (parseFloat(order.net_amount) + parseFloat(order.tip_agent)) - parseFloat(order.discountAmount) - parseFloat(order.referral_amount);
    if(this.settings.supplier_service_fee == 1 && order.user_service_charge) {
      let charge_amount = (order.user_service_charge/100) * price;
      price += charge_amount;
    }
    return price ? price.toFixed(2) : price;
  }

  orderDetail(data) {
    let obj = {
      orderId: [data.order_id],
    }
    this.router.navigate(['/orders/order-detail'], { queryParams: obj });
  }

}
