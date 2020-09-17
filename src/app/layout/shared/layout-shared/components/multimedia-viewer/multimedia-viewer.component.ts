import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig } from "primeng/dynamicdialog";

@Component({
  selector: 'app-multimedia-viewer',
  templateUrl: './multimedia-viewer.component.html',
  styleUrls: ['./multimedia-viewer.component.scss']
})
export class MultimediaViewerComponent implements OnInit {

  file: any = {};

  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit() {
    this.file = this.config.data;
  }

  close() {
    this.dialogRef.close();
  }

}
