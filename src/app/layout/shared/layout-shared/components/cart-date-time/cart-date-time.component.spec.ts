import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartDateTimeComponent } from './cart-date-time.component';

describe('CartDateTimeComponent', () => {
  let component: CartDateTimeComponent;
  let fixture: ComponentFixture<CartDateTimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartDateTimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
