import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorsDashboard } from './sensors-dashboard';

describe('SensorsDashboard', () => {
  let component: SensorsDashboard;
  let fixture: ComponentFixture<SensorsDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorsDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorsDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
