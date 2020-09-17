import { SeoService } from './../../../../services/seo/seo.service';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleConstants } from './../../../../core/theme/styleConstants.model';
import { ProductModel } from './../../../../shared/models/product.model';
import { ApiUrl } from './../../../../core/apiUrl';
import { UserService } from './../../../../services/user/user.service';
import { MessagingService } from './../../../../services/messaging/messaging.service';
import { UtilityService } from './../../../../services/utility/utility.service';
import { HttpService } from './../../../../services/http/http.service';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { AppHandler } from './../../../../shared/models/appHandler.model';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, from } from 'rxjs';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { DialogService } from 'primeng/dynamicdialog';
import { CartService } from './../../../../services/cart/cart.service';
import { LocalizationPipe } from './../../../../shared/pipes/localization.pipe';
import { GlobalVariable } from './../../../../core/global';
import { trigger, transition, style, animate } from '@angular/animations';
import * as moment from 'moment';
import Drift from 'drift-zoom';
import { AddOnComponent } from './../../../../layout/shared/product/components/add-on/add-on.component';
import { QuestionsComponent } from './../../../shared/layout-shared/components/questions/questions.component';
import { TranslateService } from '@ngx-translate/core';

declare const $;

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ProductDetailComponent implements OnInit, OnDestroy {

  @ViewChild('productImage', { static: false }) productImage: ElementRef;

  private subscription: Subscription;
  private getDataSubscribe: Subscription;
  styleSubscription: Subscription;
  cartSubscription: Subscription;
  settingsSubscription: Subscription;
  userSubscription: Subscription;

  handler: AppHandler;
  detail: any = {
    variants: [],
    selectedQuantity: 0
  };
  image: string = '';
  mainCategoryIndex: number = 0;
  categoryName: string = '';
  showQuantity: boolean = false;
  showSupplier: boolean = false;
  allCheckOrNot: any = [];

  brandId: string = '';
  productId: number = 0;
  supplierBranchId: number = 0;
  variantsArray: any = [];
  cart: any[] = [];
  unitId: string = '';
  setting: any = {};
  offer: number;
  colorPattern: RegExp;
  selectedLocation: any = {};
  currency: string = '';
  style: StyleVariables;
  btnInverse: StyleConstants;
  btn: StyleConstants;
  categoryId: any;
  supplier: any;

  title: string = "Product detail";
  description: string = '';
  avgRating: number = 0;
  loggedIn: boolean = false;
  disableAdd: boolean = false;
  timeInterval: number = 0;
  perValue: string = '';
  settings: AppSettings;
  selectedIndex: number = 0;
  customOptions: OwlOptions = {};
  responseVariants: any = [];
  firstVariantType: number = 0;

  isLoading: boolean = false;
  isBuyNow: boolean = false;
  similarProducts: Array<any> = [];

  isTabActive = 0;
  tabContent = '';
  slideConfig = {
    'slidesToShow': 3,
    'slidesToScroll': 3,
    'dots': false,
    'arrows': true,
    'infinite': false
  };
  constructor(
    private route: ActivatedRoute,
    private http: HttpService,
    public util: UtilityService,
    private message: MessagingService,
    private router: Router,
    public dialogService: DialogService,
    private user: UserService,
    private cartService: CartService,
    private localization: LocalizationPipe,
    private translate: TranslateService,
    private seo: SeoService
  ) {

    this.style = new StyleVariables();
    this.btnInverse = new StyleConstants();
    this.btn = new StyleConstants();
    this.currency = GlobalVariable.CURRENCY;

    this.userSubscription = this.user.currentUser
      .subscribe(user => {
        if (!!user && user['access_token']) {
          this.loggedIn = true;
        } else {
          this.loggedIn = false;
        }
      });

    this.customOptions = {
      loop: true,
      mouseDrag: false,
      touchDrag: true,
      pullDrag: false,
      dots: true,
      navSpeed: 700,
      nav: false,
      margin: 25,
      responsive: {
        0: {
          items: 1
        }
        , 600: {
          items: 1
        }
        , 1000: {
          items: 1
        }
      }
    }
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles
      .subscribe(style => {
        this.style = style;
        this.btnInverse.color = style.defaultColor;
        this.btnInverse.backgroundColor = '#ffffff';
        this.btnInverse.borderColor = style.defaultColor;
        this.btn.color = '#ffffff';
        this.btn.backgroundColor = style.primaryColor;
        this.btn.borderColor = style.primaryColor;
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if (settings) {
          this.timeInterval = settings['interval'];
          this.settings = settings;
        }
      });

    this.cartSubscription = this.util.getCart.subscribe(cart => {
      if (cart) {
        this.cart = cart;
      }
    });
    this.makeSubscribe();
  }

  makeSubscribe() {
    this.getDataSubscribe = this.util.callGetData.
      subscribe((data) => {
        if (data) {
          this.subscribeRoute();
          this.selectedLocation = this.util.getLocalData('locationObj', true);
        }
      });
    this.getDataSubscribe = this.util.getSettings.
      subscribe((data) => {
        if (data) {
          this.setting = data;
        }
      });
  }

  // subscribe route
  subscribeRoute() {
    this.subscription = this.route.queryParams.subscribe(params => {
      if (params.f) {
        params = this.util.decryptData(params.f);
        this.productId = parseInt(params.productId);
        this.supplierBranchId = parseInt(params.supplierBranchId);
        this.categoryId = parseInt(params.category);
        if (params.offer) {
          this.offer = parseInt(params.offer);
        }
        this.getProductDetail();
      }
    });
  }

  addToRecentlyAdded() {
    if (this.loggedIn) {
      this.http.putData(ApiUrl.updateRecentlyViewed, { productId: this.productId })
        .subscribe(respone => {});
    }
  }

  getProductDetail(product_id?: number) {
    let obj = {
      languageId: this.util.handler.languageId,
      productId: product_id ? product_id : this.productId,
      supplierBranchId: this.supplierBranchId,
      offer: this.offer ? this.offer : 0,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    };
    this.isLoading = true;
    this.http.postData(ApiUrl.getProductDetail, obj, false)
      .subscribe(response => {
        if (!!response && response.data) {
          this.addToRecentlyAdded();
          this.similarProducts = response.data.similarProduct;
          this.brandId = response.data.brand_id;
          if (product_id) {
            if (!response.data.display_price || response.data.display_price < 0) {
              this.message.alert('info', `${this.localization.transform('product')} ${this.translate.instant('Quantity Not Available')}!`);
            } else {
              this.setValueToDetail(response.data);
            }
          } else {
            this.detail = response.data;
            this.seo.updateTitle(`${this.detail.name} | ${GlobalVariable.SITE_NAME}`);
            this.seo.updateDescription(this.detail.product_desc);

            this.detail.fixed_price = Number(this.detail.fixed_price).toFixed(2);
            if (response.data.variants.length) {
              this.responseVariants = response.data.variants;
              this.makeVariant(response.data);
            } else {
              this.detail.selectedQuantity = 0;
              this.showQuantity = true;
              this.productId = this.detail.id;
              this.unitId = this.productId.toString();
              this.checkUintIdExist();
            }
            this.setQuantity();
            this.image = this.detail.image_path[0];
            if (this.settings.isProductCustomTabDescriptionEnable) {
              this.initTab();
            }
          }
          this.checkStock(response.data);
          if (this.settings.app_type == 2 && this.settings.disable_zoom_in_product == 0 && this.setting.selected_template != 4) this.initializeImageMagnifier();
        }
        this.isLoading = false;
      }, (err) => this.isLoading = false);
  }

  initTab() {
    for (let i = 0; i < this.settings.productCustomTabDescriptionLabel.length; i++) {
      let col = this.settings.productCustomTabDescriptionLabel[i];
      if (!!this.detail[col.labelDBColName]) {
        this.isTabActive = i + 1;
        this.tabContent = this.detail[col.labelDBColName];
        break;
      }
    }
  }

  setTabContent(content, flag) {
    this.isTabActive = flag;
    this.tabContent = content;
  }

  checkStock(product) {
    this.detail.isOutOfStock = false;
    let quantity = !!product.quantity ? (Number(product.quantity) || 0) : 0;
    let purchaseQuantity = !!product.purchased_quantity ? (Number(product.purchased_quantity) || 0) : 0;

    if (purchaseQuantity >= quantity) {
      this.detail.isOutOfStock = true;
    }
  }

  initializeImageMagnifier() {
    setTimeout(() => {
      this.productImage.nativeElement['dataset']['zoom'] = this.image;
      new Drift(document.querySelector(".drift-trigger"), {
        paneContainer: document.querySelector(".drift-detail"),
        inlinePane: 900,
        inlineOffsetY: -85,
        containInline: true,
        hoverBoundingBox: true
      });
    }, 500);
  }

  setQuantity() {
    if (this.detail['price_type']) this.detail['fixed_price'] = this.detail['hourly_price'][0].price_per_hour;
    if (this.cart.length) {
      this.cart.forEach(cartProduct => {
        if (cartProduct.productId == this.detail.id) {
          this.detail['selectedQuantity'] = cartProduct['selectedQuantity'];
          if (this.detail['price_type']) {
            this.detail['fixed_price'] = cartProduct['fixed_price'];
          }
        }
      });
    }
  }

  makeVariant(responseData) {
    let data = {}, colorMap = {};
    this.categoryName = responseData.variants[0].variant_name;
    this.firstVariantType = responseData.variants[0].variant_type

    if (this.settings.not_all_variant_required == 0) {
      responseData.variants[0].variant_values.forEach(value => {
        data[value.product_id] = {
          subCat: [],
          name: value.variant_value.toLowerCase(),
          data: value,
          isClicked: false
        };
      });
    } else {
      responseData.variants.forEach(col => {
        col.variant_values.forEach(value => {
          data[value.product_id] = {
            subCat: [],
            name: value.variant_value.toLowerCase(),
            data: value,
            isClicked: false
          };
        });
      });
    }

    for (let i = 1; i < responseData.variants.length; i++) {
      responseData.variants[i].variant_values.forEach(value => {
        value.isClicked = false;
        if (`${responseData.variants[i].variant_name}+${value.product_id}` in colorMap) {
          if(data[value.product_id].subCat[colorMap[`${value.color}+${value.product_id}`]]) data[value.product_id].subCat[colorMap[`${value.color}+${value.product_id}`]].values.push(value);
        } else {
          colorMap[`${responseData.variants[i].variant_name}+${value.product_id}`] = data[value.product_id].subCat.length;
          data[value.product_id].subCat[colorMap[`${responseData.variants[i].variant_name}+${value.product_id}`]] = {
            name: responseData.variants[i].variant_name,
            values: [value],
            isClicked: false,
            clickedId: '',
            [responseData.variants[i].variant_name]: colorMap[`${responseData.variants[i].variant_name}+${value.product_id}`]
          }
        }
      });
    }

    let finalArray = [];
    let subCatMap = {};

    for (let value in data) {
      if (`${data[value].name}` in subCatMap) {
        if (finalArray[subCatMap[data[value].name]].subCat.length != 0) {
          finalArray[subCatMap[data[value].name]].subCat = this.util.findUnique(finalArray[subCatMap[data[value].name]].subCat, data[value].subCat);
        } else {
          finalArray[subCatMap[data[value].name]].subCat = data[value].subCat;
        }
      } else {
        subCatMap[data[value].name] = finalArray.length;
        finalArray[subCatMap[data[value].name]] = data[value];
      }
    }

    this.variantsArray = finalArray;
    this.detail.variants = JSON.parse(JSON.stringify(this.variantsArray));
  }

  replaceAllValue(index) {
    this.showQuantity = false;
    this.detail.variants = JSON.parse(JSON.stringify(this.variantsArray));
    this.detail.variants[index].isClicked = true;
    if (!this.detail.variants[index].subCat.length) {
      this.lastCallProductDetail(this.detail.variants[index].data);
    }
  }

  replaceNextValues(mainIndex, parentIndex, currentIndex, last, data) {
    this.showQuantity = false;
    if (last) {
      this.makeIsClickedTrue(mainIndex, parentIndex, currentIndex);
      this.lastCallProductDetail(data);
    } else {
      this.makeIsClickedTrue(mainIndex, parentIndex, currentIndex);
      let index = this.detail.variants[mainIndex].subCat[parentIndex + 1].values.findIndex(x => x.product_id == data.product_id);
      if (index == -1) {
        this.lastCallProductDetail(data);
      }
    }
  }

  makeIsClickedTrue(mainIndex, parentIndex, currentIndex) {
    let array = JSON.parse(JSON.stringify(this.variantsArray[mainIndex].subCat[parentIndex].values));
    this.detail.variants[mainIndex].subCat[parentIndex].values = array;
    this.detail.variants[mainIndex].subCat[parentIndex].values[currentIndex].isClicked = true;
  }

  lastCallProductDetail(data) {
    this.unitId = data.unid;
    this.productId = data.product_id;
    this.getProductDetail(data.product_id);
  }

  decreaseValue(): void {
    if (this.settings.app_type == 1) {
      this.removeProduct(this.detail);
      return;
    }
    if (this.detail.selectedQuantity <= 0) {
      return;
    }

    this.detail.selectedQuantity -= 1;
    this.checkAdd();    
  }

  increaseValue() {
    if (this.settings.app_type == 1) {
      this.addProduct(this.detail);
      return;
    }
    if (this.detail.variants && this.detail.variants.length) {
      if (!this.unitId || this.unitId == this.detail.id) {
        this.message.alert('info', this.translate.instant('Please Choose / Select Variant First'));
        return;
      }
    }
    if (this.disableAdd) {
      return;
    }
    if (this.detail.selectedQuantity >= (Number(this.detail.quantity) - Number(this.detail.purchased_quantity))) {
      this.message.alert('info', this.translate.instant('Maximum Limit Reached'));
      return;
    }
    this.detail.selectedQuantity += 1;
    this.checkAdd();    
  }


  checkAdd() {
    if (this.detail.variants && this.detail.variants.length) {
      if (!this.unitId || this.unitId == this.detail.id) {
        this.message.alert('info', this.translate.instant('Please choose / select variant first'));
        this.isBuyNow = false;
        return;
      }
    }

    let key = this.setting.cart_flow.toString();
    let cart = this.cart ? this.cart.slice() : [];
    if (cart.length) {
      if (key == '0') {
        let msg = `Can't Add More Than One Item Or Quantity!`;
        this.openConfirm(msg);
        this.isBuyNow = false;
        return;
      } else if (key == '1') {
        let index = cart.findIndex(x => x.unitId == this.unitId);
        if (index == -1) {
          let msg = `${this.translate.instant("Can't Add More Than One")} ${this.localization.transform('product')}!`;
          this.openConfirm(msg);
          this.isBuyNow = false;
          return;
        } else {
          this.addToCartValues();
        }
      } else if (key == '2') {
        let index = cart.findIndex(x => x.unitId == this.unitId);
        if (index !== -1) {
          let msg = `${this.translate.instant("Can't Add More Than One Quantity")}!`;
          this.openConfirm(msg);
          this.isBuyNow = false;
          return;
        } else {
          this.addToCartValues();
        }
      } else {
        this.addToCartValues();
      }
    } else {
      this.addToCartValues();
    }
  }

  openConfirm(msg) {
    this.message.confirm(`${this.translate.instant('Clear Your Cart')}`, msg).then(data => {
      if (data.value) {
        this.clearCart();
      }
    });
  }

  clearCart() {
    this.detail.selectedQuantity = 0;
    this.util.setCart([]);
    this.addToCartValues();
  }

  addToCartValues() {
    if (this.detail.adds_on && this.detail.adds_on.length) {
      return this.openAddOnDialog(this.detail);
    }

    if (this.cart.length) {
      if (this.cart[0].supplier_id != this.detail.supplier_id && this.settings.vendor_status == 0) {
        this.message.confirm(`${this.translate.instant('Add This Item To Cart')}`, `${this.translate.instant('Existing Items Will Be Removed From Cart As Your Cart Has Items Of Different')} ${this.localization.transform('supplier')}!`)
          .then(result => {
            if (result.value) {
              this.cart = [];
              this.addTocart();
            } else {
              this.isBuyNow = false;
              return;
            }
          });
      } else {
        const value = this.cart.findIndex(x => x.unitId == this.unitId);
        if (value > -1) {
          this.detail.selectedQuantity = this.detail.selectedQuantity ;
          this.cart[value].selectedQuantity = this.detail.selectedQuantity;
          if (this.cart[value]['selectedQuantity'] <= 0) {
            this.cart.splice(value, 1);
          }
          this.hourlyPrice(value);
          this.util.setCart(this.cart);
          if (this.isBuyNow) {
            this.router.navigate(['/cart']);
          }
        } else {
          this.addTocart();
        }
      }
    } else {
      this.addTocart();
    }
  }

  getCartVarients(productId: number) {
    let variantsArray = [];
    this.responseVariants.forEach((variant) => {
      variantsArray.push(...variant.variant_values);
    });

    return variantsArray.filter(variant => variant.product_id == productId);
  }

  addTocart() {
    this.detail.handingCharges = this.detail.handling_admin + this.detail.handling_supplier;
    this.detail.unitId = this.unitId;
    this.detail.categoryId = this.categoryId ? this.categoryId : this.detail['category_id'];
    this.hourlyPrice(-1);
    if (this.detail.selectedQuantity > (Number(this.detail.quantity) - Number(this.detail.purchased_quantity))) {
      this.message.alert('info', this.translate.instant('Maximum Limit Reached'));
      return;
    }
    this.detail['selectedQuantity'] = this.detail['selectedQuantity'] || 1;
    let cart = new ProductModel();
    for (let data in cart) {
      cart[data] = this.detail[data];
    }
    cart['cartVariants'] = this.getCartVarients(this.productId);
    cart.productId = this.productId.toString();
    cart.image_path = cart.image_path.length ? cart.image_path[0] : null;
    this.cart.push(cart);
    this.util.setCart(this.cart);
    if (this.isBuyNow) {
      this.router.navigate(['/cart']);
    }
  }

  hourlyPrice(index: number) {
    if (this.detail['price_type']) {
      if (this.detail['is_product']) {
        this.timeInterval = 60;
      }
      if (this.detail['selectedQuantity'] * this.timeInterval >= (parseInt(this.detail['hourly_price'][this.detail['hourly_price'].length - 1]['max_hour']))) {
        this.disableAdd = true;
      } else {
        this.disableAdd = false;
      }
      this.detail['hourly_price'].forEach(element => {
        if (this.detail['selectedQuantity'] * this.timeInterval >= element['min_hour'] && this.detail['selectedQuantity'] * this.timeInterval < element['max_hour']) {
          this.detail['fixed_price'] = element['price_per_hour'];
          if (index > -1) {
            this.cart[index]['fixed_price'] = element['price_per_hour'];
          }
        }
      });
    }
  }

  setValueToDetail(data) {
    this.detail.quantity = data.quantity;
    this.detail.purchased_quantity = data.purchased_quantity;
    this.detail.display_price = data.display_price;
    this.detail.image_path = data.image_path;
    this.detail.fixed_price = Number(data.fixed_price).toFixed(2);
    this.detail.discount = data.discount;
    this.detail.product_desc = data.product_desc;
    this.detail.price_type = data.price_type;
    this.detail.handling_supplier = data.handling_supplier;
    this.detail.handling_admin = data.handling_admin;
    this.detail.delivery_charges = data.delivery_charges;
    this.detail.selectedQuantity = 0;
    this.showQuantity = true;
    this.checkUintIdExist();
  }

  checkUintIdExist() {
    if (this.cart.length) {
      const value = this.cart.findIndex(x => x.unitId == this.unitId);
      if (value > -1) {
        this.detail.selectedQuantity = this.cart[value].selectedQuantity;
      }
    }
  }

  rateProduct() {
    if (this.loggedIn) {
      let obj = {
        productId: this.detail['id'],
        supplierBranchId: this.detail['supplier_branch_id']
      }
      this.router.navigate(['orders/rating'], { queryParams: obj });
    } else {
      this.message.alert('warning', `${this.translate.instant('Please Login To Continue')}!`);
    }
  }

  viewSupplier(detail) {
    this.router.navigate(['/supplier', 'supplier-detail'],
      {
        queryParams: {
          sup_id: detail['supplier_id'],
          branch_id: detail['supplier_branch_id'],
          cat_id: this.categoryId,
        }
      });
  }

  locationToggle() {
    this.util.locationToggle.next(true);
  }

  wishlist(status) {
    if (!this.loggedIn) {
      this.message.alert('warning', 'please login first');
      return;
    }
    let param_data = {
      status: +status,
      product_id: this.detail.id
    }
    this.http.postData(ApiUrl.addToWishlist, param_data, true)
      .subscribe(response => {
        if (!!response && response.data) {
          this.message.toast('success', `${this.localization.transform('product')} ${this.translate.instant('Has Been Successfully')} ${status ? this.translate.instant('Added To') : this.translate.instant('Removed From')} ${this.localization.transform('wishlist')}`);
          this.detail.is_favourite = status;
        }
      });
  }

  onBuyNow() {
    this.isBuyNow = true;
    this.checkAdd();
  }

  /********* Open Add On Dialog *********/

  openAddOnDialog(product) {
    const dialogRef = this.dialogService.open(AddOnComponent, {
      header: product['name'],
      width: '45%',
      showHeader: false,
      // contentStyle: { "max-height": "350px", "overflow": "auto" },
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      data: {
        product: product,
        addOnItems: product['adds_on']
      }
    })

    dialogRef.onClose.subscribe(() => {
      if (product.customization && product.customization.length) {
        this.router.navigate(['/cart']);
      }
    })
  }

  removeProduct(product) {
    if (product['customization'] && product['customization'].length) {
      this.openAddOnDialog(product);
    } else {
      this.cartService.removeFromCart(product)
    }
  }

  addProduct(product) {
    if (product['adds_on'] && product['adds_on'].length) {
      this.openAddOnDialog(product);
      return;
    }

    this.cartService.addToCart(product);
  }

  onImageClick(img) {
    this.image = img;
    this.productImage.nativeElement['dataset']['zoom'] = this.image;
  }

  toAgentList() {
    const url: any = this.router.url;
    this.util.setRedirectUrl(url);

    if (this.detail['price_type'] && !this.detail.selectedQuantity) {
      this.detail.selectedQuantity += this.detail.duration / this.timeInterval;
    }

    this.util.setLocalData('selected_service', this.detail, true);

    let params = {
      isPkg: '0',
      service_ids: this.detail.id
    };
    // params['date_time'] = moment().unix();
    this.router.navigate(['/cart/agent'], {
      queryParams: params
    });
  }

  onServiceAddOrRemove(service: any, value: number): void {
    if (value < 0 && service.selectedQuantity <= 0) {
      return;
    }

    if (service.selectedQuantity * this.timeInterval >= service.maxHour && value > 0) {
      this.message.alert('info', this.translate.instant('Maximum Limit Reached'));
      return;
    }

    if (service['price_type']) {
      if (value > 0)
        service.selectedQuantity += service.duration / this.timeInterval;
      else
        service.selectedQuantity -= service.duration / this.timeInterval;
    } else {
      if (value > 0) {
        service.selectedQuantity = ++service.selectedQuantity;
      } else {
        service.selectedQuantity = --service.selectedQuantity;
      }
    }
    this.cartService.calculateProductHourlyPrice(service);
  }

  openQuestions(service): void {
    const dialogRef = this.dialogService.open(QuestionsComponent, {
      width: '60%',
      showHeader: false,
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      data: {
        cat_id: service['detailed_sub_category_id'] || service['sub_category_id'] || service['categories_id'] || service['category_id'],
      }
    });

    dialogRef.onClose.subscribe((navigate: boolean) => {
      if (navigate) {
        this.toAgentList();
      }
    });
  }

  onBookNow() {
    if (!this.loggedIn) {
      this.message.alert('info', `${this.translate.instant('Please Login First')}!`);
      return;
    }

    if (!this.util.getLocalData('ques_data') && this.detail.is_question) {
      // this.util.clearLocalData('ques_data');
      this.cartService.emptyCart();
      this.openQuestions(this.detail);
    } else {
      this.toAgentList();
    }
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.getDataSubscribe.unsubscribe();
    this.styleSubscription.unsubscribe();
    this.cartSubscription.unsubscribe();
    this.userSubscription.unsubscribe();
    $("#img").modal('hide');
    let componentInstance = this.dialogService.dialogComponentRef;
    if (componentInstance) {
      componentInstance.destroy()
    }
  }

}
