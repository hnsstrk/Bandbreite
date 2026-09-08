/**
 * Logik des Blindgeschwindigkeits-Widgets: Bei welchen Radialgeschwindigkeiten
 * hält ein MTI-Radar ein bewegtes Ziel für stehend?
 *
 * Grundlage: v_b = n·λ·PRF/2 (Skolnik, Introduction to Radar Systems, 3. Aufl.,
 * §3.2/§3.3). Die Formeln stehen in `$lib/utils/radar`.
 */
import {
  calculateBlindSpeed,
  calculateStaggeredBlindSpeed,
  calculateUnambiguousRange,
  calculateUnambiguousVelocity
} from '$lib/utils/radar';
import { frequencyToWavelength } from '$lib/utils/calculations';
import { speedOfLight } from '$lib/stores/speedOfLight.svelte';

/** Reglerbereiche des Widgets */
export const BLIND_SPEED_LIMITS = {
  prfHz: { min: 250, max: 4000, default: 1000 },
  /** Zweite PRF der Staffelung */
  prf2Hz: { min: 250, max: 4000, default: 1200 },
  frequencyHz: { min: 1e9, max: 35e9, default: 3e9 }
} as const;

/** Wie viele Blindgeschwindigkeiten die Skizze anzeigt. */
export const BLIND_SPEED_ORDERS = 4;

export interface BlindSpeedResult {
  /** Wellenlänge λ = c/f in m */
  wavelengthM: number;
  /** Blindgeschwindigkeiten v_b = n·λ·PRF/2 in m/s (n = 1 … `orders`) */
  blindSpeedsMs: number[];
  /** Erste Blindgeschwindigkeit in m/s */
  firstBlindSpeedMs: number;
  /** Eindeutig messbare Geschwindigkeit ±v_u = λ·PRF/4 in m/s */
  unambiguousVelocityMs: number;
  /** Eindeutige Entfernung R_u = c/(2·PRF) in m */
  unambiguousRangeM: number;
}

export function computeBlindSpeeds(
  prfHz: number,
  frequencyHz: number,
  orders: number = BLIND_SPEED_ORDERS,
  c: number = speedOfLight.value
): BlindSpeedResult {
  const wavelengthM = frequencyToWavelength(frequencyHz, c);
  const blindSpeedsMs = Array.from({ length: Math.max(0, orders) }, (_, index) =>
    calculateBlindSpeed(index + 1, wavelengthM, prfHz)
  );
  return {
    wavelengthM,
    blindSpeedsMs,
    firstBlindSpeedMs: blindSpeedsMs[0] ?? 0,
    unambiguousVelocityMs: calculateUnambiguousVelocity(prfHz, wavelengthM),
    unambiguousRangeM: calculateUnambiguousRange(prfHz, c)
  };
}

export interface StaggerResult {
  /** Erste gemeinsame Blindgeschwindigkeit beider PRFs in m/s (0 = keine gefunden) */
  commonBlindSpeedMs: number;
  /**
   * Verhältnis zur ersten Blindgeschwindigkeit der ersten PRF —
   * so viel weiter schiebt die Staffelung die Lücke hinaus.
   */
  gainFactor: number;
}

export function computeStagger(
  prf1Hz: number,
  prf2Hz: number,
  frequencyHz: number,
  c: number = speedOfLight.value
): StaggerResult {
  const wavelengthM = frequencyToWavelength(frequencyHz, c);
  const commonBlindSpeedMs = calculateStaggeredBlindSpeed(prf1Hz, prf2Hz, wavelengthM);
  const single = calculateBlindSpeed(1, wavelengthM, prf1Hz);
  return {
    commonBlindSpeedMs,
    gainFactor: single > 0 ? commonBlindSpeedMs / single : 0
  };
}

/** Geschwindigkeit in km/h für die Anzeige */
export function msToKmh(velocityMs: number): number {
  return velocityMs * 3.6;
}
