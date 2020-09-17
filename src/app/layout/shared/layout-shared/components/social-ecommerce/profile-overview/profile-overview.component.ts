import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { HttpService } from './../../../../../../services/http/http.service';
import { PaginationModel } from './../../../../../../shared/models/pagination.model';
import { ApiUrl } from './../../../../../../core/apiUrl';
import { TranslateService } from '@ngx-translate/core';
import { GlobalVariable } from '../../../../../../core/global';
import { MessagingService } from '../../../../../../services/messaging/messaging.service';
import { UserService } from '../../../../../../services/user/user.service';

@Component({
    selector: 'app-profile-overview',
    templateUrl: './profile-overview.component.html',
    styleUrls: ['./profile-overview.component.scss', '../../../../../pages/social-ecommerce/social-ecommerce.component.scss']
})
export class ProfileOverViewComponent implements OnInit {

    @Input('currentUser')
    set setCurrentUser(currentUser) {
        if (currentUser) {
            this.currentUser = currentUser;
        }
    }

    public currentUser: any = {};
    pagination: PaginationModel;
    public trendingPost: any = [];

    imageType = GlobalVariable.imageType;
    public profilePic: any;
    public showLoader: boolean;
    public viewTrend: boolean;

    @Output() isViewTrendingPost = new EventEmitter<boolean>();


    constructor(
        private http: HttpService,
        private translate: TranslateService,
        private message: MessagingService,
        private user: UserService,

    ) {
        this.pagination = new PaginationModel();
    }

    ngOnInit() {
        this.getTrendingPost();
    }


    getTrendingPost() {
        var obj = {
            limit: this.pagination.perPage,
            offset: this.pagination.offset,
            is_trending: 1
        }
        this.http.getData(ApiUrl.socialEcommerce.getPosts, obj).subscribe((res: any) => {
            if (res.status == 200) {
                this.trendingPost = res.data.list;
            }
        })
    }


    /********** On selection of image insert the value in form **********/
    onImageSelect(event: any) {
        if (event.target.files && event.target.files[0]) {
            let file = event.target.files[0];
            if (file.size / 1024 / 1024 < 5) {
                if (this.imageType.includes(file.type)) {
                    this.profilePic = event.target.files[0];
                    let reader: FileReader = new FileReader();
                    reader.readAsDataURL(event.target.files[0]);
                    reader.onload = (e: any) => {
                        this.profilePic = e.target.result;
                    }
                    this.updateProfilePic();
                } else this.message.toast('warning', this.translate.instant('Invalid File Type'));
            } else this.message.toast('warning', this.translate.instant('Image Size Should Be Less Than 5 Mb'));
        }
    }


    updateProfilePic() {
        var obj = {
            name: this.currentUser.firstname,
            profilePic: this.profilePic,
            accessToken: this.currentUser.access_token,
        }
        this.showLoader = true;
        let formData = this.http.appendFormData(obj);

        this.http.postData(ApiUrl.auth.signUp_step3, formData)
            .subscribe(response => {
                this.showLoader = false;
                if (!!response && response.data) {
                    this.message.toast("success", "Profile image updated successfuly");
                    this.user.setUserLocalData(response.data);
                }
            }, (err) => this.showLoader = false);
    }


    viewAllTrendPost(isTrend) {
        this.viewTrend = isTrend;
        this.isViewTrendingPost.emit(isTrend);
    }


}