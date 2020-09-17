import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppSettings } from '../../../../../shared/models/appSettings.model';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { UtilityService } from '../../../../../services/utility/utility.service';
import { ScriptService } from '../../../../../services/script/script.service';
import { ScriptModel } from '../../../../../shared/models/script.model';
import { PaymentBaseComponent } from '../payment-base.component';

@Component({
    selector: 'app-peach-gateway',
    templateUrl: './peach-gateway.component.html',
    styleUrls: ['./peach-gateway.component.scss']
})
export class PeachGatewayComponent extends PaymentBaseComponent implements OnInit, OnDestroy {

    settings: AppSettings;
    style: StyleVariables;

    styleSubscription: Subscription;
    settingSubscription: Subscription;
    public showAddCard: boolean = false;
    constructor(
        private util: UtilityService,
        private scriptService: ScriptService
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


        // const { key, value } = this.gateway.key_value_front.find((item) => item.for_front == 1);

        // const peachGatewayScript = new ScriptModel('peach', `https://test.oppwa.com/v1/paymentWidgets.js?checkoutId=${'checkoutId'}`);

        // this.scriptService.loadScript(peachGatewayScript).then((script: ScriptModel) => {
        //     if (!script.isLoaded) {
        //         console.log('unable to load peach script');
        //         this.onError.emit('unable to load peach script');
        //         return;
        //     }
        // })
    }
    

    onCardSelect($event) {
        this.onSuccess.emit($event);
    }

    ngOnDestroy(): void {
        if (this.styleSubscription) this.styleSubscription.unsubscribe();
        if (this.settingSubscription) this.settingSubscription.unsubscribe();
    }

}


