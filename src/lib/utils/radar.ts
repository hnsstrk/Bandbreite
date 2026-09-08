/**
 * Radar-Grundrechnungen (monostatisches Pulsradar).
 *
 * Quellen:
 * - Skolnik, Introduction to Radar Systems, 3. Aufl., Gl. (1.7) Radargleichung mit Systemverlusten,
 *   §2.x Doppler, §2.10 eindeutige Entfernung/Geschwindigkeit
 * - Skolnik, Radar Handbook, Kap. 1
 *
 * Alle Funktionen sind reine Funktionen ohne UI-Abhängigkeit (testbar).
 */
import { speedOfLight } from '$lib/stores/speedOfLight.svelte';
import { safeDivide, safeLog, safePow } from '$lib/utils/handlers';
import { dbmToWatt } from '$lib/utils/conversions';

/** Nenner-Vorfaktor der Radargleichung: (4π)³ */
const FOUR_PI_CUBED = Math.pow(4 * Math.PI, 3);

/** Gewinn/Verlust dB → linear */
function dbToLinear(db: number): number {
  return Math.pow(10, db / 10);
}

export interface RadarParameters {
  /** Spitzen-Sendeleistung Pₜ in W */
  txPowerW: number;
  /** Antennengewinn G in dBi (Sende- = Empfangsantenne) */
  antennaGainDbi: number;
  /** Wellenlänge λ in m */
  wavelengthM: number;
  /** Radarquerschnitt σ in m² */
  rcsM2: number;
  /** Systemverluste L in dB (≥ 0, typ. 3–10 dB; Standard 0) */
  systemLossDb?: number;
}

function isValid(p: RadarParameters): boolean {
  return p.txPowerW > 0 && p.wavelengthM > 0 && p.rcsM2 > 0 && Number.isFinite(p.antennaGainDbi);
}

/**
 * Zähler der Radargleichung: Pₜ · G² · λ² · σ
 */
function radarNumerator(p: RadarParameters): number {
  const gainLinear = dbToLinear(p.antennaGainDbi);
  return p.txPowerW * gainLinear * gainLinear * p.wavelengthM * p.wavelengthM * p.rcsM2;
}

/**
 * Maximale Radarreichweite (Skolnik Gl. 1.7):
 *   R_max = ⁴√( Pₜ·G²·λ²·σ / ((4π)³ · P_min · L) )
 *
 * @param params - Radarparameter
 * @param minDetectablePowerDbm - Minimal detektierbare Empfangsleistung in dBm
 * @returns Reichweite in m (0 bei ungültigen Eingaben)
 */
export function calculateRadarMaxRange(params: RadarParameters, minDetectablePowerDbm: number): number {
  if (!isValid(params) || !Number.isFinite(minDetectablePowerDbm)) return 0;
  const pMinW = dbmToWatt(minDetectablePowerDbm);
  const lossLinear = dbToLinear(params.systemLossDb ?? 0);
  const denominator = FOUR_PI_CUBED * pMinW * lossLinear;
  return safePow(safeDivide(radarNumerator(params), denominator, 0), 0.25, 0);
}

/**
 * Empfangsleistung bei gegebener Entfernung R (Radargleichung):
 *   P_r = Pₜ·G²·λ²·σ / ((4π)³ · R⁴ · L)
 *
 * @returns Empfangsleistung in dBm (−Infinity bei ungültigen Eingaben)
 */
export function calculateRadarReceivedPowerDbm(params: RadarParameters, rangeM: number): number {
  if (!isValid(params) || rangeM <= 0) return -Infinity;
  const lossLinear = dbToLinear(params.systemLossDb ?? 0);
  const denominator = FOUR_PI_CUBED * Math.pow(rangeM, 4) * lossLinear;
  const rxPowerW = safeDivide(radarNumerator(params), denominator, 0);
  if (rxPowerW <= 0) return -Infinity;
  return 10 * safeLog(rxPowerW * 1000, 10, -Infinity);
}

/**
 * Doppler-Verschiebung eines Radarechos: f_d = 2·v_r·f / c
 * (v_r = Radialgeschwindigkeit; positiv = Ziel nähert sich)
 *
 * @param radialVelocityMs - Radialgeschwindigkeit in m/s
 * @param frequencyHz - Sendefrequenz in Hz
 * @param c - Lichtgeschwindigkeit in m/s (Standard: Store-Wert)
 * @returns Doppler-Frequenz in Hz
 */
export function calculateDopplerShift(
  radialVelocityMs: number,
  frequencyHz: number,
  c: number = speedOfLight.value
): number {
  if (!Number.isFinite(radialVelocityMs) || frequencyHz <= 0) return 0;
  return safeDivide(2 * radialVelocityMs * frequencyHz, c, 0);
}

/**
 * Entfernungsauflösung eines Pulsradars: ΔR = c·τ / 2
 *
 * @param pulseWidthS - Pulsdauer τ in s
 * @returns Auflösung in m
 */
export function calculateRangeResolution(pulseWidthS: number, c: number = speedOfLight.value): number {
  if (pulseWidthS <= 0) return 0;
  return (c * pulseWidthS) / 2;
}

/**
 * Maximale eindeutige Entfernung: R_u = c / (2·PRF)
 *
 * @param prfHz - Pulswiederholfrequenz in Hz
 * @returns Entfernung in m
 */
export function calculateUnambiguousRange(prfHz: number, c: number = speedOfLight.value): number {
  if (prfHz <= 0) return 0;
  return safeDivide(c, 2 * prfHz, 0);
}

/**
 * Maximale eindeutige Radialgeschwindigkeit (±): v_u = λ·PRF / 4
 * (die erste Blindgeschwindigkeit liegt bei λ·PRF/2)
 *
 * @param prfHz - Pulswiederholfrequenz in Hz
 * @param wavelengthM - Wellenlänge in m
 * @returns Geschwindigkeit in m/s
 */
export function calculateUnambiguousVelocity(prfHz: number, wavelengthM: number): number {
  if (prfHz <= 0 || wavelengthM <= 0) return 0;
  return (wavelengthM * prfHz) / 4;
}

/**
 * Signallaufzeit hin und zurück: t = 2·R / c
 *
 * @param rangeM - Entfernung in m
 * @returns Laufzeit in s
 */
export function calculateRoundTripTime(rangeM: number, c: number = speedOfLight.value): number {
  if (rangeM <= 0) return 0;
  return safeDivide(2 * rangeM, c, 0);
}
