/**
 * Type-safe identifiers for the discrete, pre-defined ranges the chart can
 * expose in its picker plus the escape hatch for fully custom windows.
 */
export type TimeRangeValue = '24h' | '7d' | '30d' | 'custom';

/**
 * Selected time range for a sensor chart.
 *
 * - `value`: canonical id used by parent components to re-fetch data
 * - `label`: human-readable string shown in the picker UI
 * - `start` / `end`: optional ISO window. Populated when `value === 'custom'`.
 */
export interface TimeRange {
  value: TimeRangeValue;
  label: string;
  start?: Date;
  end?: Date;
}

/**
 * A single parameter (series) shown on the chart.
 *
 * Mirrors the fields of {@link ParameterConfig} minus the Lucide icon (charts
 * don't render icons; the icon is a UI concern of the parent dashboard).
 * Parents can pass `ParameterConfig`-shaped objects cast to `SensorParameter`
 * as long as all required fields are present.
 */
export interface SensorParameter {
  /** Property key on a {@link SensorReading} (e.g. 'ph', 'turbidity'). */
  key: string;
  /** Display label rendered in the legend / tooltip. */
  label: string;
  /** Unit string (e.g. 'NTU', 'mg/L', '°C', '' for dimensionless). */
  unit: string;
  /** Hex/rgba color used for the line + legend swatch. */
  color: string;
  /** Decimal precision used when formatting tooltips. */
  decimals: number;
}

/**
 * Optional alert thresholds per parameter. Each parameter can declare an
 * inverse range; both bounds are optional and rendered as dashed annotation
 * lines on the chart.
 */
export interface SensorThresholds {
  low?: number;
  high?: number;
}
