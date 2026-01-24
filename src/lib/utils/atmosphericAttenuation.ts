/**
 * Atmospheric and precipitation attenuation calculations based on ITU-R recommendations.
 *
 * References:
 * - ITU-R P.676-13 (08/2022): Attenuation by atmospheric gases
 * - ITU-R P.838-3 (03/2005): Specific attenuation model for rain
 * - ITU-R P.840-9 (08/2023): Attenuation due to clouds and fog
 *
 * IMPORTANT: These implementations are based on simplified/approximate algorithms
 * from the ITU recommendations. For critical applications requiring maximum accuracy,
 * use the full line-by-line calculation methods from the official ITU documents.
 *
 * Absorption peaks documented in ITU-R P.676:
 * - 22.235 GHz: Water vapor resonance
 * - 60 GHz (50-70 GHz band): Oxygen molecular resonance complex
 * - 118.75 GHz: Oxygen resonance
 * - 183.31 GHz: Water vapor resonance
 * - 325 GHz: Water vapor resonance
 */

import type {
  AtmosphericConditions,
  PrecipitationConditions,
  AllConditions,
  Polarization
} from '$lib/stores/atmosphericParameters.svelte';

// ============================================================================
// ITU-R P.676: Atmospheric Gas Attenuation (Oxygen and Water Vapor)
// ============================================================================

/**
 * Oxygen absorption line data from ITU-R P.676 Table 1 (simplified subset).
 * Format: [frequency (GHz), a1, a2, a3, a4, a5, a6]
 * These are the most significant lines affecting the 1-350 GHz range.
 */
const OXYGEN_LINES: number[][] = [
  // 60 GHz complex (multiple overlapping lines)
  [50.474214, 0.975, 9.651, 6.690, 0.0, 2.566, 6.850],
  [50.987745, 2.529, 8.653, 7.170, 0.0, 2.246, 6.800],
  [51.503360, 6.193, 7.709, 7.640, 0.0, 1.947, 6.729],
  [52.021429, 14.320, 6.819, 8.110, 0.0, 1.667, 6.640],
  [52.542418, 31.240, 5.983, 8.580, 0.0, 1.388, 6.526],
  [53.066934, 64.290, 5.201, 9.060, 0.0, 1.349, 6.206],
  [53.595775, 124.600, 4.474, 9.550, 0.0, 2.227, 5.085],
  [54.130025, 227.300, 3.800, 9.960, 0.0, 3.170, 3.750],
  [54.671180, 389.700, 3.182, 10.370, 0.0, 3.558, 2.654],
  [55.221384, 627.100, 2.618, 10.890, 0.0, 2.560, 2.952],
  [55.783815, 945.300, 2.109, 11.340, 0.0, -1.172, 6.135],
  [56.264774, 543.400, 0.014, 17.030, 0.0, 3.525, -0.978],
  [56.363399, 1331.800, 1.654, 11.890, 0.0, -2.378, 6.547],
  [56.968211, 1746.600, 1.255, 12.230, 0.0, -3.545, 6.451],
  [57.612486, 2120.100, 0.910, 12.620, 0.0, -5.416, 6.056],
  [58.323877, 2363.700, 0.621, 12.950, 0.0, -1.932, 0.436],
  [58.446588, 1442.100, 0.083, 14.910, 0.0, 6.768, -1.273],
  [59.164204, 2379.900, 0.387, 13.530, 0.0, -6.561, 2.309],
  [59.590983, 2090.700, 0.207, 14.080, 0.0, 6.957, -0.776],
  [60.306056, 2103.400, 0.207, 14.150, 0.0, -6.395, 0.699],
  [60.434778, 2438.000, 0.386, 13.390, 0.0, 6.342, -2.825],
  [61.150562, 2479.500, 0.621, 12.920, 0.0, 1.014, -0.584],
  [61.800158, 2275.900, 0.910, 12.630, 0.0, 5.014, -6.619],
  [62.411220, 1915.400, 1.255, 12.170, 0.0, 3.029, -6.759],
  [62.486253, 1503.000, 0.083, 15.130, 0.0, -4.499, 0.844],
  [62.997984, 1490.200, 1.654, 11.740, 0.0, 1.856, -6.675],
  [63.568526, 1078.000, 2.108, 11.340, 0.0, 0.658, -6.139],
  [64.127775, 728.700, 2.617, 10.880, 0.0, -3.036, -2.895],
  [64.678910, 461.300, 3.181, 10.380, 0.0, -3.968, -2.590],
  [65.224078, 274.000, 3.800, 9.960, 0.0, -3.528, -3.680],
  [65.764779, 153.000, 4.473, 9.550, 0.0, -2.548, -5.002],
  [66.302096, 80.400, 5.200, 9.060, 0.0, -1.660, -6.091],
  [66.836834, 39.800, 5.982, 8.580, 0.0, -1.680, -6.393],
  [67.369601, 18.560, 6.818, 8.110, 0.0, -1.956, -6.475],
  [67.900868, 8.172, 7.708, 7.640, 0.0, -2.216, -6.545],
  [68.431006, 3.397, 8.652, 7.170, 0.0, -2.492, -6.600],
  [68.960312, 1.334, 9.650, 6.690, 0.0, -2.773, -6.650],
  // 118.75 GHz line
  [118.750334, 940.300, 0.010, 16.640, 0.0, -0.439, 0.079],
  // Higher frequency lines (simplified)
  [368.498246, 67.400, 0.048, 16.400, 0.0, 0.000, 0.000],
  [424.763020, 637.700, 0.044, 16.400, 0.0, 0.000, 0.000],
  [487.249273, 237.400, 0.049, 16.000, 0.0, 0.000, 0.000],
  [715.392902, 98.100, 0.145, 16.000, 0.0, 0.000, 0.000],
  [773.839490, 572.300, 0.141, 16.200, 0.0, 0.000, 0.000],
  [834.145546, 183.100, 0.145, 14.700, 0.0, 0.000, 0.000]
];

/**
 * Water vapor absorption line data from ITU-R P.676 Table 2 (simplified subset).
 * Format: [frequency (GHz), b1, b2, b3, b4, b5, b6]
 */
const WATER_VAPOR_LINES: number[][] = [
  [22.235080, 0.1079, 2.144, 26.38, 0.76, 5.087, 1.00],
  [67.803960, 0.0011, 8.732, 28.58, 0.69, 4.930, 0.82],
  [119.995940, 0.0007, 8.353, 29.48, 0.70, 4.780, 0.79],
  [183.310087, 2.273, 0.668, 29.06, 0.77, 5.022, 0.85],
  [321.225630, 0.0470, 6.179, 24.04, 0.67, 4.398, 0.54],
  [325.152888, 1.514, 1.541, 28.23, 0.64, 4.893, 0.78],
  [336.227764, 0.0010, 9.825, 26.93, 0.69, 4.740, 0.63],
  [380.197353, 11.67, 1.048, 28.11, 0.54, 5.063, 0.89],
  [390.134508, 0.0045, 7.347, 21.52, 0.63, 4.810, 0.55],
  [437.346667, 0.0632, 5.048, 18.45, 0.60, 4.230, 0.48],
  [439.150807, 0.9098, 3.595, 20.07, 0.63, 4.483, 0.52],
  [443.018343, 0.1920, 5.048, 15.55, 0.60, 5.083, 0.50],
  [448.001085, 10.41, 1.405, 25.64, 0.66, 5.028, 0.67],
  [470.888999, 0.3254, 3.597, 21.34, 0.66, 4.506, 0.65],
  [474.689092, 1.260, 2.379, 23.20, 0.65, 4.804, 0.64],
  [488.490108, 0.2529, 2.852, 25.86, 0.69, 5.201, 0.72],
  [503.568532, 0.0372, 6.731, 16.12, 0.61, 3.980, 0.43],
  [504.482692, 0.0124, 6.731, 16.12, 0.61, 4.010, 0.45],
  [556.935985, 510.0, 0.159, 32.10, 0.69, 4.825, 1.00],
  [620.700807, 5.090, 2.200, 24.38, 0.71, 4.104, 0.68],
  [658.006500, 0.2740, 7.820, 32.10, 0.69, 4.650, 0.90],
  [752.033113, 250.0, 0.396, 30.86, 0.68, 4.750, 0.93],
  [841.051732, 0.0130, 8.180, 15.90, 0.33, 5.105, 0.34],
  [859.965698, 0.1330, 7.989, 30.60, 0.68, 4.311, 0.84],
  [899.303175, 0.0550, 7.917, 29.85, 0.68, 4.139, 0.77],
  [902.611085, 0.0380, 8.432, 28.65, 0.70, 4.295, 0.68],
  [906.205957, 0.1830, 5.111, 24.08, 0.70, 4.264, 0.62],
  [916.171582, 8.560, 1.442, 26.73, 0.70, 4.391, 0.66],
  [970.315022, 0.0178, 10.220, 25.30, 0.70, 4.420, 0.65],
  [987.926764, 134.4, 1.920, 27.94, 0.64, 4.630, 0.69]
];

/**
 * Calculate oxygen specific attenuation using ITU-R P.676 simplified algorithm.
 * Valid for frequencies 1-350 GHz at altitudes up to 10 km.
 *
 * @param frequencyGHz - Frequency in GHz (1-350 GHz recommended)
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
  const theta = 300 / temperatureK; // Temperature ratio (ITU convention)

  // Non-resonant Debye spectrum contribution (below 10 GHz)
  const d = 5.6e-4 * (p + 1.1 * 0.001 * p) * Math.pow(theta, 0.8);

  // Pressure-induced nitrogen absorption (above 100 GHz)
  const Nd = f * p * Math.pow(theta, 2) *
    (6.14e-5 / (d * (1 + Math.pow(f / d, 2))) +
      1.4e-12 * p * Math.pow(theta, 1.5) / (1 + 1.9e-5 * Math.pow(f, 1.5)));

  // Line-by-line summation for oxygen absorption
  let So = 0;
  for (const line of OXYGEN_LINES) {
    const [fi, a1, a2, a3, a4, a5, a6] = line;

    // Line strength
    const Si = a1 * 1e-7 * p * Math.pow(theta, 3) * Math.exp(a2 * (1 - theta));

    // Line width
    const gamma = a3 * 1e-4 * (p * Math.pow(theta, (0.8 - a4)) + 1.1 * 0.001 * p * theta);

    // Line shape factor (Van Vleck-Weisskopf)
    const delta = (a5 + a6 * theta) * 1e-4 * p * Math.pow(theta, 0.8);
    const Fi =
      (f / fi) *
      ((gamma - delta * (fi - f)) / (Math.pow(fi - f, 2) + Math.pow(gamma, 2)) +
        (gamma - delta * (fi + f)) / (Math.pow(fi + f, 2) + Math.pow(gamma, 2)));

    So += Si * Fi;
  }

  // Total oxygen attenuation
  const gamma_o = 0.182 * f * (So + Nd);

  return Math.max(0, gamma_o);
}

/**
 * Calculate water vapor specific attenuation using ITU-R P.676 simplified algorithm.
 * Valid for frequencies 1-350 GHz.
 *
 * @param frequencyGHz - Frequency in GHz
 * @param pressureHpa - Atmospheric pressure in hPa
 * @param waterVaporDensity - Water vapor density in g/m^3
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
  const theta = 300 / temperatureK;
  const e = waterVaporDensity * temperatureK / 216.7; // Water vapor partial pressure (hPa)

  // Line-by-line summation for water vapor absorption
  let Sw = 0;
  for (const line of WATER_VAPOR_LINES) {
    const [fi, b1, b2, b3, b4, b5, b6] = line;

    // Line strength
    const Si = b1 * 1e-1 * e * Math.pow(theta, 3.5) * Math.exp(b2 * (1 - theta));

    // Line width (pressure + self broadening)
    const gamma =
      b3 * 1e-4 * (p * Math.pow(theta, b4) + b5 * (e / p) * Math.pow(theta, b6));

    // Ensure minimum line width
    const gammaCorr = Math.sqrt(gamma * gamma + 2.25e-6);

    // Line shape factor
    const Fi =
      (f / fi) *
      (gammaCorr / (Math.pow(fi - f, 2) + Math.pow(gammaCorr, 2)) +
        gammaCorr / (Math.pow(fi + f, 2) + Math.pow(gammaCorr, 2)));

    Sw += Si * Fi;
  }

  // Total water vapor attenuation
  const gamma_w = 0.182 * f * Sw;

  return Math.max(0, gamma_w);
}

// ============================================================================
// ITU-R P.838: Rain Attenuation
// ============================================================================

/**
 * ITU-R P.838-3 coefficients for calculating k and alpha.
 * These are the curve-fitting coefficients from Table 1-4 of the recommendation.
 */
const RAIN_COEFFICIENTS = {
  // Table 1: kH coefficients
  kH: {
    aj: [-5.33980, -0.35351, -0.23789, -0.94158],
    bj: [-0.10008, 1.26970, 0.86036, 0.64552],
    cj: [1.13098, 0.45400, 0.15354, 0.16817],
    mk: -0.18961,
    ck: 0.71147
  },
  // Table 2: kV coefficients
  kV: {
    aj: [-3.80595, -3.44965, -0.39902, 0.50167],
    bj: [0.56934, -0.22911, 0.73042, 1.07319],
    cj: [0.81061, 0.51059, 0.11899, 0.27195],
    mk: -0.16398,
    ck: 0.63297
  },
  // Table 3: alphaH coefficients
  alphaH: {
    aj: [-0.14318, 0.29591, 0.32177, -5.37610, 16.1721],
    bj: [1.82442, 0.77564, 0.63773, -0.96230, -3.29980],
    cj: [-0.55187, 0.19822, 0.13164, 1.47828, 3.43990],
    ma: 0.67849,
    ca: -1.95537
  },
  // Table 4: alphaV coefficients
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
 *
 * @param frequencyGHz - Frequency in GHz (1-1000 GHz valid range)
 * @param polarization - Signal polarization
 * @param elevationAngleDeg - Elevation angle in degrees (0 = horizontal)
 * @returns Object containing k and alpha coefficients
 */
export function calculateRainCoefficients(
  frequencyGHz: number,
  polarization: Polarization,
  elevationAngleDeg: number = 0
): { k: number; alpha: number } {
  const f = frequencyGHz;
  const logF = Math.log10(f);

  // Calculate kH (horizontal polarization)
  let kH = 0;
  for (let j = 0; j < 4; j++) {
    kH += RAIN_COEFFICIENTS.kH.aj[j] *
      Math.exp(-Math.pow((logF - RAIN_COEFFICIENTS.kH.bj[j]) / RAIN_COEFFICIENTS.kH.cj[j], 2));
  }
  kH = Math.pow(10, kH + RAIN_COEFFICIENTS.kH.mk * logF + RAIN_COEFFICIENTS.kH.ck);

  // Calculate kV (vertical polarization)
  let kV = 0;
  for (let j = 0; j < 4; j++) {
    kV += RAIN_COEFFICIENTS.kV.aj[j] *
      Math.exp(-Math.pow((logF - RAIN_COEFFICIENTS.kV.bj[j]) / RAIN_COEFFICIENTS.kV.cj[j], 2));
  }
  kV = Math.pow(10, kV + RAIN_COEFFICIENTS.kV.mk * logF + RAIN_COEFFICIENTS.kV.ck);

  // Calculate alphaH (horizontal polarization)
  let alphaH = 0;
  for (let j = 0; j < 5; j++) {
    alphaH += RAIN_COEFFICIENTS.alphaH.aj[j] *
      Math.exp(-Math.pow((logF - RAIN_COEFFICIENTS.alphaH.bj[j]) / RAIN_COEFFICIENTS.alphaH.cj[j], 2));
  }
  alphaH = alphaH + RAIN_COEFFICIENTS.alphaH.ma * logF + RAIN_COEFFICIENTS.alphaH.ca;

  // Calculate alphaV (vertical polarization)
  let alphaV = 0;
  for (let j = 0; j < 5; j++) {
    alphaV += RAIN_COEFFICIENTS.alphaV.aj[j] *
      Math.exp(-Math.pow((logF - RAIN_COEFFICIENTS.alphaV.bj[j]) / RAIN_COEFFICIENTS.alphaV.cj[j], 2));
  }
  alphaV = alphaV + RAIN_COEFFICIENTS.alphaV.ma * logF + RAIN_COEFFICIENTS.alphaV.ca;

  // Convert elevation angle to radians
  const thetaRad = elevationAngleDeg * Math.PI / 180;
  const cosTheta = Math.cos(thetaRad);
  const cos2Theta = Math.pow(cosTheta, 2);

  // Calculate effective k and alpha based on polarization
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
      // For circular polarization: average of H and V
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
 * Formula: gamma_R = k * R^alpha (dB/km)
 *
 * @param frequencyGHz - Frequency in GHz
 * @param rainRateMmH - Rain rate in mm/h
 * @param polarization - Signal polarization
 * @param elevationAngleDeg - Elevation angle in degrees
 * @returns Rain specific attenuation in dB/km
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
 * Calculate the specific attenuation coefficient Kl for fog/cloud using ITU-R P.840.
 * Uses the double-Debye model for the dielectric permittivity of water.
 *
 * @param frequencyGHz - Frequency in GHz (valid up to 200 GHz for Rayleigh approximation)
 * @param temperatureK - Temperature in Kelvin
 * @returns Kl in (dB/km)/(g/m^3)
 */
export function calculateFogCoefficient(
  frequencyGHz: number,
  temperatureK: number
): number {
  const f = frequencyGHz;
  const theta = 300 / temperatureK;

  // Double-Debye model parameters
  const epsilon0 = 77.66 + 103.3 * (theta - 1);
  const epsilon1 = 0.0671 * epsilon0;
  const epsilon2 = 3.52;

  // Principal and secondary relaxation frequencies (GHz)
  const fp = 20.20 - 146.4 * (theta - 1) + 316 * Math.pow(theta - 1, 2);
  const fs = 39.8 * fp;

  // Complex dielectric permittivity components
  const epsilonPrimeReal =
    (epsilon0 - epsilon1) / (1 + Math.pow(f / fp, 2)) +
    (epsilon1 - epsilon2) / (1 + Math.pow(f / fs, 2)) +
    epsilon2;

  const epsilonPrimeImag =
    ((epsilon0 - epsilon1) * (f / fp)) / (1 + Math.pow(f / fp, 2)) +
    ((epsilon1 - epsilon2) * (f / fs)) / (1 + Math.pow(f / fs, 2));

  // Calculate eta
  const eta = (2 + epsilonPrimeReal) / epsilonPrimeImag;

  // Specific attenuation coefficient Kl
  const Kl = (0.819 * f) / (epsilonPrimeImag * (1 + eta * eta));

  return Kl;
}

/**
 * Calculate fog/cloud specific attenuation using ITU-R P.840.
 * Formula: gamma_c = Kl * M (dB/km)
 *
 * @param frequencyGHz - Frequency in GHz
 * @param liquidWaterDensity - Liquid water density in g/m^3
 * @param temperatureK - Temperature in Kelvin
 * @returns Fog/cloud specific attenuation in dB/km
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
 * Note: Snow attenuation is highly variable and depends on snow type (dry/wet).
 * This is a simplified model based on research data.
 *
 * References:
 * - Wet snow: comparable to rain attenuation
 * - Dry snow: typically an order of magnitude less than rain for same precipitation rate
 *
 * @param frequencyGHz - Frequency in GHz
 * @param snowRateMmH - Snow rate in mm/h (water equivalent)
 * @param isWetSnow - Whether snow is wet (true) or dry (false)
 * @returns Snow specific attenuation in dB/km
 */
export function calculateSnowAttenuation(
  frequencyGHz: number,
  snowRateMmH: number,
  isWetSnow: boolean = false
): number {
  if (snowRateMmH <= 0 || frequencyGHz < 1) return 0;

  // Empirical coefficients (simplified model)
  // Wet snow behaves similar to rain but with different coefficients
  // Dry snow has much lower attenuation

  let k: number;
  let alpha: number;

  if (isWetSnow) {
    // Wet snow - similar to light rain but with modified coefficients
    // Based on measurements showing wet snow can cause 2-4 dB/km
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
    // Dry snow - typically <1 dB/km, order of magnitude less than rain
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
  oxygen: number; // dB/km
  waterVapor: number; // dB/km
  total: number; // dB/km
}

export interface ExtendedAttenuationResult extends AttenuationResult {
  rain: number; // dB/km
  fog: number; // dB/km
  snow: number; // dB/km
  totalAll: number; // dB/km (all sources combined)
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

/**
 * Calculate all attenuation sources (gases + precipitation).
 *
 * @param frequencyGHz - Frequency in GHz
 * @param conditions - All atmospheric and precipitation conditions
 * @returns Extended attenuation breakdown in dB/km
 */
export function calculateAllAttenuation(
  frequencyGHz: number,
  conditions: Omit<AllConditions, 'distanceKm'>
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
  oxygenPerKm: number; // dB/km
  waterVaporPerKm: number; // dB/km
  totalPerKm: number; // dB/km
  oxygenTotal: number; // dB (over full path)
  waterVaporTotal: number; // dB (over full path)
  totalDb: number; // dB (over full path)
}

export interface ExtendedPathAttenuationResult extends PathAttenuationResult {
  rainPerKm: number; // dB/km
  fogPerKm: number; // dB/km
  snowPerKm: number; // dB/km
  rainTotal: number; // dB
  fogTotal: number; // dB
  snowTotal: number; // dB
  totalAllPerKm: number; // dB/km
  totalAllDb: number; // dB
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

/**
 * Calculate extended path attenuation including precipitation effects.
 *
 * @param frequencyGHz - Frequency in GHz
 * @param conditions - All conditions including distance
 * @returns Extended attenuation per km and total for path
 */
export function calculateExtendedPathAttenuation(
  frequencyGHz: number,
  conditions: AllConditions
): ExtendedPathAttenuationResult {
  const perKm = calculateAllAttenuation(frequencyGHz, conditions);
  const d = conditions.distanceKm;

  return {
    oxygenPerKm: perKm.oxygen,
    waterVaporPerKm: perKm.waterVapor,
    totalPerKm: perKm.total,
    oxygenTotal: perKm.oxygen * d,
    waterVaporTotal: perKm.waterVapor * d,
    totalDb: perKm.total * d,
    rainPerKm: perKm.rain,
    fogPerKm: perKm.fog,
    snowPerKm: perKm.snow,
    rainTotal: perKm.rain * d,
    fogTotal: perKm.fog * d,
    snowTotal: perKm.snow * d,
    totalAllPerKm: perKm.totalAll,
    totalAllDb: perKm.totalAll * d
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
 * Uses logarithmic spacing for smooth curves across frequency range.
 *
 * @param conditions - Atmospheric conditions (distanceKm not used for per-km values)
 * @param minFreq - Minimum frequency in GHz (default: 1)
 * @param maxFreq - Maximum frequency in GHz (default: 350)
 * @param numPoints - Number of data points (default: 500)
 * @returns Array of attenuation data points
 */
export function generateAttenuationCurve(
  conditions: Omit<AtmosphericConditions, 'distanceKm'>,
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
 *
 * @param conditions - All conditions (distanceKm not used for per-km values)
 * @param minFreq - Minimum frequency in GHz
 * @param maxFreq - Maximum frequency in GHz
 * @param numPoints - Number of data points
 * @returns Array of extended attenuation data points
 */
export function generateExtendedAttenuationCurve(
  conditions: Omit<AllConditions, 'distanceKm'>,
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
 *
 * @param rainRates - Array of rain rates in mm/h
 * @param polarization - Signal polarization
 * @param minFreq - Minimum frequency in GHz
 * @param maxFreq - Maximum frequency in GHz
 * @param numPoints - Number of data points
 * @returns Object mapping rain rates to curve data
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
// Reference Data: Known Absorption Peaks
// ============================================================================

/**
 * Key absorption peaks from ITU-R P.676 for reference.
 */
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

/**
 * Typical rain intensity classifications (ITU-R)
 */
export const RAIN_INTENSITY_CLASSES = {
  drizzle: { min: 0.25, max: 1, description: 'Drizzle' },
  light: { min: 1, max: 4, description: 'Light rain' },
  moderate: { min: 4, max: 16, description: 'Moderate rain' },
  heavy: { min: 16, max: 50, description: 'Heavy rain' },
  violent: { min: 50, max: 100, description: 'Violent rain' },
  cloudburst: { min: 100, max: 300, description: 'Cloudburst' }
};

/**
 * Fog visibility classifications (ITU-R P.840)
 */
export const FOG_VISIBILITY_CLASSES = {
  veryLight: { density: 0.01, visibility: '>2000m', description: 'Very light fog/haze' },
  light: { density: 0.02, visibility: '~1000m', description: 'Light fog' },
  moderate: { density: 0.05, visibility: '~500m', description: 'Moderate fog' },
  thick: { density: 0.1, visibility: '~200m', description: 'Thick fog' },
  dense: { density: 0.5, visibility: '~50m', description: 'Dense fog' }
};
