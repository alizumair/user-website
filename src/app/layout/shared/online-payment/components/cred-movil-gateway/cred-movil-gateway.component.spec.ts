import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CredMovilGatewayComponent } from './cred-movil-gateway.component';

describe('CredMovilGatewayComponent', () => {
  let component: CredMovilGatewayComponent;
  let fixture: ComponentFixture<CredMovilGatewayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CredMovilGatewayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CredMovilGatewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
