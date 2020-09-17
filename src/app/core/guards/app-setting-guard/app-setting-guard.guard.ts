import { Injectable } from '@angular/core';
import { CanActivate, UrlTree, Router, CanLoad } from '@angular/router';
import { Observable } from 'rxjs';
import { AppLoadService } from '../../../services/app-load/app-load.service';

@Injectable({
  providedIn: 'root'
})
export class AppSettingGuard implements CanActivate, CanLoad {

  constructor(
    private settingService: AppLoadService,
    private router: Router,
  ) { }

  canActivate(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.settingService.init().then(() => {
      return true;
    }).catch((err) => {
      this.router.navigate(['/error']);
      return false;
    })
  }

  canLoad(): boolean | Observable<boolean> | Promise<boolean> {
    return this.settingService.init().then(() => {
      return true;
    }).catch((err) => {
      this.router.navigate(['/error']);
      return false;
    })	
  }

}
