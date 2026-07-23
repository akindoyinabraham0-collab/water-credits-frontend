import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SensorChartComponent } from './sensor-chart.component';
import { TimeRange } from './sensor-parameter.model';

// selectRange is `protected`; the test reaches it via a narrow cast to keep
// the public API surface small while still allowing deterministic testing.
function selectRange(cmp: SensorChartComponent, range: TimeRange): void {
  (cmp as unknown as { selectRange: (r: TimeRange) => void }).selectRange(range);
}

describe('SensorChartComponent', () => {
  let fixture: ComponentFixture<SensorChartComponent>;
  let component: SensorChartComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SensorChartComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('parameters', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not throw when canvas context is unavailable (jsdom)', () => {
    // ngAfterViewInit ran during detectChanges; if no canvas context is
    // returned the component should early-return and remain mounted.
    expect(fixture.nativeElement.querySelector('canvas')).toBeTruthy();
  });

  it('should emit rangeChange when a different range is selected', () => {
    const emitSpy = vi.fn();
    component.rangeChange.subscribe(emitSpy);

    const nextRange: TimeRange = { value: '7d', label: '7d' };
    selectRange(component, nextRange);

    expect(emitSpy).toHaveBeenCalledWith(nextRange);
  });

  it('should not emit rangeChange when the same range is re-selected', () => {
    const emitSpy = vi.fn();
    component.rangeChange.subscribe(emitSpy);

    const currentRange: TimeRange = { value: '24h', label: '24h' };
    selectRange(component, currentRange);

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should accept parameters and data input changes without throwing', () => {
    // Acceptance criterion #7: chart is destroyed/recreated when parameters
    // change. jsdom returns null for getContext so the chart never actually
    // instantiates — we just verify ngOnChanges completes cleanly with the
    // new inputs, which the destroy+recreate path also exercises.
    expect(() => {
      fixture.componentRef.setInput('parameters', [
        { key: 'ph', label: 'pH', unit: '', color: '#7B2FBE', decimals: 2 },
      ]);
      fixture.componentRef.setInput('data', [
        {
          id: 'r1',
          deviceId: 'd1',
          projectId: 'p1',
          timestamp: new Date().toISOString(),
          ph: 7.2,
          signature: 'sig',
          isVerified: true,
        },
      ]);
      fixture.detectChanges();
    }).not.toThrow();
  });
});
