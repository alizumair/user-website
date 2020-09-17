import { Injectable, OnDestroy } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { UtilityService } from '../../../services/utility/utility.service';
import { AppSettings } from './../../../shared/models/appSettings.model';

@Injectable({
  providedIn: 'root'
})
export class HomeGuard implements CanActivate, OnDestroy {

  location: any;
  settings: AppSettings;
  locationSubscription: Subscription;
  settingSubscription: Subscription;

  constructor(
    private util: UtilityService,
    private router: Router
  ) {
    this.locationSubscription = this.util.getUserLocation.subscribe((userLocation) => {
      this.location = userLocation;
    });

    this.settingSubscription = this.util.getSettings.subscribe((settings) => {
      this.settings = settings;
    })
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.location) {
      this.router.navigate(['/']);
      return false;
    } else {
      return true;
    }
  }

  ngOnDestroy() {
    this.locationSubscription.unsubscribe();
    this.settingSubscription.unsubscribe();
  }

}
