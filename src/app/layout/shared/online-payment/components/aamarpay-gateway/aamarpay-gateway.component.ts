import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { AppSettings } from '../../../../../shared/models/appSettings.model';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { UtilityService } from '../../../../../services/utility/utility.service';
import { ScriptService } from '../../../../../services/script/script.service';
import { ScriptModel } from '../../../../../shared/models/script.model';
import { PaymentBaseComponent } from '../payment-base.component';
import { HttpService } from '../../../../../services/http/http.service';
import { ApiUrl } from './../../../../../core/apiUrl';
import { GlobalVariable } from './../../../../../core/global';
import { WINDOW } from '../../../../../services/window/window.service';

@Component({
    selector: 'app-aamarpay-gateway',
    templateUrl: './aamarpay-gateway.component.html',
})
export class AamarPayGatewayComponent extends PaymentBaseComponent implements OnInit, OnDestroy {

    settings: AppSettings;
    style: StyleVariables;

    styleSubscription: Subscription;
    settingSubscription: Subscription;
    public showAddCard: boolean = false;
    constructor(
        private util: UtilityService,
        private scriptService: ScriptService,
        private http: HttpService,
        @Inject(WINDOW) private window: Window,
    ) {
        super();
    }

    ngOnInit() {
        this.styleSubscription = this.util.getStyles
            .subscribe(style => {
                this.style = style;
            });

        this.settingSubscription = this.util.getSettings
            .subscribe((settings: AppSettings) => {
                this.settings = settings;
            })
        this.createPayment();
    }


    createPayment() {
        var obj = {
            desc: "order",
            email: this.order.user.email,
            name: this.order.user.firstname,
            amount: this.order.amount,
            address: this.order.address.customer_address,
            phone: this.order.user.mobile_no,
            currency: GlobalVariable.CURRENCY,
            success_url: this.window.origin + `/cart`,
            fail_url: this.window.origin + `/cart`,
        }
        this.http.getData(ApiUrl.getAamarPayPaymentUrl, obj).subscribe((res: any) => {
            if (res.status == 200) {
                window.open(res.data.cards[0].url);
            }
        })
    }



    ngOnDestroy(): void {
        if (this.styleSubscription) this.styleSubscription.unsubscribe();
        if (this.settingSubscription) this.settingSubscription.unsubscribe();
    }

}


