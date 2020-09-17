import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SocketConnection } from './socket-connection.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SocketsService {

  constructor(private socket: SocketConnection) { }

  getLocation(): Observable<any> {
    return this.socket
      .fromEvent("order_location").pipe(
        map(data => {
          return data;
        }));
  }

  removeListener(eventName: string) {
    this.socket.removeAllListeners(eventName);
    this.socket.disconnect();
  }

  sendMessage(msg: any) {
    this.socket.emit('sendMessage', msg, (response) => { console.log(response) });
  }
  
  joinRoom(payload: any) {
    this.socket.emit('join_room', payload);
  }

  getSendMessage(): Observable<any> {
    return this.socket
      .fromEvent("sendMessage").pipe(
        map(data => {
          return data;
        }));
  }

  getMessage(): Observable<any> {
    return this.socket
      .fromEvent("receiveMessage").pipe(
        map(data => {
          return data;
        }));
  }

}