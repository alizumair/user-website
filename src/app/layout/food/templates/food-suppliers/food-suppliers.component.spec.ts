import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodSuppliersComponent } from './food-suppliers.component';

describe('FoodSuppliersComponent', () => {
  let component: FoodSuppliersComponent;
  let fixture: ComponentFixture<FoodSuppliersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodSuppliersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodSuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
