/**
 * Fresnel-Zonen-Geometrie und Beugungsdämpfung an einer Schneide (Knife-Edge).
 *
 * Quellen:
 * - ITU-R P.526-15, §4.1 (Fresnel-Parameter ν) und Gl. (31) (Näherung J(ν))
 * - ITU-R P.530 (Freihaltung ≥ 60 % der 1. Fresnel-Zone)
 *
 * Der Fresnel-Radius selbst kommt aus `calculateFresnelRadius` in
 * `$lib/utils/calculations` — hier wird nichts dupliziert.
 */
import { calculateFresnelRadius, FRESNEL_CLEARANCE_FRACTION } from '$lib/utils/calculations';
import { safeDivide, safeLog } from '$lib/utils/handlers';

/** Unterhalb von ν = −0,78 ist die Beugungsdämpfung nach P.526 vernachlässigbar (0 dB). */
export const KNIFE_EDGE_MIN_NU = -0.78;

/** Konstanten der P.526-Näherung J(ν) = 6,9 + 20·log₁₀(√((ν − 0,1)² + 1) + ν − 0,1) */
const KNIFE_EDGE_OFFSET_DB = 6.9;
const KNIFE_EDGE_NU_SHIFT = 0.1;

/**
 * Fresnel-Kirchhoff-Beugungsparameter ν = h · √(2·(d₁ + d₂) / (λ·d₁·d₂)).
 *
 * @param obstructionHeightM - Höhe der Hinderniskante über der Sichtlinie in m
 *   (negativ = Kante unterhalb der Sichtlinie, also freier Weg)
 * @param wavelengthM - Wellenlänge in m
 * @param d1M - Abstand Sender → Hindernis in m
 * @param d2M - Abstand Hindernis → Empfänger in m
 * @returns ν (0 bei ungültigen Eingaben)
 */
export function calculateFresnelParameter(
  obstructionHeightM: number,
  wavelengthM: number,
  d1M: number,
  d2M: number
): number {
  if (!Number.isFinite(obstructionHeightM) || wavelengthM <= 0 || d1M <= 0 || d2M <= 0) return 0;
  return obstructionHeightM * Math.sqrt(safeDivide(2 * (d1M + d2M), wavelengthM * d1M * d2M, 0));
}

/**
 * Beugungsdämpfung J(ν) einer einzelnen Schneide in dB (ITU-R P.526, Gl. 31).
 * Gültig für ν > −0,78; darunter 0 dB. Bei ν = 0 (Kante genau auf der Sichtlinie)
 * ergeben sich ≈ 6 dB.
 *
 * @param nu - Fresnel-Kirchhoff-Parameter
 * @returns Zusatzdämpfung in dB (≥ 0)
 */
export function calculateKnifeEdgeLossFromNu(nu: number): number {
  if (!Number.isFinite(nu) || nu <= KNIFE_EDGE_MIN_NU) return 0;
  const shifted = nu - KNIFE_EDGE_NU_SHIFT;
  const argument = Math.sqrt(shifted * shifted + 1) + shifted;
  const loss = KNIFE_EDGE_OFFSET_DB + 20 * safeLog(argument, 10, 0);
  return Math.max(0, loss);
}

/**
 * Beugungsdämpfung an einer Schneide aus der Geometrie der Funkstrecke.
 *
 * @param obstructionHeightM - Kantenhöhe über der Sichtlinie in m (negativ = frei)
 * @param wavelengthM - Wellenlänge in m
 * @param d1M - Abstand Sender → Hindernis in m
 * @param d2M - Abstand Hindernis → Empfänger in m
 * @returns Zusatzdämpfung in dB
 */
export function calculateKnifeEdgeLoss(
  obstructionHeightM: number,
  wavelengthM: number,
  d1M: number,
  d2M: number
): number {
  return calculateKnifeEdgeLossFromNu(
    calculateFresnelParameter(obstructionHeightM, wavelengthM, d1M, d2M)
  );
}

export type FresnelClearanceStatus = 'frei' | 'eingeschraenkt' | 'blockiert';

export interface FresnelClearanceResult {
  /** Radius der 1. Fresnel-Zone am Hindernis in m */
  radiusM: number;
  /** Freier Abstand zwischen Sichtlinie und Kante in m (negativ = Kante ragt hinein) */
  clearanceM: number;
  /** Anteil des freien Abstands am Radius (1 = ganze Zone frei, 0 = Kante auf Sichtlinie) */
  clearanceFraction: number;
  /** Bewertung nach der 60-%-Regel */
  status: FresnelClearanceStatus;
  /** Fresnel-Kirchhoff-Parameter ν */
  nu: number;
  /** Zusatzdämpfung nach P.526 in dB */
  lossDb: number;
}

/**
 * Bewertet ein Hindernis relativ zur 1. Fresnel-Zone.
 *
 * @param wavelengthM - Wellenlänge in m
 * @param d1M - Abstand Sender → Hindernis in m
 * @param d2M - Abstand Hindernis → Empfänger in m
 * @param obstructionHeightAboveLosM - Kantenhöhe über der Sichtlinie in m (negativ = unterhalb)
 */
export function evaluateFresnelClearance(
  wavelengthM: number,
  d1M: number,
  d2M: number,
  obstructionHeightAboveLosM: number
): FresnelClearanceResult {
  const radiusM = calculateFresnelRadius(wavelengthM, d1M, d2M, 1);
  const clearanceM = -obstructionHeightAboveLosM;
  const clearanceFraction = safeDivide(clearanceM, radiusM, 0);
  const nu = calculateFresnelParameter(obstructionHeightAboveLosM, wavelengthM, d1M, d2M);
  const lossDb = calculateKnifeEdgeLossFromNu(nu);

  let status: FresnelClearanceStatus = 'frei';
  if (clearanceFraction < 0) status = 'blockiert';
  else if (clearanceFraction < FRESNEL_CLEARANCE_FRACTION) status = 'eingeschraenkt';

  return { radiusM, clearanceM, clearanceFraction, status, nu, lossDb };
}
