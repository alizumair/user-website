import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListingByBrandComponent } from './product-listing-by-brand.component';

describe('ProductListingByBrandComponent', () => {
  let component: ProductListingByBrandComponent;
  let fixture: ComponentFixture<ProductListingByBrandComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductListingByBrandComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListingByBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
