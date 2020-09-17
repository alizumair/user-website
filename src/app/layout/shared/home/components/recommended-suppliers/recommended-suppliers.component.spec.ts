import { RecommendedSuppliersComponent } from './recommended-suppliers.component';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';


describe('RecommendedProductsComponent', () => {
  let component: RecommendedSuppliersComponent;
  let fixture: ComponentFixture<RecommendedSuppliersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecommendedSuppliersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecommendedSuppliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
