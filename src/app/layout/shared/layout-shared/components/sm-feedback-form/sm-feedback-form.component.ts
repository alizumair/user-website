import { Component, OnInit, OnDestroy, Inject, Output, EventEmitter } from '@angular/core';
import { UtilityService } from '../../../../../services/utility/utility.service';
import { DOCUMENT } from "@angular/common";

@Component({
    selector: 'app-sm-feedback',
    templateUrl: './sm-feedback-form.component.html',
    styleUrls: ['./sm-feedback-form.component.scss']
})
export class SmFeedbackFormComponent implements OnInit, OnDestroy {

    @Output() onFeedbackClose = new EventEmitter<boolean>();

    constructor(
        private util: UtilityService,
        @Inject(DOCUMENT) private document,

    ) {

    }

    ngOnInit() {
        this.surveyMonekyInit();
    }

    surveyMonekyInit() {
        this.util.getKeys.subscribe(key => {
            if (!!key && key.oribi_analytics) {
                const scriptLink = this.document.createElement('script');
                scriptLink.id = `survey_monkey`;
                scriptLink.setAttribute("type", "application/javascript");
                scriptLink.setAttribute("src", "https://widget.surveymonkey.com/collect/website/js/tRaiETqnLgj758hTBazgd8scXcYa2fZhrccw94BtKEyEn_2BzVvc_2Bf1hCmPdA76ppU.js");
                document.getElementById("smcx-sdk").appendChild(scriptLink);
            }
        });
    }

    close() {
        this.onFeedbackClose.emit(false);
    }


    ngOnDestroy(): void {

    }
}