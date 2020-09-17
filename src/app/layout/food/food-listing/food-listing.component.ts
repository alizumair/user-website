import { SeoService } from './../../../services/seo/seo.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalVariable } from './../../../core/global';
import { Component, OnInit, OnDestroy, Inject, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, from } from 'rxjs';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { UtilityService } from './../../../services/utility/utility.service';
import { HttpService } from './../../../services/http/http.service';
import { ApiUrl } from './../../../core/apiUrl';
import { AppSettings } from './../../../shared/models/appSettings.model';
import { MessagingService } from './../../../services/messaging/messaging.service';
import * as _ from 'underscore'
import { DateService } from './../../../services/date/date.service'
import { UserService } from './../../../services/user/user.service';
import { CartService } from './../../../../app/services/cart/cart.service';
import { WINDOW } from './../../../services/window/window.service';
import { DOCUMENT } from "@angular/common";
import { DialogService } from 'primeng/dynamicdialog';
import { LocalizationPipe } from './../../../shared/pipes/localization.pipe';
import * as moment from 'moment'
import { trigger, transition, style, animate } from '@angular/animations';
import { AddOnComponent } from '../../shared/product/components/add-on/add-on.component';
import { PrescriptionUploadComponent } from '../../shared/layout-shared/components/prescription-upload/prescription-upload.component';

@Component({
    selector: 'app-food-listing',
    templateUrl: './food-listing.component.html',
    styleUrls: ['./food-listing.component.scss'],
    animations: [
        trigger('fade', [
            transition('void => *', [
                style({ opacity: 0 }),
                animate('500ms ease-in-out', style({ opacity: 1 }))
            ])
        ])
    ]
})
export class FoodListingComponent implements OnInit, OnDestroy {

    styleSubscription: Subscription;
    settingsSubscription: Subscription;
    routeSubscription: Subscription;
    cartSubscription: Subscription;
    userSubscription: Subscription;
    getDataSubscription: Subscription;
    themeSubscription: Subscription;

    style: StyleVariables;
    settings: AppSettings;

    products: Array<any> = [];
    allProducts: Array<any> = [];
    supplierDetail: any = {};
    cart: Array<any> = [];

    currency: string = '';
    supplierId: string = '';
    branchId: string = '';
    search: string = '';
    tabOffset: number = 0;

    loggedIn: boolean = false;
    hoverIndex: number = -1;
    categoryIndex: number = 0;

    pagePosition: object = {};

    isDarkTheme: boolean = false;

    productstate: any = {
        hideSupplier: true
    }

    isLoading: boolean = true;

    category_names: string = '';
    cat_nav_fixed: boolean = false;
    showBranches: boolean = false;
    // isBranch: boolean = false;

    public schedulingData: {};
    public showScheduleTime: boolean;
    public currentUser: any = {};
    public isTbItem: boolean;


    constructor(
        private translate: TranslateService,
        private util: UtilityService,
        private http: HttpService,
        private route: ActivatedRoute,
        private message: MessagingService,
        private user: UserService,
        public cartService: CartService,
        public dialogService: DialogService,
        private localization: LocalizationPipe,
        private dateService: DateService,
        private seo: SeoService,
        private router: Router,
        @Inject(DOCUMENT) private document,
        @Inject(WINDOW) private window: Window) {

        this.userSubscription = this.user.currentUser
            .subscribe(user => {
                this.currentUser = user;
                if (!!user && user['access_token']) {
                    this.loggedIn = true;
                } else {
                    this.loggedIn = false;
                }
            });

        this.currency = GlobalVariable.CURRENCY;
    }

    @HostListener("window:scroll", [])
    onWindowScroll() {

        if (this.settings.selected_template == 1 && this.products.length > 1) {
            if (Math.ceil(this.window.pageYOffset) >= 500) this.cat_nav_fixed = true;
            else this.cat_nav_fixed = false;
        }

        for (let key in this.pagePosition) {
            this.pagePosition[key] = this.document.getElementById(key)
                ? this.pagePosition[key] < (this.document.getElementById(key).offsetTop - 180) ? this.document.getElementById(key).offsetTop - 180 : this.pagePosition[key]
                : null;
        }

        const positions = Object.keys(this.pagePosition);
        const lastIndex = positions.length - 1;
        let deduction_pixels = this.settings.selected_template == 1 ? -60 : 620;
        const offset = this.window.pageYOffset - deduction_pixels;

        for (let index = 0; index < positions.length; index++) {
            if (index === 0) {
                if (this.pagePosition[`${positions[index]}`] !== undefined &&
                    offset < this.pagePosition[`${positions[index + 1]}`]) {
                    this.categoryIndex = index;
                    break;
                } else { continue; }
            } else if (index === lastIndex) {
                if (this.pagePosition[`${positions[lastIndex]}`] &&
                    offset > this.pagePosition[`${positions[lastIndex]}`]) {
                    this.categoryIndex = lastIndex;
                    break;
                } else {
                    continue;
                }
            } else {
                if (this.pagePosition[`${positions[index]}`]
                    && offset > this.pagePosition[`${positions[index]}`] &&
                    offset < this.pagePosition[`${positions[index + 1]}`]) {
                    this.categoryIndex = index;
                    break;
                }
            }
        }
    }

    ngOnInit() {
        this.styleSubscription = this.util.getStyles
            .subscribe((style: StyleVariables) => {
                this.style = style;
            });

        this.getSettings();

        this.cartSubscription = this.util.getCart.subscribe(cart => {
            if (cart) {
                this.cart = cart;
            }
        });

        this.themeSubscription = this.util.getDarkTheme.subscribe((darkTheme) => {
            this.isDarkTheme = darkTheme;
        });
    }

    getSettings() {
        this.settingsSubscription = this.util.getSettings
            .subscribe((settings: AppSettings) => {
                if (settings) {
                    this.settings = settings;
                    this.subscribeRoute();
                }
            });
    }

    /********* Route Subscription **********/
    subscribeRoute() {
        this.routeSubscription = this.route.queryParams
            .subscribe(params => {
                this.supplierId = params.supplierId ? params.supplierId : '';
                this.branchId = params.branchId ? params.branchId : '';
                if (this.branchId) {
                    this.showBranches = false;
                }
                if (params.action == "tb_item") {
                    this.isTbItem = true;
                }
                else {
                    if (localStorage.getItem('table_booking_details')) {
                        this.util.clearLocalData('table_booking_details');
                    }
                }
                this.getDetails();
            });
    }

    updateProduct(product) {
        product['avg_rating'] = Number.parseFloat(product['avg_rating']).toFixed(1);
        if (product.display_price != product.fixed_price) {
            product["discount"] = Math.round(
                ((product.display_price - product.fixed_price) / product.display_price) * 100
            );
        }
        product["selectedQuantity"] = 0;
        if (this.cart.length) {
            this.cart.forEach(cartProduct => {
                if (cartProduct.productId == product.product_id) {
                    product['selectedQuantity'] = cartProduct['selectedQuantity'];
                    product['customization'] = cartProduct['customization'];
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
        let api = '';
        if (this.settings.branch_flow == 1 && this.branchId) {
            param_data['supplier_branch_id'] = this.branchId;
            api = ApiUrl.getSupplierBranchProduct;
        } else {
            api = ApiUrl.getSupplierDetailProduct;
        }
        this.http.getData(api, param_data)
            .subscribe(response => {
                if (!!response && response.data) {
                    this.allProducts = response.data.product;
                    this.supplierDetail = response.data.supplier_detail;
                    if (this.settings.branch_flow == 1 && this.supplierDetail.is_multi_branch) {
                        this.showBranches = true;
                    }
                    this.seo.updateTitle(`${this.supplierDetail.name} | ${GlobalVariable.SITE_NAME}`);
                    this.seo.updateDescription(this.supplierDetail.address);

                    if (this.settings.app_type == 1 && this.settings.selected_template == 1) {
                        let cat_names = [];
                        (this.allProducts).forEach(ct => {
                            cat_names.push(ct.sub_cat_name)
                        });
                        this.category_names = (cat_names.splice(0, 6)).join(', ');
                    }

                    if (this.supplierDetail['supplier_image'].length) {
                        this.supplierDetail['supp_image'] = this.supplierDetail['supplier_image'][0];
                        this.supplierDetail.isVideo = (this.supplierDetail['supplier_image'][0].split('.').pop()).includes('mp4')
                    }
                    this.todaySupplierTimings();
                    if (!this.showBranches) {
                        this.allProducts.forEach(data => {
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

                        this.products = this.allProducts.slice();
                    }

                    this.initialPagePosition();
                    this.isLoading = false;
                }
            }, err => {
                this.isLoading = false;
            });
    }

    todaySupplierTimings() {
        if (this.supplierDetail.timing && this.supplierDetail.timing.length) {
            const today = this.dateService.getDay(moment().format('dddd').toLowerCase())
            const todayTimes = this.supplierDetail.timing.find((i) => i.week_id == today);

            if (todayTimes) {
                let startTime = todayTimes.start_time.split(':');
                let endTime = todayTimes.end_time.split(':');

                const openingTime = moment().set('h', startTime[0]).set('m', startTime[1]).set('s', startTime[2]);
                const closeTime = moment().set('h', endTime[0]).set('m', endTime[1]).set('s', endTime[2])


                this.supplierDetail['todayTimes'] = {
                    is_open: todayTimes.is_open,
                    startTime: openingTime.format('LT'),
                    endTime: closeTime.format('LT'),
                    day: this.dateService.getDayName(today)
                }

                if (moment().isBefore(openingTime, 'm') || moment().isAfter(closeTime)) {
                    this.supplierDetail['todayTimes']['is_open'] = 0;
                }

                this.productstate.hideQuantity = this.supplierDetail['todayTimes']['is_open'] == 0 ? true : false;
            }
        }
    }

    initialPagePosition() {
        if (this.products && this.products.length) {
            for (let i = 0; i < this.products.length; i++) {
                this.pagePosition[`${i}`] = 0;
            }
        }
    }

    categorySelect(index) {
        let el = this.document.getElementById(index);

        if (this.settings.selected_template == 1) {
            // this.categoryIndex = index;
            this.window.scrollTo({
                top: el.offsetTop - 80,
                behavior: 'smooth'
            });
        } else {
            el.scrollIntoView({ behavior: "smooth" });
        }
        // this.categoryIndex = index;
        // this.window.scrollTo(0, this.pagePosition[index] + 650);
    }

    searchProduct(search) {
        if (!!search && search.trim()) {
            let regex: RegExp = new RegExp(search, "i");
            this.products = [];
            _.each(this.allProducts, data => {
                let arr = _.filter(data.value, product => {
                    return product['name'].match(regex) || product['supplier_name'].match(regex);
                });
                if (arr && arr.length)
                    this.products.push({ sub_cat_name: data.sub_cat_name, value: arr });
            });
        } else {
            this.products = this.allProducts.slice();
        }
    }

    addRemoveFavourites(is_favourite) {
        if (!this.loggedIn) {
            this.message.alert('warning', this.translate.instant('Please Login To Continue'));
            return;
        }
        let url: string = '';
        if (is_favourite) {
            url = ApiUrl.favourite.removeFromFavourites
        } else {
            url = ApiUrl.favourite.addToFavourites
        }
        let form_data = {
            supplierId: this.supplierId,
            accessToken: this.user.getUserToken
        }
        this.http.postData(url, form_data, true)
            .subscribe(response => {
                if (!!response && response.data) {
                    this.message.toast('success', `${this.localization.transform('supplier')} ${is_favourite ? this.translate.instant('Removed From') : this.translate.instant('Added To')} ${this.translate.instant('Favourites')}`);
                    this.supplierDetail['Favourite'] = !is_favourite;
                }
            });
    }

    /********* Open Add On Dialog *********/

    openAddOnDialog(product) {
        const dialogRef = this.dialogService.open(AddOnComponent, {
            header: product['name'],
            width: '50%',
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
        if (product['is_product_adds_on'] !== 1) {
            this.cartService.addToCart(product, this.products);
            return;
        }

        this.openAddOnDialog(product);
    }

    removeProduct(product) {
        if (product['customization'] && product['customization'].length) {
            this.openAddOnDialog(product);
        } else {
            this.cartService.removeFromCart(product)
        }
    }

    public generateFakeList(count: number): Array<number> {
        const indexes = [];
        for (let i = 0; i < count; i++) {
            indexes.push(i);
        }
        return indexes;
    }

    prescriptionUpload() {
        const dialogRef = this.dialogService.open(PrescriptionUploadComponent, {
            dismissableMask: true,
            width: '60%',
            showHeader: false,
            transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
            data: {
                supplier_branch_id: this.supplierDetail.supplier_branch_id,
            }
        });
    }

    wishlist(status, detail) {
        // this.loggedIn = !!this.userService.getUserToken;
        if (!this.loggedIn) {
            this.message.alert('warning', this.translate.instant('Please Login First'));
            return;
        }
        let param_data = {
            status: +status,
            supplierId: detail['id'],
            accessToken: this.user.getUserToken
        }

        const api = param_data.status == 1 ? ApiUrl.favourite.addToFavourites : ApiUrl.favourite.removeFromFavourites;

        this.http.postData(api, param_data, true)
            .subscribe(response => {
                if (!!response && response.data) {
                    this.message.toast('success', `${this.localization.transform('supplier')} ${this.translate.instant('Has Been Successfully')} ${status ? this.translate.instant('Added To') : this.translate.instant('Removed From')} ${this.translate.instant('Wishlist')}`);
                    this.supplierDetail.Favourite = status;
                }
            });
    }

    openSchedulingModal(supplier) {
        if (!this.loggedIn) {
            this.util.authToggle.next(true);
            return false;
        }
        this.schedulingData = {
            supplier_id: supplier.id,
            branch_id: supplier.supplier_branch_id,
            date_order_type: 3,
            latitude: 0,
            longitude: 0,
            by_pass_tables_selection: this.settings.by_pass_tables_selection
        }
        this.showScheduleTime = true;
    }

    onSchedulingProcess(eventData: any) {
        this.createTableBooking(eventData);
    }
    
    createTableBooking(data) {
        var table_booking_param = {
            user_id: this.currentUser.id,
            table_id: data.table_id,
            slot_id: data.slot_id,
            schedule_date: data.startTime,
            schedule_end_date: data.endTime,
            supplier_id: this.supplierDetail.id,
            branch_id: this.supplierDetail.supplier_branch_id
        }
        this.http.postData(ApiUrl.makeTableBookingRequest, table_booking_param).subscribe((res: any) => {
            if (res.status == 200) {
                this.message.alert("success", "Table has been booked!");
                this.router.navigateByUrl('/account/table-bookings');
            }
        })
    }

    ngOnDestroy() {
        if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
        if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
        if (!!this.getDataSubscription) this.getDataSubscription.unsubscribe();
        if (!!this.routeSubscription) this.routeSubscription.unsubscribe();
        if (!!this.cartSubscription) this.cartSubscription.unsubscribe();
        if (!!this.userSubscription) this.userSubscription.unsubscribe();
        if (!!this.themeSubscription) this.themeSubscription.unsubscribe();
        let componentInstance = this.dialogService.dialogComponentRef;
        if (componentInstance) {
            componentInstance.destroy()
        }
    }

}
