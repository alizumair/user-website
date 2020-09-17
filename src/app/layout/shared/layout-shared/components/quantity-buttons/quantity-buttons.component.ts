import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FirebaseAnalyticsService } from '../../../../../services/firebase-analytics/firebase-analytics.service';
import { GlobalVariable } from './../../../../../core/global';


@Component({
  selector: 'app-quantity-buttons',
  templateUrl: './quantity-buttons.component.html',
})
export class QuantityButtonsComponent implements OnInit {

  inputType: 'number' | 'text' = 'number';

  @Input() settings: AppSettings;

  @Input() style: StyleVariables;

  @Input() deafultView: boolean = false;

  timeInterval: number = 0;

  @Input() selectedQuantity: number = 0;

  @Input() disabled: boolean = false;

  @Input() priceType: 0 | 1 = 0;

  @Input() isProduct: 0 | 1 = 1;

  @Output() onAdd: EventEmitter<any> = new EventEmitter<any>();

  @Output() onRemove: EventEmitter<any> = new EventEmitter<any>();

  @Output() quantityUpdate: EventEmitter<any> = new EventEmitter<any>(null);

  constructor(
    private fireBaseAnSvc: FirebaseAnalyticsService
  ) { }

  ngOnInit() {
    if (this.settings)
      this.timeInterval = this.settings['interval'];
    if (!this.isProduct) this.inputType = 'text';
  }

  addQty() {
    this.fireBaseAnSvc.firebaseAnalyticsEvents('add_to_cart', 'add_to_cart');
    this.onAdd.emit();
  }

  quantityInput(quantity){
    let multiply = 1 / GlobalVariable.decimal_quantity_step;
    this.selectedQuantity = parseFloat(((Math.ceil(quantity * multiply) / multiply)).toFixed(2));    
    this.quantityUpdate.emit(this.selectedQuantity);
  }

}
