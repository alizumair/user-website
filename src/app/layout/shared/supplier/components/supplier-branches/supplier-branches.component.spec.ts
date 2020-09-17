import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SupplierBranchesComponent } from './supplier-branches.component';


describe('FoodSupplierBranchesComponent', () => {
  let component: SupplierBranchesComponent;
  let fixture: ComponentFixture<SupplierBranchesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupplierBranchesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupplierBranchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
