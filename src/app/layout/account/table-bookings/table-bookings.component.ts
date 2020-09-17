import { Component, OnInit, OnDestroy } from "@angular/core";
import { MessagingService } from '../../../services/messaging/messaging.service';
import { HttpService } from '../../../services/http/http.service';
import { ApiUrl } from '../../../core/apiUrl';
import { UserService } from '../../../services/user/user.service';
import { Subscription } from 'rxjs';
import { PaginationModel } from '../../../shared/models/pagination.model';
import { StyleVariables } from '../../../core/theme/styleVariables.model';
import { UtilityService } from '../../../services/utility/utility.service';
import { AppSettings } from '../../../shared/models/appSettings.model';
import { TableBookingStatus } from "../../../core/global";
import { Router } from '@angular/router';

@Component({
    selector: 'app-table-bookings',
    templateUrl: './table-bookings.component.html',
    styleUrls: ['./table-bookings.component.scss']
})
export class TableBookingsComponent implements OnInit, OnDestroy {

    public userSubscription: Subscription;
    public styleSubscription: Subscription;
    public currentUser: any = {};
    public loggedIn: boolean;
    public tableBookings: any = [];
    pagination: PaginationModel;
    style: StyleVariables;
    public view_share_buttons: boolean;
    public shareable: any = { description: '', link: '' };
    settings: AppSettings;
    public tableBookingStatus = TableBookingStatus;

    constructor(
        private message: MessagingService,
        private http: HttpService,
        private userService: UserService,
        private util: UtilityService,
        private router: Router
    ) {
        this.pagination = new PaginationModel();
    }
    ngOnInit() {
        this.userSubscription = this.userService.currentUser
            .subscribe(user => {
                this.currentUser = user;
                if (!!user && user['access_token']) {
                    this.loggedIn = true;
                    this.getTableBookings();
                } else {
                    this.loggedIn = false;
                }
            });
        this.styleSubscription = this.util.getStyles
            .subscribe((style: StyleVariables) => {
                this.style = style;
            });
        this.util.getSettings.subscribe((settings: AppSettings) => {
            this.settings = settings;
        })

    }

    getTableBookings() {
        this.tableBookings = [];
        var params = {
            user_id: this.currentUser.id,
            offset: this.pagination.offset,
            limit: this.pagination.perPage
        }
        this.http.getData(ApiUrl.getTableBookingRequestList, params).subscribe((res: any) => {
            if (res.status == 200) {
                this.tableBookings = res.data.list;
                this.pagination.count = res.data.count;
            }
        })
    }


    pageChange(event) {
        this.pagination.currentPage = event;
        this.pagination.offset = event > 1 ? (event - 1) * this.pagination.perPage : 0;
        this.getTableBookings();
    }

    addFoodItemToTable(tb) {
        var obj = {
            table_request_id: tb.id,
            table_id: tb.table_id,
            table_name: tb.table_name
        }
        localStorage.setItem('table_booking_details', JSON.stringify(obj));
        this.router.navigate(["products/listing"], {
            queryParams: {
                supplierId: tb.supplier_id,
                action: 'tb_item'
            }
        });
    }

    viewOrderDetail(tb) {
        this.router.navigate(["orders/order-detail"], {
            queryParams: {
                orderId: tb.order_id,
            }
        });
    }


    shareTable(tb) {
        this.createDeepLink(tb);
    }

    createDeepLink(tb) {
        var qp = `table_id=${tb.table_id}&user_id=${this.currentUser.id}&user_name=${tb.user_name}&branch_name=${tb.branch_name}&table_name=${tb.table_name}&table_number=${tb.table_number}&capacity=${tb.seating_capacity}&date=${tb.schedule_date}`
        var obj = {
            domainUriPrefix: "https://royoapps.page.link",
            link: `https://yammfood.royoapps.com/table?${qp}`,
            androidPackageName: "com.fesh.user",
            iosBundleId: "com.codebrew.yammFood",
            // iosAppStoreId: "",
            firebase_api_key: "AIzaSyC3Jmdoj4hMlqavf4TT7popLle2fMCHeZg"
        }
        this.http.postData(ApiUrl.generateDeepLink, obj).subscribe((res: any) => {
            if (res.data) {
                this.shareable.link = res.data.shortLink;
                this.shareable.description = `You are invited on the dining table ${tb.table_name} by ${tb.user_name}`;
                this.view_share_buttons = true;
            }
            else {
                this.message.toast("error", "Not able to create link!");
            }
        })
    }



    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
        if (this.styleSubscription) {
            this.styleSubscription.unsubscribe();
        }
    }

}