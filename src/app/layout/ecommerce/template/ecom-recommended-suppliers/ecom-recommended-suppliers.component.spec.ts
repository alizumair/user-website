import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcomRecommendedSuppliersComponent } from './ecom-recommended-suppliers.component';

describe('EcomRecommendedSuppliersComponent', () => {
  let component: EcomRecommendedSuppliersComponent;
  let fixture: ComponentFixture<EcomRecommendedSuppliersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcomRecommendedSuppliersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcomRecommendedSuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
