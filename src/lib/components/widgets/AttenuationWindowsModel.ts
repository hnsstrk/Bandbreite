/**
 * Logik des Dämpfungsfenster-Widgets (W8): Gasdämpfungskurve 1–350 GHz nach
 * ITU-R P.676-13, Markierung der Resonanzen und der atmosphärischen Fenster.
 *
 * Die Kurve kommt aus `calculateAtmosphericAttenuation` ($lib/utils/atmosphericAttenuation);
 * hier wird nur abgetastet und skaliert.
 */
import { calculateAtmosphericAttenuation } from '$lib/utils/atmosphericAttenuation';
import { ABSORPTION_PEAKS } from '$lib/utils/atmosphericAttenuation';
import {
  ATMOSPHERIC_ABSORPTION_PEAKS,
  STANDARD_PRESSURE_HPA,
  STANDARD_TEMPERATURE,
  STANDARD_WATER_VAPOR_DENSITY
} from '$lib/data/constants';
import { safeDivide, safeLog } from '$lib/utils/handlers';

/** Frequenzbereich der Kurve in GHz */
export const WINDOW_CURVE_MIN_GHZ = 1;
export const WINDOW_CURVE_MAX_GHZ = 350;

/** Stützstellen pro Dekade (logarithmisch verteilt) */
export const WINDOW_CURVE_POINTS_PER_DECADE = 120;

/** Reglerbereich der Wasserdampfdichte in g/m³ */
export const WATER_VAPOR_LIMITS = {
  min: 0,
  max: 30,
  default: STANDARD_WATER_VAPOR_DENSITY
} as const;

/** Wertebereich der logarithmischen y-Achse in dB/km */
export const WINDOW_CURVE_MIN_DB_KM = 1e-3;
export const WINDOW_CURVE_MAX_DB_KM = 1e2;

export interface WindowCurvePoint {
  frequencyGHz: number;
  oxygen: number;
  waterVapor: number;
  total: number;
}

/** Logarithmisch verteilte Frequenzen zwischen min und max (GHz) */
export function windowCurveFrequencies(
  minGHz: number = WINDOW_CURVE_MIN_GHZ,
  maxGHz: number = WINDOW_CURVE_MAX_GHZ,
  perDecade: number = WINDOW_CURVE_POINTS_PER_DECADE
): number[] {
  const decades = safeLog(maxGHz, 10, 0) - safeLog(minGHz, 10, 0);
  const count = Math.max(2, Math.round(decades * perDecade));
  const result: number[] = [];
  for (let i = 0; i <= count; i++) {
    result.push(minGHz * Math.pow(10, (decades * i) / count));
  }
  return result;
}

/**
 * Dämpfungskurve für gegebene Wasserdampfdichte (Standarddruck und -temperatur).
 */
export function generateWindowCurve(
  waterVaporDensity: number = STANDARD_WATER_VAPOR_DENSITY,
  temperatureK: number = STANDARD_TEMPERATURE,
  pressureHpa: number = STANDARD_PRESSURE_HPA
): WindowCurvePoint[] {
  const conditions = { temperatureK, pressureHpa, waterVaporDensity };
  return windowCurveFrequencies().map((frequencyGHz) => {
    const result = calculateAtmosphericAttenuation(frequencyGHz, conditions);
    return {
      frequencyGHz,
      oxygen: result.oxygen,
      waterVapor: result.waterVapor,
      total: result.total
    };
  });
}

/** Position (0 … 1) einer Frequenz auf der logarithmischen x-Achse */
export function frequencyToFraction(
  frequencyGHz: number,
  minGHz: number = WINDOW_CURVE_MIN_GHZ,
  maxGHz: number = WINDOW_CURVE_MAX_GHZ
): number {
  const fraction = safeDivide(
    safeLog(frequencyGHz, 10, 0) - safeLog(minGHz, 10, 0),
    safeLog(maxGHz, 10, 0) - safeLog(minGHz, 10, 0),
    0
  );
  return Math.max(0, Math.min(1, fraction));
}

/** Umkehrung: Anteil (0 … 1) → Frequenz in GHz */
export function fractionToFrequency(
  fraction: number,
  minGHz: number = WINDOW_CURVE_MIN_GHZ,
  maxGHz: number = WINDOW_CURVE_MAX_GHZ
): number {
  const clamped = Math.max(0, Math.min(1, fraction));
  return minGHz * Math.pow(safeDivide(maxGHz, minGHz, 1), clamped);
}

/** Position (0 … 1) einer Dämpfung auf der logarithmischen y-Achse (0 = unten) */
export function attenuationToFraction(
  dbPerKm: number,
  minDbKm: number = WINDOW_CURVE_MIN_DB_KM,
  maxDbKm: number = WINDOW_CURVE_MAX_DB_KM
): number {
  const clamped = Math.max(minDbKm, Math.min(maxDbKm, dbPerKm));
  return safeDivide(
    safeLog(clamped, 10, 0) - safeLog(minDbKm, 10, 0),
    safeLog(maxDbKm, 10, 0) - safeLog(minDbKm, 10, 0),
    0
  );
}

/** Nächstgelegener Kurvenpunkt zu einer Frequenz (logarithmischer Abstand) */
export function findNearestPoint(
  points: readonly WindowCurvePoint[],
  frequencyGHz: number
): WindowCurvePoint | null {
  if (points.length === 0 || frequencyGHz <= 0) return null;
  const target = safeLog(frequencyGHz, 10, 0);
  let best = points[0];
  let bestDistance = Math.abs(safeLog(best.frequencyGHz, 10, 0) - target);
  for (const point of points) {
    const distance = Math.abs(safeLog(point.frequencyGHz, 10, 0) - target);
    if (distance < bestDistance) {
      best = point;
      bestDistance = distance;
    }
  }
  return best;
}

export interface WindowMarker {
  id: string;
  frequencyGHz: number;
  label: string;
  kind: 'peak' | 'window';
}

/** Resonanzen (aus den Projektkonstanten) und Fenster im Kurvenbereich */
export const WINDOW_MARKERS: WindowMarker[] = [
  ...ATMOSPHERIC_ABSORPTION_PEAKS.filter(
    (peak) =>
      peak.peakFrequencyGHz >= WINDOW_CURVE_MIN_GHZ && peak.peakFrequencyGHz <= WINDOW_CURVE_MAX_GHZ
  ).map((peak) => ({
    id: peak.id,
    frequencyGHz: peak.peakFrequencyGHz,
    label: `${peak.molecule === 'H2O' ? 'H₂O' : 'O₂'} ${Math.round(peak.peakFrequencyGHz)} GHz`,
    kind: 'peak' as const
  })),
  ...ABSORPTION_PEAKS.windows
    .filter((window) => window.frequency <= WINDOW_CURVE_MAX_GHZ)
    .map((window) => ({
      id: `window-${window.frequency}`,
      frequencyGHz: window.frequency,
      label: windowLabel(window.frequency),
      kind: 'window' as const
    }))
];

function windowLabel(frequencyGHz: number): string {
  if (frequencyGHz === 35) return 'Ka-Fenster 35 GHz';
  if (frequencyGHz === 94) return 'W-Fenster 94 GHz';
  return `Fenster ${frequencyGHz} GHz`;
}
