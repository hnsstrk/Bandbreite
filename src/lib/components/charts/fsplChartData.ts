/**
 * Konstanten und Kurvenberechnung für {@link FSPLChart}.
 *
 * Muster wie bei `attenuationChartData.ts`: Daten und Mathematik liegen hier,
 * die Komponente zeichnet nur noch.
 */

import { calculateFSPL } from '$lib/utils/calculations';
import { formatLocaleNumber } from '$lib/utils/formatting';
import { CHART_DISTANCE_RANGES, CHART_FSPL_RANGES } from '$lib/data/spectrum';
import { FSPL_CHART_FREQUENCIES } from '$lib/data/presets';

/** Chart-Margins nach STYLE_GUIDE; rechts schmal, weil die Legende außerhalb liegt. */
export const FSPL_CHART_MARGIN = { top: 40, right: 40, bottom: 60, left: 70 } as const;

/** Distanzbereich der X-Achse (logarithmisch) */
export const MIN_DISTANCE_M = CHART_DISTANCE_RANGES.fspl.minM;
export const MAX_DISTANCE_M = CHART_DISTANCE_RANGES.fspl.maxM;

/** Dämpfungsbereich der Y-Achse */
export const MIN_FSPL_DB = CHART_FSPL_RANGES.standard.minDb;
export const MAX_FSPL_DB = CHART_FSPL_RANGES.standard.maxDb;

/** Stützstellen je Kurve */
export const CURVE_POINTS = 200;

export const X_TICK_VALUES = [1, 10, 100, 1000, 10000, 100000] as const;
export const Y_TICK_VALUES = [20, 40, 60, 80, 100, 120, 140, 160, 180] as const;

/** Ein Punkt einer FSPL-Kurve */
export interface FsplPoint {
  distance: number;
  fspl: number;
}

/** Eine Vergleichskurve: Frequenz, Beschriftung und Serien-Token. */
export interface FsplSeries {
  hz: number;
  label: string;
  color: string;
}

/**
 * Vergleichsfrequenzen mit Serien-Tokens statt der Hex-Farben aus
 * `presets.ts` — die Reihenfolge bleibt unverändert.
 */
export const FSPL_SERIES: FsplSeries[] = FSPL_CHART_FREQUENCIES.map((freq, index) => ({
  hz: freq.hz,
  label: freq.label,
  color: `var(--color-series-${index + 1})`
}));

/** Ab dieser relativen Abweichung gilt eine Frequenz nicht mehr als Preset. */
export const PRESET_MATCH_TOLERANCE = 0.05;

/**
 * Erzeugt die Stützpunkte einer FSPL-Kurve über der Distanz.
 * Punkte außerhalb des Achsenbereichs werden weggelassen.
 */
export function generateFsplCurve(frequencyHz: number): FsplPoint[] {
  const points: FsplPoint[] = [];
  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return points;

  const logMin = Math.log10(MIN_DISTANCE_M);
  const logMax = Math.log10(MAX_DISTANCE_M);

  for (let i = 0; i <= CURVE_POINTS; i++) {
    const distance = Math.pow(10, logMin + (logMax - logMin) * (i / CURVE_POINTS));
    const fspl = calculateFSPL(distance, frequencyHz);
    if (fspl >= MIN_FSPL_DB && fspl <= MAX_FSPL_DB) {
      points.push({ distance, fspl });
    }
  }
  return points;
}

/** Beschriftung eines Distanz-Ticks */
export function formatDistanceTick(meters: number): string {
  return meters >= 1000
    ? `${formatLocaleNumber(meters / 1000, { maxFrac: 3 })} km`
    : `${formatLocaleNumber(meters, { maxFrac: 3 })} m`;
}
