import { LocalizationPipe } from './../../../../shared/pipes/localization.pipe';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { ApiUrl } from './../../../../core/apiUrl';
import { CartModel, UpdateCartModel, CartProductModel } from './../../../../shared/models/cart.model';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { UserService } from './../../../../services/user/user.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { HttpService } from './../../../../services/http/http.service';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { CartService } from './../../../../services/cart/cart.service';
import { GlobalVariable } from './../../../../core/global';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-rental-booking',
  templateUrl: './rental-booking.component.html',
  styleUrls: ['./rental-booking.component.scss']
})
export class RentalBookingComponent implements OnInit, OnDestroy {

  private getDataSubscribe: Subscription;
  styleSubscriptuion: Subscription;
  settingSubscription: Subscription;
  cartSubscription: Subscription;
  userSubscription: Subscription;
  routeSubscription: Subscription;

  style: StyleVariables;
  settings: AppSettings;

  cart: Array<any> = [];
  full_cart: any[] = [];

  priceObj: any = {
    amount: 0,
    delivery_charges: 0,
    handingCharges: 0,
    subTotal: 0,
    netTotal: 0,
    handlingAdmin: 0,
    handlingSupplier: 0,
    discount: 0
  };
  cartModel: any = {};
  updateCartModel: any = {};

  selectedAreaIndex: number = 0;
  totalItems: number = 0;
  deliveryType: number = 0;
  timeInterval: number = 0;

  currency: string = '';
  orderId: any = '';
  paymentType: string = '0';
  promoCode: string = '';
  product_id: string = '';

  is_agent: boolean = false;
  loggedIn: boolean = false;
  is_service: boolean = false;

  cart_data: any = {};

  constructor(
    private http: HttpService,
    private util: UtilityService,
    public user: UserService,
    private cartService: CartService,
    private message: MessagingService,
    private router: Router,
    private translate: TranslateService,
    private localization: LocalizationPipe) {

    this.style = new StyleVariables();
    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit() {

    this.styleSubscriptuion = this.util.getStyles
      .subscribe(style => {
        this.style = style;
      });

    this.cartModel = new CartModel();
    this.cartSubscription = this.util.getCart
      .subscribe(cart => {
        if (cart) {
          this.cart = cart;
          this.cart_data = cart[0];
          this.totalItems = this.util.getTotalCountCart();
          this.getTotal();
        }
      });

    this.userSubscription = this.user.currentUser
      .subscribe(user => {
        if (!!user && user['access_token']) {
          this.loggedIn = true;
        } else {
          this.loggedIn = false;
        }
      });
    this.makeSubscribe();
  }

  makeSubscribe() {
    this.getDataSubscribe = this.util.callGetData.
      subscribe((data) => {
        if (data) {
          this.settingSubscription = this.util.getSettings
            .subscribe((settings: AppSettings) => {
              this.settings = settings;
              this.timeInterval = settings['interval'];
            });
        }
      });
  }

  getTotal() {
    if (this.cart && this.cart.length) {
      let maxAdminHandling = 0;
      let maxSupplierHandling = 0;
      this.priceObj.amount = 0;
      for (let i = 0; i < this.cart.length; i++) {
        this.priceObj.amount += (this.cartService.calulateProductPrice(this.cart[i]));

        this.priceObj.delivery_charges = 0;
        if (this.priceObj.delivery_charges < this.cart[i].delivery_charges) {
          this.priceObj.delivery_charges = this.cart[i].delivery_charges;
        }
        if (maxAdminHandling < this.cart[i].handling_admin) {
          maxAdminHandling = this.cart[i].handling_admin;
        }
        if (maxSupplierHandling < this.cart[i].handling_supplier) {
          maxSupplierHandling = this.cart[i].handling_supplier;
        }
      }
      this.priceObj.handlingAdmin = maxAdminHandling;
      this.priceObj.handlingSupplier = maxSupplierHandling;
      this.priceObj.handingCharges = maxAdminHandling + maxSupplierHandling;
    }
    this.priceObj.subTotal = this.priceObj.amount + this.priceObj.delivery_charges + this.priceObj.handingCharges;
    this.priceObj.netTotal = this.priceObj.subTotal - this.priceObj.discount;
  }

  placeOrder() {
    this.cartModel = new CartModel();
    this.updateCartModel = new UpdateCartModel();
    if (this.loggedIn) {
      this.makeModelData();
    } else {
      this.message.alert('info', `${this.translate.instant('Please Login First')}!`);
    }
  }

  makeModelData() {
    this.cartModel.accessToken = this.user.getUserToken;
    this.cartModel.latitude = this.util.handler.latitude;
    this.cartModel.longitude = this.util.handler.longitude;
    this.cartModel.supplierBranchId = this.cart[0].supplier_branch_id;
    this.cartModel.supplier_id = this.cart[0].supplier_id;
    this.cartModel.adds_on = [];
    for (let i = 0; i < this.cart.length; i++) {
      let model = new CartProductModel();
      for (let data in model) {
        model[data] = this.cart[i][data];
      }
      model['category_id'] = this.cart[i].categoryId;
      model['agent_type'] = this.cart[i].agent_list && this.cart[i].is_agent ? 1 : 0;
      model.quantity = this.cart[i].selectedQuantity;
      this.cartModel.productList.push(model);
    }

    // update cart model data
    this.updateCartModel.accessToken = this.user.getUserToken;
    this.updateCartModel.currencyId = this.util.handler.currencyId;
    this.updateCartModel.languageId = this.util.handler.languageId;
    this.updateCartModel.handlingSupplier = '0';
    this.updateCartModel.handlingAdmin = '0';
    this.updateCartModel.netAmount = this.priceObj.amount + this.priceObj.handlingSupplier + this.priceObj.handlingAdmin;
    this.updateCartModel.urgentPrice = '0';
    this.updateCartModel.deliveryDate = moment(this.cart[0].booking_to_date).format('YYYY-MM-DD');
    this.updateCartModel.deliveryTime = moment(this.cart[0].booking_to_date).format('HH:mm');
    this.updateCartModel.day = moment(this.cart[0].booking_to_date).day();
    this.updateCartModel.deliveryCharges = this.priceObj.delivery_charges;
    this.updateCartModel.deliveryType = this.deliveryType.toString();
    this.updateCartModel.minOrderDeliveryCrossed = '0';
    this.updateCartModel.deliveryId = '0';

    this.addToCart();
  }

  addToCart() {
    this.http.postData(ApiUrl.addToCart, this.cartModel, false)
      .subscribe(response => {
        if (!!response && response.data) {
          this.updateCartModel.cartId = response.data.cartId;
          this.updateCart();
        }
      });
  }

  updateCart() {
    this.http.postData(ApiUrl.updateCartInfo, this.updateCartModel, false)
      .subscribe(response => {
        if (!!response && response.data) {
          this.generateOrder();
        }
      });
  }

  generateOrder() {
    let offset = moment().format('Z');
    let obj = {
      cartId: this.updateCartModel.cartId,
      languageId: this.util.handler.languageId,
      isPackage: '0',
      paymentType: this.paymentType,
      accessToken: this.user.getUserToken,
      offset: offset,
      self_pickup: 0,
      type: this.settings.app_type
    }
    if (this.promoCode) {
      obj['promoCode'] = this.promoCode;
      obj['discountAmount'] = this.priceObj.discountAmount;
    }
    let date = moment();
    obj['date_time'] = date.format('YYYY-MM-DD HH:mm:ss');
    obj['duration'] = 0;

    obj['from_latitude'] = this.cart[0].from_latitude;
    obj['to_latitude'] = this.cart[0].to_latitude;
    obj['from_longitude'] = this.cart[0].from_longitude;
    obj['to_longitude'] = this.cart[0].to_longitude;
    obj['booking_from_date'] = this.cart[0].booking_from_date;
    obj['booking_to_date'] = this.cart[0].booking_to_date;
    obj['from_address'] = this.cart[0].from_address;
    obj['to_address'] = this.cart[0].to_address;

    this.http.postData(ApiUrl.generateRentalBooking, obj, false)
      .subscribe(response => {
        if (!!response && response.data) {
          this.orderId = response.data;
          this.toOrderDetail();
        }
      });
  }

  toOrderDetail() {
    this.router.navigate(['/orders/order-detail'], { queryParams: { orderId: this.orderId } });
    this.util.setCart([]);
    setTimeout(() => {
      this.message.alert('success', `${this.localization.transform('order')} ${this.translate.instant('Placed Successfully')}!`);
    }, 500);
  }

  ngOnDestroy() {
    if (!!this.getDataSubscribe) this.getDataSubscribe.unsubscribe();
    if (!!this.settingSubscription) this.settingSubscription.unsubscribe();
    if (!!this.styleSubscriptuion) this.styleSubscriptuion.unsubscribe();
    if (!!this.cartSubscription) this.cartSubscription.unsubscribe();
    if (!!this.userSubscription) this.userSubscription.unsubscribe();
  }

}
