import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoyaltyDiscountComponent } from './loyalty-discount.component';

describe('LoyaltyDiscountComponent', () => {
  let component: LoyaltyDiscountComponent;
  let fixture: ComponentFixture<LoyaltyDiscountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoyaltyDiscountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoyaltyDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
