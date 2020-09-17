import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';

@Component({
    selector: 'app-supplier-cat-sorting',
    templateUrl: './supplier-cat-sorting.component.html',
    styleUrls: ['./supplier-cat-sorting.component.scss']
})
export class SupplierCatSortingComponent implements OnInit {

    selectedCatSorting: string = '';

    public catSortValue: number = 0;
    @Input() style: StyleVariables;
    @Input() settings: AppSettings;
    @Input('catShortValue')
    set setCatSortValue(catSortValue: number) {
        this.catSortValue = catSortValue;
    }
    @Input() showLabel: boolean = true;
    @Input() labelText: string = 'Category by';

    @Output() onCatSort: EventEmitter<number> = new EventEmitter<number>();

    constructor() { }

    ngOnInit() {
        this.setSelectedCatSorting();
    }


    setSelectedCatSorting() {
        switch (this.catSortValue) {
            case 0:
                this.selectedCatSorting = 'Delivery';
                break;
            case 1:
                this.selectedCatSorting = 'Pick-Up';
                break;
            case 2:
                this.selectedCatSorting = 'Dining Table';
                break;
            default:
                this.selectedCatSorting = 'Delivery';
                break;

        }
    }

    onCatSortBy(value: number) {
        this.catSortValue = value;
        this.setSelectedCatSorting();
        this.onCatSort.emit(value);
    }


}
