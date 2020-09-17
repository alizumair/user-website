import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CashappGatewayComponent } from './cashapp-gateway.component';

describe('CashappGatewayComponent', () => {
  let component: CashappGatewayComponent;
  let fixture: ComponentFixture<CashappGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CashappGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CashappGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
