import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-native-loader',
  templateUrl: './native-loader.component.html',
  styleUrls: ['./native-loader.component.css']
})
export class NativeLoaderComponent implements OnInit, OnDestroy {

  public show = false;
  public loaderState_subs: Subscription;
  @Input('isNativeLoading')
  set loadingState(isLoading: boolean) {
    this.show = isLoading;
  }

  constructor() { }

  ngOnInit(): void {
  
  }
  ngOnDestroy() {
   
  }

}