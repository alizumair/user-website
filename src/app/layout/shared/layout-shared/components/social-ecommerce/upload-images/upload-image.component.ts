import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ApiUrl } from './../../../../../../core/apiUrl';
import { HttpService } from './../../../../../../services/http/http.service';
import { MessagingService } from './../../../../../../services/messaging/messaging.service';
import { TranslateService } from '@ngx-translate/core';
import { GlobalVariable } from './../../../../../../core/global';
import { StyleVariables } from './../../../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../../../shared/models/appSettings.model';

@Component({
    selector: 'app-uplaod-image',
    templateUrl: './upload-image.component.html',
    styleUrls: ['./upload-image.component.scss']
})
export class UploadImageComponent implements OnInit {

    @Input() style: StyleVariables;
    @Input() settings: AppSettings;
    @Input('currentUser')
    set setCurrentUser(user) {
        if (user) {
            this.currentUser = user;
            if (!!user && user['access_token']) {
                this.loggedIn = true;
            } else {
                this.loggedIn = false;
            }
        }
    }
    @Input('autoImages')
    set autoImages(images: []) {
        if (images.length > 0) {
            this.images = images;
        }
    }
    @Output() onImageUpload: EventEmitter<any> = new EventEmitter<any>(null);
    @Output() imageInProcess: EventEmitter<boolean> = new EventEmitter<boolean>(null);


    images: Array<any> = [];
    imageType: Array<string> = [];
    loading: boolean = false;
    public loggedIn: boolean;
    public currentUser: any;

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
        this.imageInProcess.emit(true);
        let formData = this.http.appendFormData({ file: file, id: this.currentUser.id });
        this.http.postData(ApiUrl.uploadPaymentReceipt, formData)
            .subscribe(response => {
                this.imageInProcess.emit(false);
                if (!!response && response.data) {
                    this.images.push(response.data);
                    this.onImageUpload.emit({ images: this.images, event: 'upload' });
                }
                this.loading = false;
            }, err => { this.loading = false; this.imageInProcess.emit(false); });
    }

    removeImage(i: number): void {
        var removedImage = this.images[i];
        this.images.splice(i, 1);
        this.onImageUpload.emit({ images: this.images, event: 'remove', removedImage: removedImage });
    }

}