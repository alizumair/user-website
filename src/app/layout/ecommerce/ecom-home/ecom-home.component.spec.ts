import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcomHomeComponent } from './ecom-home.component';

describe('EcomHomeComponent', () => {
  let component: EcomHomeComponent;
  let fixture: ComponentFixture<EcomHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcomHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcomHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
