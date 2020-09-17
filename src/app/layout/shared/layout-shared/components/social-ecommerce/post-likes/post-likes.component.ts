import { Component, Input, OnInit, ViewChild, ElementRef, Output, EventEmitter } from "@angular/core";
declare const $: any;
@Component({
    selector: 'app-post-likes',
    templateUrl: './post-likes.component.html',
    styleUrls: ['./post-likes.component.scss']
})
export class PostLikesComponent implements OnInit {
    public postLikes: any = [];
    @Input('postLikes')
    set setPostLikes(postLikes) {
        if (postLikes) {
            this.postLikes = postLikes;
        }
    }

    @ViewChild('closeModal', { static: false }) closeModal: ElementRef;
    @Output() closePostLikes = new EventEmitter<boolean>();


    constructor() {

    }
    ngOnInit() {
        this.openModal();
    }

    close() {
        this.closeModal.nativeElement.click();
        this.closePostLikes.emit(false);
    }

    openModal() {
        $("#auth").modal('show');
    }



}