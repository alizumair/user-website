import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EcomAboutComponent } from './ecom-about.component';

describe('EcomAboutComponent', () => {
  let component: EcomAboutComponent;
  let fixture: ComponentFixture<EcomAboutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EcomAboutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EcomAboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
