import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierSortingComponent } from './supplier-sorting.component';

describe('SupplierSortingComponent', () => {
  let component: SupplierSortingComponent;
  let fixture: ComponentFixture<SupplierSortingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierSortingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierSortingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
