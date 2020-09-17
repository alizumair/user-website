import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { timer } from 'rxjs/observable/timer';
import { Observable, of } from 'rxjs';
import 'rxjs/add/operator/mergeMap';

@Injectable({
  providedIn: 'root'
})
export class SelectivePreloadingService implements PreloadingStrategy {

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data && route.data['preload']) {
      if (route.data['delay']) {
        return timer(4000).mergeMap(() => load());
      }
      return load();
    } else return of(null);
  }
} 