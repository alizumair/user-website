import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodRecommendedSuppliersComponent } from './food-recommended-suppliers.component';

describe('FoodRecommendedSuppliersComponent', () => {
  let component: FoodRecommendedSuppliersComponent;
  let fixture: ComponentFixture<FoodRecommendedSuppliersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodRecommendedSuppliersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodRecommendedSuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
