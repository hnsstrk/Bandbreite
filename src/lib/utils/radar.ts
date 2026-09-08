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
export function calculateRadarMaxRange(
  params: RadarParameters,
  minDetectablePowerDbm: number
): number {
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
export function calculateRangeResolution(
  pulseWidthS: number,
  c: number = speedOfLight.value
): number {
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

/**
 * Entfernungsauflösung eines bandbreitenbegrenzten Radars: ΔR = c / (2·B)
 *
 * Gilt für FMCW-Radare und für Pulskompression gleichermaßen: Nicht die
 * Sendedauer, sondern die belegte Bandbreite bestimmt die Auflösung.
 * (Skolnik, Introduction to Radar Systems, 3. Aufl., §6.5 „Pulse compression")
 *
 * @param bandwidthHz - Signalbandbreite B in Hz
 * @returns Auflösung in m (0 bei ungültigen Eingaben)
 */
export function calculateBandwidthRangeResolution(
  bandwidthHz: number,
  c: number = speedOfLight.value
): number {
  if (bandwidthHz <= 0) return 0;
  return safeDivide(c, 2 * bandwidthHz, 0);
}

/**
 * Beat-Frequenz eines FMCW-Radars mit linearer Frequenzrampe:
 *   f_b = 2·R·B / (c·T)   (Rampensteilheit S = B/T, f_b = S·τ, τ = 2R/c)
 *
 * (Skolnik, Introduction to Radar Systems, 3. Aufl., §3.3 „FM-CW radar")
 *
 * @param rangeM - Zielentfernung in m
 * @param bandwidthHz - Hub der Rampe B in Hz
 * @param rampDurationS - Dauer der Rampe T in s
 * @returns Beat-Frequenz in Hz (0 bei ungültigen Eingaben)
 */
export function calculateBeatFrequency(
  rangeM: number,
  bandwidthHz: number,
  rampDurationS: number,
  c: number = speedOfLight.value
): number {
  if (rangeM <= 0 || bandwidthHz <= 0 || rampDurationS <= 0) return 0;
  const slopeHzPerS = safeDivide(bandwidthHz, rampDurationS, 0);
  return slopeHzPerS * calculateRoundTripTime(rangeM, c);
}

/**
 * n-te Blindgeschwindigkeit eines MTI-Radars: v_b = n·λ·PRF / 2
 *
 * Bei diesen Radialgeschwindigkeiten dreht sich die Phase von Impuls zu
 * Impuls um ein Vielfaches von 2π; der MTI-Filter hält das Ziel für stehend.
 * (Skolnik, Introduction to Radar Systems, 3. Aufl., §3.2 „Delay-line canceler")
 *
 * @param order - Ordnung n (1, 2, 3 …)
 * @param wavelengthM - Wellenlänge λ in m
 * @param prfHz - Pulswiederholfrequenz in Hz
 * @returns Blindgeschwindigkeit in m/s (0 bei ungültigen Eingaben)
 */
export function calculateBlindSpeed(order: number, wavelengthM: number, prfHz: number): number {
  if (order <= 0 || wavelengthM <= 0 || prfHz <= 0) return 0;
  return (order * wavelengthM * prfHz) / 2;
}

/**
 * Kompressionsgewinn (Zeit-Bandbreite-Produkt) eines Chirp-Radars: G_c = B·τ
 *
 * Ein Impuls der Dauer τ mit dem Frequenzhub B wird im Empfänger auf etwa
 * 1/B verkürzt; das Signal-Rausch-Verhältnis steigt um denselben Faktor.
 * (Skolnik, Introduction to Radar Systems, 3. Aufl., §6.5)
 *
 * @param bandwidthHz - Chirp-Bandbreite B in Hz
 * @param pulseWidthS - Sendeimpulsdauer τ in s
 * @returns Kompressionsgewinn als linearer Faktor (0 bei ungültigen Eingaben)
 */
export function calculateCompressionGain(bandwidthHz: number, pulseWidthS: number): number {
  if (bandwidthHz <= 0 || pulseWidthS <= 0) return 0;
  return bandwidthHz * pulseWidthS;
}

/** Größte geprüfte Ordnung bei der Suche nach der gemeinsamen Blindgeschwindigkeit. */
export const MAX_BLIND_SPEED_ORDER = 200;

/**
 * Erste gemeinsame Blindgeschwindigkeit zweier gestaffelter PRFs
 * („staggered PRF"): Gesucht ist das kleinste n mit n·PRF₁ = m·PRF₂ (m ganz).
 * Erst dort liegt wieder eine echte Lücke im Geschwindigkeitsbereich —
 * die Staffelung schiebt die erste Blindgeschwindigkeit also weit nach oben.
 * (Skolnik, Introduction to Radar Systems, 3. Aufl., §3.3 „Staggered PRF")
 *
 * @param prf1Hz - erste Pulswiederholfrequenz in Hz
 * @param prf2Hz - zweite Pulswiederholfrequenz in Hz
 * @param wavelengthM - Wellenlänge λ in m
 * @param maxOrder - höchste geprüfte Ordnung
 * @returns Geschwindigkeit in m/s, 0 wenn bis `maxOrder` keine gefunden wird
 */
export function calculateStaggeredBlindSpeed(
  prf1Hz: number,
  prf2Hz: number,
  wavelengthM: number,
  maxOrder: number = MAX_BLIND_SPEED_ORDER
): number {
  if (prf1Hz <= 0 || prf2Hz <= 0 || wavelengthM <= 0) return 0;
  const ratio = safeDivide(prf1Hz, prf2Hz, 0);
  if (ratio <= 0) return 0;
  for (let n = 1; n <= maxOrder; n++) {
    const m = n * ratio;
    if (Math.abs(m - Math.round(m)) < 1e-9 && Math.round(m) >= 1) {
      return calculateBlindSpeed(n, wavelengthM, prf1Hz);
    }
  }
  return 0;
}
