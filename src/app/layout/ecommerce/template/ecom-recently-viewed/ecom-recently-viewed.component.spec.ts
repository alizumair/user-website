import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcomRecentlyViewedComponent } from './ecom-recently-viewed.component';

describe('EcomRecentlyViewedComponent', () => {
  let component: EcomRecentlyViewedComponent;
  let fixture: ComponentFixture<EcomRecentlyViewedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcomRecentlyViewedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcomRecentlyViewedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
