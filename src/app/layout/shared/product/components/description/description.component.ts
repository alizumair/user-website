import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss']
})
export class DescriptionComponent implements OnInit {

  description: string = '';

  constructor(
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
  ) { }

  ngOnInit() {
    this.description = this.config.data.description;
  }

  close() {
    this.dialogRef.close();
  }

}
