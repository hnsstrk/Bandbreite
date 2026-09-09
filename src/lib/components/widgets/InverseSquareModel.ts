/**
 * Rechenmodell der Kugelausbreitung (Widget `InverseSquareWidget`).
 *
 * Eine punktförmige Quelle verteilt ihre Leistung gleichmäßig auf eine
 * Kugelfläche A = 4π·d². Verdoppelt sich der Abstand, vervierfacht sich die
 * Fläche — die Leistungsdichte sinkt auf ein Viertel, also um 6,02 dB. Das
 * ist der eigentliche Grund für die Freiraumdämpfung; verloren geht dabei
 * nichts, die Leistung verteilt sich nur.
 *
 * Leistungsdichte, Feldstärke und EIRP kommen aus `$lib/utils/fieldStrength.ts`
 * und werden hier nicht neu gerechnet. Ergänzt sind Kugelfläche, das
 * Abstandsgesetz in Dezibel und die Stützstellen der Kurve.
 *
 * Quellen:
 * - ITU-R P.525 (Freiraumausbreitung, 1/d²-Gesetz)
 * - Meinke/Gundlach, Taschenbuch der Hochfrequenztechnik (Leistungsdichte,
 *   Feldwellenwiderstand)
 */

import {
  SPHERE_SOLID_ANGLE,
  eirpWatt,
  fieldStrengthFromDensity,
  powerDensityWattPerM2
} from '$lib/utils/fieldStrength';
import { safeDivide, safeLog } from '$lib/utils/handlers';

/** Verlust bei Verdopplung des Abstands: 20·log₁₀(2) ≈ 6,02 dB. */
export const DOUBLING_LOSS_DB = 20 * Math.log10(2);

/** Grenzen und Vorgabewerte des Widgets. */
export const SPREADING_LIMITS = {
  txPowerW: { min: 0.01, max: 1000, default: 1 },
  gainDbi: { min: 0, max: 30, default: 0 },
  distanceM: { min: 1, max: 10_000, default: 10 }
} as const;

/** Kugelfläche im Abstand d: A = 4π·d². */
export function sphereAreaM2(distanceM: number): number {
  if (distanceM <= 0) return 0;
  return SPHERE_SOLID_ANGLE * distanceM * distanceM;
}

/**
 * Verhältnis der Leistungsdichten zweier Abstände: (d_ref / d)².
 * Größer als 1 bedeutet: näher an der Quelle, dichter.
 */
export function relativeDensity(distanceM: number, referenceM: number): number {
  if (distanceM <= 0 || referenceM <= 0) return 0;
  return (referenceM / distanceM) ** 2;
}

/**
 * Abstandsgesetz in Dezibel: 20·log₁₀(d_zu / d_von).
 * Positiv = die Dichte sinkt (Verlust), negativ = sie steigt.
 */
export function spreadingLossDb(fromM: number, toM: number): number {
  if (fromM <= 0 || toM <= 0) return 0;
  return 20 * safeLog(safeDivide(toM, fromM, 1), 10, 0);
}

/** Alle Kennwerte eines Abstands. */
export interface SpreadingResult {
  eirpW: number;
  areaM2: number;
  /** Leistungsdichte S = EIRP / (4π·d²) in W/m² */
  densityWPerM2: number;
  /** Elektrische Feldstärke E = √(S·Z₀) in V/m */
  fieldVPerM: number;
  /** Verlust gegenüber 1 m Abstand in dB */
  lossFromOneMeterDb: number;
}

/** Leistungsdichte und Feldstärke im Abstand d. */
export function spreadingAt(txPowerW: number, gainDbi: number, distanceM: number): SpreadingResult {
  const eirpW = eirpWatt(txPowerW, gainDbi);
  const densityWPerM2 = powerDensityWattPerM2(eirpW, distanceM);
  return {
    eirpW,
    areaM2: sphereAreaM2(distanceM),
    densityWPerM2,
    fieldVPerM: fieldStrengthFromDensity(densityWPerM2),
    lossFromOneMeterDb: spreadingLossDb(1, distanceM)
  };
}

/**
 * Stützstellen der Leistungsdichtekurve über den Abstand (logarithmisch
 * gleichverteilt) — für die Darstellung der Gerade im doppelt-log-Diagramm.
 */
export function densityCurve(
  txPowerW: number,
  gainDbi: number,
  minM: number,
  maxM: number,
  steps: number = 60
): { distanceM: number; densityWPerM2: number }[] {
  if (minM <= 0 || maxM <= minM) return [];
  const count = Math.max(2, Math.round(steps));
  const eirpW = eirpWatt(txPowerW, gainDbi);
  return Array.from({ length: count }, (_, index) => {
    const distanceM = minM * (maxM / minM) ** (index / (count - 1));
    return { distanceM, densityWPerM2: powerDensityWattPerM2(eirpW, distanceM) };
  });
}
