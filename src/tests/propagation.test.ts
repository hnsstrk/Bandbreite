/**
 * Referenztests für src/lib/data/propagation.ts
 * Werte: R = 6371 km, k = 4/3 (Bericht 03, Abschnitt 4.4)
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRadioHorizon,
  calculateMaxLOSDistance,
  calculateSkipDistance,
  calculateSkipDistanceForFrequency,
  calculatePlasmaFrequency,
  calculateCriticalFrequency,
  estimateMUF,
  EARTH_RADIUS_KM,
  REFRACTION_FACTOR_K
} from '$lib/data/propagation';

describe('Konstanten', () => {
  it('Erdradius 6371 km, k = 4/3', () => {
    expect(EARTH_RADIUS_KM).toBe(6371);
    expect(REFRACTION_FACTOR_K).toBeCloseTo(4 / 3, 15);
  });
});

describe('calculateRadioHorizon', () => {
  const cases: [number, number, number][] = [
    [2, 5.048, 5.829],
    [10, 11.29, 13.03],
    [30, 19.55, 22.58],
    [100, 35.7, 41.22],
    [300, 61.83, 71.39]
  ];
  it.each(cases)('h = %s m → %s km (k=1) / %s km (k=4/3)', (h, geom, radio) => {
    expect(calculateRadioHorizon(h, false)).toBeCloseTo(geom, 2);
    expect(calculateRadioHorizon(h, true)).toBeCloseTo(radio, 2);
  });
  it('0 für h ≤ 0', () => {
    expect(calculateRadioHorizon(0)).toBe(0);
    expect(calculateRadioHorizon(-5)).toBe(0);
  });
});

describe('calculateMaxLOSDistance', () => {
  it('30 m / 30 m → 45,15 km', () => {
    expect(calculateMaxLOSDistance(30, 30)).toBeCloseTo(45.15, 2);
  });
});

describe('calculateSkipDistance (sphärisch)', () => {
  it('300 km, 10° → 2193 km (Flacherde ergäbe 3403 km)', () => {
    expect(calculateSkipDistance(300, 10)).toBeCloseTo(2193, 0);
  });
  it('300 km, 45° → 561 km', () => {
    expect(calculateSkipDistance(300, 45)).toBeCloseTo(561, 0);
  });
  it('300 km, 5° → 2877 km; 20° → 1374 km; 30° → 934 km', () => {
    expect(calculateSkipDistance(300, 5)).toBeCloseTo(2877, 0);
    expect(calculateSkipDistance(300, 20)).toBeCloseTo(1374, 0);
    expect(calculateSkipDistance(300, 30)).toBeCloseTo(934, 0);
  });
  it('θ → 0 bleibt unter dem geometrischen Maximum 2·R·arccos(R/(R+h)) ≈ 3836 km', () => {
    const max = 2 * EARTH_RADIUS_KM * Math.acos(EARTH_RADIUS_KM / (EARTH_RADIUS_KM + 300));
    expect(max).toBeCloseTo(3835.8, 0);
    expect(calculateSkipDistance(300, 0.0001)).toBeLessThan(max);
    expect(calculateSkipDistance(300, 0.0001)).toBeGreaterThan(max - 1);
  });
  it('0 bei 0°, 90° oder ungültiger Höhe', () => {
    expect(calculateSkipDistance(300, 0)).toBe(0);
    expect(calculateSkipDistance(300, 90)).toBe(0);
    expect(calculateSkipDistance(0, 10)).toBe(0);
  });
});

describe('calculateSkipDistanceForFrequency (Sekantengesetz)', () => {
  it('f ≤ foF2 → 0 (senkrechte Reflexion)', () => {
    expect(calculateSkipDistanceForFrequency(5, 5)).toBe(0);
    expect(calculateSkipDistanceForFrequency(3, 5)).toBe(0);
  });
  it('ist konsistent mit calculateSkipDistance und estimateMUF', () => {
    // Bei 10° Abstrahlwinkel: Distanz d und zugehörige MUF; die Sprungdistanz für f = MUF(d) muss d ergeben
    const d = calculateSkipDistance(300, 10);
    const muf = estimateMUF(5, d, 300);
    expect(calculateSkipDistanceForFrequency(muf, 5, 300)).toBeCloseTo(d, 3);
  });
  it('null oberhalb der maximal erreichbaren MUF', () => {
    expect(calculateSkipDistanceForFrequency(50, 5, 300)).toBeNull();
    expect(calculateSkipDistanceForFrequency(0, 5)).toBeNull();
  });
});

describe('calculatePlasmaFrequency / calculateCriticalFrequency', () => {
  it('N = 10¹² m⁻³ → 9,0 MHz', () => {
    expect(calculatePlasmaFrequency(1e12) / 1e6).toBeCloseTo(9.0, 2);
    expect(calculateCriticalFrequency(1e12)).toBeCloseTo(9.0, 2);
  });
  it('N = 1,5·10¹² → 11,02 MHz', () => {
    expect(calculateCriticalFrequency(1.5e12)).toBeCloseTo(11.02, 1);
  });
  it('0 für N ≤ 0', () => {
    expect(calculatePlasmaFrequency(0)).toBe(0);
  });
});

describe('estimateMUF (Sekantengesetz, h = 300 km)', () => {
  it('d = 0 → MUF = foF2 (M = 1)', () => {
    expect(estimateMUF(5, 0)).toBeCloseTo(5, 3);
  });
  it('Kontrollwerte M(500) ≈ 1,30, M(1000) ≈ 1,86, M(2000) ≈ 2,80, M(3000) ≈ 3,28', () => {
    expect(estimateMUF(1, 500)).toBeCloseTo(1.3, 1);
    expect(estimateMUF(1, 1000)).toBeCloseTo(1.86, 1);
    expect(estimateMUF(1, 2000)).toBeCloseTo(2.8, 1);
    expect(estimateMUF(1, 3000)).toBeCloseTo(3.28, 1);
  });
  it('3000 km: Faktor zwischen 2,8 und 3,5 (ITU-R P.1239)', () => {
    expect(estimateMUF(5, 3000) / 5).toBeGreaterThan(2.8);
    expect(estimateMUF(5, 3000) / 5).toBeLessThan(3.5);
  });
  it('ist auf mufFactorMax begrenzt und monoton', () => {
    expect(estimateMUF(1, 8000)).toBeLessThanOrEqual(3.5);
    expect(estimateMUF(1, 1000)).toBeLessThan(estimateMUF(1, 2000));
  });
  it('0 bei ungültigen Eingaben', () => {
    expect(estimateMUF(0, 1000)).toBe(0);
    expect(estimateMUF(5, -1)).toBe(0);
  });
});
