import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent {

  @Input() product: any;

  @Input() style: StyleVariables;

  @Input() settings: AppSettings;

  @Input() loggedIn: boolean = false;

  @Input() darkTheme: boolean;

  @Input() state: any = {};

  // @Input() isEditOrder: boolean = false;

  @Output() add: EventEmitter<any> = new EventEmitter<any>();

  @Output() remove: EventEmitter<any> = new EventEmitter<any>();

  @Output() onFavourite: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() { }

  favourite(event: any): void {
    this.onFavourite.emit(event);
  }

  addProduct(event: any): void {
    this.add.emit(event);
  }

  removeProduct(event: any): void {
    this.remove.emit(event);
  }

}
