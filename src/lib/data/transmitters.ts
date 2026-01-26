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
  | 'time_signal'      // Zeitzeichensender
  | 'broadcast_lw'     // Langwellen-Rundfunk
  | 'broadcast_mw'     // Mittelwellen-Rundfunk
  | 'broadcast_sw'     // Kurzwellen-Rundfunk
  | 'broadcast_fm'     // UKW-Rundfunk
  | 'navigation'       // Navigationssender
  | 'amateur'          // Amateurfunk-Relais
  | 'utility';         // Utility-Stationen

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
}

// ============================================================================
// Load data from JSON
// ============================================================================

export const TIME_SIGNAL_TRANSMITTERS: Transmitter[] = transmitterData.timeSignal as Transmitter[];
export const BROADCAST_TRANSMITTERS: Transmitter[] = transmitterData.broadcast as Transmitter[];
export const NAVIGATION_TRANSMITTERS: Transmitter[] = transmitterData.navigation as Transmitter[];
export const AMATEUR_TRANSMITTERS: Transmitter[] = transmitterData.amateur as Transmitter[];

// ============================================================================
// Combined exports
// ============================================================================

export const ALL_TRANSMITTERS: Transmitter[] = [
  ...TIME_SIGNAL_TRANSMITTERS,
  ...BROADCAST_TRANSMITTERS,
  ...NAVIGATION_TRANSMITTERS,
  ...AMATEUR_TRANSMITTERS
];

export const TRANSMITTERS_BY_TYPE = {
  time_signal: TIME_SIGNAL_TRANSMITTERS,
  broadcast_lw: BROADCAST_TRANSMITTERS.filter(t => t.type === 'broadcast_lw'),
  broadcast_mw: BROADCAST_TRANSMITTERS.filter(t => t.type === 'broadcast_mw'),
  broadcast_sw: BROADCAST_TRANSMITTERS.filter(t => t.type === 'broadcast_sw'),
  broadcast_fm: BROADCAST_TRANSMITTERS.filter(t => t.type === 'broadcast_fm'),
  navigation: NAVIGATION_TRANSMITTERS,
  amateur: AMATEUR_TRANSMITTERS,
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
  return ALL_TRANSMITTERS.filter(t =>
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
  return ALL_TRANSMITTERS.filter(t =>
    t.frequencyHz >= minHz && t.frequencyHz <= maxHz
  );
}

/**
 * Get transmitters by type
 */
export function getTransmittersByType(type: TransmitterType): Transmitter[] {
  return ALL_TRANSMITTERS.filter(t => t.type === type);
}
