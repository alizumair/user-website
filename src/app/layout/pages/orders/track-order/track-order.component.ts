import { AppSettings } from './../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../core/theme/styleVariables.model';
import { UtilityService } from './../../../../services/utility/utility.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { SocketsService } from './../../../../services/sockets/sockets.service';
import { DOCUMENT } from "@angular/common";
import { LocalizationPipe } from './../../../../shared/pipes/localization.pipe';
import { TranslateService } from '@ngx-translate/core';

declare const google: any;

@Component({
  selector: 'app-track-order',
  templateUrl: './track-order.component.html',
  styleUrls: ['./track-order.component.scss'],
})
export class TrackOrderComponent implements OnInit, OnDestroy {

  routeSubscription: Subscription;
  styleSubscription: Subscription;
  style: StyleVariables;
  orderId: string = '';
  map: any = {};
  agentMarker: any = null;
  destinationMaker: any = null;
  location: any = {};
  directionsService: any;
  directionsDisplay: any;
  destination_icon: any = {};
  agent_icon: any = {};
  tracking: boolean = false;
  status: Array<any> = [];
  settings: AppSettings;

  supplier_lat: number = 0;
  supplier_lng: number = 0;
  agent_lat: number = 0;
  agent_lng: number = 0;
  self_pickup: number = 0;

  constructor(
    private socket: SocketsService,
    private route: ActivatedRoute,
    private util: UtilityService,
    private localization: LocalizationPipe,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document) {

    this.routeSubscription = this.route.queryParams
      .subscribe(params => {
        this.orderId = params.orderId;
        this.supplier_lat= parseFloat(params.lat);
        this.supplier_lng = parseFloat(params.lng);
        this.agent_lat = parseFloat(params.a_lat);
        this.agent_lng = parseFloat(params.a_lng);
        this.self_pickup = parseInt(params.selfPickup);
      });

    this.destination_icon = {
      url: this.self_pickup == 1 ? 'https://i.imgur.com/F5uH1Fr.png' :  'https://i.imgur.com/7teZKif.png',
      scaledSize: {
        width: 37,
        height: 37
      }
    };

    this.agent_icon = {
      url: this.self_pickup == 1 ? '../assets/images/user.png' :  '../assets/images/agentBike.png',
      scaledSize: {
        width: 65,
        height: 65
      }
    };
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
      });

    this.util.settingsLoaded.subscribe(loaded => {
      if (loaded) {
        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });
        this.initialize();
        if (this.self_pickup) {
          this.location.latitude = this.util.handler.latitude;
          this.location.longitude = this.util.handler.longitude;
          this.trackLocation();
        } else {
          this.getLocation();
        }
      }
    });  
  }

  getLocation() {
    this.socket.getLocation()
      .subscribe(response => {
        if (response) {
          this.location = response;
          if (response['order_id'] == this.orderId) {
            this.trackLocation();
          }
        }
      });
  }

  initialize() {
    const self = this;
    let myOptions = {
      zoom: 12,
      streetViewControl: false,
      disableDefaultUI: false,
      mapTypeControl: false,
    };
    self.map = new google.maps.Map(this.document.getElementById("trackLocation"), myOptions);
    this.directionsDisplay.setMap(self.map);
    self.map.setCenter({
      lat: this.agent_lat,
      lng: this.agent_lng
    });
    let LatLng = new google.maps.LatLng({
      lat: this.agent_lat,
      lng: this.agent_lng
    });
    this.setAgentMarker(LatLng);
  }

  trackLocation() {
    const self = this;

    /*************** Destination ***************/
    let coordinates: Array<any> = this.getDestination();
    let destination = new google.maps.LatLng(coordinates[0], coordinates[1]);
    // this.setDestinationMaker(destination); 

    /*************** Agent ***************/
    let agent = new google.maps.LatLng(self.location.latitude, self.location.longitude);
    // this.setAgentMarker(agent);


    /*************** Route ***************/
    let request = {
      origin: agent,
      destination: destination,
      optimizeWaypoints: true,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    this.directionsService.route(request, (response, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        this.directionsDisplay.setDirections(response);
        this.directionsDisplay.setMap(self.map);
        if (!!this.agentMarker) {
          this.agentMarker.setMap(null);
        }
        const route = response.routes[0].legs[0];
        this.setAgentMarker(route.start_location);
        this.setDestinationMaker(route.end_location);
      }
    });
  }

  setAgentMarker(position) {
    const self = this;
    this.agent_icon.rotation = this.location.bearing;

    self.agentMarker = new google.maps.Marker({
      position: position,
      map: self.map,
      // draggable: false,
      title: this.self_pickup == 1 ? this.translate.instant('Customer') : this.localization.transform('agent'),
      icon: this.agent_icon,
    });
  }

  setDestinationMaker(destinationPosition) {
    const self = this;
    self.destinationMaker = new google.maps.Marker({
      position: destinationPosition,
      map: self.map,
      // draggable: false,
      title: this.self_pickup == 1 ? this.localization.transform('supplier') :  'Destination',
      icon: this.destination_icon
    });
    if (!this.tracking) {
      self.destinationMaker.setPosition(destinationPosition);
      self.map.panTo(destinationPosition);
      this.tracking = true;
    }
  }

  getDestination(): Array<string> {
  if (this.self_pickup == 1) {
     return [`${this.supplier_lat}`, `${this.supplier_lng}`]
  } else if (this.location['address'] && this.location['address'].length) {
      let destination = this.location['address'][0];
      return [destination.latitude, destination.longitude]
    }
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
    this.styleSubscription.unsubscribe();
    this.socket.removeListener('order_location');
  }
}