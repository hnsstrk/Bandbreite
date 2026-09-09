/**
 * Rechenmodell des Widgets „Linear oder logarithmisch" (`LogLinearWidget`).
 *
 * Kernaussage des Kapitels: Auf der linearen Achse wird multipliziert, auf der
 * Dezibel-Achse addiert — `10·log₁₀(A·B) = 10·log₁₀(A) + 10·log₁₀(B)`. Das
 * Widget zeigt beide Achsen übereinander und lässt einen Marker dieselben zwei
 * Schritte auf beiden gehen.
 *
 * Die Umrechnung Verhältnis ↔ Dezibel kommt aus `$lib/utils/decibel.ts`
 * (`powerRatioToDb`); hier stehen nur Achsenlagen und der Vergleich zweier
 * Faktoren.
 *
 * Quelle: IEC 60027-3 (Bel und Dezibel als logarithmische Verhältnisgrößen).
 */

import { powerRatioToDb } from '$lib/utils/decibel';
import { clamp, safeDivide, safeLog } from '$lib/utils/handlers';

/** Grenzen und Vorgabewerte der beiden Faktoren. */
export const FACTOR_LIMITS = {
  a: { min: 1, max: 1000, default: 100 },
  b: { min: 1, max: 1000, default: 1000 }
} as const;

/** Zwei Faktoren, ihr Produkt und die zugehörigen Pegel. */
export interface FactorPair {
  a: number;
  b: number;
  /** A · B */
  product: number;
  /** 10·log₁₀(A) */
  dbA: number;
  /** 10·log₁₀(B) */
  dbB: number;
  /** 10·log₁₀(A·B) = dbA + dbB */
  dbProduct: number;
}

/** Faktoren, Produkt und Pegel in einem Satz. */
export function combineFactors(a: number, b: number): FactorPair {
  const product = a * b;
  const dbA = powerRatioToDb(a);
  const dbB = powerRatioToDb(b);
  return { a, b, product, dbA, dbB, dbProduct: powerRatioToDb(product) };
}

/**
 * Lage eines Werts auf der **linearen** Achse, 0 … 1, bezogen auf das Produkt
 * als Achsenende. Kleine Faktoren rutschen dabei praktisch auf den Nullpunkt —
 * genau das macht die lineare Darstellung unbrauchbar.
 */
export function linearPosition(value: number, maxValue: number): number {
  return clamp(safeDivide(value, maxValue, 0), 0, 1);
}

/** Lage eines Pegels auf der Dezibel-Achse, 0 … 1. */
export function dbPosition(db: number, maxDb: number): number {
  return clamp(safeDivide(db, maxDb, 0), 0, 1);
}

/**
 * Achsenende der Dezibel-Achse: auf volle 10 dB aufgerundet, mindestens 10 dB.
 * So bleibt die Achse beim Schieben der Regler ruhig.
 */
export function dbAxisMax(dbProduct: number): number {
  return Math.max(10, Math.ceil(safeDivide(dbProduct, 10, 0)) * 10);
}

/** Dekadenmarken (1, 10, 100 …) bis zum Produkt, für beide Achsen. */
export function decadeValues(maxValue: number): number[] {
  if (maxValue < 1) return [1];
  const last = Math.floor(safeLog(maxValue, 10, 0));
  return Array.from({ length: last + 1 }, (_, exponent) => 10 ** exponent);
}

/**
 * Zwei-Schritt-Animation: Phase 0 … 1 wird auf den zurückgelegten Faktor
 * abgebildet. In der ersten Hälfte wächst der Marker von 1 auf A, in der
 * zweiten von A auf A·B — auf der Dezibel-Achse sind beide Schritte gerade
 * Strecken, auf der linearen nicht.
 *
 * @param phase Fortschritt 0 … 1
 * @returns aktueller Faktor und der gerade laufende Schritt
 */
export function animatedFactor(
  phase: number,
  pair: FactorPair
): { value: number; step: 1 | 2; db: number } {
  const clamped = clamp(phase, 0, 1);
  if (clamped < 0.5) {
    const t = clamped * 2;
    const db = pair.dbA * t;
    return { value: 10 ** (db / 10), step: 1, db };
  }
  const t = (clamped - 0.5) * 2;
  const db = pair.dbA + pair.dbB * t;
  return { value: 10 ** (db / 10), step: 2, db };
}
