/**
 * Historical milestones in radio and wireless communications
 *
 * This file contains significant events in the development of radio technology,
 * from Maxwell's theoretical predictions to modern 5G networks.
 */

/**
 * Historical event category
 */
export type HistoryCategory =
  | 'theory'       // Theoretical foundations
  | 'invention'    // Key inventions
  | 'broadcast'    // Broadcasting milestones
  | 'mobile'       // Mobile communications
  | 'satellite'    // Satellite communications
  | 'digital';     // Digital revolution

/**
 * Historical event definition
 */
export interface HistoricalEvent {
  id: string;
  year: number;
  yearEnd?: number;
  title: string;
  titleDE: string;
  description: string;
  descriptionDE: string;
  category: HistoryCategory;
  frequencyHz?: number;
  frequencyHzMax?: number;
  person?: string;
  location?: string;
  significance: 'major' | 'moderate' | 'minor';
}

/**
 * Historical events in radio communications
 */
export const HISTORICAL_EVENTS: HistoricalEvent[] = [
  // Theory
  {
    id: 'maxwell-equations',
    year: 1865,
    title: 'Maxwell\'s Equations',
    titleDE: 'Maxwellsche Gleichungen',
    description: 'James Clerk Maxwell publishes his theory predicting electromagnetic waves',
    descriptionDE: 'James Clerk Maxwell veroeffentlicht seine Theorie der elektromagnetischen Wellen',
    category: 'theory',
    person: 'James Clerk Maxwell',
    location: 'United Kingdom',
    significance: 'major'
  },
  {
    id: 'hertz-experiments',
    year: 1888,
    title: 'Hertz Experiments',
    titleDE: 'Hertzsche Versuche',
    description: 'Heinrich Hertz demonstrates existence of electromagnetic waves',
    descriptionDE: 'Heinrich Hertz weist elektromagnetische Wellen experimentell nach',
    category: 'theory',
    frequencyHz: 50e6,
    frequencyHzMax: 500e6,
    person: 'Heinrich Hertz',
    location: 'Karlsruhe, Germany',
    significance: 'major'
  },

  // Early inventions
  {
    id: 'marconi-patent',
    year: 1896,
    title: 'Marconi\'s Radio Patent',
    titleDE: 'Marconis Funkpatent',
    description: 'Guglielmo Marconi patents the first practical radio system',
    descriptionDE: 'Guglielmo Marconi patentiert das erste praktische Funksystem',
    category: 'invention',
    person: 'Guglielmo Marconi',
    location: 'United Kingdom',
    significance: 'major'
  },
  {
    id: 'marconi-atlantic',
    year: 1901,
    title: 'First Transatlantic Transmission',
    titleDE: 'Erste transatlantische Übertragung',
    description: 'Marconi transmits letter "S" across the Atlantic Ocean',
    descriptionDE: 'Marconi überträgt den Buchstaben "S" über den Atlantik',
    category: 'invention',
    frequencyHz: 850e3,
    person: 'Guglielmo Marconi',
    location: 'Poldhu, UK to Newfoundland',
    significance: 'major'
  },
  {
    id: 'titanic',
    year: 1912,
    title: 'Titanic Disaster',
    titleDE: 'Titanic-Katastrophe',
    description: 'Radio saves 700 lives; leads to mandatory ship radio equipment',
    descriptionDE: 'Funk rettet 700 Leben; führt zu Funkpflicht auf Schiffen',
    category: 'invention',
    frequencyHz: 500e3,
    significance: 'major'
  },
  {
    id: 'first-vacuum-tube',
    year: 1906,
    title: 'Audion Tube',
    titleDE: 'Audionroehre',
    description: 'Lee de Forest invents the Audion, first amplifying vacuum tube',
    descriptionDE: 'Lee de Forest erfindet die Audionroehre, erste Verstärkerroehre',
    category: 'invention',
    person: 'Lee de Forest',
    location: 'USA',
    significance: 'major'
  },

  // Broadcasting
  {
    id: 'first-broadcast',
    year: 1920,
    title: 'First Commercial Radio Broadcast',
    titleDE: 'Erste kommerzielle Radiosendung',
    description: 'KDKA Pittsburgh begins regular radio broadcasts',
    descriptionDE: 'KDKA Pittsburgh beginnt regelmaessigen Rundfunk',
    category: 'broadcast',
    frequencyHz: 833e3,
    location: 'Pittsburgh, USA',
    significance: 'major'
  },
  {
    id: 'fm-invention',
    year: 1933,
    title: 'FM Radio Invented',
    titleDE: 'UKW-Rundfunk erfunden',
    description: 'Edwin Armstrong develops frequency modulation',
    descriptionDE: 'Edwin Armstrong entwickelt Frequenzmodulation',
    category: 'broadcast',
    frequencyHz: 42e6,
    frequencyHzMax: 50e6,
    person: 'Edwin Armstrong',
    location: 'USA',
    significance: 'major'
  },
  {
    id: 'television-broadcast',
    year: 1936,
    title: 'Regular Television Broadcasts',
    titleDE: 'Regelmaessiges Fernsehen',
    description: 'BBC begins first regular television service',
    descriptionDE: 'BBC startet ersten regelmaessigen Fernsehbetrieb',
    category: 'broadcast',
    frequencyHz: 45e6,
    location: 'London, UK',
    significance: 'moderate'
  },
  {
    id: 'dab-start',
    year: 1995,
    title: 'DAB Radio Launch',
    titleDE: 'DAB-Start',
    description: 'First DAB digital radio broadcasts in Europe',
    descriptionDE: 'Erste DAB Digitalradio-Sendungen in Europa',
    category: 'broadcast',
    frequencyHz: 174e6,
    frequencyHzMax: 240e6,
    location: 'Europe',
    significance: 'moderate'
  },

  // Mobile Communications
  {
    id: 'first-mobile-phone',
    year: 1973,
    title: 'First Mobile Phone Call',
    titleDE: 'Erster Mobilfunkanruf',
    description: 'Martin Cooper makes first handheld mobile phone call',
    descriptionDE: 'Martin Cooper führt erstes Gespräch mit Handy',
    category: 'mobile',
    frequencyHz: 850e6,
    person: 'Martin Cooper (Motorola)',
    location: 'New York, USA',
    significance: 'major'
  },
  {
    id: 'gsm-launch',
    year: 1991,
    title: 'GSM Network Launch',
    titleDE: 'GSM-Start',
    description: 'First GSM network goes live in Finland',
    descriptionDE: 'Erstes GSM-Netz geht in Finnland in Betrieb',
    category: 'mobile',
    frequencyHz: 900e6,
    location: 'Finland',
    significance: 'major'
  },
  {
    id: 'umts-3g',
    year: 2001,
    title: '3G UMTS Launch',
    titleDE: '3G UMTS Start',
    description: 'First 3G UMTS networks launch in Japan',
    descriptionDE: 'Erste 3G UMTS-Netze starten in Japan',
    category: 'mobile',
    frequencyHz: 2.1e9,
    location: 'Japan',
    significance: 'moderate'
  },
  {
    id: 'lte-4g',
    year: 2009,
    title: '4G LTE Launch',
    titleDE: '4G LTE Start',
    description: 'First commercial LTE networks',
    descriptionDE: 'Erste kommerzielle LTE-Netze',
    category: 'mobile',
    frequencyHz: 2.6e9,
    location: 'Scandinavia',
    significance: 'moderate'
  },
  {
    id: '5g-launch',
    year: 2019,
    title: '5G Network Launch',
    titleDE: '5G-Netzstart',
    description: 'First commercial 5G networks go live',
    descriptionDE: 'Erste kommerzielle 5G-Netze gehen in Betrieb',
    category: 'mobile',
    frequencyHz: 3.5e9,
    frequencyHzMax: 28e9,
    location: 'South Korea, USA',
    significance: 'major'
  },

  // Satellite
  {
    id: 'sputnik',
    year: 1957,
    title: 'Sputnik 1',
    titleDE: 'Sputnik 1',
    description: 'First artificial satellite transmits radio beacon',
    descriptionDE: 'Erster kuenstlicher Satellit sendet Funksignal',
    category: 'satellite',
    frequencyHz: 20.005e6,
    frequencyHzMax: 40.002e6,
    location: 'USSR',
    significance: 'major'
  },
  {
    id: 'telstar',
    year: 1962,
    title: 'Telstar 1',
    titleDE: 'Telstar 1',
    description: 'First active communications satellite',
    descriptionDE: 'Erster aktiver Kommunikationssatellit',
    category: 'satellite',
    frequencyHz: 4e9,
    frequencyHzMax: 6e9,
    location: 'USA/Europe',
    significance: 'major'
  },
  {
    id: 'gps-operational',
    year: 1995,
    title: 'GPS Fully Operational',
    titleDE: 'GPS voll betriebsbereit',
    description: 'Global Positioning System declared fully operational',
    descriptionDE: 'GPS-System wird für voll betriebsbereit erklaert',
    category: 'satellite',
    frequencyHz: 1.57542e9,
    location: 'Worldwide',
    significance: 'major'
  },
  {
    id: 'starlink',
    year: 2019,
    title: 'Starlink Constellation',
    titleDE: 'Starlink-Konstellation',
    description: 'SpaceX begins deploying Starlink satellite internet',
    descriptionDE: 'SpaceX beginnt Starlink Satelliten-Internet Aufbau',
    category: 'satellite',
    frequencyHz: 12e9,
    frequencyHzMax: 40e9,
    location: 'Worldwide',
    significance: 'moderate'
  },

  // Digital Revolution
  {
    id: 'wifi-standard',
    year: 1997,
    title: 'WiFi Standard (802.11)',
    titleDE: 'WLAN-Standard (802.11)',
    description: 'IEEE 802.11 wireless LAN standard published',
    descriptionDE: 'IEEE 802.11 WLAN-Standard veroeffentlicht',
    category: 'digital',
    frequencyHz: 2.4e9,
    significance: 'major'
  },
  {
    id: 'bluetooth',
    year: 1998,
    title: 'Bluetooth Specification',
    titleDE: 'Bluetooth-Spezifikation',
    description: 'Bluetooth 1.0 specification released',
    descriptionDE: 'Bluetooth 1.0 Spezifikation veroeffentlicht',
    category: 'digital',
    frequencyHz: 2.4e9,
    significance: 'moderate'
  },
  {
    id: 'lora',
    year: 2015,
    title: 'LoRa/LoRaWAN',
    titleDE: 'LoRa/LoRaWAN',
    description: 'LoRaWAN for IoT standardized',
    descriptionDE: 'LoRaWAN für IoT standardisiert',
    category: 'digital',
    frequencyHz: 868e6,
    significance: 'moderate'
  }
];

/**
 * Category display configuration
 */
export const CATEGORY_CONFIG: Record<HistoryCategory, { name: string; nameDE: string; color: string }> = {
  theory: { name: 'Theory', nameDE: 'Theorie', color: '#8b5cf6' },
  invention: { name: 'Inventions', nameDE: 'Erfindungen', color: '#3b82f6' },
  broadcast: { name: 'Broadcasting', nameDE: 'Rundfunk', color: '#ef4444' },
  mobile: { name: 'Mobile', nameDE: 'Mobilfunk', color: '#22c55e' },
  satellite: { name: 'Satellite', nameDE: 'Satellit', color: '#f97316' },
  digital: { name: 'Digital', nameDE: 'Digital', color: '#06b6d4' }
};

/**
 * Get events by category
 */
export function getEventsByCategory(category: HistoryCategory): HistoricalEvent[] {
  return HISTORICAL_EVENTS.filter(e => e.category === category);
}

/**
 * Get events in year range
 */
export function getEventsByYearRange(startYear: number, endYear: number): HistoricalEvent[] {
  return HISTORICAL_EVENTS.filter(e => e.year >= startYear && e.year <= endYear);
}

/**
 * Get major events only
 */
export function getMajorEvents(): HistoricalEvent[] {
  return HISTORICAL_EVENTS.filter(e => e.significance === 'major');
}
