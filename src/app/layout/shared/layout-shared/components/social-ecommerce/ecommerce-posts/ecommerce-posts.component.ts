import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { HttpService } from '../../../../../../services/http/http.service';
import { MessagingService } from '../../../../../../services/messaging/messaging.service';
import { ApiUrl } from '../../../../../../core/apiUrl';
import { PaginationModel } from '../../../../../../shared/models/pagination.model';
import { CartService } from '../../../../../../services/cart/cart.service';
import { AddOnComponent } from './../../../../../../layout/shared/product/components/add-on/add-on.component';
import { DialogService } from 'primeng/dynamicdialog';
import { UtilityService } from './../../../../../../services/utility/utility.service';
import { StyleVariables } from './../../../../../../core/theme/styleVariables.model';
import { Router } from '@angular/router';
import { AppSettings } from './../../../../../../shared/models/appSettings.model';

@Component({
    selector: 'app-ecommerce-posts',
    templateUrl: './ecommerce-posts.component.html',
    styleUrls: ['../../../../../pages/social-ecommerce/social-ecommerce.component.scss']
})
export class EcommercePostComponent implements OnInit {

    public currentUser: any = {};
    public post: any = {};
    public userComment: string = "";
    public userCommentId: number;
    pagination: PaginationModel;
    public userCommentList: any = [];
    public userLikesList: any = [];
    public toggleComment: boolean;
    public loggedIn: boolean;
    public openReportPost: boolean;
    public showLikeList: boolean;
    public isNativeLoading: boolean;
    public totalCommentCount: number = 0;
    public isLikeInProcess: boolean;
    public openImageViewer: boolean;
    public imageToView: string;


    slideConfig = {
        "slidesToShow": 1,
        "slidesToScroll": 1,
        "dots": true,
        "arrows": false,
        "infinite": false,
        "autoplay": true,
        "autoplaySpeed": 3000
    };

    settings: AppSettings;


    @Output() postsEvent = new EventEmitter<string>();
    @Output() updatePostEvent = new EventEmitter<string>();

    @Input() style: StyleVariables;

    @Input('currentUser')
    set setCurrentUser(currentUser) {
        if (currentUser) {
            this.currentUser = currentUser;
            if (!!currentUser && currentUser['access_token']) {
                this.loggedIn = true;
            } else {
                this.loggedIn = false;
            }
        }
    }
    @Input('post')
    set userPost(post) {
        if (post) {
            this.post = post;
        }
    }


    constructor(
        private http: HttpService,
        private message: MessagingService,
        public cartService: CartService,
        public dialogService: DialogService,
        private util: UtilityService,
        private router: Router
    ) {
        this.pagination = new PaginationModel();
    }

    ngOnInit() {
        this.util.getSettings.subscribe((settings: AppSettings) => {
            this.settings = settings;
        })
    }



    deletePost() {
        this.http.deleteData(ApiUrl.socialEcommerce.deletePost, this.post.id).subscribe((res: any) => {
            if (res.status == 200) {
                this.message.toast("success", "Post deleted");
                this.postsEvent.emit('delete');
            }
        })
    }
    likePost() {
        var obj = {
            id: this.post.id
        }
        if (this.isLikeInProcess) {
            return;
        }
        this.isLikeInProcess = true;
        this.post.already_like = true;
        this.http.postData(ApiUrl.socialEcommerce.addLike, obj).subscribe((res: any) => {
            this.isLikeInProcess = false;
            if (res.status == 200) {
                this.getUserPostLikes();
            }
        }, error => {
            this.isLikeInProcess = false;
        })
    }
    commentOnPost() {
        if (!this.userComment || this.userComment == "" || !/\S/.test(this.userComment)) {
            this.message.toast("error", "Comment can not be empty");
            return;
        }
        if (this.userCommentId) {
            this.editComment();
            return;
        }
        var obj = {
            id: this.post.id,
            comment: this.userComment
        }
        this.http.postData(ApiUrl.socialEcommerce.addComment, obj).subscribe((res: any) => {
            if (res.status == 200) {
                this.userComment = "";
                this.toggleComment = true;
                this.getUserPostComments();
            }
        })
    }

    toggleComments() {
        this.toggleComment = !this.toggleComment;
        if (this.toggleComment) {
            this.getUserPostComments();
        }
    }

    getUserPostLikes() {
        var obj = {
            post_id: this.post.id,
            limit: this.pagination.perPage,
            offset: this.pagination.offset,
        }
        this.http.getData(ApiUrl.socialEcommerce.getPostLikes, obj).subscribe((res: any) => {
            if (res.status == 200) {
                this.userLikesList = res.data.list;
                var getL = this.userLikesList.find(x => x.user_id == this.currentUser.id);
                if (getL) {
                    this.post.already_like = true;
                }
                else {
                    this.post.already_like = false;
                }
            }
        })
    }

    getUserPostComments() {
        this.getUserPostLikes();
        var obj = {
            post_id: this.post.id,
            limit: 5,
            offset: this.pagination.offset,
        }
        this.http.getData(ApiUrl.socialEcommerce.getPostComments, obj).subscribe((res: any) => {
            if (res.status == 200) {
                this.userComment = "";
                this.userCommentList = res.data.list;
                this.totalCommentCount = res.data.count;
            }
        })
    }
    loadMore(event) {
        this.pagination.currentPage = event;
        this.pagination.offset += event;
        this.getUserPostComments();
    }
    loadPrevious(event) {
        this.pagination.currentPage = event;
        this.pagination.offset -= event;
        this.getUserPostComments();
    }

    deleteComment(comment) {
        var obj = {
            id: comment.id
        }
        this.http.postData(ApiUrl.socialEcommerce.deleteComment, obj).subscribe((res: any) => {
            if (res.status == 200) {
                this.getUserPostComments();
            }
        })
    }
    onEditComment(comment) {
        this.userComment = comment.comment;
        this.userCommentId = comment.id;
    }
    editComment() {
        var obj = {
            comment: this.userComment,
            id: this.userCommentId
        }
        this.http.postData(ApiUrl.socialEcommerce.updateComment, obj).subscribe((res: any) => {
            if (res.status == 200) {
                this.userCommentId = undefined;
                this.getUserPostComments();
            }
        })
    }

    removeUserLike() {
        var obj = {
            post_id: this.post.id,
            user_id: this.currentUser.id
        }
        this.post.already_like = false;
        this.http.postData(ApiUrl.socialEcommerce.removeLike, obj).subscribe((res: any) => {
            if (res.status == 200) {
                this.getUserPostLikes();
            }
        })
    }


    updatePost(post) {
        this.updatePostEvent.emit(post.id)
    }
    blockUser(post) {
        this.message.confirm("Block User", "Do you want to continue").then((res: any) => {
            if (res.value) {
                var obj = {
                    blocked_by_user_id: this.currentUser.id,
                    blocked_user_id: post.user_id,
                    is_block: 1
                }
                this.http.postData(ApiUrl.socialEcommerce.blockUnblockUser, obj).subscribe((res: any) => {
                    if (res.status == 200) {
                        this.message.toast("success", "User has been blocked");
                        this.postsEvent.emit('created');
                    }
                })
            }
        })
    }
    reportPost() {
        this.openReportPost = true;
    }
    closeReportPost(event) {
        this.openReportPost = event;
        this.util.authToggle.next(false);
    }

    openLikesModal() {
        this.getUserPostLikes();
        this.showLikeList = true;
    }
    handleLikesListEvent(event) {
        this.showLikeList = event;
    }

    createOrder() {
        this.getProductDetail();
    }
    getProductDetail() {
        let param_data = {
            languageId: this.util.handler.languageId,
            supplier_id: this.post.supplier_id,
            latitude: this.util.handler.latitude,
            longitude: this.util.handler.longitude
        }
        let api = '';
        if (this.settings.branch_flow == 1) {
            param_data['supplier_branch_id'] = this.post.branch_id;
            api = ApiUrl.getSupplierBranchProduct;
        } else {
            api = ApiUrl.getSupplierDetailProduct;
        }
        this.isNativeLoading = true;
        this.http.getData(api, param_data)
            .subscribe(response => {
                this.isNativeLoading = false;
                if (!!response && response.data) {
                    var allProducts = response.data.product;
                    var products = allProducts.slice();
                    var currentProduct = {};
                    allProducts.forEach(element => {
                        element.value.forEach(val => {
                            if (val.product_id == this.post.product_id) {
                                currentProduct = val;
                                return;
                            }
                        });
                    });
                    this.addProduct(currentProduct, products);
                }
            }, error => {
                this.isNativeLoading = false;
            });
    }

    addProduct(product, products) {
        if (product['is_product_adds_on'] !== 1) {
            this.cartService.addToCart(product, products);
            this.message.toast("success", "Your item has been added into the cart.");
            this.router.navigate(['/cart']);
            return;
        }
        this.openAddOnDialog(product);
    }

    openAddOnDialog(product) {
        const dialogRef = this.dialogService.open(AddOnComponent, {
            header: product['name'],
            width: '45%',
            style: { 'background-color': `${this.style.primaryColor} !important` },
            showHeader: false,
            // contentStyle: { "max-height": "350px", "overflow": "auto" },
            transitionOptions: '600ms cubic-bezier(0.25, 0.8, 0.25, 1)',
            data: {
                product: product,
                addOnItems: product['adds_on']
            }
        })

        dialogRef.onClose.subscribe(() => {
        })
    }

    goToSupplier() {
        this.router.navigate(["products/listing"], {
            queryParams: {
                supplierId: this.post.supplier_id
            }
        });
    }

    showImage(image) {
        this.imageToView = image;
        this.openImageViewer = true;
    }

    closeImageViewer(event) {
        this.openImageViewer = event;
    }



    trackByFn(id, index) {
        return index;
    }
}