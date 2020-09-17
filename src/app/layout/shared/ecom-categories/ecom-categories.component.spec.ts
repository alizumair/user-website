import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcomCategoriesComponent } from './ecom-categories.component';

describe('EcomCategoriesComponent', () => {
  let component: EcomCategoriesComponent;
  let fixture: ComponentFixture<EcomCategoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcomCategoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcomCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
