import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentTipComponent } from './agent-tip.component';

describe('AgentTipComponent', () => {
  let component: AgentTipComponent;
  let fixture: ComponentFixture<AgentTipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgentTipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentTipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
