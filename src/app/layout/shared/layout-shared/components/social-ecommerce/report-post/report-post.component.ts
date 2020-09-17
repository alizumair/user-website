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
    selector: 'app-report-post',
    templateUrl: './report-post.component.html',
    styleUrls: ['../create-post/create-post.component.scss', '../create-post/create-post.component.scss']
})
export class ReportPostComponent implements OnInit, OnDestroy {

    @Output() createReportEvent = new EventEmitter<string>();
    @Input('currentUser')
    set setCurrentUser(user) {
        if (user) {
            this.currentUser = user;
        }
    }
    @Input() userId: number;
    @Input('postId')
    set setPostId(postId) {
        if (postId) {
            this.postId = postId;
        }
    }

    @Output() closeReportPost = new EventEmitter<boolean>();
    @ViewChild('closeModal', { static: false }) closeModal: ElementRef;

    public styleSubscription: Subscription;

    public style: StyleVariables;
    public saveBtn: StyleConstants;
    public settings: AppSettings;

    public actionType: string;

    public postId: number;
    public currentUser: any;
    public reportPostForm: FormGroup
    public isLoading: boolean;
    public submitted: boolean;
    public isNativeLoading: boolean;


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
        this.initReportPostForm();
    }
    getStyles() {
        this.styleSubscription = this.util.getStyles
            .subscribe(style => {
                this.style = style;
            });
    }

    initReportPostForm() {
        this.reportPostForm = this._fb.group({
            'heading': new FormControl('', [Validators.required]),
            'description': new FormControl('')
        })
    }

    get postRF() { return this.reportPostForm.controls; }


    close() {
        this.closeModal.nativeElement.click();
    }

    openModal() {
        $("#auth").modal('show');
    }

    closeReportPostModal() {
        this.closeReportPost.emit(false);
    }



    onSubmit() {
        this.submitted = true;
        if (this.reportPostForm.invalid) {
            setTimeout(() => {
                this.submitted = false;
            }, 10000);
            return;
        }
        this.isNativeLoading = true;
        var payload = { ...this.reportPostForm.value };
        payload.user_id = this.currentUser.id;
        payload.post_id = this.postId;
        this.reportPost(payload);

    }
    reportPost(payload) {
        this.http.postData(ApiUrl.socialEcommerce.reportPost, payload).subscribe((res: any) => {
            this.isNativeLoading = false;
            if (res.status == 200) {
                this.message.toast('success', 'Post has been reported!');
                this.closeReportPostModal();
            }
        }, error => {
            this.isNativeLoading = false;
        })
    }




    ngOnDestroy() {
        this.close();
        if (this.styleSubscription) {
            this.styleSubscription.unsubscribe();
        }
    }


}