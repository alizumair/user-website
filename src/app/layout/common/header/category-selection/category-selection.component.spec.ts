import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategorySelectionComponent } from './category-selection.component';

describe('CategorySelectionComponent', () => {
  let component: CategorySelectionComponent;
  let fixture: ComponentFixture<CategorySelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategorySelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategorySelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
