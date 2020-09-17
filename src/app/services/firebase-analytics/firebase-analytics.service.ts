import { Injectable } from "@angular/core";
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { AppSettings } from '../../shared/models/appSettings.model';
import { UtilityService } from '../utility/utility.service';

@Injectable({
    providedIn: 'root'
})
export class FirebaseAnalyticsService {

    constructor(
        private analytics: AngularFireAnalytics,
        private util: UtilityService,
    ) {}

    firebaseAnalyticsEvents(key: string, eventDetails: any) {
        this.util.getSettings.subscribe((settings: AppSettings) => {
            if (settings && settings.isFirebaseAnalytics === "1") {
                this.analytics.logEvent(key, {
                    'firsttimeuser': true,
                    'firedEvent': eventDetails
                });
            }
        });
    }
}