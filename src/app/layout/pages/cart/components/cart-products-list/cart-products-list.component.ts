import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy } from "@angular/core";
import { StyleVariables } from "../../../../../core/theme/styleVariables.model";
import { AppSettings } from "../../../../../shared/models/appSettings.model";
import { UtilityService } from "../../../../../services/utility/utility.service";
import { MessagingService } from "../../../../../services/messaging/messaging.service";
import { DialogService } from 'primeng/dynamicdialog';
import { CartService } from '../../../../../services/cart/cart.service';
import { LocalizationPipe } from '../../../../../shared/pipes/localization.pipe';
import { AddOnComponent } from './../../../../../layout/shared/product/components/add-on/add-on.component';
import { TranslateService } from '@ngx-translate/core';
import { GlobalVariable } from './../../../../../core/global';

@Component({
  selector: "app-cart-products-list",
  templateUrl: "./cart-products-list.component.html",
  styleUrls: ["./cart-products-list.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CartProductsListComponent implements OnInit, OnDestroy {
  @Input() products: Array<any>;

  @Input() totalItems: number = 0;

  @Input() darkTheme: boolean = false;

  @Input() style: StyleVariables;
  @Input() settings: AppSettings;

  decimalQuantityStep: number = GlobalVariable.decimal_quantity_step;

  constructor(
    public util: UtilityService,
    private cartService: CartService,
    private message: MessagingService,
    private dialogService: DialogService,
    private localization: LocalizationPipe,
    private translate: TranslateService
  ) { }

  ngOnInit(): void { }

  openAddOnDialog(product) {
    const dialogRef = this.dialogService.open(AddOnComponent, {
      header: product['name'],
      width: '50%',
      showHeader: false,
      // contentStyle: { "max-height": "350px", "overflow": "auto" },
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      data: {
        product: Object.assign({}, product),
        addOnItems: product['adds_on']
      }
    })

    dialogRef.onClose.subscribe(() => { });
  }

  add(product: any, index: any): void {
    if (product['customization'] && product['customization'].length) {
      return this.openAddOnDialog(product);
    } else {
      if (product.selectedQuantity >= (Number(product.quantity) - Number(product.purchased_quantity))) {
        this.message.alert('info', this.translate.instant('Maximum Limit Reached'));
        return;
      }
      if (product['price_type']) {
        product.selectedQuantity += product.duration / this.settings.interval;
        this.cartService.calculateProductHourlyPrice(product);
      } else {
        if (this.settings.is_decimal_quantity_allowed == 1) {
          this.products[index].selectedQuantity = this.cartService.decimalRoundOff(this.products[index].selectedQuantity + this.decimalQuantityStep);
        } else {
          this.products[index].selectedQuantity++;
        }
      }
      this.setCart();
    }
  }

  mins(product: any, index: any) {
    const minQty: number = product['price_type'] ? product.duration / this.settings.interval : (this.settings.is_decimal_quantity_allowed == 1 ? this.decimalQuantityStep : 1);
    if (product.selectedQuantity > minQty) {
      if (product['customization'] && product['customization'].length) {
        return this.openAddOnDialog(product);
      } else {
        if (product['price_type']) {
          product.selectedQuantity -= product.duration / this.settings.interval;
          this.cartService.calculateProductHourlyPrice(product);
        } else {
          if (this.settings.is_decimal_quantity_allowed == 1) {
            this.products[index].selectedQuantity = this.cartService.decimalRoundOff(this.products[index].selectedQuantity - this.decimalQuantityStep);
          } else {
            this.products[index].selectedQuantity--;
          }
        }
        this.setCart();
      }
    } else {
      this.message.confirm(`${this.translate.instant('Remove This')} ${this.localization.transform('product')}`, `${this.translate.instant('This')} ${this.localization.transform('product')} ${this.translate.instant('Will Get Removed From The Cart')}.`, true)
        .then(result => {
          if (result.value) {
            if (this.settings.is_decimal_quantity_allowed == 1) {
              this.products[index].selectedQuantity = this.cartService.decimalRoundOff(this.products[index].selectedQuantity - this.decimalQuantityStep);
            } else {
              this.products[index].selectedQuantity -= minQty;
            }
            if (this.products[index].selectedQuantity == 0) {
              this.products.splice(index, 1);
            }
            this.util.clearLocalData('ques_data');
            this.setCart();
          }
        });
    }
  }

  updateCustomizationQuantity($event: any, productIndex: any) {
    const custId = $event.id;
    const quantity = $event.value;
    const product = this.products[productIndex];
    if (quantity > 0 && product.selectedQuantity >= (Number(product.quantity) - Number(product.purchased_quantity))) {
      this.message.alert('info', this.translate.instant('Maximum Limit Reached'));
      return;
    }
    let item = product.customization.find(item => item.id == custId);

    let qty_to_set = 0;
    if (this.settings.is_decimal_quantity_allowed == 1) {
      let calculated_quantity = 0;
      if ($event.remove) {
        calculated_quantity = item.quantity + quantity;
      } else {
        calculated_quantity = item.quantity + (this.decimalQuantityStep * quantity);
      }
      qty_to_set = this.cartService.decimalRoundOff(calculated_quantity);
    } else {
      qty_to_set = item.quantity + quantity;
    }

    if (qty_to_set <= 0) {
      // let _addons = product.customization.filter(
      //   item => item.quantity > 0
      // );
      // if (_addons.length < 1) {
        this.removeFromCart(productIndex);
      // } else {
      //   this.setProductCart(product);
      //   // this.totalPrice = this.cartService.calulateProductPrice(this.product);
      // }
    } else {
      item.quantity = qty_to_set;
      this.setProductCart(product);
      // this.totalPrice = this.cartService.calulateProductPrice(this.product);
    }
  }

  setProductCart(product: any) {
    this.cartService.addToCart(product);
  }

  setCart(): void {
    this.util.setCart(this.products);
  }

  removeFromCart(index: any) {
    this.message
      .confirm(`${this.translate.instant('Remove This')} ${this.localization.transform('product')}`, `${this.translate.instant('This')} ${this.localization.transform('product')} ${this.translate.instant('Will Get Removed From The Cart')}.`, true)
      .then(data => {
        if (data.value) {
          this.products.splice(index, 1);
          this.setCart();
          this.util.clearLocalData('ques_data');
        }
      });
  }

  ngOnDestroy(): void { }
}
