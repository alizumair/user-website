import { UtilityService } from './../../services/utility/utility.service';
import { Directive, ElementRef, OnInit, NgZone, Output, EventEmitter } from '@angular/core';

declare var google: any;

@Directive({
  selector: '[appGoogleplace]'
})
export class GoogleplaceDirective implements OnInit {

  @Output() onSelect: EventEmitter<any> = new EventEmitter();
  private element: HTMLInputElement;

  constructor(
    elRef: ElementRef,
    private _ngZone: NgZone,
    private util: UtilityService) {
    this.element = elRef.nativeElement;
  }

  getFormattedAddress(place) {
    let location_obj = {};
    for (let i in place.address_components) {
      let item = place.address_components[i];
      location_obj['formatted_address'] = place.formatted_address;
      if (item['types'].indexOf('locality') > -1) {
        location_obj['locality'] = item['long_name']
      } else if (item['types'].indexOf('administrative_area_level_1') > -1) {
        location_obj['admin_area_l1'] = item['short_name']
      } else if (item['types'].indexOf('street_number') > -1) {
        location_obj['street_number'] = item['short_name']
      } else if (item['types'].indexOf('route') > -1) {
        location_obj['route'] = item['long_name']
      } else if (item['types'].indexOf('country') > -1) {
        location_obj['country'] = item['long_name']
      } else if (item['types'].indexOf('postal_code') > -1) {
        location_obj['postal_code'] = item['short_name']
      }

    }
    location_obj['name'] = place.name;
    if (!!place.geometry) {
      location_obj['lat'] = place.geometry.location.lat();
      location_obj['lng'] = place.geometry.location.lng();
    }
    return location_obj;
  }

  ngOnInit() {
    this.util.settingsLoaded.subscribe(loaded => {
      if (loaded) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
            var geolocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            let circle = new google.maps.Circle({ center: geolocation, radius: position.coords.accuracy });
            let options = {}
            if (circle) {
              options['bounds'] = circle.getBounds();
            }
            const autocomplete = new google.maps.places.Autocomplete(this.element, options);
            google.maps.event.addListener(autocomplete, 'place_changed', () => {
              this._ngZone.run(() => {
                this.onSelect.emit(this.getFormattedAddress(autocomplete.getPlace()));
              });
            });
          }, err => {}, {enableHighAccuracy: true});
        }
      }
    });
  }

}