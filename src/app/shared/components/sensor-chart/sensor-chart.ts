import { Component, Input, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

export interface ChartSeries {
  label: string;
  data: { x: number; y: number }[];
  color?: string;
}

@Component({
  selector: 'app-sensor-chart',
  standalone: true,
  imports: [NgFor],
  template: `
    <div
      class="bg-white dark:bg-dark-bg-lighter rounded-xl border border-slate-200 dark:border-slate-700 p-4"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ title }}</h3>
        <div class="flex items-center gap-3">
          <button
            *ngFor="let range of timeRanges"
            (click)="selectRange(range)"
            [class]="{
              'bg-stellar-blue text-white': selectedRange === range,
              'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700': selectedRange !== range,
            }"
            class="px-2 py-1 text-xs rounded-md transition-colors"
          >
            {{ range }}
          </button>
        </div>
      </div>
      <div class="relative" style="height: {{ height }}px">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
})
export class SensorChartComponent implements AfterViewInit, OnDestroy {
  @Input() title = 'Sensor Readings';
  @Input() series: ChartSeries[] = [];
  @Input() height = 300;
  @Input() timeRanges: string[] = ['1H', '6H', '24H', '7D', '30D'];

  @ViewChild('chartCanvas') canvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  protected selectedRange = '24H';

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  selectRange(range: string): void {
    this.selectedRange = range;
    this.createChart();
  }

  private createChart(): void {
    this.chart?.destroy();
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        datasets: this.series.map((s) => ({
          label: s.label,
          data: s.data.map((d) => ({ x: d.x, y: d.y })),
          borderColor: s.color || '#7B2FBE',
          backgroundColor: s.color ? `${s.color}20` : '#7B2FBE20',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          borderWidth: 2,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            display: this.series.length > 1,
            position: 'bottom',
            labels: { boxWidth: 12, padding: 16, usePointStyle: true },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94A3B8', maxTicksLimit: 10 },
          },
          y: {
            beginAtZero: true,
            grid: { color: '#F1F5F9' },
            ticks: { color: '#94A3B8' },
          },
        },
      },
    };

    this.chart = new Chart(ctx, config);
  }
}
