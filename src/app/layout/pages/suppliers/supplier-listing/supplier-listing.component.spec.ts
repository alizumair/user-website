import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierListingComponent } from './supplier-listing.component';

describe('SupplierListingComponent', () => {
  let component: SupplierListingComponent;
  let fixture: ComponentFixture<SupplierListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
