import { ThemeService } from './../../../../services/theme/theme.service';
import { GlobalVariable } from './../../../../core/global';
import { UserService } from './../../../../services/user/user.service';
import { Router } from '@angular/router';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { Subscription } from 'rxjs';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input, OnChanges, SimpleChanges, SimpleChange, OnDestroy, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-function-list',
  templateUrl: './function-list.component.html',
  styleUrls: ['./function-list.component.scss']
})
export class FunctionListComponent implements OnInit, OnChanges, OnDestroy {

  @Input() showSearchbar: boolean = false;
  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Input() userData: any;
  @Input() loggedIn: boolean = false;
  @Input() openAuth: boolean = false;
  @Input('userWalletBalance')
  set userWalletBal(userWalletBalance) {
    if (userWalletBalance) {
      this.userWalletBalance = userWalletBalance;
    }
  }
  public userWalletBalance: number = 0;
  @Input() sidenav: number = 0;
  @Input() isNavigating: boolean = false;

  @Output() authType: EventEmitter<string> = new EventEmitter<string>();
  @Output() searchBar: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() triggerAuthModal: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() sideNavToggle: EventEmitter<number> = new EventEmitter<number>();

  cartValueChange: Subscription;

  cart: Array<any> = [];
  totalCart: number = 0;

  public showFeedback: boolean;

  constructor(
    private util: UtilityService,
    private themeService: ThemeService,
    private message: MessagingService,
    private router: Router,
    private user: UserService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.totalCart = this.util.getTotalCountCart();

    this.cartValueChange = this.util.getCart
      .subscribe(cart => {
        if (cart) {
          this.cart = cart;
          this.totalCart = this.util.getTotalCountCart();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    let showSearchbar: SimpleChange = changes.showSearchbar;
    if (!!showSearchbar && showSearchbar.currentValue) {
      this.showSearchbar = showSearchbar.currentValue;
    }
  }

  openAuthModal(type: string) {
    this.openAuth = true;
    this.triggerAuthModal.emit(true);
    this.authType.emit(type);
    this.sideNavToggle.emit(0);
  }

  signOutConfirmation() {
    this.sideNavToggle.emit(0);
    this.message.confirm(`${this.translate.instant('Sign Out')}`).then(data => {
      if (data.value) {
        this.user.userSignOut();
        this.message.toast('success', this.translate.instant('Sign Out Successfully'));
      }
    });
  }

  favourite() {
    if (this.settings.app_type !== 2) {
      this.router.navigate(['supplier/supplier-list'], { queryParams: { favourites: 1 } });
    } else {
      this.router.navigate(['/products', 'wishlist']);
    }
    this.sideNavToggle.emit(0);
  }

  changeSearchBar() {
    this.searchBar.emit(!this.showSearchbar);
  }

  onCart() {
    this.sideNavToggle.emit(0);
    let isTrue = false;
    let cartType = this.util.getLocalData('cart_type', true);
    if (this.settings.isCustomFlow) {
      if (!!cartType && cartType !== this.settings.app_type) {
        isTrue = true;
      }
    }
    this.router.navigate(['/cart']).then(() => {
      if (isTrue) {
        this.settings.app_type = cartType;
        this.util.setSettings(this.settings);
        this.themeService.setStyles();
      }
    });
  }

  ngOnDestroy() {
    if (!!this.cartValueChange) this.cartValueChange.unsubscribe();
  }

  surveyMonkey() {
    this.showFeedback = true;
  }
  onFeedbackClose(event) {
    this.showFeedback = event;
  }

}
