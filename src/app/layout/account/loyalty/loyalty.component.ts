import { HttpService } from './../../../services/http/http.service';
import { Component, OnInit } from '@angular/core';
import { ApiUrl } from './../../../core/apiUrl';
import { GlobalVariable } from './../../../core/global';

@Component({
  selector: 'app-loyalty',
  templateUrl: './loyalty.component.html',
  styleUrls: ['./loyalty.component.scss']
})
export class LoyaltyComponent implements OnInit {

  loyaltyData: any = {};
  activity: Array<any> = [];
  nextLoyaltyLevel: Array<any> = [];
  currency: string = GlobalVariable.CURRENCY;

  constructor(
    private http: HttpService
  ) { }

  ngOnInit() {
    this.getLoyalty();
  }

  getLoyalty(): void {
    this.http.getData(ApiUrl.loyalty.get, {})
      .subscribe(response => {
        if (!!response && response.data && response.data.loyalityLevel.length) {
          let loyaltyData = response.data.loyalityLevel[0];
          this.loyaltyData = { ...loyaltyData };
          this.loyaltyData['totalEarningPoint'] = response.data.totalEarningPoint;
          this.loyaltyData['totalPointAmountEarned'] = response.data.totalPointAmountEarned;
          this.activity = response.data.earnedData;
          this.nextLoyaltyLevel = (response.data.nextLoyalityLevel).sort((a, b) => {
            if (a.total_loyality_points < b.total_loyality_points) {
              return -1;
            } else if (a.total_loyality_points > b.total_loyality_points) {
              return 1;
            } else {
              return 0;
            }
          });
        }
      });
  }

}
