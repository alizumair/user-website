import { Injectable } from '@angular/core';
import { UtilityService } from '../utility/utility.service';
import { Observable, Subject } from 'rxjs';
declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(
    private util: UtilityService
  ) { }

  openTracker(): Observable<any> {
    const subject = new Subject();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        let pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        this.getGeoLocation(pos.lat, pos.lng).subscribe((address) => {
          subject.next(address);
        });
      },
        error => {
          subject.error(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        })
    } else {
      this.getGeoLocation(this.util.handler.latitude, this.util.handler.longitude).subscribe((address) => {
        subject.next(address);
      });
    }

    return subject.asObservable();
  }

  getGeoLocation(lat: number, lng: number): Observable<any> {
    const subject = new Subject();
    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(lat, lng);
    const request = { latLng: latlng };
    geocoder.geocode(request, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          let address = results[0].formatted_address;
          subject.next({ lat, lng, address });
        }
      }
    });

    return subject.asObservable();
  }

  getDistance(origin: any, destination: any): Observable<any> {
    let latlngA = new google.maps.LatLng(origin.lat, origin.lng);
    let latlngB = new google.maps.LatLng(destination.lat, destination.lng);
    const subject = new Subject();

    let service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [latlngA],
        destinations: [latlngB],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
      }, (response, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          let distanceArr = response.rows;
          let distanceObj = {};
          for (let val of distanceArr) {
            distanceObj = (val.elements).find(element => element.status === google.maps.GeocoderStatus.OK);
            if (!!distanceObj) break;
          };
          if (!!distanceObj) {
            subject.next(distanceObj['distance']);
          } else {
            subject.next(null);
          }
        }
      });
    return subject.asObservable();
  }

}
