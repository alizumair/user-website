import { SeoService } from './../../../../services/seo/seo.service';
import { DeliveryAddressDetailComponent } from '../components/delivery-address-detail/delivery-address-detail.component';
import { ImageUpload } from './../../../../shared/models/imageUpload.model';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { ApiUrl } from './../../../../core/apiUrl';
import { CartModel, UpdateCartModel, CartProductModel } from './../../../../shared/models/cart.model';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { UserService } from './../../../../services/user/user.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { HttpService } from './../../../../services/http/http.service';
import { StyleConstants } from './../../../../core/theme/styleConstants.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { CartService } from './../../../../services/cart/cart.service';
import { CartPriceModel } from '../../../../shared/models/cart-price.model';
import { LocationService } from './../../../../services/location/location.service';
import _ from 'lodash';
import { GlobalVariable } from './../../../../core/global';
import { DialogService } from 'primeng/dynamicdialog';
import { LocalizationPipe } from '../../../../shared/pipes/localization.pipe';
import { CartPriceDetailComponent } from '../components/cart-price-detail/cart-price-detail.component';
import { QuestionsModel } from './../../../../shared/models/questions.model';
import { TranslateService } from '@ngx-translate/core';
import { FirebaseAnalyticsService } from '../../../../services/firebase-analytics/firebase-analytics.service';
import { SegmentAnalyticsService } from '../../../../services/firebase-analytics/segment-analytics.service';

// declare const $;

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  providers: [DatePipe],

})
export class CartComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(CartPriceDetailComponent, { static: false }) cartPriceClass: any;
  @ViewChild(DeliveryAddressDetailComponent, { static: false }) deliveryAddress: DeliveryAddressDetailComponent;

  styleSubscription: Subscription;
  settingSubscription: Subscription;
  cartSubscription: Subscription;
  userSubscription: Subscription;
  routeSubscription: Subscription;
  themeSubscription: Subscription;

  style: StyleVariables;
  saveBtn: StyleConstants;
  settings: AppSettings;

  cart: Array<any> = [];
  full_cart: any[] = [];

  currentUser: any = {}

  priceObj: CartPriceModel = new CartPriceModel();
  addressDetail: any = {};
  cartModel: any = {};
  updateCartModel: any = {};
  cartDateTimeData: any = { is_open: false, data: {} };

  paymentOrderModel: any = {};

  walletAmount: number = 0;
  totalItems: number = 0;
  deliveryType: number = 0;
  urgentPrice: number = 0;
  self_pickup = 0;
  book_dining = 0;
  delivery_opt = 1;
  showDeliveryOption: boolean = false;

  showScheduleTime: boolean = false;
  scheduleOrderSlot: any = null;
  schedulingData: any = {};

  currency: string = '';
  orderId: any = '';
  paymentType: string = '0';
  product_id: string = '';

  public min: Date = new Date();
  scheduleMaxDate: Date;
  selectedScheduleDate: Date[];
  pickUp_dateTime: any;

  is_agent: boolean = false;
  loggedIn: boolean = false;
  is_service: boolean = false;

  delivery_charge: number = 0;
  isDarkTheme: boolean = false;

  isPayOnline: boolean = false;

  isLoading: boolean = false;
  isCartCheck: boolean = false;

  agent_tips: Array<number> = [];
  questions: Array<QuestionsModel> = [];

  transaction: any = {};

  prescription_images: ImageUpload;

  instructions: string = '';
  parking_instruction: string = '';
  area_to_focus: string = '';

  show_prescription: boolean = false;
  show_instructions: boolean = false;
  displayAddModal = new BehaviorSubject(false);

  payment_after_confirmation: number = 0;

  geofencedGateways: Array<string> = [];

  region_delivery_charge: number = 0;

  hidePaymentModeSelection: boolean = false;

  isBookNow: boolean = false;

  distance_value: number = 0;
  applyWalletDiscount: boolean = false;

  activePlan: any;
  place_order_directly = 0;
  serviceDateTime: any = '';

  is_supplier_scheduling: boolean = false;

  public is_after_table_booking: boolean;
  public table_booking_details: any;
  public manualTableNo: number;
  public manualTable_id: number;

  public have_coin_change: string = "0";

  constructor(
    private http: HttpService,
    private util: UtilityService,
    public user: UserService,
    private cartService: CartService,
    private message: MessagingService,
    private router: Router,
    private route: ActivatedRoute,
    private location: LocationService,
    public dialogService: DialogService,
    private localization: LocalizationPipe,
    private translate: TranslateService,
    private seo: SeoService,
    private firebaseAnalyticsSvc: FirebaseAnalyticsService,
    private segmentAnalyticsSvc: SegmentAnalyticsService
  ) {
    this.style = new StyleVariables();
    this.saveBtn = new StyleConstants();
    this.cartModel = new CartModel();
    this.currency = GlobalVariable.CURRENCY;
    const selfPickup: any = this.cartService.getOrderPickType();
    if (selfPickup == 2) {
      if (this.util.handler.selfPickup == 1) {
        this.self_pickup = 1;
      } else {
        this.self_pickup = 0;
        this.showDeliveryOption = true;
      }
    } else {
      this.showDeliveryOption = true;
      this.self_pickup = selfPickup || 0;
    }
    switch (selfPickup) {
      case "0":
        this.onDelivery();
        break;
      case "1":
        this.onSelfPickup();
        break;
      case "3":
        this.onDining();
        break;
    }
  }

  ngOnInit() {
    this.seo.updateTitle(`Cart | ${GlobalVariable.SITE_NAME}`);

    if (JSON.parse(localStorage.getItem('table_booking_details'))) {
      this.table_booking_details = JSON.parse(localStorage.getItem('table_booking_details'));
      this.is_after_table_booking = true;
      this.onDining();
    }

    this.styleSubscription = this.util.getStyles
      .subscribe(style => {
        this.style = style;
        this.saveBtn.backgroundColor = style.primaryColor;
        this.saveBtn.borderColor = style.primaryColor;
        this.saveBtn.color = '#ffffff';
      });

    this.themeSubscription = this.util.getDarkTheme.subscribe((darkTheme) => {
      this.isDarkTheme = darkTheme;
    });

    this.settingSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        this.settings = settings;
        if (settings) {
          if (settings.app_type == 7) {
            this.self_pickup = 1;
          } else if (settings.app_type == 8) {    // || (settings.is_pickup_order == 2 && settings.is_table_booking == '0')
            this.self_pickup = 0;
            this.showDeliveryOption = false;
          }
        }
      });

    this.userSubscription = this.user.currentUser
      .subscribe(user => {
        if (!!user && user['access_token']) {
          this.paymentOrderModel.user = user;
          this.loggedIn = true;
        } else {
          this.loggedIn = false;
        }
      });

    this.cartInit();
  }

  ngAfterViewInit() {
    this.getLocalData();
  }

  cartInit() {
    this.routeSubscription = this.route.queryParams
      .subscribe(params => {
        if (params['place_order'] == 1) {
          this.isLoading = true;
          this.place_order_directly = parseInt(params['place_order']);
        }

        this.cartSubscription = this.util.getCart
          .subscribe(cart => {
            if (cart) {

              if (params && params['p_id']) {
                this.product_id = params['p_id'];
                let product = (cart.slice()).find(product => {
                  return params['p_id'] == product['productId'];
                });
                if (!!product) {
                  this.cart = [product];
                  this.totalItems = product['selectedQuantity'];
                }
              } else {
                this.cart = cart;
                this.totalItems = this.util.getTotalCountCart();
              }

              this.is_agent = false;
              this.is_service = false;
              this.show_prescription = false;
              this.show_instructions = false;
              this.cart.forEach(product => {
                if (product['is_agent'] == 1) this.is_agent = true;
                if (product['is_product'] == 0) this.is_service = true;
                if (product['cart_image_upload'] == 1) this.show_prescription = true;
                if (product['order_instructions'] == 1) this.show_instructions = true;
              });

              if (this.cart.length) {
                this.payment_after_confirmation = this.cart[0].payment_after_confirmation;
              }
            }
          });


        if (this.cart.length) {
          this.checkCartUpdate();
        }
      });
  }

  checkCartUpdate() {
    const product_ids = this.cart.map((product) => product['productId'] || product['product_id']);

    const payload = {
      product_ids: product_ids,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    }

    if (this.addressDetail && this.addressDetail.address) {
      payload.latitude = this.addressDetail.address.latitude
      payload.longitude = this.addressDetail.address.longitude
    }

    this.http.postData(ApiUrl.checkProductList, payload)
      .subscribe(response => {
        this.isCartCheck = true;
        if (!!response && response.data) {
          if (response.data.userSubscriptionData) {
            this.activePlan = response.data.userSubscriptionData;
          }
          if (this.settings.is_loyality_enable == 1) {
            this.priceObj.productLoyaltyDiscountAmount = response.data.loyalityLevelDiscountAmount;
            this.priceObj.totalLoyaltyAmount = response.data.loyalitPointDiscountAmount;
          }
          if (response.data.payment_gateways.length) {
            this.geofencedGateways = response.data.payment_gateways;
            let cod_index = this.geofencedGateways.findIndex(el => el === 'cod');
            if (cod_index > -1) {
              this.geofencedGateways.splice(cod_index, 1);
              if (!this.geofencedGateways.length) {
                this.hidePaymentModeSelection = true;
                this.setPaymentType('0');
              }
            } else {
              this.setPaymentType('1');
              this.hidePaymentModeSelection = true;
            }
          }
          this.region_delivery_charge = response.data.region_delivery_charge ? response.data.region_delivery_charge : 0;

          this.agent_tips = response.data.tips || [];

          let products = response.data.result;
          if (!products || !products.length) { return; };

          this.distance_value = products[0].distance_value;
          this.is_supplier_scheduling = products.some(product => {
            return product['is_scheduled'] == 1;
          });

          if (this.settings.is_currency_exchange_rate == 1) {
            this.priceObj.currency_exchange_rate = (products[0]).currency_exchange_rate;
            this.priceObj.local_currency = (products[0]).local_currency;
          }

          this.cart.forEach(cart_item => {
            products.forEach(element => {
              if (cart_item['productId'] == element['product_id']) {
                if (element.quantity > 0 && element.purchased_quantity < element.quantity) {
                  cart_item['price_type'] = element['price_type'];
                  cart_item['quantity'] = element['quantity'];
                  cart_item['purchased_quantity'] = element['purchased_quantity'];
                  if (element['quantity'] < cart_item['selectedQuantity']) {
                    cart_item['selectedQuantity'] = 1;
                  }
                  if (this.settings.is_loyality_enable == 1) {
                    cart_item['perProductLoyalityDiscount'] = element['perProductLoyalityDiscount'];
                  }
                  cart_item['latitude'] = element['latitude'];
                  cart_item['longitude'] = element['longitude'];
                  cart_item['handling_supplier'] = element['handling_supplier'];
                  cart_item['handling_admin'] = element['handling_admin'];
                  cart_item['delivery_charges'] = element['delivery_charges'];
                  cart_item['radius_price'] = element['radius_price'];
                  cart_item['is_product'] = element['is_product']
                  if (cart_item['discount'] == element['discount']) {
                    cart_item['isOutOfStock'] = false;

                    if (cart_item['price_type']) {
                      cart_item['hourly_price'] = element['hourly_price'];
                      this.cartService.calculateProductHourlyPrice(cart_item);
                    } else {
                      cart_item['fixed_price'] = parseFloat(element['fixed_price']);
                      cart_item['display_price'] = parseFloat(element['display_price']);
                    }
                    if (cart_item['customization'] && cart_item['customization'].length) {
                      let addons = this.makeAddOnModel(cart_item['customization']);
                      element.adds_on.forEach(addon => {
                        (addon.value).forEach(type => {
                          addons.forEach(cart_type => {
                            if (cart_type['type_id'] == type['type_id']) {
                              cart_type['price'] = type['price'];
                              cart_type['type_name'] = type['type_name'];
                            }
                          })
                        });
                      });
                    }
                  }
                  cart_item['isOutOfStock'] = false;
                } else {
                  cart_item['isOutOfStock'] = true;
                  // this.cart.splice(this.cart.indexOf(cart_item), 1);
                }
                this.util.setCart(this.cart);
              }
            });
          });
        }
      });
  }

  getLocalData() {
    if (this.util.getLocalData('ques_data', true)) {
      this.questions = this.util.getLocalData('ques_data', true);
    }
    this.pickUp_dateTime = this.util.getLocalData('pickUp_DT', true);
  }

  setPrice(priceDetail: CartPriceModel) {
    // setTimeout(() => { this.priceObj = priceDetail; }, 100);
    this.priceObj = priceDetail;
  }

  setAddress(addressObj: any) {
    if (addressObj) {
      this.addressDetail = addressObj;
      this.walletAmount = this.addressDetail['wallet_amount'];
      if (this.cart.length && addressObj.address && addressObj.address.latitude && addressObj.address.longitude && (this.settings.app_type == 1 || (this.settings.app_type == 2 && this.settings.ecom_agent_module == 1)) && this.self_pickup != 1) {
        if (this.settings.delivery_charge_type == 1) {
          this.delivery_charge = this.cart[0].radius_price;
          this.addressDetail.address['delivery_charge'] = this.delivery_charge;
        } else {
          let origin = {
            lat: this.cart[0].latitude,
            lng: this.cart[0].longitude
          }
          let destination = {
            lat: addressObj.address.latitude,
            lng: addressObj.address.longitude,
          }

          if (this.region_delivery_charge) {
            if (this.settings.is_enabled_multiple_base_delivery_charges == 1) {
              this.delivery_charge = this.region_delivery_charge;
            } else {
              this.delivery_charge = this.region_delivery_charge + this.addressDetail['base_delivery_charges'];
            }
            this.addressDetail.address['delivery_charge'] = this.delivery_charge;
          } else {
            this.location.getDistance(origin, destination).subscribe(distanceObj => {
              if (distanceObj) {
                const unit_value = this.settings.delivery_distance_unit == 1 ? 1609.34 : 1000;
                let distance = distanceObj.value / unit_value;
                if (this.settings.is_enabled_multiple_base_delivery_charges == 1 && this.addressDetail['base_delivery_charges_array'] && this.addressDetail['base_delivery_charges_array'].length) {
                  let base_charges = this.addressDetail['base_delivery_charges_array'].filter(el => distance < el.distance_value);
                  let max_base = null;
                  if (base_charges.length) {
                    max_base = base_charges.reduce(function (prev, current) {
                      return (prev.distance_value < current.distance_value) ? prev : current
                    });
                    if (!!max_base) {
                      this.delivery_charge = max_base.base_delivery_charges;
                    } else {
                      this.delivery_charge = 0;
                    }
                  } else {
                    this.delivery_charge = ((distance - this.addressDetail['base_delivery_charges_array'][this.addressDetail['base_delivery_charges_array'].length - 1].distance_value) * this.cart[0].radius_price) + this.addressDetail['base_delivery_charges_array'][this.addressDetail['base_delivery_charges_array'].length - 1].base_delivery_charges;
                  }
                } else {
                  if (distance > this.distance_value) {
                    this.delivery_charge = ((distance - this.distance_value) * this.cart[0].radius_price) + this.addressDetail['base_delivery_charges'];
                  } else {
                    this.delivery_charge = this.addressDetail['base_delivery_charges'];
                  }
                }
              } else {
                this.delivery_charge = 0;
              }
              this.addressDetail.address['delivery_charge'] = this.delivery_charge;
            });
          }
        }
        this.paymentOrderModel.address = this.addressDetail.address;
      }

      if (this.place_order_directly == 1) {
        (async () => {
          await this.delay(2000);
          this.placeOrder();
        })();
      }
    }
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  onChangeInRequest(event) {
    if (event) {
      this.have_coin_change = "1";
    }
    else {
      this.have_coin_change = "0";
    }
  }

  setPaymentType(mode: string) {
    this.paymentType = mode;
    if(this.agent_tips.length) {
      this.agentTipChange({ tip: 0, isCustom: false });
    }
    if (this.paymentType == '0') {
      this.isPayOnline = false;
      this.applyWalletDiscount = false;
    } else if (this.paymentType == '4') {
      // if (this.priceObj.netTotal > this.addressDetail['wallet_amount']) {
      //   this.message.alert('warning', `${this.translate.instant('Wallet Amount Must Be Greater Than')} ${this.priceObj.netTotal}`);
      // } else {
      this.applyWalletDiscount = true;
      // }
    } else {
      this.applyWalletDiscount = false;
    }
  }

  onSelfPickup() {
    this.self_pickup = 1;
    this.delivery_opt = 0;
    this.delivery_charge = 0;
    this.book_dining = 0;
  }
  onDining() {
    this.self_pickup = 0;
    this.delivery_charge = 0;
    this.delivery_opt = 0;
    this.book_dining = 1;
  }

  onDelivery() {
    this.self_pickup = 0;
    this.delivery_opt = 1;
    this.book_dining = 0;
    if (!_.isEmpty(this.addressDetail)) {
      this.delivery_charge = this.delivery_charge || this.addressDetail.address['delivery_charge'] || this.priceObj.deliveryCharges || 0;
    }
  }

  placeOrder() {
    this.cartModel = new CartModel();
    this.updateCartModel = new UpdateCartModel();

    let cart_id = this.util.getLocalData('cart_id', true);
    if (cart_id) {
      let check = false;
      for (let el of this.cart) {
        if (!cart_id.service_ids.includes(el.id)) {
          check = true;
          break;
        }
      };
      if (check) {
        this.makeModelData();
      } else {
        this.router.navigate(['/', 'cart', 'agent'], {
          queryParams: {
            service_ids: cart_id.service_ids.join(),
            cart_id: cart_id.id,
            isPkg: '0',
            payType: '0',
            promo: (this.priceObj.promo && this.priceObj.promo.code) ? this.priceObj.promo.code : null,
            discount: this.priceObj.discount,
            user_gift_ids: this.priceObj.gift && this.priceObj.gift.id ? [this.priceObj.gift.id] : null
          }
        });
      }
    } else {
      this.makeModelData();
    }
  }

  makeAddOnModel(customization): Array<any> {
    let addOns = [];

    if (!customization || !customization.length) {
      return addOns;
    }

    customization.forEach((item, index) => {
      let quantity = item.quantity;
      item.data.forEach(d => {
        addOns.push(...d.value.map(v => {
          v.quantity = quantity;
          v.serial_number = index + 1;
          return v;
        })
        );
      })
    })

    return addOns;
  }

  makeModelData() {
    this.cartModel.accessToken = this.user.getUserToken;
    this.cartModel.supplierBranchId = this.cart[0].supplier_branch_id;
    this.cartModel.supplier_id = this.cart[0].supplier_id;

    this.cartModel.order_time = moment().format('HH:mm:ss');
    let day = [6, 0, 1, 2, 3, 4, 5];
    this.cartModel.order_day = day[(new Date()).getDay()];

    this.cartModel.adds_on = [];
    this.cartModel.variants = [];
    for (let i = 0; i < this.cart.length; i++) {
      let model = new CartProductModel(this.cart[i]);

      if (this.cart[i].cartVariants && this.cart[i].cartVariants.length) {
        this.cartModel.variants.push(...this.cart[i].cartVariants);
      }

      this.cartModel.adds_on.push(...this.makeAddOnModel(this.cart[i]['customization']));
      model['category_id'] = this.cart[i].categoryId || this.cart[i].category_id;
      model['agent_type'] = this.cart[i].agent_list && this.cart[i].is_agent ? 1 : 0;
      model.quantity = this.cart[i]['price_type'] ? 1 : this.cart[i].selectedQuantity;
      this.cartModel.productList.push(model);
    }

    // update cart model data
    this.updateCartModel.accessToken = this.user.getUserToken;
    this.updateCartModel.currencyId = this.util.handler.currencyId;
    this.updateCartModel.languageId = this.util.handler.languageId;
    this.updateCartModel.deliveryType = this.deliveryType.toString();
    this.updateCartModel.deliveryCharges = this.priceObj.deliveryCharges.toString();
    this.updateCartModel.handlingAdmin = this.priceObj.handlingAdmin.toString();
    this.updateCartModel.handlingSupplier = this.priceObj.handlingSupplier.toString();
    this.updateCartModel.netAmount = this.priceObj.netTotal;

    this.updateCartModel.delivery_max_time = this.pickUp_dateTime ? moment(this.pickUp_dateTime['date_time']).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    let date = moment();
    if (this.addressDetail['delivery_max_time']) {
      date = date.add(this.addressDetail['delivery_max_time'], 'minutes');
    }

    if (this.deliveryType == 1) {
      date = date.add(this.addressDetail['urgent_delivery_time'], 'minutes');
      this.updateCartModel.urgentPrice = this.urgentPrice;
    }

    this.updateCartModel.deliveryDate = this.pickUp_dateTime ? moment(this.pickUp_dateTime['date_time']).format('YYYY-MM-DD') : date.format('YYYY-MM-DD');
    this.updateCartModel.deliveryTime = this.pickUp_dateTime ? moment(this.pickUp_dateTime['date_time']).format('HH:mm') : date.format('HH:mm');
    this.updateCartModel.day = this.pickUp_dateTime ? moment(this.pickUp_dateTime['date_time']).day() : new Date().getDay();

    if (this.priceObj.amount + this.priceObj.handlingSupplier + this.priceObj.handlingAdmin >= this.addressDetail.free_delivery_amount) {
      this.updateCartModel.minOrderDeliveryCrossed = 1;
    } else {
      this.updateCartModel.minOrderDeliveryCrossed = 0;
    }

    if (this.self_pickup == 1) {
      this.updateCartModel.deliveryId = '0';
    } else {
      this.cartModel.latitude = this.addressDetail.address.latitude;
      this.cartModel.longitude = this.addressDetail.address.longitude;
      this.updateCartModel.deliveryId = this.addressDetail.address.id;
    }

    if (this.settings.app_type == 8 && this.questions.length) {
      this.cartModel.questions = this.questions.slice();
      this.cartModel.addOn = this.priceObj.questionPrice;
      this.updateCartModel.questions = this.questions.slice();
      this.updateCartModel.addOn = this.priceObj.questionPrice;
    }

    this.addToCart();
  }

  addToCart() {
    this.isLoading = true;
    this.http.postData(ApiUrl.addToCart, this.cartModel, false)
      .subscribe(response => {
        if (!!response && response.data) {
          this.updateCartModel.cartId = response.data.cartId;
          this.updateCart();
        } else {
          this.isLoading = false;
        }
      }, (err) => this.isLoading = false);
  }

  makePaymentOrderModel() {
    this.paymentOrderModel.amount = this.priceObj.netTotal; //+ this.priceObj.serviceCharge;
    this.paymentOrderModel.address = this.addressDetail.address;
  }

  updateCart() {
    this.http.postData(ApiUrl.updateCartInfo, this.updateCartModel, false)
      .subscribe(response => {
        if (!!response && response.data) {
          this.afterUpdateCart();
        } else {
          this.isLoading = false;
        }
      }, (err) => this.isLoading = false);
  }

  afterUpdateCart() {
    if (!this.is_service || ((!this.is_agent || this.cart[0].agent_slot) && this.settings.hideAgentList == 0) || this.isBookNow || this.serviceDateTime) {
      this.generateOrder();
    } else {
      let serviceIds: Array<any> = [];
      this.cart.forEach(data => {
        serviceIds.push(data.productId);
      });
      this.util.setLocalData('cart_id', { id: this.updateCartModel.cartId, service_ids: serviceIds }, true);
      this.cartDateTimeData = {
        is_open: true,
        cart: this.cart,
        // addressDetail: this.addressDetail,
        priceObj: this.priceObj,
        data: {
          service_ids: serviceIds.join(),
          cart_id: this.updateCartModel.cartId,
          isPkg: '0',
          payType: this.paymentType,
          promo: (this.priceObj.promo && this.priceObj.promo.code) ? this.priceObj.promo.code : null,
          discount: this.priceObj.discount,
          promoId: (this.priceObj.promo && this.priceObj.promo.id) ? this.priceObj.promo.id : null,
        }
      }

      if (this.settings.extra_instructions == 1) {
        this.cartDateTimeData.data['parking_instructions'] = this.parking_instruction;
        this.cartDateTimeData.data['area_to_focus'] = this.area_to_focus;
      }

      if (this.transaction) {
        this.cartDateTimeData.data['paymentGatewayId'] = this.transaction.paymentGatewayId;
        if (this.transaction.token) {
          this.cartDateTimeData.data['token'] = this.transaction.token;
        } else {
          if (this.transaction.paymentGatewayId != "authorize_net") {
            this.cartDateTimeData.data['customer_payment_id'] = this.transaction.customer_payment_id;
            this.cartDateTimeData.data['card_id'] = this.transaction.card_id;
          }
          else {
            this.cartDateTimeData.data['authnet_profile_id'] = this.transaction.customer_payment_id || this.paymentOrderModel.user.authnet_profile_id;
            this.cartDateTimeData.data['authnet_payment_profile_id'] = this.transaction.card_id;
          }
        }
      }
      this.isLoading = false;
    }
  }

  generateOrder() {
    let offset = moment().format('Z');
    let obj = {
      cartId: this.updateCartModel.cartId,
      languageId: this.util.handler.languageId,
      isPackage: '0',
      paymentType: this.payment_after_confirmation == 1 ? '3' : (this.priceObj.referral_amount >= this.priceObj.netTotal ? '2' : this.paymentType),
      accessToken: this.user.getUserToken,
      offset: offset,
      self_pickup: this.self_pickup,
      type: this.util.getLocalData('cart_type', true) || this.settings.app_type,
      payment_after_confirmation: this.payment_after_confirmation
    }

    if (this.applyWalletDiscount && this.priceObj.walletDiscountAmount && this.paymentType == '4') {
      obj['wallet_discount_amount'] = this.priceObj.walletDiscountAmount
    }
    if (this.transaction) {
      obj['gateway_unique_id'] = this.transaction.paymentGatewayId;
      obj['currency'] = GlobalVariable.CURRENCY_NAME;
      if (this.transaction.token) {
        obj['payment_token'] = this.transaction.token;
      } else if (this.transaction.mobile_no) {
        obj['mobile_no'] = this.transaction.mobile_no;
      } else {
        if (this.transaction.paymentGatewayId != "authorize_net") {
          obj['customer_payment_id'] = this.transaction.customer_payment_id;
          obj['card_id'] = this.transaction.card_id;
        } if (this.transaction.paymentGatewayId == "authorize_net") {
          this.cartDateTimeData.data['authnet_profile_id'] = this.paymentOrderModel.user.authnet_profile_id;
          this.cartDateTimeData.data['authnet_payment_profile_id'] = this.transaction.card_id;
          obj['authnet_profile_id'] = this.paymentOrderModel.user.authnet_profile_id;
          obj['authnet_payment_profile_id'] = this.transaction.card_id;
        }
      }
    }

    obj['order_time'] = moment().format('HH:mm:ss');
    let day = [6, 0, 1, 2, 3, 4, 5];
    obj['order_day'] = day[(new Date()).getDay()];

    if (this.priceObj.promo && this.priceObj.promo.code) {
      obj['promoId'] = this.priceObj.promo.id;
      obj['promoCode'] = this.priceObj.promo.code;
      obj['discountAmount'] = this.priceObj.discount;
    }

    if (this.priceObj.gift && this.priceObj.gift.id) {
      obj['user_gift_ids'] = [this.priceObj.gift.id]
      obj['gift_amount'] = this.priceObj.discount
    }

    if (this.pickUp_dateTime) {
      obj['date_time'] = this.pickUp_dateTime.date_time;
    } else {
      if (this.serviceDateTime) {
        obj['date_time'] = this.serviceDateTime;
      } else {
        let date = moment();
        obj['date_time'] = date.format('YYYY-MM-DD HH:mm:ss');
      }
    }


    obj['duration'] = 0;
    this.cart.forEach(data => {
      if (data['is_product'] == 0) {
        if (data['price_type']) {
          obj['duration'] += (this.settings.interval * data['selectedQuantity']);
        } else {
          obj['duration'] += (data['duration'] * data['selectedQuantity']);
        }
      } else {
        if (data['price_type'] == 1) {
          obj['duration'] += data['selectedQuantity'] * 60;
        }
      }
    });

    if (this.cart[0].agent_slot) {
      obj['date_time'] = this.cart[0].agent_slot.date_time;
      obj['agentIds'] = [this.cart[0].agent_slot.agent.cbl_user.id];
    }

    if (this.priceObj.agent_tip) {
      obj['tip_agent'] = this.priceObj.agent_tip;
    }

    if (this.settings.app_type == 8 && this.questions.length) {
      obj['questions'] = this.questions.slice();
    }

    if (this.settings.referral_feature == 1) {
      obj['use_refferal'] = this.priceObj.referral_amount ? 1 : 0;
    }

    if (this.settings.supplier_service_fee == 1) {
      obj['user_service_charge'] = this.priceObj.serviceCharge;
    }

    if (this.settings.cart_image_upload == 1 && this.show_prescription) {
      Object.keys(this.prescription_images).forEach(key => {
        if (this.prescription_images[key]) {
          obj[key] = this.prescription_images[key];
        }
      });
    }

    if (this.settings.order_instructions == 1 && this.show_instructions && this.instructions) {
      obj['pres_description'] = this.instructions;
    }

    if (this.settings.extra_instructions == 1) {
      obj['parking_instructions'] = this.parking_instruction;
      obj['area_to_focus'] = this.area_to_focus;
    }

    if (this.settings.is_loyality_enable == 1 && this.priceObj.appliedLoyaltyAmount) {
      obj['use_loyality_point'] = 1;
    }

    if (this.scheduleOrderSlot && this.settings.is_schdule_order == 1) {
      obj['is_schedule'] = this.scheduleOrderSlot.table_id ? 0 : 1;//0 in case of dining
      obj['schedule_date'] = this.scheduleOrderSlot.startTime;
      obj['schedule_end_date'] = this.scheduleOrderSlot.endTime;
      obj['slot_price'] = this.scheduleOrderSlot.price;
      obj['slot_id'] = this.scheduleOrderSlot.slot_id;
      if (this.scheduleOrderSlot.table_id) {
        obj['is_dine_in_with_food'] = 1;
        obj['is_dine_in'] = 1;
        obj['table_id'] = this.scheduleOrderSlot.table_id;
      }
    }
    if (this.is_after_table_booking && this.table_booking_details) {
      obj['is_dine_in'] = 1;
      obj['table_request_id'] = this.table_booking_details.table_request_id;
      obj['table_id'] = this.table_booking_details.table_id;
    }
    if (this.manualTableNo) {
      if (this.manualTable_id) {
        obj['table_id'] = this.manualTable_id;
      }
      else {
        this.message.toast("error", "Please verify the table no.");
        return;
      }
    }

    if (this.paymentType === "0") {
      obj['have_coin_change'] = this.have_coin_change;
    }
    if (this.book_dining == 1) {
      obj['self_pickup'] = 3;
      obj['is_dine_in'] = 1;
    }

    if (this.transaction && this.transaction.waitForSuccess) {
      this.util.setLocalData('gop', obj, true);
      const a = document.createElement('a');
      a.href = this.transaction['paymentUrl'];
      a.click();
      return
    }
    this.http.postData(ApiUrl.generateOrder, obj, false)
      .subscribe(response => {
        if (!!response && response.data) {
          this.firebaseAnalyticsSvc.firebaseAnalyticsEvents('place_order', 'place_order');
          this.segmentAnalyticsSvc.segmentAnalyticsEvent('item_purchase', { name: 'new item', info: 'new item purchage done' });
          this.isLoading = false;
          this.orderId = response.data;
          // if (this.settings.is_scheduled && !this.is_agent && !this.pickUp_dateTime && !this.is_service) {
          //   this.scheduleMaxDate = moment().add('days', this.settings.schedule_time).toDate();
          //   $("#scheduleDateModal").modal('show');
          // } else {
          this.toOrderDetail();
          // }
          this.util.clearLocalData('pickUp_DT');
          this.util.clearLocalData('table_booking_details');
        }
        this.isLoading = false;
        this.isBookNow = false;
      }, (err) => {
        this.isLoading = false
        this.isBookNow = false;
      });
  }

  // scheduleOrder() {
  //   let orderDates: Array<any> = [];
  //   this.selectedScheduleDate.forEach(date => {
  //     orderDates.push({
  //       deliveryDate: date,
  //       delivery_time: this.updateCartModel.deliveryTime
  //     });
  //   });

  //   let form_data = {
  //     accessToken: this.user.getUserToken,
  //     orderDates: orderDates,
  //     orderId: this.orderId
  //   };

  //   this.http.postData(ApiUrl.orders.scheduleOrder, form_data, false)
  //     .subscribe(response => {
  //       if (!!response && response.data) {
  //         $("#scheduleDateModal").modal('hide');
  //         this.toOrderDetail();
  //       }
  //     });
  // }

  toOrderDetail() {
    this.router.navigate(['/orders/order-detail'], { queryParams: { orderId: this.orderId } });
    this.util.setCart([]);
    setTimeout(() => {
      this.message.alert('success', `${this.localization.transform('order')} ${this.translate.instant('Placed Successfully')}!`);
    }, 500);
  }

  validateOrder(): boolean {
    let isOutOfStock = this.cart.find(p => p.isOutOfStock);
    if (isOutOfStock) {
      this.message.alert('info', this.translate.instant('Some Item Out Of Stock'));
      return false;
    }

    if (!this.loggedIn) {
      this.util.authToggle.next(true);
      return false;
    }

    if (!((!!this.addressDetail && !!this.addressDetail.address && this.addressDetail.address.id) || this.self_pickup == 1) && !this.is_after_table_booking) {
      if (this.settings.header_theme == 2) {
        this.displayAddModal.next(true);
      } else {
        this.deliveryAddress.openNewAddressDialog();
        // this.message.alert('info', `${this.translate.instant('Firstly Add Address')}!`);
      }
      return false;
    }

    if (this.priceObj.amount < this.addressDetail['min_order']) {
      this.message.alert('warning', `${this.translate.instant('Sub Total Must Be Greater Than')} ${this.addressDetail['min_order']}`);
      return false;
    }

    if (this.paymentType == '4' && this.priceObj.netTotal > this.addressDetail['wallet_amount']) {
      this.message.alert('warning', `${this.translate.instant('Wallet Amount Must Be Greater Than')} ${this.priceObj.netTotal}`);
      return false;
    }

    if (this.pickUp_dateTime && moment(this.pickUp_dateTime['date_time']) < moment()) {
      this.message.alert('warning', this.translate.instant('Please Reselect Date-Time'), this.translate.instant('Your Date-Time Cannot Be Less Than Current Time.'));
      return false;
    }

    if (this.show_prescription && !this.prescription_images) {
      this.message.alert('warning', this.translate.instant('Please Upload Prescription'));
      return false;
    }

    return true;
  }

  onPlaceOrder() {
    if (this.settings.cart_image_upload == 1 && this.show_prescription && !(this.prescription_images && Object.values(this.prescription_images).length)) {
      this.message.alert('warning', this.translate.instant('Please Select Image'));
      return;
    }

    if (this.validateOrder()) {
      this.placeOrder();
    }
  }

  bookServiceNow() {
    if (this.validateOrder()) {
      this.isBookNow = true;
      if (this.paymentType == '1') {
        this.makePaymentOrderModel();
        this.isPayOnline = true;
      } else {
        this.placeOrder();
      }
    }
  }

  onPay() {
    if (this.settings.cart_image_upload == 1 && this.show_prescription && !(this.prescription_images && Object.values(this.prescription_images).length)) {
      this.message.alert('warning', this.translate.instant('Please Select Image'));
      return;
    }

    if (this.validateOrder()) {
      if (this.is_agent && this.is_service && this.settings.hideAgentList == 1) {
        this.cartDateTimeData = {
          is_open: true,
          isOnlinePayment: true,
          cart: this.cart,
          data: {}
        }
      } else {
        this.makePaymentOrderModel();
        this.isPayOnline = true;
      }
    }
  }

  onPaymentError(error: string) {
    this.firebaseAnalyticsSvc.firebaseAnalyticsEvents('initiate_checkout_failed', 'initiate_checkout_failed');
    this.isPayOnline = false;
    this.message.toast('error', error);
  }

  onPaymentSuccess(transaction) {
    this.firebaseAnalyticsSvc.firebaseAnalyticsEvents('initiate_checkout_success', 'initiate_checkout_success');
    this.transaction = transaction;
    this.isPayOnline = false;
    this.isLoading = true;
    this.placeOrder();
  }

  agentTipChange(tipData: any) {
    if (this.settings.agentTipPercentage == 1) {
      if (tipData.isCustom) {
        this.priceObj.agent_tip = parseFloat(tipData.tip);
      } else {
        this.priceObj.agent_tip = (parseFloat(tipData.tip) / 100) * this.priceObj.amount;
      }
    } else {
      this.priceObj.agent_tip = parseFloat(tipData.tip);
    }
    this.cartPriceClass.getTotal();
  }

  referralAmountChange(amount: number) {
    this.priceObj.referral_amount = amount;
    this.cartPriceClass.getTotal();
  }

  loyaltyAmountChange(loyaltyAmount: number) {
    this.priceObj.appliedLoyaltyAmount = loyaltyAmount;
    this.cartPriceClass.getTotal();
  }

  calculateServiceCharge(service_charge) {
    if (service_charge) {
      this.priceObj.supplier_service_charge = service_charge;
      this.cartPriceClass.getTotal();
    }
  }

  prescriptionImagesCheck(event) {
    this.prescription_images = event;
  }

  instructionChange(instruction) {
    this.instructions = instruction;
  }

  onSchedulingProcess(eventData: any) {
    this.scheduleOrderSlot = eventData;
    this.priceObj.slot_price = eventData.price;
    this.cartPriceClass.getTotal();
    this.showScheduleTime = false;
  }

  verifyManualTableNo() {
    if (!this.manualTableNo || !Number(this.manualTableNo)) {
      this.message.toast("error", "Please enter valid table number");
      return;
    }
    var obj = {
      table_number: this.manualTableNo,
      supplier_id: this.cart[0].supplier_id
    }
    this.http.postData(ApiUrl.verifyTable, obj).subscribe((res: any) => {
      if (res && res.status == 200) {
        if (res.data.length) {
          this.manualTable_id = res.data[0].id;
          this.message.toast("success", "Table is available");
        }
        else {
          setTimeout(() => {
            this.message.toast("error", "Please try another table no.");
          }, 4000);
        }
      }
    })
  }

  openSchedulingModal() {
    if (!this.loggedIn) {
      this.util.authToggle.next(true);
      return false;
    }

    if (!((!!this.addressDetail && !!this.addressDetail.address && this.addressDetail.address.id) || this.self_pickup == 1)) {
      this.deliveryAddress.openNewAddressDialog();
      return false;
    }

    this.schedulingData = {
      supplier_id: this.cart[0].supplier_id,
      branch_id: this.cart[0].supplier_branch_id,
      date_order_type: this.book_dining ? 3 : (this.self_pickup == 1 ? 2 : 1),
      latitude: this.addressDetail.address.latitude,
      longitude: this.addressDetail.address.longitude,
      by_pass_tables_selection: this.settings.by_pass_tables_selection
    }
    this.showScheduleTime = true;
  }

  removeSlot() {
    this.showScheduleTime = false;
    this.priceObj.slot_price = 0;
    this.scheduleOrderSlot = null;
  }

  setDateTime(event) {
    this.serviceDateTime = event.date_time;
    this.makePaymentOrderModel();
    this.isPayOnline = true;
  }

  removeTableBookingRequest(event) {
    if (event) {
      this.is_after_table_booking = false;
      this.onDelivery();
      this.util.clearLocalData('table_booking_details');
    }
  }

  ngOnDestroy() {
    if (!!this.settingSubscription) this.settingSubscription.unsubscribe();
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.cartSubscription) this.cartSubscription.unsubscribe();
    if (!!this.userSubscription) this.userSubscription.unsubscribe();
    if (!!this.themeSubscription) this.themeSubscription.unsubscribe();
    if (!!this.routeSubscription) this.routeSubscription.unsubscribe();
    // $("#scheduleDateModal").modal('hide');
  }

}
