import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovernanceDashboard } from './governance-dashboard';

describe('GovernanceDashboard', () => {
  let component: GovernanceDashboard;
  let fixture: ComponentFixture<GovernanceDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovernanceDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GovernanceDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
