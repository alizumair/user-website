import { HttpService } from './../../../../../../../services/http/http.service';
import { LocalizationPipe } from './../../../../../../../shared/pipes/localization.pipe';
import { TranslateService } from '@ngx-translate/core';
import { CartService } from './../../../../../../../services/cart/cart.service';
import { MessagingService } from './../../../../../../../services/messaging/messaging.service';
import { UtilityService } from './../../../../../../../services/utility/utility.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { DialogService } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { BaseProduct } from '../base-product.component';

@Component({
  selector: 'app-food',
  templateUrl: './food.component.html',
  styleUrls: ['./food.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class FoodComponent extends BaseProduct {

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

}
