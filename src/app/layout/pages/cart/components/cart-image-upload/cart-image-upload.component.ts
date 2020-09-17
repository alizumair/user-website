import { ImageUpload } from './../../../../../shared/models/imageUpload.model';
import { ApiUrl } from './../../../../../core/apiUrl';
import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { HttpService } from './../../../../../services/http/http.service';
import { HttpClient } from '@angular/common/http';
import { GlobalVariable } from './../../../../../core/global';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-cart-image-upload',
  templateUrl: './cart-image-upload.component.html',
  styleUrls: ['./cart-image-upload.component.scss']
})
export class CartImageUploadComponent implements OnInit {

  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Input() loggedIn: boolean = false;
  @Output() prescriptionImages: EventEmitter<ImageUpload> = new EventEmitter<ImageUpload>(null);

  images: Array<any> = [];
  imageType: Array<string> = [];
  loading: boolean = false;

  constructor(
    private http: HttpService,
    private message: MessagingService,
    private translate: TranslateService
  ) {

    this.imageType = GlobalVariable.imageType;
  }

  ngOnInit() {
  }

  onImageSelect(event: any): void {
    if (!this.loggedIn) {
      this.message.alert('warning', this.translate.instant('Please Login To Continue'));
      return;
    }

    if (this.images.length > 4) {
      this.message.alert('warning', this.translate.instant('You Cannot Upload More Than 5 Images'));
      return;
    }

    if (event.target.files && event.target.files[0]) {
      let file = event.target.files[0];
      if (this.imageType.includes(file.type)) {
        if ((file.size / Math.pow(1024, 2)) <= 1) {
          this.uploadImage(event.target.files[0]);
        } else this.message.toast('warning', this.translate.instant('Image Size Must Be Less Than 1mb'));
      } else this.message.toast('warning', this.translate.instant('Invalid File Type'));
    }
  }

  uploadImage(file: any): void {
    this.loading = true;
    let formData = this.http.appendFormData({ file: file });
    this.http.postData(ApiUrl.uploadPaymentReceipt, formData)
      .subscribe(response => {
        if (!!response && response.data) {
          this.images.push(response.data);
          this.prescriptionImages.emit(new ImageUpload(this.images));
        }
        this.loading = false;
      }, err => { this.loading = false; });
  }

  removeImage(i: number): void {
    this.images.splice(i, 1);
    this.prescriptionImages.emit(new ImageUpload(this.images));
  }

}
