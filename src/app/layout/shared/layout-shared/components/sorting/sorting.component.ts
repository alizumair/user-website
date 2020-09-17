import { UtilityService } from './../../../../../services/utility/utility.service';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { FiltersModel } from './../../../../../shared/models/filters.model';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-sorting',
  templateUrl: './sorting.component.html',
  styleUrls: ['./sorting.component.scss']
})
export class SortingComponent implements OnInit {

  selectedSorting: string;

  filters: FiltersModel;
  settings: AppSettings;
  style: StyleVariables;

  styleSubscription: Subscription;
  filterSubscription: Subscription;
  settingsSubscription: Subscription;

  constructor(
    private util: UtilityService,

  ) {
    this.filters = new FiltersModel();
    this.style = new StyleVariables()
  }

  ngOnInit() {

    this.styleSubscription = this.util.getStyles
      .subscribe((styleData: StyleVariables) => {
        this.style = styleData;
      });

    this.settingsSubscription = this.util.getSettings.subscribe((settings: AppSettings) => {
      if (settings) {
        this.settings = settings;
        if (settings.no_default_product_sort == 1) {
          this.selectedSorting = 'Default';
          this.filters.low_to_high = -1;
        }
      }
    });

    this.filterSubscription = this.util.getFilters
      .subscribe(filterData => {
        this.filters = filterData;
        this.setSelectedSorting();
      });
  }

  setSelectedSorting() {
    switch (this.filters.low_to_high) {
      case -1:
        this.selectedSorting = 'Default';
        break;
      case 0:
        this.selectedSorting = 'High to Low';
        break;
      case 1:
        this.selectedSorting = 'Low to High';
        break;
      case 3:
        this.selectedSorting = 'Popularity';
        break;
      default:
        this.selectedSorting = 'Low to High';
    }
  }

  onSort(type: number) {
    if (this.filters.low_to_high == type) {
      return;
    }
    this.filters.low_to_high = type;
    this.util.setFilters(this.filters);
  }

  ngOnDestroy() {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.filterSubscription) this.filterSubscription.unsubscribe();
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
  }
}
