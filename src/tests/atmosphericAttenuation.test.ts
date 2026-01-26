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
    const attenuation50GHz = calculateOxygenAttenuation(50, STANDARD_PRESSURE_HPA, STANDARD_TEMPERATURE_K);
    const attenuation60GHz = calculateOxygenAttenuation(60, STANDARD_PRESSURE_HPA, STANDARD_TEMPERATURE_K);
    const attenuation70GHz = calculateOxygenAttenuation(70, STANDARD_PRESSURE_HPA, STANDARD_TEMPERATURE_K);

    // 60 GHz should have highest attenuation in this range
    expect(attenuation60GHz).toBeGreaterThan(attenuation50GHz);
    expect(attenuation60GHz).toBeGreaterThan(attenuation70GHz);
  });

  it('should show secondary peak around 118.75 GHz', () => {
    const attenuation100GHz = calculateOxygenAttenuation(100, STANDARD_PRESSURE_HPA, STANDARD_TEMPERATURE_K);
    const attenuation119GHz = calculateOxygenAttenuation(118.75, STANDARD_PRESSURE_HPA, STANDARD_TEMPERATURE_K);
    const attenuation140GHz = calculateOxygenAttenuation(140, STANDARD_PRESSURE_HPA, STANDARD_TEMPERATURE_K);

    // 118.75 GHz should be a local peak
    expect(attenuation119GHz).toBeGreaterThan(attenuation100GHz);
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
    const result = calculateWaterVaporAttenuation(22.235, STANDARD_PRESSURE_HPA, 0, STANDARD_TEMPERATURE_K);
    expect(result).toBe(0);
  });

  it('should return positive attenuation with water vapor present', () => {
    const result = calculateWaterVaporAttenuation(22.235, STANDARD_PRESSURE_HPA, STANDARD_WATER_VAPOR, STANDARD_TEMPERATURE_K);
    expect(result).toBeGreaterThan(0);
  });

  it('should show peak at 22.235 GHz water vapor line', () => {
    const attenuation20GHz = calculateWaterVaporAttenuation(20, STANDARD_PRESSURE_HPA, STANDARD_WATER_VAPOR, STANDARD_TEMPERATURE_K);
    const attenuation22GHz = calculateWaterVaporAttenuation(22.235, STANDARD_PRESSURE_HPA, STANDARD_WATER_VAPOR, STANDARD_TEMPERATURE_K);
    const attenuation25GHz = calculateWaterVaporAttenuation(25, STANDARD_PRESSURE_HPA, STANDARD_WATER_VAPOR, STANDARD_TEMPERATURE_K);

    // 22.235 GHz should be a local peak
    expect(attenuation22GHz).toBeGreaterThan(attenuation20GHz);
    expect(attenuation22GHz).toBeGreaterThan(attenuation25GHz);
  });

  it('should show strong peak at 183.31 GHz', () => {
    const attenuation183GHz = calculateWaterVaporAttenuation(183.31, STANDARD_PRESSURE_HPA, STANDARD_WATER_VAPOR, STANDARD_TEMPERATURE_K);
    // This is the strongest water vapor line in the 1-350 GHz range
    expect(attenuation183GHz).toBeGreaterThan(10);
  });

  it('should scale with water vapor density', () => {
    const lowDensity = calculateWaterVaporAttenuation(22.235, STANDARD_PRESSURE_HPA, 3.75, STANDARD_TEMPERATURE_K);
    const highDensity = calculateWaterVaporAttenuation(22.235, STANDARD_PRESSURE_HPA, 15, STANDARD_TEMPERATURE_K);
    expect(highDensity).toBeGreaterThan(lowDensity);
  });

  it('should return non-negative values', () => {
    const result = calculateWaterVaporAttenuation(1, STANDARD_PRESSURE_HPA, STANDARD_WATER_VAPOR, STANDARD_TEMPERATURE_K);
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

  it('should handle elevation angle', () => {
    const horizontal0 = calculateRainCoefficients(10, 'horizontal', 0);
    const horizontal45 = calculateRainCoefficients(10, 'horizontal', 45);
    // Different elevation angles should give same result for pure H/V polarization
    // but circular will vary
    expect(horizontal0.k).toBeCloseTo(horizontal45.k, 5);
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

    result.forEach(point => {
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
    const h2o22 = ABSORPTION_PEAKS.waterVapor.find(p => p.frequency === 22.235);
    expect(h2o22).toBeDefined();

    // Check 60 GHz oxygen peak
    const o260 = ABSORPTION_PEAKS.oxygen.find(p => p.frequency === 60);
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
