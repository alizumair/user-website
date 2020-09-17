import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZelleGatewayComponent } from './zelle-gateway.component';

describe('ZelleGatewayComponent', () => {
  let component: ZelleGatewayComponent;
  let fixture: ComponentFixture<ZelleGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZelleGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZelleGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
