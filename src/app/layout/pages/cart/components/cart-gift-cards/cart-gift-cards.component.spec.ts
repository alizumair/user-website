import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartGiftCardsComponent } from './cart-gift-cards.component';

describe('CartGiftCardsComponent', () => {
  let component: CartGiftCardsComponent;
  let fixture: ComponentFixture<CartGiftCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartGiftCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartGiftCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
