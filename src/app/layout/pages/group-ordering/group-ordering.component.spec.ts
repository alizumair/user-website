import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupOrderingComponent } from './group-ordering.component';

describe('GroupOrderingComponent', () => {
  let component: GroupOrderingComponent;
  let fixture: ComponentFixture<GroupOrderingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupOrderingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupOrderingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
