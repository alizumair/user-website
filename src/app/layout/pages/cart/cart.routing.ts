import { CartComponent } from './../cart/cart-detail/cart.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentComponent } from './agent/agent.component';
import { RentalBookingComponent } from './rental-booking/rental-booking.component';

const routes: Routes = [

  {
    path: '', component: CartComponent, data: {
      title: 'Cart',
      description: 'Cart Description',
      keyword: 'shopping, ecommerce'
    }
  },
  {
    path: 'agent', component: AgentComponent, data: {
      title: 'Agent',
      description: 'Agent Description',
      keyword: 'shopping, ecommerce'
    }
  },
  {
    path: 'rental-booking', component: RentalBookingComponent, data: {
      title: 'Cart',
      description: 'Cart Description',
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
export class CartRoutingModule { }
