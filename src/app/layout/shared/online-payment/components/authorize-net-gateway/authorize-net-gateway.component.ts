import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { AppSettings } from '../../../../../shared/models/appSettings.model';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { UtilityService } from '../../../../../services/utility/utility.service';
import { ScriptService } from '../../../../../services/script/script.service';
import { ScriptModel } from '../../../../../shared/models/script.model';
import { PaymentBaseComponent } from '../payment-base.component';
import { UserService } from './../../../../../services/user/user.service';
import { HttpService } from './../../../../../services/http/http.service';
import { WINDOW } from './../../../../../services/window/window.service';
import { DOCUMENT } from '@angular/common';

declare var Accept: any;

@Component({
    selector: 'app-authorize-net-gateway',
    templateUrl: './authorize-net-gateway.component.html',
    styleUrls: ['./authorize-net-gateway.component.scss']
})
export class AuthorizeNetGatewayComponent extends PaymentBaseComponent implements OnInit, OnDestroy {

    settings: AppSettings;
    style: StyleVariables;

    styleSubscription: Subscription;
    settingSubscription: Subscription;
    public showAddCard: boolean = false;
    public cardNumber: string = "";
    public expMonth: string = "";
    public expYear: string = "";
    constructor(
        private util: UtilityService,
        private scriptService: ScriptService,
        private userService: UserService,
        private httpService: HttpService,
        @Inject(WINDOW) private window: Window,
        @Inject(DOCUMENT) private document
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
        this.showAddCard = true;

    }

    onCardSelect($event) {
        this.onSuccess.emit($event);
    }


    loadAuthorizeNetScript() {
        //prod https://js.authorize.net/v1/Accept.js,
        //prod ui https://js.authorize.net/v3/AcceptUI.js
        const scripts: ScriptModel[] = [
            new ScriptModel('authorizeNet', 'https://jstest.authorize.net/v1/Accept.js'),
            new ScriptModel('authorizeNetUI', 'https://jstest.authorize.net/v3/AcceptUI.js'),

        ];
        const promises = [];
        scripts.forEach((script) => {
            promises.push(this.scriptService.loadScript(script));
        })
        Promise.all(promises).then((result: ScriptModel[]) => {
            if (result.find(script => !script.isLoaded)) {
                console.log('unable to load venmo gateway script');
                this.onError.emit('unable to load venmo gateway script');
                return;
            } else {
                console.log("authorize net init");
            }
        })
    }

    onSubmit() {
        this.sendPaymentDataToAnet();
    }

    sendPaymentDataToAnet() {
        var authData = {
            clientKey: "275b79vxWUW94mTa",
            apiLoginID: "7UDaV6d5LY"
        };
        var cardData = {
            cardNumber: this.cardNumber,
            month: this.expMonth,
            year: this.expYear
        };
        var secureData = {
            authData: authData,
            cardData: cardData
        };
        Accept.dispatchData(secureData, this.responseHandler);

    }

    responseHandler(response) {
        if (response.messages.resultCode === "Error") {
            var i = 0;
            while (i < response.messages.message.length) {
                console.log(
                    response.messages.message[i].code + ": " +
                    response.messages.message[i].text
                );
                i = i + 1;
            }
        } else {
            this.paymentFormUpdate(response.opaqueData);
        }
    }

    paymentFormUpdate(opaqueData) {
        this.onSuccess.emit({
            'paymentGatewayId': 'braintree',
            'token': opaqueData.nonce
        });
    }

    ngOnDestroy(): void {
        if (this.styleSubscription) this.styleSubscription.unsubscribe();
        if (this.settingSubscription) this.settingSubscription.unsubscribe();
    }

}