/**
 * Referenztests für ITU-R P.676-13 Annex 1 (line-by-line) in src/lib/utils/itu676.ts
 * Referenzwerte: P.676-13 Fig. 1 / Annex 1 bzw. ITU-Rpy (1013,25 hPa, 288,15 K, 7,5 g/m³)
 */

import { describe, it, expect } from 'vitest';
import {
  specificGasAttenuation,
  oxygenSpecificAttenuation,
  waterVaporSpecificAttenuation,
  waterVaporPartialPressure,
  equivalentHeights,
  slantPathGasAttenuation
} from '$lib/utils/itu676';
import { O2_LINES, H2O_LINES } from '$lib/data/itu676Lines';

const P = 1013.25;
const T = 288.15;
const RHO = 7.5;

describe('Linienkatalog P.676-13', () => {
  it('enthält 44 O₂- und 35 H₂O-Linien (Tabellen 1 und 2)', () => {
    expect(O2_LINES).toHaveLength(44);
    expect(H2O_LINES).toHaveLength(35);
  });

  it('Linienfrequenzen sind aufsteigend und im Bereich der Recommendation', () => {
    for (let i = 1; i < O2_LINES.length; i++) expect(O2_LINES[i].f0).toBeGreaterThan(O2_LINES[i - 1].f0);
    for (let i = 1; i < H2O_LINES.length; i++) expect(H2O_LINES[i].f0).toBeGreaterThan(H2O_LINES[i - 1].f0);
    expect(O2_LINES[0].f0).toBeCloseTo(50.474214, 6);
    expect(H2O_LINES[0].f0).toBeCloseTo(22.23508, 5);
    expect(H2O_LINES[3].f0).toBeCloseTo(183.310087, 6);
  });
});

describe('waterVaporPartialPressure', () => {
  it('e = ρ·T/216,7 → 9,97 hPa bei 7,5 g/m³ und 288,15 K', () => {
    expect(waterVaporPartialPressure(RHO, T)).toBeCloseTo(9.973, 2);
  });
  it('0 für ρ ≤ 0', () => {
    expect(waterVaporPartialPressure(0, T)).toBe(0);
    expect(waterVaporPartialPressure(-1, T)).toBe(0);
  });
});

describe('specificGasAttenuation gegen P.676-13-Referenzen (Meereshöhe, 15 °C, 7,5 g/m³)', () => {
  // [f GHz, Referenz dB/km, relative Toleranz]
  const cases: [number, number, number][] = [
    [1, 0.0055, 0.25],
    [10, 0.014, 0.25],
    [22.235, 0.19, 0.2],
    [35, 0.1, 0.3],
    [50, 0.35, 0.3],
    [60, 15, 0.2],
    [70, 0.55, 0.4],
    [94, 0.4, 0.3],
    [118.75, 2.0, 0.3],
    [140, 1.0, 0.3],
    [183.31, 28, 0.2],
    [220, 2.5, 0.3]
  ];
  it.each(cases)('f = %s GHz → ≈ %s dB/km', (f, ref, tol) => {
    const r = specificGasAttenuation(f, P, T, RHO);
    expect(r.total).toBeGreaterThan(ref * (1 - tol));
    expect(r.total).toBeLessThan(ref * (1 + tol));
    expect(r.total).toBeCloseTo(r.oxygen + r.waterVapor, 12);
  });

  it('exakte Modellwerte (Regression gegen ITU-Rpy-identische Implementierung)', () => {
    expect(specificGasAttenuation(10, P, T, RHO).total).toBeCloseTo(0.014, 3);
    expect(specificGasAttenuation(60, P, T, RHO).oxygen).toBeCloseTo(14.50, 1);
    expect(specificGasAttenuation(94, P, T, RHO).total).toBeCloseTo(0.404, 2);
    expect(specificGasAttenuation(183.31, P, T, RHO).waterVapor).toBeCloseTo(28.25, 1);
  });

  it('Wasserdampfanteil skaliert näherungsweise linear mit ρ', () => {
    const low = specificGasAttenuation(22.235, P, T, RHO).waterVapor;
    const high = specificGasAttenuation(22.235, P, T, 2 * RHO).waterVapor;
    expect(high / low).toBeGreaterThan(1.9);
    expect(high / low).toBeLessThan(2.1);
  });

  it('ohne Wasserdampf ist γ_w = 0 und γ_o bleibt endlich', () => {
    const r = specificGasAttenuation(60, P, T, 0);
    expect(r.waterVapor).toBe(0);
    expect(r.oxygen).toBeGreaterThan(10);
    expect(Number.isFinite(r.oxygen)).toBe(true);
  });

  it('liefert 0 bei ungültigen Eingaben', () => {
    expect(oxygenSpecificAttenuation(0, P, T)).toBe(0);
    expect(oxygenSpecificAttenuation(60, 0, T)).toBe(0);
    expect(oxygenSpecificAttenuation(60, P, 0)).toBe(0);
    expect(waterVaporSpecificAttenuation(22, P, T, 0)).toBe(0);
    expect(waterVaporSpecificAttenuation(NaN, P, T, RHO)).toBe(0);
  });

  it('Sauerstoffdämpfung steigt mit dem Druck', () => {
    expect(oxygenSpecificAttenuation(60, 1100, T)).toBeGreaterThan(oxygenSpecificAttenuation(60, 900, T));
  });
});

describe('equivalentHeights / slantPathGasAttenuation (Annex 2)', () => {
  it('h_o ≈ 5 km, h_w ≈ 2 km im Ku-Band (P.676 Annex 2: h_o ≈ 6 km, h_w ≈ 2 km)', () => {
    const { h0Km, hwKm } = equivalentHeights(12, P, T, RHO);
    expect(h0Km).toBeGreaterThan(4);
    expect(h0Km).toBeLessThan(7);
    expect(hwKm).toBeGreaterThan(1.5);
    expect(hwKm).toBeLessThan(2.5);
  });

  it('h_w steigt an der 22-GHz-Linie', () => {
    expect(equivalentHeights(22.235, P, T, RHO).hwKm).toBeGreaterThan(equivalentHeights(12, P, T, RHO).hwKm);
  });

  it('A = (h_o·γ_o + h_w·γ_w)/sin θ – 12 GHz, 30°: ≈ 0,12 dB', () => {
    const gamma = specificGasAttenuation(12, P, T, RHO);
    const h = equivalentHeights(12, P, T, RHO);
    const expected = (h.h0Km * gamma.oxygen + h.hwKm * gamma.waterVapor) / Math.sin(Math.PI / 6);
    const r = slantPathGasAttenuation(12, 30, P, T, RHO);
    expect(r.total).toBeCloseTo(expected, 6);
    expect(r.total).toBeGreaterThan(0.08);
    expect(r.total).toBeLessThan(0.2);
  });

  it('Zenit-Dämpfung bei 20 GHz ≈ 0,25–0,3 dB (P.676 Fig. 4)', () => {
    const r = slantPathGasAttenuation(20, 90, P, T, RHO);
    expect(r.total).toBeGreaterThan(0.2);
    expect(r.total).toBeLessThan(0.35);
  });

  it('halbiert sich nicht mit der Distanz, sondern skaliert mit 1/sin θ', () => {
    const a30 = slantPathGasAttenuation(12, 30, P, T, RHO).total;
    const a90 = slantPathGasAttenuation(12, 90, P, T, RHO).total;
    expect(a30 / a90).toBeCloseTo(2, 6);
  });

  it('0 bei ungültigem Elevationswinkel', () => {
    expect(slantPathGasAttenuation(12, 0, P, T, RHO).total).toBe(0);
    expect(slantPathGasAttenuation(12, 95, P, T, RHO).total).toBe(0);
  });
});
