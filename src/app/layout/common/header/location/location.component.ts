import { ApiUrl } from './../../../../core/apiUrl';
import { UtilityService } from './../../../../services/utility/utility.service';
import { HttpService } from './../../../../services/http/http.service';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { StyleConstants } from './../../../../core/theme/styleConstants.model';
import {Component, OnInit, OnDestroy, AfterViewInit, Input, NgZone} from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from './../../../../services/user/user.service';
import { LocationService } from '../../../../services/location/location.service';
import { MessagingService } from '../../../../services/messaging/messaging.service';
import { LoaderService } from '../../../../services/loader/loader.service';
import { GlobalVariable } from './../../../../../app/core/global';
import { AppSettings } from '../../../../shared/models/appSettings.model';

declare const google: any;

@Component({
  selector: 'app-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss']
})
export class LocationComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() settings: AppSettings;
  isMobile: boolean = GlobalVariable.IS_MOBILE;

  primaryButton: StyleConstants;
  primaryInverse: StyleConstants;
  style: StyleVariables;
  styleSubscription: Subscription;
  userSubscription: Subscription;
  settingLoadSubscription: Subscription;

  pincode: string = '';
  selectedLocation: string = '';
  placeSearch: string = '';
  zoom: number = 4;

  location: any = {};
  initLocation: any = {};
  allParams: any = {};
  map: any = {};
  marker: any = {};
  locationToggle: boolean = false;
  site_name: string = GlobalVariable.SITE_NAME;

  isLoading: boolean = false;

  constructor(
    private http: HttpService,
    private util: UtilityService,
    private user: UserService,
    private ngZone: NgZone,
    private locationService: LocationService,
    private messageService: MessagingService,
    private loaderService: LoaderService
  ) {

    this.primaryButton = new StyleConstants();
    this.primaryInverse = new StyleConstants();
    this.style = new StyleVariables();

    this.initLocation = {
      lat: '',
      lng: '',
    };

    this.location = {
      lat: '',
      lng: ''
    };
  }

  ngOnInit() {

    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
        this.primaryButton.color = '#ffffff';
        this.primaryButton.backgroundColor = style.primaryColor;
        this.primaryInverse.backgroundColor = '#ffffff';
        this.primaryInverse.borderColor = style.primaryColor;
        this.primaryInverse.color = style.primaryColor;
      });

    this.util.locationToggle.subscribe(toggle => {
      if (toggle) {
        this.locationToggle = toggle;
      }
    });

    this.util.getUserLocation.subscribe((latLng) => {
      this.placeSearch = this.util.handler.address;
      this.selectedLocation = this.util.handler.address;
    })

  }

  ngAfterViewInit(): void {
    this.settingLoadSubscription = this.util.settingsLoaded.subscribe(loaded => {
      if (loaded && this.settings) {
        setTimeout(() => {
          this.initialize();
        }, 1000);
        this.userSubscription = this.user.currentUser.subscribe(user => {
          if (!!user && user['access_token']) {
            this.getUserAddress();
          }
        });
      }
    });
  }

  getUserAddress() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.locationService.getGeoLocation(position.coords.latitude, position.coords.longitude).subscribe((address) => {
          this.ngZone.run(() => {
            this.util.setUserLocation(address);
          })
        }, (err) => {
          this.util.setDefaultLocation();
        });
      }, err => { }, { enableHighAccuracy: true });
    } else {

      let obj = {
        accessToken: this.user.getUserToken,
        languageId: this.util.handler.languageId,
        latitude: this.util.handler.latitude,
        longitude: this.util.handler.longitude
      };
      this.http.postData(ApiUrl.address.getAddress, obj, true)
        .subscribe(response => {
          if (!!response && response.data) {
            if (response.data.address.length) {
              let address = response.data.address.find((a) => a.is_default === 1) || response.data.address[0];
              this.locationService.getGeoLocation(address.latitude, address.longitude).subscribe((address) => {
                console.log('herererererere')
                this.util.setUserLocation(address);
              }, (err) => {
                // this.messageService.alert('error', err.message);
              });
            }
          }
        });
    }
  }


  initialize() {
    const self = this;
    var latlng = new google.maps.LatLng(this.util.handler.latitude, this.util.handler.longitude);
    var myOptions = {
      zoom: 12,
      center: latlng,
      streetViewControl: false,
      disableDefaultUI: false,
      mapTypeControl: false
    };

    if (!document.getElementById("mapLocation")) return;

    self.map = new google.maps.Map(document.getElementById("mapLocation"), myOptions);
    self.marker = new google.maps.Marker({
      position: latlng,
      map: self.map,
      draggable: true
    });

    self.addYourLocationButton(self.map, self.marker);

    // this.locationService.getGeoLocation(this.util.handler.latitude, this.util.handler.longitude).subscribe((address) => {
    //   this.util.setUserLocation(address);
    // }, (err) => {
    //   // this.messageService.alert('error', err.message);
    // });

    google.maps.event.addListener(self.marker, 'dragend', function (event) {
      self.markerDragEnd(event);
    });

    google.maps.event.addListener(self.map, 'click', function (event) {
      self.mapClicked(event);
    });
  }

  markerDragEnd(event: any) {
    this.location.lat = parseFloat(event.latLng.lat());
    this.location.lng = parseFloat(event.latLng.lng());
    console.log(this.location)
    this.locationService.getGeoLocation(this.location.lat, this.location.lng).subscribe((location) => {
      if(location) {
        console.log(location)
        this.placeSearch = location['address'];

        console.log(this.placeSearch)

      }
    });
  }

  mapClicked(event: any) {
    let self = this;
    this.location.lat = parseFloat(event.latLng.lat());
    this.location.lng = parseFloat(event.latLng.lng());
    var center = new google.maps.LatLng(this.location.lat, this.location.lng);
    self.marker.setPosition(center);
    self.map.panTo(center);
    this.locationService.getGeoLocation(this.location.lat, this.location.lng).subscribe((location) => {
      this.placeSearch = location.address;
    });
  }

  addressSearch(data) {
    let self = this;
    self.location.lat = data.lat;
    self.location.lng = data.lng;
    var center = new google.maps.LatLng(self.location.lat, self.location.lng);
    self.marker.setPosition(center);
    self.map.panTo(center);
  }

  onDone() {
    if (!this.location || !this.location.lat || !this.location.lng) {
      this.locationToggle = !this.locationToggle
      return;
    }
    this.isLoading = true;
    this.locationService.getGeoLocation(this.location.lat, this.location.lng).subscribe((address) => {
      this.util.setUserLocation(address);
      this.isLoading = false;
      this.locationToggle = false;
    }, (err) => {
      this.isLoading = false;
      this.messageService.alert('error', err.message);
      this.locationToggle = !this.locationToggle
    });
  }

  onClickedOutside() {
    this.resetMarker();
    this.locationToggle = false;
  }

  resetMarker() {
    var center = new google.maps.LatLng(this.util.handler.latitude, this.util.handler.longitude);
    this.marker.setPosition(center);
    this.map.panTo(center);
  }

  addYourLocationButton(map, marker) {
    var controlDiv: any = document.createElement('div');

    var firstChild = document.createElement('button');
    firstChild.style.backgroundColor = '#fff';
    firstChild.style.border = 'none';
    firstChild.style.outline = 'none';
    firstChild.style.width = '28px';
    firstChild.style.height = '28px';
    firstChild.style.borderRadius = '2px';
    firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    firstChild.style.cursor = 'pointer';
    firstChild.style.marginRight = '10px';
    firstChild.style.padding = '0';
    firstChild.title = 'Your Location';
    controlDiv.appendChild(firstChild);

    var secondChild = document.createElement('div');
    secondChild.style.margin = '5px';
    secondChild.style.width = '18px';
    secondChild.style.height = '18px';
    secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-2x.png)';
    secondChild.style.backgroundSize = '180px 18px';
    secondChild.style.backgroundPosition = '0 0';
    secondChild.style.backgroundRepeat = 'no-repeat';
    firstChild.appendChild(secondChild);

    google.maps.event.addListener(map, 'center_changed', function () {
      secondChild.style['background-position'] = '0 0';
    });

    firstChild.addEventListener('click', () => {
      const self = this;
      var imgX = '0',
        animationInterval = setInterval(function () {
          imgX = imgX === '-18' ? '0' : '-18';
          secondChild.style['background-position'] = imgX + 'px 0';
        }, 500);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          map.setCenter(latlng);
          self.marker.setPosition(latlng);
          self.map.panTo(latlng);
          clearInterval(animationInterval);
          secondChild.style['background-position'] = '-144px 0';
          self.location.lat = position.coords.latitude;
          self.location.lng = position.coords.longitude;
          self.locationService.getGeoLocation(self.location.lat, self.location.lng).subscribe((location) => {
            self.placeSearch = location.address;
          });
        });
      } else {
        clearInterval(animationInterval);
        secondChild.style['background-position'] = '0 0';
      }
    });

    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
  }

  setBackgroundColor() {
    var color = "";
    if (this.settings.is_custom_category_template === '1') {
      return color = "#01a14e";
    }
    else {
      return color = this.style.topHeaderBackgroundColor || this.style.headerBackgroundColor;
    }
  }
  setTextColor() {
    var color = "";
    if (this.settings.is_custom_category_template === '1') {
      return color = "#fff";
    }
    else {
      return color = this.style.topHeaderTextColor || this.style.headerTextColor
    }
  }

  ngOnDestroy() {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.settingLoadSubscription) this.settingLoadSubscription.unsubscribe();
    if (!!this.userSubscription) this.userSubscription.unsubscribe();
  }
}
