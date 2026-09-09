/**
 * Rechenmodell des Widgets „Kugelausbreitung" im Kapitel „Leistung, EIRP und
 * Feldstärke".
 *
 * Referenzwerte: ITU-R P.525 (1/d²-Gesetz); E = √(S·Z₀) mit Z₀ = 376,730 Ω.
 * Kontrollpunkt: 1 W isotrop in 1 m Abstand → S = 1/(4π) W/m² ≈ 79,58 mW/m²
 * und E ≈ 5,475 V/m.
 */
import { describe, it, expect } from 'vitest';
import {
  DOUBLING_LOSS_DB,
  SPREADING_LIMITS,
  densityCurve,
  relativeDensity,
  sphereAreaM2,
  spreadingAt,
  spreadingLossDb
} from '$lib/components/widgets/InverseSquareModel';
import { FREE_SPACE_IMPEDANCE } from '$lib/data/constants';

describe('InverseSquareModel: Kugelausbreitung', () => {
  it('rechnet die Kugelfläche 4π·d²', () => {
    expect(sphereAreaM2(1)).toBeCloseTo(4 * Math.PI, 9);
    expect(sphereAreaM2(10)).toBeCloseTo(400 * Math.PI, 6);
    expect(sphereAreaM2(0)).toBe(0);
  });

  it('liefert für 1 W isotrop in 1 m Abstand 79,58 mW/m² und 5,475 V/m', () => {
    const result = spreadingAt(1, 0, 1);
    expect(result.eirpW).toBeCloseTo(1, 9);
    expect(result.areaM2).toBeCloseTo(12.566_37, 4);
    expect(result.densityWPerM2).toBeCloseTo(1 / (4 * Math.PI), 9);
    expect(result.densityWPerM2).toBeCloseTo(0.079_577, 6);
    expect(result.fieldVPerM).toBeCloseTo(Math.sqrt(FREE_SPACE_IMPEDANCE / (4 * Math.PI)), 9);
    expect(result.fieldVPerM).toBeCloseTo(5.4753, 4);
    expect(result.lossFromOneMeterDb).toBeCloseTo(0, 9);
  });

  it('vervierfacht die Fläche und viertelt die Dichte bei doppeltem Abstand', () => {
    const near = spreadingAt(10, 0, 1);
    const far = spreadingAt(10, 0, 2);
    expect(far.areaM2 / near.areaM2).toBeCloseTo(4, 9);
    expect(near.densityWPerM2 / far.densityWPerM2).toBeCloseTo(4, 9);
    expect(DOUBLING_LOSS_DB).toBeCloseTo(6.0206, 4);
    expect(spreadingLossDb(1, 2)).toBeCloseTo(DOUBLING_LOSS_DB, 9);
    expect(spreadingLossDb(1, 10)).toBeCloseTo(20, 9);
    expect(relativeDensity(2, 1)).toBeCloseTo(0.25, 9);
    expect(relativeDensity(1, 2)).toBeCloseTo(4, 9);
  });

  it('berücksichtigt den Antennengewinn über das EIRP', () => {
    const isotropic = spreadingAt(1, 0, 100);
    const directional = spreadingAt(1, 10, 100);
    expect(directional.eirpW).toBeCloseTo(10, 9);
    expect(directional.densityWPerM2 / isotropic.densityWPerM2).toBeCloseTo(10, 9);
    // Feldstärke wächst nur mit √10
    expect(directional.fieldVPerM / isotropic.fieldVPerM).toBeCloseTo(Math.sqrt(10), 9);
  });

  it('liefert eine streng fallende Kurve über den Reglerbereich', () => {
    const curve = densityCurve(
      1,
      0,
      SPREADING_LIMITS.distanceM.min,
      SPREADING_LIMITS.distanceM.max,
      40
    );
    expect(curve).toHaveLength(40);
    expect(curve[0].distanceM).toBeCloseTo(SPREADING_LIMITS.distanceM.min, 9);
    expect(curve[curve.length - 1].distanceM).toBeCloseTo(SPREADING_LIMITS.distanceM.max, 6);
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].densityWPerM2).toBeLessThan(curve[i - 1].densityWPerM2);
    }
    expect(densityCurve(1, 0, 10, 1, 5)).toEqual([]);
  });
});
