import { ApiUrl } from './../../../../../core/apiUrl';
import { UserService } from './../../../../../services/user/user.service';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { HttpService } from './../../../../../services/http/http.service';
import { SocketsService } from './../../../../../services/sockets/sockets.service';
import { IForegroundNotification } from './../../../../../core/models/foreground-notification.interface';
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewChecked, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {

  foregroundNotification: IForegroundNotification;

  @ViewChild('scrollChat', { static: false }) private myScrollContainer: ElementRef;
  @Input() order: any = null;
  @Input() message_id: string = '';
  @Input() receiver_created_id: string = '';
  @Input() join_room: boolean = false;
  @Input() receiverName: string = '';
  @Input() receiverImage: string = '';
  @Input() btnText: string = 'Chat';
  @Input() receiverType: number = 1;
  

  showEmojiPicker: boolean = false;
  messages: Array<IMessage> = [];
  msgText: string = '';
  disableScrollDown: boolean = false;
  user: any;
  userSubscription: Subscription;

  constructor(
    private socketService: SocketsService,
    private httpService: HttpService,
    private utilService: UtilityService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.utilService.getForegroundNotification.subscribe((data: IForegroundNotification) => {
      this.foregroundNotification = data;
    });

    this.userSubscription = this.userService.currentUser.subscribe((user) => {
      this.user = user;
    });

    if(this.order) {
      this.receiverName = this.order.agent[0].name;
      this.receiverImage = this.order.agent[0].image;
    }
  }

  onOpen() {
    if(this.receiverType == 4) {
      this.getMessageId();
    } else {
      this.fetchConversation();
      this.getMessage();
      this.getSendMessage();
    }
    this.foregroundNotification.showChat = false;
    this.utilService.setForegroundNotification(this.foregroundNotification);
  }

  getMessageId() {
    let params = {
      userType: 'Admin',
      user_created_id: this.userService.currentUserValue.user_created_id
    }
    this.httpService.getData(ApiUrl.getMessageId, params)
      .subscribe(response => {
        if(!!response && response.data) {
          this.message_id = response.data.message_id;
          this.fetchConversation();
          this.getMessage();
          this.getSendMessage();        }
      });
  }

  joinRoom() {
    let payload = {
      message_id: this.message_id ? this.message_id : '',
      username: this.userService.currentUserValue.firstname
    };
    this.socketService.joinRoom(payload);
  }

  fetchConversation() {
    this.httpService.getData(ApiUrl.getChat, {
      limit: 300,
      skip: 0,
      userType: '2',
      message_id: this.message_id ?  this.message_id : '',
      order_id: this.order ? this.order.order_id : '',
      receiver_created_id: this.receiver_created_id ? this.receiver_created_id : '',
      accessToken: this.userService.getUserToken
    }).subscribe((response) => {
      this.messages = response.data.reverse();
      if(this.join_room) {
        this.joinRoom();
      }
    });
  }

  sendMessage(text: string) {
    if (!text) return;
    const msg: SendMessage = new SendMessage(text, 'text', this.receiver_created_id, this.receiverType);
    if(this.order) {
      msg['order_id'] = this.order.order_id;
    }
    msg['message_id'] = this.message_id ? this.message_id : (this.join_room ? '' : 0);
    msg['sender_created_id'] = this.userService.currentUserValue.id
    const payload: any = new Object({ detail: msg });
    this.socketService.sendMessage(payload);
    this.messages.push({
      c_id: 0,
      sent_at: msg.sent_at,
      send_by: this.user.user_created_id,
      send_to: msg.receiver_created_id ? msg.receiver_created_id : '',
      chat_type: msg.chat_type,
      message_id: 0,
      order_id: payload.order_id,
      text: msg.text
    })
    this.disableScrollDown = false;
    this.msgText = '';
  }

  getSendMessage() {
    this.socketService.getSendMessage().subscribe((data) => {
      if (data.detail && data.detail.order_id == this.order.order_id)
        this.messages.push(data.detail);
    })
  }

  getMessage() {
    this.socketService.getMessage().subscribe((data) => {
      this.messages.push(data.detail);
      this.disableScrollDown = false;
    })
  }

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event) {
    const text = `${this.msgText}${event.emoji.native}`;
    this.msgText = text;
    this.showEmojiPicker = false;
  }

  onScroll() {
    let element = this.myScrollContainer.nativeElement
    let atBottom = element.scrollHeight - element.scrollTop === element.clientHeight
    if (this.disableScrollDown && atBottom) {
      this.disableScrollDown = false
    } else {
      this.disableScrollDown = true
    }
  }

  ngAfterViewChecked(): void {
    this.scrollChatBottom();
  }

  scrollChatBottom() {
    if (this.disableScrollDown) return;
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

  onClose() {
    this.foregroundNotification.showChat = true;
    this.utilService.setForegroundNotification(this.foregroundNotification);
  }

  ngOnDestroy(): void {
    this.socketService.removeListener('receiveMessage');
  }

}


class SendMessage {
  text: string;
  type: number = 1;
  chat_type: 'text' | 'image';
  receiver_created_id: string;
  sent_at: string;
  offset: string;

  constructor(text: string, chat_type: 'text' | 'image', receiver_created_id: string, type) {
    this.text = text;
    this.type = type;
    this.receiver_created_id = receiver_created_id || '';
    this.chat_type = chat_type || 'text';
    this.sent_at = moment().format('YYYY-MM-DD HH:mm:ss')
    this.offset = moment().format('Z');;
  }
}


interface IMessage {
  c_id: number;
  send_to: string;
  send_by: string;
  text: string;
  message_id: number;
  sent_at: string;
  send_to_deleted?: number;
  send_by_deleted?: number;
  original?: string;
  thumbnail?: string;
  chat_type: 'text' | 'image';
  order_id: string;
}
