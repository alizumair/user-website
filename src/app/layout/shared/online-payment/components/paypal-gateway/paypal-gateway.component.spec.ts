import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaypalGatewayComponent } from './paypal-gateway.component';

describe('PaypalGatewayComponent', () => {
  let component: PaypalGatewayComponent;
  let fixture: ComponentFixture<PaypalGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaypalGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaypalGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
