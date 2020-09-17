import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConektaGatewayComponent } from './conekta-gateway.component';

describe('ConektaGatewayComponent', () => {
  let component: ConektaGatewayComponent;
  let fixture: ComponentFixture<ConektaGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConektaGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConektaGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
