import { HttpService } from './../../../../../../../services/http/http.service';
import { TranslateService } from '@ngx-translate/core';
import { LocalizationPipe } from './../../../../../../../shared/pipes/localization.pipe';
import { CartService } from './../../../../../../../services/cart/cart.service';
import { MessagingService } from './../../../../../../../services/messaging/messaging.service';
import { Router } from '@angular/router';
import { UtilityService } from './../../../../../../../services/utility/utility.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Component } from '@angular/core';
import { BaseProduct } from '../base-product.component';
import { DialogService } from 'primeng/dynamicdialog';
import { QuestionsComponent } from '../../../../../../../layout/shared/layout-shared/components/questions/questions.component';

@Component({
  selector: 'app-home-service',
  templateUrl: './home-service.component.html',
  styleUrls: ['./home-service.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class HomeServiceComponent extends BaseProduct {

  constructor(
    public http: HttpService,
    public util: UtilityService,
    public router: Router,
    public message: MessagingService,
    public cartService: CartService,
    public dialogService: DialogService,
    public localization: LocalizationPipe,
    public translate: TranslateService
  ) {
    super(http, util, router, message, cartService, dialogService, localization, translate);
  }

  openQuestions(): void {
    const dialogRef = this.dialogService.open(QuestionsComponent, {
      width: '60%',
      showHeader: false,
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      data: {
        cat_id: this.product['detailed_sub_category_id'] || this.product['sub_category_id'] || this.product['categories_id'] || this.product['category_id'],
      }
    });

    dialogRef.onClose.subscribe((navigate: boolean) => {
      if (navigate) {
        if (this.settings.laundary_service_flow == 1 && this.product['price_type'] == 0) {
          this.cartService.addToCart(this.product);
          this.router.navigate(['/', 'cart']);
        } else {
          this.toAgentList();
        }
      }
    });
  }

  onBookNow(): void {
    if (this.state.editOrder) {
      return this.add.emit(this.product);
    }

    if(!this.cartService.checkCartCategory(this.product) && this.settings.laundary_service_flow == 0) {
      this.util.setCart([]);
    }

    if ((this.settings.laundary_service_flow == 1 || this.settings.hideAgentList == 1) && this.product['price_type'] == 0 && this.settings.app_type == 8) {
      this.cartService.addToCart(this.product, null, true);
    } else {
      this.util.clearLocalData('ques_data');
      this.cartService.emptyCart();

      if (this.settings.product_detail == 1) {
        this.productDetail(this.product);
        return;
      } else if (this.product.is_question == 1) {
        this.openQuestions();
      } else {
        this.toAgentList();
      }
    }
  }

  toAgentList() {
    if (!this.loggedIn) {
      this.util.authToggle.next(true);
      return;
    }
    const url: any = this.router.url;
    this.util.setRedirectUrl(url);

    if (this.product['price_type']) {
      this.product.selectedQuantity += this.product.duration / this.settings.interval;
    } else {
      this.product.selectedQuantity = 1;
    }

    this.util.setLocalData('selected_service', this.product, true);

    let params = {
      isPkg: '0',
      service_ids: this.product.id || this.product.product_id
    };
    this.router.navigate(['/', 'cart', 'agent'], {
      queryParams: params
    });
  }
}
