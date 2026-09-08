/**
 * Logik des FMCW-Widgets: Sende- und Empfangsrampe, Beat-Frequenz und
 * Entfernungsauflösung ΔR = c/(2·B).
 *
 * Alle Formeln stammen aus `$lib/utils/radar`; hier wird nur kombiniert und
 * für die Zeichnung normiert. Quelle der Zusammenhänge:
 * Skolnik, Introduction to Radar Systems, 3. Aufl., §3.3 „FM-CW radar".
 */
import { speedOfLight } from '$lib/stores/speedOfLight.svelte';
import {
  calculateBandwidthRangeResolution,
  calculateBeatFrequency,
  calculateRoundTripTime
} from '$lib/utils/radar';
import { safeDivide } from '$lib/utils/handlers';

/** Reglerbereiche des Widgets (Automotive-Radar als Anschauungsfall). */
export const FMCW_LIMITS = {
  bandwidthHz: { min: 100e6, max: 4e9, default: 1e9 },
  rampDurationS: { min: 10e-6, max: 200e-6, default: 50e-6 },
  rangeM: { min: 5, max: 300, default: 100 }
} as const;

/** Mittenfrequenz der Darstellung (77-GHz-Automotive-Band, ETSI EN 301 091). */
export const FMCW_CENTER_FREQUENCY_HZ = 77e9;

export interface FmcwResult {
  /** Laufzeit hin und zurück τ = 2R/c in s */
  delayS: number;
  /** Rampensteilheit S = B/T in Hz/s */
  slopeHzPerS: number;
  /** Beat-Frequenz f_b = S·τ in Hz */
  beatHz: number;
  /** Entfernungsauflösung ΔR = c/(2·B) in m */
  rangeResolutionM: number;
  /** Anteil der Rampendauer, den die Laufzeit einnimmt (0 … 1) */
  delayFraction: number;
  /**
   * true, wenn die Laufzeit einen nennenswerten Teil der Rampe belegt und die
   * einfache Auswertung damit an ihre Grenze kommt.
   */
  delayCritical: boolean;
}

/** Ab diesem Anteil der Rampendauer gilt die Laufzeit als kritisch lang. */
export const FMCW_DELAY_WARN_FRACTION = 0.1;

export function computeFmcw(
  rangeM: number,
  bandwidthHz: number,
  rampDurationS: number,
  c: number = speedOfLight.value
): FmcwResult {
  const delayS = calculateRoundTripTime(rangeM, c);
  const slopeHzPerS = safeDivide(bandwidthHz, rampDurationS, 0);
  const delayFraction = Math.min(1, safeDivide(delayS, rampDurationS, 0));
  return {
    delayS,
    slopeHzPerS,
    beatHz: calculateBeatFrequency(rangeM, bandwidthHz, rampDurationS, c),
    rangeResolutionM: calculateBandwidthRangeResolution(bandwidthHz, c),
    delayFraction,
    delayCritical: delayFraction >= FMCW_DELAY_WARN_FRACTION
  };
}

/**
 * Entfernung, die zu einer gemessenen Beat-Frequenz gehört:
 *   R = f_b · c · T / (2·B)  — die Umkehrung von `calculateBeatFrequency`.
 */
export function rangeFromBeatFrequency(
  beatHz: number,
  bandwidthHz: number,
  rampDurationS: number,
  c: number = speedOfLight.value
): number {
  if (beatHz <= 0 || bandwidthHz <= 0 || rampDurationS <= 0) return 0;
  return safeDivide(beatHz * c * rampDurationS, 2 * bandwidthHz, 0);
}

/**
 * Wie viele auflösbare Entfernungszellen liegen zwischen 0 und `rangeM`?
 * Anschauliche Größe für die Wirkung der Bandbreite.
 */
export function resolutionCells(rangeM: number, rangeResolutionM: number): number {
  if (rangeM <= 0 || rangeResolutionM <= 0) return 0;
  return Math.floor(safeDivide(rangeM, rangeResolutionM, 0));
}
