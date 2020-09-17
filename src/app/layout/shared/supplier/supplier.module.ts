import { SharedModule } from './../../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupplierComponent } from './components/supplier/supplier.component';
import { SupplierSkeletonComponent } from './components/supplier-skeleton/supplier-skeleton.component';
import { FoodSupplierComponent } from './components/supplier/templates/food-supplier/food-supplier.component';
import { LayoutSharedModule } from '../layout-shared/layout-shared.module';
import { SupplierBranchesComponent } from './components/supplier-branches/supplier-branches.component';

const components = [
  SupplierComponent,
  SupplierSkeletonComponent,
  FoodSupplierComponent,
  SupplierBranchesComponent
];

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    CommonModule,
    // SharedModule,
    LayoutSharedModule
  ],
  exports: [
    ...components
  ]
})
export class SupplierModule { }
