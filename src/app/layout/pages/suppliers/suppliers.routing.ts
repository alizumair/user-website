import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupplierDetailsComponent } from './supplier-details/supplier-details.component';
import { SupplierListingComponent } from './supplier-listing/supplier-listing.component';

const routes: Routes = [
  {
    path: 'supplier-detail', component: SupplierDetailsComponent, data: {
      title: 'Supplier-Detail',
      description: 'Supplier Description',
      keyword: 'shopping, ecommerce'
    }
  },
  {
    path: 'supplier-list', component: SupplierListingComponent, data: {
      title: 'Supplier-List',
      description: 'Supplier Description',
      keyword: 'shopping, ecommerce'
    }
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class SupplierRoutingModule { }
