import { UserService } from './../user/user.service';
import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { GlobalVariable } from '../../core/global';

@Injectable({
  providedIn: 'root'
})
export class SocketConnection extends Socket {

  constructor(
    private user: UserService,
  ) {
    super({ url: `${environment.BASE_API_URL}?id=${user.currentUserValue.id}&secretdbkey=${GlobalVariable.SECRET_DB_KEY}&userType=2`, options: {} });
  }

}
