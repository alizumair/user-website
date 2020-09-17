import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatransGatewayComponent } from './datatrans-gateway.component';

describe('DatatransGatewayComponent', () => {
  let component: DatatransGatewayComponent;
  let fixture: ComponentFixture<DatatransGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatransGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatransGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
