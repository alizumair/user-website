import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeSincePipe',
    pure: true
})
export class TimeSincePipe implements PipeTransform {

    transform(value: any, args?: string): any {
        var aDay = 24 * 60 * 60 * 1000;
        var str = new Date(value).toString();
        var dtt = new Date(str) as any;
        var times = this.timeSince(new Date(dtt));
        return times;
    }

    timeSince(date) {
        var dt = new Date() as any;
        var seconds = Math.abs((dt.getTime() - date.getTime()) / 1000);

        var interval = seconds / 31536000;
        if (interval > 1) {
            return Math.floor(interval) + " years ago";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + " months ago";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + " days ago";
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + " hours ago";
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + " minutes ago";
        }
        else{
            return "Few seconds ago";
        }

    }

}
