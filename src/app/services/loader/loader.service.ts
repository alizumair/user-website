import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoaderState,  } from './../../core/loader'

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  public backGroundUrls: Array<any> = [];

  initialLoadingComplete = new BehaviorSubject(false);

  constructor() { }

  pageRefresh = new BehaviorSubject(false);

  private loaderSubject = new BehaviorSubject<LoaderState>({ show: false, refresh: false });
  loaderState = this.loaderSubject.asObservable();

  show() {
    this.loaderSubject.next(<LoaderState>{ show: true, refresh: false });
  }

  hide() {
    this.loaderSubject.next(<LoaderState>{ show: false, refresh: false });
    this.pageRefresh.next(false);
  }

  refreshShow() {
    this.loaderSubject.next(<LoaderState>{ show: false, refresh: true });
  }

}
