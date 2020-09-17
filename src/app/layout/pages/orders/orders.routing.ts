import { OrderRequestComponent } from './order-request/order-request.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderListingComponent } from './order-listing/order-listing.component';

import { RatingComponent } from './rating/rating.component';
import { TrackOrderComponent } from './track-order/track-order.component';

const routes: Routes = [
  {
    path: 'order-detail', component: OrderDetailComponent, data: {
      title: 'Track order',
      description: 'Order Description',
      keyword: 'shopping, ecommerce'
    }
  },

  {
    path: 'order-listing', component: OrderListingComponent, data: {
      title: 'Order listing',
      description: 'Order Description',
      keyword: 'shopping, ecommerce'
    }
  },

  {
    path: 'rating', component: RatingComponent
  },

  {
    path: 'track-order', component: TrackOrderComponent, data: {
      title: 'tracking',
      description: 'Order tracking',
      keyword: 'shopping, ecommerce'
    }
  },

  {
    path: 'order-request', component: OrderRequestComponent, data: {
      title: 'order request',
      description: 'Order request',
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
export class OrdersRoutingModule { }
