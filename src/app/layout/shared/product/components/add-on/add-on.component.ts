import { GlobalVariable } from "./../../../../../core/global";
import { MessagingService } from "./../../../../../services/messaging/messaging.service";
import { CartService } from "./../../../../../services/cart/cart.service";
import { UtilityService } from "./../../../../../services/utility/utility.service";
import { AddOnModel } from "./../../../../../shared/models/addOn.model";
import { AppSettings } from "./../../../../../shared/models/appSettings.model";
import { StyleConstants } from "./../../../../../core/theme/styleConstants.model";
import { StyleVariables } from "./../../../../../core/theme/styleVariables.model";
import { PaginationModel } from "./../../../../../shared/models/pagination.model";
import { Component, OnInit } from "@angular/core";
import { DynamicDialogRef, DynamicDialogConfig } from "primeng/dynamicdialog";
import * as _ from "underscore";
import { Subscription } from "rxjs";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-add-on",
  templateUrl: "./add-on.component.html",
  styleUrls: ["./add-on.component.scss"]
})
export class AddOnComponent implements OnInit {
  // @Input()
  //  closeMe: boolean = false;

  view: "customize" | "quantity" = "customize";

  private styleSubscription: Subscription;

  pagination: PaginationModel;
  style: StyleVariables;
  btnInverse: StyleConstants;
  btn: StyleConstants;
  settings: AppSettings;

  addOnItems: Array<AddOnModel>;
  product: any;
  currency: string = "";

  totalPrice: number = 0;
  customizePrice: number = 0;

  customizeItems: any = [];

  isDialogClose: boolean = false;
  siteName: string = "";

  decimalQuantityStep: number = GlobalVariable.decimal_quantity_step;

  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private util: UtilityService,
    private cartService: CartService,
    private message: MessagingService,
    private translate: TranslateService
  ) {
    this.currency = GlobalVariable.CURRENCY;
    this.siteName = GlobalVariable.SITE_NAME;
    this.pagination = new PaginationModel();
    this.btnInverse = new StyleConstants();
    this.btn = new StyleConstants();
  }

  ngOnInit() {
    this.util.getSettings.subscribe((settings: AppSettings) => {
      this.settings = settings;
    });

    this.styleSubscription = this.util.getStyles.subscribe(style => {
      this.style = style;
      this.btnInverse.color = style.primaryColor;
      this.btnInverse.backgroundColor = "#ffffff";
      this.btnInverse.borderColor = style.primaryColor;
      this.btn.color = "#ffffff";
      this.btn.backgroundColor = style.primaryColor;
      this.btn.borderColor = style.primaryColor;
    });

    this.addOnItems = this.config.data["addOnItems"];
    this.product = this.config.data["product"];

    this.product.customization = this.product.customization || [];

    this.view = this.product.selectedQuantity >= 1 ? "quantity" : "customize";

    this.addOnItems.forEach(item => {
      item.selectedCount = 0;
      item.value.forEach(type => {
        if (type.is_default == "1") {
          type.isSelected = true;
          if (this.siteName !== "ZipEats") {
            item.selectedCount = this.settings.is_decimal_quantity_allowed == 1 ? item.selectedCount + GlobalVariable.decimal_quantity_step : item.selectedCount++;
          }
          type.adds_on_type_quantity = 0;
        } else {
          type.adds_on_type_quantity = this.settings.is_decimal_quantity_allowed == 1 ? GlobalVariable.decimal_quantity_step : 1;
          type.isSelected = false;
        }
      });
    });

    this.calculatePrice();

    if (this.product.selectedQuantity >= 1) {
      this.totalPrice = this.cartService.calulateProductPrice(this.product);
    }
  }

  calculatePrice() {
    this.customizePrice = Number(this.product.fixed_price);

    this.customizeItems = [];

    this.addOnItems.forEach(item => {
      let value = [
        ...item.value
          .filter(type => type.isSelected)
          .map(type => Object.assign({}, type))
      ];

      if (value && value.length) {
        value.forEach(type => delete type.isSelected);
        const obj: any = Object.assign({}, item);
        obj.value = value;
        this.customizeItems.push(obj);
      }
    });

    this.customizeItems.forEach(item => {
      item.value.forEach(type => {
        this.customizePrice =
          this.customizePrice +
          Number(type.price) * Number(type.adds_on_type_quantity);
      });
    });
  }

  /******************** radio btn ****************************/
  singleSelection(selectedType, item): void {
    item.selectedCount = 0;
    let selectedValue = item.value.find(type => type.isSelected == true);
    if (selectedValue && selectedValue["type_id"] == selectedType["type_id"]) {
      item.value.forEach(type => {
        type.isSelected = false;
      });
    } else {
      item.value.forEach(type => {
        if (selectedType["type_id"] == type["type_id"]) {
          type.isSelected = true;
          item.selectedCount = item.selectedCount + type.adds_on_type_quantity;
        } else {
          type.isSelected = false;
        }
      });
    }
    this.calculatePrice();
  }

  /******************** checkbox btn ****************************/
  multiSelection(checked, type, item): void {
    type.isSelected = checked;
    item.selectedCount = 0;
    type.adds_on_type_quantity = checked ? 1 : 0;
    item.value.forEach(addOn => {
      if (addOn.isSelected == true) {
        item.selectedCount = item.selectedCount + addOn.adds_on_type_quantity;
      }
    });
    this.calculatePrice();
  }

  /*
   To update the quantity of selected product
  */

  selectCounter(check, type, item): void {
    type.adds_on_type_quantity = check
      ? type.adds_on_type_quantity + 1
      : type.adds_on_type_quantity - 1;
    item.selectedCount = check
      ? item.selectedCount + 1
      : item.selectedCount - 1;
    this.calculatePrice();
  }

  updateQuantity(id, val): void {
    if (
      val > 0 &&
      this.product.selectedQuantity >=
      Number(this.product.quantity) - Number(this.product.purchased_quantity)
    ) {
      this.message.toast(
        "info",
        this.translate.instant("Maximum Limit Reached")
      );
      return;
    }
    let item = this.product.customization.find(item => item.id == id);
    if (this.settings.is_decimal_quantity_allowed == 1) {
      item.quantity = this.decimalRoundOff(item.quantity + (this.decimalQuantityStep * val));
    } else {
      item.quantity += val;
    }
    if (item.quantity <= 0) {
      this.product.customization = this.product.customization.filter(
        item => item.quantity !== 0
      );
      if (this.product.customization.length < 1) {
        this.view = "customize";
        this.cartService.removeFromCart(this.product);
      } else {
        this.cartService.addToCart(this.product);
        this.totalPrice = this.cartService.calulateProductPrice(this.product);
      }
    } else {
      this.cartService.addToCart(this.product);
      this.totalPrice = this.cartService.calulateProductPrice(this.product);
    }
  }

  comparsion(): void {
    if (this.product.customization && this.product.customization.length) {
      let similarItem = this.product.customization.find(item =>
        _.isEqual(item.data, this.customizeItems)
      );

      if (!similarItem) {
        this.product.customization.push({
          id: this.product.customization.length + 1,
          quantity: this.settings.is_decimal_quantity_allowed == 1 ? GlobalVariable.decimal_quantity_step : 1,
          data: this.customizeItems
        });
      } else {
        if (this.settings.is_decimal_quantity_allowed == 1) {
          similarItem.quantity = this.decimalRoundOff(similarItem.quantity + this.decimalQuantityStep);
        } else {
          similarItem.quantity += 1;
        }
      }
    } else {
      this.product.customization = [
        {
          id: this.product.customization.length + 1,
          quantity: this.settings.is_decimal_quantity_allowed == 1 ? GlobalVariable.decimal_quantity_step : 1,
          data: this.customizeItems
        }
      ];
    }
  }

  /** add product to cart */
  addToCart(): void {
    let isMandatory: boolean = false;

    for (let item of this.addOnItems) {
      let addon = item.value.find(addon => addon.isSelected);
      if (item.value[0].is_mandatory && item.value[0].is_mandatory == "1" && !addon) {
        this.message.toast(
          "info",
          `${this.translate.instant("Please Select Item In")} ${item.name}`
        );
        isMandatory = true;
        break;
      }
    }

    if (isMandatory) return;

    if (
      this.product.selectedQuantity >=
      Number(this.product.quantity) - Number(this.product.purchased_quantity)
    ) {
      this.message.toast(
        "info",
        this.translate.instant("Maximum Limit Reached")
      );
      return;
    }
    let isMinSelect = false;

    // if (this.siteName == "ZipEats") {
    this.addOnItems.forEach(item => {
      let mincount = 0;
      if (!isMinSelect) {
        item.value.forEach(custom => {
          if (custom.isSelected && custom.is_default == "0") {
            mincount = mincount + 1;
          }
        });

        if (item.selectedCount < item.value[0].min_adds_on && item.value[0]["is_multiple"] == 1) {
          isMinSelect = true;
          this.message.toast(
            "info",
            `Please select atleast ${item.value[0].min_adds_on} items in ${item.name}`
          );
          return;
        }

        if (item.value[0]["is_multiple"] == 1 && item.value[0]['min_adds_on'] > 0 && item.selectedCount == 0 && this.settings.addon_type_quantity == 1) {
          isMinSelect = true;
          this.message.toast(
            "info",
            `Please select atleast 1 item in ${item.name}`
          );
          return;
        }
      }
    });
    if (isMinSelect) {
      return;
    }
    // }
    this.comparsion();
    this.cartService.addToCart(this.product);
    this.close(true);
  }

  getCustomDetail(customize: any): string {
    let str = "";
    let types = [];
    customize.data.forEach(i => {
      const typeNames = i.value
        .map(el => el.type_name)
        .toString()
        .replace(/,/g, ", ");
      types.push(`${i.name}: ${typeNames}`);
    });
    str = types.toString().replace(/,/g, ", ");
    return str;
  }

  getCustomePrice(customize: any): number | string {
    let totalPrice: number = parseFloat(this.product.fixed_price) || 0;

    let addOnPrice: number = 0;
    customize.data.forEach(i => {
      i.value.forEach(type => {
        addOnPrice +=
          parseFloat(type.price) * Number(type.adds_on_type_quantity);
        this.customizePrice +=
          Number(type.price) * Number(type.adds_on_type_quantity);
      });
    });

    return ((totalPrice + addOnPrice) * customize.quantity).toFixed(this.settings.price_decimal_length);
  }

  close(addedToCart?: boolean): void {
    this.isDialogClose = true;
    this.dialogRef.close(addedToCart);
  }

  decimalRoundOff(num) {
    return Math.round(num * 100 + Number.EPSILON) / 100;
  }

  ngOnDestroy(): void {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
  }
}
