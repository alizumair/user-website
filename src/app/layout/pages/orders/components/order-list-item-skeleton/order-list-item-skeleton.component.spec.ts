import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderListItemSkeletonComponent } from './order-list-item-skeleton.component';

describe('OrderListItemSkeletonComponent', () => {
  let component: OrderListItemSkeletonComponent;
  let fixture: ComponentFixture<OrderListItemSkeletonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderListItemSkeletonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderListItemSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
