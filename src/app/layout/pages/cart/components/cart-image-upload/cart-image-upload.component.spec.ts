import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartImageUploadComponent } from './cart-image-upload.component';

describe('CartImageUploadComponent', () => {
  let component: CartImageUploadComponent;
  let fixture: ComponentFixture<CartImageUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartImageUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
