import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeServiceCategoriesComponent } from './home-service-categories.component';

describe('HomeServiceCategoriesComponent', () => {
  let component: HomeServiceCategoriesComponent;
  let fixture: ComponentFixture<HomeServiceCategoriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeServiceCategoriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeServiceCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
