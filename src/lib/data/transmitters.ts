/**
 * Database of known radio transmitters
 *
 * This file contains data about significant radio transmitters including:
 * - Time signal stations (DCF77, MSF, WWVB)
 * - Broadcasting stations
 * - Navigation beacons
 * - Amateur radio repeaters
 *
 * NOTE: Data is for educational purposes. Actual frequencies and parameters
 * may vary. Always check current official sources.
 */

import transmitterData from './transmitters.json';

/**
 * Transmitter type classification
 */
export type TransmitterType =
  | 'time_signal' // Zeitzeichensender
  | 'broadcast_lw' // Langwellen-Rundfunk
  | 'broadcast_mw' // Mittelwellen-Rundfunk
  | 'broadcast_sw' // Kurzwellen-Rundfunk
  | 'broadcast_fm' // UKW-Rundfunk
  | 'navigation' // Navigationssender
  | 'amateur' // Amateurfunk-Relais
  | 'utility'; // Utility-Stationen, Forschungs- und Militäranlagen

/**
 * Feinere Einordnung innerhalb eines TransmitterType.
 *
 * Hinweis (Bericht 04, Befund 54): Die Union `TransmitterType` selbst kennt
 * keine Kategorien für Radar, Satellitensignale, Radioastronomie oder
 * militärische Längstwellensender. Eine Erweiterung der Union würde die
 * `Record<TransmitterType, ...>`-Tabellen in den Anzeigekomponenten brechen,
 * deshalb wird die Zusatzinformation hier additiv als optionales Feld geführt.
 */
export type TransmitterSubtype =
  | 'military_vlf' // militärische Längstwellensender
  | 'radar' // Radaranlagen
  | 'gnss' // Satellitennavigationssignale
  | 'deep_space' // Boden-Weltraum-Verbindungen
  | 'research'; // Forschungs- und Empfangsanlagen

/**
 * Art der angegebenen Leistung.
 * Klärt die Mehrdeutigkeit des Feldes `powerWatts` (Bericht 04, Befund 45):
 * - 'tx'   Senderausgangsleistung
 * - 'erp'  effektive Strahlungsleistung (Bezug Halbwellendipol)
 * - 'eirp' äquivalente isotrope Strahlungsleistung
 */
export type PowerType = 'tx' | 'erp' | 'eirp';

/**
 * Transmitter status
 */
export type TransmitterStatus = 'active' | 'inactive' | 'unknown';

/**
 * Transmitter definition
 */
export interface Transmitter {
  id: string;
  name: string;
  nameDE: string;
  type: TransmitterType;
  frequencyHz: number;
  frequencyHzSecondary?: number;
  powerWatts?: number;
  /** Art der in powerWatts angegebenen Leistung */
  powerType?: PowerType;
  /** Feinere Einordnung, sofern TransmitterType zu grob ist */
  subtype?: TransmitterSubtype;
  location: {
    name: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  status: TransmitterStatus;
  description: string;
  descriptionDE: string;
  coverage?: string;
  operator?: string;
  notes?: string;
  /** Monat der letzten Prüfung im Format YYYY-MM */
  lastVerified?: string;
}

// ============================================================================
// Load data from JSON
// ============================================================================

export const TIME_SIGNAL_TRANSMITTERS: Transmitter[] = transmitterData.timeSignal as Transmitter[];
export const BROADCAST_TRANSMITTERS: Transmitter[] = transmitterData.broadcast as Transmitter[];
export const NAVIGATION_TRANSMITTERS: Transmitter[] = transmitterData.navigation as Transmitter[];
export const AMATEUR_TRANSMITTERS: Transmitter[] = transmitterData.amateur as Transmitter[];
/** Militärische Längstwellensender, Maschinensender und sonstige Utility-Stationen */
export const UTILITY_TRANSMITTERS: Transmitter[] = transmitterData.utility as Transmitter[];
/** Radar-, Deep-Space- und Forschungsanlagen (ebenfalls Typ 'utility') */
export const SCIENCE_TRANSMITTERS: Transmitter[] = transmitterData.science as Transmitter[];

// ============================================================================
// Combined exports
// ============================================================================

export const ALL_TRANSMITTERS: Transmitter[] = [
  ...TIME_SIGNAL_TRANSMITTERS,
  ...BROADCAST_TRANSMITTERS,
  ...NAVIGATION_TRANSMITTERS,
  ...AMATEUR_TRANSMITTERS,
  ...UTILITY_TRANSMITTERS,
  ...SCIENCE_TRANSMITTERS
];

export const TRANSMITTERS_BY_TYPE = {
  time_signal: TIME_SIGNAL_TRANSMITTERS,
  broadcast_lw: BROADCAST_TRANSMITTERS.filter((t) => t.type === 'broadcast_lw'),
  broadcast_mw: BROADCAST_TRANSMITTERS.filter((t) => t.type === 'broadcast_mw'),
  broadcast_sw: BROADCAST_TRANSMITTERS.filter((t) => t.type === 'broadcast_sw'),
  broadcast_fm: BROADCAST_TRANSMITTERS.filter((t) => t.type === 'broadcast_fm'),
  navigation: NAVIGATION_TRANSMITTERS,
  amateur: AMATEUR_TRANSMITTERS,
  utility: [...UTILITY_TRANSMITTERS, ...SCIENCE_TRANSMITTERS]
} as const;

export const TYPE_NAMES: Record<TransmitterType, { name: string; nameDE: string }> =
  transmitterData.typeNames as Record<TransmitterType, { name: string; nameDE: string }>;

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Search transmitters by name or location
 */
export function searchTransmitters(query: string): Transmitter[] {
  const lowerQuery = query.toLowerCase();
  return ALL_TRANSMITTERS.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.nameDE.toLowerCase().includes(lowerQuery) ||
      t.location.name.toLowerCase().includes(lowerQuery) ||
      t.location.country.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Find transmitters by frequency range
 */
export function findTransmittersByFrequency(minHz: number, maxHz: number): Transmitter[] {
  return ALL_TRANSMITTERS.filter((t) => t.frequencyHz >= minHz && t.frequencyHz <= maxHz);
}

/**
 * Liefert alle Sender einer Feinkategorie (Subtype)
 */
export function getTransmittersBySubtype(subtype: TransmitterSubtype): Transmitter[] {
  return ALL_TRANSMITTERS.filter((t) => t.subtype === subtype);
}

/**
 * Get transmitters by type
 */
export function getTransmittersByType(type: TransmitterType): Transmitter[] {
  return ALL_TRANSMITTERS.filter((t) => t.type === type);
}
