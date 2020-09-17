import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TransferState, makeStateKey, StateKey } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';

@Injectable()
export class TransferStateInterceptor implements HttpInterceptor {

  constructor(
    private transferState: TransferState,
    @Inject(PLATFORM_ID) private platformId: any) { }

  public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let key: StateKey<string> = makeStateKey<string>(request.url);

    if (isPlatformServer(this.platformId)) {
      return next.handle(request).pipe(
        tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.transferState.set<any>(key, event.body as any);
          }
        })
      );
    } else {
      const found = this.transferState.hasKey(key);
      if (found) {
        const storedResponse = this.transferState.get<any>(key, null as any);
        const response = new HttpResponse({ body: storedResponse, status: 200 });
        this.transferState.remove(key);
        return of(response);
      } else {
        return next.handle(request);
      }
    }
  }
}
