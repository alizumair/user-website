import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlavorOfTheWeekComponent } from './flavor-of-the-week.component';

describe('FlavorOfTheWeekComponent', () => {
  let component: FlavorOfTheWeekComponent;
  let fixture: ComponentFixture<FlavorOfTheWeekComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlavorOfTheWeekComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlavorOfTheWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
