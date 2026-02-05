/**
 * Constants, tick values, types, and helper functions for AttenuationChart.
 * Extracted to keep the main chart component under 300 lines.
 */

// Frequency and attenuation ranges
export const MIN_FREQ = 1; // 1 GHz
export const MAX_FREQ = 350; // 350 GHz (extended range to show 183 GHz peak)
export const MIN_ATTENUATION = 0.001; // 0.001 dB/km
export const MAX_ATTENUATION = 100; // 100 dB/km

// Chart margins
export const CHART_MARGIN = { top: 50, right: 220, bottom: 70, left: 80 } as const;

// X-axis tick values (frequency in GHz)
export const X_TICK_VALUES = [1, 2, 5, 10, 20, 50, 100, 200] as const;

// Y-axis tick values (attenuation in dB/km)
export const Y_TICK_VALUES = [0.001, 0.01, 0.1, 1, 10, 100] as const;

// Absorption peak markers for the chart
export const ABSORPTION_PEAK_MARKERS = [
  { freq: 22.235, label: 'H2O 22 GHz', color: '#22c55e' },
  { freq: 60, label: 'O2 60 GHz', color: '#3b82f6' },
  { freq: 118.75, label: 'O2 119 GHz', color: '#3b82f6' },
  { freq: 183.31, label: 'H2O 183 GHz', color: '#22c55e' }
] as const;

// Absorption peak highlight regions (frequency bands in GHz)
export const ABSORPTION_REGIONS = [
  { minFreq: 20, maxFreq: 24, color: '#22c55e' },   // 22 GHz water vapor
  { minFreq: 50, maxFreq: 70, color: '#3b82f6' },   // 60 GHz oxygen
  { minFreq: 115, maxFreq: 122, color: '#3b82f6' },  // 118.75 GHz oxygen
  { minFreq: 178, maxFreq: 188, color: '#22c55e' }   // 183 GHz water vapor
] as const;

/** Format attenuation value for display in tooltip/legend */
export function formatAttenuation(dBkm: number): string {
  if (dBkm >= 10) return dBkm.toFixed(1);
  if (dBkm >= 1) return dBkm.toFixed(2);
  if (dBkm >= 0.1) return dBkm.toFixed(3);
  if (dBkm >= 0.01) return dBkm.toFixed(4);
  return dBkm.toExponential(2);
}

/** Marker data computed from the current frequency and atmospheric conditions */
export interface MarkerData {
  x: number;
  yOxygen: number;
  yWaterVapor: number;
  yTotal: number;
  yRain: number;
  yFog: number;
  ySnow: number;
  yTotalAll: number;
  frequency: number;
  oxygen: number;
  waterVapor: number;
  total: number;
  rain: number;
  fog: number;
  snow: number;
  totalAll: number;
}
