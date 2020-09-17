import { LocalizationPipe } from './../../../../shared/pipes/localization.pipe';
import { ApiUrl } from './../../../../core/apiUrl';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { UserService } from './../../../../services/user/user.service';
import { HttpService } from './../../../../services/http/http.service';
import { GlobalVariable } from './../../../../core/global';
import { Router } from '@angular/router';
import { UtilityService } from './../../../../services/utility/utility.service';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-food-recommended-suppliers',
  templateUrl: './food-recommended-suppliers.component.html',
  styleUrls: ['./food-recommended-suppliers.component.scss']
})
export class FoodRecommendedSuppliersComponent implements OnInit, OnChanges {

  @Input() recommendedData: any;
  @Input() isLoading: boolean = false;
  @Input() style: StyleVariables;
  @Input() settings: AppSettings;

  loggedIn: boolean = false;
  currency: string = "";
  supplier: any;
  showSupplier: boolean = false;
  suppliers: Array<any> = [];
  parentIndex: number = -1;
  childIndex: number = -1;

  siteName: string = '';

  slideConfig = {
    "slidesToShow": 2,
    "slidesToScroll": 1,
    "dots": true,
    "arrows": false,
    "infinite": false,
    "autoplay": true,
    "autoplaySpeed": 3000
  };

  constructor(
    public util: UtilityService,
    private router: Router,
    private http: HttpService,
    private userService: UserService,
    private message: MessagingService,
    private translate: TranslateService,
    private localization: LocalizationPipe
  ) {
    this.siteName = GlobalVariable.SITE_NAME;
    this.style = new StyleVariables();
  }

  ngOnInit() { 

    if(this.settings.selected_template == 2) {
      this.slideConfig.slidesToShow = 3;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.recommendedData && changes.recommendedData.currentValue) {
      this.getSuppliers();
    }
  }

  getSuppliers() {
    if (!this.recommendedData) { return }
    this.recommendedData.map((data: any) => {
      this.currency = GlobalVariable.CURRENCY;
      parseFloat(data["rating"]);
    });
    this.suppliers = this.recommendedData;
  }

  onSeeMore() {
    this.router.navigate(['/', 'supplier', 'supplier-list'], {
      queryParams: {
        'rec': 1
      }
    })
  }

  productList(supplier) {
    if (this.settings.app_type == 1) {
      this.router.navigate(['/', 'products', 'listing'], {
        queryParams: {
          supplierId: supplier.id
        }
      });
    }
  }

  wishlist(status, detail) {
    this.loggedIn = !!this.userService.getUserToken;
    if (!this.loggedIn) {
      this.message.alert('warning', this.translate.instant('Please Login First'));
      return;
    }
    let param_data = {
      status: +status,
      supplierId: detail['id'],
      accessToken: this.userService.getUserToken
    }

    const api = param_data.status == 1 ? ApiUrl.favourite.addToFavourites : ApiUrl.favourite.removeFromFavourites;

    this.http.postData(api, param_data, true)
      .subscribe(response => {
        if (!!response && response.data) {
          this.message.toast('success', `${this.localization.transform('supplier')} ${this.translate.instant('Has Been Successfully')} ${status ? this.translate.instant('Added To') : this.translate.instant('Removed From')} ${this.localization.transform('wishlist')}`);
          detail.Favourite = +status;
        }
      });
  }

}
