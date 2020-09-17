import { ReturnStatusPipe } from './../../shared/layout-shared/pipes/return-status.pipe';
import { PrepTimePipe } from './../../shared/layout-shared/pipes/prep-time.pipe';
import { OrderStatusColorPipe } from './../../shared/layout-shared/pipes/order-status-color.pipe';
import { OrderStatusPipe } from './../../shared/layout-shared/pipes/order-status.pipe';
import { OnlinePaymentModule } from './../../shared/online-payment/online-payment.module';
import { SocketsService } from './../../../services/sockets/sockets.service';
import { SocketConnection } from './../../../services/sockets/socket-connection.service';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrdersRoutingModule } from './orders.routing';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketIoModule } from 'ngx-socket-io';

// components
import { OrderListingComponent } from './order-listing/order-listing.component';
import { RatingComponent } from './rating/rating.component';
import { TrackOrderComponent } from './track-order/track-order.component';
import { ReOrderComponent } from './components/re-order/re-order.component';
import { OrderStatusTrackerComponent } from './components/order-status-tracker/order-status-tracker.component';
import { OrderListItemSkeletonComponent } from './components/order-list-item-skeleton/order-list-item-skeleton.component';
import { OrderListItemComponent } from './components/order-list-item/order-list-item.component';
import { OrderAttachmentsComponent } from './components/order-attachments/order-attachments.component';
import { OrderPaymentComponent } from './components/order-payment/order-payment.component';
import { LayoutSharedModule } from '../../shared/layout-shared/layout-shared.module';
import { OrderRequestComponent } from './order-request/order-request.component';
import { OrderSupplierProductsComponent } from './components/order-supplier-products/order-supplier-products.component';
import { ProductModule } from '../../shared/product/product.module';

@NgModule({
  declarations: [
    OrderDetailComponent,
    OrderListingComponent,
    RatingComponent,
    TrackOrderComponent,
    OrderStatusPipe,
    OrderStatusColorPipe,
    ReOrderComponent,
    OrderStatusTrackerComponent,
    OrderListItemSkeletonComponent,
    OrderListItemComponent,
    PrepTimePipe,
    ReturnStatusPipe,
    OrderAttachmentsComponent,
    OrderPaymentComponent,
    OrderRequestComponent,
    OrderSupplierProductsComponent,
  ],
  imports: [
    CommonModule,
    LayoutSharedModule,
    OnlinePaymentModule,
    OrdersRoutingModule,
    SocketIoModule,
    ProductModule
  ],
  providers: [
    SocketConnection,
    SocketsService
  ]
})
export class OrdersModule { }
