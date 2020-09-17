import { PipeTransform, Pipe } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'prepTime'
})
export class PrepTimePipe implements PipeTransform {

  transform(value: string): string {
    let time: string = '';

    let hour = moment(value, 'HH:mm:ss').hour();
    let minute = moment(value, 'HH:mm:ss').minute();

    if(hour) {
      time = hour + (hour > 1 ? ' Hours' : ' Hour');
    }

    if(minute) {
      time += ' ' + minute + (minute > 1 ? ' Minutes' : ' Minute');
    }

    return time;
  }

}