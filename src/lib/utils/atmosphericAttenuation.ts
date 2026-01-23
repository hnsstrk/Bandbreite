/**
 * Atmospheric attenuation calculations based on ITU-R P.676.
 * Simplified model for frequencies 1-100 GHz covering oxygen and water vapor absorption.
 *
 * NOTE: These are simplified approximations. For critical applications,
 * use the full ITU-R P.676 recommendation.
 */

import type { AtmosphericConditions } from '$lib/stores/atmosphericParameters.svelte';

/**
 * Calculate oxygen attenuation in dB/km.
 * Models the 60 GHz oxygen absorption band (50-70 GHz) and the 118.75 GHz line.
 *
 * @param frequencyGHz - Frequency in GHz
 * @param pressureHpa - Atmospheric pressure in hPa
 * @param temperatureK - Temperature in Kelvin
 * @returns Oxygen attenuation in dB/km
 */
export function calculateOxygenAttenuation(
  frequencyGHz: number,
  pressureHpa: number,
  temperatureK: number
): number {
  // Normalize pressure and temperature to reference values
  const p = pressureHpa / 1013.25;
  const t = 288.15 / temperatureK;

  // Simplified oxygen absorption model
  // Based on ITU-R P.676 but simplified for computational efficiency

  // Broadband continuum (base level)
  const continuum = 0.001 * p * Math.pow(t, 2) * Math.pow(frequencyGHz / 60, 2);

  // 60 GHz absorption band (50-70 GHz) - O2 molecular resonance
  const f0_60 = 60; // Center frequency of 60 GHz band
  const gamma_60 = 8; // Line width in GHz
  const S_60 = 15 * p * Math.pow(t, 3); // Line strength

  // Lorentzian line shape for 60 GHz band
  const lorentz_60 =
    S_60 *
    (gamma_60 / (Math.pow(frequencyGHz - f0_60, 2) + Math.pow(gamma_60, 2)) +
      gamma_60 / (Math.pow(frequencyGHz + f0_60, 2) + Math.pow(gamma_60, 2)));

  // 118.75 GHz line contribution (tail visible at 100 GHz)
  const f0_118 = 118.75;
  const gamma_118 = 3;
  const S_118 = 0.5 * p * Math.pow(t, 3);

  const lorentz_118 =
    S_118 *
    (gamma_118 / (Math.pow(frequencyGHz - f0_118, 2) + Math.pow(gamma_118, 2)));

  // Combined oxygen attenuation
  return Math.max(0, continuum + lorentz_60 + lorentz_118);
}

/**
 * Calculate water vapor attenuation in dB/km.
 * Models the 22.235 GHz and 183.31 GHz water vapor absorption lines.
 *
 * @param frequencyGHz - Frequency in GHz
 * @param pressureHpa - Atmospheric pressure in hPa
 * @param waterVaporDensity - Water vapor density in g/m³
 * @param temperatureK - Temperature in Kelvin
 * @returns Water vapor attenuation in dB/km
 */
export function calculateWaterVaporAttenuation(
  frequencyGHz: number,
  pressureHpa: number,
  waterVaporDensity: number,
  temperatureK: number
): number {
  if (waterVaporDensity <= 0) return 0;

  // Normalize parameters
  const p = pressureHpa / 1013.25;
  const rho = waterVaporDensity / 7.5; // Normalize to reference density
  const t = 288.15 / temperatureK;

  // 22.235 GHz water vapor line
  const f0_22 = 22.235;
  const gamma_22 = 3.5 * p * Math.pow(t, 0.6); // Pressure-broadened line width
  const S_22 = 0.18 * rho * Math.pow(t, 3.5); // Line strength

  // Lorentzian line shape for 22.235 GHz
  const lorentz_22 =
    S_22 * gamma_22 / (Math.pow(frequencyGHz - f0_22, 2) + Math.pow(gamma_22, 2));

  // 183.31 GHz line (strong line, tail visible at 100 GHz)
  const f0_183 = 183.31;
  const gamma_183 = 4 * p * Math.pow(t, 0.6);
  const S_183 = 2.5 * rho * Math.pow(t, 3);

  const lorentz_183 =
    S_183 * gamma_183 / (Math.pow(frequencyGHz - f0_183, 2) + Math.pow(gamma_183, 2));

  // Water vapor continuum (frequency-squared dependence)
  const continuum = 0.0001 * rho * p * Math.pow(t, 2.5) * Math.pow(frequencyGHz / 100, 2);

  // Combined water vapor attenuation
  return Math.max(0, lorentz_22 + lorentz_183 + continuum);
}

export interface AttenuationResult {
  oxygen: number; // dB/km
  waterVapor: number; // dB/km
  total: number; // dB/km
}

/**
 * Calculate combined atmospheric attenuation (oxygen + water vapor).
 *
 * @param frequencyGHz - Frequency in GHz
 * @param conditions - Atmospheric conditions
 * @returns Attenuation breakdown in dB/km
 */
export function calculateAtmosphericAttenuation(
  frequencyGHz: number,
  conditions: Omit<AtmosphericConditions, 'distanceKm'>
): AttenuationResult {
  const { temperatureK, pressureHpa, waterVaporDensity } = conditions;

  const oxygen = calculateOxygenAttenuation(frequencyGHz, pressureHpa, temperatureK);
  const waterVapor = calculateWaterVaporAttenuation(
    frequencyGHz,
    pressureHpa,
    waterVaporDensity,
    temperatureK
  );

  return {
    oxygen,
    waterVapor,
    total: oxygen + waterVapor
  };
}

export interface PathAttenuationResult {
  oxygenPerKm: number; // dB/km
  waterVaporPerKm: number; // dB/km
  totalPerKm: number; // dB/km
  oxygenTotal: number; // dB (over full path)
  waterVaporTotal: number; // dB (over full path)
  totalDb: number; // dB (over full path)
}

/**
 * Calculate path attenuation over a given distance.
 *
 * @param frequencyGHz - Frequency in GHz
 * @param conditions - Atmospheric conditions including distance
 * @returns Attenuation per km and total for path
 */
export function calculatePathAttenuation(
  frequencyGHz: number,
  conditions: AtmosphericConditions
): PathAttenuationResult {
  const perKm = calculateAtmosphericAttenuation(frequencyGHz, conditions);

  return {
    oxygenPerKm: perKm.oxygen,
    waterVaporPerKm: perKm.waterVapor,
    totalPerKm: perKm.total,
    oxygenTotal: perKm.oxygen * conditions.distanceKm,
    waterVaporTotal: perKm.waterVapor * conditions.distanceKm,
    totalDb: perKm.total * conditions.distanceKm
  };
}

export interface CurveDataPoint {
  frequencyGHz: number;
  oxygen: number;
  waterVapor: number;
  total: number;
}

/**
 * Generate attenuation curve data for plotting.
 * Uses logarithmic spacing for smooth curves across frequency range.
 *
 * @param conditions - Atmospheric conditions (distanceKm not used for per-km values)
 * @param minFreq - Minimum frequency in GHz (default: 1)
 * @param maxFreq - Maximum frequency in GHz (default: 100)
 * @param numPoints - Number of data points (default: 200)
 * @returns Array of attenuation data points
 */
export function generateAttenuationCurve(
  conditions: Omit<AtmosphericConditions, 'distanceKm'>,
  minFreq: number = 1,
  maxFreq: number = 100,
  numPoints: number = 200
): CurveDataPoint[] {
  const points: CurveDataPoint[] = [];
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);

  for (let i = 0; i <= numPoints; i++) {
    const logFreq = logMin + (logMax - logMin) * (i / numPoints);
    const frequencyGHz = Math.pow(10, logFreq);

    const attenuation = calculateAtmosphericAttenuation(frequencyGHz, conditions);

    points.push({
      frequencyGHz,
      oxygen: attenuation.oxygen,
      waterVapor: attenuation.waterVapor,
      total: attenuation.total
    });
  }

  return points;
}
