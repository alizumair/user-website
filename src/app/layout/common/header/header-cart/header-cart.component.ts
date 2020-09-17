import { GlobalVariable } from './../../../../core/global';
import { ThemeService } from './../../../../services/theme/theme.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UtilityService } from './../../../../services/utility/utility.service';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header-cart',
  templateUrl: './header-cart.component.html',
  styleUrls: ['./header-cart.component.scss']
})
export class HeaderCartComponent implements OnInit {

  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Input() isNavigating: boolean = false;

  cartValueChange: Subscription;
  disableSubscription: Subscription;
  cart: Array<any> = [];
  totalCart: number = 0;
  isMobile: boolean = GlobalVariable.IS_MOBILE;
  disbaleCart: boolean = false;

  constructor(
    private util: UtilityService,
    private router: Router,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    this.totalCart = this.settings.is_decimal_quantity_allowed == 1 ? this.util.decimalCartCount() : this.util.getTotalCountCart();

    this.cartValueChange = this.util.getCart
      .subscribe(cart => {
        if (cart) {
          this.cart = cart;
          this.totalCart = this.settings.is_decimal_quantity_allowed == 1 ? this.util.decimalCartCount() : this.util.getTotalCountCart();
        }
      });

    this.disableSubscription = this.util.diableCart.subscribe(data => {
      this.disbaleCart = !!data;
    });
  }

  onCart() {
    if (this.settings.isCustomFlow) {
      let isTrue = false;
      let cartType = this.util.getLocalData('cart_type', true);
      if (!!cartType && cartType !== this.settings.app_type) {
        isTrue = true;
      }
      this.router.navigate(['/cart']).then(() => {
        if (isTrue) {
          this.settings.app_type = cartType;
          this.util.setSettings(this.settings);
          this.themeService.setStyles();
        }
      });
    } else {
      this.router.navigate(['/cart']);
    }

  }

}
