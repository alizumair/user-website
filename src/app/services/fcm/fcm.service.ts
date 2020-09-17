import { isPlatformBrowser } from '@angular/common';
import { Inject } from '@angular/core';
import { Injectable, OnInit, PLATFORM_ID } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs'
import { UtilityService } from '../utility/utility.service';
import * as firebase from 'firebase/app';
import 'firebase/messaging';

@Injectable({
  providedIn: 'root'
})
export class FcmService implements OnInit {

  currentMessage = new BehaviorSubject(null);
  childInjector: any;

  constructor(
    private util: UtilityService,
    private angularFireMessaging: AngularFireMessaging,
    @Inject(PLATFORM_ID) private platformId: string,
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.angularFireMessaging.messaging.subscribe(
        (_messaging) => {
          _messaging.onMessage = _messaging.onMessage.bind(_messaging);
          _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
        }
      );
    }
  }

  requestPermission() {
    if (!firebase.messaging.isSupported()) return;
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        this.util.setLocalData('fcm_token', token);
      },
      (err) => {
        console.error('Unable to get permission to notify.', err);
      }
    );
  }

  receiveMessage() {
    this.angularFireMessaging.messages.subscribe(
      (payload) => {
        this.currentMessage.next(payload);
      });
  }

}