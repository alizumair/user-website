import { HttpService } from './../../../../../../services/http/http.service';
import { ApiUrl } from './../../../../../../core/apiUrl';
import { TranslateService } from '@ngx-translate/core';
import { LocalizationPipe } from './../../../../../../shared/pipes/localization.pipe';
import { GlobalVariable } from './../../../../../../core/global';
import { CartService } from './../../../../../../services/cart/cart.service';
import { MessagingService } from './../../../../../../services/messaging/messaging.service';
import { UtilityService } from './../../../../../../services/utility/utility.service';
import { AppSettings } from './../../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../../core/theme/styleVariables.model';
import { DialogService } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';
import { DescriptionComponent } from './../../description/description.component';
import { Input, Output, EventEmitter, Component } from '@angular/core';

@Component({
    selector: 'app-base-product',
    template: '',
    styleUrls: []
  })
  export class BaseProduct {

    @Input() product: any;

    @Input() style: StyleVariables;

    @Input() settings: AppSettings;

    @Input() darkTheme: boolean;

    @Input() loggedIn: boolean = false;

    @Input() state: any = {};

    // @Input() isEditOrder: boolean = false;

    @Output() add: EventEmitter<any> = new EventEmitter<any>();

    @Output() remove: EventEmitter<any> = new EventEmitter<any>();

    @Output() onFavourite: EventEmitter<boolean> = new EventEmitter<boolean>();

    currency: string = "";

    isOutOfStock: boolean = false;

    timeInterval: number = 0;

    constructor(
        public http: HttpService,
        public util: UtilityService,
        public router: Router,
        public message: MessagingService,
        public cartService: CartService,
        public dialogService: DialogService,
        public localization: LocalizationPipe,
        public translate: TranslateService
    ) {
        this.style = new StyleVariables();
    }

    ngOnInit(): void {
        this.currency = GlobalVariable.CURRENCY;
    }

    ngOnChanges(): void {
        let quantity = Number(this.product.quantity);
        let purchaseQuantity = Number(this.product.purchased_quantity);

        if (purchaseQuantity >= quantity || this.product.item_unavailable == 1) {
            this.isOutOfStock = true;
        }
    }

    /******************** On Original Image Load *********************/
    onImageLoad(product): void {
        product.image = product.image_path || product['product_image'];
    }

    /******************** Product Detail *********************/
    productDetail(data: any) {
        if (this.settings.app_type != 1 || this.settings.product_detail == 1) {
            let obj = {
                productId: data.parent_id || data.product_id,
                supplierBranchId: data.supplier_branch_id,
                category: data.category_id
            };
            data.name = data.name.replace(/ &/g, "-");
            obj = { ...this.util.handler, ...obj };
            this.router.navigate(["/", "products", "product-detail", data.name], {
                queryParams: { f: this.util.encryptData(obj) }
            });
        }
    }

    /******************** Decrease Quantity *********************/
    decreaseValue(): void {
        if (this.product.selectedQuantity <= 0) {
            return;
        }
        this.remove.emit(this.product);
    }

    /******************** Increase Quantity *********************/
    increaseValue(): void {
        if (this.product.selectedQuantity >= (Number(this.product.quantity) - Number(this.product.purchased_quantity))) {
            this.message.alert('info', this.translate.instant('Maximum Limit Reached'));
            return;
        }

        if (this.product['self_pickup'] && this.util.handler.selfPickup !== this.product['self_pickup'] && this.product['self_pickup'] !== 2 && this.settings.app_type == 1) {
            this.message.alert('info', `${this.translate.instant('This')} ${this.localization.transform('product')} ${this.translate.instant('Is Not Available For')}  ${this.util.handler.selfPickup ? this.translate.instant('Self Pickup') : this.translate.instant('Delivery')}`);
            return;
        }
        this.add.emit(this.product);
        this.addProductToDataLayer();
    }

    addProductToDataLayer() {
        const prodToAddInDL = {

        }
        // this.util.addToDatalayer()
    }

    /******************** Add Item To Cart *********************/
    addToCart(): void {
        if (this.product['price_type']) {
            this.product.selectedQuantity += this.product.duration / this.settings.interval;
        }
        this.cartService.addToCart(this.product, null, true);
    }

    porductDescription() {
        const dialogRef = this.dialogService.open(DescriptionComponent, {
            dismissableMask: true,
            width: '40%',
            showHeader: false,
            transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
            data: {
                description: this.product.product_desc,
            }
        });
    }

    wishlist(status, detail) {
        if (!this.loggedIn) {
            this.message.alert('warning', this.translate.instant('Please Login First'));
            return;
        }
        let param_data = {
            status: +status,
            product_id: detail['product_id']
        }
        this.http.postData(ApiUrl.addToWishlist, param_data, true)
            .subscribe(response => {
                if (!!response && response.data) {
                    this.message.toast('success', `${this.localization.transform('product')} ${this.translate.instant('Has Been Successfully')} ${status ? this.translate.instant('Added To') : this.translate.instant('Removed From')} ${this.translate.instant('Wishlist')}`);
                    this.product.is_favourite = status;
                    this.onFavourite.emit(this.product.is_favourite);
                }
            });
    }

    quantityUpdate(event) {
        this.cartService.quantityInput(event, this.product);
    }

}
