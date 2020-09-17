import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(value: any, args?: string): any {

    const format = 'HH:mm:ss';
    if (!args) {
      return moment(value).format(format);
    }

    switch (args) {
      case 'ago':
        return moment(value).fromNow(true);

      case 'merged':
        const now = new Date();
        const momentValue = moment(value);
        if (momentValue.isBefore(now, 'd')) {
          if (momentValue.isBefore(now, 'y')) {
            return moment(value).format('DD-MM-YYYY');
          } else {
            return moment(value).format('MMM DD');
          }
        } else {
          return moment(value).format('HH:mm');
        }
    }

    return moment(value).format(args);
  }

}
