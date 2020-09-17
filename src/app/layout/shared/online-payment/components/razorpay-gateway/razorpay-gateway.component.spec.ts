import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RazorpayGatewayComponent } from './razorpay-gateway.component';

describe('RazorpayGatewayComponent', () => {
  let component: RazorpayGatewayComponent;
  let fixture: ComponentFixture<RazorpayGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RazorpayGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RazorpayGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
