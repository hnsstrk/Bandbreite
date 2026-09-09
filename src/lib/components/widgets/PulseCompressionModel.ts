/**
 * Rechenmodell des Widgets „Pulskompression".
 *
 * Ein langer Sendeimpuls der Dauer τ bekommt einen linearen Frequenzanstieg
 * (Chirp) über die Bandbreite B. Das angepasste Filter im Empfänger schiebt
 * ihn auf etwa 1/B zusammen; Gewinn und Auflösung folgen dem
 * Zeit-Bandbreite-Produkt.
 *
 * Quelle: Skolnik, Introduction to Radar Systems, 3. Aufl., §6.5
 * „Pulse compression" — Kompressionsgewinn B·τ, komprimierte Dauer ≈ 1/B,
 * erster Nebenzipfel eines ungewichteten Chirps −13,2 dB (genauer −13,26 dB).
 */
import {
  calculateBandwidthRangeResolution,
  calculateCompressionGain,
  calculateRangeResolution
} from '$lib/utils/radar';
import { safeDivide, safeLog } from '$lib/utils/handlers';

/** Reglerbereiche (Werte eines Weitbereichsradars). */
export const PULSE_COMPRESSION_LIMITS = {
  bandwidthHz: { min: 0.1e6, max: 20e6, default: 1e6 },
  pulseWidthS: { min: 5e-6, max: 200e-6, default: 100e-6 }
} as const;

/**
 * Erster Nebenzipfel des ungewichteten Chirps in dB. Skolnik (§6.5) nennt
 * −13,2 dB; der genaue Wert des Maximums der si-Funktion ist −13,26 dB.
 */
export const FIRST_SIDELOBE_DB = -13.26;

/** Lage des ersten Nebenzipfels in Vielfachen von 1/B. */
export const FIRST_SIDELOBE_AT = 1.4303;

export interface PulseCompressionResult {
  /** Kompressionsgewinn G_c = B·τ (linear) */
  gain: number;
  /** Kompressionsgewinn in dB */
  gainDb: number;
  /** Dauer des komprimierten Impulses ≈ 1/B in s */
  compressedS: number;
  /** Entfernungsauflösung des ungenutzten Impulses ΔR = c·τ/2 in m */
  rawResolutionM: number;
  /** Entfernungsauflösung nach der Kompression ΔR = c/(2·B) in m */
  compressedResolutionM: number;
  /** Anteil der komprimierten Dauer an der Sendedauer (0 … 1) */
  compressedFraction: number;
}

export function computePulseCompression(
  bandwidthHz: number,
  pulseWidthS: number
): PulseCompressionResult {
  const gain = calculateCompressionGain(bandwidthHz, pulseWidthS);
  const compressedS = bandwidthHz > 0 ? safeDivide(1, bandwidthHz, 0) : 0;
  return {
    gain,
    gainDb: gain > 0 ? 10 * safeLog(gain, 10, 0) : 0,
    compressedS,
    rawResolutionM: calculateRangeResolution(pulseWidthS),
    compressedResolutionM: calculateBandwidthRangeResolution(bandwidthHz),
    compressedFraction: Math.min(1, safeDivide(compressedS, pulseWidthS, 0))
  };
}

/**
 * Amplitude am Ausgang des angepassten Filters, normiert auf 1.
 * Für einen linearen Chirp ist sie näherungsweise eine si-Funktion:
 *   a(u) = sin(π·u)/(π·u),  u = t·B (Zeit in Vielfachen von 1/B).
 */
export function matchedFilterAmplitude(u: number): number {
  if (u === 0) return 1;
  const x = Math.PI * u;
  return safeDivide(Math.sin(x), x, 0);
}

/** Filterausgang in dB (auf das Maximum bezogen); unterhalb `floorDb` gekappt. */
export function matchedFilterDb(u: number, floorDb: number = -40): number {
  const amplitude = Math.abs(matchedFilterAmplitude(u));
  if (amplitude <= 0) return floorDb;
  return Math.max(floorDb, 20 * safeLog(amplitude, 10, floorDb));
}

/**
 * Momentanwert des Chirps für die schematische Zeichnung.
 * `u` läuft von 0 bis 1 über die Sendedauer; die Zahl der gezeichneten
 * Schwingungen wächst linear von `cyclesStart` auf `cyclesEnd`.
 * Die Phase ist das Integral der Momentanfrequenz:
 *   φ(u) = 2π·(c₀·u + (c₁ − c₀)/2 · u²)
 */
export function chirpSample(u: number, cyclesStart: number, cyclesEnd: number): number {
  const phase = 2 * Math.PI * (cyclesStart * u + ((cyclesEnd - cyclesStart) / 2) * u * u);
  return Math.cos(phase);
}

/** Momentanfrequenz des Chirps als Anteil der Bandbreite (0 … 1). */
export function chirpFrequencyFraction(u: number): number {
  return Math.min(1, Math.max(0, u));
}
