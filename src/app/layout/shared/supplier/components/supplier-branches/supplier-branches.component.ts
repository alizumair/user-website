import { GlobalVariable } from './../../../../../core/global';
import { ApiUrl } from '../../../../../core/apiUrl';
import { UserService } from '../../../../../services/user/user.service';
import { HttpService } from '../../../../../services/http/http.service';
import { UtilityService } from '../../../../../services/utility/utility.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryFilter } from '../../../../../shared/models/categoryFilter';
import { AppSettings } from '../../../../../shared/models/appSettings.model';
import { PaginationModel } from '../../../../../shared/models/pagination.model';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-supplier-branches',
  templateUrl: './supplier-branches.component.html',
  styleUrls: ['./supplier-branches.component.scss']
})
export class SupplierBranchesComponent implements OnInit {

  @Input() supplierId: string;
  @Input() style: StyleVariables;
  @Input() settings: AppSettings;

  routeSubscription: Subscription;
  categorySubscription: Subscription;

  pagination: PaginationModel;

  branches: Array<any> = [];
  showData: boolean = false;

  isLoading: boolean = true;
  isBranch: boolean = true;
  siteName: string

  constructor(
    public util: UtilityService,
    private http: HttpService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.style = new StyleVariables();
    this.pagination = new PaginationModel();
    this.siteName = GlobalVariable.SITE_NAME;
  }

  ngOnInit() {
    if(this.settings.app_type == 1) {
      this.router.navigate([], {
        queryParamsHandling: 'merge',
        relativeTo: this.route,
        queryParams: {
          branchId: '',
        }
      });
    }

    this.getSupplierBranches();
  }

  getSupplierBranches() {
    this.isLoading = true;
    let param_data = {
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude,
      supplierId: this.supplierId
    };

    this.showData = false;
    this.http.postData(ApiUrl.getSupplierBranches, param_data)
      .subscribe(response => {
        if (!!response && response.data) {
          if (response.data.supplierList.length == 1) {
            this.supplierDetail(response.data.supplierList[0]);
          } else {
            this.branches = response.data.supplierList;
            this.branches.map((data: any) => {
              parseFloat(data["rating"]);
              data["display_supplier_image"] = this.util.thumbnail(
                data["supplier_image"]
              );
              data["display_logo"] = this.util.thumbnail(data["logo"]);
            });
            if(this.siteName == 'Sinsal')
            if(this.settings.is_branch_image_optional){
              this.branches = this.branches.filter(item => item.is_head_branch == 0)
            }
            this.showData = true;
            this.isLoading = false;
          }
        }
      }, (err) => this.isLoading = false);
  }

  supplierDetail(supplier: any) {
    if(this.settings.app_type == 1) {
      this.router.navigate([], {
        queryParamsHandling: 'merge',
        relativeTo: this.route,
        queryParams: {
          branchId: supplier.supplier_branch_id,
        }
      });
    }
  }

  ngOnDestroy() {
    if (!!this.routeSubscription) this.routeSubscription.unsubscribe();
    if (!!this.categorySubscription) this.categorySubscription.unsubscribe();
  }
}
