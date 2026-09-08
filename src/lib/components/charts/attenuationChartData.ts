/**
 * Konstanten, Serienbeschreibung und Kurvenfabrik für {@link AttenuationChart}.
 *
 * Die acht früher fast identischen `d3.line()`-Generatoren stehen jetzt als
 * ein Serien-Array hier; die Komponente erzeugt daraus in einer Schleife die
 * Pfade. Farben kommen ausschließlich aus den Serien-Tokens.
 */

import { line } from 'd3-shape';
import { formatExponential, formatFixed } from '$lib/utils/formatting';
import type { ExtendedCurveDataPoint } from '$lib/utils/atmosphericAttenuation';

// Frequency and attenuation ranges
export const MIN_FREQ = 1; // 1 GHz
export const MAX_FREQ = 350; // 350 GHz (extended range to show 183 GHz peak)
export const MIN_ATTENUATION = 0.001; // 0.001 dB/km
export const MAX_ATTENUATION = 100; // 100 dB/km

// Chart margins — die Legende liegt außerhalb des SVG, deshalb schmaler Rand rechts
export const CHART_MARGIN = { top: 40, right: 40, bottom: 70, left: 80 } as const;

// X-axis tick values (frequency in GHz)
export const X_TICK_VALUES = [1, 2, 5, 10, 20, 50, 100, 200] as const;

// Y-axis tick values (attenuation in dB/km)
export const Y_TICK_VALUES = [0.001, 0.01, 0.1, 1, 10, 100] as const;

/** Serien-Token für Wasserdampf bzw. Sauerstoff — auch für die Peak-Marker. */
const COLOR_WATER_VAPOR = 'var(--color-series-2)';
const COLOR_OXYGEN = 'var(--color-series-1)';

// Absorption peak markers for the chart
export const ABSORPTION_PEAK_MARKERS = [
  { freq: 22.235, label: 'H₂O 22 GHz', color: COLOR_WATER_VAPOR },
  { freq: 60, label: 'O₂ 60 GHz', color: COLOR_OXYGEN },
  { freq: 118.75, label: 'O₂ 119 GHz', color: COLOR_OXYGEN },
  { freq: 183.31, label: 'H₂O 183 GHz', color: COLOR_WATER_VAPOR }
] as const;

// Absorption peak highlight regions (frequency bands in GHz)
export const ABSORPTION_REGIONS = [
  { minFreq: 20, maxFreq: 24, color: COLOR_WATER_VAPOR }, // 22 GHz Wasserdampf
  { minFreq: 50, maxFreq: 70, color: COLOR_OXYGEN }, // 60 GHz Sauerstoff
  { minFreq: 115, maxFreq: 122, color: COLOR_OXYGEN }, // 118,75 GHz Sauerstoff
  { minFreq: 178, maxFreq: 188, color: COLOR_WATER_VAPOR } // 183 GHz Wasserdampf
] as const;

/** Kennung einer Dämpfungskurve. */
export type AttenuationSeriesId =
  'oxygen' | 'waterVapor' | 'rain' | 'fog' | 'snow' | 'total' | 'totalAll';

/** Beschreibung einer Kurve: Beschriftung, Farbe, Strichbild und Wertzugriff. */
export interface AttenuationSeries {
  id: AttenuationSeriesId;
  label: string;
  /** Quellenangabe für die Legende, z. B. „ITU-R P.838-3" */
  source?: string;
  /** Serien-Token, niemals ein Hex-Wert */
  color: string;
  strokeWidth: number;
  dash?: string;
  /** Nur zeichnen, wenn Niederschlag eingestellt ist */
  precipitation?: boolean;
  /** Liest den Wert der Kurve aus einem Datenpunkt */
  value: (point: ExtendedCurveDataPoint) => number;
}

/**
 * Zeichenreihenfolge der Kurven: erst die Einzelanteile, dann die Summen —
 * so liegen die dickeren Summenlinien oben.
 */
export const ATTENUATION_SERIES: AttenuationSeries[] = [
  {
    id: 'oxygen',
    label: 'O₂ (Sauerstoff)',
    color: 'var(--color-series-1)',
    strokeWidth: 2,
    value: (d) => d.oxygen
  },
  {
    id: 'waterVapor',
    label: 'H₂O (Wasserdampf)',
    color: 'var(--color-series-2)',
    strokeWidth: 2,
    value: (d) => d.waterVapor
  },
  {
    id: 'rain',
    label: 'Regen',
    source: 'ITU-R P.838-3',
    color: 'var(--color-series-5)',
    strokeWidth: 2,
    dash: '6,3',
    precipitation: true,
    value: (d) => d.rain ?? 0
  },
  {
    id: 'fog',
    label: 'Nebel',
    source: 'ITU-R P.840-9',
    color: 'var(--color-series-4)',
    strokeWidth: 2,
    dash: '4,4',
    precipitation: true,
    value: (d) => d.fog ?? 0
  },
  {
    id: 'snow',
    label: 'Schnee',
    color: 'var(--color-series-8)',
    strokeWidth: 2,
    dash: '2,4',
    precipitation: true,
    value: (d) => d.snow ?? 0
  },
  {
    id: 'total',
    label: 'Gas gesamt',
    source: 'ITU-R P.676-13',
    color: 'var(--color-series-3)',
    strokeWidth: 2.5,
    value: (d) => d.total
  },
  {
    id: 'totalAll',
    label: 'Gesamt',
    color: 'var(--color-series-6)',
    strokeWidth: 3,
    precipitation: true,
    value: (d) => d.totalAll
  }
];

/**
 * Baut den Pfadgenerator einer Serie.
 * Werte unterhalb der Achsenuntergrenze werden angehoben, damit die
 * logarithmische Skala sie darstellen kann.
 */
export function createSeriesLine(
  series: AttenuationSeries,
  xScale: (frequencyGHz: number) => number,
  yScale: (attenuation: number) => number
) {
  return line<ExtendedCurveDataPoint>()
    .x((d) => xScale(d.frequencyGHz))
    .y((d) => yScale(Math.max(MIN_ATTENUATION, series.value(d) || MIN_ATTENUATION)));
}

/**
 * Formatiert einen Dämpfungswert ohne Einheit (Tooltip und Legende hängen sie
 * selbst an). Für Text mit Einheit gibt es `formatAttenuation` in
 * `$lib/utils/formatting`.
 */
export function formatAttenuationValue(dBkm: number): string {
  if (!Number.isFinite(dBkm)) return '—';
  if (dBkm >= 10) return formatFixed(dBkm, 1);
  if (dBkm >= 1) return formatFixed(dBkm, 2);
  if (dBkm >= 0.1) return formatFixed(dBkm, 3);
  if (dBkm >= 0.01) return formatFixed(dBkm, 4);
  return formatExponential(dBkm, 2);
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
