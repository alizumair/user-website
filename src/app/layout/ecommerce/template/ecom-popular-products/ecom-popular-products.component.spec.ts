import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcomPopularProductsComponent } from './ecom-popular-products.component';

describe('EcomPopularProductsComponent', () => {
  let component: EcomPopularProductsComponent;
  let fixture: ComponentFixture<EcomPopularProductsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcomPopularProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcomPopularProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
