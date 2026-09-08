/**
 * Tests für die Widget-Logik Radar-Impuls (W1), Doppler (W2) und RCS-Vergleich (W12)
 */
import { describe, it, expect } from 'vitest';
import {
  computeRadarPulse,
  pulsePositionAt,
  timelineFraction,
  RADAR_PULSE_LIMITS
} from '$lib/components/widgets/RadarPulseModel';
import {
  computeDoppler,
  visualWavelengthFactor,
  msToKmh,
  DOPPLER_CARRIERS,
  DEFAULT_DOPPLER_CARRIER_ID
} from '$lib/components/widgets/DopplerModel';
import {
  RCS_OBJECTS,
  rcsScaleFraction,
  relativeRadarRange,
  rcsToDbsm,
  findRcsObject,
  formatPowerOfTen,
  RCS_SCALE_MIN_M2,
  RCS_SCALE_MAX_M2
} from '$lib/components/widgets/RcsComparisonModel';
import { RCS_REFERENCE } from '$lib/data/constants';

const C = 299792458;

describe('computeRadarPulse (W1)', () => {
  it('τ = 1 µs → ΔR ≈ 150 m', () => {
    const result = computeRadarPulse(30_000, 1e-6, 1000, C);
    expect(result.rangeResolutionM).toBeCloseTo(149.9, 0);
    expect(result.blindRangeM).toBe(result.rangeResolutionM);
  });

  it('PRF = 1 kHz → R_u ≈ 150 km, PRI = 1 ms', () => {
    const result = computeRadarPulse(30_000, 1e-6, 1000, C);
    expect(result.unambiguousRangeM / 1000).toBeCloseTo(149.9, 0);
    expect(result.priS).toBeCloseTo(1e-3, 9);
  });

  it('R = 30 km → Laufzeit ≈ 200 µs', () => {
    const result = computeRadarPulse(30_000, 1e-6, 1000, C);
    expect(result.roundTripS * 1e6).toBeCloseTo(200.1, 0);
  });

  it('markiert Mehrdeutigkeit, wenn R > R_u', () => {
    expect(computeRadarPulse(200_000, 1e-6, 1000, C).ambiguous).toBe(true);
    expect(computeRadarPulse(100_000, 1e-6, 1000, C).ambiguous).toBe(false);
  });

  it('markiert den Blindbereich, wenn R < c·τ/2', () => {
    expect(computeRadarPulse(100, 10e-6, 1000, C).blind).toBe(true);
    expect(computeRadarPulse(RADAR_PULSE_LIMITS.rangeM.default, 1e-6, 1000, C).blind).toBe(false);
  });

  it('Tastverhältnis τ·PRF', () => {
    expect(computeRadarPulse(30_000, 1e-6, 1000, C).dutyCycle).toBeCloseTo(1e-3, 9);
  });
});

describe('pulsePositionAt', () => {
  const rangeM = 30_000;
  const oneWay = rangeM / C;

  it('Hinweg: Position wächst von 0 auf 1', () => {
    expect(pulsePositionAt(0, rangeM, C)).toEqual({ phase: 'hin', fraction: 0 });
    expect(pulsePositionAt(oneWay / 2, rangeM, C).fraction).toBeCloseTo(0.5, 6);
    expect(pulsePositionAt(oneWay, rangeM, C).fraction).toBeCloseTo(1, 6);
  });

  it('Rückweg: Position fällt von 1 auf 0', () => {
    const back = pulsePositionAt(1.5 * oneWay, rangeM, C);
    expect(back.phase).toBe('zurueck');
    expect(back.fraction).toBeCloseTo(0.5, 6);
  });

  it('nach 2R/c ist Pause', () => {
    expect(pulsePositionAt(3 * oneWay, rangeM, C).phase).toBe('pause');
  });

  it('timelineFraction deckt zwei PRI ab und ist begrenzt', () => {
    expect(timelineFraction(1e-3, 1e-3)).toBeCloseTo(0.5, 6);
    expect(timelineFraction(5e-3, 1e-3)).toBe(1);
    expect(timelineFraction(1, 0)).toBe(0);
  });
});

describe('computeDoppler (W2)', () => {
  it('v = 100 m/s bei 10 GHz → f_d ≈ 6,67 kHz', () => {
    const result = computeDoppler(100, 10e9, C);
    expect(result.dopplerHz / 1000).toBeCloseTo(6.67, 2);
    expect(result.direction).toBe('naehert');
  });

  it('negative Geschwindigkeit → negative Verschiebung, Ziel entfernt sich', () => {
    const result = computeDoppler(-50, 24.125e9, C);
    expect(result.dopplerHz).toBeLessThan(0);
    expect(result.direction).toBe('entfernt');
  });

  it('v = 0 → keine Verschiebung', () => {
    const result = computeDoppler(0, 77e9, C);
    expect(result.dopplerHz).toBe(0);
    expect(result.direction).toBe('ruht');
    expect(result.receivedHz).toBe(77e9);
  });

  it('Wellenlänge bei 10 GHz ≈ 3 cm', () => {
    expect(computeDoppler(10, 10e9, C).wavelengthM).toBeCloseTo(0.02998, 4);
  });

  it('visualWavelengthFactor: 1 bei Stillstand, < 1 bei Annäherung, > 1 beim Entfernen', () => {
    expect(visualWavelengthFactor(0)).toBe(1);
    expect(visualWavelengthFactor(300)).toBeLessThan(1);
    expect(visualWavelengthFactor(-300)).toBeGreaterThan(1);
    expect(visualWavelengthFactor(1000, 300, 0.5)).toBeCloseTo(0.5, 6);
  });

  it('Standardträger existiert in der Auswahl', () => {
    expect(DOPPLER_CARRIERS.some((carrier) => carrier.id === DEFAULT_DOPPLER_CARRIER_ID)).toBe(
      true
    );
  });

  it('msToKmh', () => {
    expect(msToKmh(10)).toBeCloseTo(36, 6);
  });
});

describe('RCS-Vergleich (W12)', () => {
  it('enthält alle Referenzobjekte aufsteigend sortiert', () => {
    expect(RCS_OBJECTS).toHaveLength(RCS_REFERENCE.length);
    for (let i = 1; i < RCS_OBJECTS.length; i++) {
      expect(RCS_OBJECTS[i].rcsM2).toBeGreaterThanOrEqual(RCS_OBJECTS[i - 1].rcsM2);
    }
  });

  it('rcsScaleFraction liegt zwischen 0 und 1 und ist logarithmisch', () => {
    expect(rcsScaleFraction(RCS_SCALE_MIN_M2)).toBe(0);
    expect(rcsScaleFraction(RCS_SCALE_MAX_M2)).toBe(1);
    const geometricMiddle = Math.sqrt(RCS_SCALE_MIN_M2 * RCS_SCALE_MAX_M2);
    expect(rcsScaleFraction(geometricMiddle)).toBeCloseTo(0.5, 6);
  });

  it('relativeRadarRange: 16-facher RCS → doppelte Reichweite', () => {
    expect(relativeRadarRange(16, 1)).toBeCloseTo(2, 6);
    expect(relativeRadarRange(1, 16)).toBeCloseTo(0.5, 6);
    expect(relativeRadarRange(0, 1)).toBe(0);
  });

  it('rcsToDbsm: 1 m² = 0 dBsm, 100 m² = 20 dBsm', () => {
    expect(rcsToDbsm(1)).toBe(0);
    expect(rcsToDbsm(100)).toBeCloseTo(20, 6);
  });

  it('formatPowerOfTen: 1e-5 → 10⁻⁵, 100 → 10², 5e3 → 5·10³', () => {
    expect(formatPowerOfTen(1e-5)).toBe('10⁻⁵');
    expect(formatPowerOfTen(100)).toBe('10²');
    expect(formatPowerOfTen(5e3)).toBe('5·10³');
    expect(formatPowerOfTen(0)).toBe('—');
  });

  it('findRcsObject findet Mensch (1 m²)', () => {
    expect(findRcsObject('human')?.rcsM2).toBe(1);
    expect(findRcsObject('nix')).toBeUndefined();
  });
});
