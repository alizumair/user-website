import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodSupplierComponent } from './food-supplier.component';

describe('FoodSupplierComponent', () => {
  let component: FoodSupplierComponent;
  let fixture: ComponentFixture<FoodSupplierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodSupplierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
