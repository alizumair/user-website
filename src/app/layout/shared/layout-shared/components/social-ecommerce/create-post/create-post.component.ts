import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy, Input } from "@angular/core";
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { HttpService } from './../../../../../../services/http/http.service';
import { ApiUrl } from './../../../../../../core/apiUrl';
import { UtilityService } from './../../../../../../services/utility/utility.service';
import { MessagingService } from './../../../../../../services/messaging/messaging.service';
import { StyleVariables } from './../../../../../../core/theme/styleVariables.model';
import { StyleConstants } from './../../../../../../core/theme/styleConstants.model';
import { AppSettings } from './../../../../../../shared/models/appSettings.model';
import { Subscription } from 'rxjs';

declare const $: any;

@Component({
    selector: 'app-create-post',
    templateUrl: './create-post.component.html',
    styleUrls: ['./create-post.component.scss']
})
export class CreatePostComponent implements OnInit, OnDestroy {

    @Output() createPostEvent = new EventEmitter<string>();
    @Input('currentUser')
    set setCurrentUser(user) {
        if (user) {
            this.currentUser = user;
        }
    }
    @Input('postId')
    set setPostId(postId) {
        if (postId) {
            this.postId = postId;
        }
    }
    @Input('actionType')
    set setActionType(actionType) {
        if (actionType) {
            this.actionType = actionType;
        }
    }

    @Output() closeCreatePost = new EventEmitter<boolean>();
    @ViewChild('closeModal', { static: false }) closeModal: ElementRef;

    public styleSubscription: Subscription;

    public style: StyleVariables;
    public saveBtn: StyleConstants;
    public settings: AppSettings;

    public actionType: string;

    public postId: number;
    public postDetails: any;
    public removedOldPostImages: any = []
    public currentUser: any;
    public createPostForm: FormGroup
    public suppliers: any[];
    public supplierDetails: any = {};
    public selectedSupplier: any;
    public products: any[];
    public selectedProduct: any;
    public images: any[] = [];
    public isLoading: boolean;
    public submitted: boolean;
    public isNativeLoading: boolean;
    public serviceProviderLable: string = "";
    public itemLable: string = "";
    public isImageInProcess: boolean;


    constructor(
        private _fb: FormBuilder,
        private http: HttpService,
        private util: UtilityService,
        private message: MessagingService,
    ) {

    }

    ngOnInit() {
        this.openModal();
        this.getStyles();
        this.getSuppliers();
        this.initCreatePostForm();
    }
    getStyles() {
        this.styleSubscription = this.util.getStyles
            .subscribe(style => {
                this.style = style;
            });
        this.util.getSettings.subscribe((settings: AppSettings) => {
            this.settings = settings;
            this.setFormLabels(settings.app_type);
        })
    }

    setFormLabels(appType) {
        switch (appType) {
            case 1:
                this.serviceProviderLable = "Select Restaurant";
                this.itemLable = "Select Food Item";
                break;
            case 2:
                this.serviceProviderLable = "Select Supplier";
                this.itemLable = "Select Product";
                break;
            case 8:
                this.serviceProviderLable = "Select Service Provider";
                this.itemLable = "Select Product";
                break;
        }
    }

    initCreatePostForm() {
        this.createPostForm = this._fb.group({
            'heading': new FormControl('', [Validators.required]),
            'description': new FormControl('')
        })
    }
    get postF() { return this.createPostForm.controls; }


    close() {
        this.closeModal.nativeElement.click();
    }

    openModal() {
        $("#auth").modal('show');
    }

    closeCreatePostModal() {
        this.closeCreatePost.emit(false);
    }

    getUserPostDetails() {
        var obj = {
            id: this.postId
        }
        this.http.getData(ApiUrl.socialEcommerce.getUserPostDetails, obj).subscribe((res: any) => {
            if (res.status == 200) {
                this.postDetails = res.data[0];
                if (this.postDetails) {
                    var imgList = [];
                    this.postDetails.post_images.forEach(element => {
                        imgList.push(element.image);
                    });
                    this.images = imgList;
                    if (this.postDetails.product_id) {
                        this.selectedSupplier = this.suppliers.find(x => x.id == this.postDetails.supplier_id);
                        if (this.selectedSupplier) {
                            this.getProducts();
                        }
                    }
                }
                this.createPostForm.patchValue({
                    heading: this.postDetails.heading,
                    description: this.postDetails.description
                })
            }
        })
    }

    getSuppliers() {
        this.isLoading = true;
        let param_data = {
            languageId: this.util.handler.languageId,
            latitude: this.util.handler.latitude,
            longitude: this.util.handler.longitude,
            sort_by: 1
        };
        this.http.getData(ApiUrl.getHomeSuppliers, param_data, true, true)
            .subscribe(response => {
                this.isLoading = false;
                if (!!response && response.data) {
                    this.suppliers = [];
                    this.suppliers = response.data;
                    if (this.postId) {
                        setTimeout(() => {
                            if (this.postId) {
                                this.getUserPostDetails();
                            }
                        }, 500);
                    }
                }
            });
    }
    onSupplierSelect() {
        this.getProducts();
    }
    onProductSelect() {
        this.images = [];
        if (this.selectedProduct.cate_image) {
            this.images.push(this.selectedProduct.cate_image);
        }
    }
    getProducts() {
        let param_data = {
            languageId: this.util.handler.languageId,
            supplier_id: this.selectedSupplier.id,
            latitude: this.util.handler.latitude,
            longitude: this.util.handler.longitude
        }
        this.http.getData(ApiUrl.getSupplierDetailProduct, param_data)
            .subscribe(response => {
                if (!!response && response.data) {
                    this.products = [];
                    this.supplierDetails = response.data.supplier_detail;
                    // var imgs = [];
                    response.data.product.forEach((element, index) => {
                        element.value.forEach((val, indx) => {
                            this.products.push(val);
                            // if (val.cate_image) {
                            //     imgs.push(val.cate_image);
                            // }
                        });
                    });
                    //this.images = imgs;
                    if (this.postId && this.postDetails) {
                        this.selectedProduct = this.products.find(x => x.product_id == this.postDetails.product_id)
                    }
                }
                console.log(this.products)
            })
    }


    onImageUpload(event) {
        if (this.images.length <= 0) {
            this.images.push(...event.images);
        }
        else {
            this.images = event.images;
        }
        if (event.event == 'remove') {
            if (this.postId && this.postDetails) {
                var oldRemovedImage = this.postDetails.post_images.find(x => x.image == event.removedImage);
                if (oldRemovedImage) {
                    this.removedOldPostImages.push(oldRemovedImage);
                }
            }
        }
    }

    handleImageProcess(event) {
        this.isImageInProcess = event;
    }


    onSubmit() {
        this.submitted = true;
        if (this.createPostForm.invalid) {
            setTimeout(() => {
                this.submitted = false;
            }, 10000);
            return;
        }
        if (this.selectedSupplier) {
            if (!this.selectedProduct) {
                this.message.toast("error", "Please select the product!");
                return;
            }
        }
        if (this.images.length <= 0) {
            if (this.actionType == 'post' || this.actionType == 'upd' && this.selectedSupplier) {
                this.message.toast("error", "Please upload at least one image!");
                return;
            }
        }
        if (this.isImageInProcess) {
            this.message.toast("error", "Please wait untill image uplaod!");
            return;
        }
        this.isNativeLoading = true;
        var payload = { ...this.createPostForm.value };
        payload.user_id = this.currentUser.id;
        if (this.actionType == 'post' || this.actionType == 'que' || this.actionType == 'upd') {
            if (this.actionType != 'que') {
                if (this.selectedSupplier) {
                    payload.supplier_id = this.selectedSupplier.id;
                    payload.product_id = this.selectedProduct.product_id;
                    payload.branch_id = this.supplierDetails.supplier_branch_id;
                }
            }
            if (this.actionType == 'upd') {
                var imgList = [];
                this.images.forEach(img => {
                    var imgObj = {};
                    imgObj['image'] = img;
                    imgList.push(imgObj);
                });
                this.postDetails.post_images.forEach(postImg => {
                    imgList.forEach(upImg => {
                        if (postImg.image == upImg.image) {
                            imgList.splice(upImg.image, 1);
                        }
                    });
                });
                this.removedOldPostImages.forEach(rOldImg => {
                    imgList.push(rOldImg);
                });
                payload.post_images = imgList;
            }
            else {
                payload.post_images = this.images;
            }
        }
        if (this.postId && this.postDetails) {
            payload.id = this.postId;
            delete payload.user_id;
            this.updateOldPost(payload);
        }
        else {
            this.createNewPost(payload);
        }
    }
    createNewPost(payload) {
        this.http.postData(ApiUrl.socialEcommerce.createPost, payload).subscribe((res: any) => {
            this.isNativeLoading = false;
            if (res.status == 200) {
                this.message.alert("success", "Post created!");
                this.close();
                this.createPostEvent.emit('created');
            }
        }, error => {
            this.isNativeLoading = false;
        })
    }
    updateOldPost(payload) {
        this.http.putData(ApiUrl.socialEcommerce.updatePost, payload).subscribe((res: any) => {
            this.isNativeLoading = false;
            if (res.status == 200) {
                this.message.alert("success", "Post updated!");
                this.close();
                this.createPostEvent.emit('created');
            }
        }, error => {
            this.isNativeLoading = false;
        })
    }


    clearData() {
        this.postId = undefined;
        this.postDetails = undefined;
        this.currentUser = undefined;
        this.suppliers = undefined;
        this.supplierDetails = undefined;;
        this.selectedSupplier = undefined;
        this.products = undefined;
        this.selectedProduct = undefined;
        this.images = undefined;
        this.isLoading = undefined;
    }


    ngOnDestroy() {
        this.clearData();
        this.close();
        if (this.styleSubscription) {
            this.styleSubscription.unsubscribe();
        }
    }


}