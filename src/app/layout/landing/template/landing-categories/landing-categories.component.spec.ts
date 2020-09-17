import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingCategoriesComponent } from './landing-categories.component';

describe('LandingCategoriesComponent', () => {
  let component: LandingCategoriesComponent;
  let fixture: ComponentFixture<LandingCategoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LandingCategoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LandingCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
