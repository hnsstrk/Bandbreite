/**
 * Vitest setup file
 * This file is loaded before each test file
 */

import { vi } from 'vitest';

// Mock the speedOfLight store for calculations.ts tests
vi.mock('$lib/stores/speedOfLight.svelte', () => ({
  speedOfLight: {
    value: 299792458, // Exact speed of light in m/s
    isExact: true
  }
}));

// Mock atmospheric parameters store for atmosphericAttenuation.ts tests
vi.mock('$lib/stores/atmosphericParameters.svelte', () => ({
  atmosphericParameters: {
    temperatureK: 288,
    temperatureCelsius: 15,
    pressureHpa: 1013.25,
    waterVaporDensity: 7.5,
    rainRateMmH: 0,
    fogDensityGM3: 0,
    snowRateMmH: 0,
    polarization: 'horizontal' as const,
    elevationAngleDeg: 0,
    allConditions: {
      temperatureK: 288,
      pressureHpa: 1013.25,
      waterVaporDensity: 7.5,
      rainRateMmH: 0,
      fogDensityGM3: 0,
      snowRateMmH: 0,
      polarization: 'horizontal' as const,
      elevationAngleDeg: 0
    }
  }
}));
