/**
 * Unit tests for src/lib/utils/atmosphericAttenuation.ts
 * Testing atmospheric gas and precipitation attenuation calculations
 */

import { describe, it, expect } from 'vitest';
import {
  calculateOxygenAttenuation,
  calculateWaterVaporAttenuation,
  calculateRainCoefficients,
  calculateRainAttenuation,
  calculateFogCoefficient,
  calculateFogAttenuation,
  calculateSnowAttenuation,
  calculateAtmosphericAttenuation,
  calculateAllAttenuation,
  calculatePathAttenuation,
  generateAttenuationCurve,
  ABSORPTION_PEAKS,
  RAIN_INTENSITY_CLASSES,
  FOG_VISIBILITY_CLASSES
} from '$lib/utils/atmosphericAttenuation';

// Standard atmospheric conditions
const STANDARD_PRESSURE_HPA = 1013.25;
const STANDARD_TEMPERATURE_K = 288; // 15 degrees C
const STANDARD_WATER_VAPOR = 7.5; // g/m³

describe('calculateOxygenAttenuation', () => {
  it('should return positive attenuation at standard conditions', () => {
    const result = calculateOxygenAttenuation(60, STANDARD_PRESSURE_HPA, STANDARD_TEMPERATURE_K);
    expect(result).toBeGreaterThan(0);
  });

  it('should show peak attenuation around 60 GHz (O2 complex)', () => {
    const attenuation50GHz = calculateOxygenAttenuation(
      50,
      STANDARD_PRESSURE_HPA,
      STANDARD_TEMPERATURE_K
    );
    const attenuation60GHz = calculateOxygenAttenuation(
      60,
      STANDARD_PRESSURE_HPA,
      STANDARD_TEMPERATURE_K
    );
    const attenuation70GHz = calculateOxygenAttenuation(
      70,
      STANDARD_PRESSURE_HPA,
      STANDARD_TEMPERATURE_K
    );

    // 60 GHz should have highest attenuation in this range
    expect(attenuation60GHz).toBeGreaterThan(attenuation50GHz);
    expect(attenuation60GHz).toBeGreaterThan(attenuation70GHz);
  });

  it('should show secondary peak around 118.75 GHz', () => {
    const attenuation100GHz = calculateOxygenAttenuation(
      100,
      STANDARD_PRESSURE_HPA,
      STANDARD_TEMPERATURE_K
    );
    const attenuation119GHz = calculateOxygenAttenuation(
      118.75,
      STANDARD_PRESSURE_HPA,
      STANDARD_TEMPERATURE_K
    );
    const attenuation140GHz = calculateOxygenAttenuation(
      140,
      STANDARD_PRESSURE_HPA,
      STANDARD_TEMPERATURE_K
    );

    // 118.75 GHz should be a local peak — beidseitig fällt die Dämpfung ab
    expect(attenuation119GHz).toBeGreaterThan(attenuation100GHz);
    expect(attenuation119GHz).toBeGreaterThan(attenuation140GHz);
  });

  it('should have attenuation around 15 dB/km at 60 GHz peak', () => {
    const result = calculateOxygenAttenuation(60, STANDARD_PRESSURE_HPA, STANDARD_TEMPERATURE_K);
    // ITU-R P.676 reference: ~15 dB/km at 60 GHz
    expect(result).toBeGreaterThan(10);
    expect(result).toBeLessThan(20);
  });

  it('should increase with pressure', () => {
    const lowPressure = calculateOxygenAttenuation(60, 900, STANDARD_TEMPERATURE_K);
    const highPressure = calculateOxygenAttenuation(60, 1100, STANDARD_TEMPERATURE_K);
    expect(highPressure).toBeGreaterThan(lowPressure);
  });

  it('should return non-negative values', () => {
    const result = calculateOxygenAttenuation(1, STANDARD_PRESSURE_HPA, STANDARD_TEMPERATURE_K);
    expect(result).toBeGreaterThanOrEqual(0);
  });

  it('should handle edge case at minimum frequency (1 GHz)', () => {
    const result = calculateOxygenAttenuation(1, STANDARD_PRESSURE_HPA, STANDARD_TEMPERATURE_K);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(1); // Should be very low at 1 GHz
  });
});

describe('calculateWaterVaporAttenuation', () => {
  it('should return 0 for zero water vapor density', () => {
    const result = calculateWaterVaporAttenuation(
      22.235,
      STANDARD_PRESSURE_HPA,
      0,
      STANDARD_TEMPERATURE_K
    );
    expect(result).toBe(0);
  });

  it('should return positive attenuation with water vapor present', () => {
    const result = calculateWaterVaporAttenuation(
      22.235,
      STANDARD_PRESSURE_HPA,
      STANDARD_WATER_VAPOR,
      STANDARD_TEMPERATURE_K
    );
    expect(result).toBeGreaterThan(0);
  });

  it('should show peak at 22.235 GHz water vapor line', () => {
    const attenuation20GHz = calculateWaterVaporAttenuation(
      20,
      STANDARD_PRESSURE_HPA,
      STANDARD_WATER_VAPOR,
      STANDARD_TEMPERATURE_K
    );
    const attenuation22GHz = calculateWaterVaporAttenuation(
      22.235,
      STANDARD_PRESSURE_HPA,
      STANDARD_WATER_VAPOR,
      STANDARD_TEMPERATURE_K
    );
    const attenuation25GHz = calculateWaterVaporAttenuation(
      25,
      STANDARD_PRESSURE_HPA,
      STANDARD_WATER_VAPOR,
      STANDARD_TEMPERATURE_K
    );

    // 22.235 GHz should be a local peak
    expect(attenuation22GHz).toBeGreaterThan(attenuation20GHz);
    expect(attenuation22GHz).toBeGreaterThan(attenuation25GHz);
  });

  it('should show strong peak at 183.31 GHz', () => {
    const attenuation183GHz = calculateWaterVaporAttenuation(
      183.31,
      STANDARD_PRESSURE_HPA,
      STANDARD_WATER_VAPOR,
      STANDARD_TEMPERATURE_K
    );
    // This is the strongest water vapor line in the 1-350 GHz range
    expect(attenuation183GHz).toBeGreaterThan(10);
  });

  it('should scale with water vapor density', () => {
    const lowDensity = calculateWaterVaporAttenuation(
      22.235,
      STANDARD_PRESSURE_HPA,
      3.75,
      STANDARD_TEMPERATURE_K
    );
    const highDensity = calculateWaterVaporAttenuation(
      22.235,
      STANDARD_PRESSURE_HPA,
      15,
      STANDARD_TEMPERATURE_K
    );
    expect(highDensity).toBeGreaterThan(lowDensity);
  });

  it('should return non-negative values', () => {
    const result = calculateWaterVaporAttenuation(
      1,
      STANDARD_PRESSURE_HPA,
      STANDARD_WATER_VAPOR,
      STANDARD_TEMPERATURE_K
    );
    expect(result).toBeGreaterThanOrEqual(0);
  });
});

describe('calculateRainCoefficients', () => {
  it('should return valid coefficients for horizontal polarization', () => {
    const { k, alpha } = calculateRainCoefficients(10, 'horizontal');
    expect(k).toBeGreaterThan(0);
    expect(alpha).toBeGreaterThan(0);
    expect(alpha).toBeLessThan(2);
  });

  it('should return valid coefficients for vertical polarization', () => {
    const { k, alpha } = calculateRainCoefficients(10, 'vertical');
    expect(k).toBeGreaterThan(0);
    expect(alpha).toBeGreaterThan(0);
  });

  it('should return valid coefficients for circular polarization', () => {
    const { k, alpha } = calculateRainCoefficients(10, 'circular');
    expect(k).toBeGreaterThan(0);
    expect(alpha).toBeGreaterThan(0);
  });

  it('should increase k with frequency', () => {
    const { k: k5 } = calculateRainCoefficients(5, 'horizontal');
    const { k: k20 } = calculateRainCoefficients(20, 'horizontal');
    const { k: k50 } = calculateRainCoefficients(50, 'horizontal');
    expect(k20).toBeGreaterThan(k5);
    expect(k50).toBeGreaterThan(k20);
  });

  it('should handle elevation angle (P.838-3 Gl. 4: H/V hängen von θ ab, zirkular nicht)', () => {
    const horizontal0 = calculateRainCoefficients(10, 'horizontal', 0);
    const horizontal45 = calculateRainCoefficients(10, 'horizontal', 45);
    const vertical0 = calculateRainCoefficients(10, 'vertical', 0);
    // Bei 45° liegt k_H zwischen dem H-Wert (θ = 0) und dem H/V-Mittel (θ = 90°)
    expect(horizontal45.k).toBeLessThan(horizontal0.k);
    expect(horizontal45.k).toBeGreaterThan((horizontal0.k + vertical0.k) / 2);
    const circular0 = calculateRainCoefficients(10, 'circular', 0);
    const circular45 = calculateRainCoefficients(10, 'circular', 45);
    expect(circular0.k).toBeCloseTo(circular45.k, 10);
  });
});

describe('calculateRainAttenuation', () => {
  it('should return 0 for zero rain rate', () => {
    const result = calculateRainAttenuation(10, 0, 'horizontal');
    expect(result).toBe(0);
  });

  it('should return 0 for frequency below 1 GHz', () => {
    const result = calculateRainAttenuation(0.5, 10, 'horizontal');
    expect(result).toBe(0);
  });

  it('should return positive attenuation for rain', () => {
    const result = calculateRainAttenuation(10, 10, 'horizontal');
    expect(result).toBeGreaterThan(0);
  });

  it('should increase with rain rate', () => {
    const light = calculateRainAttenuation(10, 5, 'horizontal');
    const heavy = calculateRainAttenuation(10, 50, 'horizontal');
    expect(heavy).toBeGreaterThan(light);
  });

  it('should increase with frequency', () => {
    const low = calculateRainAttenuation(5, 10, 'horizontal');
    const high = calculateRainAttenuation(30, 10, 'horizontal');
    expect(high).toBeGreaterThan(low);
  });

  it('should give reasonable values for typical conditions', () => {
    // At 10 GHz and 25 mm/h rain, ITU-R P.838 gives around 0.5-1.5 dB/km
    const result = calculateRainAttenuation(10, 25, 'horizontal');
    expect(result).toBeGreaterThan(0.3);
    expect(result).toBeLessThan(5);
  });
});

describe('calculateFogCoefficient', () => {
  it('should return positive coefficient', () => {
    const result = calculateFogCoefficient(10, STANDARD_TEMPERATURE_K);
    expect(result).toBeGreaterThan(0);
  });

  it('should increase with frequency', () => {
    const low = calculateFogCoefficient(10, STANDARD_TEMPERATURE_K);
    const high = calculateFogCoefficient(100, STANDARD_TEMPERATURE_K);
    expect(high).toBeGreaterThan(low);
  });
});

describe('calculateFogAttenuation', () => {
  it('should return 0 for zero liquid water density', () => {
    const result = calculateFogAttenuation(10, 0, STANDARD_TEMPERATURE_K);
    expect(result).toBe(0);
  });

  it('should return 0 for frequency below 1 GHz', () => {
    const result = calculateFogAttenuation(0.5, 0.5, STANDARD_TEMPERATURE_K);
    expect(result).toBe(0);
  });

  it('should return positive attenuation for fog', () => {
    const result = calculateFogAttenuation(10, 0.5, STANDARD_TEMPERATURE_K);
    expect(result).toBeGreaterThan(0);
  });

  it('should increase with liquid water density', () => {
    const light = calculateFogAttenuation(10, 0.05, STANDARD_TEMPERATURE_K);
    const dense = calculateFogAttenuation(10, 0.5, STANDARD_TEMPERATURE_K);
    expect(dense).toBeGreaterThan(light);
  });
});

describe('calculateSnowAttenuation', () => {
  it('should return 0 for zero snow rate', () => {
    const result = calculateSnowAttenuation(10, 0, false);
    expect(result).toBe(0);
  });

  it('should return 0 for frequency below 1 GHz', () => {
    const result = calculateSnowAttenuation(0.5, 10, false);
    expect(result).toBe(0);
  });

  it('should return positive attenuation for snow', () => {
    const result = calculateSnowAttenuation(10, 10, false);
    expect(result).toBeGreaterThan(0);
  });

  it('should give higher attenuation for wet snow', () => {
    const dry = calculateSnowAttenuation(10, 10, false);
    const wet = calculateSnowAttenuation(10, 10, true);
    expect(wet).toBeGreaterThan(dry);
  });
});

describe('calculateAtmosphericAttenuation', () => {
  it('should return combined oxygen and water vapor attenuation', () => {
    const conditions = {
      temperatureK: STANDARD_TEMPERATURE_K,
      pressureHpa: STANDARD_PRESSURE_HPA,
      waterVaporDensity: STANDARD_WATER_VAPOR
    };
    const result = calculateAtmosphericAttenuation(60, conditions);

    expect(result.oxygen).toBeGreaterThan(0);
    expect(result.waterVapor).toBeGreaterThan(0);
    expect(result.total).toBe(result.oxygen + result.waterVapor);
  });
});

describe('calculateAllAttenuation', () => {
  it('should return all attenuation components', () => {
    const conditions = {
      temperatureK: STANDARD_TEMPERATURE_K,
      pressureHpa: STANDARD_PRESSURE_HPA,
      waterVaporDensity: STANDARD_WATER_VAPOR,
      rainRateMmH: 10,
      fogDensityGM3: 0.1,
      snowRateMmH: 5,
      polarization: 'horizontal' as const,
      elevationAngleDeg: 0
    };
    const result = calculateAllAttenuation(10, conditions);

    expect(result.oxygen).toBeGreaterThanOrEqual(0);
    expect(result.waterVapor).toBeGreaterThanOrEqual(0);
    expect(result.rain).toBeGreaterThan(0);
    expect(result.fog).toBeGreaterThan(0);
    expect(result.snow).toBeGreaterThan(0);
    expect(result.total).toBe(result.oxygen + result.waterVapor);
    expect(result.totalAll).toBe(result.total + result.rain + result.fog + result.snow);
  });
});

describe('calculatePathAttenuation', () => {
  it('should scale attenuation by distance', () => {
    const conditions = {
      temperatureK: STANDARD_TEMPERATURE_K,
      pressureHpa: STANDARD_PRESSURE_HPA,
      waterVaporDensity: STANDARD_WATER_VAPOR
    };
    const result = calculatePathAttenuation(60, conditions, 10); // 10 km

    expect(result.totalDb).toBe(result.totalPerKm * 10);
    expect(result.oxygenTotal).toBe(result.oxygenPerKm * 10);
    expect(result.waterVaporTotal).toBe(result.waterVaporPerKm * 10);
  });
});

describe('generateAttenuationCurve', () => {
  it('should generate correct number of data points', () => {
    const conditions = {
      temperatureK: STANDARD_TEMPERATURE_K,
      pressureHpa: STANDARD_PRESSURE_HPA,
      waterVaporDensity: STANDARD_WATER_VAPOR
    };
    const numPoints = 100;
    const result = generateAttenuationCurve(conditions, 1, 350, numPoints);

    expect(result.length).toBe(numPoints + 1);
  });

  it('should have correct frequency range', () => {
    const conditions = {
      temperatureK: STANDARD_TEMPERATURE_K,
      pressureHpa: STANDARD_PRESSURE_HPA,
      waterVaporDensity: STANDARD_WATER_VAPOR
    };
    const result = generateAttenuationCurve(conditions, 1, 350, 100);

    expect(result[0].frequencyGHz).toBeCloseTo(1, 5);
    expect(result[result.length - 1].frequencyGHz).toBeCloseTo(350, 0);
  });

  it('should have valid attenuation values', () => {
    const conditions = {
      temperatureK: STANDARD_TEMPERATURE_K,
      pressureHpa: STANDARD_PRESSURE_HPA,
      waterVaporDensity: STANDARD_WATER_VAPOR
    };
    const result = generateAttenuationCurve(conditions, 1, 350, 100);

    result.forEach((point) => {
      expect(point.oxygen).toBeGreaterThanOrEqual(0);
      expect(point.waterVapor).toBeGreaterThanOrEqual(0);
      expect(point.total).toBe(point.oxygen + point.waterVapor);
    });
  });
});

describe('Reference data constants', () => {
  it('should have absorption peaks defined', () => {
    expect(ABSORPTION_PEAKS.waterVapor).toBeDefined();
    expect(ABSORPTION_PEAKS.oxygen).toBeDefined();
    expect(ABSORPTION_PEAKS.windows).toBeDefined();

    // Check 22 GHz water vapor peak
    const h2o22 = ABSORPTION_PEAKS.waterVapor.find((p) => p.frequency === 22.235);
    expect(h2o22).toBeDefined();

    // Check 60 GHz oxygen peak
    const o260 = ABSORPTION_PEAKS.oxygen.find((p) => p.frequency === 60);
    expect(o260).toBeDefined();
  });

  it('should have rain intensity classes defined', () => {
    expect(RAIN_INTENSITY_CLASSES.drizzle).toBeDefined();
    expect(RAIN_INTENSITY_CLASSES.light).toBeDefined();
    expect(RAIN_INTENSITY_CLASSES.moderate).toBeDefined();
    expect(RAIN_INTENSITY_CLASSES.heavy).toBeDefined();
  });

  it('should have fog visibility classes defined', () => {
    expect(FOG_VISIBILITY_CLASSES.veryLight).toBeDefined();
    expect(FOG_VISIBILITY_CLASSES.dense).toBeDefined();
  });
});

describe('Edge cases and robustness', () => {
  it('should handle extreme temperatures', () => {
    // Very cold
    const cold = calculateOxygenAttenuation(60, STANDARD_PRESSURE_HPA, 220);
    expect(cold).toBeGreaterThan(0);
    expect(Number.isFinite(cold)).toBe(true);

    // Very hot
    const hot = calculateOxygenAttenuation(60, STANDARD_PRESSURE_HPA, 320);
    expect(hot).toBeGreaterThan(0);
    expect(Number.isFinite(hot)).toBe(true);
  });

  it('should handle extreme pressures', () => {
    // Low pressure (high altitude)
    const lowP = calculateOxygenAttenuation(60, 500, STANDARD_TEMPERATURE_K);
    expect(lowP).toBeGreaterThan(0);

    // High pressure
    const highP = calculateOxygenAttenuation(60, 1100, STANDARD_TEMPERATURE_K);
    expect(highP).toBeGreaterThan(0);
  });

  it('should handle high frequencies (up to 350 GHz)', () => {
    const result = calculateOxygenAttenuation(350, STANDARD_PRESSURE_HPA, STANDARD_TEMPERATURE_K);
    expect(result).toBeGreaterThan(0);
    expect(Number.isFinite(result)).toBe(true);
  });

  it('should handle extreme rain rates', () => {
    // Light drizzle
    const drizzle = calculateRainAttenuation(10, 0.5, 'horizontal');
    expect(drizzle).toBeGreaterThan(0);

    // Cloudburst
    const cloudburst = calculateRainAttenuation(10, 200, 'horizontal');
    expect(cloudburst).toBeGreaterThan(0);
    expect(Number.isFinite(cloudburst)).toBe(true);
  });
});

// ============================================================================
// Referenzwert-Tests (Bericht 03, Abschnitt 4.3) – ITU-R P.676-13 / P.838-3 / P.840
// ============================================================================

import {
  calculateEarthSpaceAttenuation,
  calculateExtendedPathAttenuation
} from '$lib/utils/atmosphericAttenuation';

const STD = { temperatureK: 288.15, pressureHpa: 1013.25, waterVaporDensity: 7.5 };

describe('Gasdämpfung gegen ITU-R P.676-13 Referenzen (1013.25 hPa, 288.15 K, 7.5 g/m³)', () => {
  const cases: [number, number, number][] = [
    [10, 0.015, 0.25],
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
    const r = calculateAtmosphericAttenuation(f, STD);
    expect(r.total).toBeGreaterThan(ref * (1 - tol));
    expect(r.total).toBeLessThan(ref * (1 + tol));
  });

  it('Wasserdampf: 15 g/m³ ≈ 2 × 7,5 g/m³ (±5 %)', () => {
    const a = calculateWaterVaporAttenuation(22.235, 1013.25, 7.5, 288.15);
    const b = calculateWaterVaporAttenuation(22.235, 1013.25, 15, 288.15);
    expect(b / a).toBeGreaterThan(1.9);
    expect(b / a).toBeLessThan(2.1);
  });

  it('1 GHz liegt bei ≈ 0,005–0,007 dB/km (keine überhöhte 183-GHz-Fernflanke)', () => {
    expect(calculateAtmosphericAttenuation(1, STD).total).toBeLessThan(0.008);
  });
});

describe('Regenkoeffizienten gegen ITU-R P.838-3 Tabelle 5', () => {
  const cases: [number, number, number, number, number][] = [
    // f, kH, αH, kV, αV
    [1, 0.0000259, 0.9691, 0.0000308, 0.8592],
    [10, 0.01217, 1.2571, 0.01129, 1.2156],
    [20, 0.09164, 1.0568, 0.09611, 0.9847],
    [30, 0.2403, 0.9485, 0.2291, 0.9129]
  ];
  it.each(cases)('f = %s GHz', (f, kH, aH, kV, aV) => {
    const h = calculateRainCoefficients(f, 'horizontal');
    const v = calculateRainCoefficients(f, 'vertical');
    expect(h.k / kH).toBeCloseTo(1, 2);
    expect(h.alpha / aH).toBeCloseTo(1, 2);
    expect(v.k / kV).toBeCloseTo(1, 2);
    expect(v.alpha / aV).toBeCloseTo(1, 2);
  });

  it('zirkular = Mittel aus H und V, unabhängig von Elevation (P.838-3 Gl. 4/5, F-02)', () => {
    const h = calculateRainCoefficients(10, 'horizontal');
    const v = calculateRainCoefficients(10, 'vertical');
    const c0 = calculateRainCoefficients(10, 'circular', 0);
    const c45 = calculateRainCoefficients(10, 'circular', 45);
    expect(c0.k).toBeCloseTo((h.k + v.k) / 2, 6);
    expect(c0.k).toBeCloseTo(0.01173, 4);
    expect(c0.alpha).toBeCloseTo((h.k * h.alpha + v.k * v.alpha) / (2 * c0.k), 6);
    expect(c0.alpha).toBeCloseTo(1.2371, 3);
    expect(c45.k).toBeCloseTo(c0.k, 10);
    expect(c45.alpha).toBeCloseTo(c0.alpha, 10);
  });

  it('H-Polarisation bei 90° Elevation = Mittel aus H und V', () => {
    expect(calculateRainCoefficients(10, 'horizontal', 90).k).toBeCloseTo(0.01173, 4);
    expect(calculateRainCoefficients(10, 'vertical', 90).k).toBeCloseTo(0.01173, 4);
  });

  it('Guard: f = 0 / außerhalb 1–1000 GHz liefert {0, 0} statt NaN (F-18)', () => {
    expect(calculateRainCoefficients(0, 'horizontal')).toEqual({ k: 0, alpha: 0 });
    expect(calculateRainCoefficients(0.5, 'vertical')).toEqual({ k: 0, alpha: 0 });
    expect(calculateRainCoefficients(NaN, 'circular')).toEqual({ k: 0, alpha: 0 });
    expect(calculateRainCoefficients(2000, 'horizontal')).toEqual({ k: 0, alpha: 0 });
  });
});

describe('Regendämpfung Referenzwerte (P.838-3, ±1 %)', () => {
  const cases: [number, number, 'horizontal' | 'vertical' | 'circular', number][] = [
    [10, 25, 'horizontal', 0.696],
    [10, 25, 'vertical', 0.565],
    [10, 25, 'circular', 0.627],
    [10, 50, 'horizontal', 1.663],
    [20, 25, 'horizontal', 2.751],
    [30, 25, 'horizontal', 5.089],
    [28, 12.5, 'horizontal', 2.364],
    [12, 12.5, 'horizontal', 0.473]
  ];
  it.each(cases)('%s GHz, %s mm/h, %s → %s dB/km', (f, r, pol, ref) => {
    expect(calculateRainAttenuation(f, r, pol) / ref).toBeCloseTo(1, 2);
  });
  it('0 bei 0,5 GHz oder 0 mm/h', () => {
    expect(calculateRainAttenuation(0.5, 25)).toBe(0);
    expect(calculateRainAttenuation(10, 0)).toBe(0);
  });
});

describe('Nebel Referenzwerte (P.840, ±5 %)', () => {
  it('K_l: 10 GHz/0 °C → 0,093; 30 GHz/20 °C → 0,470; 100 GHz/0 °C → 4,89', () => {
    expect(calculateFogCoefficient(10, 273.15) / 0.093).toBeCloseTo(1, 1);
    expect(calculateFogCoefficient(30, 293.15) / 0.47).toBeCloseTo(1, 1);
    expect(calculateFogCoefficient(100, 273.15) / 4.89).toBeCloseTo(1, 1);
  });
  it('30 GHz, 0,5 g/m³, 0 °C → 0,387 dB/km', () => {
    expect(calculateFogAttenuation(30, 0.5, 273.15) / 0.387).toBeCloseTo(1, 1);
  });
});

describe('Schneedämpfung (F-01, F-05)', () => {
  it('ist stetig in f (keine Sprünge bei 10 und 40 GHz)', () => {
    expect(
      calculateSnowAttenuation(10.001, 5, true) / calculateSnowAttenuation(9.999, 5, true)
    ).toBeCloseTo(1, 1);
    expect(
      calculateSnowAttenuation(40.001, 5, false) / calculateSnowAttenuation(39.999, 5, false)
    ).toBeCloseTo(1, 1);
    expect(
      calculateSnowAttenuation(10.001, 5, false) / calculateSnowAttenuation(9.999, 5, false)
    ).toBeCloseTo(1, 1);
  });

  it('Nassschnee entspricht Regen gleicher Wasseräquivalent-Rate (P.530-18)', () => {
    expect(calculateSnowAttenuation(20, 5, true)).toBeCloseTo(
      calculateRainAttenuation(20, 5, 'horizontal'),
      6
    );
  });

  it('Trockenschnee: Gunn & East – 10 GHz, 5 mm/h → 0,0043 dB/km; nie über Regen', () => {
    expect(calculateSnowAttenuation(10, 5, false)).toBeCloseTo(0.0043, 3);
    expect(calculateSnowAttenuation(30, 5, false)).toBeLessThan(
      calculateRainAttenuation(30, 5, 'horizontal')
    );
    expect(calculateSnowAttenuation(94, 5, false)).toBeLessThanOrEqual(
      calculateRainAttenuation(94, 5, 'horizontal')
    );
  });

  it('behandelt Schnee bei −5 °C als Trockenschnee, bei +1 °C als Nassschnee', () => {
    const base = {
      pressureHpa: 1013.25,
      waterVaporDensity: 7.5,
      rainRateMmH: 0,
      fogDensityGM3: 0,
      snowRateMmH: 5,
      polarization: 'horizontal' as const,
      elevationAngleDeg: 0
    };
    const cold = calculateAllAttenuation(30, { ...base, temperatureK: 268.15 });
    const warm = calculateAllAttenuation(30, { ...base, temperatureK: 274.15 });
    expect(cold.snow).toBeCloseTo(calculateSnowAttenuation(30, 5, false), 10);
    expect(warm.snow).toBeCloseTo(calculateSnowAttenuation(30, 5, true), 10);
    expect(warm.snow).toBeGreaterThan(cold.snow);
  });
});

describe('Erde–Raum-Pfad (F-13)', () => {
  const conditions = {
    ...STD,
    rainRateMmH: 0,
    fogDensityGM3: 0,
    snowRateMmH: 0,
    polarization: 'horizontal' as const,
    elevationAngleDeg: 0
  };

  it('12 GHz, 30°: Gasdämpfung ≈ 0,1 dB statt hunderten dB über 36 000 km', () => {
    const slant = calculateEarthSpaceAttenuation(12, conditions, 30);
    const terrestrial = calculateExtendedPathAttenuation(12, conditions, 36000);
    expect(slant.totalDb).toBeGreaterThan(0.08);
    expect(slant.totalDb).toBeLessThan(0.2);
    expect(terrestrial.totalDb).toBeGreaterThan(400);
    expect(slant.totalAllDb).toBeCloseTo(slant.totalDb, 12);
  });

  it('Regen wird über h_R/sin θ (3 km / sin 30° = 6 km) berücksichtigt', () => {
    const rainy = calculateEarthSpaceAttenuation(12, { ...conditions, rainRateMmH: 12.5 }, 30);
    expect(rainy.rainTotal).toBeCloseTo(rainy.rainPerKm * 6, 6);
    // Bei 30° Elevation gilt k(θ) nach Gl. 4 (nicht der θ = 0-Wert 0,473 dB/km)
    expect(rainy.rainPerKm).toBeCloseTo(calculateRainAttenuation(12, 12.5, 'horizontal', 30), 9);
    expect(calculateRainAttenuation(12, 12.5, 'horizontal', 0)).toBeCloseTo(0.473, 2);
  });

  it('0 bei ungültiger Elevation', () => {
    expect(calculateEarthSpaceAttenuation(12, conditions, 0).totalAllDb).toBe(0);
  });
});
