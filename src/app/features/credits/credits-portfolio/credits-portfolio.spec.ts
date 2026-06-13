import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsPortfolio } from './credits-portfolio';

describe('CreditsPortfolio', () => {
  let component: CreditsPortfolio;
  let fixture: ComponentFixture<CreditsPortfolio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditsPortfolio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditsPortfolio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
