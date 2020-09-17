import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcomBrandsComponent } from './ecom-brands.component';

describe('EcomBrandsComponent', () => {
  let component: EcomBrandsComponent;
  let fixture: ComponentFixture<EcomBrandsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcomBrandsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcomBrandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
