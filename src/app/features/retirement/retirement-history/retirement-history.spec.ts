import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetirementHistoryComponent } from './retirement-history';

describe('RetirementHistoryComponent', () => {
  let component: RetirementHistoryComponent;
  let fixture: ComponentFixture<RetirementHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetirementHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RetirementHistoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
