import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcomBannerComponent } from './ecom-banner.component';

describe('EcomBannerComponent', () => {
  let component: EcomBannerComponent;
  let fixture: ComponentFixture<EcomBannerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcomBannerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcomBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
