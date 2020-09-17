import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutGatewayComponent } from './checkout-gateway.component';

describe('CheckoutGatewayComponent', () => {
  let component: CheckoutGatewayComponent;
  let fixture: ComponentFixture<CheckoutGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckoutGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
