import { CategoryListingComponent } from './category-listing/category-listing.component';
import { AuthGuardService } from './../../../core/guards/auth-guard/auth-guard.service';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/**************************** component pages *************************************/
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { ProductListingComponent } from './product-listing/product-listing.component';
import { DiscountedProductsComponent } from './discounted-products/discounted-products.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { CategoryDetailComponent } from './category-detail/category-detail.component';
import { UnifiedSearchComponent } from './unified-search/unified-search.component';

const routes: Routes = [
  {
    path: 'product-detail/:seovalue', component: ProductDetailComponent, data: {
      title: 'Product Detail',
      description: 'Product Description',
      keyword: 'shopping, ecommerce'
    }
  },
  {
    path: 'product-listing/:seovalue', component: ProductListingComponent, data: {
      title: 'Product Listing',
      description: 'Product Description',
      keyword: 'shopping, ecommerce'
    }
  },
  {
    path: 'all-discounted-products', component: DiscountedProductsComponent, data: {
      title: 'Offers',
      description: 'Offers Listing',
      keyword: 'shopping, ecommerce'
    }
  },
  {
    path: 'category-details', component: CategoryDetailComponent, data: {
      title: 'Subscription',
      description: 'Subscription Listing',
      keyword: 'shopping, ecommerce'
    }
  },
  {
    path: 'wishlist', component: WishlistComponent, canActivate: [AuthGuardService], data: {
      title: 'wishlist',
      description: 'wishlist Description',
      keyword: 'shopping, ecommerce'
    }
  },
  {
    path: 'category-listing', component: CategoryListingComponent, data: {
      title: 'category listing',
      description: 'category Description',
      keyword: 'shopping, ecommerce'
    }
  },
  {
    path: 'search', component: UnifiedSearchComponent, data: {
      title: 'Listing',
      description: 'Description',
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
export class ProductsRoutingModule { }
