import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingRecommendedSuppliersComponent } from './landing-recommended-suppliers.component';

describe('LandingRecommendedSuppliersComponent', () => {
  let component: LandingRecommendedSuppliersComponent;
  let fixture: ComponentFixture<LandingRecommendedSuppliersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingRecommendedSuppliersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingRecommendedSuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
