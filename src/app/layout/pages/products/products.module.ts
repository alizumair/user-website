import { SupplierModule } from './../../shared/supplier/supplier.module';
import { ProductModule } from './../../shared/product/product.module';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { ProductsRoutingModule } from './products.routing';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/******************************** components ******************************/
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductListingComponent } from './product-listing/product-listing.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { DialogService } from 'primeng/dynamicdialog';
import { DiscountedProductsComponent } from './discounted-products/discounted-products.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LayoutSharedModule } from '../../shared/layout-shared/layout-shared.module';
import { WishlistComponent } from './wishlist/wishlist.component';
import { ProductListingByBrandComponent } from './product-listing-by-brand/product-listing-by-brand.component';
import { CategoryDetailComponent } from './category-detail/category-detail.component';
import { CategoryListingComponent } from './category-listing/category-listing.component';
import { UnifiedSearchComponent } from './unified-search/unified-search.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';


@NgModule({
  declarations: [
    ProductDetailComponent,
    ProductListingComponent,
    DiscountedProductsComponent,
    WishlistComponent,
    ProductListingByBrandComponent,
    CategoryDetailComponent,
    CategoryListingComponent,
    UnifiedSearchComponent
  ],
  imports: [
    CommonModule,
    LayoutSharedModule,
    ProductModule,
    SupplierModule,
    ReactiveFormsModule,
    ProductsRoutingModule,
    CarouselModule,
    NgxImageZoomModule,
    SlickCarouselModule
  ],
  providers: [
    DialogService
  ]
})
export class ProductsModule { }
