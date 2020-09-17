import { AddOnComponent } from './../../../shared/product/components/add-on/add-on.component';
import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { BotMessage } from './../../../../shared/models/botMessage.model';
import { UtilityService } from './../../../../services/utility/utility.service';
import { CartService } from './../../../../services/cart/cart.service';
import { Subscription } from 'rxjs';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { GlobalVariable } from './../../../../core/global';
import { DialogService } from 'primeng/dynamicdialog';
import { CartPriceModel } from './../../../../shared/models/cart-price.model';

@Component({
  selector: 'app-bot-message',
  templateUrl: './bot-message.component.html',
  styleUrls: ['./bot-message.component.scss']
})
export class BotMessageComponent implements OnInit, OnDestroy {

  @Output() closeChatBot = new EventEmitter<any>();
  @Input() messageData: BotMessage;

  currency: string = '';
  styleSubscription: Subscription;
  style: StyleVariables;
  priceObj: CartPriceModel = new CartPriceModel();

  constructor(
    private util: UtilityService,
    public dialogService: DialogService,
    private cartService: CartService) {

    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe(
      (style: StyleVariables) => {
        this.style = style;
      });

    if (this.messageData.data.length) {
      (this.messageData.data).map(item => {
        item["selectedQuantity"] = 0;
      });
    }
  }

  addToCart(item) {
    this.cartService.emptyCart();
    this.cartService.addToCart(item, this.messageData.data);
    this.closeChatBot.emit({ type: 0, product: item });
  }

  selectAddress(item) {
    this.util.setLocalData('user_location', {
      address: item.customer_address,
      lat: item.latitude,
      lng: item.longitude
    }, true);
    this.closeChatBot.emit({type: 1, address: item.customer_address, address_id: item.id});
  }

  proceedOrder(answer) {
    this.closeChatBot.emit({ type: 2, answer: answer });
  }

  paymentSelection(answer) {
    this.closeChatBot.emit({ type: 3, answer: answer });
  }

  addAddress() {
    this.closeChatBot.emit({type: 4});
  }

  selectAddon(product) {
    const dialogRef = this.dialogService.open(AddOnComponent, {
      header: product['name'],
      width: '45%',
      showHeader: false,  
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      data: {
        product: Object.assign({}, product),
        addOnItems: product['adds_on']
      }
    });

    dialogRef.onClose.subscribe((addedToCart: boolean) => {
      if(addedToCart) {
        this.closeChatBot.emit({type: 0, product: product});
      }
    })
  }

  ngOnDestroy() {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
  }

}
