import { Subscription } from 'rxjs';
import { CartService } from './../../../services/cart/cart.service';
import { MessagingService } from './../../../services/messaging/messaging.service';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../shared/models/appSettings.model';
import { UtilityService } from './../../../services/utility/utility.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { QuestionsComponent } from '../../shared/layout-shared/components/questions/questions.component';
import { AddOnComponent } from '../../shared/product/components/add-on/add-on.component';

@Component({
  selector: 'app-top-deals',
  templateUrl: './top-deals.component.html',
  styleUrls: ['./top-deals.component.scss']
})
export class TopDealsComponent implements OnInit, OnDestroy {

  cart: Array<any> = [];

  cartSubscription: Subscription;

  slideConfig = {
    "slidesToShow": 3,
    "slidesToScroll": 1,
    "dots": false,
    "arrows": true,
    "infinite": true,
    "autoplay": true,
    "autoplaySpeed": 3000,
    "responsive": [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }]
  };

  @Input() products: Array<any> = [];
  @Input() settings: AppSettings;
  @Input() style: StyleVariables;

  constructor(
    private utilityService: UtilityService,
    private cartService: CartService,
    private message: MessagingService,
    public dialogService: DialogService,
  ) { }


  ngOnInit() {
    this.cartSubscription = this.utilityService.getCart.subscribe(cart => {
      if (cart) {
        this.cart = cart;
        this.mapData();
      }
    });

    this.mapData();
  }

  mapData() {
    this.products.map((offer: any) => {
      offer['avg_rating'] = Number.parseFloat(offer['avg_rating']).toFixed(1);
      offer['image'] = this.utilityService.thumbnail(offer['image_path']);
      offer["selectedQuantity"] = 0;
      if (this.cart.length) {
        this.cart.forEach(cartProduct => {
          if (cartProduct.productId == offer.product_id) {
            offer['selectedQuantity'] = cartProduct['selectedQuantity'];
          }
        });
      }
      if (offer['price_type']) {
        offer['maxHour'] = offer['hourly_price'][offer['hourly_price'].length - 1]['max_hour'] - this.settings.interval;
        if (offer['discount'] && offer['hourly_price'][0]['discount_price']) {
          offer['fixed_price'] = offer['hourly_price'][0]['discount_price'];
          offer['display_price'] = offer['hourly_price'][0]['price_per_hour'];
          offer['discount_price'] = Math.round(((offer['hourly_price'][0]['price_per_hour'] - offer['hourly_price'][0]['discount_price']) / offer['hourly_price'][0]['price_per_hour']) * 100);
          offer["discountPercentage"] = parseFloat((((offer.display_price - offer.fixed_price) / offer.display_price) * 100).toFixed(2));
        } else {
          offer['fixed_price'] = offer['hourly_price'][0]['price_per_hour'];
        }
      } else {
        this.utilityService.productPriceToFloat(offer);
        offer["discountPercentage"] = parseFloat((((offer.display_price - offer.fixed_price) / offer.display_price) * 100).toFixed(2));
        offer["discount"] = Math.round(offer.discountPercentage);
      }
    });
  }

  decreaseValue(product: any) {
    if (product.selectedQuantity <= 0) {
      return;
    }
    this.removeProduct(product);
  }

  increaseValue(product: any) {
    if (this.utilityService.getLocalData('cart_type', true) != product.type) {
      this.utilityService.setCart([]);
    }

    if (product.selectedQuantity >= (Number(product.quantity) - Number(product.purchased_quantity))) {
      this.message.alert('info', 'Maximum Limit Reached');
      return;
    }

    if (this.utilityService.handler.selfPickup !== product['self_pickup'] && product['self_pickup'] !== 2 && this.settings.app_type == 1) {
      this.message.alert('info', `This Product is not available for  ${this.utilityService.handler.selfPickup ? 'self pickup' : 'delivery'}`);
      return;
    }

    this.addProduct(product);
  }

  openAddOnDialog(product) {
    let item = this.cart.find(p => p.productId == product.product_id);
    if (item) {
      product.customization = item.customization;
    }

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

    dialogRef.onClose.subscribe(() => {
      if (product.customization && product.customization.length) {
        delete product.customization;
      }
    })
  }

  addProduct(product) {
    const category = this.utilityService.getLocalData('selected_category', true) || {};
    category.type = product.type;
    this.utilityService.setLocalData('selected_category', category, true);

    if (product.adds_on && product.adds_on.length && this.settings.app_type == 1) {
      this.openAddOnDialog(product);
    } else {
      this.cartService.addToCart(product);
      return;
    }
  }

  removeProduct(product) {
    let item = this.cart.find(p => p.productId == product.product_id);
    if (item['customization'] && item['customization'].length) {
      this.openAddOnDialog(product);
    } else {
      this.cartService.removeFromCart(product)
    }
  }


  openQuestions(product: any): void {
    const dialogRef = this.dialogService.open(QuestionsComponent, {
      width: '60%',
      showHeader: false,
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      data: {
        cat_id: product['detailed_sub_category_id'] || product['sub_category_id'] || product['categories_id'] || product['category_id'],
      }
    });

    dialogRef.onClose.subscribe((navigate: boolean) => {
      if (navigate) {
        this.addToCart(product);
      }
    });
  }

  addToCart(product: any) {
    if (product['price_type']) {
      product.selectedQuantity += product.duration / this.settings.interval;
    }
    this.cartService.addToCart(product, null, true);
  }

  onBookNow(product: any): void {
    const category = this.utilityService.getLocalData('selected_category', true) || {};
    category.type = product.type;
    this.utilityService.setLocalData('selected_category', category, true);

    this.utilityService.clearLocalData('ques_data');
    this.cartService.emptyCart();

    if (product.is_question) {
      this.openQuestions(product);
    } else {
      this.addToCart(product);
    }
  }

  ngOnDestroy(): void {
    if (!this.cartSubscription) this.cartSubscription.unsubscribe();
  }
}
