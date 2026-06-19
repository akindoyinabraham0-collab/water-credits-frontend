import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceListingsComponent } from './marketplace-listings';

describe('MarketplaceListingsComponent', () => {
  let component: MarketplaceListingsComponent;
  let fixture: ComponentFixture<MarketplaceListingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketplaceListingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MarketplaceListingsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
