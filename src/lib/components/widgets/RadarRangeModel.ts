/**
 * Rechenmodell des Widgets „Radargleichung interaktiv".
 *
 * Gerechnet wird ausschließlich mit den Funktionen aus `$lib/utils/radar`
 * (Radargleichung nach Skolnik, Introduction to Radar Systems, 3. Aufl.,
 * Gl. 1.7); hier werden nur Kurvenpunkte gebildet und die Wirkung der vierten
 * Wurzel als Kennzahl aufbereitet.
 */
import { frequencyToWavelength } from '$lib/utils/calculations';
import {
  calculateRadarMaxRange,
  calculateRadarReceivedPowerDbm,
  type RadarParameters
} from '$lib/utils/radar';
import { safeDivide } from '$lib/utils/handlers';

/** Reglerbereiche; Voreinstellung ist ein Flugsicherungs-Rundsuchradar. */
export const RADAR_RANGE_LIMITS = {
  txPowerW: { min: 1e3, max: 5e6, default: 1e6 },
  antennaGainDbi: { min: 20, max: 45, default: 33 },
  rcsM2: { min: 0.01, max: 100, default: 1 },
  minPowerDbm: { min: -130, max: -80, default: -110 }
} as const;

/**
 * Sendefrequenz der Darstellung: 2,8 GHz (S-Band nach IEEE Std 521), das
 * klassische Band des Rundsuchradars der Flugsicherung.
 */
export const RADAR_RANGE_FREQUENCY_HZ = 2.8e9;

/** Systemverluste L in dB — Skolnik nennt 3 bis 10 dB als üblichen Bereich. */
export const RADAR_RANGE_LOSS_DB = 6;

/** Exponent der Reichweite in der Radargleichung: R ∝ (…)^(1/4). */
export const RADAR_RANGE_EXPONENT = 0.25;

/** Faktor der Sendeleistung für doppelte Reichweite: 2⁴ = 16. */
export const RADAR_RANGE_DOUBLING_FACTOR = 16;

export interface RadarRangeInput {
  txPowerW: number;
  antennaGainDbi: number;
  rcsM2: number;
  minPowerDbm: number;
  frequencyHz?: number;
  systemLossDb?: number;
}

export interface RadarRangePoint {
  txPowerW: number;
  rangeM: number;
}

export interface RadarRangeResult {
  wavelengthM: number;
  /** Maximale Reichweite R_max in m */
  rangeM: number;
  /** Sendeleistung für die doppelte Reichweite in W (16-fach) */
  powerForDoubleRangeW: number;
  /** Empfangsleistung bei R_max in dBm — muss P_min entsprechen */
  receivedAtMaxDbm: number;
  /** Empfangsleistung auf halber Strecke in dBm (12 dB mehr) */
  receivedAtHalfDbm: number;
}

/** Radarparameter für `$lib/utils/radar` aus den Reglerwerten. */
export function radarParameters(input: RadarRangeInput): RadarParameters {
  return {
    txPowerW: input.txPowerW,
    antennaGainDbi: input.antennaGainDbi,
    wavelengthM: frequencyToWavelength(input.frequencyHz ?? RADAR_RANGE_FREQUENCY_HZ),
    rcsM2: input.rcsM2,
    systemLossDb: input.systemLossDb ?? RADAR_RANGE_LOSS_DB
  };
}

/** Reichweite, Kennzahlen und Probe der Leistungsbilanz. */
export function computeRadarRange(input: RadarRangeInput): RadarRangeResult {
  const params = radarParameters(input);
  const rangeM = calculateRadarMaxRange(params, input.minPowerDbm);
  return {
    wavelengthM: params.wavelengthM,
    rangeM,
    powerForDoubleRangeW: input.txPowerW * RADAR_RANGE_DOUBLING_FACTOR,
    receivedAtMaxDbm: calculateRadarReceivedPowerDbm(params, rangeM),
    receivedAtHalfDbm: calculateRadarReceivedPowerDbm(params, rangeM / 2)
  };
}

/**
 * Wie stark wächst die Reichweite, wenn sich ein Zählerglied der
 * Radargleichung um `factor` ändert? R ∝ factor^(1/4).
 */
export function rangeScaling(factor: number): number {
  if (!(factor > 0)) return 0;
  return Math.pow(factor, RADAR_RANGE_EXPONENT);
}

/**
 * Kurve R_max über der Sendeleistung, logarithmisch gestützt.
 * Sie zeigt die flache vierte Wurzel: eine Dekade Leistung bringt nur den
 * Faktor 10^0,25 ≈ 1,78 an Reichweite.
 */
export function radarRangeCurve(
  input: RadarRangeInput,
  points: number = 60,
  minPowerW: number = RADAR_RANGE_LIMITS.txPowerW.min,
  maxPowerW: number = RADAR_RANGE_LIMITS.txPowerW.max
): RadarRangePoint[] {
  if (points < 2 || !(minPowerW > 0) || !(maxPowerW > minPowerW)) return [];
  const logMin = Math.log10(minPowerW);
  const logMax = Math.log10(maxPowerW);
  const curve: RadarRangePoint[] = [];
  for (let i = 0; i < points; i++) {
    const txPowerW = Math.pow(10, logMin + ((logMax - logMin) * i) / (points - 1));
    curve.push({
      txPowerW,
      rangeM: calculateRadarMaxRange(radarParameters({ ...input, txPowerW }), input.minPowerDbm)
    });
  }
  return curve;
}

/** Anteil einer Leistung an der Reglerspanne, logarithmisch (0 … 1). */
export function powerFraction(
  txPowerW: number,
  minPowerW: number = RADAR_RANGE_LIMITS.txPowerW.min,
  maxPowerW: number = RADAR_RANGE_LIMITS.txPowerW.max
): number {
  if (!(txPowerW > 0) || !(minPowerW > 0) || !(maxPowerW > minPowerW)) return 0;
  return safeDivide(
    Math.log10(txPowerW) - Math.log10(minPowerW),
    Math.log10(maxPowerW) - Math.log10(minPowerW),
    0
  );
}
