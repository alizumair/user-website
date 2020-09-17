import { Component, OnInit, Output, EventEmitter, Input, OnChanges, ViewChild, ElementRef, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { AppSettings } from '../../../../../shared/models/appSettings.model';
import { UtilityService } from '../../../../../services/utility/utility.service';
import { CartPriceModel, PromoModel } from '../../../../../shared/models/cart-price.model';
import { CartService } from '../../../../../services/cart/cart.service';
import { HttpService } from '../../../../../services/http/http.service';
import { UserService } from '../../../../../services/user/user.service';
import { MessagingService } from '../../../../../services/messaging/messaging.service';
import { ApiUrl } from '../../../../../../app/core/apiUrl';
import { StyleConstants } from '../../../../../core/theme/styleConstants.model';
import { GlobalVariable } from './../../../../../core/global';
import { QuestionsModel } from './../../../../../shared/models/questions.model';
import { TranslateService } from '@ngx-translate/core';
import { FirebaseAnalyticsService } from '../../../../../services/firebase-analytics/firebase-analytics.service';
declare const $;

@Component({
  selector: 'app-cart-price-detail',
  templateUrl: './cart-price-detail.component.html',
  styleUrls: ['./cart-price-detail.component.scss']
})
export class CartPriceDetailComponent implements OnInit, OnChanges {

  deliveryType: number = 0;
  urgentPrice: number = 0;
  cart: Array<any> = [];

  saveBtn: StyleConstants;
  promoCode: string = '';
  promoModel: any = {};
  currency: string = "";

  @ViewChild('closePromoCode', { static: false }) closePromoCode: ElementRef;
  @Input() delivery_charge: number = 0;
  @Input() is_dinin: number = 0;
  @Input() applyWalletDiscount: boolean = false;
  @Input() walletAmount: number = 0;
  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Input() loggedIn: boolean = false;
  @Input() selfPickup: any;
  @Input() activePlan: any;
  @Input() priceObj: CartPriceModel;
  @Input() questions: Array<QuestionsModel> = [];
  @Output() priceDetail: EventEmitter<CartPriceModel> = new EventEmitter<CartPriceModel>();

  //************ subscription ************/
  cartSubscription: Subscription;

  constructor(
    private translate: TranslateService,
    private util: UtilityService,
    private cartService: CartService,
    private http: HttpService,
    private user: UserService,
    private message: MessagingService,
    private fireBaseAnSvc: FirebaseAnalyticsService
  ) {
    this.style = new StyleVariables();
    this.saveBtn = new StyleConstants();
    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit(): void {

    this.cartSubscription = this.util.getCart.subscribe(cart => {
      if (cart) {
        this.cart = cart;
        this.getTotal();
      }
    });

    this.saveBtn.backgroundColor = this.style.primaryColor;
    this.saveBtn.borderColor = this.style.primaryColor;
    this.saveBtn.color = '#ffffff';

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.saveBtn.backgroundColor = this.style.primaryColor;
    this.saveBtn.borderColor = this.style.primaryColor;
    this.saveBtn.color = '#ffffff';

    if ((!!changes.delivery_charge && !isNaN(changes.delivery_charge.currentValue))) {
      this.delivery_charge = changes.delivery_charge.currentValue;
      this.getTotal();
    }
    if ((changes.applyWalletDiscount != undefined || changes.applyWalletDiscount != null)) {
      this.applyWalletDiscount = changes.applyWalletDiscount.currentValue;
      this.getTotal();
    }
    if ((!!changes.walletAmount && !isNaN(changes.walletAmount.currentValue))) {
      this.priceObj.walletAmount = changes.walletAmount.currentValue;

    }
  }

  getTotal() {
    const promo: PromoModel = new PromoModel(this.promoModel);
    promo.code = this.promoCode;
    this.priceObj = new CartPriceModel({ ...this.priceObj, promo, walletAmount: this.walletAmount });

    if (this.cart && this.cart.length) {
      let totalAdminHandling = 0;
      let maxSupplierHandling = 0;
      let maxDeliveryCharges = 0;
      this.priceObj.amount = 0;
      for (let i = 0; i < this.cart.length; i++) {
        const productAmount = this.cartService.calulateProductPrice(this.cart[i]);
        this.priceObj.amount += productAmount;

        if (maxDeliveryCharges < this.cart[i].delivery_charges) {
          maxDeliveryCharges = this.cart[i].delivery_charges;
        }

        if (this.cart[i].handling_admin && this.settings.disable_tax == 0) {
          totalAdminHandling += (productAmount * this.cart[i].handling_admin) / 100;
        }

        if (maxSupplierHandling < this.cart[i].handling_supplier) {
          maxSupplierHandling = this.cart[i].handling_supplier;
        }
      }

      this.calculateQuestionPrice();
      if (this.priceObj.questionPrice && this.settings.disable_tax == 0) {   // calculate taxes on question price (Addons Charges)
        totalAdminHandling += (this.priceObj.questionPrice * this.cart[0].handling_admin) / 100;
      }

      // if (this.settings.delivery_charge_type == 1) {
      //   this.delivery_charge = this.cart[0].radius_price;
      //   // this.addressDetail.address['delivery_charge'] = this.delivery_charge;
      // }

      this.priceObj.deliveryCharges = this.settings.app_type == 1 || (this.settings.app_type == 2 && this.settings.ecom_agent_module == 1) ? this.delivery_charge : (this.settings.app_type == 8 ? 0 : maxDeliveryCharges);
      this.priceObj.handlingAdmin = totalAdminHandling;
      this.priceObj.handlingSupplier = maxSupplierHandling;
      this.priceObj.handingCharges = totalAdminHandling;
      
      
      // if (this.activePlan && this.activePlan.benefits && this.activePlan.benefits.length) {
      //   if (!!this.activePlan.benefits.find((benefit) => benefit.benefit_unique_id == 'FD_1')) {
      //     this.priceObj.deliveryCharges = 0;
      //   }
      // }
      if (this.activePlan) {
        if (this.priceObj.amount > this.activePlan.min_order_amount) {
          this.priceObj.deliveryCharges = 0;
        }
      }
    }

    if (!!this.promoModel && !!this.promoModel.id) {
      if (this.priceObj.amount < this.promoModel['minOrder']) {
        if (this.cart && this.cart.length)
          this.message.toast('info', `${this.translate.instant('Your Cart Total Must Be Greater Than')} ${this.currency}${this.promoModel.minOrder}`);
        this.promoModel = null;
        this.applyDiscount();
      } else {
        this.calDiscountAmount();
      }
    } else {
      this.applyDiscount();
    }
  }

  private calDiscountAmount(): void {
    let cart_total: number = 0;
    let discount_amount: number = 0;
    this.cart.forEach(product => {
      if (this.promoModel['categoryIds'].length) {
        this.promoModel['categoryIds'].forEach(element => {
          if (element == product.categoryId) {
            cart_total += this.cartService.calulateProductPrice(product);
          }
        });
      } else if (this.promoModel['supplierIds'].length) {
        this.promoModel['supplierIds'].forEach(element => {
          if (element == product.supplier_id) {
            cart_total += this.cartService.calulateProductPrice(product);
          }
        });
      }
    });
    if (cart_total > 0) {
      if(this.promoModel.discountType) {
        discount_amount = cart_total * (this.promoModel.discountPrice / 100);
      } else {
        discount_amount = this.promoModel.discountPrice >= cart_total ? cart_total : this.promoModel.discountPrice;
      }
    }
    this.priceObj.discount =  discount_amount > 0 ? discount_amount : 0;
    this.applyDiscount();
  }

  serviceChargeCalculation() {
    if (this.settings.supplier_service_fee == 1 && this.priceObj.supplier_service_charge) {
      this.priceObj.serviceCharge = (this.priceObj.supplier_service_charge / 100) * this.priceObj.amount;
    }
  }

  private applyDiscount(): void {
    this.serviceChargeCalculation();
    let subtotal = 0
    if (this.applyWalletDiscount && this.settings.payment_through_wallet_discount) {
      this.priceObj.walletDiscountAmount = (this.priceObj.amount / 100) * this.settings.payment_through_wallet_discount;
      if (this.priceObj.walletAmount >= this.priceObj.walletDiscountAmount) {
        subtotal = this.priceObj.amount - this.priceObj.walletDiscountAmount;
      } else {
        subtotal = this.priceObj.amount;
        // this.message.toast('info', `${this.translate.instant('Your Wallet Total Must Be Greater Than')} ${this.currency}${this.promoModel.minOrder}`);
      }
    } else {
      this.priceObj.walletAmount = 0;
      subtotal = this.priceObj.amount >= this.priceObj.discount ? this.priceObj.amount - this.priceObj.discount : 0;
    }
    this.priceObj.netTotal = subtotal + this.priceObj.questionPrice + this.priceObj.deliveryCharges + this.priceObj.handingCharges + this.priceObj.agent_tip + this.priceObj.serviceCharge + this.priceObj.slot_price;

    //To Display Calculations
    this.priceObj.displayNetTotal = this.priceObj.netTotal;
    if (!!this.priceObj.productLoyaltyDiscountAmount) this.priceObj.displayNetTotal -= this.priceObj.productLoyaltyDiscountAmount;
    if (this.priceObj.displayNetTotal >= this.priceObj.referral_amount) {
      this.priceObj.displayNetTotal -= this.priceObj.referral_amount
    }
    if (this.priceObj.appliedLoyaltyAmount) {
      if (this.priceObj.displayNetTotal >= this.priceObj.totalLoyaltyAmount) {
        this.priceObj.displayNetTotal -= this.priceObj.appliedLoyaltyAmount
      } else {
        this.priceObj.displayNetTotal = 0;
      }
    }
    if (this.settings.is_currency_exchange_rate == 1 && this.priceObj.currency_exchange_rate) {
      this.priceObj.displayNetTotal = this.priceObj.displayNetTotal * this.priceObj.currency_exchange_rate;
    }
    this.priceDetail.emit(this.priceObj);
  }

  restrictSpace($event) {
    return $event.keyCode == 32 ? false : true;
  }

  submitPromoCode() {
    if (!this.loggedIn) {
      this.message.alert('warning', this.translate.instant('Please Login To Continue'));
      return;
    }
    if (this.promoCode.trim()) {

      let obj = {
        totalBill: this.priceObj.amount,
        supplierId: [],
        promoCode: this.promoCode.toUpperCase(),
        accessToken: this.user.getUserToken,
        categoryId: [],
        langId: this.util.handler.languageId
      }

      this.http.postData(ApiUrl.checkPromo, obj, false)
        .subscribe(response => {
          if (!!response && response.data) {
            this.fireBaseAnSvc.firebaseAnalyticsEvents('promo_code_used', 'promo_code_used');

            this.promoModel = response.data;
            this.priceObj.promo = new PromoModel(response.data);
            this.priceObj.promo.code = this.promoCode;
            if (this.priceObj.amount < response.data['minOrder']) {
              this.message.toast('info', `${this.translate.instant('Your Cart Total Must Be Greater Than')} ${this.currency}${this.promoModel.minOrder}`);
              this.clearPromo();
              return;
            }
            this.calDiscountAmount();
            if (this.priceObj.discount) {
              this.applyDiscount();
              this.message.toast('success', this.translate.instant('Promo Code Applied Successfully'));
            } else {
              this.clearPromo();
              this.message.toast('warning', this.translate.instant('Promo Code Not Applicable For This Cart'));
            }

            this.closePromoCode.nativeElement.className = 'promo-form collapse';
          }
        });
    } else {
      this.message.toast('error', this.translate.instant('Please Enter Promo Code'));
    }
  }

  clearPromo() {
    this.promoModel = null;
    this.priceObj.promo = new PromoModel();
    this.priceObj.promo.code = '';
  }

  onGiftCardSelect(gift: any) {
    this.clearPromo();
    this.priceObj.gift = gift;
    let cartTotal: number = 0;
    let discountAmount = 0
    this.cart.forEach(product => {
      cartTotal += this.cartService.calulateProductPrice(product);
    })

    if (cartTotal > 0) {
      discountAmount = this.priceObj.gift.price_type ? cartTotal * (this.priceObj.gift.percentage_value / 100) : this.priceObj.gift.price;
    }
    this.priceObj.discount = discountAmount > 0 ? discountAmount : 0;
    this.applyDiscount();
  }

  onGiftCardRemove() {
    this.priceObj.gift = {};
    this.priceObj.discount = 0;
    this.applyDiscount();
  }

  calculateQuestionPrice(): void {
    if (this.questions.length && this.settings.app_type == 8) {
      this.questions.forEach(question => {
        question.optionsList.forEach(option => {
          if (option.valueChargeType == 1) {
            this.priceObj.questionPrice += option.flatValue;
          } else {
            let percentageValue = (this.priceObj.amount * option.percentageValue) / 100;
            this.priceObj.questionPrice += percentageValue;
          }
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.cartSubscription.unsubscribe();
  }

}
