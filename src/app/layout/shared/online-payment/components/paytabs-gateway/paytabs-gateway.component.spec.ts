import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaytabsGatewayComponent } from './paytabs-gateway.component';

describe('PaytabsGatewayComponent', () => {
  let component: PaytabsGatewayComponent;
  let fixture: ComponentFixture<PaytabsGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaytabsGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaytabsGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
