/**
 * Atmosphären- und Niederschlagsdämpfung nach ITU-R-Empfehlungen.
 *
 * Quellen:
 * - ITU-R P.676-13 (08/2022): Attenuation by atmospheric gases – Annex 1 line-by-line
 *   (Implementierung in $lib/utils/itu676.ts, Linienkatalog in $lib/data/itu676Lines.ts)
 *   und Annex 2 (Schrägpfad mit äquivalenten Höhen)
 * - ITU-R P.838-3 (03/2005): Specific attenuation model for rain (Gl. 1–5, Tabellen 1–4)
 * - ITU-R P.840-9 (08/2023): Attenuation due to clouds and fog (Double-Debye)
 * - ITU-R P.530-18 §2.4.2 / Oguchi, Proc. IEEE 71(9), 1983: Nassschnee ≈ Regen gleicher
 *   Wasseräquivalent-Rate; Trockenschnee nach Gunn & East (1954), zitiert in Ippolito,
 *   Propagation Effects Handbook for Satellite Systems Design (NASA)
 * - ITU-R P.839-4: Regenhöhe für Schrägpfade
 *
 * Absorptionslinien (Meereshöhe, 15 °C, 7,5 g/m³ – aus dem Modell berechnet):
 * - 22,235 GHz: Wasserdampf, ≈ 0,19 dB/km
 * - 60 GHz (50–70 GHz): Sauerstoffkomplex, ≈ 14,7 dB/km
 * - 118,75 GHz: Sauerstoff, ≈ 1,9 dB/km
 * - 183,31 GHz: Wasserdampf, ≈ 28 dB/km
 * - 325,15 GHz: Wasserdampf, ≈ 38 dB/km
 */

import type {
  AtmosphericConditions,
  AllConditions,
  Polarization
} from '$lib/stores/atmosphericParameters.svelte';
import {
  specificGasAttenuation,
  oxygenSpecificAttenuation,
  waterVaporSpecificAttenuation,
  waterVaporPartialPressure,
  slantPathGasAttenuation
} from '$lib/utils/itu676';
import { WET_SNOW_THRESHOLD_K, RAIN_HEIGHT_KM } from '$lib/data/constants';
import { safeDivide, safeLog } from '$lib/utils/handlers';

// ============================================================================
// ITU-R P.676-13: Gasdämpfung (Wrapper um itu676.ts, API-kompatibel)
// ============================================================================

/**
 * Spezifische Dämpfung durch Sauerstoff (trockene Luft) in dB/km nach ITU-R P.676-13 Annex 1.
 *
 * @param frequencyGHz - Frequenz in GHz (1–1000 GHz)
 * @param pressureHpa - Barometrischer Gesamtdruck in hPa
 * @param temperatureK - Temperatur in K
 * @param waterVaporDensity - Wasserdampfdichte in g/m³ (Standard 0: beeinflusst nur Linienbreiten)
 */
export function calculateOxygenAttenuation(
  frequencyGHz: number,
  pressureHpa: number,
  temperatureK: number,
  waterVaporDensity: number = 0
): number {
  const e = waterVaporPartialPressure(waterVaporDensity, temperatureK);
  return oxygenSpecificAttenuation(frequencyGHz, pressureHpa - e, temperatureK, waterVaporDensity);
}

/**
 * Spezifische Dämpfung durch Wasserdampf in dB/km nach ITU-R P.676-13 Annex 1.
 *
 * @param frequencyGHz - Frequenz in GHz (1–1000 GHz)
 * @param pressureHpa - Barometrischer Gesamtdruck in hPa
 * @param waterVaporDensity - Wasserdampfdichte in g/m³
 * @param temperatureK - Temperatur in K
 */
export function calculateWaterVaporAttenuation(
  frequencyGHz: number,
  pressureHpa: number,
  waterVaporDensity: number,
  temperatureK: number
): number {
  const e = waterVaporPartialPressure(waterVaporDensity, temperatureK);
  return waterVaporSpecificAttenuation(frequencyGHz, pressureHpa - e, temperatureK, waterVaporDensity);
}

// ============================================================================
// ITU-R P.838-3: Regendämpfung
// ============================================================================

/** Gültigkeitsbereich von ITU-R P.838-3 in GHz */
export const RAIN_MODEL_MIN_FREQUENCY_GHZ = 1;
export const RAIN_MODEL_MAX_FREQUENCY_GHZ = 1000;

/**
 * Polarisationsneigungswinkel τ gegen die Horizontale (P.838-3 Gl. 4/5):
 * horizontal 0°, vertikal 90°, zirkular 45°.
 */
const POLARIZATION_TILT_DEG: Record<Polarization, number> = {
  horizontal: 0,
  vertical: 90,
  circular: 45
};

/**
 * ITU-R P.838-3 Koeffizienten (Tabellen 1–4) für k_H, k_V, α_H, α_V.
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

/** Summe der Gauß-Terme Σ aⱼ·exp(−((log f − bⱼ)/cⱼ)²) (P.838-3 Gl. 2/3) */
function gaussianSum(logF: number, aj: number[], bj: number[], cj: number[]): number {
  let sum = 0;
  for (let j = 0; j < aj.length; j++) {
    sum += aj[j] * Math.exp(-Math.pow((logF - bj[j]) / cj[j], 2));
  }
  return sum;
}

/**
 * Regenkoeffizienten k und α nach ITU-R P.838-3 Gl. (2)–(5).
 * Für lineare/zirkulare Polarisation und beliebige Elevation θ:
 *   k = [k_H + k_V + (k_H − k_V)·cos²θ·cos 2τ] / 2
 *   α = [k_H α_H + k_V α_V + (k_H α_H − k_V α_V)·cos²θ·cos 2τ] / (2k)
 *
 * @returns { k, alpha }; { k: 0, alpha: 0 } außerhalb des Gültigkeitsbereichs
 */
export function calculateRainCoefficients(
  frequencyGHz: number,
  polarization: Polarization,
  elevationAngleDeg: number = 0
): { k: number; alpha: number } {
  if (
    !Number.isFinite(frequencyGHz) ||
    frequencyGHz < RAIN_MODEL_MIN_FREQUENCY_GHZ ||
    frequencyGHz > RAIN_MODEL_MAX_FREQUENCY_GHZ
  ) {
    return { k: 0, alpha: 0 };
  }

  const logF = safeLog(frequencyGHz, 10, 0);
  const { kH: cKH, kV: cKV, alphaH: cAH, alphaV: cAV } = RAIN_COEFFICIENTS;

  const kH = Math.pow(10, gaussianSum(logF, cKH.aj, cKH.bj, cKH.cj) + cKH.mk * logF + cKH.ck);
  const kV = Math.pow(10, gaussianSum(logF, cKV.aj, cKV.bj, cKV.cj) + cKV.mk * logF + cKV.ck);
  const alphaH = gaussianSum(logF, cAH.aj, cAH.bj, cAH.cj) + cAH.ma * logF + cAH.ca;
  const alphaV = gaussianSum(logF, cAV.aj, cAV.bj, cAV.cj) + cAV.ma * logF + cAV.ca;

  const thetaRad = (elevationAngleDeg * Math.PI) / 180;
  const tauRad = ((POLARIZATION_TILT_DEG[polarization] ?? 0) * Math.PI) / 180;
  const weight = Math.pow(Math.cos(thetaRad), 2) * Math.cos(2 * tauRad); // cos²θ · cos 2τ

  const k = (kH + kV + (kH - kV) * weight) / 2;
  const alpha = safeDivide(kH * alphaH + kV * alphaV + (kH * alphaH - kV * alphaV) * weight, 2 * k, 0);

  return { k, alpha };
}

/**
 * Spezifische Regendämpfung γ_R = k·Rᵅ in dB/km (ITU-R P.838-3 Gl. 1).
 */
export function calculateRainAttenuation(
  frequencyGHz: number,
  rainRateMmH: number,
  polarization: Polarization = 'horizontal',
  elevationAngleDeg: number = 0
): number {
  if (!Number.isFinite(rainRateMmH) || rainRateMmH <= 0) return 0;
  if (frequencyGHz < RAIN_MODEL_MIN_FREQUENCY_GHZ) return 0;

  const { k, alpha } = calculateRainCoefficients(frequencyGHz, polarization, elevationAngleDeg);
  return k * Math.pow(rainRateMmH, alpha);
}

// ============================================================================
// ITU-R P.840: Nebel- und Wolkendämpfung
// ============================================================================

/**
 * Spezifischer Dämpfungskoeffizient K_l in (dB/km)/(g/m³) nach ITU-R P.840 (Double-Debye).
 */
export function calculateFogCoefficient(
  frequencyGHz: number,
  temperatureK: number
): number {
  if (!Number.isFinite(frequencyGHz) || frequencyGHz <= 0) return 0;
  if (!Number.isFinite(temperatureK) || temperatureK <= 0) return 0;

  const f = frequencyGHz;
  const theta = 300 / temperatureK;

  const epsilon0 = 77.66 + 103.3 * (theta - 1);
  const epsilon1 = 0.0671 * epsilon0;
  const epsilon2 = 3.52;

  const fp = 20.20 - 146.4 * (theta - 1) + 316 * Math.pow(theta - 1, 2);
  if (fp <= 0) return 0;
  const fs = 39.8 * fp;

  const epsilonPrimeReal =
    (epsilon0 - epsilon1) / (1 + Math.pow(f / fp, 2)) +
    (epsilon1 - epsilon2) / (1 + Math.pow(f / fs, 2)) +
    epsilon2;

  const epsilonPrimeImag =
    ((epsilon0 - epsilon1) * (f / fp)) / (1 + Math.pow(f / fp, 2)) +
    ((epsilon1 - epsilon2) * (f / fs)) / (1 + Math.pow(f / fs, 2));

  const eta = safeDivide(2 + epsilonPrimeReal, epsilonPrimeImag, 0);
  const Kl = safeDivide(0.819 * f, epsilonPrimeImag * (1 + eta * eta), 0);

  return Number.isFinite(Kl) ? Kl : 0;
}

/**
 * Spezifische Nebel-/Wolkendämpfung γ_c = K_l · M in dB/km (ITU-R P.840).
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
// Schneedämpfung
// ============================================================================

/**
 * Koeffizienten des Trockenschnee-Modells von Gunn & East (1954), zitiert in
 * Ippolito, Propagation Effects Handbook (NASA): γ = 0,00349·R^1,6/λ⁴ + 0,00224·R/λ
 * (λ in cm, R in mm/h Wasseräquivalent). Rayleigh-Näherung – oberhalb einiger 10 GHz
 * wird das Ergebnis durch die Regendämpfung gleicher Rate nach oben begrenzt.
 */
const DRY_SNOW_RAYLEIGH_COEFF = 0.00349;
const DRY_SNOW_RAYLEIGH_EXPONENT = 1.6;
const DRY_SNOW_ABSORPTION_COEFF = 0.00224;
/** Verhältnis Nassschnee-/Regendämpfung (P.530: ≈ 1, Oguchi: bis 2) */
const WET_SNOW_TO_RAIN_FACTOR = 1;
/** Lichtgeschwindigkeit in cm·GHz für λ[cm] = 29,979/f[GHz] */
const WAVELENGTH_CM_GHZ = 29.9792458;

/**
 * Spezifische Schneedämpfung in dB/km.
 * - Nassschnee (T ≥ 0 °C): wie Regen gleicher Wasseräquivalent-Rate (ITU-R P.530-18 §2.4.2, Oguchi 1983)
 * - Trockenschnee (T < 0 °C): Gunn & East (1954), begrenzt auf die Regendämpfung
 * Beide Zweige sind stetig in f.
 *
 * @param frequencyGHz - Frequenz in GHz
 * @param snowRateMmH - Schneerate in mm/h Wasseräquivalent
 * @param isWetSnow - true für Nassschnee (T ≥ 0 °C)
 */
export function calculateSnowAttenuation(
  frequencyGHz: number,
  snowRateMmH: number,
  isWetSnow: boolean = false
): number {
  if (!Number.isFinite(snowRateMmH) || snowRateMmH <= 0) return 0;
  if (frequencyGHz < RAIN_MODEL_MIN_FREQUENCY_GHZ) return 0;

  const rainEquivalent = calculateRainAttenuation(frequencyGHz, snowRateMmH, 'horizontal');
  if (isWetSnow) {
    return WET_SNOW_TO_RAIN_FACTOR * rainEquivalent;
  }

  const wavelengthCm = WAVELENGTH_CM_GHZ / frequencyGHz;
  const dry =
    (DRY_SNOW_RAYLEIGH_COEFF * Math.pow(snowRateMmH, DRY_SNOW_RAYLEIGH_EXPONENT)) / Math.pow(wavelengthCm, 4) +
    (DRY_SNOW_ABSORPTION_COEFF * snowRateMmH) / wavelengthCm;
  return Math.min(dry, rainEquivalent);
}

// ============================================================================
// Kombinierte Ergebnisse
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
 * Gasdämpfung (Sauerstoff + Wasserdampf) in dB/km für gegebene Bodenbedingungen.
 */
export function calculateAtmosphericAttenuation(
  frequencyGHz: number,
  conditions: AtmosphericConditions
): AttenuationResult {
  const { temperatureK, pressureHpa, waterVaporDensity } = conditions;
  return specificGasAttenuation(frequencyGHz, pressureHpa, temperatureK, waterVaporDensity);
}

/**
 * Alle Dämpfungsanteile (Gase + Niederschlag) in dB/km.
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

  const gas = specificGasAttenuation(frequencyGHz, pressureHpa, temperatureK, waterVaporDensity);
  const rain = calculateRainAttenuation(frequencyGHz, rainRateMmH, polarization, elevationAngleDeg);
  const fog = calculateFogAttenuation(frequencyGHz, fogDensityGM3, temperatureK);
  // Nassschnee bei T ≥ 0 °C (schmelzende Flocken), Trockenschnee darunter
  const snow = calculateSnowAttenuation(frequencyGHz, snowRateMmH, temperatureK >= WET_SNOW_THRESHOLD_K);

  const total = gas.total;
  const totalAll = total + rain + fog + snow;

  return {
    oxygen: gas.oxygen,
    waterVapor: gas.waterVapor,
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
 * Streckendämpfung (nur Gase) über eine terrestrische Distanz.
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
 * Streckendämpfung inkl. Niederschlag über eine terrestrische Distanz (γ · d).
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

/**
 * Dämpfung auf einem Erde-Raum-Schrägpfad (Satellitenlink).
 * - Gase: ITU-R P.676-13 Annex 2, A = (h_o·γ_o + h_w·γ_w)/sin θ
 * - Niederschlag (Regen/Nebel/Schnee): γ · L_s mit L_s = h_R / sin θ (h_R = Regenhöhe,
 *   ITU-R P.839; vereinfachte P.618-Schrägpfadlänge ohne horizontalen Reduktionsfaktor)
 * Die Gesamtdistanz zum Satelliten spielt keine Rolle – nur der troposphärische Anteil dämpft.
 *
 * @param frequencyGHz - Frequenz in GHz
 * @param conditions - Bodenbedingungen
 * @param elevationAngleDeg - Elevationswinkel θ in Grad (5°–90° empfohlen)
 */
export function calculateEarthSpaceAttenuation(
  frequencyGHz: number,
  conditions: AllConditions,
  elevationAngleDeg: number
): ExtendedPathAttenuationResult {
  const perKm = calculateAllAttenuation(frequencyGHz, { ...conditions, elevationAngleDeg });
  const gas = slantPathGasAttenuation(
    frequencyGHz,
    elevationAngleDeg,
    conditions.pressureHpa,
    conditions.temperatureK,
    conditions.waterVaporDensity
  );
  const sinEl = elevationAngleDeg > 0 && elevationAngleDeg <= 90 ? Math.sin((elevationAngleDeg * Math.PI) / 180) : 0;
  const precipitationPathKm = safeDivide(RAIN_HEIGHT_KM, sinEl, 0);

  const rainTotal = perKm.rain * precipitationPathKm;
  const fogTotal = perKm.fog * precipitationPathKm;
  const snowTotal = perKm.snow * precipitationPathKm;

  return {
    oxygenPerKm: perKm.oxygen,
    waterVaporPerKm: perKm.waterVapor,
    totalPerKm: perKm.total,
    oxygenTotal: gas.oxygen,
    waterVaporTotal: gas.waterVapor,
    totalDb: gas.total,
    rainPerKm: perKm.rain,
    fogPerKm: perKm.fog,
    snowPerKm: perKm.snow,
    rainTotal,
    fogTotal,
    snowTotal,
    totalAllPerKm: perKm.totalAll,
    totalAllDb: gas.total + rainTotal + fogTotal + snowTotal
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

/** Logarithmisch verteilte Stützfrequenzen in GHz */
function logSpacedFrequencies(minFreq: number, maxFreq: number, numPoints: number): number[] {
  const logMin = safeLog(minFreq, 10, 0);
  const logMax = safeLog(maxFreq, 10, 0);
  const frequencies: number[] = [];
  for (let i = 0; i <= numPoints; i++) {
    frequencies.push(Math.pow(10, logMin + (logMax - logMin) * (i / numPoints)));
  }
  return frequencies;
}

/**
 * Kurvendaten der Gasdämpfung für Diagramme.
 */
export function generateAttenuationCurve(
  conditions: AtmosphericConditions,
  minFreq: number = 1,
  maxFreq: number = 350,
  numPoints: number = 500
): CurveDataPoint[] {
  return logSpacedFrequencies(minFreq, maxFreq, numPoints).map((frequencyGHz) => ({
    frequencyGHz,
    ...calculateAtmosphericAttenuation(frequencyGHz, conditions)
  }));
}

/**
 * Kurvendaten inkl. Niederschlag für Diagramme.
 */
export function generateExtendedAttenuationCurve(
  conditions: AllConditions,
  minFreq: number = 1,
  maxFreq: number = 350,
  numPoints: number = 500
): ExtendedCurveDataPoint[] {
  return logSpacedFrequencies(minFreq, maxFreq, numPoints).map((frequencyGHz) => ({
    frequencyGHz,
    ...calculateAllAttenuation(frequencyGHz, conditions)
  }));
}

/**
 * Regendämpfungskurven für mehrere Regenraten.
 */
export function generateRainAttenuationCurves(
  rainRates: number[] = [2.5, 12.5, 25, 50, 100, 150],
  polarization: Polarization = 'horizontal',
  minFreq: number = 1,
  maxFreq: number = 100,
  numPoints: number = 200
): Map<number, { frequencyGHz: number; attenuation: number }[]> {
  const curves = new Map<number, { frequencyGHz: number; attenuation: number }[]>();
  const frequencies = logSpacedFrequencies(minFreq, maxFreq, numPoints);

  for (const rainRate of rainRates) {
    curves.set(
      rainRate,
      frequencies.map((frequencyGHz) => ({
        frequencyGHz,
        attenuation: calculateRainAttenuation(frequencyGHz, rainRate, polarization)
      }))
    );
  }

  return curves;
}

// ============================================================================
// Referenzdaten (Werte aus dem P.676-13-Modell bei 1013,25 hPa, 15 °C, 7,5 g/m³;
// konsistent mit ATMOSPHERIC_ABSORPTION_PEAKS in $lib/data/constants.ts)
// ============================================================================

export const ABSORPTION_PEAKS = {
  waterVapor: [
    { frequency: 22.235, description: 'Primary H2O resonance', typicalAttenuation: '0.15-0.2 dB/km' },
    { frequency: 183.31, description: 'Strong H2O resonance', typicalAttenuation: '25-30 dB/km' },
    { frequency: 325.15, description: 'H2O resonance', typicalAttenuation: '30-40 dB/km' },
    { frequency: 380.2, description: 'H2O resonance', typicalAttenuation: '> 100 dB/km' }
  ],
  oxygen: [
    { frequency: 60, description: 'O2 band (50-70 GHz complex)', typicalAttenuation: '10-15 dB/km' },
    { frequency: 118.75, description: 'O2 resonance', typicalAttenuation: '1.5-2 dB/km' },
    { frequency: 368.5, description: 'O2 resonance', typicalAttenuation: '1-2 dB/km' },
    { frequency: 424.76, description: 'O2 resonance', typicalAttenuation: '5-10 dB/km' }
  ],
  windows: [
    { frequency: 35, description: 'Ka-band window', typicalAttenuation: '0.08-0.12 dB/km' },
    { frequency: 94, description: 'W-band window', typicalAttenuation: '0.3-0.5 dB/km' },
    { frequency: 140, description: 'Window', typicalAttenuation: '0.8-1.2 dB/km' },
    { frequency: 220, description: 'Window', typicalAttenuation: '2-3 dB/km' }
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
