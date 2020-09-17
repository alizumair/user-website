/**************** MODULE **************/
import { SharedModule } from './../../shared/shared.module';
import { SupplierModule } from './../shared/supplier/supplier.module';
import { ProductModule } from './../shared/product/product.module';
import { HomeModule } from './../shared/home/home.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**************** COMPONENT **************/
import { FoodHomeComponent } from './food-home/food-home.component';
import { FoodListingComponent } from './food-listing/food-listing.component';
import { FoodSpecialOffersComponent } from './templates/food-special-offers/food-special-offers.component';
import { FoodRecommendedSuppliersComponent } from './templates/food-recommended-suppliers/food-recommended-suppliers.component';
import { FoodSuppliersComponent } from './templates/food-suppliers/food-suppliers.component';
import { FoodBannerComponent } from './templates/food-banner/food-banner.component';
import { LayoutSharedModule } from '../shared/layout-shared/layout-shared.module';
import { FoodHomeOptionsComponent } from './templates/food-home-options/food-home-options.component';

const components = [
  FoodHomeComponent,
  FoodListingComponent,
  FoodSpecialOffersComponent,
  FoodRecommendedSuppliersComponent,
  FoodSuppliersComponent,
  FoodBannerComponent,
]

@NgModule({
  declarations: [
    ...components,
    FoodHomeOptionsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    LayoutSharedModule,
    HomeModule,
    ProductModule,
    SupplierModule,
  ], exports: [
    ...components
  ]
})
export class FoodModule { }
