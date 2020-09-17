import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VenmoGatewayComponent } from './venmo-gateway.component';

describe('VenmoGatewayComponent', () => {
  let component: VenmoGatewayComponent;
  let fixture: ComponentFixture<VenmoGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VenmoGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VenmoGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
