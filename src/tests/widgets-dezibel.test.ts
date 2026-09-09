/**
 * Rechenmodell des Widgets „Linear oder logarithmisch" im Kapitel
 * „Dezibel und Pegel". Prüft die Kernaussage 10·log(A·B) = 10·log A + 10·log B
 * und die Achsenlagen.
 *
 * Referenz: IEC 60027-3 (Dezibel als logarithmische Verhältnisgröße).
 */
import { describe, it, expect } from 'vitest';
import {
  FACTOR_LIMITS,
  animatedFactor,
  combineFactors,
  dbAxisMax,
  dbPosition,
  decadeValues,
  linearPosition
} from '$lib/components/widgets/LogLinearModel';

describe('LogLinearModel: aus Multiplikation wird Addition', () => {
  it('rechnet Faktor 100 mal Faktor 1000 zu 50 dB', () => {
    const pair = combineFactors(100, 1000);
    expect(pair.product).toBe(100_000);
    expect(pair.dbA).toBeCloseTo(20, 9);
    expect(pair.dbB).toBeCloseTo(30, 9);
    expect(pair.dbProduct).toBeCloseTo(50, 9);
    expect(pair.dbA + pair.dbB).toBeCloseTo(pair.dbProduct, 9);
  });

  it('erfüllt die Summenregel für beliebige Faktoren', () => {
    for (const [a, b] of [
      [2, 2],
      [3.16, 31.6],
      [1, 1000],
      [7.5, 640]
    ]) {
      const pair = combineFactors(a, b);
      expect(pair.dbA + pair.dbB, `${a}·${b}`).toBeCloseTo(pair.dbProduct, 9);
    }
    expect(combineFactors(2, 1).dbA).toBeCloseTo(3.0103, 4);
  });

  it('drückt kleine Faktoren auf der linearen Achse an den Rand', () => {
    const pair = combineFactors(100, 1000);
    expect(linearPosition(pair.a, pair.product)).toBeCloseTo(0.001, 9);
    expect(linearPosition(pair.product, pair.product)).toBe(1);
    expect(linearPosition(2 * pair.product, pair.product)).toBe(1);
    // Auf der Dezibel-Achse liegt derselbe Faktor bei 40 % der Länge.
    expect(dbPosition(pair.dbA, 50)).toBeCloseTo(0.4, 9);
  });

  it('rundet das Achsenende auf volle 10 dB, mindestens aber 10 dB', () => {
    expect(dbAxisMax(50)).toBe(50);
    expect(dbAxisMax(41)).toBe(50);
    expect(dbAxisMax(0)).toBe(10);
    expect(dbAxisMax(3)).toBe(10);
  });

  it('setzt Dekadenmarken bis zum Produkt', () => {
    expect(decadeValues(100_000)).toEqual([1, 10, 100, 1000, 10_000, 100_000]);
    expect(decadeValues(0.5)).toEqual([1]);
  });

  it('führt den Marker in zwei gleich langen Dezibel-Schritten', () => {
    const pair = combineFactors(100, 1000);
    const start = animatedFactor(0, pair);
    const middle = animatedFactor(0.5, pair);
    const end = animatedFactor(1, pair);
    expect(start.db).toBeCloseTo(0, 9);
    expect(start.value).toBeCloseTo(1, 9);
    expect(middle.db).toBeCloseTo(pair.dbA, 9);
    expect(middle.value).toBeCloseTo(pair.a, 6);
    expect(end.db).toBeCloseTo(pair.dbProduct, 9);
    expect(end.value).toBeCloseTo(pair.product, 3);
    expect(start.step).toBe(1);
    expect(end.step).toBe(2);
    // Außerhalb von 0 … 1 wird geklemmt.
    expect(animatedFactor(-1, pair).db).toBeCloseTo(0, 9);
    expect(animatedFactor(2, pair).db).toBeCloseTo(pair.dbProduct, 9);
  });

  it('nennt sinnvolle Reglergrenzen', () => {
    expect(FACTOR_LIMITS.a.min).toBe(1);
    expect(FACTOR_LIMITS.a.max).toBeGreaterThanOrEqual(1000);
    expect(FACTOR_LIMITS.b.default).toBeLessThanOrEqual(FACTOR_LIMITS.b.max);
  });
});
