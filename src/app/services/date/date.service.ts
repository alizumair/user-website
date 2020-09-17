import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DateService {

  private _days: Array<string> = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  private _months: Array<string> = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

  constructor() { }

  getDayName(dayNumber: number): string {
    return this._days[dayNumber];
  }

  getMonthName(monthNumber: number): string {
    return this._months[monthNumber];
  }

  getDay(dayName: string): number {
    return this._days.findIndex(day => day === dayName);
  }
}
