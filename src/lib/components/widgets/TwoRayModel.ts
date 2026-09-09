/**
 * Rechenmodell der Zweiwege-Ausbreitung (Widget `TwoRayWidget`).
 *
 * Über ebenem Boden erreichen den Empfänger zwei Wellen: die direkte und die
 * am Boden reflektierte. Ihr Laufwegunterschied Δ erzeugt eine
 * Phasendifferenz Δφ = 2π·Δ/λ; bei streifendem Einfall dreht die Reflexion die
 * Phase zusätzlich um 180° (Γ ≈ −1). Beide Wellen addieren sich deshalb zu
 *
 *     |1 + Γ·e^(−jΔφ)| = 2·|sin(Δφ/2)|   (für Γ = −1),
 *
 * was abwechselnd Maxima (bis +6 dB) und tiefe Einbrüche ergibt. Jenseits der
 * Bruchdistanz d_b = 4·h_t·h_r/λ gibt es keinen Einbruch mehr, und der Pegel
 * fällt mit d⁴ statt mit d² — der bekannte Übergang von 20 auf 40 dB je Dekade.
 *
 * Die Freiraumdämpfung selbst kommt aus `$lib/utils/calculations.ts`
 * (`calculateFSPL`, ITU-R P.525) und wird hier nicht neu gerechnet.
 *
 * Quellen:
 * - Rappaport, *Wireless Communications*, Abschnitt 4.6 (Two-Ray Ground
 *   Reflection Model, Bruchdistanz, d⁴-Gesetz)
 * - ITU-R P.1546 / P.530 — Mehrwegeschwund über ebenem Gelände
 *
 * Kontrollwerte (h_t = 30 m, h_r = 3 m, f = 900 MHz): λ = 0,3331 m,
 * d_b ≈ 1081 m, Zweiwegedämpfung bei 1 km = 40·log₁₀(1000) − 20·log₁₀(90)
 * ≈ 80,9 dB.
 */

import { calculateFSPL, frequencyToWavelength } from '$lib/utils/calculations';
import { safeDivide, safeLog } from '$lib/utils/handlers';

/** Reflexionsfaktor bei streifendem Einfall über gut leitendem Boden. */
export const GRAZING_REFLECTION_COEFFICIENT = -1;

/** Kleinster dargestellter Feldfaktor — echte Nullstellen sind unendlich tief. */
export const MIN_FIELD_FACTOR = 1e-3;

/** Grenzen und Vorgabewerte des Widgets. */
export const TWO_RAY_LIMITS = {
  txHeightM: { min: 1, max: 100, default: 30 },
  rxHeightM: { min: 1, max: 30, default: 3 },
  frequencyHz: { min: 30e6, max: 6e9, default: 900e6 },
  distanceM: { min: 10, max: 20_000, default: 1000 }
} as const;

/** Längen der beiden Wege und ihr Unterschied. */
export interface PathLengths {
  directM: number;
  reflectedM: number;
  deltaM: number;
}

/** Direkter und reflektierter Weg über ebenem Boden (Spiegelquelle). */
export function pathLengths(distanceM: number, txHeightM: number, rxHeightM: number): PathLengths {
  const directM = Math.hypot(distanceM, txHeightM - rxHeightM);
  const reflectedM = Math.hypot(distanceM, txHeightM + rxHeightM);
  return { directM, reflectedM, deltaM: reflectedM - directM };
}

/** Phasendifferenz aus dem Laufwegunterschied: Δφ = 2π·Δ/λ. */
export function phaseDifferenceRad(deltaM: number, wavelengthM: number): number {
  return safeDivide(2 * Math.PI * deltaM, wavelengthM, 0);
}

/**
 * Betrag der Summe beider Wellen, bezogen auf die direkte Welle allein:
 * |1 + Γ·e^(−jΔφ)|. Bei Γ = −1 vereinfacht sich das zu 2·|sin(Δφ/2)|.
 */
export function fieldFactor(
  phaseRad: number,
  reflection: number = GRAZING_REFLECTION_COEFFICIENT
): number {
  const real = 1 + reflection * Math.cos(phaseRad);
  const imaginary = -reflection * Math.sin(phaseRad);
  return Math.hypot(real, imaginary);
}

/** Gewinn oder Verlust gegenüber der reinen Freiraumausbreitung in dB. */
export function relativeLevelDb(factor: number): number {
  return 20 * safeLog(Math.max(factor, MIN_FIELD_FACTOR), 10, 0);
}

/**
 * Bruchdistanz d_b = 4·h_t·h_r/λ: der letzte Pegelgipfel. Dahinter fällt der
 * Pegel monoton mit d⁴.
 */
export function breakpointDistanceM(
  txHeightM: number,
  rxHeightM: number,
  wavelengthM: number
): number {
  return safeDivide(4 * txHeightM * rxHeightM, wavelengthM, 0);
}

/**
 * Zweiwege-Dämpfung im Fernbereich: 40·log₁₀(d) − 20·log₁₀(h_t·h_r).
 * Frequenzunabhängig — anders als die Freiraumdämpfung.
 * Quelle: Rappaport, Gl. (4.52).
 */
export function twoRayPathLossDb(distanceM: number, txHeightM: number, rxHeightM: number): number {
  if (distanceM <= 0 || txHeightM <= 0 || rxHeightM <= 0) return 0;
  return 40 * safeLog(distanceM, 10, 0) - 20 * safeLog(txHeightM * rxHeightM, 10, 0);
}

/** Alle Kennwerte für einen Abstand. */
export interface TwoRayPoint {
  distanceM: number;
  paths: PathLengths;
  phaseRad: number;
  factor: number;
  /** Freiraumdämpfung nach ITU-R P.525 in dB */
  fsplDb: number;
  /** Gesamtdämpfung: Freiraum abzüglich der Interferenz in dB */
  totalLossDb: number;
  /** Abweichung von der Freiraumdämpfung in dB (positiv = Gewinn) */
  relativeDb: number;
}

/** Zweiwege-Modell an einer Stelle auswerten. */
export function twoRayAt(
  distanceM: number,
  frequencyHz: number,
  txHeightM: number,
  rxHeightM: number
): TwoRayPoint {
  const wavelengthM = frequencyToWavelength(frequencyHz);
  const paths = pathLengths(distanceM, txHeightM, rxHeightM);
  const phaseRad = phaseDifferenceRad(paths.deltaM, wavelengthM);
  const factor = fieldFactor(phaseRad);
  const fsplDb = calculateFSPL(distanceM, frequencyHz);
  const relativeDb = relativeLevelDb(factor);
  return {
    distanceM,
    paths,
    phaseRad,
    factor,
    fsplDb,
    totalLossDb: fsplDb - relativeDb,
    relativeDb
  };
}

/** Stützstellen der Dämpfungskurve, logarithmisch über den Abstand verteilt. */
export function twoRayCurve(
  frequencyHz: number,
  txHeightM: number,
  rxHeightM: number,
  minM: number,
  maxM: number,
  steps: number = 320
): TwoRayPoint[] {
  if (minM <= 0 || maxM <= minM) return [];
  const count = Math.max(2, Math.round(steps));
  return Array.from({ length: count }, (_, index) => {
    const distanceM = minM * (maxM / minM) ** (index / (count - 1));
    return twoRayAt(distanceM, frequencyHz, txHeightM, rxHeightM);
  });
}
