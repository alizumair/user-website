import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { LocationService } from '../services/location/location.service';
import { Subscription } from 'rxjs';
import { UtilityService } from '../services/utility/utility.service';
import { MessagingService } from '../services/messaging/messaging.service';
import { LoaderService } from '../services/loader/loader.service';
import { Router } from '@angular/router';
import { AppSettings } from '../shared/models/appSettings.model';
import { StyleVariables } from '../core/theme/styleVariables.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit, OnDestroy {

  place: any = {
    lat: 0,
    lng: 0,
    formatted_address: ''
  };

  settings: AppSettings;
  style: StyleVariables;

  settingSubscription: Subscription;
  locationSubscription: Subscription;
  styleSubscription: Subscription;


  constructor(
    private ngZone: NgZone,
    private location: LocationService,
    private util: UtilityService,
    private message: MessagingService,
    private loader: LoaderService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.style = new StyleVariables();
  }

  ngOnInit() {

    this.settingSubscription = this.util.getSettings.subscribe((settings) => {
      if (settings) {
        this.settings = settings;
        if (this.settings.header_theme == 2) {
          this.detectLocation()
        }
      }
    })

    this.styleSubscription = this.util.getStyles.subscribe((style) => {
      this.style = style;
    })

    this.locationSubscription = this.util.getUserLocation.subscribe((location) => {
      if (location)
        this.place = {
          lat: location['lat'],
          lng: location['lng'],
          formatted_address: location['address']
        }
    });
    this.loader.initialLoadingComplete.next(true);
  }

  setPlace(data: any) {
    this.place = data;
    this.place = {
      lat: data['lat'],
      lng: data['lng'],
      formatted_address: data['formatted_address']
    }
  }

  addressSearch() {
    if (!this.place || !this.place.lat || !this.place.lng) {
      this.message.alert('info', this.translate.instant('Please Enter Address'));
      return;
    }
    this.location.getGeoLocation(this.place.lat, this.place.lng).subscribe((address) => {
      this.ngZone.run(() => {
        this.util.setUserLocation(address);
        this.router.navigate(['/']);
      })
    }, (err) => {
      this.message.alert('error', err.message);
    });
  }

  detectLocation() {
    this.location.openTracker().subscribe((address) => {
      this.ngZone.run(() => {
        this.util.setUserLocation(address);
        this.router.navigate(['/']);
      })
    }, (err) => {
      this.message.alert('error', err.message);
    });
  }

  ngOnDestroy() {
    this.locationSubscription.unsubscribe();
  }

}
