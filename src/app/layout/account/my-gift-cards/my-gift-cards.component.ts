import { ApiUrl } from './../../../core/apiUrl';
import { HttpService } from './../../../services/http/http.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-my-gift-cards',
  templateUrl: './my-gift-cards.component.html',
  styleUrls: ['./my-gift-cards.component.scss']
})
export class MyGiftCardsComponent implements OnInit {

  giftList: Array<any> = [];
  isLoading: boolean = false;

  selectedGift: any = {};

  constructor(
    private httpService: HttpService
  ) { }

  ngOnInit() {
    this.fetch();
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
