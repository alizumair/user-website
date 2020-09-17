import { ProductModule } from './../shared/product/product.module';
import { SupplierModule } from './../shared/supplier/supplier.module';
import { HomeModule } from './../shared/home/home.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EcomHomeComponent } from './ecom-home/ecom-home.component';
import { BrandsComponent } from './ecom-home/brands/brands.component';
import { AboutComponent } from './ecom-home/about/about.component';
import { EcomBannerComponent } from './template/ecom-banner/ecom-banner.component';
import { EcomPopularProductsComponent } from './template/ecom-popular-products/ecom-popular-products.component';
import { EcomSpecialOffersComponent } from './template/ecom-special-offers/ecom-special-offers.component';
import { EcomRecommendedSuppliersComponent } from './template/ecom-recommended-suppliers/ecom-recommended-suppliers.component';
import { EcomBrandsComponent } from './template/ecom-brands/ecom-brands.component';
import { LayoutSharedModule } from '../shared/layout-shared/layout-shared.module';
import { EcomAboutComponent } from './template/ecom-about/ecom-about.component';
import { RouterModule } from '@angular/router';
import { EcomTodayOfferComponent } from './template/ecom-today-offer/ecom-today-offer.component';
import { EcomRecentlyViewedComponent } from './template/ecom-recently-viewed/ecom-recently-viewed.component';

const components = [
  EcomHomeComponent,
  BrandsComponent,
  AboutComponent,
  EcomBannerComponent,
  EcomPopularProductsComponent,
  EcomSpecialOffersComponent,
  EcomRecommendedSuppliersComponent,
  EcomBrandsComponent,
  // EcomCategoriesComponent,
  EcomAboutComponent
]

@NgModule({
  declarations: [
    ...components,
    EcomTodayOfferComponent,
    EcomRecentlyViewedComponent
  ],
  imports: [
    CommonModule,
    LayoutSharedModule,
    HomeModule,
    ProductModule,
    SupplierModule,
    RouterModule
  ],
  exports: [
    ...components
  ]
})
export class EcommerceModule { }
