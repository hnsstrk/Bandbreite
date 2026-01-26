/**
 * RF Application Database
 *
 * Detailed frequency allocations for various radio services and applications.
 * Organized by category for easy lookup and visualization.
 *
 * Sources:
 * - ITU Radio Regulations
 * - ETSI standards
 * - National frequency allocation tables (BNetzA, FCC)
 *
 * NOTE: Frequency allocations may vary by region. Values shown are typical
 * for Europe/Germany unless otherwise noted.
 */

/**
 * Application category classification
 */
export type ApplicationCategory =
  | 'broadcast'      // Rundfunk (AM, FM, DAB, DVB)
  | 'mobile'         // Mobilfunk (GSM, UMTS, LTE, 5G)
  | 'wlan'           // WLAN/WiFi
  | 'satellite'      // Satellit (GPS, TV, Internet)
  | 'radar'          // Radar (Wetter, Flug, Auto)
  | 'amateur'        // Amateurfunk
  | 'navigation'     // Navigation (GPS, LORAN, etc.)
  | 'military'       // Militaerische Anwendungen
  | 'ism'            // Industrial, Scientific, Medical
  | 'pmr'            // Professional/Private Mobile Radio
  | 'maritime'       // Seefunk
  | 'aviation';      // Flugfunk

/**
 * RF Application interface
 */
export interface RFApplication {
  id: string;
  name: string;
  nameDE: string;
  minHz: number;
  maxHz: number;
  category: ApplicationCategory;
  description: string;
  descriptionDE: string;
  region?: 'worldwide' | 'europe' | 'usa' | 'asia';
  standard?: string;
  notes?: string;
}

// ============================================================================
// Broadcast Applications (Rundfunk)
// ============================================================================

export const BROADCAST_APPLICATIONS: RFApplication[] = [
  {
    id: 'lw-broadcast',
    name: 'Long Wave Broadcast',
    nameDE: 'Langwellen-Rundfunk',
    minHz: 148.5e3,
    maxHz: 283.5e3,
    category: 'broadcast',
    description: 'Long wave AM broadcasting',
    descriptionDE: 'Langwellen-AM-Rundfunk (ITU Region 1)',
    region: 'europe',
    notes: 'Stark ruecklaeufig, viele Sender abgeschaltet'
  },
  {
    id: 'mw-broadcast',
    name: 'Medium Wave Broadcast (AM)',
    nameDE: 'Mittelwellen-Rundfunk (AM)',
    minHz: 526.5e3,
    maxHz: 1606.5e3,
    category: 'broadcast',
    description: 'AM radio broadcasting',
    descriptionDE: 'AM-Rundfunk (Mittelwelle)',
    region: 'worldwide',
    standard: 'ITU RR Article 12',
    notes: 'Kanalraster 9 kHz (Europa) bzw. 10 kHz (Amerika)'
  },
  {
    id: 'sw-broadcast',
    name: 'Shortwave Broadcast',
    nameDE: 'Kurzwellen-Rundfunk',
    minHz: 5.9e6,
    maxHz: 26.1e6,
    category: 'broadcast',
    description: 'International shortwave broadcasting (multiple bands)',
    descriptionDE: 'Internationaler Kurzwellen-Rundfunk (verschiedene Baender)',
    region: 'worldwide',
    notes: 'Mehrere Teilbaender: 49m, 41m, 31m, 25m, 22m, 19m, 16m, 13m, 11m'
  },
  {
    id: 'fm-broadcast',
    name: 'FM Broadcast',
    nameDE: 'UKW-Rundfunk (FM)',
    minHz: 87.5e6,
    maxHz: 108e6,
    category: 'broadcast',
    description: 'FM radio broadcasting',
    descriptionDE: 'UKW-FM-Rundfunk',
    region: 'worldwide',
    standard: 'ITU RR Appendix 10',
    notes: 'Kanalraster 100 kHz, Stereo mit 19 kHz Pilotton'
  },
  {
    id: 'dab-vhf',
    name: 'DAB+ (Band III)',
    nameDE: 'DAB+ (Band III)',
    minHz: 174e6,
    maxHz: 230e6,
    category: 'broadcast',
    description: 'Digital Audio Broadcasting in VHF Band III',
    descriptionDE: 'Digitaler Rundfunk im VHF-Band III',
    region: 'europe',
    standard: 'ETSI EN 300 401',
    notes: 'Bloecke 5A-13F, je 1,536 MHz Bandbreite'
  },
  {
    id: 'dab-l',
    name: 'DAB+ (L-Band)',
    nameDE: 'DAB+ (L-Band)',
    minHz: 1452e6,
    maxHz: 1492e6,
    category: 'broadcast',
    description: 'Digital Audio Broadcasting in L-Band',
    descriptionDE: 'Digitaler Rundfunk im L-Band',
    region: 'europe',
    standard: 'ETSI EN 300 401',
    notes: 'Bloecke LA-LW, in Deutschland nicht genutzt'
  },
  {
    id: 'dvb-t-uhf',
    name: 'DVB-T/T2 (UHF)',
    nameDE: 'DVB-T/T2 (UHF)',
    minHz: 470e6,
    maxHz: 694e6,
    category: 'broadcast',
    description: 'Digital terrestrial television',
    descriptionDE: 'Digitales terrestrisches Fernsehen',
    region: 'europe',
    standard: 'ETSI EN 302 755',
    notes: 'Kanaele 21-48, oberer Bereich (700 MHz) an Mobilfunk abgegeben'
  },
];

// ============================================================================
// Mobile Communications (Mobilfunk)
// ============================================================================

export const MOBILE_APPLICATIONS: RFApplication[] = [
  {
    id: 'gsm-900',
    name: 'GSM 900',
    nameDE: 'GSM 900',
    minHz: 880e6,
    maxHz: 960e6,
    category: 'mobile',
    description: '2G mobile communications (900 MHz)',
    descriptionDE: '2G-Mobilfunk (900 MHz Band)',
    region: 'europe',
    standard: 'ETSI TS 145 005',
    notes: 'Uplink 880-915 MHz, Downlink 925-960 MHz. Wird fuer LTE umgenutzt.'
  },
  {
    id: 'gsm-1800',
    name: 'GSM 1800 / DCS',
    nameDE: 'GSM 1800 / DCS',
    minHz: 1710e6,
    maxHz: 1880e6,
    category: 'mobile',
    description: '2G mobile communications (1800 MHz)',
    descriptionDE: '2G-Mobilfunk (1800 MHz Band)',
    region: 'europe',
    standard: 'ETSI TS 145 005',
    notes: 'Uplink 1710-1785 MHz, Downlink 1805-1880 MHz'
  },
  {
    id: 'umts-2100',
    name: 'UMTS 2100 / 3G',
    nameDE: 'UMTS 2100 / 3G',
    minHz: 1920e6,
    maxHz: 2170e6,
    category: 'mobile',
    description: '3G mobile communications',
    descriptionDE: '3G-Mobilfunk (UMTS)',
    region: 'worldwide',
    standard: '3GPP TS 25.104',
    notes: 'Uplink 1920-1980 MHz, Downlink 2110-2170 MHz. Band 1.'
  },
  {
    id: 'lte-700',
    name: 'LTE Band 28 (700 MHz)',
    nameDE: 'LTE Band 28 (700 MHz)',
    minHz: 703e6,
    maxHz: 803e6,
    category: 'mobile',
    description: '4G LTE in 700 MHz band (Digital Dividend 2)',
    descriptionDE: '4G LTE im 700 MHz Band (Digitale Dividende 2)',
    region: 'europe',
    standard: '3GPP TS 36.104',
    notes: 'Gute Gebaeudedurchdringung, ehemalige TV-Frequenzen'
  },
  {
    id: 'lte-800',
    name: 'LTE Band 20 (800 MHz)',
    nameDE: 'LTE Band 20 (800 MHz)',
    minHz: 791e6,
    maxHz: 862e6,
    category: 'mobile',
    description: '4G LTE in 800 MHz band (Digital Dividend 1)',
    descriptionDE: '4G LTE im 800 MHz Band (Digitale Dividende 1)',
    region: 'europe',
    standard: '3GPP TS 36.104',
    notes: 'Uplink 832-862 MHz, Downlink 791-821 MHz'
  },
  {
    id: 'lte-1800',
    name: 'LTE Band 3 (1800 MHz)',
    nameDE: 'LTE Band 3 (1800 MHz)',
    minHz: 1710e6,
    maxHz: 1880e6,
    category: 'mobile',
    description: '4G LTE in 1800 MHz band',
    descriptionDE: '4G LTE im 1800 MHz Band',
    region: 'europe',
    standard: '3GPP TS 36.104',
    notes: 'Refarming von GSM-1800. Hohe Kapazitaet in Staedten.'
  },
  {
    id: 'lte-2600',
    name: 'LTE Band 7 (2600 MHz)',
    nameDE: 'LTE Band 7 (2600 MHz)',
    minHz: 2500e6,
    maxHz: 2690e6,
    category: 'mobile',
    description: '4G LTE in 2600 MHz band',
    descriptionDE: '4G LTE im 2600 MHz Band',
    region: 'worldwide',
    standard: '3GPP TS 36.104',
    notes: 'Hohe Kapazitaet, begrenzte Reichweite. FDD und TDD Bereiche.'
  },
  {
    id: '5g-n78',
    name: '5G NR n78 (3.5 GHz)',
    nameDE: '5G NR n78 (3,5 GHz)',
    minHz: 3300e6,
    maxHz: 3800e6,
    category: 'mobile',
    description: '5G New Radio in C-Band (FR1)',
    descriptionDE: '5G New Radio im C-Band (FR1)',
    region: 'worldwide',
    standard: '3GPP TS 38.104',
    notes: 'Primaeres 5G-Band. TDD-Betrieb, bis 100 MHz Kanalbreite.'
  },
  {
    id: '5g-n79',
    name: '5G NR n79 (4.5 GHz)',
    nameDE: '5G NR n79 (4,5 GHz)',
    minHz: 4400e6,
    maxHz: 5000e6,
    category: 'mobile',
    description: '5G New Radio in 4.5 GHz band',
    descriptionDE: '5G New Radio im 4,5 GHz Band',
    region: 'asia',
    standard: '3GPP TS 38.104',
    notes: 'Hauptsaechlich in Asien genutzt (Japan, China)'
  },
  {
    id: '5g-n258',
    name: '5G NR n258 (26 GHz mmWave)',
    nameDE: '5G NR n258 (26 GHz mmWave)',
    minHz: 24250e6,
    maxHz: 27500e6,
    category: 'mobile',
    description: '5G millimeter wave (FR2)',
    descriptionDE: '5G Millimeterwellen (FR2)',
    region: 'worldwide',
    standard: '3GPP TS 38.104',
    notes: 'Sehr hohe Datenraten, sehr begrenzte Reichweite (<500m)'
  },
  {
    id: '5g-n260',
    name: '5G NR n260 (39 GHz mmWave)',
    nameDE: '5G NR n260 (39 GHz mmWave)',
    minHz: 37000e6,
    maxHz: 40000e6,
    category: 'mobile',
    description: '5G millimeter wave (FR2)',
    descriptionDE: '5G Millimeterwellen (FR2)',
    region: 'usa',
    standard: '3GPP TS 38.104',
    notes: 'Hauptsaechlich in USA. Bis zu 800 MHz Kanalbreite.'
  },
];

// ============================================================================
// WLAN / WiFi
// ============================================================================

export const WLAN_APPLICATIONS: RFApplication[] = [
  {
    id: 'wifi-2g',
    name: 'WiFi 2.4 GHz',
    nameDE: 'WLAN 2,4 GHz',
    minHz: 2400e6,
    maxHz: 2483.5e6,
    category: 'wlan',
    description: 'WiFi in 2.4 GHz ISM band (802.11b/g/n/ax)',
    descriptionDE: 'WLAN im 2,4 GHz ISM-Band',
    region: 'worldwide',
    standard: 'IEEE 802.11b/g/n/ax',
    notes: '13 Kanaele in Europa (14 in Japan), nur 3 ueberlappungsfrei'
  },
  {
    id: 'wifi-5g-low',
    name: 'WiFi 5 GHz (UNII-1/2)',
    nameDE: 'WLAN 5 GHz (UNII-1/2)',
    minHz: 5150e6,
    maxHz: 5350e6,
    category: 'wlan',
    description: 'WiFi in 5 GHz band (lower channels)',
    descriptionDE: 'WLAN im 5 GHz Band (untere Kanaele)',
    region: 'worldwide',
    standard: 'IEEE 802.11a/n/ac/ax',
    notes: 'UNII-2 erfordert DFS (Radar Detection) in Europa'
  },
  {
    id: 'wifi-5g-high',
    name: 'WiFi 5 GHz (UNII-3)',
    nameDE: 'WLAN 5 GHz (UNII-3)',
    minHz: 5470e6,
    maxHz: 5725e6,
    category: 'wlan',
    description: 'WiFi in 5 GHz band (upper channels)',
    descriptionDE: 'WLAN im 5 GHz Band (obere Kanaele)',
    region: 'worldwide',
    standard: 'IEEE 802.11a/n/ac/ax',
    notes: 'DFS erforderlich wegen Wetterradar'
  },
  {
    id: 'wifi-5g-ism',
    name: 'WiFi 5.8 GHz (ISM)',
    nameDE: 'WLAN 5,8 GHz (ISM)',
    minHz: 5725e6,
    maxHz: 5875e6,
    category: 'wlan',
    description: 'WiFi in 5.8 GHz ISM band',
    descriptionDE: 'WLAN im 5,8 GHz ISM-Band',
    region: 'worldwide',
    standard: 'IEEE 802.11a/n/ac/ax',
    notes: 'Kein DFS erforderlich, aber hoehere Leistungsgrenzen erlaubt'
  },
  {
    id: 'wifi-6e',
    name: 'WiFi 6E (6 GHz)',
    nameDE: 'WLAN 6E (6 GHz)',
    minHz: 5925e6,
    maxHz: 7125e6,
    category: 'wlan',
    description: 'WiFi 6E in 6 GHz band',
    descriptionDE: 'WLAN 6E im 6 GHz Band',
    region: 'worldwide',
    standard: 'IEEE 802.11ax',
    notes: '1200 MHz neues Spektrum. LPI (Low Power Indoor) und VLP (Very Low Power).'
  },
  {
    id: 'wifi-60g',
    name: 'WiGig (60 GHz)',
    nameDE: 'WiGig (60 GHz)',
    minHz: 57e9,
    maxHz: 71e9,
    category: 'wlan',
    description: 'WiFi in 60 GHz band (802.11ad/ay)',
    descriptionDE: 'WLAN im 60 GHz Band',
    region: 'worldwide',
    standard: 'IEEE 802.11ad/ay',
    notes: 'Sehr hohe Datenraten (bis 100 Gbit/s), sehr kurze Reichweite (<10m)'
  },
];

// ============================================================================
// Satellite Communications
// ============================================================================

export const SATELLITE_APPLICATIONS: RFApplication[] = [
  {
    id: 'gps-l5',
    name: 'GPS L5',
    nameDE: 'GPS L5',
    minHz: 1164e6,
    maxHz: 1189e6,
    category: 'satellite',
    description: 'GPS L5 signal (Safety of Life)',
    descriptionDE: 'GPS L5-Signal (Safety of Life)',
    region: 'worldwide',
    standard: 'IS-GPS-705',
    notes: 'Modernster GPS-Signal, hohe Stoerfestigkeit'
  },
  {
    id: 'gps-l2',
    name: 'GPS L2',
    nameDE: 'GPS L2',
    minHz: 1215e6,
    maxHz: 1240e6,
    category: 'satellite',
    description: 'GPS L2 signal (precision)',
    descriptionDE: 'GPS L2-Signal (Praezision)',
    region: 'worldwide',
    standard: 'IS-GPS-200',
    notes: 'Fuer hochgenaue Vermessung (cm-Genauigkeit)'
  },
  {
    id: 'gps-l1',
    name: 'GPS L1',
    nameDE: 'GPS L1',
    minHz: 1559e6,
    maxHz: 1610e6,
    category: 'satellite',
    description: 'GPS L1 signal (primary civilian)',
    descriptionDE: 'GPS L1-Signal (primaer zivil)',
    region: 'worldwide',
    standard: 'IS-GPS-200',
    notes: 'Hauptsignal fuer zivile Empfaenger (1575,42 MHz)'
  },
  {
    id: 'galileo-e1',
    name: 'Galileo E1',
    nameDE: 'Galileo E1',
    minHz: 1559e6,
    maxHz: 1591e6,
    category: 'satellite',
    description: 'Galileo E1 signal (open service)',
    descriptionDE: 'Galileo E1-Signal (offener Dienst)',
    region: 'europe',
    standard: 'Galileo OS SIS ICD',
    notes: 'Kompatibel mit GPS L1'
  },
  {
    id: 'glonass-l1',
    name: 'GLONASS L1',
    nameDE: 'GLONASS L1',
    minHz: 1598.0625e6,
    maxHz: 1605.375e6,
    category: 'satellite',
    description: 'GLONASS L1 signal',
    descriptionDE: 'GLONASS L1-Signal',
    region: 'worldwide',
    notes: 'Russisches Navigationssystem, FDMA-Verfahren'
  },
  {
    id: 'sat-l-band',
    name: 'Satellite L-Band (Mobile)',
    nameDE: 'Satelliten L-Band (Mobil)',
    minHz: 1525e6,
    maxHz: 1559e6,
    category: 'satellite',
    description: 'Mobile satellite services (Inmarsat, Iridium)',
    descriptionDE: 'Mobile Satellitendienste',
    region: 'worldwide',
    notes: 'Inmarsat, Thuraya, etc. Downlink.'
  },
  {
    id: 'sat-c-band',
    name: 'Satellite C-Band',
    nameDE: 'Satelliten C-Band',
    minHz: 3.7e9,
    maxHz: 4.2e9,
    category: 'satellite',
    description: 'Fixed satellite services (C-Band downlink)',
    descriptionDE: 'Feste Satellitendienste (C-Band Downlink)',
    region: 'worldwide',
    notes: 'Geringe Regendaempfung, grosse Antennen erforderlich'
  },
  {
    id: 'sat-ku-downlink',
    name: 'Satellite Ku-Band (Downlink)',
    nameDE: 'Satelliten Ku-Band (Downlink)',
    minHz: 10.7e9,
    maxHz: 12.75e9,
    category: 'satellite',
    description: 'Satellite TV and data (Ku-Band downlink)',
    descriptionDE: 'Satelliten-TV und Daten (Ku-Band Downlink)',
    region: 'worldwide',
    notes: 'Standard fuer Satelliten-TV (Astra, Eutelsat)'
  },
  {
    id: 'sat-ku-uplink',
    name: 'Satellite Ku-Band (Uplink)',
    nameDE: 'Satelliten Ku-Band (Uplink)',
    minHz: 14e9,
    maxHz: 14.5e9,
    category: 'satellite',
    description: 'Satellite uplink (Ku-Band)',
    descriptionDE: 'Satelliten-Uplink (Ku-Band)',
    region: 'worldwide',
    notes: 'Fuer VSAT-Terminals und Uplink-Stationen'
  },
  {
    id: 'sat-ka-downlink',
    name: 'Satellite Ka-Band (Downlink)',
    nameDE: 'Satelliten Ka-Band (Downlink)',
    minHz: 17.7e9,
    maxHz: 21.2e9,
    category: 'satellite',
    description: 'High-throughput satellite (Ka-Band downlink)',
    descriptionDE: 'Hochdurchsatz-Satellit (Ka-Band Downlink)',
    region: 'worldwide',
    notes: 'Starlink, OneWeb, etc. Hohe Regendaempfung.'
  },
  {
    id: 'sat-ka-uplink',
    name: 'Satellite Ka-Band (Uplink)',
    nameDE: 'Satelliten Ka-Band (Uplink)',
    minHz: 27.5e9,
    maxHz: 31e9,
    category: 'satellite',
    description: 'High-throughput satellite (Ka-Band uplink)',
    descriptionDE: 'Hochdurchsatz-Satellit (Ka-Band Uplink)',
    region: 'worldwide',
    notes: 'Moderne HTS-Systeme nutzen dieses Band'
  },
];

// ============================================================================
// Radar Applications
// ============================================================================

export const RADAR_APPLICATIONS: RFApplication[] = [
  {
    id: 'radar-atc-l',
    name: 'ATC Radar (L-Band)',
    nameDE: 'Flugsicherungsradar (L-Band)',
    minHz: 1215e6,
    maxHz: 1400e6,
    category: 'radar',
    description: 'Air traffic control primary surveillance radar',
    descriptionDE: 'Primaerradar fuer Flugsicherung',
    region: 'worldwide',
    notes: 'Grosse Reichweite (bis 400 km), Rotation alle 4-12s'
  },
  {
    id: 'radar-atc-s',
    name: 'ATC Radar (S-Band)',
    nameDE: 'Flugsicherungsradar (S-Band)',
    minHz: 2.7e9,
    maxHz: 2.9e9,
    category: 'radar',
    description: 'Air traffic control radar (secondary)',
    descriptionDE: 'Sekundaerradar fuer Flugsicherung',
    region: 'worldwide',
    notes: 'Terminal Area Radar, mittlere Reichweite'
  },
  {
    id: 'radar-weather',
    name: 'Weather Radar',
    nameDE: 'Wetterradar',
    minHz: 5.25e9,
    maxHz: 5.725e9,
    category: 'radar',
    description: 'Meteorological radar (C-Band)',
    descriptionDE: 'Meteorologisches Radar (C-Band)',
    region: 'worldwide',
    notes: 'Doppler-Radar fuer Niederschlagsmessung'
  },
  {
    id: 'radar-marine',
    name: 'Marine Radar (X-Band)',
    nameDE: 'Marine-Radar (X-Band)',
    minHz: 9.2e9,
    maxHz: 9.5e9,
    category: 'radar',
    description: 'Ship navigation radar',
    descriptionDE: 'Schiffsnavigationsradar',
    region: 'worldwide',
    notes: 'Standard auf allen groesseren Schiffen'
  },
  {
    id: 'radar-police-k',
    name: 'Speed Radar (K-Band)',
    nameDE: 'Geschwindigkeitsradar (K-Band)',
    minHz: 24.05e9,
    maxHz: 24.25e9,
    category: 'radar',
    description: 'Police speed enforcement radar',
    descriptionDE: 'Polizei-Geschwindigkeitsmessung',
    region: 'europe',
    notes: 'Typisch 24,125 GHz ISM-Band'
  },
  {
    id: 'radar-police-ka',
    name: 'Speed Radar (Ka-Band)',
    nameDE: 'Geschwindigkeitsradar (Ka-Band)',
    minHz: 34e9,
    maxHz: 36e9,
    category: 'radar',
    description: 'Police speed enforcement radar (Ka-Band)',
    descriptionDE: 'Polizei-Geschwindigkeitsmessung (Ka-Band)',
    region: 'usa',
    notes: 'Haeufig in USA, schwer zu detektieren'
  },
  {
    id: 'radar-automotive-24',
    name: 'Automotive Radar (24 GHz)',
    nameDE: 'Kfz-Radar (24 GHz)',
    minHz: 24e9,
    maxHz: 24.25e9,
    category: 'radar',
    description: 'Short range automotive radar',
    descriptionDE: 'Kurzstrecken-Kfz-Radar',
    region: 'worldwide',
    notes: 'Wird durch 77 GHz ersetzt (Auslauf 2022)'
  },
  {
    id: 'radar-automotive-77',
    name: 'Automotive Radar (77 GHz)',
    nameDE: 'Kfz-Radar (77 GHz)',
    minHz: 76e9,
    maxHz: 81e9,
    category: 'radar',
    description: 'Long and short range automotive radar',
    descriptionDE: 'Lang- und Kurzstrecken-Kfz-Radar',
    region: 'worldwide',
    standard: 'ETSI EN 301 091',
    notes: 'Standard fuer modernes ADAS, ACC, AEB'
  },
];

// ============================================================================
// Amateur Radio
// ============================================================================

export const AMATEUR_APPLICATIONS: RFApplication[] = [
  {
    id: 'ham-160m',
    name: 'Amateur 160m Band',
    nameDE: 'Amateurfunk 160m',
    minHz: 1.81e6,
    maxHz: 2e6,
    category: 'amateur',
    description: 'Top band, night-time propagation',
    descriptionDE: 'Top-Band, naechtliche Ausbreitung',
    region: 'worldwide',
    notes: 'Bodenwelle und Raumwelle, hauptsaechlich nachts'
  },
  {
    id: 'ham-80m',
    name: 'Amateur 80m Band',
    nameDE: 'Amateurfunk 80m',
    minHz: 3.5e6,
    maxHz: 3.8e6,
    category: 'amateur',
    description: 'Regional communication',
    descriptionDE: 'Regionale Kommunikation',
    region: 'europe',
    notes: 'Europa: 3,5-3,8 MHz. USA: 3,5-4,0 MHz'
  },
  {
    id: 'ham-40m',
    name: 'Amateur 40m Band',
    nameDE: 'Amateurfunk 40m',
    minHz: 7e6,
    maxHz: 7.2e6,
    category: 'amateur',
    description: 'Day and night band, continental',
    descriptionDE: 'Tag- und Nachtband, kontinental',
    region: 'europe',
    notes: 'Gutes DX-Band nachts'
  },
  {
    id: 'ham-20m',
    name: 'Amateur 20m Band',
    nameDE: 'Amateurfunk 20m',
    minHz: 14e6,
    maxHz: 14.35e6,
    category: 'amateur',
    description: 'Primary DX band, worldwide',
    descriptionDE: 'Primaeres DX-Band, weltweit',
    region: 'worldwide',
    notes: 'Bestes Band fuer weltweite Verbindungen'
  },
  {
    id: 'ham-15m',
    name: 'Amateur 15m Band',
    nameDE: 'Amateurfunk 15m',
    minHz: 21e6,
    maxHz: 21.45e6,
    category: 'amateur',
    description: 'DX band, solar cycle dependent',
    descriptionDE: 'DX-Band, sonnenzyklusabhaengig',
    region: 'worldwide',
    notes: 'Offen bei hoher Sonnenaktivitaet'
  },
  {
    id: 'ham-10m',
    name: 'Amateur 10m Band',
    nameDE: 'Amateurfunk 10m',
    minHz: 28e6,
    maxHz: 29.7e6,
    category: 'amateur',
    description: 'DX band, best at solar maximum',
    descriptionDE: 'DX-Band, optimal bei Sonnenmaximum',
    region: 'worldwide',
    notes: 'Sporadische E-Schicht und F2-Ausbreitung'
  },
  {
    id: 'ham-6m',
    name: 'Amateur 6m Band',
    nameDE: 'Amateurfunk 6m',
    minHz: 50e6,
    maxHz: 54e6,
    category: 'amateur',
    description: 'Magic band, sporadic E propagation',
    descriptionDE: 'Magic Band, sporadische E-Ausbreitung',
    region: 'worldwide',
    notes: 'Uebergang HF/VHF, unvorhersagbare Ausbreitung'
  },
  {
    id: 'ham-2m',
    name: 'Amateur 2m Band',
    nameDE: 'Amateurfunk 2m',
    minHz: 144e6,
    maxHz: 146e6,
    category: 'amateur',
    description: 'Primary VHF amateur band',
    descriptionDE: 'Primaeres VHF-Amateurfunkband',
    region: 'europe',
    notes: 'FM-Relais, SSB, digitale Betriebsarten'
  },
  {
    id: 'ham-70cm',
    name: 'Amateur 70cm Band',
    nameDE: 'Amateurfunk 70cm',
    minHz: 430e6,
    maxHz: 440e6,
    category: 'amateur',
    description: 'Primary UHF amateur band',
    descriptionDE: 'Primaeres UHF-Amateurfunkband',
    region: 'europe',
    notes: 'FM-Relais, ATV, Satelliten'
  },
  {
    id: 'ham-23cm',
    name: 'Amateur 23cm Band',
    nameDE: 'Amateurfunk 23cm',
    minHz: 1240e6,
    maxHz: 1300e6,
    category: 'amateur',
    description: 'Microwave amateur band',
    descriptionDE: 'Mikrowellen-Amateurfunkband',
    region: 'europe',
    notes: 'ATV, Richtfunk, EME (Earth-Moon-Earth)'
  },
  {
    id: 'ham-13cm',
    name: 'Amateur 13cm Band',
    nameDE: 'Amateurfunk 13cm',
    minHz: 2320e6,
    maxHz: 2450e6,
    category: 'amateur',
    description: 'Microwave amateur band',
    descriptionDE: 'Mikrowellen-Amateurfunkband',
    region: 'europe',
    notes: 'Schmalband-Segment 2320-2322 MHz'
  },
];

// ============================================================================
// Navigation Systems
// ============================================================================

export const NAVIGATION_APPLICATIONS: RFApplication[] = [
  {
    id: 'nav-dcf77',
    name: 'DCF77 Time Signal',
    nameDE: 'DCF77 Zeitzeichen',
    minHz: 77.5e3,
    maxHz: 77.5e3,
    category: 'navigation',
    description: 'German time signal transmitter',
    descriptionDE: 'Deutsches Zeitzeichensignal',
    region: 'europe',
    notes: 'Standort Mainflingen, Reichweite ca. 2000 km'
  },
  {
    id: 'nav-msf',
    name: 'MSF Time Signal (UK)',
    nameDE: 'MSF Zeitzeichen (UK)',
    minHz: 60e3,
    maxHz: 60e3,
    category: 'navigation',
    description: 'UK time signal transmitter',
    descriptionDE: 'Britisches Zeitzeichensignal',
    region: 'europe',
    notes: 'Standort Anthorn, aehnlich DCF77'
  },
  {
    id: 'nav-wwvb',
    name: 'WWVB Time Signal (USA)',
    nameDE: 'WWVB Zeitzeichen (USA)',
    minHz: 60e3,
    maxHz: 60e3,
    category: 'navigation',
    description: 'US time signal transmitter',
    descriptionDE: 'US-amerikanisches Zeitzeichensignal',
    region: 'usa',
    notes: 'Fort Collins, Colorado'
  },
  {
    id: 'nav-ndb',
    name: 'NDB (Non-Directional Beacon)',
    nameDE: 'NDB (Ungerichtetes Funkfeuer)',
    minHz: 190e3,
    maxHz: 535e3,
    category: 'navigation',
    description: 'Aviation navigation beacon',
    descriptionDE: 'Flugnavigations-Funkfeuer',
    region: 'worldwide',
    notes: 'Wird sukzessive durch GNSS ersetzt'
  },
  {
    id: 'nav-vor',
    name: 'VOR',
    nameDE: 'VOR (Drehfunkfeuer)',
    minHz: 108e6,
    maxHz: 117.95e6,
    category: 'navigation',
    description: 'VHF Omnidirectional Range',
    descriptionDE: 'UKW-Drehfunkfeuer',
    region: 'worldwide',
    notes: 'Standard fuer Flugnavigation, oft mit DME kombiniert'
  },
  {
    id: 'nav-ils-loc',
    name: 'ILS Localizer',
    nameDE: 'ILS Landekurssender',
    minHz: 108.1e6,
    maxHz: 111.95e6,
    category: 'navigation',
    description: 'Instrument Landing System localizer',
    descriptionDE: 'Instrumentenlandesystem Landekurssender',
    region: 'worldwide',
    notes: 'Horizontale Fuehrung bei Landeanflug'
  },
  {
    id: 'nav-ils-gs',
    name: 'ILS Glide Slope',
    nameDE: 'ILS Gleitwegsender',
    minHz: 329.15e6,
    maxHz: 335e6,
    category: 'navigation',
    description: 'Instrument Landing System glide slope',
    descriptionDE: 'Instrumentenlandesystem Gleitwegsender',
    region: 'worldwide',
    notes: 'Vertikale Fuehrung bei Landeanflug'
  },
  {
    id: 'nav-dme',
    name: 'DME',
    nameDE: 'DME (Entfernungsmessung)',
    minHz: 962e6,
    maxHz: 1213e6,
    category: 'navigation',
    description: 'Distance Measuring Equipment',
    descriptionDE: 'Entfernungsmessgeraet',
    region: 'worldwide',
    notes: 'Puls-Laufzeitmessung fuer Entfernung'
  },
  {
    id: 'nav-tacan',
    name: 'TACAN',
    nameDE: 'TACAN',
    minHz: 962e6,
    maxHz: 1213e6,
    category: 'navigation',
    description: 'Tactical Air Navigation',
    descriptionDE: 'Taktisches Flugnavigationssystem',
    region: 'worldwide',
    notes: 'Militaerversion von VOR/DME'
  },
  {
    id: 'nav-ads-b',
    name: 'ADS-B',
    nameDE: 'ADS-B',
    minHz: 1090e6,
    maxHz: 1090e6,
    category: 'navigation',
    description: 'Automatic Dependent Surveillance Broadcast',
    descriptionDE: 'Automatische abhaengige Ueberwachung',
    region: 'worldwide',
    notes: 'Flugzeugposition per GPS, Pflicht seit 2020'
  },
];

// ============================================================================
// Military Applications
// ============================================================================

export const MILITARY_APPLICATIONS: RFApplication[] = [
  {
    id: 'mil-vlf-sub',
    name: 'VLF Submarine Communication',
    nameDE: 'VLF U-Boot-Kommunikation',
    minHz: 3e3,
    maxHz: 30e3,
    category: 'military',
    description: 'One-way communication to submarines',
    descriptionDE: 'Einweg-Kommunikation zu U-Booten',
    region: 'worldwide',
    notes: 'Durchdringt Seewasser bis ca. 20m bei 3 kHz'
  },
  {
    id: 'mil-elf-sub',
    name: 'ELF Submarine Communication',
    nameDE: 'ELF U-Boot-Kommunikation',
    minHz: 3,
    maxHz: 30,
    category: 'military',
    description: 'Deep submarine communication',
    descriptionDE: 'Kommunikation zu getauchten U-Booten',
    region: 'worldwide',
    notes: 'Durchdringt bis 200m, extrem geringe Datenrate'
  },
  {
    id: 'mil-hf-atr',
    name: 'Military HF (ATR)',
    nameDE: 'Militaer-Kurzwelle (ATR)',
    minHz: 2e6,
    maxHz: 30e6,
    category: 'military',
    description: 'Military high frequency communications',
    descriptionDE: 'Militaerische Kurzwellen-Kommunikation',
    region: 'worldwide',
    notes: 'ALE (Automatic Link Establishment), STANAG 4538'
  },
  {
    id: 'mil-uhf-satcom',
    name: 'Military UHF SATCOM',
    nameDE: 'Militaer UHF SATCOM',
    minHz: 225e6,
    maxHz: 400e6,
    category: 'military',
    description: 'Military satellite communications',
    descriptionDE: 'Militaerische Satellitenkommunikation',
    region: 'worldwide',
    notes: 'UFO, MUOS Systeme'
  },
  {
    id: 'mil-tacan',
    name: 'Military TACAN',
    nameDE: 'Militaer-TACAN',
    minHz: 960e6,
    maxHz: 1215e6,
    category: 'military',
    description: 'Tactical navigation',
    descriptionDE: 'Taktische Navigation',
    region: 'worldwide',
    notes: 'Kombiniert Richtung und Entfernung'
  },
  {
    id: 'mil-radar-l',
    name: 'Military Radar (L-Band)',
    nameDE: 'Militaerradar (L-Band)',
    minHz: 1215e6,
    maxHz: 1400e6,
    category: 'military',
    description: 'Long-range surveillance radar',
    descriptionDE: 'Weitreichendes Ueberwachungsradar',
    region: 'worldwide',
    notes: 'AWACS, Fruechwarnradar'
  },
  {
    id: 'mil-radar-s',
    name: 'Military Radar (S-Band)',
    nameDE: 'Militaerradar (S-Band)',
    minHz: 2.7e9,
    maxHz: 3.5e9,
    category: 'military',
    description: 'Medium-range surveillance and tracking',
    descriptionDE: 'Mittlere Reichweite, Verfolgung',
    region: 'worldwide',
    notes: 'Patriot, AEGIS Systeme'
  },
  {
    id: 'mil-radar-x',
    name: 'Military Radar (X-Band)',
    nameDE: 'Militaerradar (X-Band)',
    minHz: 8.5e9,
    maxHz: 10.68e9,
    category: 'military',
    description: 'Fire control and tracking radar',
    descriptionDE: 'Feuerleit- und Verfolgungsradar',
    region: 'worldwide',
    notes: 'Hohe Praezision, begrenzte Reichweite'
  },
];

// ============================================================================
// ISM Band Applications
// ============================================================================

export const ISM_APPLICATIONS: RFApplication[] = [
  {
    id: 'ism-13m',
    name: 'ISM 13.56 MHz (RFID HF)',
    nameDE: 'ISM 13,56 MHz (RFID HF)',
    minHz: 13.553e6,
    maxHz: 13.567e6,
    category: 'ism',
    description: 'RFID, NFC, contactless cards',
    descriptionDE: 'RFID, NFC, kontaktlose Karten',
    region: 'worldwide',
    standard: 'ISO 14443, ISO 15693',
    notes: 'NFC-Reichweite bis ca. 10 cm'
  },
  {
    id: 'ism-27m',
    name: 'ISM 27 MHz',
    nameDE: 'ISM 27 MHz',
    minHz: 26.957e6,
    maxHz: 27.283e6,
    category: 'ism',
    description: 'RC toys, CB radio',
    descriptionDE: 'RC-Spielzeug, CB-Funk',
    region: 'worldwide',
    notes: 'Hohe Stoerungsanfaelligkeit'
  },
  {
    id: 'ism-40m',
    name: 'ISM 40 MHz',
    nameDE: 'ISM 40 MHz',
    minHz: 40.66e6,
    maxHz: 40.7e6,
    category: 'ism',
    description: 'Medical telemetry, RC',
    descriptionDE: 'Medizin-Telemetrie, RC',
    region: 'worldwide',
    notes: 'Begrenzte Bandbreite'
  },
  {
    id: 'ism-433',
    name: 'ISM 433 MHz',
    nameDE: 'ISM 433 MHz',
    minHz: 433.05e6,
    maxHz: 434.79e6,
    category: 'ism',
    description: 'LoRa, remote controls, sensors',
    descriptionDE: 'LoRa, Fernbedienungen, Sensoren',
    region: 'europe',
    notes: 'SRD Band, 10 mW / 25 mW ERP'
  },
  {
    id: 'ism-868',
    name: 'ISM 868 MHz',
    nameDE: 'ISM 868 MHz',
    minHz: 863e6,
    maxHz: 870e6,
    category: 'ism',
    description: 'LoRa, smart metering, IoT',
    descriptionDE: 'LoRa, Smart Metering, IoT',
    region: 'europe',
    standard: 'ETSI EN 300 220',
    notes: 'Verschiedene Subbander mit unterschiedlichen Duty Cycles'
  },
  {
    id: 'ism-915',
    name: 'ISM 915 MHz',
    nameDE: 'ISM 915 MHz',
    minHz: 902e6,
    maxHz: 928e6,
    category: 'ism',
    description: 'LoRa, RFID UHF, IoT',
    descriptionDE: 'LoRa, RFID UHF, IoT',
    region: 'usa',
    notes: 'In Europa nicht verfuegbar (GSM-Bereich)'
  },
  {
    id: 'ism-2400',
    name: 'ISM 2.4 GHz',
    nameDE: 'ISM 2,4 GHz',
    minHz: 2.4e9,
    maxHz: 2.5e9,
    category: 'ism',
    description: 'WiFi, Bluetooth, Zigbee, Microwave ovens',
    descriptionDE: 'WLAN, Bluetooth, Zigbee, Mikrowellenherde',
    region: 'worldwide',
    notes: 'Sehr stark genutzt, hohes Stoerpotenzial'
  },
  {
    id: 'ism-5800',
    name: 'ISM 5.8 GHz',
    nameDE: 'ISM 5,8 GHz',
    minHz: 5.725e9,
    maxHz: 5.875e9,
    category: 'ism',
    description: 'WiFi, FPV drones, radar detectors',
    descriptionDE: 'WLAN, FPV-Drohnen, Radarwarner',
    region: 'worldwide',
    notes: 'Weniger ueberlastet als 2,4 GHz'
  },
  {
    id: 'ism-24g',
    name: 'ISM 24 GHz',
    nameDE: 'ISM 24 GHz',
    minHz: 24e9,
    maxHz: 24.25e9,
    category: 'ism',
    description: 'Short range radar, motion sensors',
    descriptionDE: 'Kurzstreckenradar, Bewegungsmelder',
    region: 'worldwide',
    notes: 'Industrielle Bewegungssensoren'
  },
  {
    id: 'ism-60g',
    name: 'ISM 60 GHz',
    nameDE: 'ISM 60 GHz',
    minHz: 57e9,
    maxHz: 66e9,
    category: 'ism',
    description: 'WiGig, short range high speed',
    descriptionDE: 'WiGig, Kurzstrecken-Hochgeschwindigkeit',
    region: 'worldwide',
    notes: 'Starke O2-Absorption, sehr kurze Reichweite'
  },
];

// ============================================================================
// PMR / Professional Mobile Radio
// ============================================================================

export const PMR_APPLICATIONS: RFApplication[] = [
  {
    id: 'pmr-446',
    name: 'PMR446',
    nameDE: 'PMR446',
    minHz: 446e6,
    maxHz: 446.2e6,
    category: 'pmr',
    description: 'License-free walkie-talkies',
    descriptionDE: 'Lizenzfreie Handfunkgeraete',
    region: 'europe',
    standard: 'ETSI EN 303 406',
    notes: '16 analoge Kanaele, 500 mW ERP'
  },
  {
    id: 'pmr-dpmr446',
    name: 'dPMR446',
    nameDE: 'dPMR446',
    minHz: 446e6,
    maxHz: 446.2e6,
    category: 'pmr',
    description: 'Digital PMR446',
    descriptionDE: 'Digitales PMR446',
    region: 'europe',
    standard: 'ETSI TS 102 658',
    notes: '32 digitale Kanaele'
  },
  {
    id: 'freenet',
    name: 'Freenet',
    nameDE: 'Freenet',
    minHz: 149.0125e6,
    maxHz: 149.1125e6,
    category: 'pmr',
    description: 'German license-free VHF',
    descriptionDE: 'Deutsches lizenzfreies VHF',
    region: 'europe',
    notes: '6 Kanaele, nur Deutschland'
  },
  {
    id: 'bos-4m',
    name: 'BOS 4m Band',
    nameDE: 'BOS 4m-Band',
    minHz: 74.215e6,
    maxHz: 87.255e6,
    category: 'pmr',
    description: 'German emergency services (analog)',
    descriptionDE: 'Behoerden und Organisationen mit Sicherheitsaufgaben',
    region: 'europe',
    notes: 'Wird durch TETRA ersetzt'
  },
  {
    id: 'tetra-380',
    name: 'TETRA 380',
    nameDE: 'TETRA 380',
    minHz: 380e6,
    maxHz: 400e6,
    category: 'pmr',
    description: 'European public safety TETRA',
    descriptionDE: 'Europaeischer BOS-Digitalfunk',
    region: 'europe',
    standard: 'ETSI EN 300 392',
    notes: 'BDBOS-Netz in Deutschland'
  },
  {
    id: 'tetra-410',
    name: 'TETRA 410',
    nameDE: 'TETRA 410',
    minHz: 410e6,
    maxHz: 430e6,
    category: 'pmr',
    description: 'Commercial TETRA',
    descriptionDE: 'Kommerzieller TETRA-Funk',
    region: 'europe',
    standard: 'ETSI EN 300 392',
    notes: 'Fuer Industrie und Transport'
  },
];

// ============================================================================
// Maritime and Aviation
// ============================================================================

export const MARITIME_APPLICATIONS: RFApplication[] = [
  {
    id: 'marine-mf',
    name: 'Marine MF Radio',
    nameDE: 'Seefunk MF',
    minHz: 1.6e6,
    maxHz: 4e6,
    category: 'maritime',
    description: 'Medium frequency marine radio',
    descriptionDE: 'Mittelfrequenz-Seefunk',
    region: 'worldwide',
    notes: '2182 kHz Notfrequenz (historisch)'
  },
  {
    id: 'marine-hf',
    name: 'Marine HF Radio',
    nameDE: 'Seefunk HF',
    minHz: 4e6,
    maxHz: 27.5e6,
    category: 'maritime',
    description: 'High frequency marine radio',
    descriptionDE: 'Kurzwellen-Seefunk',
    region: 'worldwide',
    notes: 'Langstrecken-Seefunk, DSC-Ruf'
  },
  {
    id: 'marine-vhf',
    name: 'Marine VHF Radio',
    nameDE: 'Seefunk VHF',
    minHz: 156e6,
    maxHz: 162.025e6,
    category: 'maritime',
    description: 'VHF marine radio',
    descriptionDE: 'UKW-Seefunk',
    region: 'worldwide',
    notes: 'Kanal 16 (156,8 MHz) Notruf, AIS auf 161,975/162,025 MHz'
  },
  {
    id: 'epirb',
    name: 'EPIRB',
    nameDE: 'EPIRB Notsender',
    minHz: 406e6,
    maxHz: 406.1e6,
    category: 'maritime',
    description: 'Emergency Position Indicating Radio Beacon',
    descriptionDE: 'Seenotfunkbake',
    region: 'worldwide',
    notes: 'COSPAS-SARSAT Satellitensystem'
  },
];

export const AVIATION_APPLICATIONS: RFApplication[] = [
  {
    id: 'airband-vhf',
    name: 'Airband VHF',
    nameDE: 'Flugfunk VHF',
    minHz: 118e6,
    maxHz: 137e6,
    category: 'aviation',
    description: 'VHF air traffic communications',
    descriptionDE: 'VHF-Flugfunk',
    region: 'worldwide',
    notes: 'AM-Modulation, 25/8,33 kHz Kanalraster'
  },
  {
    id: 'airband-hf',
    name: 'Airband HF',
    nameDE: 'Flugfunk HF',
    minHz: 2.85e6,
    maxHz: 22e6,
    category: 'aviation',
    description: 'HF air traffic communications',
    descriptionDE: 'Kurzwellen-Flugfunk',
    region: 'worldwide',
    notes: 'Fuer Langstrecken- und Ozeanflug'
  },
  {
    id: 'elt',
    name: 'ELT',
    nameDE: 'ELT Notfunksender',
    minHz: 121.5e6,
    maxHz: 406.025e6,
    category: 'aviation',
    description: 'Emergency Locator Transmitter',
    descriptionDE: 'Flugzeug-Notfunksender',
    region: 'worldwide',
    notes: '121,5 MHz (lokal) und 406 MHz (Satellit)'
  },
  {
    id: 'acars',
    name: 'ACARS',
    nameDE: 'ACARS',
    minHz: 129.125e6,
    maxHz: 136.9e6,
    category: 'aviation',
    description: 'Aircraft Communications Addressing and Reporting System',
    descriptionDE: 'Flugzeug-Datenfunk',
    region: 'worldwide',
    notes: 'Digitale Datenkommunikation Boden-Luft'
  },
  {
    id: 'tcas',
    name: 'TCAS',
    nameDE: 'TCAS',
    minHz: 1030e6,
    maxHz: 1090e6,
    category: 'aviation',
    description: 'Traffic Collision Avoidance System',
    descriptionDE: 'Kollisionsvermeidungssystem',
    region: 'worldwide',
    notes: 'Abfrage 1030 MHz, Antwort 1090 MHz'
  },
  {
    id: 'radar-altimeter',
    name: 'Radar Altimeter',
    nameDE: 'Radarhoehenmeser',
    minHz: 4.2e9,
    maxHz: 4.4e9,
    category: 'aviation',
    description: 'Aircraft radar altimeter',
    descriptionDE: 'Flugzeug-Radarhoehenmeser',
    region: 'worldwide',
    notes: 'Kritisch fuer Praezisionslandungen'
  },
];

// ============================================================================
// Combined exports
// ============================================================================

/**
 * All RF applications combined
 */
export const ALL_APPLICATIONS: RFApplication[] = [
  ...BROADCAST_APPLICATIONS,
  ...MOBILE_APPLICATIONS,
  ...WLAN_APPLICATIONS,
  ...SATELLITE_APPLICATIONS,
  ...RADAR_APPLICATIONS,
  ...AMATEUR_APPLICATIONS,
  ...NAVIGATION_APPLICATIONS,
  ...MILITARY_APPLICATIONS,
  ...ISM_APPLICATIONS,
  ...PMR_APPLICATIONS,
  ...MARITIME_APPLICATIONS,
  ...AVIATION_APPLICATIONS,
];

/**
 * Applications grouped by category
 */
export const APPLICATIONS_BY_CATEGORY = {
  broadcast: BROADCAST_APPLICATIONS,
  mobile: MOBILE_APPLICATIONS,
  wlan: WLAN_APPLICATIONS,
  satellite: SATELLITE_APPLICATIONS,
  radar: RADAR_APPLICATIONS,
  amateur: AMATEUR_APPLICATIONS,
  navigation: NAVIGATION_APPLICATIONS,
  military: MILITARY_APPLICATIONS,
  ism: ISM_APPLICATIONS,
  pmr: PMR_APPLICATIONS,
  maritime: MARITIME_APPLICATIONS,
  aviation: AVIATION_APPLICATIONS,
} as const;

/**
 * Category display names
 */
export const CATEGORY_NAMES: Record<ApplicationCategory, { name: string; nameDE: string }> = {
  broadcast: { name: 'Broadcasting', nameDE: 'Rundfunk' },
  mobile: { name: 'Mobile Communications', nameDE: 'Mobilfunk' },
  wlan: { name: 'WLAN / WiFi', nameDE: 'WLAN / WiFi' },
  satellite: { name: 'Satellite', nameDE: 'Satellit' },
  radar: { name: 'Radar', nameDE: 'Radar' },
  amateur: { name: 'Amateur Radio', nameDE: 'Amateurfunk' },
  navigation: { name: 'Navigation', nameDE: 'Navigation' },
  military: { name: 'Military', nameDE: 'Militaer' },
  ism: { name: 'ISM Band', nameDE: 'ISM-Band' },
  pmr: { name: 'PMR / Professional Radio', nameDE: 'PMR / Betriebsfunk' },
  maritime: { name: 'Maritime', nameDE: 'Seefunk' },
  aviation: { name: 'Aviation', nameDE: 'Flugfunk' },
} as const;

// ============================================================================
// Helper functions
// ============================================================================

/**
 * Find all applications that contain the given frequency
 * @param frequencyHz - The frequency in Hertz
 * @returns Array of applications that contain this frequency
 */
export function getApplicationsForFrequency(frequencyHz: number): RFApplication[] {
  if (frequencyHz <= 0 || !isFinite(frequencyHz)) {
    return [];
  }

  return ALL_APPLICATIONS.filter(
    app => frequencyHz >= app.minHz && frequencyHz <= app.maxHz
  );
}

/**
 * Find applications by category
 * @param category - The application category
 * @returns Array of applications in this category
 */
export function getApplicationsByCategory(category: ApplicationCategory): RFApplication[] {
  return APPLICATIONS_BY_CATEGORY[category] || [];
}

/**
 * Search applications by name (case-insensitive)
 * @param query - Search string
 * @returns Array of matching applications
 */
export function searchApplications(query: string): RFApplication[] {
  const lowerQuery = query.toLowerCase();
  return ALL_APPLICATIONS.filter(
    app => app.name.toLowerCase().includes(lowerQuery) ||
           app.nameDE.toLowerCase().includes(lowerQuery) ||
           app.description.toLowerCase().includes(lowerQuery) ||
           app.descriptionDE.toLowerCase().includes(lowerQuery)
  );
}
