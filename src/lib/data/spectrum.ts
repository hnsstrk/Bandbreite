/**
 * Elektromagnetisches Spektrum - Konstanten und Bereiche
 *
 * Diese Datei enthält zentralisierte Konstanten für die Darstellung
 * des elektromagnetischen Spektrums in der Anwendung.
 *
 * Quellen:
 * - ITU Radio Regulations
 * - IEEE Standard Letter Designations
 * - SI-Definition der Lichtgeschwindigkeit (seit 1983 exakt 299 792 458 m/s,
 *   kein Messwert; siehe SPEED_OF_LIGHT in constants.ts)
 */

import { SPEED_OF_LIGHT } from './constants';

// ============================================================================
// Spektrum-Grenzen
// ============================================================================

/**
 * Minimale Frequenz des darstellbaren Spektrums (ELF)
 * Unit: Hz
 */
export const SPECTRUM_MIN_HZ = 3 as const;

/**
 * Maximale Frequenz für RF/Mikrowellen-Ansicht
 * Unit: Hz (3 THz)
 */
export const SPECTRUM_MAX_RF_HZ = 3e12 as const;

/**
 * Maximale Frequenz für Ansicht mit sichtbarem Licht
 * Unit: Hz (1 PHz)
 */
export const SPECTRUM_MAX_VISIBLE_HZ = 1e15 as const;

/**
 * Maximale Frequenz für vollständiges EM-Spektrum (Gamma)
 * Unit: Hz (30 EHz)
 */
export const SPECTRUM_MAX_GAMMA_HZ = 3e19 as const;

// ============================================================================
// Sichtbares Licht
// ============================================================================

/**
 * Sichtbares Licht - Frequenzbereich
 * Wellenlänge: 380-780 nm
 * Berechnung: f = c / lambda
 */
export const VISIBLE_LIGHT = {
  /** Rotes Licht (~780nm) */
  minHz: 384e12,
  /** Violettes Licht (~380nm) */
  maxHz: 789e12,
  /** Rote Wellenlänge in nm */
  redWavelengthNm: 780,
  /** Violette Wellenlänge in nm */
  violetWavelengthNm: 380
} as const;

// ============================================================================
// Chart-Bereiche (für D3-Visualisierungen)
// ============================================================================

/**
 * Standard-Frequenzbereiche für verschiedene Chart-Ansichten
 */
export const CHART_FREQUENCY_RANGES = {
  /** Technische RF-Ansicht: 3 kHz bis 3 THz */
  technical: {
    minHz: 3e3,
    maxHz: 3e12
  },
  /** Vollständiges EM-Spektrum: 3 Hz bis 3 ZHz */
  full: {
    minHz: 3,
    maxHz: 3e21
  },
  /** Power/Frequency Chart: 100 kHz bis 100 GHz */
  powerChart: {
    minHz: 100e3,
    maxHz: 100e9
  }
} as const;

/**
 * Standard-Leistungsbereiche für Power-Charts
 */
export const CHART_POWER_RANGES = {
  /** Standard: 1 mW bis 100 MW */
  standard: {
    minWatt: 1e-3,
    maxWatt: 1e8
  }
} as const;

/**
 * Standard-Distanzbereiche für FSPL-Charts
 */
export const CHART_DISTANCE_RANGES = {
  /** FSPL-Chart: 1m bis 100km */
  fspl: {
    minM: 1,
    maxM: 100_000
  }
} as const;

/**
 * Standard-FSPL-Bereiche für Charts
 */
export const CHART_FSPL_RANGES = {
  /** Standard: 20 dB bis 180 dB */
  standard: {
    minDb: 20,
    maxDb: 180
  }
} as const;

// ============================================================================
// Hilfsfunktionen
// ============================================================================

/**
 * Berechnet die Wellenlänge für eine gegebene Frequenz
 * @param frequencyHz Frequenz in Hertz
 * @returns Wellenlänge in Metern
 */
export function frequencyToWavelengthSpectrum(frequencyHz: number): number {
  if (frequencyHz <= 0) return 0;
  return SPEED_OF_LIGHT / frequencyHz;
}

/**
 * Berechnet die Frequenz für eine gegebene Wellenlänge
 * @param wavelengthM Wellenlänge in Metern
 * @returns Frequenz in Hertz
 */
export function wavelengthToFrequencySpectrum(wavelengthM: number): number {
  if (wavelengthM <= 0) return 0;
  return SPEED_OF_LIGHT / wavelengthM;
}

// ============================================================================
// Gruppierte Exporte
// ============================================================================

export const spectrumLimits = {
  min: SPECTRUM_MIN_HZ,
  maxRf: SPECTRUM_MAX_RF_HZ,
  maxVisible: SPECTRUM_MAX_VISIBLE_HZ,
  maxGamma: SPECTRUM_MAX_GAMMA_HZ
} as const;

export const visibleLight = VISIBLE_LIGHT;
