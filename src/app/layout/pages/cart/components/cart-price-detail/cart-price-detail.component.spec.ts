import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartPriceDetailComponent } from './cart-price-detail.component';

describe('CartPriceDetailComponent', () => {
  let component: CartPriceDetailComponent;
  let fixture: ComponentFixture<CartPriceDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartPriceDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartPriceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
