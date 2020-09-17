import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { AppSettings } from '../../../../../shared/models/appSettings.model';

@Component({
    selector: 'app-table-details',
    templateUrl: './table-details.component.html',
    styleUrls: ['./table-details.component.scss']
})
export class TableDetailsComponent implements OnInit {

    public tableDetails: any = {};

    @Output() onRemoveTableBooking: EventEmitter<boolean> = new EventEmitter<boolean>();


    @Input() style: StyleVariables;
    @Input() settings: AppSettings;
    @Input('tableDetails')
    set setTableDetails(tableDetails) {
        if (tableDetails) {
            this.tableDetails = tableDetails;
        }
    }

    constructor() {

    }
    ngOnInit() {

    }

    removeTableBooking() {
        this.onRemoveTableBooking.emit(true);
    }
}