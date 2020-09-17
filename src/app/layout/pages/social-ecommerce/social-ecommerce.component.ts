import { Component, OnInit, OnDestroy } from "@angular/core";
import { UtilityService } from '../../../services/utility/utility.service';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/user/user.service';
import { HttpService } from '../../../services/http/http.service';
import { ApiUrl } from '../../../core/apiUrl';
import { PaginationModel } from '../../../shared/models/pagination.model';
import { StyleVariables } from './../../../core/theme/styleVariables.model';

@Component({
    selector: 'app-social-ecommerce',
    templateUrl: './social-ecommerce.component.html',
    styleUrls: ['./social-ecommerce.component.scss']
})
export class SocialEcommerceComponent implements OnInit, OnDestroy {
    public userSubscription: Subscription;
    public styleSubscription: Subscription;
    public openCreatePost: boolean;

    style: StyleVariables;
    public currentUser: any = {};
    pagination: PaginationModel;
    public postList: any = [];
    public postId: number;
    public actionType: string = "post";
    public totalPostCount: number = 0;
    public isNativeLoading: boolean;
    public isViewingTrending: boolean;
    constructor(
        private util: UtilityService,
        private userService: UserService,
        private http: HttpService
    ) {
        this.pagination = new PaginationModel();
    }
    ngOnInit() {
        this.getCurrentUser();
        this.getStyles();
    }

    getCurrentUser() {
        this.userSubscription = this.userService.currentUser
            .subscribe(user => {
                this.currentUser = user;
                this.getUserPosts();
            });
    }

    getStyles() {
        this.styleSubscription = this.util.getStyles
            .subscribe((style: StyleVariables) => {
                this.style = style;
            });
    }

    getUserPosts() {
        this.isNativeLoading = true;
        var params = {
            limit: this.pagination.perPage,
            offset: this.pagination.offset,
        }
        if (this.currentUser && this.currentUser.id) {
            params['user_id'] = this.currentUser.id
        }
        if (this.isViewingTrending) {
            params['is_trending'] = 1;
        }
        this.http.getData(ApiUrl.socialEcommerce.getPosts, params).subscribe((res: any) => {
            if (!!res && res.data) {
                this.postList.push(...res.data.list);
                this.totalPostCount = res.data.count;
            }
            this.isNativeLoading = false;
        }, error => {
            this.isNativeLoading = false;
        })
    }
    loadMore(event) {
        this.pagination.currentPage = event;
        this.pagination.offset += event;
        this.getUserPosts();
    }

    handlePostsEvent(event) {
        switch (event) {
            case 'delete':
            case 'created':
                this.postList = [];
                this.getUserPosts();
                break;
        }
    }
    viewPostTypes(event) {
        this.isViewingTrending = event;
        this.postList = [];
        this.totalPostCount = 0;
        this.getUserPosts();
    }
    openCreatePostDialog(action) {
        this.actionType = action;
        this.openCreatePost = true;
    }
    closeCreatePost(event) {
        this.postId = undefined;
        this.openCreatePost = event;
        this.util.authToggle.next(false);
    }
    handleUpdatePostEvent(event) {
        this.postId = event;
        this.openCreatePostDialog('upd');
    }

    trackByFn(id, index) {
        return index;
    }

    ngOnDestroy() {
        if (this.userSubscription) {
            this.userSubscription.unsubscribe();
        }
    }
}