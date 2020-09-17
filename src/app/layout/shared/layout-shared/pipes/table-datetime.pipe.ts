import { Pipe, Injectable, PipeTransform } from '@angular/core';
import * as moment from 'moment';
@Pipe({ name: "tableDateTime", pure: true })
@Injectable({
    providedIn: 'root',
})
export class TableDateTimePipe implements PipeTransform {
    transform(date: any, format: string): any {
        if (date) {
            var newStr = date.slice(0, -1);
            var monentDate = moment(newStr).format(format);
            return monentDate;
        }
    }
}