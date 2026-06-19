import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorsDashboardComponent } from './sensors-dashboard';

describe('SensorsDashboardComponent', () => {
  let component: SensorsDashboardComponent;
  let fixture: ComponentFixture<SensorsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorsDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SensorsDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
