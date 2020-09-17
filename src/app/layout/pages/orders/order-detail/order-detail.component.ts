import { CartService } from './../../../../services/cart/cart.service';
import { SeoService } from './../../../../services/seo/seo.service';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { ApiUrl } from './../../../../core/apiUrl';
import { UtilityService } from './../../../../services/utility/utility.service';
import { UserService } from './../../../../services/user/user.service';
import { HttpService } from './../../../../services/http/http.service';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import _ from 'lodash';
import { GlobalVariable } from './../../../../core/global';
import { trigger, transition, style, animate } from '@angular/animations';
import { FcmService } from './../../../../services/fcm/fcm.service';
import { MessagingService } from '../../../../services/messaging/messaging.service';
import { LocalizationPipe } from '../../../../shared/pipes/localization.pipe';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { FirebaseAnalyticsService } from '../../../../services/firebase-analytics/firebase-analytics.service';
import { LocationService } from '../../../../services/location/location.service';

declare const $;

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class OrderDetailComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  private getDataSubscribe: Subscription;
  styleSubscription: Subscription;
  settingsSubscription: Subscription;
  firebaseSubscription: Subscription;
  public userSubscription: Subscription;
  public currentUser: any;


  style: StyleVariables;
  orderIds: Array<any> = [];
  orderHistory: Array<any> = [];
  selectedOrder: number = 0;
  currency: string = '';
  settings: AppSettings
  showLine: any = {
    isPlaced: false,
    isShipped: false,
    isNear: false,
    isDelivered: false
  }
  status: Array<any> = [];

  isLoading: boolean = true;

  isPayOnline: boolean = false;
  refundToWallet: 0 | 1 = 0;
  productToReturn: any;
  isReturnProduct = false;
  returnProductReason: string = '';
  isEditOrder: boolean = false;
  isAddItems: boolean = false;
  editOrder: any;

  dhlData: any = '';
  userOrderStatus: number = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    private user: UserService,
    public util: UtilityService,
    private cartService: CartService,
    private firebaseService: FcmService,
    private router: Router,
    private localization: LocalizationPipe,
    private message: MessagingService,
    private seo: SeoService,
    private translate: TranslateService,
    private firebaseAnalyticsSvc: FirebaseAnalyticsService,
    private location: LocationService,

  ) {

    this.style = new StyleVariables();
    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit() {
    this.seo.updateTitle(`${this.localization.transform('order')} Details | ${GlobalVariable.SITE_NAME}`);

    this.styleSubscription = this.util.getStyles
      .subscribe(style => {
        this.style = style;
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
        }
      });

    this.subscribeRoute();
    this.makeSubscribe();
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.userSubscription = this.user.currentUser
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  makeSubscribe() {
    this.getDataSubscribe = this.util.callGetData.
      subscribe((data) => {
        if (data) {
          this.getDetail();
        }
      });

    this.firebaseService.currentMessage.subscribe((message) => {
      if (message && this.orderHistory && this.orderHistory.length) {
        if (message.data.orderId == this.orderHistory[this.selectedOrder].order_id) {
          this.getDetail();
        }
      }
    })
  }

  /********* Route Subscription **********/
  subscribeRoute() {
    this.subscription = this.route.queryParams
      .subscribe(params => {
        this.orderIds = params.orderId;
      });
  }

  getDetail() {
    this.isLoading = true;
    let obj = {
      languageId: parseInt(this.util.handler.languageId),
      accessToken: this.user.getUserToken,
      orderId: this.orderIds,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    };
    this.http.postData(ApiUrl.orders.getOrderDetail, obj)
      .subscribe(response => {
        if (!!response && response.data) {
          this.orderHistory = response.data.orderHistory;
          // this.userOrderStatus = this.orderHistory[this.selectedOrder].staus
          if (this.orderHistory) {
            this.orderHistory.map(order => {
              if (order.agent.length) {
                order['start_time'] = order.delivered_on;
                order['end_time'] = moment(order.delivered_on).add(order.duration, 'minutes');
              }
            });
            this.orderHistory.forEach(order => {
              order.products = this.mapOrderProducts(order);
              if (order.questions) order.questions = JSON.parse(order.questions);
              // order['subTotal'] = order.products.reduce((a, { totalPrice }) => a + totalPrice, 0);
              // order['net_amount'] = parseFloat(order['net_amount']) - (parseFloat(order['discountAmount']) || parseFloat(order['gift_amount']));
              // order['subTotal'] = parseFloat(order['subTotal']).toFixed(2);
              order['discountAmount'] = (parseFloat(order['discountAmount']) || parseFloat(order['gift_amount']) || parseFloat(order['wallet_discount_amount'])).toFixed(2);
              // if (order.tip_agent) order['net_amount'] += order.tip_agent;
              // if (order.referral_amount) order['net_amount'] -= order['referral_amount'];
              // if (this.settings.supplier_service_fee == 1 && order.user_service_charge) {
              // order['service_charge'] = order.user_service_charge;
              // order['net_amount'] += order['service_charge'];
              // }
            });
          }
          this.isLoading = false;
        }
      }, (err) => this.isLoading = false);
  }


  /**
   distinguish product on basis of customization
   */

  mapOrderProducts(order): Array<any> {
    let products = [];

    order.product.forEach(item => {
      if (item.adds_on && item.adds_on.length) {
        const groupObj = _.groupBy(item.adds_on, 'serial_number');
        if (Object.keys(groupObj).length > 1) {
          for (let key in groupObj) {
            let addOns = groupObj[key];
            const customization = {
              quantity: addOns[0].quantity,
              data: this.makeCustomizationModel(addOns)
            }
            let addOnPrice = 0;
            addOns.forEach(item => {
              addOnPrice += Number(item.price) * item.quantity;
            })
            let productObj = Object.assign({}, item);
            productObj.customization = customization;
            productObj.quantity = addOns[0].quantity;
            productObj.totalPrice = parseFloat(productObj.fixed_price) * addOns[0].quantity + addOnPrice;
            products.push(productObj);
          }
        } else {
          item.customization = {
            quantity: item.adds_on[0].quantity,
            data: this.makeCustomizationModel(item.adds_on)
          }
          let addOnPrice = 0;
          item.adds_on.forEach(item => {
            addOnPrice += Number(item.price) * item.quantity;
          })
          item.totalPrice = parseFloat(item.fixed_price) * item.quantity + addOnPrice;
          products.push(item);
        }
      } else {
        item.totalPrice = parseFloat(item.fixed_price) * item.quantity;
        products.push(item);
      }
    })
    return products;
  }

  makeCustomizationModel(addons: Array<any>): any {
    let list = [];
    const groupObj = _.groupBy(addons, 'adds_on_name');
    for (let key in groupObj) {
      let obj = {
        name: key,
        value: []
      }

      obj.value = groupObj[key].map(item => {
        return {
          type_name: item['adds_on_type_name'],
          name: key,
          type_id: item['adds_on_type_jd'],
          // is_multiple: 0,
          // min_adds_on: 0,
          // max_adds_on: 0,
          id: item['id'],
          price: item['price'],
          // is_default: 0,
          adds_on_type_quantity: item['adds_on_type_quantity']
        }
      })
      list.push(obj);
    }

    return list;
  }

  addOnNames(values): string {
    if (values.adds_on_type_quantity == 0) {
      return values.map((addon) => `${addon.type_name}`).toString();
    } else {
      return values.map((addon) => `${addon.type_name}x${addon.adds_on_type_quantity}`).toString();
    }
  }

  toRateProduct(product) {
    let obj = {
      productId: product['product_id'],
      supplierBranchId: product['supplier_branch_id'],
      orderId: this.orderIds,
      type: 'product'
    }
    this.router.navigate(['orders/rating'], { queryParams: obj });
  }

  toRateSupplier(order) {
    this.router.navigate(['orders/rating'], {
      queryParams: {
        type: 'supplier',
        supplierId: order['supplier_id'],
        supplierBranchId: order['supplier_branch_id'],
        categoryId: order.product[0]['category_id'],
        orderId: order.order_id
      }
    })
  }

  toRateAgent(order) {
    this.router.navigate(['orders/rating'], {
      queryParams: {
        type: 'agent',
        agentId: order['agent'][0].id,
        agentName: order['agent'][0].name,
        agentImage: order['agent'][0].image,
        supplierBranchId: order['supplier_branch_id'],
        categoryId: order.product[0]['category_id'],
        orderId: order.order_id
      }
    })
  }

  trackOrder(order) {
    if (this.settings.app_type == 2) {
      this.message.alert('info', this.translate.instant('Coming Soon'));
      return;
    }
    this.router.navigate(['/orders/track-order'], {
      queryParams: {
        orderId: order['order_id'],
        lng: order['longitude'],
        lat: order['latitude'],
        a_lat: order.agent.length ? order.agent[0].latitude : 0,
        a_lng: order.agent.length ? order.agent[0].longitude : 0,
        selfPickup: order['self_pickup']
      }
    });
  }

  onCancel(order: any) {
    if (order.payment_type == 1 && this.settings.wallet_module == 1) {
      return this.showWalletRefund();
    }
    this.message.confirm(`${this.translate.instant('Cancel This')} ${this.localization.transform('order')}`).then(data => {
      if (data.value) {
        this.cancelOrder(order);
      }
    });
  }

  cancelOrder(order: any) {
    this.isLoading = true

    let param_data = {
      languageId: this.util.handler.languageId,
      accessToken: this.user.getUserToken,
      orderId: order['order_id'],
      isScheduled: order['schedule_order']
    };

    if (order.payment_type != 1) {
      param_data['cancel_to_wallet'] = 1;
    } else {
      param_data['cancel_to_wallet'] = this.refundToWallet;
    }

    this.http.postData(ApiUrl.orders.cancelOrder, param_data)
      .subscribe(response => {
        this.isLoading = false;
        if (!!response && response.data) {
          this.message.toast('success', `${this.localization.transform('order')} ${this.translate.instant('Cancelled Successfully')}`);
          this.getDetail();
        }
      });
  }

  showWalletRefund() {
    $('#walletRefund').modal('toggle');
  }

  async returnRequest(product) {
    this.productToReturn = product;
    if (this.orderHistory[this.selectedOrder].payment_type == 1) {
      this.isReturnProduct = true;
      this.showWalletRefund();
      return;
    }
    const { value: text } = await Swal.fire({
      input: 'textarea',
      inputPlaceholder: 'Type your reason here...',
      inputAttributes: {
        'aria-label': 'Type your reason here'
      },
      confirmButtonColor: this.style.primaryColor,
      cancelButtonColor: this.style.secondaryColor,
      showCancelButton: true
    })
    let request_text: any = text;
    if (request_text) {
      this.returnProductRequest(request_text);
    }
  }

  returnProductRequest(text?: string) {
    this.isReturnProduct = false;
    let param_data = {
      order_price_id: this.productToReturn['order_price_id'],
      product_id: this.productToReturn['product_id'],
      reason: text || this.returnProductReason
    }

    if (this.orderHistory[this.selectedOrder].payment_type.payment_type != 1) {
      param_data['refund_to_wallet'] = 1;
    } else {
      param_data['refund_to_wallet'] = this.refundToWallet;
    }

    this.http.postData(ApiUrl.orders.requestReturn, param_data)
      .subscribe(response => {
        if (!!response && response.data) {
          this.message.toast('success', `${this.localization.transform('product')} return request generated successfully`);
          this.getDetail();
        }
      });
  }

  async onStatusChange(status) {
    const payload = {
      order_id: this.orderHistory[this.selectedOrder].order_id,
      status: status,
    }

    if (payload.status == 4) {
      const { value: text } = await Swal.fire({
        input: 'textarea',
        inputPlaceholder: 'Type your parking instruction here...',
        inputAttributes: {
          'aria-label': 'Type your parking instruction here'
        },
        confirmButtonColor: this.style.primaryColor,
        cancelButtonColor: this.style.secondaryColor,
        showCancelButton: true
      })

      payload['parking_instructions'] = text;
    }

    this.isLoading = true;

    this.http.postData(ApiUrl.orders.changeOrderStatus, payload).subscribe((response) => {
      if (response && response.status == 200) {
        this.getDetail();
        this.message.toast('success', `${this.localization.transform('order')} ${this.translate.instant('Status Updated!')}`);
      }
      this.isLoading = false;
    }, (err) => {
      this.message.toast('error', `${this.translate.instant('Failed To Update')} ${this.localization.transform('order')} ${this.translate.instant('status')}`);
      this.isLoading = false;
    })

  }

  download(product: any) {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = product.recipe_pdf
    a.target = '_blank';
    a.setAttribute('style', 'display: none');
    a.download = product.name;
    a.click();
    document.body.removeChild(a);
  }

  onEditOrder(order: any) {
    this.isEditOrder = true;
    this.editOrder = Object.assign({}, order);
    this.editOrder.products = order.products.map(product => Object.assign({}, product));
    this.editOrder.products.forEach(element => {
      element['selectedQuantity'] = element['quantity'];
    });
    this.getGeofenceData();
  }

  getGeofenceData() {
    let product_ids = (this.orderHistory[this.selectedOrder].product).map((product) => product['product_id']);
    const payload = {
      product_ids: product_ids,
      latitude: this.orderHistory[this.selectedOrder].to_latitude,
      longitude: this.orderHistory[this.selectedOrder].to_longitude
    }

    this.http.postData(ApiUrl.checkProductList, payload)
      .subscribe(response => {
        if (!!response && response.data) {
          let products = response.data.result;
          this.orderHistory[this.selectedOrder].delivery_charges = response.data.region_delivery_charge;
          this.orderHistory[this.selectedOrder].handling_admin = 0;
          (this.orderHistory[this.selectedOrder].product).forEach(cart_item => {
            products.forEach(element => {
              if (cart_item['product_id'] == element['product_id']) {
                this.orderHistory[this.selectedOrder].handling_admin = +element['handling_admin']
                cart_item['handling_admin'] = element['handling_admin'];
              }
            });
          });
          this.getTotal();
        }
      });
  }

  increaseValue(data): void {
    if (this.editOrder.type == 8) {
      if (data['price_type']) {
        data.selectedQuantity += data.duration / this.settings.interval;
      } else {
        data.selectedQuantity = ++data.selectedQuantity;
      }
    } else {
      if (!data['selectedQuantity']) {
        data['selectedQuantity'] = data.quantity || 0;
      }

      if (data['selectedQuantity'] <= 0) {
        data['selectedQuantity'] = 1;
      } else {
        data['selectedQuantity']++;
      }
    }
  }

  decreaseValue(data): void {
    if (this.editOrder.type == 8) {
      if (data['price_type']) {
        data.selectedQuantity -= data.duration / this.settings.interval;
      } else {
        data.selectedQuantity = --data.selectedQuantity;
      }
      if (data['selectedQuantity'] < 1) {
        this.editOrder.products = this.editOrder.products.filter((product) => (product.product_id || product.productId) != (data.product_id || data.productId));
        return;
      }
    } else {
      if (!data['selectedQuantity']) {
        data['selectedQuantity'] = data.quantity || 0;
      }

      if (data['selectedQuantity'] <= 1) {
        this.editOrder.products = this.editOrder.products.filter((product) => (product.product_id || product.productId) != (data.product_id || data.productId));
        return;
      }
      data['selectedQuantity']--;
    }
  }

  onProductAdd(products) {
    this.editOrder.products = products;
    this.isAddItems = false;

    if (this.settings.app_type == 8) {
      this.editOrder.total_order_price = 0;
      this.editOrder.products.forEach(el => {
        this.editOrder.total_order_price += (parseFloat(el.fixed_price) * el.selectedQuantity);
      });
      this.getEditTotal();
    }
  }

  onAddItems() {
    const payload = {
      sectionId: 0,
      orderId: this.editOrder.order_id,
      handlingAdmin: this.editOrder.handling_admin,
      userServiceCharge: 0
    }

    const removalItems = [];
    this.orderHistory[this.selectedOrder].products.forEach((product) => {
      if (!this.editOrder.products.find((p) => ((p.product_id || p.productId) == (product.product_id || product.productId)))) {
        removalItems.push(product.order_price_id);
      } else if (this.settings.app_type == 8 && this.editOrder.products.find((p) => ((p.product_id || p.productId) != (product.product_id || product.productId)))) {
        removalItems.push(product.order_price_id);
      }
    });

    if (removalItems && removalItems.length) {
      payload['removalItems'] = removalItems
    }

    if (this.editOrder.type == 8 || this.settings.app_type == 8) {
      payload['duration'] = 0;
    }

    payload['items'] = this.editOrder.products.map((product) => {
      let obj = {
        price: product.fixed_price,
        quantity: product['selectedQuantity'],
        productName: product['product_name'] || product['name'],
        productId: product['product_id'] || product['productId'],
        branchId: this.editOrder.supplier_branch_id,
        productDesc: product['product_desc'],
        imagePath: product['image_path'],
        orderPriceId: product['order_price_id'],
        // deliveryCharge: 0
      }

      if (product['is_product'] == 0) {
        if (product['price_type']) {
          payload['pricing_type'] = 1;
          payload['duration'] += (this.settings.interval * product['selectedQuantity']);
        } else {
          payload['pricing_type'] = 0;
          payload['duration'] += (product['duration'] * product['selectedQuantity']);
        }
      } else {
        if (product['price_type'] == 1) {
          payload['pricing_type'] = 1;
          payload['duration'] += product['selectedQuantity'] * 60;
        }
      }

      return obj;
    })

    let totalAdminHandling = 0;
    this.editOrder.products.forEach((product) => {
      const productAmount = this.cartService.calulateProductPrice(product);
      totalAdminHandling += (productAmount * product.handling_admin) / 100;
    });
    if (this.settings.app_type == 8 && this.editOrder.addOn) {
      totalAdminHandling += (this.editOrder.addOn * this.editOrder.products[0].handling_admin) / 100;
    }
    payload['handlingAdmin'] = totalAdminHandling;

    const subTotal = payload['items'].reduce((total, item) => Number(item.price) + total, 0);

    if (this.settings.supplier_service_fee == 1 && this.editOrder.user_service_charge) {
      payload['userServiceCharge'] = (this.editOrder.user_service_charge / 100) * subTotal;
    }

    this.isLoading = true;
    this.http.postData(ApiUrl.orders.addItems, payload).subscribe((response) => {
      if (response && response.status == 200) {
        this.getDetail();
      }
      this.isLoading = false;
      this.isEditOrder = false;
    }, (err) => this.isLoading = false)
  }

  getTotal() {
    this.orderHistory[this.selectedOrder].net_amount =
      this.orderHistory[this.selectedOrder].total_order_price +
      this.orderHistory[this.selectedOrder].delivery_charges +
      this.orderHistory[this.selectedOrder].handling_admin +
      this.orderHistory[this.selectedOrder].user_service_charge +
      this.orderHistory[this.selectedOrder].tip_agent +
      this.orderHistory[this.selectedOrder].slot_price - (
        this.orderHistory[this.selectedOrder].loyality_point_discount +
        this.orderHistory[this.selectedOrder].wallet_discount_amount +
        this.orderHistory[this.selectedOrder].referral_amount +
        this.orderHistory[this.selectedOrder].discountAmount);
  }

  getEditTotal() {
    let totalAdminHandling = 0;
    this.editOrder.products.forEach((product) => {
      const productAmount = this.cartService.calulateProductPrice(product);
      totalAdminHandling += (productAmount * product.handling_admin) / 100;
    });
    if (this.settings.app_type == 8 && this.editOrder.addOn) {
      totalAdminHandling += (this.editOrder.addOn * this.editOrder.products[0].handling_admin) / 100;
    }
    this.editOrder.handling_admin = totalAdminHandling;

    this.editOrder.net_amount =
      this.editOrder.total_order_price +
      this.editOrder.delivery_charges +
      this.editOrder.handling_admin +
      this.editOrder.user_service_charge +
      this.editOrder.addOn +
      this.editOrder.tip_agent +
      this.editOrder.slot_price - (
        this.editOrder.loyality_point_discount +
        this.editOrder.wallet_discount_amount +
        this.editOrder.referral_amount +
        this.editOrder.discountAmount);
  }

  dhlStatus() {
    let params = {
      orderId: this.orderHistory[this.selectedOrder].order_id
    }
    this.http.postData(ApiUrl.orders.trackDHL, params)
      .subscribe(response => {
        if (!!response && response.data) {
          this.dhlData = response.data;
          $('#dhl_status').modal('toggle');
        }
      });
  }


  onSOSNotification() {
    var obj = {
      user_id: this.currentUser.id,
      device_type: 3
    }
    this.isLoading = true;
    this.location.openTracker().subscribe((address) => {
      obj['addredd'] = address.address;
      obj['latitude'] = address.lat;
      obj['longitude'] = address.lng;
      this.http.postData(ApiUrl.sosAlertNotification, obj)
        .subscribe(response => {
          this.isLoading = false;
          if (response.status == 200) {
            this.message.toast('success', 'SOS notification sent successfuly');
          }
        }, error => {
          this.isLoading = false;
        })
    }, (err) => {
      this.message.alert('error', err.message);
    });
  }

  itemSelection() {
    this.isAddItems = true;
    this.util.diableCart.next(true);
  }

  ngOnDestroy() {
    this.styleSubscription.unsubscribe();
    this.subscription.unsubscribe();
    this.getDataSubscribe.unsubscribe();
    this.settingsSubscription.unsubscribe();
    if (this.firebaseSubscription) this.firebaseSubscription.unsubscribe();
  }

}
