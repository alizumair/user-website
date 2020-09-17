import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscountedProductsComponent } from './discounted-products.component';

describe('DiscountedProductsComponent', () => {
  let component: DiscountedProductsComponent;
  let fixture: ComponentFixture<DiscountedProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscountedProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscountedProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
