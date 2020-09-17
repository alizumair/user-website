import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSupplierProductsComponent } from './order-supplier-products.component';

describe('OrderSupplierProductsComponent', () => {
  let component: OrderSupplierProductsComponent;
  let fixture: ComponentFixture<OrderSupplierProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderSupplierProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSupplierProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
