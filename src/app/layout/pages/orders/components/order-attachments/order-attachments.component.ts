import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { Component, OnInit, Input } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { MultimediaViewerComponent } from './../../../../../layout/shared/layout-shared/components/multimedia-viewer/multimedia-viewer.component';

@Component({
  selector: 'app-order-attachments',
  templateUrl: './order-attachments.component.html',
  styleUrls: ['./order-attachments.component.scss']
})
export class OrderAttachmentsComponent implements OnInit {

  @Input() order: any;
  @Input() settings: AppSettings

  constructor(
    public dialogService: DialogService
  ) { }

  ngOnInit() {
  }

  viewAttachment(url: string) {
    const dialogRef = this.dialogService.open(MultimediaViewerComponent, {
      dismissableMask: true,
      showHeader: false,
      transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      data: {
        url: url,
        type: 'image'
      }
    })

    dialogRef.onClose.subscribe(() => {
    })
  }

}
