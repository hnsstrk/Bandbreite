/**
 * Zentrale HF-Grundrechnungen: Wellenlänge, FSPL, Reichweite, Skin-Tiefe, Fresnel-Zone,
 * Shannon-Kapazität und thermisches Rauschen.
 *
 * Die Lichtgeschwindigkeit kommt standardmäßig aus dem umschaltbaren Store
 * (exakt/gerundet); jede Funktion akzeptiert optional einen expliziten Wert `c`,
 * damit es genau EINE Implementierung von λ = c/f gibt.
 */
import { speedOfLight } from '$lib/stores/speedOfLight.svelte';
import {
  VACUUM_PERMEABILITY,
  VACUUM_PERMITTIVITY,
  BOLTZMANN_CONSTANT,
  REFERENCE_TEMPERATURE,
  GOOD_CONDUCTOR_LOSS_TANGENT_MIN,
  SEAWATER_CONDUCTIVITY
} from '$lib/data/constants';
import { safeDivide, safeLog } from '$lib/utils/handlers';

/** Empfohlene Freihaltung der 1. Fresnel-Zone (ITU-R P.530: ≥ 60 % des Radius) */
export const FRESNEL_CLEARANCE_FRACTION = 0.6;

/**
 * Convert frequency (Hz) to wavelength (m)
 * Formula: λ = c / f
 *
 * @param frequencyHz - Frequenz in Hz
 * @param c - Lichtgeschwindigkeit in m/s (Standard: aktueller Store-Wert)
 */
export function frequencyToWavelength(frequencyHz: number, c: number = speedOfLight.value): number {
  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return 0;
  return c / frequencyHz;
}

/**
 * Convert wavelength (m) to frequency (Hz)
 * Formula: f = c / λ
 *
 * @param wavelengthM - Wellenlänge in m
 * @param c - Lichtgeschwindigkeit in m/s (Standard: aktueller Store-Wert)
 */
export function wavelengthToFrequency(wavelengthM: number, c: number = speedOfLight.value): number {
  if (!Number.isFinite(wavelengthM) || wavelengthM <= 0) return 0;
  return c / wavelengthM;
}

/**
 * Calculate the FSPL constant based on current speed of light setting.
 * FSPL constant: 20·log₁₀(4π/c) ≈ −147,552 dB (Hz, m)
 */
export function getFsplConstant(c: number = speedOfLight.value): number {
  return 20 * safeLog((4 * Math.PI) / c, 10, 0);
}

/**
 * Calculate Free Space Path Loss in dB
 * FSPL(dB) = 20·log₁₀(d) + 20·log₁₀(f) + 20·log₁₀(4π/c)
 *
 * @param distanceM - Distance in meters
 * @param frequencyHz - Frequency in Hz
 * @returns FSPL in dB
 */
export function calculateFSPL(distanceM: number, frequencyHz: number): number {
  if (distanceM <= 0 || frequencyHz <= 0) return 0;
  return 20 * safeLog(distanceM) + 20 * safeLog(frequencyHz) + getFsplConstant();
}

/**
 * Calculate theoretical free-space range given TX power and RX sensitivity
 * Rearranged FSPL formula: d = 10^((txPower − rxSensitivity − 20·log₁₀(f) − K) / 20)
 *
 * @param frequencyHz - Frequency in Hz
 * @param txPowerDbm - Transmit power in dBm
 * @param rxSensitivityDbm - Receiver sensitivity in dBm (typically negative)
 * @returns Range in meters
 */
export function calculateRange(frequencyHz: number, txPowerDbm: number, rxSensitivityDbm: number): number {
  if (frequencyHz <= 0) return 0;
  const maxPathLoss = txPowerDbm - rxSensitivityDbm;
  const exponent = (maxPathLoss - 20 * safeLog(frequencyHz) - getFsplConstant()) / 20;
  return Math.pow(10, exponent);
}

// ============================================================================
// Skin-Tiefe (Eindringtiefe)
// ============================================================================

/**
 * Skin-Tiefe für gute Leiter: δ = √(2 / (ω·μ₀·σ))
 * Gültig für σ ≫ ω·ε (siehe calculateLossTangent / calculateSkinDepthWithValidity).
 *
 * @param frequencyHz - Frequenz in Hz
 * @param conductivity - Leitfähigkeit σ in S/m (Standard: Seewasser 4 S/m)
 * @returns Skin-Tiefe in Metern (0 bei ungültigen Eingaben)
 * Quelle: Pozar, Microwave Engineering, Gl. (1.60)
 */
export function calculateSkinDepth(frequencyHz: number, conductivity: number = SEAWATER_CONDUCTIVITY): number {
  if (frequencyHz <= 0 || conductivity <= 0) return 0;
  const omega = 2 * Math.PI * frequencyHz;
  return Math.sqrt(safeDivide(2, omega * VACUUM_PERMEABILITY * conductivity, 0));
}

/**
 * Verlusttangens tan δ = σ / (ω·ε₀·εᵣ) – Verhältnis Leitungs- zu Verschiebungsstrom.
 *
 * @param frequencyHz - Frequenz in Hz
 * @param conductivity - Leitfähigkeit σ in S/m
 * @param relativePermittivity - εᵣ des Mediums (Standard: 1)
 */
export function calculateLossTangent(
  frequencyHz: number,
  conductivity: number,
  relativePermittivity: number = 1
): number {
  if (frequencyHz <= 0 || conductivity <= 0 || relativePermittivity <= 0) return 0;
  const omega = 2 * Math.PI * frequencyHz;
  return safeDivide(conductivity, omega * VACUUM_PERMITTIVITY * relativePermittivity, 0);
}

export interface SkinDepthResult {
  /** Skin-Tiefe nach der Guter-Leiter-Näherung in m */
  depthM: number;
  /** Verlusttangens σ/(ωε) */
  lossTangent: number;
  /** true, wenn σ/(ωε) ≥ GOOD_CONDUCTOR_LOSS_TANGENT_MIN (Formel gültig) */
  isGoodConductor: boolean;
}

/**
 * Skin-Tiefe inklusive Gültigkeitsprüfung der Guter-Leiter-Näherung.
 * Für tan δ < 10 (z. B. trockene Erde ab ~1 MHz) ist δ = √(2/(ωμσ)) nicht mehr gültig;
 * das Ergebnis wird dann mit `isGoodConductor = false` gekennzeichnet.
 *
 * Quelle: Pozar, Microwave Engineering, §1.4
 */
export function calculateSkinDepthWithValidity(
  frequencyHz: number,
  conductivity: number,
  relativePermittivity: number = 1
): SkinDepthResult {
  const depthM = calculateSkinDepth(frequencyHz, conductivity);
  const lossTangent = calculateLossTangent(frequencyHz, conductivity, relativePermittivity);
  return {
    depthM,
    lossTangent,
    isGoodConductor: depthM > 0 && lossTangent >= GOOD_CONDUCTOR_LOSS_TANGENT_MIN
  };
}

// ============================================================================
// Fresnel-Zone
// ============================================================================

/**
 * Radius der n-ten Fresnel-Zone: rₙ = √(n·λ·d₁·d₂ / (d₁ + d₂))
 *
 * @param wavelengthM - Wellenlänge in m
 * @param d1M - Abstand Sender → Punkt in m
 * @param d2M - Abstand Punkt → Empfänger in m
 * @param n - Zonenindex (Standard: 1)
 * @returns Radius in m (0 bei ungültigen Eingaben)
 * Quelle: ITU-R P.530, Meinke/Gundlach
 */
export function calculateFresnelRadius(wavelengthM: number, d1M: number, d2M: number, n: number = 1): number {
  if (wavelengthM <= 0 || d1M <= 0 || d2M <= 0 || n <= 0) return 0;
  return Math.sqrt(safeDivide(n * wavelengthM * d1M * d2M, d1M + d2M, 0));
}

// ============================================================================
// Shannon-Hartley
// ============================================================================

/**
 * SNR von dB in linear: 10^(SNR_dB/10)
 */
export function snrDbToLinear(snrDb: number): number {
  if (!Number.isFinite(snrDb)) return 0;
  return Math.pow(10, snrDb / 10);
}

/**
 * Kanalkapazität nach Shannon-Hartley: C = B · log₂(1 + SNR_linear)
 *
 * @param bandwidthHz - Bandbreite in Hz
 * @param snrDb - Signal-Rausch-Verhältnis in dB
 * @returns Kapazität in bit/s
 */
export function calculateShannonCapacity(bandwidthHz: number, snrDb: number): number {
  if (bandwidthHz <= 0 || !Number.isFinite(snrDb)) return 0;
  return bandwidthHz * safeLog(1 + snrDbToLinear(snrDb), 2, 0);
}

/**
 * Spektrale Effizienz nach Shannon: log₂(1 + SNR_linear) in bit/s/Hz
 */
export function calculateSpectralEfficiency(snrDb: number): number {
  return safeLog(1 + snrDbToLinear(snrDb), 2, 0);
}

// ============================================================================
// Thermisches Rauschen
// ============================================================================

/**
 * Thermische Rauschleistung N = k·T·B in dBm.
 * Für T = 290 K, B = 1 Hz ergibt sich −173,98 dBm/Hz.
 *
 * @param bandwidthHz - Bandbreite in Hz
 * @param temperatureK - Rauschtemperatur in K (Standard: 290 K)
 */
export function calculateThermalNoiseDbm(bandwidthHz: number, temperatureK: number = REFERENCE_TEMPERATURE): number {
  if (bandwidthHz <= 0 || temperatureK <= 0) return -Infinity;
  const noiseWatts = BOLTZMANN_CONSTANT * temperatureK * bandwidthHz;
  return 10 * safeLog(noiseWatts * 1000, 10, -Infinity);
}
