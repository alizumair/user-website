import { Observable, Subject } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'imagePipe' })
export class ImageCompressionPipe implements PipeTransform {

    transform(imageUrl: string, dimensions: string): Observable<any> {
        const subject = new Subject();
        let imageLink: string = '';
        if (!!imageUrl) {
            let image = imageUrl.match(/\/([^\/?#]+)[^\/]*$/) ? (imageUrl.match(/\/([^\/?#]+)[^\/]*$/))[1] : null;
            if (!!image) {
                imageLink = `https://d1cihd31wcy9pr.cloudfront.net/royoapps-assets.s3-us-west-2.amazonaws.com/${image}?fill=${dimensions}&crop=center`;
                this.imageExists(imageLink).then((isExist) => {
                    if (isExist) subject.next(imageLink)
                    else subject.next(imageUrl)
                })
            }
        } else {
            subject.next(imageUrl);
        }

        return subject.asObservable();
    }

    imageExists(path: string): Promise<boolean> {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = path;
        });
    };
}


