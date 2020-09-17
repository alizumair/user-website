import { NgModule } from '@angular/core';
import { TopDealsComponent } from './top-deals/top-deals.component';
import { LandingComponent } from './landing-home/landing.component';
import { HomeModule } from './../shared/home/home.module';
import { LayoutSharedModule } from './../shared/layout-shared/layout-shared.module';
import { CommonModule } from '@angular/common';
import { LandingCategoriesComponent } from './template/landing-categories/landing-categories.component';
import { CategoryOffersComponent } from './template/category-offers/category-offers.component';
import { LandingRecommendedSuppliersComponent } from './template/landing-recommended-suppliers/landing-recommended-suppliers.component';

const components = [
  LandingComponent,
  TopDealsComponent,
  LandingCategoriesComponent,
  CategoryOffersComponent,
  LandingRecommendedSuppliersComponent
]

@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    CommonModule,
    LayoutSharedModule,
    HomeModule,
  ],
  exports: [
    ...components
  ]
})
export class LandingModule { }
