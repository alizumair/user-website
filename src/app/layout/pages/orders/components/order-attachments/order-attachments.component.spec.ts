import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderAttachmentsComponent } from './order-attachments.component';

describe('OrderAttachmentsComponent', () => {
  let component: OrderAttachmentsComponent;
  let fixture: ComponentFixture<OrderAttachmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderAttachmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
