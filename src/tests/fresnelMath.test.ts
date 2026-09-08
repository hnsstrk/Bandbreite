/**
 * Tests für src/lib/utils/fresnelMath.ts (ITU-R P.526 Knife-Edge, 60-%-Regel)
 */
import { describe, it, expect } from 'vitest';
import {
  calculateFresnelParameter,
  calculateKnifeEdgeLossFromNu,
  calculateKnifeEdgeLoss,
  evaluateFresnelClearance,
  KNIFE_EDGE_MIN_NU
} from '$lib/utils/fresnelMath';
import { calculateFresnelRadius, frequencyToWavelength } from '$lib/utils/calculations';

const C = 299792458;

describe('calculateFresnelParameter', () => {
  it('ν = 0 bei Kante genau auf der Sichtlinie', () => {
    expect(calculateFresnelParameter(0, 0.1, 1000, 1000)).toBe(0);
  });

  it('ν = √2 bei h = r₁ (Kante am Rand der 1. Fresnel-Zone)', () => {
    const lambda = frequencyToWavelength(5.8e9, C);
    const r1 = calculateFresnelRadius(lambda, 5000, 5000);
    expect(calculateFresnelParameter(r1, lambda, 5000, 5000)).toBeCloseTo(Math.SQRT2, 6);
  });

  it('negative Höhe ergibt negatives ν', () => {
    expect(calculateFresnelParameter(-5, 0.1, 1000, 1000)).toBeLessThan(0);
  });

  it('ungültige Eingaben ergeben 0', () => {
    expect(calculateFresnelParameter(1, 0, 1000, 1000)).toBe(0);
    expect(calculateFresnelParameter(1, 0.1, 0, 1000)).toBe(0);
  });
});

describe('calculateKnifeEdgeLossFromNu', () => {
  it('ν = 0 → ≈ 6 dB (P.526)', () => {
    expect(calculateKnifeEdgeLossFromNu(0)).toBeCloseTo(6.0, 1);
  });

  it('ν = 1 → ≈ 13,9 dB (P.526-Näherung)', () => {
    expect(calculateKnifeEdgeLossFromNu(1)).toBeCloseTo(13.9, 1);
  });

  it('ν = −0,78 und darunter → 0 dB', () => {
    expect(calculateKnifeEdgeLossFromNu(KNIFE_EDGE_MIN_NU)).toBe(0);
    expect(calculateKnifeEdgeLossFromNu(-2)).toBe(0);
  });

  it('ist monoton steigend in ν', () => {
    let previous = calculateKnifeEdgeLossFromNu(-0.7);
    for (let nu = -0.6; nu <= 3; nu += 0.1) {
      const current = calculateKnifeEdgeLossFromNu(nu);
      expect(current).toBeGreaterThanOrEqual(previous);
      previous = current;
    }
  });
});

describe('calculateKnifeEdgeLoss', () => {
  it('Kante auf Sichtlinie bei 5,8 GHz / 10 km → ≈ 6 dB', () => {
    const lambda = frequencyToWavelength(5.8e9, C);
    expect(calculateKnifeEdgeLoss(0, lambda, 5000, 5000)).toBeCloseTo(6.0, 1);
  });
});

describe('evaluateFresnelClearance', () => {
  const lambda = frequencyToWavelength(5.8e9, C);

  it('Referenz: 5,8 GHz, 10 km Mitte → r₁ ≈ 11,37 m', () => {
    const result = evaluateFresnelClearance(lambda, 5000, 5000, -20);
    expect(result.radiusM).toBeCloseTo(11.37, 2);
  });

  it('Kante 20 m unter der Sichtlinie → frei, 0 dB', () => {
    const result = evaluateFresnelClearance(lambda, 5000, 5000, -20);
    expect(result.status).toBe('frei');
    expect(result.clearanceFraction).toBeGreaterThan(1);
    expect(result.lossDb).toBe(0);
  });

  it('Kante 3 m unter der Sichtlinie → eingeschränkt (< 60 %)', () => {
    const result = evaluateFresnelClearance(lambda, 5000, 5000, -3);
    expect(result.status).toBe('eingeschraenkt');
    expect(result.clearanceFraction).toBeCloseTo(3 / 11.37, 2);
  });

  it('Kante über der Sichtlinie → blockiert mit Zusatzdämpfung > 6 dB', () => {
    const result = evaluateFresnelClearance(lambda, 5000, 5000, 5);
    expect(result.status).toBe('blockiert');
    expect(result.lossDb).toBeGreaterThan(6);
  });
});
