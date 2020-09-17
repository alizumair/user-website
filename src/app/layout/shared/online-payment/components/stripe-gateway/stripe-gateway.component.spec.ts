import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StripeGatewayComponent } from './stripe-gateway.component';

describe('StripeGatewayComponent', () => {
  let component: StripeGatewayComponent;
  let fixture: ComponentFixture<StripeGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StripeGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StripeGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
