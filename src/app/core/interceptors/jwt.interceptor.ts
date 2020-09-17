import { UserService } from './../../services/user/user.service';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalVariable } from '../global';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private user: UserService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    /********** add authorization header with jwt token if available **********/
    if(!GlobalVariable.BLOCK_HEADERS.includes(request['url'])) {
      let token = this.user.getUserToken;
      let headers = {};
      headers['secretdbkey'] = GlobalVariable.SECRET_DB_KEY;
      if (token) {
        headers['Authorization'] = token;
      }
      request = request.clone({
        setHeaders: headers
      });
    }
    return next.handle(request);
  }
}