import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
  name: 'formatTimeInterval'
})
export class FormatTimeIntervalPipe implements PipeTransform {

  transform(mins: number): string {
    let hours: number = Math.floor(mins / 60);
    let remainingMinutes: number = mins % 60;
    let hr = '';
    let min = '';
    if (hours < 10) {
      hr = hours > 1 ? hours.toString() + ' Hours' : hours.toString() + ' Hour';
    } else {
      hr = hours.toString() + ' Hours';
    }
    if (remainingMinutes < 10) {
      min = remainingMinutes > 1 ? remainingMinutes.toString() + ' Minutes' : remainingMinutes.toString() + ' Minute';
    } else {
      min = remainingMinutes.toString() + ' Minutes';
    }
    if (hours == 0 && remainingMinutes != 0) return min;
    else if (hours != 0 && remainingMinutes == 0) return hr;
    else if (hours != 0 && remainingMinutes != 0) return hr + ' ' + min;
    else if (hours == 0 && remainingMinutes == 0) return '00:00';
  }

}