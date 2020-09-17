import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CartSkeletonComponent } from './cart-skeleton.component';

describe('CartSkeletonComponent', () => {
  let component: CartSkeletonComponent;
  let fixture: ComponentFixture<CartSkeletonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartSkeletonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
