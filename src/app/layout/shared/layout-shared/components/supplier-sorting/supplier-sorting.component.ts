import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';

@Component({
  selector: 'app-supplier-sorting',
  templateUrl: './supplier-sorting.component.html',
  styleUrls: ['./supplier-sorting.component.scss']
})
export class SupplierSortingComponent implements OnInit {

  selectedSorting: string = '';

  @Input() style: StyleVariables;
  @Input() sortValue: number = 1; //by default Distance wise sort
  @Input() showLabel: boolean = true;
  @Input() labelText: string = 'Sort by';

  @Output() onSort: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
    this.setSelectedSorting();
  }


  setSelectedSorting() {
    switch (this.sortValue) {
      case 0:
        this.selectedSorting = 'New';
        break;
      case 1:
        this.selectedSorting = 'Distance';
        break;
      case 2:
        this.selectedSorting = 'Rating';
        break;
      case 3:
        this.selectedSorting = 'Alphabetically';
        break;
      case 5:
        this.selectedSorting = 'Open';
        break;
      case 6:
        this.selectedSorting = 'Closed';
        break;
      default:
        this.selectedSorting = 'New';
    }
  }

  onSortBy(value: number) {
    this.sortValue = value;
    this.setSelectedSorting();
    this.onSort.emit(value);
  }

}
