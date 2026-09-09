/**
 * Rechenmodell des Nah-/Fernfeld-Diagramms (Widget `NearFarFieldWidget`).
 *
 * Reine Funktionen ohne DOM-Bezug: die drei Zonengrenzen um eine Antenne und
 * ihre Lage auf einer logarithmischen Abstandsachse.
 *
 * Modell (Balanis, *Antenna Theory*, 3. Aufl., Abschnitt 2.2.4):
 *  - **reaktives Nahfeld**  R < 0,62·√(D³/λ)
 *  - **strahlendes Nahfeld (Fresnel)**  0,62·√(D³/λ) ≤ R < 2·D²/λ
 *  - **Fernfeld (Fraunhofer)**  R ≥ 2·D²/λ
 *
 * Für elektrisch **kleine** Antennen (D ≲ λ) läuft 0,62·√(D³/λ) gegen null;
 * dort gilt die klassische Grenze λ/2π (Meinke/Gundlach). Annahme: Als
 * reaktive Grenze wird das Maximum beider Ausdrücke verwendet, damit die
 * Darstellung über den ganzen Reglerbereich stetig bleibt.
 *
 * Die Formeln λ/2π und 2·D²/λ selbst stehen bereits in `EmWaveModel.ts` und
 * werden von dort importiert — nicht dupliziert.
 */

import { frequencyToWavelength } from '$lib/utils/calculations';
import { safeDivide, safeLog, clamp } from '$lib/utils/handlers';
import { fraunhoferDistanceM, reactiveNearFieldM } from './EmWaveModel';

/** Vorfaktor der reaktiven Grenze nach Balanis: R = 0,62·√(D³/λ). */
export const REACTIVE_FACTOR = 0.62;

/** Grenzen und Vorgabewerte des Zonen-Widgets. */
export const NEAR_FAR_LIMITS = {
  frequencyHz: { min: 1e6, max: 1e11, default: 2.4e9 },
  apertureM: { min: 0.02, max: 10, default: 0.6 },
  distanceM: { min: 0.01, max: 1000, default: 5 }
} as const;

/** Kennungen der drei Zonen. */
export type FieldZone = 'reaktiv' | 'strahlend' | 'fern';

/** Anzeigenamen der Zonen. */
export const ZONE_LABELS: Record<FieldZone, string> = {
  reaktiv: 'reaktives Nahfeld',
  strahlend: 'strahlendes Nahfeld (Fresnel-Zone)',
  fern: 'Fernfeld (Fraunhofer-Zone)'
};

/**
 * Beginn des strahlenden Nahfelds: 0,62·√(D³/λ).
 * Quelle: Balanis, Antenna Theory, Gl. (2-7).
 */
export function radiatingNearFieldStartM(apertureM: number, wavelengthMeters: number): number {
  if (apertureM <= 0 || wavelengthMeters <= 0) return 0;
  return REACTIVE_FACTOR * Math.sqrt(safeDivide(apertureM ** 3, wavelengthMeters, 0));
}

/**
 * Obere Grenze des reaktiven Nahfelds. Für große Aperturen zählt der
 * Balanis-Ausdruck, für elektrisch kleine Antennen λ/2π (siehe Modulkopf).
 */
export function reactiveBoundaryM(apertureM: number, wavelengthMeters: number): number {
  return Math.max(
    reactiveNearFieldM(wavelengthMeters),
    radiatingNearFieldStartM(apertureM, wavelengthMeters)
  );
}

/** Die drei Zonengrenzen einer Antenne in Metern. */
export interface ZoneBoundaries {
  wavelengthM: number;
  /** λ/2π */
  lambdaOverTwoPiM: number;
  /** 0,62·√(D³/λ) */
  radiatingStartM: number;
  /** Obere Grenze des reaktiven Nahfelds (Maximum der beiden vorigen) */
  reactiveEndM: number;
  /** 2·D²/λ */
  farFieldStartM: number;
  /** Apertur in Wellenlängen — sagt, welche Näherung trägt */
  apertureInWavelengths: number;
}

/** Alle Grenzen zu Frequenz und Aperturdurchmesser. */
export function zoneBoundaries(frequencyHz: number, apertureM: number): ZoneBoundaries {
  const wavelengthM = frequencyToWavelength(frequencyHz);
  const lambdaOverTwoPiM = reactiveNearFieldM(wavelengthM);
  const radiatingStartM = radiatingNearFieldStartM(apertureM, wavelengthM);
  const reactiveEndM = Math.max(lambdaOverTwoPiM, radiatingStartM);
  const farFieldStartM = Math.max(fraunhoferDistanceM(apertureM, wavelengthM), reactiveEndM);
  return {
    wavelengthM,
    lambdaOverTwoPiM,
    radiatingStartM,
    reactiveEndM,
    farFieldStartM,
    apertureInWavelengths: safeDivide(apertureM, wavelengthM, 0)
  };
}

/** In welcher Zone liegt ein Beobachtungspunkt? */
export function zoneAt(distanceM: number, boundaries: ZoneBoundaries): FieldZone {
  if (distanceM < boundaries.reactiveEndM) return 'reaktiv';
  if (distanceM < boundaries.farFieldStartM) return 'strahlend';
  return 'fern';
}

/**
 * Ist die Fernfeldformel überhaupt anwendbar? Sie setzt eine Apertur voraus,
 * die groß gegen die Wellenlänge ist (Balanis: D > λ).
 */
export function isElectricallyLarge(boundaries: ZoneBoundaries): boolean {
  return boundaries.apertureInWavelengths > 1;
}

/**
 * Lage eines Abstands auf einer logarithmischen Achse, 0 … 1.
 * Werte außerhalb werden auf die Achsenenden geklemmt.
 */
export function logPosition(valueM: number, minM: number, maxM: number): number {
  if (valueM <= 0 || minM <= 0 || maxM <= minM) return 0;
  const span = safeLog(safeDivide(maxM, minM, 1), 10, 0);
  const offset = safeLog(safeDivide(valueM, minM, 1), 10, 0);
  return clamp(safeDivide(offset, span, 0), 0, 1);
}

/** Dekadenmarken einer logarithmischen Achse zwischen min und max. */
export function decadeTicks(minM: number, maxM: number): number[] {
  if (minM <= 0 || maxM <= minM) return [];
  const first = Math.ceil(Math.log10(minM));
  const last = Math.floor(Math.log10(maxM));
  const ticks: number[] = [];
  for (let exponent = first; exponent <= last; exponent++) ticks.push(10 ** exponent);
  return ticks;
}
