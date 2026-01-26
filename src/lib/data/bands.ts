/**
 * Frequency band definitions for IEEE, NATO, and civilian applications.
 * Used throughout the app for band visualization and frequency lookup.
 */

/**
 * Propagation mode for radio waves
 * - groundWave: Surface wave following Earth's curvature (VLF-MF)
 * - skyWave: Ionospheric reflection (HF)
 * - lineOfSight: Direct path, limited by horizon (VHF+)
 * - mixed: Combination of propagation modes
 */
export type PropagationMode = 'groundWave' | 'skyWave' | 'lineOfSight' | 'mixed';

export interface FrequencyBand {
  id: string;
  name: string;
  nameDE: string;  // German name
  minHz: number;
  maxHz: number;
  color: string;
  category: 'ieee' | 'nato' | 'civilian' | 'de-alt' | 'us-alt' | 'eu-nato' | 'itu' | 'em';
}

/**
 * Extended ITU band interface with propagation and application data
 */
export interface ITUBand extends FrequencyBand {
  category: 'itu';
  propagation: PropagationMode;
  applications: string[];
  notes?: string;
}

/**
 * Alte deutsche Frequenzband-Bezeichnungen (D alt)
 * Traditional German/European radar band naming
 */
export const DE_ALT_BANDS: FrequencyBand[] = [
  { id: 'de-vhf', name: 'VHF', nameDE: 'VHF', minHz: 30e6, maxHz: 300e6, color: '#6366f1', category: 'de-alt' },
  { id: 'de-uhf', name: 'UHF', nameDE: 'UHF', minHz: 300e6, maxHz: 1e9, color: '#818cf8', category: 'de-alt' },
  { id: 'de-l', name: 'L', nameDE: 'L-Band', minHz: 1e9, maxHz: 2e9, color: '#a5b4fc', category: 'de-alt' },
  { id: 'de-s', name: 'S', nameDE: 'S-Band', minHz: 2e9, maxHz: 4e9, color: '#818cf8', category: 'de-alt' },
  { id: 'de-c', name: 'C', nameDE: 'C-Band', minHz: 4e9, maxHz: 8e9, color: '#6366f1', category: 'de-alt' },
  { id: 'de-x', name: 'X', nameDE: 'X-Band', minHz: 8e9, maxHz: 12e9, color: '#818cf8', category: 'de-alt' },
  { id: 'de-ku', name: 'Ku', nameDE: 'Ku-Band', minHz: 12e9, maxHz: 18e9, color: '#a5b4fc', category: 'de-alt' },
  { id: 'de-k', name: 'K', nameDE: 'K-Band', minHz: 18e9, maxHz: 27e9, color: '#818cf8', category: 'de-alt' },
  { id: 'de-ka', name: 'Ka', nameDE: 'Ka-Band', minHz: 27e9, maxHz: 40e9, color: '#6366f1', category: 'de-alt' },
  { id: 'de-mm', name: 'Millimeter', nameDE: 'Millimeterwellen', minHz: 40e9, maxHz: 300e9, color: '#818cf8', category: 'de-alt' },
];

/**
 * Alte US-amerikanische Frequenzband-Bezeichnungen (USA alt)
 * Traditional US military/radar band naming
 */
export const US_ALT_BANDS: FrequencyBand[] = [
  { id: 'us-i', name: 'I', nameDE: 'I-Band', minHz: 100e6, maxHz: 150e6, color: '#fde047', category: 'us-alt' },
  { id: 'us-g', name: 'G', nameDE: 'G-Band', minHz: 150e6, maxHz: 225e6, color: '#facc15', category: 'us-alt' },
  { id: 'us-p', name: 'P', nameDE: 'P-Band', minHz: 225e6, maxHz: 390e6, color: '#eab308', category: 'us-alt' },
  { id: 'us-l', name: 'L', nameDE: 'L-Band', minHz: 390e6, maxHz: 1.55e9, color: '#fde047', category: 'us-alt' },
  { id: 'us-s', name: 'S', nameDE: 'S-Band', minHz: 1.55e9, maxHz: 5.2e9, color: '#facc15', category: 'us-alt' },
  { id: 'us-c', name: 'C', nameDE: 'C-Band', minHz: 5.2e9, maxHz: 8e9, color: '#eab308', category: 'us-alt' },
  { id: 'us-x', name: 'X', nameDE: 'X-Band', minHz: 8e9, maxHz: 12.4e9, color: '#fde047', category: 'us-alt' },
  { id: 'us-k', name: 'K', nameDE: 'K-Band', minHz: 12.4e9, maxHz: 40e9, color: '#facc15', category: 'us-alt' },
  { id: 'us-q', name: 'Q', nameDE: 'Q-Band', minHz: 40e9, maxHz: 46e9, color: '#eab308', category: 'us-alt' },
  { id: 'us-v', name: 'V', nameDE: 'V-Band', minHz: 46e9, maxHz: 56e9, color: '#fde047', category: 'us-alt' },
  { id: 'us-w', name: 'W', nameDE: 'W-Band', minHz: 56e9, maxHz: 100e9, color: '#facc15', category: 'us-alt' },
];

/**
 * Europa (NATO) Frequenzband-Bezeichnungen (EU neu)
 * Current NATO/European frequency band designation A-M
 */
export const EU_NATO_BANDS: FrequencyBand[] = [
  { id: 'eu-a', name: 'A', nameDE: 'NATO A', minHz: 0, maxHz: 250e6, color: '#86efac', category: 'eu-nato' },
  { id: 'eu-b', name: 'B', nameDE: 'NATO B', minHz: 250e6, maxHz: 500e6, color: '#4ade80', category: 'eu-nato' },
  { id: 'eu-c', name: 'C', nameDE: 'NATO C', minHz: 500e6, maxHz: 1e9, color: '#22c55e', category: 'eu-nato' },
  { id: 'eu-d', name: 'D', nameDE: 'NATO D', minHz: 1e9, maxHz: 2e9, color: '#86efac', category: 'eu-nato' },
  { id: 'eu-e', name: 'E', nameDE: 'NATO E', minHz: 2e9, maxHz: 3e9, color: '#4ade80', category: 'eu-nato' },
  { id: 'eu-f', name: 'F', nameDE: 'NATO F', minHz: 3e9, maxHz: 4e9, color: '#22c55e', category: 'eu-nato' },
  { id: 'eu-g', name: 'G', nameDE: 'NATO G', minHz: 4e9, maxHz: 6e9, color: '#86efac', category: 'eu-nato' },
  { id: 'eu-h', name: 'H', nameDE: 'NATO H', minHz: 6e9, maxHz: 8e9, color: '#4ade80', category: 'eu-nato' },
  { id: 'eu-i', name: 'I', nameDE: 'NATO I', minHz: 8e9, maxHz: 10e9, color: '#22c55e', category: 'eu-nato' },
  { id: 'eu-j', name: 'J', nameDE: 'NATO J', minHz: 10e9, maxHz: 20e9, color: '#86efac', category: 'eu-nato' },
  { id: 'eu-k', name: 'K', nameDE: 'NATO K', minHz: 20e9, maxHz: 40e9, color: '#4ade80', category: 'eu-nato' },
  { id: 'eu-l', name: 'L', nameDE: 'NATO L', minHz: 40e9, maxHz: 60e9, color: '#22c55e', category: 'eu-nato' },
  { id: 'eu-m', name: 'M', nameDE: 'NATO M', minHz: 60e9, maxHz: 100e9, color: '#86efac', category: 'eu-nato' },
];

/**
 * IEEE Radar Band designations
 * Standard frequency bands used in radar and microwave engineering
 */
export const IEEE_BANDS: FrequencyBand[] = [
  { id: 'hf', name: 'HF', nameDE: 'HF', minHz: 3e6, maxHz: 30e6, color: '#3b82f6', category: 'ieee' },
  { id: 'vhf', name: 'VHF', nameDE: 'VHF', minHz: 30e6, maxHz: 300e6, color: '#22c55e', category: 'ieee' },
  { id: 'uhf', name: 'UHF', nameDE: 'UHF', minHz: 300e6, maxHz: 1e9, color: '#eab308', category: 'ieee' },
  { id: 'l', name: 'L', nameDE: 'L-Band', minHz: 1e9, maxHz: 2e9, color: '#f97316', category: 'ieee' },
  { id: 's', name: 'S', nameDE: 'S-Band', minHz: 2e9, maxHz: 4e9, color: '#ef4444', category: 'ieee' },
  { id: 'c', name: 'C', nameDE: 'C-Band', minHz: 4e9, maxHz: 8e9, color: '#ec4899', category: 'ieee' },
  { id: 'x', name: 'X', nameDE: 'X-Band', minHz: 8e9, maxHz: 12e9, color: '#a855f7', category: 'ieee' },
  { id: 'ku', name: 'Ku', nameDE: 'Ku-Band', minHz: 12e9, maxHz: 18e9, color: '#6366f1', category: 'ieee' },
  { id: 'k', name: 'K', nameDE: 'K-Band', minHz: 18e9, maxHz: 27e9, color: '#0ea5e9', category: 'ieee' },
  { id: 'ka', name: 'Ka', nameDE: 'Ka-Band', minHz: 27e9, maxHz: 40e9, color: '#14b8a6', category: 'ieee' },
  { id: 'v', name: 'V', nameDE: 'V-Band', minHz: 40e9, maxHz: 75e9, color: '#84cc16', category: 'ieee' },
  { id: 'w', name: 'W', nameDE: 'W-Band', minHz: 75e9, maxHz: 110e9, color: '#f59e0b', category: 'ieee' },
];

/**
 * NATO Band designations (A through M)
 * Military frequency band classification system
 */
export const NATO_BANDS: FrequencyBand[] = [
  { id: 'nato-a', name: 'A', nameDE: 'NATO A', minHz: 0, maxHz: 250e6, color: '#ef4444', category: 'nato' },
  { id: 'nato-b', name: 'B', nameDE: 'NATO B', minHz: 250e6, maxHz: 500e6, color: '#f97316', category: 'nato' },
  { id: 'nato-c', name: 'C', nameDE: 'NATO C', minHz: 500e6, maxHz: 1e9, color: '#eab308', category: 'nato' },
  { id: 'nato-d', name: 'D', nameDE: 'NATO D', minHz: 1e9, maxHz: 2e9, color: '#84cc16', category: 'nato' },
  { id: 'nato-e', name: 'E', nameDE: 'NATO E', minHz: 2e9, maxHz: 3e9, color: '#22c55e', category: 'nato' },
  { id: 'nato-f', name: 'F', nameDE: 'NATO F', minHz: 3e9, maxHz: 4e9, color: '#14b8a6', category: 'nato' },
  { id: 'nato-g', name: 'G', nameDE: 'NATO G', minHz: 4e9, maxHz: 6e9, color: '#06b6d4', category: 'nato' },
  { id: 'nato-h', name: 'H', nameDE: 'NATO H', minHz: 6e9, maxHz: 8e9, color: '#0ea5e9', category: 'nato' },
  { id: 'nato-i', name: 'I', nameDE: 'NATO I', minHz: 8e9, maxHz: 10e9, color: '#3b82f6', category: 'nato' },
  { id: 'nato-j', name: 'J', nameDE: 'NATO J', minHz: 10e9, maxHz: 20e9, color: '#6366f1', category: 'nato' },
  { id: 'nato-k', name: 'K', nameDE: 'NATO K', minHz: 20e9, maxHz: 40e9, color: '#8b5cf6', category: 'nato' },
  { id: 'nato-l', name: 'L', nameDE: 'NATO L', minHz: 40e9, maxHz: 60e9, color: '#a855f7', category: 'nato' },
  { id: 'nato-m', name: 'M', nameDE: 'NATO M', minHz: 60e9, maxHz: 100e9, color: '#ec4899', category: 'nato' },
  { id: 'nato-n', name: 'N', nameDE: 'NATO N', minHz: 100e9, maxHz: 200e9, color: '#f43f5e', category: 'nato' },
  { id: 'nato-o', name: 'O', nameDE: 'NATO O', minHz: 200e9, maxHz: 300e9, color: '#fb7185', category: 'nato' },
];

/**
 * Civilian/Commercial frequency bands
 * Common wireless and broadcasting applications
 */
export const CIVILIAN_BANDS: FrequencyBand[] = [
  { id: 'am-radio', name: 'AM Radio', nameDE: 'AM-Rundfunk', minHz: 535e3, maxHz: 1.7e6, color: '#3b82f6', category: 'civilian' },
  { id: 'shortwave', name: 'Shortwave', nameDE: 'Kurzwelle', minHz: 3e6, maxHz: 30e6, color: '#06b6d4', category: 'civilian' },
  { id: 'fm-radio', name: 'FM Radio', nameDE: 'FM-Rundfunk', minHz: 87.5e6, maxHz: 108e6, color: '#22c55e', category: 'civilian' },
  { id: 'dab', name: 'DAB+', nameDE: 'DAB+', minHz: 174e6, maxHz: 240e6, color: '#84cc16', category: 'civilian' },
  { id: 'dvb-t', name: 'DVB-T', nameDE: 'DVB-T/T2', minHz: 470e6, maxHz: 790e6, color: '#eab308', category: 'civilian' },
  { id: 'lte-700', name: 'LTE 700', nameDE: 'LTE 700 MHz', minHz: 700e6, maxHz: 800e6, color: '#f97316', category: 'civilian' },
  { id: 'lte-800', name: 'LTE 800', nameDE: 'LTE 800 MHz', minHz: 800e6, maxHz: 900e6, color: '#ef4444', category: 'civilian' },
  { id: 'gsm-900', name: 'GSM 900', nameDE: 'GSM 900', minHz: 880e6, maxHz: 960e6, color: '#dc2626', category: 'civilian' },
  { id: 'gps', name: 'GPS', nameDE: 'GPS', minHz: 1.164e9, maxHz: 1.61e9, color: '#059669', category: 'civilian' },
  { id: 'lte-1800', name: 'LTE 1800', nameDE: 'LTE 1800 MHz', minHz: 1.71e9, maxHz: 1.88e9, color: '#ec4899', category: 'civilian' },
  { id: 'umts', name: 'UMTS', nameDE: 'UMTS/3G', minHz: 1.92e9, maxHz: 2.17e9, color: '#a855f7', category: 'civilian' },
  { id: 'wifi-2g', name: 'WiFi 2.4 GHz', nameDE: 'WLAN 2,4 GHz', minHz: 2.4e9, maxHz: 2.5e9, color: '#6366f1', category: 'civilian' },
  { id: 'lte-2600', name: 'LTE 2600', nameDE: 'LTE 2600 MHz', minHz: 2.5e9, maxHz: 2.69e9, color: '#8b5cf6', category: 'civilian' },
  { id: '5g-n78', name: '5G n78', nameDE: '5G n78', minHz: 3.3e9, maxHz: 3.8e9, color: '#0ea5e9', category: 'civilian' },
  { id: 'wifi-5g', name: 'WiFi 5 GHz', nameDE: 'WLAN 5 GHz', minHz: 5.15e9, maxHz: 5.85e9, color: '#14b8a6', category: 'civilian' },
  { id: 'wifi-6e', name: 'WiFi 6E', nameDE: 'WLAN 6 GHz', minHz: 5.925e9, maxHz: 7.125e9, color: '#22d3d1', category: 'civilian' },
  { id: 'radar-auto', name: 'Automotive Radar', nameDE: 'Kfz-Radar', minHz: 76e9, maxHz: 81e9, color: '#f59e0b', category: 'civilian' },
];

/**
 * ITU Radio Band designations
 * International Telecommunication Union frequency band classification
 * Extended with propagation characteristics and typical applications
 *
 * Source: ITU Radio Regulations, Article 2
 */
export const ITU_BANDS: ITUBand[] = [
  {
    id: 'itu-elf',
    name: 'ELF',
    nameDE: 'ELF (Extremely Low Frequency)',
    minHz: 3,
    maxHz: 30,
    color: '#1e3a5f',
    category: 'itu',
    propagation: 'groundWave',
    applications: ['U-Boot-Kommunikation', 'Erdbebenforschung'],
    notes: 'Durchdringt Seewasser bis ca. 200m. Extrem geringe Datenrate.'
  },
  {
    id: 'itu-slf',
    name: 'SLF',
    nameDE: 'SLF (Super Low Frequency)',
    minHz: 30,
    maxHz: 300,
    color: '#1e4d7b',
    category: 'itu',
    propagation: 'groundWave',
    applications: ['U-Boot-Kommunikation', 'Bergbau-Kommunikation'],
    notes: 'Durchdringt Seewasser bis ca. 40m. Sehr grosse Antennen erforderlich.'
  },
  {
    id: 'itu-ulf',
    name: 'ULF',
    nameDE: 'ULF (Ultra Low Frequency)',
    minHz: 300,
    maxHz: 3e3,
    color: '#1e6091',
    category: 'itu',
    propagation: 'groundWave',
    applications: ['U-Boot-Kommunikation', 'Geophysikalische Messungen'],
    notes: 'Durchdringt Seewasser bis ca. 20m.'
  },
  {
    id: 'itu-vlf',
    name: 'VLF',
    nameDE: 'VLF (Very Low Frequency)',
    minHz: 3e3,
    maxHz: 30e3,
    color: '#2374ab',
    category: 'itu',
    propagation: 'groundWave',
    applications: ['Zeitzeichensender (DCF77)', 'Navigation (Omega, LORAN)', 'U-Boot-Kommunikation'],
    notes: 'Sehr stabile Ausbreitung. Wellenlaenge 10-100 km.'
  },
  {
    id: 'itu-lf',
    name: 'LF',
    nameDE: 'LF (Low Frequency)',
    minHz: 30e3,
    maxHz: 300e3,
    color: '#2e86c1',
    category: 'itu',
    propagation: 'groundWave',
    applications: ['Langwellen-Rundfunk', 'Navigation (NDB)', 'LORAN-C', 'RFID (134 kHz)'],
    notes: 'Bodenwelle reicht mehrere 100 km. Nachts Raumwelle moeglich.'
  },
  {
    id: 'itu-mf',
    name: 'MF',
    nameDE: 'MF (Medium Frequency)',
    minHz: 300e3,
    maxHz: 3e6,
    color: '#5499c7',
    category: 'itu',
    propagation: 'mixed',
    applications: ['AM-Rundfunk (MW)', 'Seefunk (500 kHz Not)', 'NDB Navigation', 'Amateurfunk (160m)'],
    notes: 'Tagsueber Bodenwelle, nachts Raumwelle durch D-Schicht-Abbau.'
  },
  {
    id: 'itu-hf',
    name: 'HF',
    nameDE: 'HF (High Frequency)',
    minHz: 3e6,
    maxHz: 30e6,
    color: '#7fb3d5',
    category: 'itu',
    propagation: 'skyWave',
    applications: ['Kurzwellen-Rundfunk', 'Amateurfunk (80m-10m)', 'Seefunk', 'Flugfunk (HF)', 'OTH-Radar'],
    notes: 'Weltweite Reichweite durch Ionosphaerenreflexion. Stark von Sonnenaktivitaet abhaengig.'
  },
  {
    id: 'itu-vhf',
    name: 'VHF',
    nameDE: 'VHF (Very High Frequency)',
    minHz: 30e6,
    maxHz: 300e6,
    color: '#a9cce3',
    category: 'itu',
    propagation: 'lineOfSight',
    applications: ['FM-Rundfunk', 'DAB+', 'Flugfunk', 'BOS-Funk', 'Amateurfunk (2m/70cm)', 'Marine VHF'],
    notes: 'Primaer Sichtlinienausbreitung. Troposphaerische Ueberreichweiten moeglich.'
  },
  {
    id: 'itu-uhf',
    name: 'UHF',
    nameDE: 'UHF (Ultra High Frequency)',
    minHz: 300e6,
    maxHz: 3e9,
    color: '#d4e6f1',
    category: 'itu',
    propagation: 'lineOfSight',
    applications: ['DVB-T/T2', 'Mobilfunk (GSM, UMTS, LTE)', 'GPS', 'WLAN 2.4 GHz', 'Bluetooth', 'LoRa', 'PMR446'],
    notes: 'Gute Gebaeudedurchdringung. Hauptbereich fuer mobile Kommunikation.'
  },
  {
    id: 'itu-shf',
    name: 'SHF',
    nameDE: 'SHF (Super High Frequency)',
    minHz: 3e9,
    maxHz: 30e9,
    color: '#85c1e9',
    category: 'itu',
    propagation: 'lineOfSight',
    applications: ['WLAN 5 GHz/6 GHz', '5G (n78, n79)', 'Satellit (C, Ku, K-Band)', 'Radar', 'Richtfunk'],
    notes: 'Hohe Bandbreiten. Regendaempfung ab ca. 10 GHz relevant.'
  },
  {
    id: 'itu-ehf',
    name: 'EHF',
    nameDE: 'EHF (Extremely High Frequency)',
    minHz: 30e9,
    maxHz: 300e9,
    color: '#3498db',
    category: 'itu',
    propagation: 'lineOfSight',
    applications: ['5G mmWave (FR2)', 'WiGig (60 GHz)', 'Automotive Radar (77 GHz)', 'Satellit (Ka, V-Band)', 'Radioastronomie'],
    notes: 'Millimeterwellen. Starke atmosphaerische Absorption bei 60 GHz (O2) und 183 GHz (H2O).'
  },
  {
    id: 'itu-thf',
    name: 'THF',
    nameDE: 'THF (Tremendously High Frequency)',
    minHz: 300e9,
    maxHz: 3e12,
    color: '#2980b9',
    category: 'itu',
    propagation: 'lineOfSight',
    applications: ['Terahertz-Imaging', 'Sicherheitsscanner', 'Spektroskopie', '6G Forschung'],
    notes: 'Uebergang zu Infrarot. Starke Absorption durch Wasserdampf. Noch experimentell.'
  },
];

/**
 * Electromagnetic Spectrum bands
 * Major divisions of the electromagnetic spectrum
 */
export const EM_BANDS: FrequencyBand[] = [
  { id: 'em-radio', name: 'Radio', nameDE: 'Radiowellen', minHz: 3, maxHz: 300e9, color: '#3b82f6', category: 'em' },
  { id: 'em-microwave', name: 'Microwave', nameDE: 'Mikrowellen', minHz: 300e6, maxHz: 300e9, color: '#6366f1', category: 'em' },
  { id: 'em-infrared', name: 'Infrared', nameDE: 'Infrarot', minHz: 300e9, maxHz: 400e12, color: '#ef4444', category: 'em' },
  { id: 'em-visible', name: 'Visible', nameDE: 'Sichtbares Licht', minHz: 400e12, maxHz: 800e12, color: '#22c55e', category: 'em' },
  { id: 'em-ultraviolet', name: 'Ultraviolet', nameDE: 'Ultraviolett', minHz: 800e12, maxHz: 30e15, color: '#8b5cf6', category: 'em' },
  { id: 'em-xray', name: 'X-Ray', nameDE: 'Roentgenstrahlung', minHz: 30e15, maxHz: 30e18, color: '#06b6d4', category: 'em' },
  { id: 'em-gamma', name: 'Gamma', nameDE: 'Gammastrahlung', minHz: 30e18, maxHz: Infinity, color: '#ec4899', category: 'em' },
];

/**
 * All bands combined for convenience
 */
export const ALL_BANDS: FrequencyBand[] = [
  ...IEEE_BANDS,
  ...NATO_BANDS,
  ...CIVILIAN_BANDS,
  ...ITU_BANDS,
  ...EM_BANDS,
  ...DE_ALT_BANDS,
  ...US_ALT_BANDS,
  ...EU_NATO_BANDS,
];

/**
 * Find all frequency bands that contain the given frequency.
 * @param frequencyHz - The frequency in Hertz
 * @returns Array of bands that contain this frequency
 */
export function getBandsForFrequency(frequencyHz: number): FrequencyBand[] {
  if (frequencyHz <= 0 || !isFinite(frequencyHz)) {
    return [];
  }

  return ALL_BANDS.filter(
    band => frequencyHz >= band.minHz && frequencyHz <= band.maxHz
  );
}

/**
 * Find IEEE bands for a given frequency.
 * @param frequencyHz - The frequency in Hertz
 * @returns Array of IEEE bands that contain this frequency
 */
export function getIEEEBandsForFrequency(frequencyHz: number): FrequencyBand[] {
  if (frequencyHz <= 0 || !isFinite(frequencyHz)) {
    return [];
  }

  return IEEE_BANDS.filter(
    band => frequencyHz >= band.minHz && frequencyHz <= band.maxHz
  );
}

/**
 * Find NATO bands for a given frequency.
 * @param frequencyHz - The frequency in Hertz
 * @returns Array of NATO bands that contain this frequency
 */
export function getNATOBandsForFrequency(frequencyHz: number): FrequencyBand[] {
  if (frequencyHz <= 0 || !isFinite(frequencyHz)) {
    return [];
  }

  return NATO_BANDS.filter(
    band => frequencyHz >= band.minHz && frequencyHz <= band.maxHz
  );
}

/**
 * Find civilian bands for a given frequency.
 * @param frequencyHz - The frequency in Hertz
 * @returns Array of civilian bands that contain this frequency
 */
export function getCivilianBandsForFrequency(frequencyHz: number): FrequencyBand[] {
  if (frequencyHz <= 0 || !isFinite(frequencyHz)) {
    return [];
  }

  return CIVILIAN_BANDS.filter(
    band => frequencyHz >= band.minHz && frequencyHz <= band.maxHz
  );
}

/**
 * Format a frequency range for display.
 * @param minHz - Minimum frequency in Hertz
 * @param maxHz - Maximum frequency in Hertz
 * @returns Formatted string like "2-4 GHz"
 */
export function formatFrequencyRange(minHz: number, maxHz: number): string {
  const formatValue = (hz: number): { value: number; unit: string } => {
    if (hz >= 1e12) return { value: hz / 1e12, unit: 'THz' };
    if (hz >= 1e9) return { value: hz / 1e9, unit: 'GHz' };
    if (hz >= 1e6) return { value: hz / 1e6, unit: 'MHz' };
    if (hz >= 1e3) return { value: hz / 1e3, unit: 'kHz' };
    return { value: hz, unit: 'Hz' };
  };

  const min = formatValue(minHz);
  const max = formatValue(maxHz);

  // Use the larger unit for both if they differ
  if (min.unit === max.unit) {
    return `${min.value}-${max.value} ${min.unit}`;
  }

  // Different units - show both
  const formatNum = (n: number) => n >= 10 ? Math.round(n) : Number(n.toPrecision(2));
  return `${formatNum(min.value)} ${min.unit} - ${formatNum(max.value)} ${max.unit}`;
}
