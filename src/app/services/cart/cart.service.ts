// import { CartInitService } from './../../../../projects/cart-init/src/lib/cart-init.service';
import { CartInitService } from '@sh_mayank/cart-init';
import { Injectable } from '@angular/core';
import { ProductModel } from './../../shared/models/product.model';
import { UtilityService } from '../utility/utility.service';
import { AppSettings } from './../../shared/models/appSettings.model';
import { MessagingService } from '../messaging/messaging.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { LocalizationPipe } from '../../shared/pipes/localization.pipe';
import { TranslateService } from '@ngx-translate/core';
import { GlobalVariable } from './../../core/global';
import { CartInitModule } from '@sh_mayank/cart-init';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  settings: AppSettings;
  cart: Array<any> = [];
  cartSubscription: Subscription;
  settingsSubscription: Subscription;
  timeInterval: number = 0;
  decimalQuantityStep: number = GlobalVariable.decimal_quantity_step;

  constructor(
    private util: UtilityService,
    private message: MessagingService,
    private router: Router,
    private localization: LocalizationPipe,
    private translate: TranslateService,
    private cartInit: CartInitService
  ) {

    this.cartSubscription = this.util.getCart.subscribe(cart => {
      if (cart) {
        this.cart = cart;
      }
    });

    this.settingsSubscription = this.util.getSettings.subscribe(
      (settings: AppSettings) => {
        if (settings) {
          this.settings = settings;
          this.timeInterval = settings['interval'];
        }
      });
  }

  checkCartCategory(product) {
    return !!this.cart.find(p => p.categoryId == product.categories_id);
  }


  setCartType(type): void {
    this.util.setLocalData('cart_type', type);
  }

  setOrderPickType(type): void {
    this.util.setLocalData('order_pick_type', type);
  }

  getOrderPickType(): number {
    return this.util.getLocalData('order_pick_type');
  }

  checkCartFlow(product: any) {
    this.cartInit.validate();
    switch (this.settings.cart_flow) {
      case 1:
        if (this.cart.length || product['selectedQuantity'] > 1) {
          this.message.alert('warning', `${this.translate.instant('Only One Item And Single Quantity Allowed')}!`);
          return;
        }
        break;
      case 2:
        if (this.cart.length) {
          this.message.alert('warning', `${this.translate.instant('Only One Item Can Be Added To Cart')}!`);
          return;
        }
        break;
    }
  }

  addToCart(product: any, data?: any, buy_now?: boolean) {
    this.checkCartFlow(product);
    if (this.cart.length) {
      if (this.cart[0].supplier_id != product.supplier_id && (this.settings.vendor_status == 0 || (this.settings.app_type == 8 && this.cart[0].categoryId != product.categoryId))) {
        this.message.confirm(`${this.translate.instant('Add This')} ${this.localization.transform('product')} ${this.translate.instant('To Cart')}`, `${this.translate.instant("Existing")} ${this.localization.transform('products')} ${this.translate.instant('Will Be Removed From Cart As Your Cart Has')} ${this.localization.transform('products')} ${this.translate.instant('Of Different')} ${this.localization.transform('supplier')}!`)
          .then(result => {
            if (result.value) {
              this.cart = [];
              if(data.length) {
                data.forEach(product => {
                  product['selectedQuantity'] = 0;
                });
              }
              this.addProductToCart(product);
              if (buy_now) {
                this.router.navigate(['/cart']);
              }
            }
          });
      } else if (this.cart[0].supplier_branch_id != product.supplier_branch_id && this.settings.branch_flow == 0) {
        this.message.confirm(`${this.translate.instant('Add This')} ${this.localization.transform('product')} ${this.translate.instant('To Cart')}`, `${this.translate.instant("Existing")} ${this.localization.transform('products')} ${this.translate.instant('Will Be Removed From Cart As Your Cart Has')} ${this.localization.transform('products')} ${this.translate.instant('Of Different')} ${this.localization.transform('supplier')}!`)
          .then(result => {
            if (result.value) {
              this.cart = [];
              if (!!data && data.length) {
                data.forEach(product => {
                  product['selectedQuantity'] = 0;
                });
              }
              this.addProductToCart(product);
              if (buy_now) {
                this.router.navigate(['/cart']);
              }
            }
          });
      }
      else {
        const orderPickType = this.getOrderPickType();
        if (orderPickType !== product.self_pickup) {
          if (orderPickType == 2) {
            this.setOrderPickType(product.self_pickup || 0);
          }
          const value = this.cart.findIndex(x => (x.productId || x['product_id']) == (product['product_id'] || product['productId']));
          if (value > -1 && product['customization'] && product['customization'].length) {
            product.productId = product.productId || product['product_id'];
            this.calculateSelectedProduct(product);
            this.cart[value] = product;
            this.hourlyPrice(product, value);
            this.util.setCart(this.cart);
          } else if (value > -1) {
            if (this.cart[value]['price_type']) {
              if (product['selectedQuantity'] <= 0) {
                this.removeFromCart(product);
              } else if (product['selectedQuantity'] * this.timeInterval <= product.maxHour) {
                this.cart[value]['selectedQuantity'] = product['selectedQuantity'];
                this.hourlyPrice(product, value);
              }
            } else {
              if (this.settings.is_decimal_quantity_allowed == 1) {
                let dec_quant = this.decimalRoundOff(this.cart[value]['selectedQuantity'] + this.decimalQuantityStep);
                this.cart[value]['selectedQuantity'] = dec_quant;
                product['selectedQuantity'] = dec_quant;
              } else {
                this.cart[value]['selectedQuantity']++;
                product['selectedQuantity']++;
              }
            }
            this.util.setCart(this.cart);
          } else {
            this.addProductToCart(product);
          }
          if (buy_now) {
            this.router.navigate(['/cart']);
          }

        } else {
          this.message.confirm(`${this.translate.instant('Add This Item To Cart')}`, `${this.translate.instant('Existing Items Will Be Removed From Cart As Your Cart Has Items Of Different')} ${this.localization.transform('supplier')}!`)
            .then(result => {
              if (result.value) {
                this.cart = [];
                this.setOrderPickType(product.self_pickup || 0);
                this.addProductToCart(product);
                if (buy_now) {
                  this.router.navigate(['/cart']);
                }
              }
            })
        }
      }
    } else {
      if (this.util.handler.selfPickup == 1 && product.self_pickup != 0) {
        this.setOrderPickType(1);
      } else {
        this.setOrderPickType(product.self_pickup || 0);
      }
      this.addProductToCart(product);
      if (buy_now) {
        this.router.navigate(['/cart']);
      }
    }
  }

  addProductToCart(product) {
    product['handingCharges'] = product.handling_admin + product.handling_supplier;
    product['unitId'] = product.product_id;
    product['categoryId'] = product['category_id'];
    product['selectedQuantity'] = product['selectedQuantity'] || (this.settings.is_decimal_quantity_allowed == 1 ? this.decimalQuantityStep : 1);
    this.hourlyPrice(product, -1);
    let cart = new ProductModel();
    for (let data in cart) {
      cart[data] = product[data];
    }
    cart.productId = product['product_id'] ? product['product_id'].toString() : product['productId'];
    this.cart.push(cart);
    this.util.setCart(this.cart);
    this.setCartType(product.type || this.settings.app_type);
  }

  removeFromCart(product: any) {
    this.cartInit.validate();
    if (this.cart.length) {
      const value = this.cart.findIndex(x => x.productId == (product['product_id'] || product['productId']));
      if (value > -1) {
        if (this.cart[value]['price_type']) {
          this.cart[value]['selectedQuantity'] -= this.cart[value]['duration'] / this.timeInterval;
          product['selectedQuantity'] = this.cart[value]['selectedQuantity'];
        } else {
          if (this.settings.is_decimal_quantity_allowed == 1) {
            let dec_quant = this.decimalRoundOff(this.cart[value]['selectedQuantity'] - this.decimalQuantityStep);
            this.cart[value]['selectedQuantity'] = dec_quant;
            product['selectedQuantity'] = dec_quant;
          } else {
            this.cart[value]['selectedQuantity']--;
            product['selectedQuantity']--;
          }
        }

        if (this.cart[value]['selectedQuantity'] <= 0) {
          this.cart.splice(value, 1);
          product['selectedQuantity'] = 0;
        } else {
          this.hourlyPrice(product, value);
        }
        this.util.setCart(this.cart);
      }
    }
  }

  hourlyPrice(product: any, index: number) {
    if (product['price_type']) {
      this.calculateProductHourlyPrice(product);
      if (index > -1) {
        this.cart[index]['fixed_price'] = parseFloat(product['fixed_price']);
      }
    }
  }

  calculateProductHourlyPrice(product) {
    if (product['price_type']) {
      if (product['is_product']) {
        this.timeInterval = 60;
      }
      product['hourly_price'].forEach(element => {
        if (product['selectedQuantity'] * this.timeInterval >= element['min_hour'] && product['selectedQuantity'] * this.timeInterval < element['max_hour']) {
          if (product['discount'] == 1 && element['discount_price']) {
            product['fixed_price'] = parseFloat(element['discount_price']);
            product['display_price'] = parseFloat(element['price_per_hour']);
          } else {
            product['fixed_price'] = parseFloat(element['price_per_hour']);
          }
        }
      });
    }
  }

  calculateSelectedProduct(product: any): void {
    let count = 0;
    product['customization'].forEach(data => {
      count += data.quantity;
    })

    product['selectedQuantity'] = count;
  }

  calulateProductPrice(product) {
    let netPrice = 0;

    if (product.customization && product.customization.length) {
      product.customization.forEach(item => {
        let addOnPrice = 0;
        item.data.forEach(i => {
          i.value.forEach(type => {
            addOnPrice += Number(type.price) * Number(type.adds_on_type_quantity);
          })
        })
        netPrice += (parseFloat(product.fixed_price) + addOnPrice) * item.quantity;
      })
    } else if (product['price_type']) {
      netPrice = parseFloat(product.fixed_price);
    } else {
      netPrice = parseFloat(product.fixed_price) * product.selectedQuantity;
    }

    return netPrice;
  }

  emptyCart() {
    this.util.setCart([]);
  }

  decimalRoundOff(num) {
    return Math.round(num * 100 + Number.EPSILON) / 100;
  }

  quantityInput(quantity, product){
    this.checkCartFlow(product);
    const value = this.cart.findIndex(x => (x.productId || x['product_id']) == (product['product_id'] || product['productId']));
    this.cart[value]['selectedQuantity'] = quantity;
    product['selectedQuantity'] = quantity;
  }

}
