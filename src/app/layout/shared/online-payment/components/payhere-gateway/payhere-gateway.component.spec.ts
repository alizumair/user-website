import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayhereGatewayComponent } from './payhere-gateway.component';

describe('PayhereGatewayComponent', () => {
  let component: PayhereGatewayComponent;
  let fixture: ComponentFixture<PayhereGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayhereGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayhereGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
