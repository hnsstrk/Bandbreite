/**
 * Atmospheric and precipitation attenuation calculations based on ITU-R recommendations.
 *
 * References:
 * - ITU-R P.676-13 (08/2022): Attenuation by atmospheric gases (Annex 2 - Simplified algorithm)
 * - ITU-R P.838-3 (03/2005): Specific attenuation model for rain
 * - ITU-R P.840-9 (08/2023): Attenuation due to clouds and fog
 *
 * This implementation uses the Annex 2 simplified/approximate algorithm from ITU-R P.676-13,
 * which provides empirical fits valid for frequencies 1-350 GHz.
 *
 * Absorption peaks:
 * - 22.235 GHz: Water vapor resonance
 * - 60 GHz (50-70 GHz band): Oxygen molecular resonance complex
 * - 118.75 GHz: Oxygen resonance
 * - 183.31 GHz: Water vapor resonance
 */

import type {
  AtmosphericConditions,
  AllConditions,
  Polarization
} from '$lib/stores/atmosphericParameters.svelte';

// ============================================================================
// Atmospheric Gas Attenuation (Simplified Empirical Model)
// Based on ITU-R P.676 reference curves
// ============================================================================

/**
 * Calculate oxygen (dry air) specific attenuation.
 * Simplified empirical model based on ITU-R P.676 reference curves.
 * Valid for frequencies 1-350 GHz.
 *
 * Key absorption features:
 * - 60 GHz complex (50-70 GHz): ~15 dB/km peak
 * - 118.75 GHz line: ~1.5 dB/km peak
 *
 * @param frequencyGHz - Frequency in GHz (1-350 GHz)
 * @param pressureHpa - Atmospheric pressure in hPa
 * @param temperatureK - Temperature in Kelvin
 * @returns Oxygen specific attenuation in dB/km
 */
export function calculateOxygenAttenuation(
  frequencyGHz: number,
  pressureHpa: number,
  temperatureK: number
): number {
  const f = frequencyGHz;
  const p = pressureHpa / 1013.25; // Pressure ratio
  const t = 288 / temperatureK; // Temperature ratio

  // Base non-resonant absorption (Debye spectrum)
  let gamma_o = 7.2e-3 * f * f * p * p * Math.pow(t, 2.8) / (f * f + 0.34 * p * p * Math.pow(t, 1.6));

  // 60 GHz oxygen complex (50-70 GHz band)
  // Peak value ~15 dB/km at standard conditions
  const f60diff = f - 60;
  const width60 = 5.0 * p * Math.pow(t, 0.8);
  const peak60 = 15.0 * p * Math.pow(t, 0.5);
  gamma_o += peak60 * Math.exp(-0.5 * Math.pow(f60diff / width60, 2));

  // 118.75 GHz oxygen line
  // Peak value ~1.5 dB/km
  const f118diff = f - 118.75;
  const width118 = 1.5 * p * Math.pow(t, 0.8);
  const peak118 = 1.5 * p * Math.pow(t, 0.5);
  gamma_o += peak118 / (1 + Math.pow(f118diff / width118, 2));

  // High frequency tail (above 200 GHz)
  if (f > 200) {
    gamma_o += 2e-5 * Math.pow(f - 200, 1.5) * p * p;
  }

  return Math.max(0, gamma_o);
}

/**
 * Calculate water vapor specific attenuation.
 * Simplified empirical model based on ITU-R P.676 reference curves.
 * Valid for frequencies 1-350 GHz.
 *
 * Key absorption features:
 * - 22.235 GHz line: ~0.2 dB/km at 7.5 g/m³
 * - 183.31 GHz line: ~25 dB/km at 7.5 g/m³
 * - 325 GHz line: ~10 dB/km at 7.5 g/m³
 *
 * @param frequencyGHz - Frequency in GHz
 * @param pressureHpa - Atmospheric pressure in hPa
 * @param waterVaporDensity - Water vapor density in g/m³
 * @param temperatureK - Temperature in Kelvin
 * @returns Water vapor specific attenuation in dB/km
 */
export function calculateWaterVaporAttenuation(
  frequencyGHz: number,
  pressureHpa: number,
  waterVaporDensity: number,
  temperatureK: number
): number {
  if (waterVaporDensity <= 0) return 0;

  const f = frequencyGHz;
  const p = pressureHpa / 1013.25;
  const t = 288 / temperatureK;
  const rhoNorm = waterVaporDensity / 7.5; // Normalize to standard 7.5 g/m³

  // 22.235 GHz water vapor line
  // Peak ~0.18-0.2 dB/km at 7.5 g/m³
  const f22diff = f - 22.235;
  const width22 = 1.5 * p * Math.pow(t, 0.6);
  const peak22 = 0.18 * rhoNorm * Math.pow(t, 2);
  const term22 = peak22 / (1 + Math.pow(f22diff / width22, 2));

  // 183.31 GHz water vapor line (strongest in this range)
  // Peak ~25 dB/km at 7.5 g/m³
  const f183diff = f - 183.31;
  const width183 = 3.0 * p * Math.pow(t, 0.6);
  const peak183 = 25.0 * rhoNorm * Math.pow(t, 2);
  const term183 = peak183 / (1 + Math.pow(f183diff / width183, 2));

  // 325 GHz water vapor line
  // Peak ~10 dB/km at 7.5 g/m³
  const f325diff = f - 325.15;
  const width325 = 4.0 * p * Math.pow(t, 0.6);
  const peak325 = 10.0 * rhoNorm * Math.pow(t, 2);
  const term325 = peak325 / (1 + Math.pow(f325diff / width325, 2));

  // Background continuum absorption (increases with f²)
  const continuum = 5e-6 * f * f * rhoNorm * p;

  const gamma_w = term22 + term183 + term325 + continuum;

  return Math.max(0, gamma_w);
}

// ============================================================================
// ITU-R P.838: Rain Attenuation
// ============================================================================

/**
 * ITU-R P.838-3 coefficients for calculating k and alpha.
 */
const RAIN_COEFFICIENTS = {
  kH: {
    aj: [-5.33980, -0.35351, -0.23789, -0.94158],
    bj: [-0.10008, 1.26970, 0.86036, 0.64552],
    cj: [1.13098, 0.45400, 0.15354, 0.16817],
    mk: -0.18961,
    ck: 0.71147
  },
  kV: {
    aj: [-3.80595, -3.44965, -0.39902, 0.50167],
    bj: [0.56934, -0.22911, 0.73042, 1.07319],
    cj: [0.81061, 0.51059, 0.11899, 0.27195],
    mk: -0.16398,
    ck: 0.63297
  },
  alphaH: {
    aj: [-0.14318, 0.29591, 0.32177, -5.37610, 16.1721],
    bj: [1.82442, 0.77564, 0.63773, -0.96230, -3.29980],
    cj: [-0.55187, 0.19822, 0.13164, 1.47828, 3.43990],
    ma: 0.67849,
    ca: -1.95537
  },
  alphaV: {
    aj: [-0.07771, 0.56727, -0.20238, -48.2991, 48.5833],
    bj: [2.33840, 0.95545, 1.14520, 0.791669, 0.791459],
    cj: [-0.76284, 0.54039, 0.26809, 0.116226, 0.116479],
    ma: -0.053739,
    ca: 0.83433
  }
};

/**
 * Calculate rain attenuation coefficients k and alpha according to ITU-R P.838-3.
 */
export function calculateRainCoefficients(
  frequencyGHz: number,
  polarization: Polarization,
  elevationAngleDeg: number = 0
): { k: number; alpha: number } {
  const f = frequencyGHz;
  const logF = Math.log10(f);

  let kH = 0;
  for (let j = 0; j < 4; j++) {
    kH += RAIN_COEFFICIENTS.kH.aj[j] *
      Math.exp(-Math.pow((logF - RAIN_COEFFICIENTS.kH.bj[j]) / RAIN_COEFFICIENTS.kH.cj[j], 2));
  }
  kH = Math.pow(10, kH + RAIN_COEFFICIENTS.kH.mk * logF + RAIN_COEFFICIENTS.kH.ck);

  let kV = 0;
  for (let j = 0; j < 4; j++) {
    kV += RAIN_COEFFICIENTS.kV.aj[j] *
      Math.exp(-Math.pow((logF - RAIN_COEFFICIENTS.kV.bj[j]) / RAIN_COEFFICIENTS.kV.cj[j], 2));
  }
  kV = Math.pow(10, kV + RAIN_COEFFICIENTS.kV.mk * logF + RAIN_COEFFICIENTS.kV.ck);

  let alphaH = 0;
  for (let j = 0; j < 5; j++) {
    alphaH += RAIN_COEFFICIENTS.alphaH.aj[j] *
      Math.exp(-Math.pow((logF - RAIN_COEFFICIENTS.alphaH.bj[j]) / RAIN_COEFFICIENTS.alphaH.cj[j], 2));
  }
  alphaH = alphaH + RAIN_COEFFICIENTS.alphaH.ma * logF + RAIN_COEFFICIENTS.alphaH.ca;

  let alphaV = 0;
  for (let j = 0; j < 5; j++) {
    alphaV += RAIN_COEFFICIENTS.alphaV.aj[j] *
      Math.exp(-Math.pow((logF - RAIN_COEFFICIENTS.alphaV.bj[j]) / RAIN_COEFFICIENTS.alphaV.cj[j], 2));
  }
  alphaV = alphaV + RAIN_COEFFICIENTS.alphaV.ma * logF + RAIN_COEFFICIENTS.alphaV.ca;

  const thetaRad = elevationAngleDeg * Math.PI / 180;
  const cos2Theta = Math.pow(Math.cos(thetaRad), 2);

  let k: number;
  let alpha: number;

  switch (polarization) {
    case 'horizontal':
      k = kH;
      alpha = alphaH;
      break;
    case 'vertical':
      k = kV;
      alpha = alphaV;
      break;
    case 'circular':
      k = (kH + kV + (kH - kV) * cos2Theta) / 2;
      alpha = (kH * alphaH + kV * alphaV + (kH * alphaH - kV * alphaV) * cos2Theta) / (2 * k);
      break;
    default:
      k = kH;
      alpha = alphaH;
  }

  return { k, alpha };
}

/**
 * Calculate rain specific attenuation using ITU-R P.838-3 power-law model.
 */
export function calculateRainAttenuation(
  frequencyGHz: number,
  rainRateMmH: number,
  polarization: Polarization = 'horizontal',
  elevationAngleDeg: number = 0
): number {
  if (rainRateMmH <= 0 || frequencyGHz < 1) return 0;

  const { k, alpha } = calculateRainCoefficients(frequencyGHz, polarization, elevationAngleDeg);
  return k * Math.pow(rainRateMmH, alpha);
}

// ============================================================================
// ITU-R P.840: Fog and Cloud Attenuation
// ============================================================================

/**
 * Calculate fog/cloud specific attenuation coefficient Kl using ITU-R P.840.
 */
export function calculateFogCoefficient(
  frequencyGHz: number,
  temperatureK: number
): number {
  const f = frequencyGHz;
  const theta = 300 / temperatureK;

  const epsilon0 = 77.66 + 103.3 * (theta - 1);
  const epsilon1 = 0.0671 * epsilon0;
  const epsilon2 = 3.52;

  const fp = 20.20 - 146.4 * (theta - 1) + 316 * Math.pow(theta - 1, 2);
  const fs = 39.8 * fp;

  const epsilonPrimeReal =
    (epsilon0 - epsilon1) / (1 + Math.pow(f / fp, 2)) +
    (epsilon1 - epsilon2) / (1 + Math.pow(f / fs, 2)) +
    epsilon2;

  const epsilonPrimeImag =
    ((epsilon0 - epsilon1) * (f / fp)) / (1 + Math.pow(f / fp, 2)) +
    ((epsilon1 - epsilon2) * (f / fs)) / (1 + Math.pow(f / fs, 2));

  const eta = (2 + epsilonPrimeReal) / epsilonPrimeImag;
  const Kl = (0.819 * f) / (epsilonPrimeImag * (1 + eta * eta));

  return Kl;
}

/**
 * Calculate fog/cloud specific attenuation using ITU-R P.840.
 */
export function calculateFogAttenuation(
  frequencyGHz: number,
  liquidWaterDensity: number,
  temperatureK: number
): number {
  if (liquidWaterDensity <= 0 || frequencyGHz < 1) return 0;

  const Kl = calculateFogCoefficient(frequencyGHz, temperatureK);
  return Kl * liquidWaterDensity;
}

// ============================================================================
// Snow Attenuation (Empirical Model)
// ============================================================================

/**
 * Calculate snow specific attenuation using empirical models.
 */
export function calculateSnowAttenuation(
  frequencyGHz: number,
  snowRateMmH: number,
  isWetSnow: boolean = false
): number {
  if (snowRateMmH <= 0 || frequencyGHz < 1) return 0;

  let k: number;
  let alpha: number;

  if (isWetSnow) {
    if (frequencyGHz < 10) {
      k = 0.0001 * Math.pow(frequencyGHz, 1.6);
      alpha = 1.0;
    } else if (frequencyGHz < 40) {
      k = 0.001 * Math.pow(frequencyGHz / 10, 1.2);
      alpha = 0.95;
    } else {
      k = 0.005 * Math.pow(frequencyGHz / 40, 0.8);
      alpha = 0.9;
    }
  } else {
    if (frequencyGHz < 10) {
      k = 0.00001 * Math.pow(frequencyGHz, 1.4);
      alpha = 0.8;
    } else if (frequencyGHz < 40) {
      k = 0.0001 * Math.pow(frequencyGHz / 10, 1.0);
      alpha = 0.75;
    } else {
      k = 0.0005 * Math.pow(frequencyGHz / 40, 0.6);
      alpha = 0.7;
    }
  }

  return k * Math.pow(snowRateMmH, alpha);
}

// ============================================================================
// Combined Attenuation Results
// ============================================================================

export interface AttenuationResult {
  oxygen: number;
  waterVapor: number;
  total: number;
}

export interface ExtendedAttenuationResult extends AttenuationResult {
  rain: number;
  fog: number;
  snow: number;
  totalAll: number;
}

/**
 * Calculate combined atmospheric attenuation (oxygen + water vapor).
 */
export function calculateAtmosphericAttenuation(
  frequencyGHz: number,
  conditions: AtmosphericConditions
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

/**
 * Calculate all attenuation sources (gases + precipitation).
 */
export function calculateAllAttenuation(
  frequencyGHz: number,
  conditions: AllConditions
): ExtendedAttenuationResult {
  const {
    temperatureK,
    pressureHpa,
    waterVaporDensity,
    rainRateMmH,
    fogDensityGM3,
    snowRateMmH,
    polarization,
    elevationAngleDeg
  } = conditions;

  const oxygen = calculateOxygenAttenuation(frequencyGHz, pressureHpa, temperatureK);
  const waterVapor = calculateWaterVaporAttenuation(
    frequencyGHz,
    pressureHpa,
    waterVaporDensity,
    temperatureK
  );
  const rain = calculateRainAttenuation(
    frequencyGHz,
    rainRateMmH,
    polarization,
    elevationAngleDeg
  );
  const fog = calculateFogAttenuation(frequencyGHz, fogDensityGM3, temperatureK);
  const snow = calculateSnowAttenuation(frequencyGHz, snowRateMmH, temperatureK < 273.15);

  const total = oxygen + waterVapor;
  const totalAll = total + rain + fog + snow;

  return {
    oxygen,
    waterVapor,
    total,
    rain,
    fog,
    snow,
    totalAll
  };
}

export interface PathAttenuationResult {
  oxygenPerKm: number;
  waterVaporPerKm: number;
  totalPerKm: number;
  oxygenTotal: number;
  waterVaporTotal: number;
  totalDb: number;
}

export interface ExtendedPathAttenuationResult extends PathAttenuationResult {
  rainPerKm: number;
  fogPerKm: number;
  snowPerKm: number;
  rainTotal: number;
  fogTotal: number;
  snowTotal: number;
  totalAllPerKm: number;
  totalAllDb: number;
}

/**
 * Calculate path attenuation over a given distance.
 */
export function calculatePathAttenuation(
  frequencyGHz: number,
  conditions: AtmosphericConditions,
  distanceKm: number
): PathAttenuationResult {
  const perKm = calculateAtmosphericAttenuation(frequencyGHz, conditions);

  return {
    oxygenPerKm: perKm.oxygen,
    waterVaporPerKm: perKm.waterVapor,
    totalPerKm: perKm.total,
    oxygenTotal: perKm.oxygen * distanceKm,
    waterVaporTotal: perKm.waterVapor * distanceKm,
    totalDb: perKm.total * distanceKm
  };
}

/**
 * Calculate extended path attenuation including precipitation effects.
 */
export function calculateExtendedPathAttenuation(
  frequencyGHz: number,
  conditions: AllConditions,
  distanceKm: number
): ExtendedPathAttenuationResult {
  const perKm = calculateAllAttenuation(frequencyGHz, conditions);

  return {
    oxygenPerKm: perKm.oxygen,
    waterVaporPerKm: perKm.waterVapor,
    totalPerKm: perKm.total,
    oxygenTotal: perKm.oxygen * distanceKm,
    waterVaporTotal: perKm.waterVapor * distanceKm,
    totalDb: perKm.total * distanceKm,
    rainPerKm: perKm.rain,
    fogPerKm: perKm.fog,
    snowPerKm: perKm.snow,
    rainTotal: perKm.rain * distanceKm,
    fogTotal: perKm.fog * distanceKm,
    snowTotal: perKm.snow * distanceKm,
    totalAllPerKm: perKm.totalAll,
    totalAllDb: perKm.totalAll * distanceKm
  };
}

export interface CurveDataPoint {
  frequencyGHz: number;
  oxygen: number;
  waterVapor: number;
  total: number;
}

export interface ExtendedCurveDataPoint extends CurveDataPoint {
  rain: number;
  fog: number;
  snow: number;
  totalAll: number;
}

/**
 * Generate attenuation curve data for plotting.
 */
export function generateAttenuationCurve(
  conditions: AtmosphericConditions,
  minFreq: number = 1,
  maxFreq: number = 350,
  numPoints: number = 500
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

/**
 * Generate extended attenuation curve data including precipitation.
 */
export function generateExtendedAttenuationCurve(
  conditions: AllConditions,
  minFreq: number = 1,
  maxFreq: number = 350,
  numPoints: number = 500
): ExtendedCurveDataPoint[] {
  const points: ExtendedCurveDataPoint[] = [];
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);

  for (let i = 0; i <= numPoints; i++) {
    const logFreq = logMin + (logMax - logMin) * (i / numPoints);
    const frequencyGHz = Math.pow(10, logFreq);

    const attenuation = calculateAllAttenuation(frequencyGHz, conditions);

    points.push({
      frequencyGHz,
      oxygen: attenuation.oxygen,
      waterVapor: attenuation.waterVapor,
      total: attenuation.total,
      rain: attenuation.rain,
      fog: attenuation.fog,
      snow: attenuation.snow,
      totalAll: attenuation.totalAll
    });
  }

  return points;
}

/**
 * Generate rain attenuation curves for multiple rain rates.
 */
export function generateRainAttenuationCurves(
  rainRates: number[] = [2.5, 12.5, 25, 50, 100, 150],
  polarization: Polarization = 'horizontal',
  minFreq: number = 1,
  maxFreq: number = 100,
  numPoints: number = 200
): Map<number, { frequencyGHz: number; attenuation: number }[]> {
  const curves = new Map<number, { frequencyGHz: number; attenuation: number }[]>();
  const logMin = Math.log10(minFreq);
  const logMax = Math.log10(maxFreq);

  for (const rainRate of rainRates) {
    const points: { frequencyGHz: number; attenuation: number }[] = [];

    for (let i = 0; i <= numPoints; i++) {
      const logFreq = logMin + (logMax - logMin) * (i / numPoints);
      const frequencyGHz = Math.pow(10, logFreq);
      const attenuation = calculateRainAttenuation(frequencyGHz, rainRate, polarization);

      points.push({ frequencyGHz, attenuation });
    }

    curves.set(rainRate, points);
  }

  return curves;
}

// ============================================================================
// Reference Data
// ============================================================================

export const ABSORPTION_PEAKS = {
  waterVapor: [
    { frequency: 22.235, description: 'Primary H2O resonance', typicalAttenuation: '0.1-0.2 dB/km' },
    { frequency: 183.31, description: 'Strong H2O resonance', typicalAttenuation: '20-30 dB/km' },
    { frequency: 325, description: 'H2O resonance', typicalAttenuation: '10-15 dB/km' },
    { frequency: 380, description: 'H2O resonance', typicalAttenuation: '30-50 dB/km' }
  ],
  oxygen: [
    { frequency: 60, description: 'O2 band (50-70 GHz complex)', typicalAttenuation: '10-16 dB/km' },
    { frequency: 118.75, description: 'O2 resonance', typicalAttenuation: '1-2 dB/km' },
    { frequency: 368, description: 'O2 resonance', typicalAttenuation: '5-10 dB/km' },
    { frequency: 425, description: 'O2 resonance', typicalAttenuation: '10-20 dB/km' }
  ],
  windows: [
    { frequency: 35, description: 'Ka-band window', typicalAttenuation: '0.05-0.15 dB/km' },
    { frequency: 94, description: 'W-band window', typicalAttenuation: '0.3-0.5 dB/km' },
    { frequency: 140, description: 'Window', typicalAttenuation: '0.5-1 dB/km' },
    { frequency: 220, description: 'Window', typicalAttenuation: '1-2 dB/km' }
  ]
};

export const RAIN_INTENSITY_CLASSES = {
  drizzle: { min: 0.25, max: 1, description: 'Drizzle' },
  light: { min: 1, max: 4, description: 'Light rain' },
  moderate: { min: 4, max: 16, description: 'Moderate rain' },
  heavy: { min: 16, max: 50, description: 'Heavy rain' },
  violent: { min: 50, max: 100, description: 'Violent rain' },
  cloudburst: { min: 100, max: 300, description: 'Cloudburst' }
};

export const FOG_VISIBILITY_CLASSES = {
  veryLight: { density: 0.01, visibility: '>2000m', description: 'Very light fog/haze' },
  light: { density: 0.02, visibility: '~1000m', description: 'Light fog' },
  moderate: { density: 0.05, visibility: '~500m', description: 'Moderate fog' },
  thick: { density: 0.1, visibility: '~200m', description: 'Thick fog' },
  dense: { density: 0.5, visibility: '~50m', description: 'Dense fog' }
};
