import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartPaymentModeComponent } from './cart-payment-mode.component';

describe('CartPaymentModeComponent', () => {
  let component: CartPaymentModeComponent;
  let fixture: ComponentFixture<CartPaymentModeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartPaymentModeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartPaymentModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
