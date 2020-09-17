import { CartPriceModel } from './../../../../../shared/models/cart-price.model';
import { HttpService } from './../../../../../services/http/http.service';
import { ApiUrl } from './../../../../../core/apiUrl';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-cart-gift-cards',
  templateUrl: './cart-gift-cards.component.html',
  styleUrls: ['./cart-gift-cards.component.scss']
})
export class CartGiftCardsComponent implements OnInit {

  @Input() priceObj: CartPriceModel;

  giftList: Array<any> = [];
  isLoading: boolean = false;

  @Output() onSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() onRemove: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private httpService: HttpService
  ) { }

  ngOnInit() {
    this.fetch();
  }

  onGiftCardSelect(gift) {
    this.onSelect.emit(gift);
  }

  removeGiftCard() {
    this.onRemove.emit();
  }

  fetch() {
    this.isLoading = true;
    this.httpService.getData(ApiUrl.giftCard.purchaseList, { limit: 20, offset: 0 }).subscribe((response) => {
      if (response && response.data && response.data.giftData)
        this.giftList = response.data.giftData;
      this.isLoading = false;
    }, (err) => this.isLoading = false)

  }

}
