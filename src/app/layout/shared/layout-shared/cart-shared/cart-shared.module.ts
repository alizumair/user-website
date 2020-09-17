import { NgxPaginationModule } from 'ngx-pagination';
import { FormatTimeIntervalPipe } from './../pipes/format-time-interval.pipe';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import {DynamicDialogModule} from 'primeng/dynamicdialog';
import { CalendarModule } from 'primeng/calendar';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { UploadImageComponent } from '../components/social-ecommerce/upload-images/upload-image.component';
import { TableDetailsComponent } from '../components/table-details/table-details.component';
import { SupplierTablesComponent } from '../components/supplier-tables/supplier-tables.component';
import { CartScheduleTimeComponent } from '../components/cart-schedule-time/cart-schedule-time.component';
import { QuantityButtonsComponent } from '../components/quantity-buttons/quantity-buttons.component';
import { CartDateTimeComponent } from '../components/cart-date-time/cart-date-time.component';
import { QuestionsListComponent } from '../components/questions-list/questions-list.component';
import { ToastComponent } from '../components/toast/toast.component';
import { ProcessingIndicatorComponent } from '../components/processing-indicator/processing-indicator.component';
import { NumberDirective } from '../directives/number.directive';
import { AmountDirective } from '../directives/amount.directive';
import { CounterDirective } from '../directives/counter.directive';
import { NgModule } from '@angular/core';

const directives = [
  CounterDirective,
  AmountDirective,
  NumberDirective
]

const pipes = [
  FormatTimeIntervalPipe
]

const components = [
  ProcessingIndicatorComponent,
  ToastComponent,
  QuestionsListComponent,
  CartDateTimeComponent,
  QuantityButtonsComponent,
  CartScheduleTimeComponent,
  SupplierTablesComponent,
  TableDetailsComponent,
  UploadImageComponent,
]

@NgModule({
  declarations: [
    ...components,
    ...pipes,
    ...directives
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    CalendarModule,
    DynamicDialogModule,
    DialogModule,
    ToastModule,
    RouterModule,
    NgxPaginationModule
  ],
  exports: [
    RouterModule,
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    CalendarModule,
    DialogModule,
    NgxPaginationModule,
    ...components,
    ...pipes,
    ...directives
  ],
  entryComponents: [
    ToastComponent
  ],
  providers: [
    DynamicDialogRef,
    DynamicDialogConfig
  ]
})
export class CartSharedModule { }
