import { Component, Input, OnChanges } from '@angular/core';
import { GlobalVariable } from './../../../../core/global';
import { UtilityService } from './../../../../services/utility/utility.service';
import { Router } from '@angular/router';
import { AppSettings } from './../../../../shared/models/appSettings.model';

@Component({
  selector: 'app-ecom-today-offer',
  templateUrl: './ecom-today-offer.component.html',
  styleUrls: ['./ecom-today-offer.component.scss']
})
export class EcomTodayOfferComponent implements OnChanges {

  @Input() offerData: any = [];
  @Input() settings: AppSettings;

  currency = '';

  constructor(
    public utilityService: UtilityService,
    private router: Router
  ) {
    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnChanges() {
    console.log(this.offerData);
  }

  productDetail(data: any) {
    if (this.settings.app_type != 1) {
      let obj = {
        productId: data.parent_id || data.product_id,
        supplierBranchId: data.supplier_branch_id,
        category: data.category_id
      };
      data.name = data.name.replace(/ &/g, '-');
      obj = { ...this.utilityService.handler, ...obj };
      this.router.navigate(['/products', 'product-detail', data.name], {
        queryParams: { f: this.utilityService.encryptData(obj) }
      });
    }
  }
}
