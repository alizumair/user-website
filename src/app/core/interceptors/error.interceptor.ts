import { MessagingService } from './../../services/messaging/messaging.service';
import { UserService } from './../../services/user/user.service';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GlobalVariable } from '../global';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private translate: TranslateService,
    private message: MessagingService,
    private userService: UserService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request)
      .pipe(
        tap(event => {
          if (GlobalVariable.BLOCK_ERRORS.includes(request.url)) return;
          if (event instanceof HttpResponse) {
            switch (event.body.status) {
              case 401:
                /********** Auto logout if 401 response returned from api **********/
                this.userService.userSignOut();
                this.userService.setUserLocalData({});
                this.message.alert('error', 'OOPS!', `${this.translate.instant('Sorry, your account has been logged in other device! Please login again to continue.')}`);
                break;
              case 0:
                /********** If server dosent respond **********/
                // this.message.alert('error', 'OOPS!', `${this.translate.instant('HTTP Error Response.')}`);
                this.message.toast('error', 'Something Has Gone Wrong, Please Check Back In A While');
                break;
              case 400: case 500: case 8: case 404:
                /********** Check for other serve-side errors **********/
                this.message.toast('error', event.body.message);
                break;
            }
          }
        }, error => {
          if (GlobalVariable.BLOCK_ERRORS.includes(request.url)) return;
          switch (error.status) {
            case 401:
              if (!GlobalVariable.BLOCK_HEADERS.includes(request['url'])) {
                this.userService.userSignOut();
                this.userService.setUserLocalData({});
                /********** Auto logout if 401 response returned from api **********/
                this.message.alert('error', 'OOPS!', `${this.translate.instant('Sorry, your account has been logged in other device! Please login again to continue.')}`);
              }
              break;
            case 503:
              /********** service unavailable **********/
              // this.message.alert('error', 'OOPS!', `${this.translate.instant('Service Unavailable, Server Error.')}`);
              this.message.toast('error', `${this.translate.instant('The server is experiencing an outage, Please Try Again')}`);
              break;
            case 0:
              /********** If server dosent respond **********/
              // this.message.alert('error', 'OOPS!', `${this.translate.instant('HTTP Error Response.')}`);
              this.message.toast('error', 'Something Has Gone Wrong, Please Check Back In A While');
              break;
            default:
              /********** Check for other serve-side errors **********/
              if (!!error.error) {
                this.message.toast('error', error.error.message);
              }
              break;
          }
        }));
  }
}
