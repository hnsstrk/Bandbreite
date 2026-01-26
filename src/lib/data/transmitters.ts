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
// Time Signal Transmitters
// ============================================================================

export const TIME_SIGNAL_TRANSMITTERS: Transmitter[] = [
  {
    id: 'dcf77',
    name: 'DCF77',
    nameDE: 'DCF77 Mainflingen',
    type: 'time_signal',
    frequencyHz: 77.5e3,
    powerWatts: 50000,
    location: {
      name: 'Mainflingen',
      country: 'Germany',
      latitude: 50.0152,
      longitude: 9.0054
    },
    status: 'active',
    description: 'German time signal transmitter, primary source for radio-controlled clocks in Europe',
    descriptionDE: 'Deutsches Zeitzeichensignal, Hauptquelle fuer Funkuhren in Europa',
    coverage: 'ca. 2000 km',
    operator: 'PTB / Media Broadcast',
    notes: 'Sendet UTC+1 (MEZ) bzw. UTC+2 (MESZ). Amplitudenmodulation mit Phasenmodulation.'
  },
  {
    id: 'msf',
    name: 'MSF',
    nameDE: 'MSF Anthorn',
    type: 'time_signal',
    frequencyHz: 60e3,
    powerWatts: 17000,
    location: {
      name: 'Anthorn',
      country: 'United Kingdom',
      latitude: 54.9117,
      longitude: -3.2792
    },
    status: 'active',
    description: 'UK time signal transmitter',
    descriptionDE: 'Britisches Zeitzeichensignal',
    coverage: 'ca. 1500 km',
    operator: 'NPL',
    notes: 'Aehnliches Format wie DCF77, sendet UTC.'
  },
  {
    id: 'wwvb',
    name: 'WWVB',
    nameDE: 'WWVB Fort Collins',
    type: 'time_signal',
    frequencyHz: 60e3,
    powerWatts: 70000,
    location: {
      name: 'Fort Collins, Colorado',
      country: 'USA',
      latitude: 40.6781,
      longitude: -105.0469
    },
    status: 'active',
    description: 'US time signal transmitter',
    descriptionDE: 'US-amerikanisches Zeitzeichensignal',
    coverage: 'Nordamerika',
    operator: 'NIST',
    notes: 'Sendet UTC. Reichweite bis ca. 3000 km bei guten Bedingungen.'
  },
  {
    id: 'jjy-40',
    name: 'JJY 40 kHz',
    nameDE: 'JJY Fukushima',
    type: 'time_signal',
    frequencyHz: 40e3,
    powerWatts: 50000,
    location: {
      name: 'Fukushima',
      country: 'Japan',
      latitude: 37.3722,
      longitude: 140.8494
    },
    status: 'active',
    description: 'Japanese time signal transmitter (40 kHz)',
    descriptionDE: 'Japanisches Zeitzeichensignal (40 kHz)',
    coverage: 'Japan, Ostasien',
    operator: 'NICT'
  },
  {
    id: 'jjy-60',
    name: 'JJY 60 kHz',
    nameDE: 'JJY Kyushu',
    type: 'time_signal',
    frequencyHz: 60e3,
    powerWatts: 50000,
    location: {
      name: 'Saga Prefecture',
      country: 'Japan',
      latitude: 33.4656,
      longitude: 130.1758
    },
    status: 'active',
    description: 'Japanese time signal transmitter (60 kHz)',
    descriptionDE: 'Japanisches Zeitzeichensignal (60 kHz)',
    coverage: 'Japan, Suedostasien',
    operator: 'NICT'
  },
  {
    id: 'bpc',
    name: 'BPC',
    nameDE: 'BPC Shangqiu',
    type: 'time_signal',
    frequencyHz: 68.5e3,
    powerWatts: 100000,
    location: {
      name: 'Shangqiu, Henan',
      country: 'China',
      latitude: 34.4333,
      longitude: 115.6500
    },
    status: 'active',
    description: 'Chinese time signal transmitter',
    descriptionDE: 'Chinesisches Zeitzeichensignal',
    coverage: 'China, Ostasien',
    operator: 'NTSC'
  }
];

// ============================================================================
// Broadcasting Transmitters
// ============================================================================

export const BROADCAST_TRANSMITTERS: Transmitter[] = [
  {
    id: 'dlf-153',
    name: 'Deutschlandfunk LW',
    nameDE: 'Deutschlandfunk Langwelle',
    type: 'broadcast_lw',
    frequencyHz: 153e3,
    powerWatts: 500000,
    location: {
      name: 'Donebach',
      country: 'Germany',
      latitude: 49.5700,
      longitude: 9.1917
    },
    status: 'inactive',
    description: 'Former long wave broadcast, shut down 2014',
    descriptionDE: 'Ehemaliger Langwellen-Rundfunk, 2014 abgeschaltet',
    operator: 'Deutschlandradio',
    notes: 'War einer der letzten LW-Sender in Deutschland.'
  },
  {
    id: 'rtl-234',
    name: 'RTL Radio',
    nameDE: 'RTL Radio Luxemburg',
    type: 'broadcast_lw',
    frequencyHz: 234e3,
    powerWatts: 2000000,
    location: {
      name: 'Beidweiler',
      country: 'Luxembourg',
      latitude: 49.7258,
      longitude: 6.3267
    },
    status: 'inactive',
    description: 'Former RTL long wave broadcast, shut down 2022',
    descriptionDE: 'Ehemaliger RTL Langwellen-Rundfunk, 2022 abgeschaltet',
    notes: 'Sendete von 1933 bis 2022. Legendaerer Sender.'
  },
  {
    id: 'europe1-183',
    name: 'Europe 1',
    nameDE: 'Europe 1',
    type: 'broadcast_lw',
    frequencyHz: 183e3,
    powerWatts: 2000000,
    location: {
      name: 'Felsberg-Berus',
      country: 'Germany',
      latitude: 49.2603,
      longitude: 6.7689
    },
    status: 'active',
    description: 'French long wave broadcast from German border',
    descriptionDE: 'Franzoesischer Langwellen-Rundfunk von der deutschen Grenze',
    operator: 'Europe 1',
    notes: 'Einer der letzten verbliebenen starken LW-Sender.'
  },
  {
    id: 'bbc-radio4-198',
    name: 'BBC Radio 4 LW',
    nameDE: 'BBC Radio 4 Langwelle',
    type: 'broadcast_lw',
    frequencyHz: 198e3,
    powerWatts: 500000,
    location: {
      name: 'Droitwich',
      country: 'United Kingdom',
      latitude: 52.2969,
      longitude: -2.1089
    },
    status: 'active',
    description: 'BBC Radio 4 long wave broadcast',
    descriptionDE: 'BBC Radio 4 Langwellen-Rundfunk',
    operator: 'BBC',
    notes: 'Wichtig fuer UK Shipping Forecast.'
  }
];

// ============================================================================
// Navigation Transmitters
// ============================================================================

export const NAVIGATION_TRANSMITTERS: Transmitter[] = [
  {
    id: 'ndb-fhd',
    name: 'NDB FHD',
    nameDE: 'NDB Friedrichshafen',
    type: 'navigation',
    frequencyHz: 428e3,
    location: {
      name: 'Friedrichshafen',
      country: 'Germany',
      latitude: 47.6714,
      longitude: 9.5106
    },
    status: 'unknown',
    description: 'Non-directional beacon for aviation',
    descriptionDE: 'Ungerichtetes Funkfeuer fuer Luftfahrt',
    notes: 'NDBs werden sukzessive ausser Betrieb genommen.'
  },
  {
    id: 'vor-dkb',
    name: 'VOR DKB',
    nameDE: 'VOR Dinkelsbuehl',
    type: 'navigation',
    frequencyHz: 117.2e6,
    location: {
      name: 'Dinkelsbuehl',
      country: 'Germany',
      latitude: 49.0697,
      longitude: 10.3228
    },
    status: 'active',
    description: 'VOR navigation beacon',
    descriptionDE: 'VOR Drehfunkfeuer',
    notes: 'Teil des deutschen VOR-Netzes.'
  }
];

// ============================================================================
// Amateur Radio Repeaters (Examples)
// ============================================================================

export const AMATEUR_TRANSMITTERS: Transmitter[] = [
  {
    id: 'db0fs',
    name: 'DB0FS',
    nameDE: 'DB0FS Feldberg',
    type: 'amateur',
    frequencyHz: 439.275e6,
    frequencyHzSecondary: 431.675e6,
    location: {
      name: 'Grosser Feldberg',
      country: 'Germany',
      latitude: 50.2217,
      longitude: 8.4461
    },
    status: 'active',
    description: 'Amateur radio repeater on Grosser Feldberg',
    descriptionDE: 'Amateurfunk-Relais auf dem Grossen Feldberg',
    coverage: 'Rhein-Main-Gebiet',
    notes: 'Output 439.275 MHz, Input 431.675 MHz, CTCSS 67.0 Hz'
  },
  {
    id: 'db0wa',
    name: 'DB0WA',
    nameDE: 'DB0WA Wasserkuppe',
    type: 'amateur',
    frequencyHz: 145.7e6,
    frequencyHzSecondary: 145.1e6,
    location: {
      name: 'Wasserkuppe',
      country: 'Germany',
      latitude: 50.4983,
      longitude: 9.9364
    },
    status: 'active',
    description: '2m amateur radio repeater',
    descriptionDE: '2m Amateurfunk-Relais',
    coverage: 'Nordhessen, Thueringen',
    notes: 'Output 145.700 MHz, Input 145.100 MHz'
  },
  {
    id: 'db0zu',
    name: 'DB0ZU',
    nameDE: 'DB0ZU Zugspitze',
    type: 'amateur',
    frequencyHz: 439.075e6,
    location: {
      name: 'Zugspitze',
      country: 'Germany',
      latitude: 47.4211,
      longitude: 10.9856
    },
    status: 'active',
    description: 'Amateur radio repeater on Germanys highest peak',
    descriptionDE: 'Amateurfunk-Relais auf Deutschlands hoechstem Berg',
    coverage: 'Suedbayern, Oesterreich',
    notes: 'Hervorragende Reichweite durch Standorthoehe.'
  }
];

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

export const TYPE_NAMES: Record<TransmitterType, { name: string; nameDE: string }> = {
  time_signal: { name: 'Time Signal', nameDE: 'Zeitzeichen' },
  broadcast_lw: { name: 'Long Wave Broadcast', nameDE: 'LW-Rundfunk' },
  broadcast_mw: { name: 'Medium Wave Broadcast', nameDE: 'MW-Rundfunk' },
  broadcast_sw: { name: 'Short Wave Broadcast', nameDE: 'KW-Rundfunk' },
  broadcast_fm: { name: 'FM Broadcast', nameDE: 'UKW-Rundfunk' },
  navigation: { name: 'Navigation', nameDE: 'Navigation' },
  amateur: { name: 'Amateur Radio', nameDE: 'Amateurfunk' },
  utility: { name: 'Utility', nameDE: 'Utility' }
};

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
