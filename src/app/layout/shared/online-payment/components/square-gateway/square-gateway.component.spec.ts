import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SquareGatewayComponent } from './square-gateway.component';

describe('SquareGatewayComponent', () => {
  let component: SquareGatewayComponent;
  let fixture: ComponentFixture<SquareGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SquareGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SquareGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
