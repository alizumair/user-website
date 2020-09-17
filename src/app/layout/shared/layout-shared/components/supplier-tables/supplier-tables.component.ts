import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { ApiUrl } from '../../../../../core/apiUrl';
import { MessagingService } from '../../../../../services/messaging/messaging.service';
import { HttpService } from '../../../../../services/http/http.service';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { AppSettings } from '../../../../../shared/models/appSettings.model';
import { PaginationModel } from "./../../../../../shared/models/pagination.model";

@Component({
    selector: 'app-supplier-tables',
    templateUrl: './supplier-tables.component.html',
    styleUrls: ['./supplier-tables.component.scss']
})
export class SupplierTablesComponent implements OnInit {
    supplierTables: Array<any> = [];
    selectedTable: any;

    public dataLoaded: boolean;
    pagination: PaginationModel;

    @Input() style: StyleVariables;
    @Input() settings: AppSettings;
    @Input() tableRequestData: any = {};

    @Output() onTableSelect: EventEmitter<any> = new EventEmitter<any>();

    public tableRequest_params: {} = {};
    hover: any = {
        index: -1,
        tab: null
    };

    constructor(
        private message: MessagingService,
        private http: HttpService
    ) {
        this.pagination = new PaginationModel();
    }

    ngOnInit() {
        this.getSupplierTables();
    }


    getSupplierTables() {
        this.tableRequest_params['supplier_id'] = this.tableRequestData.supplier_id;
        this.tableRequest_params['branch_id'] = this.tableRequestData.branch_id;
        this.tableRequest_params['limit'] = this.pagination.perPage;
        this.tableRequest_params['offset'] = this.pagination.offset;
        this.tableRequest_params['slot_id'] = this.tableRequestData.slot_id;
        this.http.getData(ApiUrl.getSupplierTableList, this.tableRequest_params).subscribe((response: any) => {
            if (!!response && response.data) {
                this.dataLoaded = true;
                this.supplierTables = response.data.list;
                this.pagination.count = response.data.count
            }
        })
    }

    selectTable(table: any) {
        this.selectedTable = table;
    }

    proceedWithTable(withTable: boolean) {
        if (!this.selectedTable && withTable) {
            this.message.toast('info', 'Please select table');
        } else {
            if (withTable) {
                this.onTableSelect.emit(this.selectedTable);
            }
            else {
                this.onTableSelect.emit(false);
            }
        }
    }
    pageChange(event) {
        this.pagination.currentPage = event;
        this.pagination.offset = event > 1 ? (event - 1) * this.pagination.perPage : 0;
        this.getSupplierTables();
    }
}