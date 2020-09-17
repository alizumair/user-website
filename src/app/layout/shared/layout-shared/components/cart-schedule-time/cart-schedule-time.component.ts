import { ApiUrl } from './../../../../../core/apiUrl';
import { HttpService } from './../../../../../services/http/http.service';
import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'underscore';

declare const $;

@Component({
  selector: 'app-cart-schedule-time',
  templateUrl: './cart-schedule-time.component.html',
  styleUrls: ['./cart-schedule-time.component.scss']
})
export class CartScheduleTimeComponent implements OnInit {

  dataLoaded: boolean = true;
  is_slot_selection: boolean = false;
  date: Date;
  minDate: Date;
  maxDate: Date;

  hover: any = {
    index: -1,
    tab: null
  };

  @Input() style: StyleVariables;
  @Input() settings: AppSettings;
  @Input() schedulingData: any = {};

  @Output() onScheduling: EventEmitter<any> = new EventEmitter<any>();
  @Output() onClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  slotData: Array<any> = [];
  selectedSlot: any = {};
  availabilities: any = {};

  public isShowTable: boolean;
  public tableRequestData: any = {};
  constructor(
    private message: MessagingService,
    private http: HttpService
  ) { }

  ngOnInit() {
    this.date = new Date();
    this.minDate = new Date();
    this.maxDate = new Date();
    this.maxDate.setDate(this.date.getDate() + 29);

    this.getAvailabilities();
  }

  ngOnChanges() {
    $("#cartScheduleModal").modal('show');
  }

  getSlots(date: Date) {
    this.dataLoaded = false;
    this.is_slot_selection = true;
    this.slotData = [];

    let params = {
      supplier_id: this.schedulingData.supplier_id,
      date: moment(date).format('YYYY-MM-DD'),
      date_order_type: this.schedulingData.date_order_type,
      latitude: this.schedulingData.latitude,
      longitude: this.schedulingData.longitude
    }

    this.http.getData(ApiUrl.getSupplierSlots, params)
      .subscribe(response => {
        if (!!response && response.data) {
          (response.data).forEach(slot => {
            this.availabilities.supplier_timings.forEach(sl => {
              this.availabilities.supplier_available_dates.forEach(el => {
                if (moment(date).format('YYYY-MM-DD') === moment(el.from_date).format('YYYY-MM-DD')) {
                  this.mapSlots(slot, el, sl, date, false);
                }
              });
              this.availabilities.weeks_data.forEach(el => {
                if (el.status == 1 && moment(date).day() == el.day_id) {
                  this.mapSlots(slot, el, sl, date, true);
                }
              });
            });
          });
          this.slotData = _.uniq(this.slotData.slice(), false, slot => { return slot.startTime && slot.endTime });
        }
        this.dataLoaded = true;
      });
  }

  mapSlots(slot, el, sl, date, is_week) {
    let format = 'hh:mm:ss';
    let selectDateSlot = moment(date).format('YYYY-MM-DD') + ' ' + slot;
    let time = moment(slot, format);
    let beforeTime = moment(sl.start_time, format);
    let afterTime = moment(sl.end_time, format);
    if (((el.id == sl.date_id && !is_week) || ((el.day_id == sl.day_id) && is_week)) && beforeTime <= time && time <= afterTime && moment(selectDateSlot) >= moment()) {
      let date_time = moment(date).format('YYYY-MM-DD') + ' ' + moment(slot, ["h:mm A"]).format('HH:mm:ss');
      this.slotData.push({
        time: this.timeFormat(slot),
        price: sl.price,
        slot_id: sl.id,
        startTime: date_time,
        endTime: moment(date_time).add(this.availabilities.supplier_slots_interval, 'minutes').format('YYYY-MM-DD HH:mm:ss')
      });
    }
  }

  getAvailabilities() {
    let params = {
      supplier_id: this.schedulingData.supplier_id,
      date_order_type: this.schedulingData.date_order_type,
      latitude: this.schedulingData.latitude,
      longitude: this.schedulingData.longitude
    }

    this.http.getData(ApiUrl.getSupplierAvailabilities, params)
      .subscribe(response => {
        if (!!response && response.data) {
          this.availabilities = response.data;
        }
      });
  }


  timeFormat(time): string {
    return moment(time, ["HH:mm:ss"]).format('h:mm A');
  }

  submit() {
    if (!!this.selectedSlot && !this.selectedSlot.time) {
      this.message.toast('info', 'Please select slot');
    } else {
      if (this.schedulingData.date_order_type === 3) {
        if (this.schedulingData.by_pass_tables_selection === "1") {
          this.emitTableBookingEvent(0);
        }
        else {
          this.isShowTable = true;
          this.is_slot_selection = false;
        }
      }
      else {
        this.onScheduling.emit(this.selectedSlot);
        $("#cartScheduleModal").modal('hide');
      }
    }
  }

  selectSlot(slot: any) {
    this.selectedSlot = slot;
    this.tableRequestData = this.schedulingData;
    this.tableRequestData.slot_id = this.selectedSlot.slot_id;
  }


  onTableSelection(event) {
    if (!event) {
      this.isShowTable = false;
      this.is_slot_selection = true;
    }
    else {
      this.emitTableBookingEvent(event.id);
    }
  }

  emitTableBookingEvent(table_id) {
    var table_booking_param = this.selectedSlot;
    table_booking_param['table_id'] = table_id;
    this.onScheduling.emit(table_booking_param);
    $("#cartScheduleModal").modal('hide');
  }






  onDismiss() {
    $("#cartScheduleModal").modal('hide');
    this.is_slot_selection = false;
    this.onClose.emit(true);
  }
}
