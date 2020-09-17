import { ProductModule } from './../shared/product/product.module';
import { SupplierModule } from './../shared/supplier/supplier.module';
import { HomeModule } from './../shared/home/home.module';
import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceHomeComponent } from './service-home/service-home.component';
import { LayoutSharedModule } from '../shared/layout-shared/layout-shared.module';
import { HomeServiceRecentlyViewedComponent } from './templates/home-service-recently-viewed/home-service-recently-viewed.component';


const components = [
  ServiceHomeComponent
]

@NgModule({
  declarations: [
    ...components,
    HomeServiceRecentlyViewedComponent
  ],
  imports: [
    CommonModule,
    LayoutSharedModule,
    HomeModule,
    ProductModule,
    SupplierModule,
  ], exports: [
    ...components
  ]
})
export class HomeServiceModule { }
