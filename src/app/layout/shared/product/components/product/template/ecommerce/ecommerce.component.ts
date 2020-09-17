import { LocalizationPipe } from './../../../../../../../shared/pipes/localization.pipe';
import { ApiUrl } from './../../../../../../../core/apiUrl';
import { HttpService } from './../../../../../../../services/http/http.service';
import { CartService } from './../../../../../../../services/cart/cart.service';
import { MessagingService } from './../../../../../../../services/messaging/messaging.service';
import { UtilityService } from './../../../../../../../services/utility/utility.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { DialogService } from 'primeng/dynamicdialog';
import { BaseProduct } from '../base-product.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ecommerce',
  templateUrl: './ecommerce.component.html',
  styleUrls: ['./ecommerce.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class EcommerceComponent extends BaseProduct {

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
