import { SupplierModule } from '../../shared/supplier/supplier.module';
import { SupplierRoutingModule } from './suppliers.routing';
import { SharedModule } from '../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// components
import { SupplierListingComponent } from './supplier-listing/supplier-listing.component';
import { SupplierDetailsComponent } from './supplier-details/supplier-details.component';
import { LayoutSharedModule } from '../../shared/layout-shared/layout-shared.module';

@NgModule({
  declarations: [
    SupplierListingComponent,
    SupplierDetailsComponent
  ],
  imports: [
    CommonModule,
    // SharedModule,
    LayoutSharedModule,
    SupplierModule,
    SupplierRoutingModule,
  ]
})
export class SuppliersModule { }
