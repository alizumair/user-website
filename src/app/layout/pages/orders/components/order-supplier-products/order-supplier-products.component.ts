import { LocalizationPipe } from './../../../../../shared/pipes/localization.pipe';
import { GlobalVariable } from './../../../../../core/global';
import { AddOnComponent } from './../../../../shared/product/components/add-on/add-on.component';
import { UserService } from './../../../../../services/user/user.service';
import { DialogService } from 'primeng/dynamicdialog';
import { CartService } from './../../../../../services/cart/cart.service';
import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { HttpService } from './../../../../../services/http/http.service';
import { ApiUrl } from './../../../../../core/apiUrl';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import * as _ from 'underscore'

@Component({
  selector: 'app-order-supplier-products',
  templateUrl: './order-supplier-products.component.html',
  styleUrls: ['./order-supplier-products.component.scss']
})
export class OrderSupplierProductsComponent implements OnInit, OnDestroy {

  isLoading: boolean = false;
  loggedIn: boolean = false;
  products: Array<any> = [];
  supplierDetail: any;
  state = { 'editOrder': true };

  currency: string = ''

  @Input() orderType: number;
  @Input() supplierId: string = '';
  @Input() settings: AppSettings;
  @Input() style: StyleVariables;
  @Input() selectedProducts: Array<any> = [];

  @Output() onBack: EventEmitter<any> = new EventEmitter<any>();
  @Output() onAdd: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private util: UtilityService,
    private http: HttpService,
    private message: MessagingService,
    private user: UserService,
    public cartService: CartService,
    public dialogService: DialogService,
    private localization: LocalizationPipe
  ) {
    this.currency = GlobalVariable.CURRENCY;
  }


  ngOnInit() {
    this.util.setCart([]);

    if (this.supplierId) {
      this.getDetails();
    }
  }

  updateProduct(product) {
    product['avg_rating'] = Number.parseFloat(product['avg_rating']).toFixed(1);
    if (product.display_price != product.fixed_price) {
      product["discount"] = Math.round(
        ((product.display_price - product.fixed_price) / product.display_price) * 100
      );
    }
    product["selectedQuantity"] = 0;
    if (product['price_type']) {
      product['maxHour'] = product['hourly_price'][product['hourly_price'].length - 1]['max_hour'] - this.settings['interval'];
      if (product['discount'] && product['hourly_price'][0]['discount_price']) {
        product['fixed_price'] = product['hourly_price'][0]['discount_price'];
        product['display_price'] = product['hourly_price'][0]['price_per_hour'];
        product['discount_price'] = Math.round(((product['hourly_price'][0]['price_per_hour'] - product['hourly_price'][0]['discount_price']) / product['hourly_price'][0]['price_per_hour']) * 100);
      } else {
        product['fixed_price'] = product['hourly_price'][0]['price_per_hour'];
      }
    }
    if (this.selectedProducts.length) {
      this.selectedProducts.forEach(cartProduct => {
        if (cartProduct.productId == product.product_id || cartProduct.product_id == product.product_id) {
          product['selectedQuantity'] = cartProduct['selectedQuantity'] || cartProduct['quantity'];
          if (product['price_type']) {
            product['fixed_price'] = cartProduct['fixed_price'];
          }
          if (!!cartProduct['customization']) {
            product['customization'] = cartProduct['customization'];
          }
        }
      });
    }
    this.util.productPriceToFloat(product);
    product["discount"] = Math.round(((product.display_price - product.fixed_price) / product.display_price) * 100);
  }

  getDetails() {
    this.isLoading = true;
    let param_data = {
      languageId: this.util.handler.languageId,
      supplier_id: this.supplierId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    }

    this.http.getData(ApiUrl.getSupplierDetailProduct, param_data)
      .subscribe(response => {
        if (!!response && response.data) {
          this.products = response.data.product;
          this.supplierDetail = response.data.supplier_detail;
          // if (!this.showBranches) {
          this.products.forEach(data => {
            if (data.detailed_category_name && data.detailed_category_name.length) {
              data.detailed_category_name = _.uniq((data.detailed_category_name).slice(), 'detailed_sub_category_id');
              data.detailed_category_name.forEach(cat => {
                cat['value'] = [];
                data.value.map(product => {
                  if (product.detailed_sub_category_id == cat.detailed_sub_category_id) {
                    this.updateProduct(product);
                    cat['value'].push(product);
                  }
                });
              });
            } else {
              data.value.map(product => {
                this.updateProduct(product);
              });
            }
          });

          this.products = this.products.slice();
          // }
          this.isLoading = false;
        }
      }, (err) => {
        this.isLoading = false;
      });
  }

  openAddOnDialog(product) {
    const dialogRef = this.dialogService.open(AddOnComponent, {
      header: product['name'],
      width: '45%',
      style: { 'background-color': `${this.style.primaryColor} !important` },
      showHeader: false,
      // contentStyle: { "max-height": "350px", "overflow": "auto" },
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      data: {
        product: product,
        addOnItems: product['adds_on']
      }
    })

    dialogRef.onClose.subscribe(() => {
    })
  }

  addProduct(product) {
    // if (product['is_product_adds_on'] !== 1) {
    this.cartService.addToCart(product, this.products);
    // return;
    // }

    // this.openAddOnDialog(product);
  }

  removeProduct(product) {
    // if (product['customization'] && product['customization'].length) {
    //   this.openAddOnDialog(product);
    // } else {
    this.cartService.removeFromCart(product)
    // }
  }

  onBookNow(product) {
    this.message.confirm(`add this ${this.localization.transform('product')}`, `Existing ${this.localization.transform('product')} will be removed`)
      .then(result => {
        if (result.value) {
          this.cartService.addToCart(product, null, false);
          this.util.diableCart.next(false);
          return this.onAdd.emit(this.util.getLocalData('cart', true));
        }
      });
  }

  onSubmit(): void {
    const allProducts = [];
    const products = this.util.getLocalData('cart', true);
    this.selectedProducts.forEach((product) => {
      if (!products.find(p => p.productId == product.product_id)) {
        allProducts.push(product);
      }
    })
    allProducts.push(...products);
    this.onAdd.emit(allProducts);
    this.util.diableCart.next(false);
  }

  back() {
    this.util.diableCart.next(false);
    this.onBack.emit(false);
  }


  ngOnDestroy(): void {
    this.util.setCart([]);
  }
}
