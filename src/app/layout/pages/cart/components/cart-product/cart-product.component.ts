import { Router } from '@angular/router';
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy
} from "@angular/core";
import { StyleVariables } from "../../../../../core/theme/styleVariables.model";
import { AppSettings } from "../../../../../shared/models/appSettings.model";
import { UtilityService } from "../../../../../services/utility/utility.service";
import { GlobalVariable } from './../../../../../core/global';
import { MessagingService } from '../../../../../services/messaging/messaging.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: "app-cart-product",
  templateUrl: "./cart-product.component.html",
  styleUrls: ["./cart-product.component.scss"]
})
export class CartProductComponent implements OnInit, OnChanges, OnDestroy {
  @Input() product: any;

  @Input() style: StyleVariables;

  @Input() settings: AppSettings;

  @Output() onPlus: EventEmitter<any> = new EventEmitter<any>();

  @Output() onMins: EventEmitter<any> = new EventEmitter<any>();

  @Output() remove: EventEmitter<any> = new EventEmitter<any>();

  @Output() onCustomizationUpdate: EventEmitter<any> = new EventEmitter<any>();

  timeInterval: number = 0;
  currency: string = "";


  constructor(
    private router: Router,
    private util: UtilityService,
    private message: MessagingService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.settings.currentValue) {
      this.settings = changes.settings.currentValue;
      this.timeInterval = this.settings['interval'];
    }
  }

  onRemove(): void {
    this.remove.emit();
  }

  increaseQuantity(): void {
    if (this.product.selectedQuantity >= this.product.quantity ||
      this.product.selectedQuantity * this.timeInterval >= this.product.maxHour) {
      this.message.alert('info', this.translate.instant('Maximum Limit Reached'));
      return;
    }
    this.onPlus.emit();
  }

  decreaseQuantity(): void {
    if (this.product.selectedQuantity == 0) { return; }
    this.onMins.emit();
  }

  updateQuantity(id, value, remove) {
    this.onCustomizationUpdate.emit({ id, value, remove });
  }

  addOnNames(values): string {
    return values.map((addon) => ` ${addon.type_name} * ${addon.is_default == '1' ? '1' : addon.adds_on_type_quantity}`).toString();
  }

  getAddonProductPrice(productPrice, addons: Array<any>): string {
    let amount = parseFloat(productPrice);
    if (!addons && !addons.length) { return amount.toFixed(this.settings.price_decimal_length); };
    addons.forEach(item => {
      // amount += item.value.reduce((a, { price }) => a + parseFloat(price), 0)
      item.value.forEach(element => {
        amount = amount + (Number(element.price) * Number(element.adds_on_type_quantity))
      });
    })
    return amount.toFixed(this.settings.price_decimal_length);
  }

  onSupplier(supplierId: string): void {
    if (this.settings.app_type == 1)
      this.router.navigate(['products', 'listing'], { queryParams: { supplierId: supplierId } });
  }

  productDetail(data: any) {  
    if (this.settings.app_type != 1 || this.settings.product_detail == 1) {
      let obj = {
        productId: data.unitId || data.id,
        supplierBranchId: data.supplier_branch_id,
        category: data.categoryId
      };
      data.name = data.name.replace(/ &/g, "-");
      obj = { ...this.util.handler, ...obj };
      this.router.navigate(["/", "products", "product-detail", data.name], {
        queryParams: { f: this.util.encryptData(obj) }
      });
    }
  }

  ngOnDestroy(): void {

  }
}
