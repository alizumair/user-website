import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeServiceRecentlyViewedComponent } from './home-service-recently-viewed.component';

describe('HomeServiceRecentlyViewedComponent', () => {
  let component: HomeServiceRecentlyViewedComponent;
  let fixture: ComponentFixture<HomeServiceRecentlyViewedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeServiceRecentlyViewedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeServiceRecentlyViewedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
