import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetirementHistory } from './retirement-history';

describe('RetirementHistory', () => {
  let component: RetirementHistory;
  let fixture: ComponentFixture<RetirementHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetirementHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RetirementHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
