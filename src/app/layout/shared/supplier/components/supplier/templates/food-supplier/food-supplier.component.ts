import { UtilityService } from './../../../../../../../services/utility/utility.service';
import { StyleConstants } from './../../../../../../../core/theme/styleConstants.model';
import { StyleVariables } from './../../../../../../../core/theme/styleVariables.model';
import { AppSettings } from './../../../../../../../shared/models/appSettings.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-food-supplier',
  templateUrl: './food-supplier.component.html',
  styleUrls: ['./food-supplier.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class FoodSupplierComponent implements OnInit {

  @Input() supplier: any;
  @Input() darkTheme: boolean;

  @Input() settings: AppSettings;
  @Input() style: StyleVariables;
  @Input() isBranch: boolean = false;

  @Output() onFavourite: EventEmitter<any> = new EventEmitter<any>();

  btnStyle: StyleConstants;
  subCatId: Array<any> = [];
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private util: UtilityService
  ) {
    this.style = new StyleVariables();
    this.btnStyle = new StyleConstants();
  }

  ngOnInit() {
    this.route.queryParams
      .subscribe(_params => {
        if (_params.f) {
          let params = this.util.decryptData(_params.f);
          this.subCatId = [params['subCatId']];
        }
      });
    if (this.settings.selected_template == 1 && this.settings.app_type == 1 && this.supplier.category && this.supplier.category.length) {
      let cat_names = [];
      (this.supplier.category).forEach(ct => {
        cat_names.push(ct.category_name)
      });
      this.supplier['category_names'] = (cat_names.splice(0, 4)).join(', ');
    }
    this.setBtnStyle();
  }

  onBtnHover() {
    this.btnStyle = {
      backgroundColor: this.style.baseColor,
      color: '#ffffff',
      borderColor: this.style.baseColor,
      transition: '1s'
    }
  }

  setBtnStyle() {
    this.btnStyle = {
      color: this.style.baseColor,
      borderColor: this.style.baseColor
    }
  }
  roundDistance(dis){
    let newDis = Math.round(dis);
    return newDis;
  }
  productList(supplier) {
    if (this.settings.is_single_vendor && this.settings.selected_template == 1) {
      let cat_ids: Array<any> = [];
      if (supplier.category && supplier.category.length) {
        supplier["category"].forEach(element => {
          cat_ids.push(element.category_id);
        });
      }
      let seoValue = supplier.name;
      let param_obj = {};
      Object.assign(param_obj, this.util.handler);
      param_obj["supplierId"] = [supplier.id];
      param_obj["showSupplier"] = true;
      param_obj['branch_id'] = supplier.supplier_branch_id;
      param_obj['categoryId'] = cat_ids.join();
      param_obj['subCatId'] = this.subCatId;
      this.router.navigate(["products/product-listing", seoValue], {
        queryParams: { f: this.util.encryptData(param_obj) }
      });
    } else {
      let queryParams = {
        supplierId: supplier.id,
      }
      if (this.isBranch) {
        queryParams['branchId'] = supplier.supplier_branch_id;
      }
      this.router.navigate(["products/listing"], {
        queryParams: queryParams
      });
    }
  }
}