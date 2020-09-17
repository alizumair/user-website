import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodHomeOptionsComponent } from './food-home-options.component';

describe('FoodHomeOptionsComponent', () => {
  let component: FoodHomeOptionsComponent;
  let fixture: ComponentFixture<FoodHomeOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodHomeOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodHomeOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
