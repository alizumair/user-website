import { UtilityService } from './../../../../services/utility/utility.service';
import { AppSettings } from './../../../../shared/models/appSettings.model';
import { PipeTransform, Pipe, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';


@Pipe({
    name: 'returnStatus'
})
export class ReturnStatusPipe implements PipeTransform, OnDestroy {

    settingSubscription: Subscription;
    settings: AppSettings;
    app_type: number = 0;
    langType: 'english' | 'other' = 'english';
    terminology: object = {};

    constructor(private util: UtilityService) {

        this.settingSubscription = this.util.getSettings
            .subscribe((settings: AppSettings) => {
                if (settings) {
                    this.app_type = settings['app_type'];
                    this.settings = settings;
                }
            });

        let langData = this.util.getLocalData('langData', true) || { id: this.util.handler.languageId };
        this.langType = !langData || langData.id != 14 ? 'other' : 'english';
    }

    transform(selected_status): string {
        if (this.settings) {
            let terminologies = this.settings.terminology;
            let status_terminologies = {};
            if (!!terminologies) {
                if (localStorage.getItem('lang') === 'en') {
                    status_terminologies = terminologies[this.langType]['return_status'];
                } else {
                    status_terminologies = terminologies[this.langType]['return_status'];
                }
            }

            if (!!terminologies && !!status_terminologies && !!status_terminologies[selected_status]) {
                return status_terminologies[selected_status];
            } else {
                let status = '';
                switch (selected_status) {
                    case 0:
                        status = 'RETURN REQUESTED';
                        break;
                    case 1:
                        status = 'AGENT ON THE WAY';
                        break;
                    case 2:
                        status = 'PRODUCT PICKED';
                        break;
                    case 3:
                        status = 'RETURNED';
                        break;
                }
                return status;
            }
        }
    }

    ngOnDestroy() {
        if (!!this.settingSubscription) this.settingSubscription.unsubscribe();
    }
}
