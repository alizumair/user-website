import { Component, Input, OnInit, ViewChild, ElementRef, Output, EventEmitter } from "@angular/core";
declare const $: any;
@Component({
    selector: 'app-image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {

    @Input() viewImage: string;

    @ViewChild('closeModal', { static: false }) closeModal: ElementRef;
    @Output() closeImageViewer = new EventEmitter<boolean>();


    constructor() {

    }
    ngOnInit() {
        this.openModal();
    }

    close() {
        this.closeModal.nativeElement.click();
        this.closeImageViewer.emit(false);
    }

    openModal() {
        $("#auth").modal('show');
    }



}