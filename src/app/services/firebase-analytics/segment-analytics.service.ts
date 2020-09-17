import { Injectable } from "@angular/core";
import { AppSettings } from '../../shared/models/appSettings.model';
import { UtilityService } from '../utility/utility.service';

declare var analytics: any;

@Injectable({
    providedIn: 'root'
})
export class SegmentAnalyticsService {

    constructor(
        private util: UtilityService,
    ) {

    }

    segmentAnalyticsEvent(key: string, eventDetails: any, userId?: string, name?: string, email?: string) {
        this.util.getSettings.subscribe((settings: AppSettings) => {
            if (settings.is_segment === "1") {
                if (userId) {
                    this.identity(userId, name, email);
                }
                this.trackEvents(key, eventDetails);
            }
        })
    }

    identity(userId?: string, name?: string, email?: string) {
        analytics.identify(userId, {
            name: name,
            email: email
        });
    }

    trackEvents(key: string, eventDetails: any) {
        if(!!analytics) {
            analytics.track(key, {
                title: key,
                subtitle: eventDetails.info,
                author: eventDetails.name
            });
        }
    }
}