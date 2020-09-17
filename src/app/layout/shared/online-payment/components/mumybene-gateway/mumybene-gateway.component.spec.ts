import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MumybeneGatewayComponent } from './mumybene-gateway.component';

describe('MumybeneGatewayComponent', () => {
  let component: MumybeneGatewayComponent;
  let fixture: ComponentFixture<MumybeneGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MumybeneGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MumybeneGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
