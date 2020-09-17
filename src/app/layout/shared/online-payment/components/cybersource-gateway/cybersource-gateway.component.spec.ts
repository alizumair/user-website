import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CybersourceGatewayComponent } from './cybersource-gateway.component';

describe('CybersourceGatewayComponent', () => {
  let component: CybersourceGatewayComponent;
  let fixture: ComponentFixture<CybersourceGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CybersourceGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CybersourceGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
