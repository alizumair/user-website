import { Directive, Input, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appImage]'
})
export class ImageCompressionDirective implements AfterViewInit {

  @Input() url: string;
  @Input() size: string;
  @Input() noCrop: boolean = false

  constructor(
    private imageRef: ElementRef
  ) { }

  ngAfterViewInit(): void {
    if (!!this.url) {
      let image = this.url.match(/\/([^\/?#]+)[^\/]*$/) ? (this.url.match(/\/([^\/?#]+)[^\/]*$/))[1] : null;
      if (!!image) {
        const imageLink = `https://d1cihd31wcy9pr.cloudfront.net/royoapps-assets.s3-us-west-2.amazonaws.com/${image}?fill=${this.size}${!this.noCrop ? '&crop=center' : ''}`;
        const img = new Image();
        img.onload = () => this.setImage(imageLink);
        img.onerror = () => this.setImage(this.url);
        img.src = imageLink;
      }
    }
  }

  private setImage(src: string) {
    this.imageRef.nativeElement.setAttribute('src', src);
  }

}
