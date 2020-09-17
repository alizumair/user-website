import { Component, OnInit, Input, OnChanges } from '@angular/core';
import _ from 'lodash';
import { Router } from '@angular/router';
import { UtilityService } from '../../../../../services/utility/utility.service';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { StyleConstants } from '../../../../../core/theme/styleConstants.model';
import { CartService } from '../../../../../services/cart/cart.service';
import { AppSettings } from './../../../../../shared/models/appSettings.model';

@Component({
  selector: 'app-re-order',
  templateUrl: './re-order.component.html'
})
export class ReOrderComponent implements OnInit, OnChanges {

  @Input() order: any;

  @Input() style: StyleVariables;

  @Input() settings: AppSettings

  reOrderButton: StyleConstants = new StyleConstants();

  constructor(
    private router: Router,
    private util: UtilityService,
    private cartService: CartService
  ) { }

  ngOnInit() {
    this.buttonStyleChange();
  }

  ngOnChanges() {
    this.buttonStyleChange();
  }

  buttonStyleChange() {
    this.reOrderButton.color = '#FFFFFF';
    this.reOrderButton.borderColor = this.style.primaryColor;
    this.reOrderButton.backgroundColor = this.style.primaryColor;
  }


  onReOrder() {
    const cart = this.mapForCart(this.order);
    this.cartService.setOrderPickType(parseInt(this.order['self_pickup']));
    this.util.setCart(cart);
    this.router.navigate(['/cart']);
  }

  mapForCart(order): Array<any> {
    let products = [];

    order.product.forEach(item => {
      if (item.adds_on && item.adds_on.length) {
        const groupObj = _.groupBy(item.adds_on, 'serial_number');
        if (Object.keys(groupObj).length) {
          const customization = [];
          let index = 0;
          for (let key in groupObj) {
            let addOns = groupObj[key];
            customization.push({
              id: ++index,
              quantity: addOns[0].quantity,
              data: this.makeCustomizationModel(addOns)
            })
          }
          item.customization = customization;
        }
        item['selectedQuantity'] = item.customization.reduce((a, b) => a + (b['quantity'] || 0), 0);
      } else {
        item['selectedQuantity'] = item['quantity'];
      }
      item['productId'] = item.product_id || item.productId;
      delete item.product_id;
      products.push(item);
    })

    return products;
  }

  makeCustomizationModel(addons: Array<any>): any {
    let list = [];
    const groupObj = _.groupBy(addons, 'adds_on_name');
    for (let key in groupObj) {
      let obj = {
        name: key,
        value: [],
        selectedCount: 1
      }

      obj.value = groupObj[key].map(item => {
        return {
          type_name: item['adds_on_type_name'],
          type_id: item['adds_on_type_jd'],
          name: key,
          id: item['adds_on_id'],
          price: item['price'],
          quantity: item['quantity'],
          adds_on_type_quantity: item['adds_on_type_quantity']
        }
      })
      list.push(obj);
    }

    return list;
  }

  //   "id":287,
  //   "cart_id":986,
  //   "adds_on_id":10,
  //   "adds_on_type_jd":18,
  //   "adds_on_name":"Topping",
  //   "adds_on_type_name":"Tomato Sauce",
  //   "price":10,
  //   "created_at":null,
  //   "updated_at":null,
  //   "quantity":1,
  //   "serial_number":1

}
