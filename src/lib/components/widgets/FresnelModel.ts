/**
 * Logik des Fresnel-Widgets (W5): Ellipse der 1. Fresnel-Zone entlang der
 * Strecke, Hindernisbewertung nach der 60-%-Regel und Knife-Edge-Dämpfung.
 *
 * Radius: `calculateFresnelRadius` ($lib/utils/calculations),
 * Bewertung/Dämpfung: `evaluateFresnelClearance` ($lib/utils/fresnelMath).
 */
import { speedOfLight } from '$lib/stores/speedOfLight.svelte';
import { calculateFresnelRadius, frequencyToWavelength } from '$lib/utils/calculations';
import { evaluateFresnelClearance, type FresnelClearanceResult } from '$lib/utils/fresnelMath';

/** Reglerbereiche des Widgets */
export const FRESNEL_LIMITS = {
  distanceM: { min: 100, max: 50_000, default: 10_000 },
  frequencyHz: { min: 100e6, max: 80e9, default: 5.8e9 },
  obstaclePosition: { min: 0.05, max: 0.95, default: 0.5 },
  obstacleHeightM: { min: 0, max: 60, default: 10 },
  antennaHeightM: { min: 1, max: 80, default: 20 }
} as const;

/** Anzahl der Stützstellen für die gezeichnete Ellipse */
export const FRESNEL_ELLIPSE_SAMPLES = 48;

export interface FresnelScene {
  wavelengthM: number;
  /** Radius der 1. Zone in Streckenmitte in m */
  midRadiusM: number;
  /** Stützstellen (x entlang der Strecke in m, r Radius in m) */
  ellipse: { xM: number; rM: number }[];
  /** Abstand Sender → Hindernis in m */
  d1M: number;
  /** Abstand Hindernis → Empfänger in m */
  d2M: number;
  /** Kantenhöhe über der Sichtlinie in m (negativ = unterhalb) */
  obstacleAboveLosM: number;
  clearance: FresnelClearanceResult;
}

/**
 * Berechnet die Szene einer Funkstrecke mit zwei gleich hohen Antennen und
 * einem Hindernis an der relativen Position `obstaclePosition` (0 … 1).
 */
export function computeFresnelScene(
  distanceM: number,
  frequencyHz: number,
  obstaclePosition: number,
  obstacleHeightM: number,
  antennaHeightM: number,
  c: number = speedOfLight.value
): FresnelScene {
  const wavelengthM = frequencyToWavelength(frequencyHz, c);
  const d1M = distanceM * obstaclePosition;
  const d2M = distanceM - d1M;
  const obstacleAboveLosM = obstacleHeightM - antennaHeightM;

  const ellipse: { xM: number; rM: number }[] = [];
  for (let i = 0; i <= FRESNEL_ELLIPSE_SAMPLES; i++) {
    const xM = (distanceM * i) / FRESNEL_ELLIPSE_SAMPLES;
    ellipse.push({ xM, rM: calculateFresnelRadius(wavelengthM, xM, distanceM - xM, 1) });
  }

  return {
    wavelengthM,
    midRadiusM: calculateFresnelRadius(wavelengthM, distanceM / 2, distanceM / 2, 1),
    ellipse,
    d1M,
    d2M,
    obstacleAboveLosM,
    clearance: evaluateFresnelClearance(wavelengthM, d1M, d2M, obstacleAboveLosM)
  };
}
