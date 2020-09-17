import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultimediaViewerComponent } from './multimedia-viewer.component';

describe('MultimediaViewerComponent', () => {
  let component: MultimediaViewerComponent;
  let fixture: ComponentFixture<MultimediaViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultimediaViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultimediaViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
