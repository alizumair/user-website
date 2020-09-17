import { GiftCardListComponent } from './gift-card-list/gift-card-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  {
    path: 'list', component: GiftCardListComponent, data: {
      title: 'Gift Cards',
      description: 'Gift Card List',
      keyword: 'shopping'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GiftCardRoutingModule { }
