import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsPortfolioComponent } from './credits-portfolio';

describe('CreditsPortfolioComponent', () => {
  let component: CreditsPortfolioComponent;
  let fixture: ComponentFixture<CreditsPortfolioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditsPortfolioComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditsPortfolioComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
