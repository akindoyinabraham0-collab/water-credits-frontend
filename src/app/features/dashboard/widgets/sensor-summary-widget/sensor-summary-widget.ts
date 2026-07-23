import { Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SensorChartComponent } from '../../../../shared/components/sensor-chart/sensor-chart.component';
import {
  SensorParameter,
  SensorThresholds,
  TimeRange,
} from '../../../../shared/components/sensor-chart/sensor-parameter.model';
import { SensorReading } from '../../../../core/models/sensor-reading.model';
import { WebsocketService } from '../../../../core/services/websocket.service';

const WIDGET_PARAMETERS: SensorParameter[] = [
  { key: 'ph', label: 'pH', unit: '', color: '#7B2FBE', decimals: 2 },
  { key: 'turbidity', label: 'Turbidity', unit: 'NTU', color: '#F59E0B', decimals: 1 },
  {
    key: 'dissolvedOxygen',
    label: 'Dissolved O₂',
    unit: 'mg/L',
    color: '#3B82F6',
    decimals: 1,
  },
];

const WIDGET_THRESHOLDS: Record<string, SensorThresholds> = {
  ph: { low: 6.0, high: 9.0 },
  turbidity: { high: 15 },
};

@Component({
  selector: 'app-sensor-summary-widget',
  standalone: true,
  imports: [SensorChartComponent],
  template: `
    <div class="card p-5">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">Sensor Summary</h3>
          <p class="text-xs text-slate-400 mt-0.5">
            Live readings streamed from registered sensor devices ({{ readings.length }} in buffer)
          </p>
        </div>
      </div>
      <app-sensor-chart
        [data]="readings"
        [parameters]="parameters"
        [timeRange]="timeRange"
        [thresholds]="thresholds"
        [height]="240"
        (rangeChange)="onRange($event)"
      />
    </div>
  `,
})
export class SensorSummaryWidgetComponent implements OnDestroy {
  protected readonly parameters: SensorParameter[] = WIDGET_PARAMETERS;
  protected readonly thresholds: Record<string, SensorThresholds> = WIDGET_THRESHOLDS;
  protected readings: SensorReading[] = [];
  protected timeRange: TimeRange = { value: '24h', label: '24h' };

  private readonly destroy$ = new Subject<void>();

  constructor(private readonly ws: WebsocketService) {
    // Buffer up to the last 100 live readings; the chart component renders
    // whatever it receives. This pull-on-subscribe / take-until pattern
    // avoids creating a side-effecting reducer and keeps the widget self
    // contained.
    this.ws
      .on<SensorReading>('sensor:reading')
      .pipe(takeUntil(this.destroy$))
      .subscribe((reading) => {
        this.readings = [...this.readings.slice(-99), reading];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onRange(range: TimeRange): void {
    this.timeRange = range;
  }
}
