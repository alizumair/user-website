import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcomSpecialOffersComponent } from './ecom-special-offers.component';

describe('EcomSpecialOffersComponent', () => {
  let component: EcomSpecialOffersComponent;
  let fixture: ComponentFixture<EcomSpecialOffersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcomSpecialOffersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcomSpecialOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
