import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickUpDateTimeComponent } from './pick-up-date-time.component';

describe('PickUpDateTimeComponent', () => {
  let component: PickUpDateTimeComponent;
  let fixture: ComponentFixture<PickUpDateTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickUpDateTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickUpDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
