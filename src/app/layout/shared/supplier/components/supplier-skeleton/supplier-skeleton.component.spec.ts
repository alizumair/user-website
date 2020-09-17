import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierSkeletonComponent } from './supplier-skeleton.component';

describe('SupplierSkeletonComponent', () => {
  let component: SupplierSkeletonComponent;
  let fixture: ComponentFixture<SupplierSkeletonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierSkeletonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
