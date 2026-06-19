import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerDashboardComponent } from './farmer-dashboard';

describe('FarmerDashboardComponent', () => {
  let component: FarmerDashboardComponent;
  let fixture: ComponentFixture<FarmerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmerDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FarmerDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
