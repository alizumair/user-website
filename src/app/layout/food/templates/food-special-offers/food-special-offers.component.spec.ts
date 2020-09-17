import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodSpecialOffersComponent } from './food-special-offers.component';

describe('FoodSpecialOffersComponent', () => {
  let component: FoodSpecialOffersComponent;
  let fixture: ComponentFixture<FoodSpecialOffersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodSpecialOffersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodSpecialOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
