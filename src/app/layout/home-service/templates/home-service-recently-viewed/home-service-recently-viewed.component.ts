import { UserService } from './../../../../services/user/user.service';
import { Subscription } from 'rxjs';
import { CartService } from './../../../../services/cart/cart.service';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home-service-recently-viewed',
  templateUrl: './home-service-recently-viewed.component.html',
  styleUrls: ['./home-service-recently-viewed.component.scss']
})
export class HomeServiceRecentlyViewedComponent implements OnInit, OnDestroy {

  @Input() settings: AppSettings;
  @Input() style: StyleVariables;
  @Input() isLoading: boolean;
  @Input() recentlyViewed: Array<any>;

  userSubscription: Subscription;
  loggedIn: boolean = false;


  constructor(
    private cartService: CartService,
    private user: UserService) { }

  ngOnInit() {
    this.userSubscription = this.user.currentUser
    .subscribe(user => {
      if (!!user && user['access_token']) {
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
      }
    });
  }

  addProduct(product) {
    this.cartService.addToCart(product, this.recentlyViewed);
  }

  removeProduct(product) {
    this.cartService.removeFromCart(product)
  }

  ngOnDestroy() {
    if(!!this.userSubscription) this.userSubscription.unsubscribe();
  }
}
