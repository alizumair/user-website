import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentRegistrationComponent } from './agent-registration.component';

describe('AgentRegistrationComponent', () => {
  let component: AgentRegistrationComponent;
  let fixture: ComponentFixture<AgentRegistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentRegistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
