import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyGiftCardsComponent } from './my-gift-cards.component';

describe('MyGiftCardsComponent', () => {
  let component: MyGiftCardsComponent;
  let fixture: ComponentFixture<MyGiftCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyGiftCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyGiftCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
