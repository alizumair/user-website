import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartScheduleTimeComponent } from './cart-schedule-time.component';

describe('CartScheduleTimeComponent', () => {
  let component: CartScheduleTimeComponent;
  let fixture: ComponentFixture<CartScheduleTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartScheduleTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartScheduleTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
