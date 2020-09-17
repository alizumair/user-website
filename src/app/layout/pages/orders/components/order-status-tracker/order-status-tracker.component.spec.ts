import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderStatusTrackerComponent } from './order-status-tracker.component';

describe('OrderStatusTrackerComponent', () => {
  let component: OrderStatusTrackerComponent;
  let fixture: ComponentFixture<OrderStatusTrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderStatusTrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderStatusTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
