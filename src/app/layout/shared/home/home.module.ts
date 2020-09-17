import { RouterModule } from '@angular/router';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { LayoutSharedModule } from './../layout-shared/layout-shared.module';
import { ProductModule } from './../product/product.module';
import { SupplierModule } from './../supplier/supplier.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BannerComponent } from './components/banner/banner.component';
import { SpecialOffersComponent } from './components/special-offers/special-offers.component';
import { RecommendedSuppliersComponent } from './components/recommended-suppliers/recommended-suppliers.component';
import { PopularProductsComponent } from './components/popular-products/popular-products.component';
import { SuppliersComponent } from './components/suppliers/suppliers.component';
import { SingleVendorComponent } from './components/single-vendor/single-vendor.component';
import { TranslatePipe, TranslateModule } from '@ngx-translate/core';
import { EcomMegaMenuComponent } from './components/ecom-mega-menu/ecom-mega-menu.component';
import { ClickOutsideModule } from 'ng-click-outside';

const components = [
  BannerComponent,
  SpecialOffersComponent,
  RecommendedSuppliersComponent,
  PopularProductsComponent,
  SuppliersComponent,
  SingleVendorComponent,
  EcomMegaMenuComponent
]

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    CommonModule,
    SlickCarouselModule,
    LayoutSharedModule,
    ProductModule,
    SupplierModule,
    RouterModule,
    ClickOutsideModule
  ],
  exports: [
    SlickCarouselModule,
    ...components
  ]
})
export class HomeModule { }
