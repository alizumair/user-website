import { UtilityService } from './../../../../../services/utility/utility.service';
import { LocalizationPipe } from './../../../../../shared/pipes/localization.pipe';
import { FcmService } from './../../../../../services/fcm/fcm.service';
import { IForegroundNotification } from './../../../../../core/models/foreground-notification.interface';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api'


@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {

  foregroundNotification: IForegroundNotification;

  constructor(
    private messageService: MessageService,
    private fcmService: FcmService,
    private localization: LocalizationPipe,
    private utilityService: UtilityService
  ) { }

  ngOnInit() {
    this.utilityService.getForegroundNotification.subscribe((data: IForegroundNotification) => {
      this.foregroundNotification = data;
    })

    this.fcmService.currentMessage.subscribe((msg) => {
      if (msg)
        this.showMsg(msg);
    })
  }

  showMsg(msg) {
    if (msg.data.type == 'chat' && !this.foregroundNotification.showChat) return;
    this.messageService.add({ key: 'custom', severity: 'info', summary: `${this.localization.transform('order')} No. ${msg.data.orderId}`, detail: msg.notification.body });
  }

  onReject() {
    this.messageService.clear('custom');
  }

}
