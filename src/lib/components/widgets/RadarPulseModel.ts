/**
 * Logik des Radar-Impuls-Widgets (W1): Laufzeit, Auflösung, Eindeutigkeit
 * und die Position des Impulses auf der Zeitachse.
 *
 * Alle Radarformeln kommen aus `$lib/utils/radar` — hier wird nur kombiniert.
 */
import { speedOfLight } from '$lib/stores/speedOfLight.svelte';
import {
  calculateRangeResolution,
  calculateRoundTripTime,
  calculateUnambiguousRange
} from '$lib/utils/radar';
import { safeDivide } from '$lib/utils/handlers';

/** Reglerbereiche des Widgets */
export const RADAR_PULSE_LIMITS = {
  rangeM: { min: 500, max: 300_000, default: 30_000 },
  pulseWidthS: { min: 0.1e-6, max: 10e-6, default: 1e-6 },
  prfHz: { min: 100, max: 5000, default: 1000 }
} as const;

/** Anteil der Zeitachse, den ein Impuls mindestens einnimmt (für Sichtbarkeit) */
export const MIN_PULSE_DRAW_FRACTION = 0.015;

export interface RadarPulseResult {
  /** Signallaufzeit hin und zurück in s */
  roundTripS: number;
  /** Entfernungsauflösung ΔR = c·τ/2 in m */
  rangeResolutionM: number;
  /** Eindeutige Entfernung R_u = c/(2·PRF) in m */
  unambiguousRangeM: number;
  /** Pulswiederholintervall PRI = 1/PRF in s */
  priS: number;
  /** Blindbereich (Ziele innerhalb der Sendedauer) in m — identisch mit ΔR */
  blindRangeM: number;
  /** Tastverhältnis τ·PRF */
  dutyCycle: number;
  /** true, wenn das Echo erst nach dem nächsten Sendeimpuls eintrifft */
  ambiguous: boolean;
  /** true, wenn das Ziel im Blindbereich liegt */
  blind: boolean;
}

export function computeRadarPulse(
  rangeM: number,
  pulseWidthS: number,
  prfHz: number,
  c: number = speedOfLight.value
): RadarPulseResult {
  const roundTripS = calculateRoundTripTime(rangeM, c);
  const rangeResolutionM = calculateRangeResolution(pulseWidthS, c);
  const unambiguousRangeM = calculateUnambiguousRange(prfHz, c);
  const priS = safeDivide(1, prfHz, 0);
  return {
    roundTripS,
    rangeResolutionM,
    unambiguousRangeM,
    priS,
    blindRangeM: rangeResolutionM,
    dutyCycle: pulseWidthS * prfHz,
    ambiguous: rangeM > unambiguousRangeM,
    blind: rangeM < rangeResolutionM
  };
}

export type PulsePhase = 'hin' | 'zurueck' | 'pause';

export interface PulsePosition {
  phase: PulsePhase;
  /** Position des Impulses zwischen Radar (0) und Ziel (1) */
  fraction: number;
}

/**
 * Wo befindet sich die Impulsfront zum Zeitpunkt t innerhalb eines PRI?
 * Hinweg: 0 … R/c, Rückweg: R/c … 2R/c, danach Pause bis zum nächsten Impuls.
 */
export function pulsePositionAt(tS: number, rangeM: number, c: number = speedOfLight.value): PulsePosition {
  const oneWayS = safeDivide(rangeM, c, 0);
  if (oneWayS <= 0 || tS < 0) return { phase: 'pause', fraction: 0 };
  if (tS <= oneWayS) return { phase: 'hin', fraction: tS / oneWayS };
  if (tS <= 2 * oneWayS) return { phase: 'zurueck', fraction: 1 - (tS - oneWayS) / oneWayS };
  return { phase: 'pause', fraction: 0 };
}

/**
 * Bildet einen Zeitpunkt (s) auf die Zeitachse ab, die zwei PRI umfasst,
 * damit der nächste Sendeimpuls sichtbar bleibt.
 */
export function timelineFraction(tS: number, priS: number): number {
  if (priS <= 0) return 0;
  return Math.max(0, Math.min(1, tS / (2 * priS)));
}
