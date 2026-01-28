/**
 * Comprehensive Frequency Band Definitions
 *
 * Diese Datei enthält detaillierte Informationen zu allen wichtigen Frequenzbändern:
 * - ITU-Bänder (ELF bis THF)
 * - IEEE-Radarbänder
 * - NATO-Bänder (A bis O)
 * - Amateurfunkbänder
 * - Rundfunkbänder
 *
 * Quellen:
 * - ITU Radio Regulations, Article 2
 * - IEEE Standard 521-2019
 * - NATO STANAG 4193
 * - IARU Region 1 Bandpläne
 * - Wikipedia: Frequenzbänder
 */

import { SPEED_OF_LIGHT } from './constants';

// ============================================================================
// Frequenzkonstanten (benannte Werte statt Magic Numbers)
// ============================================================================

/** Frequenzgrenzen in Hz */
export const FREQUENCY_LIMITS = {
  // ELF bis THF Grenzen
  ELF_MIN: 3,
  ELF_MAX: 30,
  SLF_MAX: 300,
  ULF_MAX: 3e3,
  VLF_MAX: 30e3,
  LF_MAX: 300e3,
  MF_MAX: 3e6,
  HF_MAX: 30e6,
  VHF_MAX: 300e6,
  UHF_MAX: 3e9,
  SHF_MAX: 30e9,
  EHF_MAX: 300e9,
  THF_MAX: 3e12,

  // Amateurfunk-Bänder (IARU Region 1)
  AMATEUR_160M_MIN: 1.81e6,
  AMATEUR_160M_MAX: 2e6,
  AMATEUR_80M_MIN: 3.5e6,
  AMATEUR_80M_MAX: 3.8e6,
  AMATEUR_60M_MIN: 5.3515e6,
  AMATEUR_60M_MAX: 5.3665e6,
  AMATEUR_40M_MIN: 7e6,
  AMATEUR_40M_MAX: 7.2e6,
  AMATEUR_30M_MIN: 10.1e6,
  AMATEUR_30M_MAX: 10.15e6,
  AMATEUR_20M_MIN: 14e6,
  AMATEUR_20M_MAX: 14.35e6,
  AMATEUR_17M_MIN: 18.068e6,
  AMATEUR_17M_MAX: 18.168e6,
  AMATEUR_15M_MIN: 21e6,
  AMATEUR_15M_MAX: 21.45e6,
  AMATEUR_12M_MIN: 24.89e6,
  AMATEUR_12M_MAX: 24.99e6,
  AMATEUR_10M_MIN: 28e6,
  AMATEUR_10M_MAX: 29.7e6,
  AMATEUR_6M_MIN: 50e6,
  AMATEUR_6M_MAX: 52e6,
  AMATEUR_2M_MIN: 144e6,
  AMATEUR_2M_MAX: 146e6,
  AMATEUR_70CM_MIN: 430e6,
  AMATEUR_70CM_MAX: 440e6,
  AMATEUR_23CM_MIN: 1240e6,
  AMATEUR_23CM_MAX: 1300e6,
  AMATEUR_13CM_MIN: 2320e6,
  AMATEUR_13CM_MAX: 2450e6,

  // Rundfunkbänder
  BROADCAST_LW_MIN: 148.5e3,
  BROADCAST_LW_MAX: 283.5e3,
  BROADCAST_MW_MIN: 526.5e3,
  BROADCAST_MW_MAX: 1606.5e3,
  BROADCAST_FM_MIN: 87.5e6,
  BROADCAST_FM_MAX: 108e6,

  // Kurzwelle Rundfunk (internationale Bänder)
  BROADCAST_120M_MIN: 2.3e6,
  BROADCAST_120M_MAX: 2.495e6,
  BROADCAST_90M_MIN: 3.2e6,
  BROADCAST_90M_MAX: 3.4e6,
  BROADCAST_75M_MIN: 3.9e6,
  BROADCAST_75M_MAX: 4e6,
  BROADCAST_60M_MIN: 4.75e6,
  BROADCAST_60M_MAX: 5.06e6,
  BROADCAST_49M_MIN: 5.9e6,
  BROADCAST_49M_MAX: 6.2e6,
  BROADCAST_41M_MIN: 7.2e6,
  BROADCAST_41M_MAX: 7.45e6,
  BROADCAST_31M_MIN: 9.4e6,
  BROADCAST_31M_MAX: 9.9e6,
  BROADCAST_25M_MIN: 11.6e6,
  BROADCAST_25M_MAX: 12.1e6,
  BROADCAST_22M_MIN: 13.57e6,
  BROADCAST_22M_MAX: 13.87e6,
  BROADCAST_19M_MIN: 15.1e6,
  BROADCAST_19M_MAX: 15.8e6,
  BROADCAST_16M_MIN: 17.48e6,
  BROADCAST_16M_MAX: 17.9e6,
  BROADCAST_15M_MIN: 18.9e6,
  BROADCAST_15M_MAX: 19.02e6,
  BROADCAST_13M_MIN: 21.45e6,
  BROADCAST_13M_MAX: 21.85e6,
  BROADCAST_11M_MIN: 25.6e6,
  BROADCAST_11M_MAX: 26.1e6,
} as const;

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Kategorie eines Frequenzbandes
 */
export type FrequencyBandCategory = 'itu' | 'ieee' | 'nato' | 'amateur' | 'broadcast';

/**
 * Ausbreitungsmodus
 */
export type PropagationModeType = 'groundWave' | 'skyWave' | 'lineOfSight' | 'mixed' | 'submarine';

/**
 * Detaillierte Frequenzband-Definition
 */
export interface FrequencyBandDetail {
  /** Eindeutige ID */
  id: string;
  /** Englischer Name */
  name: string;
  /** Deutscher Name */
  nameDE: string;
  /** Kategorie des Bandes */
  category: FrequencyBandCategory;
  /** Frequenzbereich in Hz */
  frequencyHz: { min: number; max: number };
  /** Wellenlängenbereich (formatierter String) */
  wavelength: string;
  /** Anwendungen (Englisch) */
  applications: string[];
  /** Anwendungen (Deutsch) */
  applicationsDE: string[];
  /** Ausbreitungseigenschaften (Englisch) */
  propagation: string;
  /** Ausbreitungseigenschaften (Deutsch) */
  propagationDE: string;
  /** Primärer Ausbreitungsmodus */
  propagationMode: PropagationModeType;
  /** Zusätzliche Hinweise */
  notes?: string;
  /** Farbe für Visualisierung */
  color: string;
}

// ============================================================================
// ITU-Frequenzbänder (12 Bänder: ELF bis THF)
// Quelle: ITU Radio Regulations, Article 2
// ============================================================================

export const ITU_FREQUENCY_BANDS: FrequencyBandDetail[] = [
  {
    id: 'itu-elf',
    name: 'ELF (Extremely Low Frequency)',
    nameDE: 'ELF (Extrem niedrige Frequenz)',
    category: 'itu',
    frequencyHz: { min: FREQUENCY_LIMITS.ELF_MIN, max: FREQUENCY_LIMITS.ELF_MAX },
    wavelength: '10.000 - 100.000 km',
    applications: ['Submarine communication', 'Geophysical research'],
    applicationsDE: ['U-Boot-Kommunikation', 'Geophysikalische Forschung'],
    propagation: 'Penetrates seawater (~200m depth). Extremely low data rate (<1 bit/min).',
    propagationDE: 'Durchdringt Seewasser (~200m Tiefe). Extrem niedrige Datenrate (<1 bit/min).',
    propagationMode: 'submarine',
    notes: 'Antennen sind mehrere 10 km lang. Projekt Sanguine/ELF (US Navy) nutzte 76 Hz.',
    color: '#1e3a5f'
  },
  {
    id: 'itu-slf',
    name: 'SLF (Super Low Frequency)',
    nameDE: 'SLF (Sehr niedrige Frequenz)',
    category: 'itu',
    frequencyHz: { min: FREQUENCY_LIMITS.ELF_MAX, max: FREQUENCY_LIMITS.SLF_MAX },
    wavelength: '1.000 - 10.000 km',
    applications: ['Submarine communication', 'Mining communication'],
    applicationsDE: ['U-Boot-Kommunikation', 'Bergbau-Kommunikation'],
    propagation: 'Penetrates seawater (~40m depth). Very large antennas required.',
    propagationDE: 'Durchdringt Seewasser (~40m Tiefe). Sehr große Antennen erforderlich.',
    propagationMode: 'submarine',
    notes: 'Russische ZEVS-Anlage arbeitet bei 82 Hz.',
    color: '#1e4d7b'
  },
  {
    id: 'itu-ulf',
    name: 'ULF (Ultra Low Frequency)',
    nameDE: 'ULF (Ultratiefe Frequenz)',
    category: 'itu',
    frequencyHz: { min: FREQUENCY_LIMITS.SLF_MAX, max: FREQUENCY_LIMITS.ULF_MAX },
    wavelength: '100 - 1.000 km',
    applications: ['Submarine communication', 'Geophysical measurements', 'Through-earth communication'],
    applicationsDE: ['U-Boot-Kommunikation', 'Geophysikalische Messungen', 'Erdreich-Durchdringung'],
    propagation: 'Penetrates seawater (~20m depth). Can penetrate rock/soil.',
    propagationDE: 'Durchdringt Seewasser (~20m Tiefe). Kann Gestein/Erdreich durchdringen.',
    propagationMode: 'submarine',
    notes: 'Verwendet in Bergwerken für Notfallkommunikation.',
    color: '#1e6091'
  },
  {
    id: 'itu-vlf',
    name: 'VLF (Very Low Frequency)',
    nameDE: 'VLF (Längstwelle)',
    category: 'itu',
    frequencyHz: { min: FREQUENCY_LIMITS.ULF_MAX, max: FREQUENCY_LIMITS.VLF_MAX },
    wavelength: '10 - 100 km',
    applications: ['Time signals (DCF77)', 'Navigation (Omega)', 'Submarine broadcast'],
    applicationsDE: ['Zeitzeichen (DCF77)', 'Navigation (Omega)', 'U-Boot-Rundfunk'],
    propagation: 'Very stable ground wave propagation. Earth-ionosphere waveguide.',
    propagationDE: 'Sehr stabile Bodenwellenausbreitung. Erde-Ionosphäre-Wellenleiter.',
    propagationMode: 'groundWave',
    notes: 'DCF77 (77,5 kHz) sendet von Mainflingen bei Frankfurt.',
    color: '#2374ab'
  },
  {
    id: 'itu-lf',
    name: 'LF (Low Frequency)',
    nameDE: 'LF (Langwelle)',
    category: 'itu',
    frequencyHz: { min: FREQUENCY_LIMITS.VLF_MAX, max: FREQUENCY_LIMITS.LF_MAX },
    wavelength: '1 - 10 km',
    applications: ['Longwave broadcasting', 'Navigation (NDB)', 'LORAN-C', 'RFID (134 kHz)'],
    applicationsDE: ['Langwellen-Rundfunk', 'Navigation (NDB)', 'LORAN-C', 'RFID (134 kHz)'],
    propagation: 'Ground wave reaches several 100 km. Sky wave possible at night.',
    propagationDE: 'Bodenwelle reicht mehrere 100 km. Nachts Raumwelle möglich.',
    propagationMode: 'groundWave',
    notes: 'Deutschlandfunk sendete bis 2014 auf 153 kHz und 207 kHz.',
    color: '#2e86c1'
  },
  {
    id: 'itu-mf',
    name: 'MF (Medium Frequency)',
    nameDE: 'MF (Mittelwelle)',
    category: 'itu',
    frequencyHz: { min: FREQUENCY_LIMITS.LF_MAX, max: FREQUENCY_LIMITS.MF_MAX },
    wavelength: '100 m - 1 km',
    applications: ['AM broadcasting', 'Maritime distress (500 kHz)', 'NDB navigation', 'Amateur radio (160m)'],
    applicationsDE: ['AM-Rundfunk', 'Seenot-Frequenz (500 kHz)', 'NDB-Navigation', 'Amateurfunk (160m)'],
    propagation: 'Ground wave by day (~300 km). Sky wave at night (D-layer disappears).',
    propagationDE: 'Tagsüber Bodenwelle (~300 km). Nachts Raumwelle (D-Schicht verschwindet).',
    propagationMode: 'mixed',
    notes: 'Typisches nächtliches Fading durch Interferenz von Boden- und Raumwelle.',
    color: '#5499c7'
  },
  {
    id: 'itu-hf',
    name: 'HF (High Frequency)',
    nameDE: 'HF (Kurzwelle)',
    category: 'itu',
    frequencyHz: { min: FREQUENCY_LIMITS.MF_MAX, max: FREQUENCY_LIMITS.HF_MAX },
    wavelength: '10 - 100 m',
    applications: ['Shortwave broadcasting', 'Amateur radio (80m-10m)', 'Maritime/aviation HF', 'OTH radar'],
    applicationsDE: ['Kurzwellen-Rundfunk', 'Amateurfunk (80m-10m)', 'See-/Flugfunk HF', 'Überhorizont-Radar'],
    propagation: 'Worldwide via ionospheric reflection. Heavily depends on solar activity.',
    propagationDE: 'Weltweit durch Ionosphärenreflexion. Stark von Sonnenaktivität abhängig.',
    propagationMode: 'skyWave',
    notes: 'Beste Fernverbindungen bei hoher Sonnenaktivität. MUF bestimmt nutzbare Frequenz.',
    color: '#7fb3d5'
  },
  {
    id: 'itu-vhf',
    name: 'VHF (Very High Frequency)',
    nameDE: 'VHF (Ultrakurzwelle)',
    category: 'itu',
    frequencyHz: { min: FREQUENCY_LIMITS.HF_MAX, max: FREQUENCY_LIMITS.VHF_MAX },
    wavelength: '1 - 10 m',
    applications: ['FM broadcasting', 'DAB+', 'Air traffic control', 'Marine VHF', 'Amateur radio (6m, 2m)'],
    applicationsDE: ['UKW-Rundfunk', 'DAB+', 'Flugverkehrskontrolle', 'Seefunk VHF', 'Amateurfunk (6m, 2m)'],
    propagation: 'Primarily line-of-sight. Limited by radio horizon. Sporadic E possible.',
    propagationDE: 'Primär Sichtverbindung. Durch Radiohorizont begrenzt. Sporadische E möglich.',
    propagationMode: 'lineOfSight',
    notes: 'Troposphärische Überreichweiten bei Inversionswetterlagen möglich.',
    color: '#a9cce3'
  },
  {
    id: 'itu-uhf',
    name: 'UHF (Ultra High Frequency)',
    nameDE: 'UHF (Dezimeterwelle)',
    category: 'itu',
    frequencyHz: { min: FREQUENCY_LIMITS.VHF_MAX, max: FREQUENCY_LIMITS.UHF_MAX },
    wavelength: '10 cm - 1 m',
    applications: ['DVB-T/T2', 'Mobile (GSM, UMTS, LTE)', 'GPS', 'WiFi 2.4 GHz', 'Bluetooth', 'LoRa'],
    applicationsDE: ['DVB-T/T2', 'Mobilfunk (GSM, UMTS, LTE)', 'GPS', 'WLAN 2,4 GHz', 'Bluetooth', 'LoRa'],
    propagation: 'Line-of-sight. Good building penetration. Main band for mobile communications.',
    propagationDE: 'Sichtverbindung. Gute Gebäudedurchdringung. Hauptbereich für Mobilkommunikation.',
    propagationMode: 'lineOfSight',
    notes: 'Fresnel-Zonen-Freiheit wichtig für störungsfreie Verbindungen.',
    color: '#d4e6f1'
  },
  {
    id: 'itu-shf',
    name: 'SHF (Super High Frequency)',
    nameDE: 'SHF (Zentimeterwelle)',
    category: 'itu',
    frequencyHz: { min: FREQUENCY_LIMITS.UHF_MAX, max: FREQUENCY_LIMITS.SHF_MAX },
    wavelength: '1 - 10 cm',
    applications: ['WiFi 5/6 GHz', '5G (n78, n79)', 'Satellite (C, Ku, K-Band)', 'Radar', 'Microwave links'],
    applicationsDE: ['WLAN 5/6 GHz', '5G (n78, n79)', 'Satellit (C, Ku, K-Band)', 'Radar', 'Richtfunk'],
    propagation: 'Line-of-sight only. Rain attenuation becomes relevant above 10 GHz.',
    propagationDE: 'Nur Sichtverbindung. Regendämpfung ab ca. 10 GHz relevant.',
    propagationMode: 'lineOfSight',
    notes: 'Hohe Bandbreiten ermöglichen schnelle Datenübertragung.',
    color: '#85c1e9'
  },
  {
    id: 'itu-ehf',
    name: 'EHF (Extremely High Frequency)',
    nameDE: 'EHF (Millimeterwelle)',
    category: 'itu',
    frequencyHz: { min: FREQUENCY_LIMITS.SHF_MAX, max: FREQUENCY_LIMITS.EHF_MAX },
    wavelength: '1 - 10 mm',
    applications: ['5G mmWave (FR2)', 'WiGig (60 GHz)', 'Automotive radar (77 GHz)', 'Satellite (Ka, V-Band)'],
    applicationsDE: ['5G mmWave (FR2)', 'WiGig (60 GHz)', 'Kfz-Radar (77 GHz)', 'Satellit (Ka, V-Band)'],
    propagation: 'Strong atmospheric absorption at 60 GHz (O2) and 183 GHz (H2O).',
    propagationDE: 'Starke atmosphärische Absorption bei 60 GHz (O2) und 183 GHz (H2O).',
    propagationMode: 'lineOfSight',
    notes: '60 GHz wird wegen Sauerstoffabsorption für sichere Kurzstrecken genutzt.',
    color: '#3498db'
  },
  {
    id: 'itu-thf',
    name: 'THF (Tremendously High Frequency)',
    nameDE: 'THF (Submillimeterwelle)',
    category: 'itu',
    frequencyHz: { min: FREQUENCY_LIMITS.EHF_MAX, max: FREQUENCY_LIMITS.THF_MAX },
    wavelength: '0,1 - 1 mm',
    applications: ['Terahertz imaging', 'Security scanners', 'Spectroscopy', '6G research'],
    applicationsDE: ['Terahertz-Bildgebung', 'Sicherheitsscanner', 'Spektroskopie', '6G-Forschung'],
    propagation: 'Transition to infrared. Strong water vapor absorption. Still experimental.',
    propagationDE: 'Übergang zu Infrarot. Starke Wasserdampfabsorption. Noch experimentell.',
    propagationMode: 'lineOfSight',
    notes: 'Terahertz-Lücke: Schwer zu erzeugen und zu detektieren.',
    color: '#2980b9'
  }
];

// ============================================================================
// IEEE-Radarbänder
// Quelle: IEEE Standard 521-2019
// ============================================================================

export const IEEE_FREQUENCY_BANDS: FrequencyBandDetail[] = [
  {
    id: 'ieee-hf',
    name: 'HF',
    nameDE: 'HF-Band',
    category: 'ieee',
    frequencyHz: { min: 3e6, max: 30e6 },
    wavelength: '10 - 100 m',
    applications: ['Over-the-horizon radar', 'Surface wave radar'],
    applicationsDE: ['Überhorizont-Radar', 'Oberflächenwellen-Radar'],
    propagation: 'Sky wave reflection enables OTH radar detection.',
    propagationDE: 'Raumwellenreflexion ermöglicht Überhorizont-Radardetektion.',
    propagationMode: 'skyWave',
    color: '#3b82f6'
  },
  {
    id: 'ieee-vhf',
    name: 'VHF',
    nameDE: 'VHF-Band',
    category: 'ieee',
    frequencyHz: { min: 30e6, max: 300e6 },
    wavelength: '1 - 10 m',
    applications: ['Early warning radar', 'Wind profiler'],
    applicationsDE: ['Frühwarnradar', 'Windprofiler'],
    propagation: 'Long range, lower resolution. Good for detecting large targets.',
    propagationDE: 'Große Reichweite, geringere Auflösung. Gut für große Ziele.',
    propagationMode: 'lineOfSight',
    color: '#22c55e'
  },
  {
    id: 'ieee-uhf',
    name: 'UHF',
    nameDE: 'UHF-Band',
    category: 'ieee',
    frequencyHz: { min: 300e6, max: 1e9 },
    wavelength: '30 cm - 1 m',
    applications: ['Surveillance radar', 'Foliage penetration radar'],
    applicationsDE: ['Überwachungsradar', 'Blätterdurchdringungsradar'],
    propagation: 'Can penetrate foliage. Used for ground surveillance.',
    propagationDE: 'Kann Laub durchdringen. Wird für Bodenüberwachung genutzt.',
    propagationMode: 'lineOfSight',
    color: '#eab308'
  },
  {
    id: 'ieee-l',
    name: 'L-Band',
    nameDE: 'L-Band',
    category: 'ieee',
    frequencyHz: { min: 1e9, max: 2e9 },
    wavelength: '15 - 30 cm',
    applications: ['Air traffic control', 'Long-range surveillance', 'GPS L1/L2'],
    applicationsDE: ['Flugsicherung', 'Langstreckenüberwachung', 'GPS L1/L2'],
    propagation: 'Good for long-range detection. Less affected by weather.',
    propagationDE: 'Gut für Langstreckenerkennung. Weniger wetterempfindlich.',
    propagationMode: 'lineOfSight',
    color: '#f97316'
  },
  {
    id: 'ieee-s',
    name: 'S-Band',
    nameDE: 'S-Band',
    category: 'ieee',
    frequencyHz: { min: 2e9, max: 4e9 },
    wavelength: '7,5 - 15 cm',
    applications: ['Weather radar', 'Ship radar', 'Air traffic control'],
    applicationsDE: ['Wetterradar', 'Schiffsradar', 'Flugsicherung'],
    propagation: 'Balance between range and resolution. Moderate rain attenuation.',
    propagationDE: 'Ausgewogen zwischen Reichweite und Auflösung. Mäßige Regendämpfung.',
    propagationMode: 'lineOfSight',
    color: '#ef4444'
  },
  {
    id: 'ieee-c',
    name: 'C-Band',
    nameDE: 'C-Band',
    category: 'ieee',
    frequencyHz: { min: 4e9, max: 8e9 },
    wavelength: '3,75 - 7,5 cm',
    applications: ['Weather radar', 'Satellite communication', 'Long-range tracking'],
    applicationsDE: ['Wetterradar', 'Satellitenkommunikation', 'Langstreckenverfolgung'],
    propagation: 'Compromise between rain attenuation and resolution.',
    propagationDE: 'Kompromiss zwischen Regendämpfung und Auflösung.',
    propagationMode: 'lineOfSight',
    color: '#ec4899'
  },
  {
    id: 'ieee-x',
    name: 'X-Band',
    nameDE: 'X-Band',
    category: 'ieee',
    frequencyHz: { min: 8e9, max: 12e9 },
    wavelength: '2,5 - 3,75 cm',
    applications: ['Marine radar', 'Fire control radar', 'Airborne radar'],
    applicationsDE: ['Schiffsradar', 'Feuerleitradar', 'Bordradar'],
    propagation: 'High resolution. Affected by heavy rain.',
    propagationDE: 'Hohe Auflösung. Durch starken Regen beeinträchtigt.',
    propagationMode: 'lineOfSight',
    color: '#a855f7'
  },
  {
    id: 'ieee-ku',
    name: 'Ku-Band',
    nameDE: 'Ku-Band',
    category: 'ieee',
    frequencyHz: { min: 12e9, max: 18e9 },
    wavelength: '1,67 - 2,5 cm',
    applications: ['Satellite TV', 'High-resolution mapping radar'],
    applicationsDE: ['Satellitenfernsehen', 'Hochauflösendes Kartierungsradar'],
    propagation: 'Significant rain fade. High bandwidth available.',
    propagationDE: 'Erhebliche Regendämpfung. Hohe Bandbreite verfügbar.',
    propagationMode: 'lineOfSight',
    color: '#6366f1'
  },
  {
    id: 'ieee-k',
    name: 'K-Band',
    nameDE: 'K-Band',
    category: 'ieee',
    frequencyHz: { min: 18e9, max: 27e9 },
    wavelength: '1,11 - 1,67 cm',
    applications: ['Satellite downlinks', 'Police speed radar (24 GHz)'],
    applicationsDE: ['Satelliten-Downlinks', 'Polizei-Geschwindigkeitsradar (24 GHz)'],
    propagation: 'Water vapor absorption at 22 GHz. Split by absorption band.',
    propagationDE: 'Wasserdampfabsorption bei 22 GHz. Durch Absorptionsband geteilt.',
    propagationMode: 'lineOfSight',
    notes: 'K steht für kurz (deutsch), da erstmals für kurze Wellenlängen verwendet.',
    color: '#0ea5e9'
  },
  {
    id: 'ieee-ka',
    name: 'Ka-Band',
    nameDE: 'Ka-Band',
    category: 'ieee',
    frequencyHz: { min: 27e9, max: 40e9 },
    wavelength: '0,75 - 1,11 cm',
    applications: ['Satellite communication', 'High-resolution radar', '5G backhaul'],
    applicationsDE: ['Satellitenkommunikation', 'Hochauflösendes Radar', '5G-Backhaul'],
    propagation: 'Very high resolution but severe rain attenuation.',
    propagationDE: 'Sehr hohe Auflösung aber starke Regendämpfung.',
    propagationMode: 'lineOfSight',
    notes: 'Ka = K-above (über dem K-Band).',
    color: '#14b8a6'
  },
  {
    id: 'ieee-v',
    name: 'V-Band',
    nameDE: 'V-Band',
    category: 'ieee',
    frequencyHz: { min: 40e9, max: 75e9 },
    wavelength: '4 - 7,5 mm',
    applications: ['Satellite crosslinks', 'Point-to-point links', 'WiGig'],
    applicationsDE: ['Satelliten-Crosslinks', 'Punkt-zu-Punkt-Verbindungen', 'WiGig'],
    propagation: 'Oxygen absorption peak at 60 GHz limits range.',
    propagationDE: 'Sauerstoffabsorptionspeak bei 60 GHz begrenzt Reichweite.',
    propagationMode: 'lineOfSight',
    notes: '60 GHz ideal für sichere Kurzstrecken-Hochgeschwindigkeitslinks.',
    color: '#84cc16'
  },
  {
    id: 'ieee-w',
    name: 'W-Band',
    nameDE: 'W-Band',
    category: 'ieee',
    frequencyHz: { min: 75e9, max: 110e9 },
    wavelength: '2,7 - 4 mm',
    applications: ['Automotive radar (77 GHz)', 'Security imaging', 'Radiometry'],
    applicationsDE: ['Kfz-Radar (77 GHz)', 'Sicherheitsbildgebung', 'Radiometrie'],
    propagation: 'Atmospheric window between 70-100 GHz. High resolution.',
    propagationDE: 'Atmosphärisches Fenster zwischen 70-100 GHz. Hohe Auflösung.',
    propagationMode: 'lineOfSight',
    color: '#f59e0b'
  },
  {
    id: 'ieee-mm',
    name: 'mm-Wave',
    nameDE: 'Millimeterwellen',
    category: 'ieee',
    frequencyHz: { min: 110e9, max: 300e9 },
    wavelength: '1 - 2,7 mm',
    applications: ['Imaging', 'Spectroscopy', 'Research'],
    applicationsDE: ['Bildgebung', 'Spektroskopie', 'Forschung'],
    propagation: 'Multiple absorption bands. Very short range.',
    propagationDE: 'Mehrere Absorptionsbänder. Sehr kurze Reichweite.',
    propagationMode: 'lineOfSight',
    color: '#fb923c'
  }
];

// ============================================================================
// NATO-Bänder (A bis O)
// Quelle: NATO STANAG 4193
// ============================================================================

export const NATO_FREQUENCY_BANDS: FrequencyBandDetail[] = [
  {
    id: 'nato-a',
    name: 'NATO A',
    nameDE: 'NATO-Band A',
    category: 'nato',
    frequencyHz: { min: 0, max: 250e6 },
    wavelength: '> 1,2 m',
    applications: ['HF/VHF communications', 'Early warning radar'],
    applicationsDE: ['HF/VHF-Kommunikation', 'Frühwarnradar'],
    propagation: 'Mixed propagation modes depending on frequency.',
    propagationDE: 'Gemischte Ausbreitungsmodi je nach Frequenz.',
    propagationMode: 'mixed',
    color: '#ef4444'
  },
  {
    id: 'nato-b',
    name: 'NATO B',
    nameDE: 'NATO-Band B',
    category: 'nato',
    frequencyHz: { min: 250e6, max: 500e6 },
    wavelength: '60 cm - 1,2 m',
    applications: ['UHF communications', 'Surveillance radar'],
    applicationsDE: ['UHF-Kommunikation', 'Überwachungsradar'],
    propagation: 'Primarily line-of-sight propagation.',
    propagationDE: 'Primär Sichtlinienausbreitung.',
    propagationMode: 'lineOfSight',
    color: '#f97316'
  },
  {
    id: 'nato-c',
    name: 'NATO C',
    nameDE: 'NATO-Band C',
    category: 'nato',
    frequencyHz: { min: 500e6, max: 1e9 },
    wavelength: '30 - 60 cm',
    applications: ['Tactical communications', 'Air surveillance'],
    applicationsDE: ['Taktische Kommunikation', 'Luftüberwachung'],
    propagation: 'Line-of-sight. Good building penetration.',
    propagationDE: 'Sichtverbindung. Gute Gebäudedurchdringung.',
    propagationMode: 'lineOfSight',
    color: '#eab308'
  },
  {
    id: 'nato-d',
    name: 'NATO D',
    nameDE: 'NATO-Band D',
    category: 'nato',
    frequencyHz: { min: 1e9, max: 2e9 },
    wavelength: '15 - 30 cm',
    applications: ['Long-range surveillance', 'Air traffic control'],
    applicationsDE: ['Langstreckenüberwachung', 'Flugsicherung'],
    propagation: 'Corresponds to L-Band. Less weather-sensitive.',
    propagationDE: 'Entspricht L-Band. Weniger wetterempfindlich.',
    propagationMode: 'lineOfSight',
    color: '#84cc16'
  },
  {
    id: 'nato-e',
    name: 'NATO E',
    nameDE: 'NATO-Band E',
    category: 'nato',
    frequencyHz: { min: 2e9, max: 3e9 },
    wavelength: '10 - 15 cm',
    applications: ['3D radar', 'Satellite communication'],
    applicationsDE: ['3D-Radar', 'Satellitenkommunikation'],
    propagation: 'Part of S-Band. Moderate rain attenuation.',
    propagationDE: 'Teil des S-Bandes. Mäßige Regendämpfung.',
    propagationMode: 'lineOfSight',
    color: '#22c55e'
  },
  {
    id: 'nato-f',
    name: 'NATO F',
    nameDE: 'NATO-Band F',
    category: 'nato',
    frequencyHz: { min: 3e9, max: 4e9 },
    wavelength: '7,5 - 10 cm',
    applications: ['Satellite downlinks', 'Weather radar'],
    applicationsDE: ['Satelliten-Downlinks', 'Wetterradar'],
    propagation: 'Part of S/C-Band transition.',
    propagationDE: 'Übergang S/C-Band.',
    propagationMode: 'lineOfSight',
    color: '#14b8a6'
  },
  {
    id: 'nato-g',
    name: 'NATO G',
    nameDE: 'NATO-Band G',
    category: 'nato',
    frequencyHz: { min: 4e9, max: 6e9 },
    wavelength: '5 - 7,5 cm',
    applications: ['Weather radar', 'Satellite communication (C-Band)'],
    applicationsDE: ['Wetterradar', 'Satellitenkommunikation (C-Band)'],
    propagation: 'C-Band. Compromise for rain/resolution.',
    propagationDE: 'C-Band. Kompromiss für Regen/Auflösung.',
    propagationMode: 'lineOfSight',
    color: '#06b6d4'
  },
  {
    id: 'nato-h',
    name: 'NATO H',
    nameDE: 'NATO-Band H',
    category: 'nato',
    frequencyHz: { min: 6e9, max: 8e9 },
    wavelength: '3,75 - 5 cm',
    applications: ['Satellite uplinks', 'Instrumentation radar'],
    applicationsDE: ['Satelliten-Uplinks', 'Instrumentierungsradar'],
    propagation: 'Upper C-Band. High bandwidth.',
    propagationDE: 'Oberes C-Band. Hohe Bandbreite.',
    propagationMode: 'lineOfSight',
    color: '#0ea5e9'
  },
  {
    id: 'nato-i',
    name: 'NATO I',
    nameDE: 'NATO-Band I',
    category: 'nato',
    frequencyHz: { min: 8e9, max: 10e9 },
    wavelength: '3 - 3,75 cm',
    applications: ['Airborne radar', 'Fire control'],
    applicationsDE: ['Bordradar', 'Feuerleitgeräte'],
    propagation: 'X-Band. High resolution, rain-sensitive.',
    propagationDE: 'X-Band. Hohe Auflösung, regenempfindlich.',
    propagationMode: 'lineOfSight',
    color: '#3b82f6'
  },
  {
    id: 'nato-j',
    name: 'NATO J',
    nameDE: 'NATO-Band J',
    category: 'nato',
    frequencyHz: { min: 10e9, max: 20e9 },
    wavelength: '1,5 - 3 cm',
    applications: ['Fire control radar', 'Satellite TV (Ku)'],
    applicationsDE: ['Feuerleitradar', 'Satellitenfernsehen (Ku)'],
    propagation: 'Ku-Band region. Significant rain fade.',
    propagationDE: 'Ku-Band-Bereich. Erhebliche Regendämpfung.',
    propagationMode: 'lineOfSight',
    color: '#6366f1'
  },
  {
    id: 'nato-k',
    name: 'NATO K',
    nameDE: 'NATO-Band K',
    category: 'nato',
    frequencyHz: { min: 20e9, max: 40e9 },
    wavelength: '7,5 mm - 1,5 cm',
    applications: ['Satellite communication (Ka)', 'High-resolution imaging'],
    applicationsDE: ['Satellitenkommunikation (Ka)', 'Hochauflösende Bildgebung'],
    propagation: 'Ka-Band. Very high resolution but weather-limited.',
    propagationDE: 'Ka-Band. Sehr hohe Auflösung aber wetterbegrenzt.',
    propagationMode: 'lineOfSight',
    color: '#8b5cf6'
  },
  {
    id: 'nato-l',
    name: 'NATO L',
    nameDE: 'NATO-Band L',
    category: 'nato',
    frequencyHz: { min: 40e9, max: 60e9 },
    wavelength: '5 - 7,5 mm',
    applications: ['Experimental systems', 'Secure communications'],
    applicationsDE: ['Experimentelle Systeme', 'Sichere Kommunikation'],
    propagation: 'V-Band. Oxygen absorption at 60 GHz.',
    propagationDE: 'V-Band. Sauerstoffabsorption bei 60 GHz.',
    propagationMode: 'lineOfSight',
    color: '#a855f7'
  },
  {
    id: 'nato-m',
    name: 'NATO M',
    nameDE: 'NATO-Band M',
    category: 'nato',
    frequencyHz: { min: 60e9, max: 100e9 },
    wavelength: '3 - 5 mm',
    applications: ['Automotive radar', 'Security imaging'],
    applicationsDE: ['Kfz-Radar', 'Sicherheitsbildgebung'],
    propagation: 'W-Band region. Atmospheric window at 77 GHz.',
    propagationDE: 'W-Band-Bereich. Atmosphärisches Fenster bei 77 GHz.',
    propagationMode: 'lineOfSight',
    color: '#ec4899'
  },
  {
    id: 'nato-n',
    name: 'NATO N',
    nameDE: 'NATO-Band N',
    category: 'nato',
    frequencyHz: { min: 100e9, max: 200e9 },
    wavelength: '1,5 - 3 mm',
    applications: ['Research', 'Spectroscopy'],
    applicationsDE: ['Forschung', 'Spektroskopie'],
    propagation: 'Submillimeter region. Experimental.',
    propagationDE: 'Submillimeter-Bereich. Experimentell.',
    propagationMode: 'lineOfSight',
    color: '#f43f5e'
  },
  {
    id: 'nato-o',
    name: 'NATO O',
    nameDE: 'NATO-Band O',
    category: 'nato',
    frequencyHz: { min: 200e9, max: 300e9 },
    wavelength: '1 - 1,5 mm',
    applications: ['Research', 'THz imaging'],
    applicationsDE: ['Forschung', 'THz-Bildgebung'],
    propagation: 'Near-THz. Strong atmospheric absorption.',
    propagationDE: 'Nahe THz. Starke atmosphärische Absorption.',
    propagationMode: 'lineOfSight',
    color: '#fb7185'
  }
];

// ============================================================================
// Amateurfunkbänder (IARU Region 1)
// Quelle: IARU Region 1 Bandplan, BNetzA Amateurfunkverordnung
// ============================================================================

export const AMATEUR_FREQUENCY_BANDS: FrequencyBandDetail[] = [
  {
    id: 'amateur-160m',
    name: '160m (Top Band)',
    nameDE: '160m-Band (Langwelle)',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_160M_MIN, max: FREQUENCY_LIMITS.AMATEUR_160M_MAX },
    wavelength: '150 - 166 m',
    applications: ['CW', 'SSB', 'Digital modes', 'Regional DX'],
    applicationsDE: ['CW', 'SSB', 'Digitale Betriebsarten', 'Regionales DX'],
    propagation: 'Ground wave by day. Night sky wave with significant absorption.',
    propagationDE: 'Tagsüber Bodenwelle. Nachts Raumwelle mit erheblicher Absorption.',
    propagationMode: 'mixed',
    notes: 'Topband - schwieriges DX-Band, besonders in Europa wegen hohem Störpegel.',
    color: '#1e40af'
  },
  {
    id: 'amateur-80m',
    name: '80m',
    nameDE: '80m-Band',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_80M_MIN, max: FREQUENCY_LIMITS.AMATEUR_80M_MAX },
    wavelength: '79 - 86 m',
    applications: ['CW', 'SSB', 'Digital modes', 'NVIS', 'Emergency communications'],
    applicationsDE: ['CW', 'SSB', 'Digitale Betriebsarten', 'NVIS', 'Notfunkkommunikation'],
    propagation: 'Excellent NVIS for regional coverage. DX at night.',
    propagationDE: 'Hervorragendes NVIS für regionale Abdeckung. DX nachts.',
    propagationMode: 'mixed',
    notes: 'In Europa 3,5-3,8 MHz. NVIS-Verbindungen bis ~500 km.',
    color: '#3b82f6'
  },
  {
    id: 'amateur-60m',
    name: '60m',
    nameDE: '60m-Band',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_60M_MIN, max: FREQUENCY_LIMITS.AMATEUR_60M_MAX },
    wavelength: '56 m',
    applications: ['CW', 'SSB', 'Digital modes', 'Emergency communications'],
    applicationsDE: ['CW', 'SSB', 'Digitale Betriebsarten', 'Notfunkkommunikation'],
    propagation: 'Good for emergency communications. Stable propagation.',
    propagationDE: 'Gut für Notfunkkommunikation. Stabile Ausbreitung.',
    propagationMode: 'skyWave',
    notes: 'WRC-15 Sekundärzuweisung. In DE Kanalbetrieb mit 15 W EIRP.',
    color: '#6366f1'
  },
  {
    id: 'amateur-40m',
    name: '40m',
    nameDE: '40m-Band',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_40M_MIN, max: FREQUENCY_LIMITS.AMATEUR_40M_MAX },
    wavelength: '42 - 43 m',
    applications: ['CW', 'SSB', 'Digital modes', 'Contests', 'DX'],
    applicationsDE: ['CW', 'SSB', 'Digitale Betriebsarten', 'Conteste', 'DX'],
    propagation: 'Day: Regional. Night: Worldwide DX possible.',
    propagationDE: 'Tag: Regional. Nacht: Weltweites DX möglich.',
    propagationMode: 'skyWave',
    notes: 'Arbeitspferd des HF-Amateurfunks. In Europa nur 7,0-7,2 MHz.',
    color: '#8b5cf6'
  },
  {
    id: 'amateur-30m',
    name: '30m',
    nameDE: '30m-Band',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_30M_MIN, max: FREQUENCY_LIMITS.AMATEUR_30M_MAX },
    wavelength: '29,5 - 29,7 m',
    applications: ['CW', 'Digital modes (FT8, WSPR)'],
    applicationsDE: ['CW', 'Digitale Betriebsarten (FT8, WSPR)'],
    propagation: 'Excellent for long-distance digital modes.',
    propagationDE: 'Hervorragend für digitale Weitverkehrsmodi.',
    propagationMode: 'skyWave',
    notes: 'WARC-Band. Nur CW und schmale digitale Betriebsarten. Max. 150 W.',
    color: '#a855f7'
  },
  {
    id: 'amateur-20m',
    name: '20m',
    nameDE: '20m-Band',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_20M_MIN, max: FREQUENCY_LIMITS.AMATEUR_20M_MAX },
    wavelength: '21 - 21,4 m',
    applications: ['CW', 'SSB', 'Digital modes', 'Contests', 'DX'],
    applicationsDE: ['CW', 'SSB', 'Digitale Betriebsarten', 'Conteste', 'DX'],
    propagation: 'Primary DX band. Open most of the day during solar maximum.',
    propagationDE: 'Primäres DX-Band. Tagsüber meist offen bei Sonnenmaximum.',
    propagationMode: 'skyWave',
    notes: 'Das DX-Band schlechthin. Auch bei niedrigem Sonnenfleckenzyklus brauchbar.',
    color: '#d946ef'
  },
  {
    id: 'amateur-17m',
    name: '17m',
    nameDE: '17m-Band',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_17M_MIN, max: FREQUENCY_LIMITS.AMATEUR_17M_MAX },
    wavelength: '16,5 - 16,6 m',
    applications: ['CW', 'SSB', 'Digital modes', 'DX'],
    applicationsDE: ['CW', 'SSB', 'Digitale Betriebsarten', 'DX'],
    propagation: 'Good DX band, less crowded than 20m.',
    propagationDE: 'Gutes DX-Band, weniger überlaufen als 20m.',
    propagationMode: 'skyWave',
    notes: 'WARC-Band. Keine Conteste erlaubt.',
    color: '#ec4899'
  },
  {
    id: 'amateur-15m',
    name: '15m',
    nameDE: '15m-Band',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_15M_MIN, max: FREQUENCY_LIMITS.AMATEUR_15M_MAX },
    wavelength: '14 - 14,3 m',
    applications: ['CW', 'SSB', 'Digital modes', 'Contests', 'DX'],
    applicationsDE: ['CW', 'SSB', 'Digitale Betriebsarten', 'Conteste', 'DX'],
    propagation: 'Excellent during solar maximum. Closed at night.',
    propagationDE: 'Hervorragend bei Sonnenmaximum. Nachts geschlossen.',
    propagationMode: 'skyWave',
    notes: 'Stark vom Sonnenfleckenzyklus abhängig.',
    color: '#f43f5e'
  },
  {
    id: 'amateur-12m',
    name: '12m',
    nameDE: '12m-Band',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_12M_MIN, max: FREQUENCY_LIMITS.AMATEUR_12M_MAX },
    wavelength: '12 - 12,05 m',
    applications: ['CW', 'SSB', 'Digital modes', 'DX'],
    applicationsDE: ['CW', 'SSB', 'Digitale Betriebsarten', 'DX'],
    propagation: 'Solar cycle dependent. Sporadic E in summer.',
    propagationDE: 'Sonnenzyklusabhängig. Sporadische E im Sommer.',
    propagationMode: 'skyWave',
    notes: 'WARC-Band. Bei hoher Sonnenaktivität hervorragend.',
    color: '#fb7185'
  },
  {
    id: 'amateur-10m',
    name: '10m',
    nameDE: '10m-Band',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_10M_MIN, max: FREQUENCY_LIMITS.AMATEUR_10M_MAX },
    wavelength: '10,1 - 10,7 m',
    applications: ['CW', 'SSB', 'FM', 'Digital modes', 'Beacons', 'Contests'],
    applicationsDE: ['CW', 'SSB', 'FM', 'Digitale Betriebsarten', 'Baken', 'Conteste'],
    propagation: 'Very solar dependent. Excellent sporadic E in summer.',
    propagationDE: 'Stark sonnenabhängig. Hervorragende sporadische E im Sommer.',
    propagationMode: 'skyWave',
    notes: 'Breites Band mit verschiedenen Segmenten. FM-Relais auf 29 MHz.',
    color: '#f97316'
  },
  {
    id: 'amateur-6m',
    name: '6m (Magic Band)',
    nameDE: '6m-Band (Magic Band)',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_6M_MIN, max: FREQUENCY_LIMITS.AMATEUR_6M_MAX },
    wavelength: '5,8 - 6 m',
    applications: ['CW', 'SSB', 'FM', 'Digital modes', 'EME', 'Meteor scatter'],
    applicationsDE: ['CW', 'SSB', 'FM', 'Digitale Betriebsarten', 'EME', 'Meteor-Scatter'],
    propagation: 'Magic band - unpredictable openings. Sporadic E, troposcatter, EME.',
    propagationDE: 'Magic Band - unvorhersehbare Öffnungen. Sporadische E, Troposcatter, EME.',
    propagationMode: 'mixed',
    notes: 'Übergang HF/VHF. Sporadische E ermöglicht Europa-DX.',
    color: '#f59e0b'
  },
  {
    id: 'amateur-2m',
    name: '2m',
    nameDE: '2m-Band',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_2M_MIN, max: FREQUENCY_LIMITS.AMATEUR_2M_MAX },
    wavelength: '2,05 - 2,08 m',
    applications: ['FM', 'SSB', 'CW', 'Digital modes', 'Repeaters', 'APRS', 'EME'],
    applicationsDE: ['FM', 'SSB', 'CW', 'Digitale Betriebsarten', 'Relais', 'APRS', 'EME'],
    propagation: 'Line-of-sight. Troposcatter, sporadic E, aurora possible.',
    propagationDE: 'Sichtverbindung. Troposcatter, sporadische E, Aurora möglich.',
    propagationMode: 'lineOfSight',
    notes: 'Hauptband für lokale FM-Kommunikation. Viele Relais verfügbar.',
    color: '#eab308'
  },
  {
    id: 'amateur-70cm',
    name: '70cm',
    nameDE: '70cm-Band',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_70CM_MIN, max: FREQUENCY_LIMITS.AMATEUR_70CM_MAX },
    wavelength: '68 - 70 cm',
    applications: ['FM', 'SSB', 'CW', 'Digital modes', 'Repeaters', 'ATV', 'Satellite'],
    applicationsDE: ['FM', 'SSB', 'CW', 'Digitale Betriebsarten', 'Relais', 'ATV', 'Satellit'],
    propagation: 'Line-of-sight. Less troposcatter than 2m.',
    propagationDE: 'Sichtverbindung. Weniger Troposcatter als 2m.',
    propagationMode: 'lineOfSight',
    notes: 'Breites Band für verschiedene Anwendungen. ATV-Segment.',
    color: '#84cc16'
  },
  {
    id: 'amateur-23cm',
    name: '23cm',
    nameDE: '23cm-Band',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_23CM_MIN, max: FREQUENCY_LIMITS.AMATEUR_23CM_MAX },
    wavelength: '23 - 24 cm',
    applications: ['SSB', 'CW', 'FM', 'ATV', 'EME', 'D-Star'],
    applicationsDE: ['SSB', 'CW', 'FM', 'ATV', 'EME', 'D-Star'],
    propagation: 'Line-of-sight. EME becoming popular.',
    propagationDE: 'Sichtverbindung. EME wird beliebter.',
    propagationMode: 'lineOfSight',
    notes: 'Erste Mikrowellenzuweisung. GPS-L-Band teilt diesen Bereich.',
    color: '#22c55e'
  },
  {
    id: 'amateur-13cm',
    name: '13cm',
    nameDE: '13cm-Band',
    category: 'amateur',
    frequencyHz: { min: FREQUENCY_LIMITS.AMATEUR_13CM_MIN, max: FREQUENCY_LIMITS.AMATEUR_13CM_MAX },
    wavelength: '12,2 - 12,9 cm',
    applications: ['SSB', 'CW', 'ATV', 'EME', 'Microwave experiments'],
    applicationsDE: ['SSB', 'CW', 'ATV', 'EME', 'Mikrowellenexperimente'],
    propagation: 'Strictly line-of-sight. Requires high-gain antennas.',
    propagationDE: 'Streng Sichtverbindung. Erfordert Hochgewinn-Antennen.',
    propagationMode: 'lineOfSight',
    notes: 'Teilt Spektrum mit WLAN 2,4 GHz (ISM). Sekundärstatus.',
    color: '#14b8a6'
  }
];

// ============================================================================
// Rundfunkbänder
// Quelle: ITU Radio Regulations, Frequenznutzungsplan
// ============================================================================

export const BROADCAST_FREQUENCY_BANDS: FrequencyBandDetail[] = [
  {
    id: 'broadcast-lw',
    name: 'Longwave (LW)',
    nameDE: 'Langwelle (LW)',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_LW_MIN, max: FREQUENCY_LIMITS.BROADCAST_LW_MAX },
    wavelength: '1,06 - 2,02 km',
    applications: ['AM broadcasting', 'News', 'Weather'],
    applicationsDE: ['AM-Rundfunk', 'Nachrichten', 'Wetter'],
    propagation: 'Stable ground wave. Range 500-2000 km.',
    propagationDE: 'Stabile Bodenwelle. Reichweite 500-2000 km.',
    propagationMode: 'groundWave',
    notes: 'In Europa noch vereinzelt genutzt. DLF sendete bis 2014 auf LW.',
    color: '#1e40af'
  },
  {
    id: 'broadcast-mw',
    name: 'Mediumwave (MW)',
    nameDE: 'Mittelwelle (MW)',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_MW_MIN, max: FREQUENCY_LIMITS.BROADCAST_MW_MAX },
    wavelength: '187 - 570 m',
    applications: ['AM broadcasting', 'News', 'Sports', 'Talk radio'],
    applicationsDE: ['AM-Rundfunk', 'Nachrichten', 'Sport', 'Talk-Radio'],
    propagation: 'Ground wave by day (~300 km). Sky wave at night (interference).',
    propagationDE: 'Bodenwelle tagsüber (~300 km). Raumwelle nachts (Interferenz).',
    propagationMode: 'mixed',
    notes: 'In Europa weitgehend eingestellt. Noch aktiv in USA, Asien.',
    color: '#3b82f6'
  },
  {
    id: 'broadcast-120m',
    name: 'Tropical 120m',
    nameDE: 'Tropenband 120m',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_120M_MIN, max: FREQUENCY_LIMITS.BROADCAST_120M_MAX },
    wavelength: '120 - 130 m',
    applications: ['Regional broadcasting in tropical areas'],
    applicationsDE: ['Regionaler Rundfunk in tropischen Gebieten'],
    propagation: 'Night sky wave for regional coverage in tropical zones.',
    propagationDE: 'Nächtliche Raumwelle für regionale Abdeckung in Tropenzonen.',
    propagationMode: 'skyWave',
    notes: 'Für tropische Regionen mit hohem atmosphärischem Rauschen.',
    color: '#6366f1'
  },
  {
    id: 'broadcast-90m',
    name: 'Tropical 90m',
    nameDE: 'Tropenband 90m',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_90M_MIN, max: FREQUENCY_LIMITS.BROADCAST_90M_MAX },
    wavelength: '88 - 94 m',
    applications: ['Regional broadcasting in tropical areas'],
    applicationsDE: ['Regionaler Rundfunk in tropischen Gebieten'],
    propagation: 'Night sky wave for tropical regional coverage.',
    propagationDE: 'Nächtliche Raumwelle für tropische Regionalabdeckung.',
    propagationMode: 'skyWave',
    notes: 'Afrika, Südamerika, Südostasien.',
    color: '#8b5cf6'
  },
  {
    id: 'broadcast-75m',
    name: 'Tropical 75m',
    nameDE: 'Tropenband 75m',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_75M_MIN, max: FREQUENCY_LIMITS.BROADCAST_75M_MAX },
    wavelength: '75 - 77 m',
    applications: ['Regional broadcasting in tropical areas'],
    applicationsDE: ['Regionaler Rundfunk in tropischen Gebieten'],
    propagation: 'Night coverage for tropical regions.',
    propagationDE: 'Nachtabdeckung für Tropenregionen.',
    propagationMode: 'skyWave',
    notes: 'Wenige Sender noch aktiv.',
    color: '#a855f7'
  },
  {
    id: 'broadcast-60m',
    name: 'Tropical 60m',
    nameDE: 'Tropenband 60m',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_60M_MIN, max: FREQUENCY_LIMITS.BROADCAST_60M_MAX },
    wavelength: '59 - 63 m',
    applications: ['Regional broadcasting in tropical areas'],
    applicationsDE: ['Regionaler Rundfunk in tropischen Gebieten'],
    propagation: 'Night coverage, less atmospheric noise.',
    propagationDE: 'Nachtabdeckung, weniger atmosphärisches Rauschen.',
    propagationMode: 'skyWave',
    notes: 'Bessere Qualität als tiefere Tropenbänder.',
    color: '#d946ef'
  },
  {
    id: 'broadcast-49m',
    name: '49m Band',
    nameDE: '49m-Band',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_49M_MIN, max: FREQUENCY_LIMITS.BROADCAST_49M_MAX },
    wavelength: '48 - 51 m',
    applications: ['International broadcasting', 'News services'],
    applicationsDE: ['Internationaler Rundfunk', 'Nachrichtendienste'],
    propagation: 'Day and night propagation. Good for regional/continental.',
    propagationDE: 'Tag- und Nachtausbreitung. Gut für regional/kontinental.',
    propagationMode: 'skyWave',
    notes: 'Eines der aktivsten Kurzwellenbänder.',
    color: '#ec4899'
  },
  {
    id: 'broadcast-41m',
    name: '41m Band',
    nameDE: '41m-Band',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_41M_MIN, max: FREQUENCY_LIMITS.BROADCAST_41M_MAX },
    wavelength: '40 - 42 m',
    applications: ['International broadcasting'],
    applicationsDE: ['Internationaler Rundfunk'],
    propagation: 'Best at night for medium-distance DX.',
    propagationDE: 'Nachts am besten für mittlere DX-Distanzen.',
    propagationMode: 'skyWave',
    notes: 'Teilt Bereich mit Amateurfunk 40m.',
    color: '#f43f5e'
  },
  {
    id: 'broadcast-31m',
    name: '31m Band',
    nameDE: '31m-Band',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_31M_MIN, max: FREQUENCY_LIMITS.BROADCAST_31M_MAX },
    wavelength: '30 - 32 m',
    applications: ['International broadcasting', 'Major stations'],
    applicationsDE: ['Internationaler Rundfunk', 'Große Sender'],
    propagation: 'Day and night propagation. Intercontinental reach.',
    propagationDE: 'Tag- und Nachtausbreitung. Interkontinentale Reichweite.',
    propagationMode: 'skyWave',
    notes: 'Sehr populäres Band für internationale Dienste.',
    color: '#fb7185'
  },
  {
    id: 'broadcast-25m',
    name: '25m Band',
    nameDE: '25m-Band',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_25M_MIN, max: FREQUENCY_LIMITS.BROADCAST_25M_MAX },
    wavelength: '25 - 26 m',
    applications: ['International broadcasting'],
    applicationsDE: ['Internationaler Rundfunk'],
    propagation: 'Excellent daytime band for long-distance.',
    propagationDE: 'Hervorragendes Tagesband für Langstrecken.',
    propagationMode: 'skyWave',
    notes: 'Bei hoher Sonnenaktivität ganztägig brauchbar.',
    color: '#f97316'
  },
  {
    id: 'broadcast-22m',
    name: '22m Band',
    nameDE: '22m-Band',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_22M_MIN, max: FREQUENCY_LIMITS.BROADCAST_22M_MAX },
    wavelength: '21,6 - 22,1 m',
    applications: ['International broadcasting'],
    applicationsDE: ['Internationaler Rundfunk'],
    propagation: 'Daytime propagation. Good for tropical paths.',
    propagationDE: 'Tagesausbreitung. Gut für tropische Pfade.',
    propagationMode: 'skyWave',
    notes: 'Weniger überfülltes Band.',
    color: '#f59e0b'
  },
  {
    id: 'broadcast-19m',
    name: '19m Band',
    nameDE: '19m-Band',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_19M_MIN, max: FREQUENCY_LIMITS.BROADCAST_19M_MAX },
    wavelength: '19 - 20 m',
    applications: ['International broadcasting', 'Major stations'],
    applicationsDE: ['Internationaler Rundfunk', 'Große Sender'],
    propagation: 'Best daytime band for intercontinental.',
    propagationDE: 'Bestes Tagesband für interkontinental.',
    propagationMode: 'skyWave',
    notes: 'Eines der meistgenutzten Kurzwellenbänder.',
    color: '#eab308'
  },
  {
    id: 'broadcast-16m',
    name: '16m Band',
    nameDE: '16m-Band',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_16M_MIN, max: FREQUENCY_LIMITS.BROADCAST_16M_MAX },
    wavelength: '16,7 - 17,2 m',
    applications: ['International broadcasting'],
    applicationsDE: ['Internationaler Rundfunk'],
    propagation: 'Daytime propagation. Solar cycle dependent.',
    propagationDE: 'Tagesausbreitung. Sonnenzyklusabhängig.',
    propagationMode: 'skyWave',
    notes: 'Bei niedrigem Sonnenfleckenzyklus oft geschlossen.',
    color: '#84cc16'
  },
  {
    id: 'broadcast-15m',
    name: '15m Band',
    nameDE: '15m-Band',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_15M_MIN, max: FREQUENCY_LIMITS.BROADCAST_15M_MAX },
    wavelength: '15,8 - 15,9 m',
    applications: ['International broadcasting'],
    applicationsDE: ['Internationaler Rundfunk'],
    propagation: 'Daytime propagation. Solar maximum band.',
    propagationDE: 'Tagesausbreitung. Sonnenmaximum-Band.',
    propagationMode: 'skyWave',
    notes: 'Schmales Band, wenige Sender.',
    color: '#22c55e'
  },
  {
    id: 'broadcast-13m',
    name: '13m Band',
    nameDE: '13m-Band',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_13M_MIN, max: FREQUENCY_LIMITS.BROADCAST_13M_MAX },
    wavelength: '13,7 - 14 m',
    applications: ['International broadcasting'],
    applicationsDE: ['Internationaler Rundfunk'],
    propagation: 'Strong solar dependency. Open during high activity.',
    propagationDE: 'Starke Sonnenabhängigkeit. Offen bei hoher Aktivität.',
    propagationMode: 'skyWave',
    notes: 'Grenzt an Amateurfunk 15m.',
    color: '#14b8a6'
  },
  {
    id: 'broadcast-11m',
    name: '11m Band',
    nameDE: '11m-Band',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_11M_MIN, max: FREQUENCY_LIMITS.BROADCAST_11M_MAX },
    wavelength: '11,5 - 11,7 m',
    applications: ['International broadcasting (rare)'],
    applicationsDE: ['Internationaler Rundfunk (selten)'],
    propagation: 'Very solar dependent. Sporadic E possible.',
    propagationDE: 'Sehr sonnenabhängig. Sporadische E möglich.',
    propagationMode: 'skyWave',
    notes: 'Wenig genutzt. Nahe CB-Funk (27 MHz).',
    color: '#0ea5e9'
  },
  {
    id: 'broadcast-fm',
    name: 'FM Band',
    nameDE: 'UKW-Rundfunk',
    category: 'broadcast',
    frequencyHz: { min: FREQUENCY_LIMITS.BROADCAST_FM_MIN, max: FREQUENCY_LIMITS.BROADCAST_FM_MAX },
    wavelength: '2,78 - 3,43 m',
    applications: ['FM stereo broadcasting', 'RDS'],
    applicationsDE: ['UKW-Stereorundfunk', 'RDS'],
    propagation: 'Line-of-sight. Typical range 50-100 km from transmitter.',
    propagationDE: 'Sichtverbindung. Typische Reichweite 50-100 km vom Sender.',
    propagationMode: 'lineOfSight',
    notes: 'Hauptmedium für terrestrischen Hörfunk in Europa.',
    color: '#ef4444'
  }
];

// ============================================================================
// Zusammengefasste Exporte
// ============================================================================

/** Alle Frequenzbänder aller Kategorien */
export const ALL_FREQUENCY_BANDS: FrequencyBandDetail[] = [
  ...ITU_FREQUENCY_BANDS,
  ...IEEE_FREQUENCY_BANDS,
  ...NATO_FREQUENCY_BANDS,
  ...AMATEUR_FREQUENCY_BANDS,
  ...BROADCAST_FREQUENCY_BANDS
];

/** Gruppierte Bänder nach Kategorie */
export const FREQUENCY_BANDS_BY_CATEGORY = {
  itu: ITU_FREQUENCY_BANDS,
  ieee: IEEE_FREQUENCY_BANDS,
  nato: NATO_FREQUENCY_BANDS,
  amateur: AMATEUR_FREQUENCY_BANDS,
  broadcast: BROADCAST_FREQUENCY_BANDS
} as const;

// ============================================================================
// Hilfsfunktionen
// ============================================================================

/**
 * Findet ein Frequenzband anhand der Frequenz
 * @param frequencyHz - Frequenz in Hertz
 * @param category - Optionale Kategorie zur Einschränkung
 * @returns Das passende Band oder undefined
 */
export function getBandByFrequency(
  frequencyHz: number,
  category?: FrequencyBandCategory
): FrequencyBandDetail | undefined {
  if (frequencyHz <= 0 || !isFinite(frequencyHz)) {
    return undefined;
  }

  const bandsToSearch = category
    ? FREQUENCY_BANDS_BY_CATEGORY[category]
    : ALL_FREQUENCY_BANDS;

  return bandsToSearch.find(
    band => frequencyHz >= band.frequencyHz.min && frequencyHz <= band.frequencyHz.max
  );
}

/**
 * Findet alle Frequenzbänder, die eine bestimmte Frequenz enthalten
 * @param frequencyHz - Frequenz in Hertz
 * @param categories - Optionale Kategorien zur Einschränkung
 * @returns Array aller passenden Bänder
 */
export function getAllBandsForFrequency(
  frequencyHz: number,
  categories?: FrequencyBandCategory[]
): FrequencyBandDetail[] {
  if (frequencyHz <= 0 || !isFinite(frequencyHz)) {
    return [];
  }

  let bandsToSearch: FrequencyBandDetail[];

  if (categories && categories.length > 0) {
    bandsToSearch = categories.flatMap(cat => FREQUENCY_BANDS_BY_CATEGORY[cat]);
  } else {
    bandsToSearch = ALL_FREQUENCY_BANDS;
  }

  return bandsToSearch.filter(
    band => frequencyHz >= band.frequencyHz.min && frequencyHz <= band.frequencyHz.max
  );
}

/**
 * Findet ein Band anhand seiner ID
 * @param id - Band-ID
 * @returns Das Band oder undefined
 */
export function getBandById(id: string): FrequencyBandDetail | undefined {
  return ALL_FREQUENCY_BANDS.find(band => band.id === id);
}

/**
 * Berechnet die Wellenlänge für eine Frequenz
 * @param frequencyHz - Frequenz in Hertz
 * @returns Wellenlänge in Metern
 */
export function calculateWavelength(frequencyHz: number): number {
  if (frequencyHz <= 0 || !isFinite(frequencyHz)) {
    return 0;
  }
  return SPEED_OF_LIGHT / frequencyHz;
}

/**
 * Formatiert eine Wellenlänge mit passender Einheit
 * @param wavelengthMeters - Wellenlänge in Metern
 * @returns Formatierter String mit Einheit
 */
export function formatWavelengthWithUnit(wavelengthMeters: number): string {
  if (wavelengthMeters <= 0 || !isFinite(wavelengthMeters)) {
    return '0 m';
  }

  if (wavelengthMeters >= 1000) {
    return `${(wavelengthMeters / 1000).toFixed(2)} km`;
  }
  if (wavelengthMeters >= 1) {
    return `${wavelengthMeters.toFixed(2)} m`;
  }
  if (wavelengthMeters >= 0.01) {
    return `${(wavelengthMeters * 100).toFixed(2)} cm`;
  }
  if (wavelengthMeters >= 0.001) {
    return `${(wavelengthMeters * 1000).toFixed(2)} mm`;
  }
  if (wavelengthMeters >= 1e-6) {
    return `${(wavelengthMeters * 1e6).toFixed(2)} \u00B5m`;
  }
  return `${(wavelengthMeters * 1e9).toFixed(2)} nm`;
}

/**
 * Ermittelt den primären Ausbreitungsmodus für eine Frequenz
 * @param frequencyHz - Frequenz in Hertz
 * @returns Der wahrscheinlichste Ausbreitungsmodus
 */
export function getPropagationModeForFrequency(frequencyHz: number): PropagationModeType {
  if (frequencyHz <= 0 || !isFinite(frequencyHz)) {
    return 'lineOfSight';
  }

  // U-Boot-Kommunikation: ELF bis ULF
  if (frequencyHz < FREQUENCY_LIMITS.ULF_MAX) {
    return 'submarine';
  }

  // Bodenwelle dominant: VLF bis LF
  if (frequencyHz < FREQUENCY_LIMITS.LF_MAX) {
    return 'groundWave';
  }

  // Gemischt (Boden- und Raumwelle): MF
  if (frequencyHz < FREQUENCY_LIMITS.MF_MAX) {
    return 'mixed';
  }

  // Raumwelle dominant: HF
  if (frequencyHz < FREQUENCY_LIMITS.HF_MAX) {
    return 'skyWave';
  }

  // Sichtverbindung: VHF und höher
  return 'lineOfSight';
}

/**
 * Gibt eine deutsche Beschreibung des Ausbreitungsmodus zurück
 * @param mode - Ausbreitungsmodus
 * @returns Deutsche Beschreibung
 */
export function getPropagationModeDescriptionDE(mode: PropagationModeType): string {
  const descriptions: Record<PropagationModeType, string> = {
    submarine: 'U-Boot-Kommunikation (Seewasser-Durchdringung)',
    groundWave: 'Bodenwelle (folgt der Erdoberfläche)',
    skyWave: 'Raumwelle (Ionosphärenreflexion)',
    lineOfSight: 'Sichtverbindung (quasi-optisch)',
    mixed: 'Gemischt (Boden- und Raumwelle)'
  };
  return descriptions[mode];
}

/**
 * Gibt eine englische Beschreibung des Ausbreitungsmodus zurück
 * @param mode - Ausbreitungsmodus
 * @returns Englische Beschreibung
 */
export function getPropagationModeDescription(mode: PropagationModeType): string {
  const descriptions: Record<PropagationModeType, string> = {
    submarine: 'Submarine communication (seawater penetration)',
    groundWave: 'Ground wave (follows Earth surface)',
    skyWave: 'Sky wave (ionospheric reflection)',
    lineOfSight: 'Line-of-sight (quasi-optical)',
    mixed: 'Mixed (ground and sky wave)'
  };
  return descriptions[mode];
}

/**
 * Sucht Bänder nach Namen oder Anwendung
 * @param searchTerm - Suchbegriff
 * @param language - Sprache ('en' oder 'de')
 * @returns Array passender Bänder
 */
export function searchBands(
  searchTerm: string,
  language: 'en' | 'de' = 'de'
): FrequencyBandDetail[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return [];
  }

  const term = searchTerm.toLowerCase().trim();

  return ALL_FREQUENCY_BANDS.filter(band => {
    const name = language === 'de' ? band.nameDE : band.name;
    const apps = language === 'de' ? band.applicationsDE : band.applications;
    const prop = language === 'de' ? band.propagationDE : band.propagation;

    return (
      name.toLowerCase().includes(term) ||
      band.id.toLowerCase().includes(term) ||
      apps.some(app => app.toLowerCase().includes(term)) ||
      prop.toLowerCase().includes(term) ||
      (band.notes && band.notes.toLowerCase().includes(term))
    );
  });
}

/**
 * Gibt die ITU-Bandbezeichnung für eine Frequenz zurück
 * @param frequencyHz - Frequenz in Hertz
 * @returns ITU-Bandbezeichnung oder undefined
 */
export function getITUBandName(frequencyHz: number): string | undefined {
  const band = getBandByFrequency(frequencyHz, 'itu');
  return band?.name;
}

/**
 * Gibt die IEEE-Bandbezeichnung für eine Frequenz zurück
 * @param frequencyHz - Frequenz in Hertz
 * @returns IEEE-Bandbezeichnung oder undefined
 */
export function getIEEEBandName(frequencyHz: number): string | undefined {
  const band = getBandByFrequency(frequencyHz, 'ieee');
  return band?.name;
}

/**
 * Gibt die NATO-Bandbezeichnung für eine Frequenz zurück
 * @param frequencyHz - Frequenz in Hertz
 * @returns NATO-Bandbezeichnung oder undefined
 */
export function getNATOBandName(frequencyHz: number): string | undefined {
  const band = getBandByFrequency(frequencyHz, 'nato');
  return band?.name;
}
