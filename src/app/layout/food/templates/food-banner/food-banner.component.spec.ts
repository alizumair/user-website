import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodBannerComponent } from './food-banner.component';

describe('FoodBannerComponent', () => {
  let component: FoodBannerComponent;
  let fixture: ComponentFixture<FoodBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FoodBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoodBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
