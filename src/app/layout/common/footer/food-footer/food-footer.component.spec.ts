import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodFooterComponent } from './food-footer.component';

describe('FoodFooterComponent', () => {
  let component: FoodFooterComponent;
  let fixture: ComponentFixture<FoodFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
