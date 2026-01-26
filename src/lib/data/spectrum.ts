/**
 * Elektromagnetisches Spektrum - Konstanten und Bereiche
 *
 * Diese Datei enthält zentralisierte Konstanten für die Darstellung
 * des elektromagnetischen Spektrums in der Anwendung.
 *
 * Quellen:
 * - ITU Radio Regulations
 * - IEEE Standard Letter Designations
 * - CODATA 2018 (Lichtgeschwindigkeit)
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
  violetWavelengthNm: 380,
} as const;

// ============================================================================
// EM-Spektrum-Bänder (für Visualisierung)
// ============================================================================

/**
 * Elektromagnetische Spektrumsbänder mit Frequenzgrenzen und Farben
 * für die Visualisierung in Charts
 */
export interface EMBand {
  id: string;
  name: string;
  nameDE: string;
  minHz: number;
  maxHz: number;
  color: string;
  description?: string;
}

/**
 * Standard-EM-Bänder für Spektrumsvisualisierungen
 */
export const EM_BANDS: EMBand[] = [
  {
    id: 'radio',
    name: 'Radio',
    nameDE: 'Radio',
    minHz: 3e3,
    maxHz: 3e8,
    color: '#3b82f6',
    description: 'ELF bis VHF',
  },
  {
    id: 'microwave',
    name: 'Microwave',
    nameDE: 'Mikrowelle',
    minHz: 3e8,
    maxHz: 3e11,
    color: '#22c55e',
    description: 'UHF bis EHF',
  },
  {
    id: 'infrared',
    name: 'Infrared',
    nameDE: 'Infrarot',
    minHz: 3e11,
    maxHz: 4e14,
    color: '#f97316',
    description: 'Fernes bis nahes IR',
  },
  {
    id: 'visible',
    name: 'Visible',
    nameDE: 'Sichtbar',
    minHz: 4e14,
    maxHz: 8e14,
    color: 'url(#visibleGradient)',
    description: 'Sichtbares Licht (380-780nm)',
  },
  {
    id: 'ultraviolet',
    name: 'Ultraviolet',
    nameDE: 'Ultraviolett',
    minHz: 8e14,
    maxHz: 3e16,
    color: '#a855f7',
    description: 'UV-A, UV-B, UV-C',
  },
  {
    id: 'xray',
    name: 'X-Ray',
    nameDE: 'Röntgen',
    minHz: 3e16,
    maxHz: 3e19,
    color: '#ec4899',
    description: 'Röntgenstrahlung',
  },
  {
    id: 'gamma',
    name: 'Gamma',
    nameDE: 'Gamma',
    minHz: 3e19,
    maxHz: 3e21,
    color: '#ef4444',
    description: 'Gammastrahlung',
  },
] as const;

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
    maxHz: 3e12,
  },
  /** Vollständiges EM-Spektrum: 3 Hz bis 3 ZHz */
  full: {
    minHz: 3,
    maxHz: 3e21,
  },
  /** Power/Frequency Chart: 100 kHz bis 100 GHz */
  powerChart: {
    minHz: 100e3,
    maxHz: 100e9,
  },
} as const;

/**
 * Standard-Leistungsbereiche für Power-Charts
 */
export const CHART_POWER_RANGES = {
  /** Standard: 1 mW bis 100 MW */
  standard: {
    minWatt: 1e-3,
    maxWatt: 1e8,
  },
} as const;

/**
 * Standard-Distanzbereiche für FSPL-Charts
 */
export const CHART_DISTANCE_RANGES = {
  /** FSPL-Chart: 1m bis 100km */
  fspl: {
    minM: 1,
    maxM: 100_000,
  },
} as const;

/**
 * Standard-FSPL-Bereiche für Charts
 */
export const CHART_FSPL_RANGES = {
  /** Standard: 20 dB bis 180 dB */
  standard: {
    minDb: 20,
    maxDb: 180,
  },
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

/**
 * Findet das EM-Band für eine gegebene Frequenz
 * @param frequencyHz Frequenz in Hertz
 * @returns Das passende EM-Band oder undefined
 */
export function getEMBandForFrequency(frequencyHz: number): EMBand | undefined {
  return EM_BANDS.find(band => frequencyHz >= band.minHz && frequencyHz < band.maxHz);
}

// ============================================================================
// Gruppierte Exporte
// ============================================================================

export const spectrumLimits = {
  min: SPECTRUM_MIN_HZ,
  maxRf: SPECTRUM_MAX_RF_HZ,
  maxVisible: SPECTRUM_MAX_VISIBLE_HZ,
  maxGamma: SPECTRUM_MAX_GAMMA_HZ,
} as const;

export const visibleLight = VISIBLE_LIGHT;
export const emBands = EM_BANDS;
