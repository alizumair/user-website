import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaystackGatewayComponent } from './paystack-gateway.component';

describe('PaystackGatewayComponent', () => {
  let component: PaystackGatewayComponent;
  let fixture: ComponentFixture<PaystackGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaystackGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaystackGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
