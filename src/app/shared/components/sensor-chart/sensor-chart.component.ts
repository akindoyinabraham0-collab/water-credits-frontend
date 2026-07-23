import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import annotationPlugin, { AnnotationOptions } from 'chartjs-plugin-annotation';
import {
  Chart,
  ChartConfiguration,
  ChartDataset,
  ChartOptions,
  registerables,
  TooltipItem,
} from 'chart.js';

import { SensorReading } from '../../../core/models/sensor-reading.model';
import { SensorParameter, SensorThresholds, TimeRange } from './sensor-parameter.model';

type Point = { x: number; y: number | null };

interface SeriesConfig {
  param: SensorParameter;
  yAxisID: string;
}

const DEFAULT_RANGES: ReadonlyArray<TimeRange> = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: 'custom', label: 'Custom' },
];

// One-time plugin registration. Both registerables and annotationPlugin are
// idempotent in chart.js v4, so re-running this on module reload is harmless.
Chart.register(...registerables, annotationPlugin);

@Component({
  selector: 'app-sensor-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgFor, NgIf],
  templateUrl: './sensor-chart.component.html',
  styleUrls: ['./sensor-chart.component.scss'],
})
export class SensorChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() data: SensorReading[] = [];
  @Input() parameters: SensorParameter[] = [];
  @Input() timeRange: TimeRange = { value: '24h', label: '24h' };
  @Input() thresholds?: Record<string, SensorThresholds>;
  @Input() title?: string;
  @Input() height = 280;

  @Output() rangeChange = new EventEmitter<TimeRange>();

  @ViewChild('chartCanvas', { static: false })
  canvas?: ElementRef<HTMLCanvasElement>;

  protected readonly availableRanges: ReadonlyArray<TimeRange> = DEFAULT_RANGES;
  protected selectedRange: TimeRange['value'] = '24h';

  private chart: Chart<'line', Point[], unknown> | null = null;
  private seriesConfigs: SeriesConfig[] = [];

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly zone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    this.syncSelectedFromInput();
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Initial input flush before the canvas is mounted — defer to ngAfterViewInit.
    if (!this.chart) {
      return;
    }
    if (changes['parameters']) {
      // Structure changed (different number of series or unit mix) — tear
      // down and rebuild so axes, legend, and thresholds re-derive.
      this.recreateChart();
      return;
    }
    if (changes['data']) {
      this.applyData();
    }
    if (changes['timeRange']) {
      this.syncSelectedFromInput();
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }

  protected selectRange(range: TimeRange): void {
    if (this.selectedRange === range.value) {
      return;
    }
    this.selectedRange = range.value;
    this.rangeChange.emit(range);
    // OnPush: schedule a CD cycle so the active-range styling re-renders.
    this.cdr.markForCheck();
  }

  private syncSelectedFromInput(): void {
    this.selectedRange = this.timeRange?.value ?? '24h';
  }

  private recreateChart(): void {
    this.chart?.destroy();
    this.chart = null;
    this.createChart();
  }

  private createChart(): void {
    if (!this.canvas) {
      return;
    }
    const ctx = this.canvas.nativeElement.getContext?.('2d');
    if (!ctx) {
      // Headless test environment (jsdom returns null for getContext) — skip
      // chart creation so the host component still mounts cleanly.
      return;
    }
    const config = this.buildConfig();
    // Run Chart.js outside the Angular zone so its internal RAF/animation
    // ticks don't trigger unneeded change detection.
    this.zone.runOutsideAngular(() => {
      this.chart = new Chart<'line', Point[]>(ctx, config);
    });
  }

  private applyData(): void {
    if (!this.chart) {
      return;
    }
    this.seriesConfigs.forEach((cfg, i) => {
      const dataset = this.chart!.data.datasets[i] as ChartDataset<'line', Point[]> | undefined;
      if (!dataset) {
        return;
      }
      dataset.data = this.collectPoints(cfg.param.key);
    });
    this.chart.update('none');
  }

  private buildConfig(): ChartConfiguration<'line', Point[], unknown> {
    this.seriesConfigs = this.computeSeriesConfigs();
    return {
      type: 'line',
      data: {
        datasets: this.seriesConfigs.map((cfg) => this.buildDataset(cfg)),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        interaction: { intersect: false, mode: 'nearest' },
        scales: this.buildScales() as NonNullable<ChartOptions<'line'>['scales']>,
        plugins: {
          legend: {
            // Default Chart.js legend click handler toggles dataset visibility
            // — gives us the interactive toggle requirement for free.
            display: this.parameters.length > 1,
            position: 'bottom',
            labels: { boxWidth: 12, padding: 16, usePointStyle: true },
          },
          tooltip: {
            callbacks: {
              label: (ctx: TooltipItem<'line'>) => this.formatTooltipLabel(ctx),
            },
          },
          annotation: this.buildAnnotations(),
        },
      },
    };
  }

  private computeSeriesConfigs(): SeriesConfig[] {
    // First parameter's unit claims the primary Y axis; any subsequent
    // parameter whose unit differs is assigned to the right-hand axis.
    // Same-unit series share the primary axis for readable comparison.
    const seenUnits = new Set<string>();
    let firstAssigned = false;
    return this.parameters.map((p) => {
      const unit = p.unit || '';
      let yAxisID = 'y';
      if (!firstAssigned) {
        seenUnits.add(unit);
        firstAssigned = true;
      } else if (!seenUnits.has(unit)) {
        yAxisID = 'y1';
      }
      return { param: p, yAxisID };
    });
  }

  private buildDataset(cfg: SeriesConfig): ChartDataset<'line', Point[]> {
    const labelSuffix = cfg.param.unit ? ` (${cfg.param.unit})` : '';
    return {
      label: `${cfg.param.label}${labelSuffix}`,
      data: this.collectPoints(cfg.param.key),
      borderColor: cfg.param.color,
      backgroundColor: this.toRgba(cfg.param.color, 0.12),
      fill: false,
      tension: 0.35,
      pointRadius: 0,
      pointHoverRadius: 4,
      borderWidth: 2,
      spanGaps: true,
      yAxisID: cfg.yAxisID,
      hidden: false,
    };
  }

  private buildScales(): Record<string, unknown> {
    const useSecondary = this.seriesConfigs.some((c) => c.yAxisID === 'y1');
    const scales: Record<string, unknown> = {
      x: {
        type: 'linear',
        grid: { display: false },
        ticks: {
          color: '#94A3B8',
          maxTicksLimit: 8,
          callback: (value: number | string) => this.formatXTick(value),
        },
      },
      y: {
        type: 'linear',
        position: 'left',
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
        ticks: { color: '#94A3B8' },
        beginAtZero: false,
      },
    };
    if (useSecondary) {
      scales['y1'] = {
        type: 'linear',
        position: 'right',
        grid: { display: false },
        ticks: { color: '#94A3B8' },
        beginAtZero: false,
      };
    }
    return scales;
  }

  private buildAnnotations(): { annotations: Record<string, AnnotationOptions> } {
    if (!this.thresholds || Object.keys(this.thresholds).length === 0) {
      return { annotations: {} };
    }
    const annotations: Record<string, AnnotationOptions> = {};
    for (const [key, t] of Object.entries(this.thresholds)) {
      if (t.low != null) {
        annotations[`${key}-low`] = {
          type: 'line',
          yMin: t.low,
          yMax: t.low,
          borderColor: 'rgba(245, 158, 11, 0.85)',
          borderWidth: 1,
          borderDash: [6, 4],
          label: {
            display: true,
            content: `${key} min`,
            position: 'start',
            backgroundColor: 'rgba(245,158,11,0.95)',
            color: '#fff',
            font: { size: 10 },
          },
        };
      }
      if (t.high != null) {
        annotations[`${key}-high`] = {
          type: 'line',
          yMin: t.high,
          yMax: t.high,
          borderColor: 'rgba(239, 68, 68, 0.85)',
          borderWidth: 1,
          borderDash: [6, 4],
          label: {
            display: true,
            content: `${key} max`,
            position: 'end',
            backgroundColor: 'rgba(239,68,68,0.95)',
            color: '#fff',
            font: { size: 10 },
          },
        };
      }
    }
    return { annotations };
  }

  private collectPoints(key: string): Point[] {
    return this.data.map((reading) => {
      const raw = (reading as unknown as Record<string, unknown>)[key];
      const ts = new Date(reading.timestamp).getTime();
      const y = typeof raw === 'number' && !Number.isNaN(raw) ? raw : null;
      return { x: ts, y };
    });
  }

  private formatXTick(value: number | string): string {
    const ts = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(ts)) {
      return '';
    }
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private formatTooltipLabel(ctx: TooltipItem<'line'>): string {
    const idx = ctx.datasetIndex;
    const cfg = idx != null ? this.seriesConfigs[idx] : undefined;
    const decimals = cfg?.param.decimals ?? 2;
    const y = ctx.parsed?.y;
    const formatted = typeof y === 'number' ? (y as number).toFixed(decimals) : '--';
    return `${ctx.dataset.label ?? ''}: ${formatted}`;
  }

  private toRgba(hex: string, alpha: number): string {
    if (!hex || !hex.startsWith('#')) {
      return hex;
    }
    const stripped = hex.slice(1);
    const full =
      stripped.length === 3
        ? stripped
            .split('')
            .map((c) => c + c)
            .join('')
        : stripped;
    const bigint = parseInt(full, 16);
    if (!Number.isFinite(bigint)) {
      return hex;
    }
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
