import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcommerceFooterComponent } from './ecommerce-footer.component';

describe('EcommerceFooterComponent', () => {
  let component: EcommerceFooterComponent;
  let fixture: ComponentFixture<EcommerceFooterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcommerceFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcommerceFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
