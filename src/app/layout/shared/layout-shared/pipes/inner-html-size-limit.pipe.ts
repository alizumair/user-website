import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
  name: 'innerHtmlLimit'
})
export class InnerHtmlSizeLimit implements PipeTransform {

  transform(value: string, limit: number): string {

    var changedString = String(value).replace(/<[^>]+>/gm, '');
    var length = changedString.length;

    return length > limit ? `${changedString.substr(0, limit - 1).trim()}..` : `${changedString.trim()}...`;

  }

}