/**
 * Rechenmodell der Zweiwege-Ausbreitung (Widget `TwoRayWidget`) im Kapitel
 * „Wellenausbreitung".
 *
 * Referenz: Rappaport, Wireless Communications, Abschnitt 4.6.
 * Kontrollfall h_t = 30 m, h_r = 3 m, f = 900 MHz: λ = 0,3331 m,
 * Bruchdistanz d_b ≈ 1081 m, Zweiwege-Dämpfung bei 1 km ≈ 80,9 dB.
 */
import { describe, it, expect } from 'vitest';
import {
  GRAZING_REFLECTION_COEFFICIENT,
  MIN_FIELD_FACTOR,
  TWO_RAY_LIMITS,
  breakpointDistanceM,
  fieldFactor,
  pathLengths,
  phaseDifferenceRad,
  relativeLevelDb,
  twoRayAt,
  twoRayCurve,
  twoRayPathLossDb
} from '$lib/components/widgets/TwoRayModel';
import { frequencyToWavelength } from '$lib/utils/calculations';

const F_900 = 900e6;
const LAMBDA_900 = frequencyToWavelength(F_900);

describe('TwoRayModel: direkter und reflektierter Weg', () => {
  it('rechnet die Weglängen über die Spiegelquelle', () => {
    const paths = pathLengths(1000, 30, 3);
    expect(paths.directM).toBeCloseTo(Math.sqrt(1000 ** 2 + 27 ** 2), 9);
    expect(paths.reflectedM).toBeCloseTo(Math.sqrt(1000 ** 2 + 33 ** 2), 9);
    // Näherung Δ ≈ 2·h_t·h_r/d = 0,18 m
    expect(paths.deltaM).toBeCloseTo(0.18, 3);
    expect(paths.reflectedM).toBeGreaterThan(paths.directM);
  });

  it('bildet den Laufwegunterschied auf die Phase ab', () => {
    expect(phaseDifferenceRad(LAMBDA_900, LAMBDA_900)).toBeCloseTo(2 * Math.PI, 9);
    expect(phaseDifferenceRad(LAMBDA_900 / 2, LAMBDA_900)).toBeCloseTo(Math.PI, 9);
    expect(phaseDifferenceRad(0, LAMBDA_900)).toBe(0);
  });

  it('summiert beide Wellen zu 0 … 2 (bis +6 dB, bis −60 dB)', () => {
    expect(GRAZING_REFLECTION_COEFFICIENT).toBe(-1);
    // Δφ = 0: die 180°-Drehung der Reflexion löscht die direkte Welle aus
    expect(fieldFactor(0)).toBeCloseTo(0, 9);
    // Δφ = π: beide addieren sich zur doppelten Amplitude
    expect(fieldFactor(Math.PI)).toBeCloseTo(2, 9);
    expect(relativeLevelDb(2)).toBeCloseTo(6.0206, 4);
    expect(relativeLevelDb(0)).toBeCloseTo(20 * Math.log10(MIN_FIELD_FACTOR), 9);
    // Ohne Bodenreflexion bleibt der Freiraumwert stehen
    expect(fieldFactor(1.234, 0)).toBeCloseTo(1, 9);
  });

  it('setzt die Bruchdistanz auf 4·h_t·h_r/λ (1081 m im Kontrollfall)', () => {
    const breakpoint = breakpointDistanceM(30, 3, LAMBDA_900);
    expect(breakpoint).toBeCloseTo((4 * 30 * 3) / LAMBDA_900, 6);
    expect(breakpoint).toBeCloseTo(1080.7, 1);
  });

  it('liefert bei 1 km die Rappaport-Zweiwegedämpfung von 80,9 dB', () => {
    expect(twoRayPathLossDb(1000, 30, 3)).toBeCloseTo(120 - 20 * Math.log10(90), 9);
    expect(twoRayPathLossDb(1000, 30, 3)).toBeCloseTo(80.915, 3);
    // 40 dB je Abstandsdekade
    expect(twoRayPathLossDb(10_000, 30, 3) - twoRayPathLossDb(1000, 30, 3)).toBeCloseTo(40, 9);
    expect(twoRayPathLossDb(0, 30, 3)).toBe(0);
  });

  it('geht jenseits der Bruchdistanz in die d⁴-Näherung über', () => {
    const point = twoRayAt(15_000, F_900, 30, 3);
    expect(point.totalLossDb).toBeCloseTo(twoRayPathLossDb(15_000, 30, 3), 1);
    expect(point.relativeDb).toBeLessThan(0);
    expect(point.fsplDb).toBeLessThan(point.totalLossDb);
  });

  it('erzeugt vor der Bruchdistanz Gipfel und Einbrüche', () => {
    const curve = twoRayCurve(F_900, 30, 3, TWO_RAY_LIMITS.distanceM.min, 1000, 600);
    const levels = curve.map((point) => point.relativeDb);
    expect(Math.max(...levels)).toBeGreaterThan(5);
    expect(Math.min(...levels)).toBeLessThan(-15);
    expect(twoRayCurve(F_900, 30, 3, 100, 10, 5)).toEqual([]);
  });
});
