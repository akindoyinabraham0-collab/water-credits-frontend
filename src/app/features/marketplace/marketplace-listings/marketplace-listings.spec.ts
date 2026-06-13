import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceListings } from './marketplace-listings';

describe('MarketplaceListings', () => {
  let component: MarketplaceListings;
  let fixture: ComponentFixture<MarketplaceListings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketplaceListings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceListings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
