/**
 * Amateurfunkbänder der IARU-Region 1 mit den in Deutschland geltenden
 * Nutzungsbedingungen.
 *
 * Struktur: Bandgrenzen in Hz, wichtigste Betriebsartensegmente nach
 * IARU-Region-1-Bandplan sowie Lizenzklassen und Leistungsgrenzen nach der
 * deutschen Amateurfunkverordnung (AFuV).
 *
 * Quellen:
 * - IARU Region 1 HF Band Plan (Stand nach der Generalkonferenz Novi Sad 2023)
 * - IARU Region 1 VHF/UHF/Microwave Band Plan (50 MHz – 250 GHz)
 * - Amateurfunkverordnung (AFuV), Anlage 1 — Nutzungsbedingungen der
 *   Frequenzbereiche, Fassung nach der Änderung vom 24.06.2024 (Einführung
 *   der Klasse N)
 * - VO Funk Art. 5 (Zuweisungsstatus primär/sekundär)
 *
 * Annahme: Gesichert ist nur der Zugang der Klasse N zu 10 m, 2 m und 70 cm mit
 * 10 W EIRP (seit 24.06.2024). Alle übrigen Einträge im Feld `licenseClasses`
 * für die Klasse E sind Annahmen und vor Produktiveinsatz gegen AFuV Anlage 1
 * abzugleichen. Ebenso sind die Sonderregelungen im 160-m-Band (Zeit- und
 * Leistungsfenster oberhalb 1850 kHz) hier bewusst nicht modelliert.
 */

// ============================================================================
// Konstanten (keine Magic Numbers)
// ============================================================================

/** Regelleistung Klasse A in Watt PEP (AFuV Anlage 1). */
export const POWER_CLASS_A_W = 750;

/** Regelleistung Klasse E in Watt PEP (AFuV Anlage 1). */
export const POWER_CLASS_E_W = 100;

/**
 * Leistungsgrenze Klasse N als äquivalente isotrope Strahlungsleistung in Watt.
 * 10 W EIRP entsprechen rund 6,1 W ERP (Bezug: Halbwellendipol, 2,15 dBi).
 */
export const POWER_CLASS_N_EIRP_W = 10;

/** Sonderleistungsgrenze im 30-m-Band in Watt PEP. */
export const POWER_30M_W = 150;

/** Sonderleistungsgrenze im 60-m-Band als EIRP in Watt. */
export const POWER_60M_EIRP_W = 15;

/** Sonderleistungsgrenze in den Bändern 2200 m und 630 m als EIRP in Watt. */
export const POWER_LF_MF_EIRP_W = 1;

/**
 * Leistungsgrenze der befristeten 4-m-Allgemeinzuteilung als ERP in Watt.
 * Annahme (Abschnitt C): Wert und Gültigkeit sind vor Produktiveinsatz gegen die
 * aktuelle Amtsblattverfügung der Bundesnetzagentur zu prüfen.
 */
export const POWER_4M_ERP_W = 25;

// ============================================================================
// Typen
// ============================================================================

/** Deutsche Amateurfunk-Zeugnisklassen. */
export type LicenseClassDE = 'A' | 'E' | 'N';

/** Betriebsartengruppe eines Bandsegments nach IARU-Bandplan. */
export type BandSegmentMode =
  | 'cw'            // Telegrafie
  | 'digital-schmal' // schmalbandige digitale Betriebsarten (z. B. FT8, PSK31)
  | 'digital-breit'  // breitbandigere Digimodes
  | 'bake'           // Bakenbereich
  | 'ssb'            // Einseitenbandtelefonie
  | 'allmode'        // alle Betriebsarten
  | 'fm'             // Schmalband-FM, Relaisfunk
  | 'satellit'       // Satellitensegment
  | 'atv';           // Amateurfernsehen

/** Ein Segment innerhalb eines Amateurfunkbandes. */
export interface AmateurBandSegment {
  /** Untergrenze des Segments in Hz */
  minHz: number;
  /** Obergrenze des Segments in Hz */
  maxHz: number;
  /** Betriebsartengruppe */
  mode: BandSegmentMode;
  /** Beschreibung in deutscher Sprache */
  labelDE: string;
}

/** Ein Amateurfunkband. */
export interface AmateurBand {
  /** Eindeutige ID */
  id: string;
  /** Übliche Wellenlängenbezeichnung, z. B. "20 m" */
  nameDE: string;
  /** Untergrenze in Hz (Region 1 / Deutschland) */
  minHz: number;
  /** Obergrenze in Hz (Region 1 / Deutschland) */
  maxHz: number;
  /** Zuweisungsstatus in Region 1 */
  status: 'primaer' | 'sekundaer' | 'gemischt' | 'duldung';
  /** Klassen, die dieses Band nutzen dürfen */
  licenseClasses: LicenseClassDE[];
  /** Maximale Sendeleistung in Watt PEP für Klasse A, falls abweichend geregelt */
  maxPowerClassAW: number;
  /**
   * Falls die Leistung als Strahlungsleistung begrenzt ist (EIRP in Watt),
   * steht der Wert hier und maxPowerClassAW ist derselbe Zahlenwert.
   */
  powerLimitType: 'pep' | 'eirp' | 'erp';
  /** Wichtigste Segmente nach IARU-Region-1-Bandplan */
  segments: AmateurBandSegment[];
  /** Eigenständig formulierte Anmerkung zu Ausbreitung und Nutzung */
  notesDE: string;
  /** Quellenangabe */
  source: string;
}

// ============================================================================
// LF / MF
// ============================================================================

export const AMATEUR_BANDS: AmateurBand[] = [
  {
    id: 'band-2200m',
    nameDE: '2200 m',
    minHz: 135.7e3,
    maxHz: 137.8e3,
    status: 'sekundaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_LF_MF_EIRP_W,
    powerLimitType: 'eirp',
    segments: [
      { minHz: 135.7e3, maxHz: 137.8e3, mode: 'cw', labelDE: 'Telegrafie und sehr schmalbandige Digimodes' },
    ],
    notesDE:
      'Auf WRC-07 zugewiesen. Nur 2,1 kHz Bandbreite; wegen des extrem schlechten ' +
      'Antennenwirkungsgrades wird die Leistung als EIRP begrenzt. Übliche Betriebsarten ' +
      'sind QRSS-Telegrafie und WSPR.',
    source: 'WRC-07; AFuV Anlage 1; IARU R1 LF/MF-Bandplan',
  },
  {
    id: 'band-630m',
    nameDE: '630 m',
    minHz: 472e3,
    maxHz: 479e3,
    status: 'sekundaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_LF_MF_EIRP_W,
    powerLimitType: 'eirp',
    segments: [
      { minHz: 472e3, maxHz: 475e3, mode: 'cw', labelDE: 'Telegrafie' },
      { minHz: 475e3, maxHz: 479e3, mode: 'digital-schmal', labelDE: 'Digimodes (u. a. WSPR, FT8)' },
    ],
    notesDE:
      'Auf WRC-12 zugewiesen, direkt oberhalb des historischen Seenot-Rufbereichs. ' +
      'Schutz des Flugnavigationsfunkdienstes ist Bedingung der Zuweisung.',
    source: 'WRC-12; AFuV Anlage 1; IARU R1 LF/MF-Bandplan',
  },

  // ==========================================================================
  // HF
  // ==========================================================================
  {
    id: 'band-160m',
    nameDE: '160 m',
    minHz: 1810e3,
    maxHz: 2000e3,
    status: 'gemischt',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 1810e3, maxHz: 1838e3, mode: 'cw', labelDE: 'Telegrafie (QRP-Anruf 1836 kHz)' },
      { minHz: 1838e3, maxHz: 1840e3, mode: 'digital-schmal', labelDE: 'Schmalband-Digimodes' },
      { minHz: 1840e3, maxHz: 1843e3, mode: 'digital-breit', labelDE: 'Digimodes (u. a. FT8 auf 1840 kHz)' },
      { minHz: 1843e3, maxHz: 2000e3, mode: 'allmode', labelDE: 'Alle Betriebsarten, überwiegend SSB' },
    ],
    notesDE:
      'Das „Topband" liegt unmittelbar über dem Mittelwellenrundfunk. Verbindungen über ' +
      'große Entfernungen gelingen fast nur in der Dunkelheit, weil die D-Schicht am Tag ' +
      'stark dämpft. In Deutschland gelten oberhalb 1850 kHz zeitliche und leistungsbezogene ' +
      'Sonderregelungen.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 HF-Bandplan',
  },
  {
    id: 'band-80m',
    nameDE: '80 m',
    minHz: 3500e3,
    maxHz: 3800e3,
    status: 'gemischt',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 3500e3, maxHz: 3570e3, mode: 'cw', labelDE: 'Telegrafie (QRP-Anruf 3560 kHz)' },
      { minHz: 3570e3, maxHz: 3600e3, mode: 'digital-schmal', labelDE: 'Schmalband-Digimodes (FT8 3573 kHz)' },
      { minHz: 3600e3, maxHz: 3620e3, mode: 'digital-breit', labelDE: 'Digimodes und Digitale Sprache' },
      { minHz: 3620e3, maxHz: 3800e3, mode: 'ssb', labelDE: 'Telefonie (Notfunk-Anruf 3760 kHz)' },
    ],
    notesDE:
      'Klassisches Nacht- und Regionalband. Bei steilem Abstrahlwinkel entstehen ' +
      'Nahverbindungen über die Raumwelle (NVIS) bis rund 500 km. In Region 2 reicht das ' +
      'Band bis 4000 kHz, in Region 1 nur bis 3800 kHz.',
    source: 'AFuV Anlage 1; IARU R1 HF-Bandplan',
  },
  {
    id: 'band-60m',
    nameDE: '60 m',
    minHz: 5351.5e3,
    maxHz: 5366.5e3,
    status: 'sekundaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_60M_EIRP_W,
    powerLimitType: 'eirp',
    segments: [
      { minHz: 5351.5e3, maxHz: 5354e3, mode: 'cw', labelDE: 'Telegrafie' },
      { minHz: 5354e3, maxHz: 5366e3, mode: 'allmode', labelDE: 'Alle Betriebsarten (FT8 5357 kHz)' },
      { minHz: 5366e3, maxHz: 5366.5e3, mode: 'digital-schmal', labelDE: 'Sehr schmalbandige Betriebsarten' },
    ],
    notesDE:
      'Auf WRC-15 als weltweite Sekundärzuweisung geschaffen; mit nur 15 kHz das schmalste ' +
      'HF-Band. Schließt die Ausbreitungslücke zwischen 80 m und 40 m und ist deshalb für ' +
      'den Notfunk interessant.',
    source: 'WRC-15; AFuV Anlage 1; IARU R1 HF-Bandplan',
  },
  {
    id: 'band-40m',
    nameDE: '40 m',
    minHz: 7000e3,
    maxHz: 7200e3,
    status: 'primaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 7000e3, maxHz: 7040e3, mode: 'cw', labelDE: 'Telegrafie (QRP-Anruf 7030 kHz)' },
      { minHz: 7040e3, maxHz: 7050e3, mode: 'digital-schmal', labelDE: 'Schmalband-Digimodes (FT8 7074 kHz liegt darüber)' },
      { minHz: 7050e3, maxHz: 7060e3, mode: 'digital-breit', labelDE: 'Digimodes' },
      { minHz: 7060e3, maxHz: 7200e3, mode: 'ssb', labelDE: 'Telefonie (Notfunk-Anruf 7110 kHz)' },
    ],
    notesDE:
      'Ganzjährig nutzbares Allrounder-Band: tagsüber regional, nachts weltweit. In ' +
      'Region 1 endet die Amateurzuweisung bei 7200 kHz, darüber beginnt das ' +
      '41-m-Rundfunkband.',
    source: 'AFuV Anlage 1; IARU R1 HF-Bandplan',
  },
  {
    id: 'band-30m',
    nameDE: '30 m',
    minHz: 10100e3,
    maxHz: 10150e3,
    status: 'sekundaer',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_30M_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 10100e3, maxHz: 10130e3, mode: 'cw', labelDE: 'Telegrafie' },
      { minHz: 10130e3, maxHz: 10150e3, mode: 'digital-schmal', labelDE: 'Schmalband-Digimodes (FT8 10136 kHz)' },
    ],
    notesDE:
      'Erstes der drei WARC-Bänder von 1979. Telefonie ist hier nicht zugelassen, ' +
      'Conteste sind nach IARU-Beschluss ausgeschlossen. Sekundärstatus gegenüber dem ' +
      'festen Funkdienst; deshalb Leistungsbegrenzung.',
    source: 'WARC-79; AFuV Anlage 1; IARU R1 HF-Bandplan',
  },
  {
    id: 'band-20m',
    nameDE: '20 m',
    minHz: 14000e3,
    maxHz: 14350e3,
    status: 'primaer',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 14000e3, maxHz: 14070e3, mode: 'cw', labelDE: 'Telegrafie (QRP-Anruf 14060 kHz)' },
      { minHz: 14070e3, maxHz: 14099e3, mode: 'digital-schmal', labelDE: 'Schmalband-Digimodes (FT8 14074 kHz)' },
      { minHz: 14099e3, maxHz: 14101e3, mode: 'bake', labelDE: 'Internationales Bakenprojekt (NCDXF/IARU)' },
      { minHz: 14101e3, maxHz: 14350e3, mode: 'allmode', labelDE: 'Alle Betriebsarten (Notfunk-Anruf 14300 kHz)' },
    ],
    notesDE:
      'Das wichtigste Weitverkehrsband: auch bei niedriger Sonnenaktivität am Tag meist ' +
      'offen. Enthält eine der 18 Stationen des weltweiten Bakennetzes, mit dem sich die ' +
      'Ausbreitungsbedingungen laufend beurteilen lassen.',
    source: 'AFuV Anlage 1; IARU R1 HF-Bandplan; NCDXF/IARU Beacon Project',
  },
  {
    id: 'band-17m',
    nameDE: '17 m',
    minHz: 18068e3,
    maxHz: 18168e3,
    status: 'primaer',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 18068e3, maxHz: 18095e3, mode: 'cw', labelDE: 'Telegrafie' },
      { minHz: 18095e3, maxHz: 18109e3, mode: 'digital-schmal', labelDE: 'Schmalband-Digimodes (FT8 18100 kHz)' },
      { minHz: 18109e3, maxHz: 18111e3, mode: 'bake', labelDE: 'Bakenbereich' },
      { minHz: 18111e3, maxHz: 18168e3, mode: 'allmode', labelDE: 'Alle Betriebsarten (Notfunk-Anruf 18160 kHz)' },
    ],
    notesDE:
      'WARC-Band, contestfrei und dadurch auch an Wochenenden ruhig. Verhält sich ' +
      'ausbreitungstechnisch als Zwischenschritt zwischen 20 m und 15 m.',
    source: 'WARC-79; AFuV Anlage 1; IARU R1 HF-Bandplan',
  },
  {
    id: 'band-15m',
    nameDE: '15 m',
    minHz: 21000e3,
    maxHz: 21450e3,
    status: 'primaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 21000e3, maxHz: 21070e3, mode: 'cw', labelDE: 'Telegrafie (QRP-Anruf 21060 kHz)' },
      { minHz: 21070e3, maxHz: 21110e3, mode: 'digital-schmal', labelDE: 'Schmalband-Digimodes (FT8 21074 kHz)' },
      { minHz: 21149e3, maxHz: 21151e3, mode: 'bake', labelDE: 'Bakenbereich' },
      { minHz: 21151e3, maxHz: 21450e3, mode: 'allmode', labelDE: 'Alle Betriebsarten (Notfunk-Anruf 21360 kHz)' },
    ],
    notesDE:
      'Tagesband, dessen Nutzbarkeit stark vom elfjährigen Sonnenfleckenzyklus abhängt. ' +
      'Im Maximum sind mit kleinen Leistungen interkontinentale Verbindungen möglich.',
    source: 'AFuV Anlage 1; IARU R1 HF-Bandplan',
  },
  {
    id: 'band-12m',
    nameDE: '12 m',
    minHz: 24890e3,
    maxHz: 24990e3,
    status: 'primaer',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 24890e3, maxHz: 24915e3, mode: 'cw', labelDE: 'Telegrafie' },
      { minHz: 24915e3, maxHz: 24929e3, mode: 'digital-schmal', labelDE: 'Schmalband-Digimodes (FT8 24915 kHz)' },
      { minHz: 24929e3, maxHz: 24931e3, mode: 'bake', labelDE: 'Bakenbereich' },
      { minHz: 24931e3, maxHz: 24990e3, mode: 'allmode', labelDE: 'Alle Betriebsarten' },
    ],
    notesDE:
      'Drittes WARC-Band. Öffnet nur bei mittlerer bis hoher Sonnenaktivität, ist dann ' +
      'aber sehr ergiebig und kaum belegt.',
    source: 'WARC-79; AFuV Anlage 1; IARU R1 HF-Bandplan',
  },
  {
    id: 'band-10m',
    nameDE: '10 m',
    minHz: 28000e3,
    maxHz: 29700e3,
    status: 'primaer',
    licenseClasses: ['A', 'E', 'N'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 28000e3, maxHz: 28070e3, mode: 'cw', labelDE: 'Telegrafie (QRP-Anruf 28060 kHz)' },
      { minHz: 28070e3, maxHz: 28190e3, mode: 'digital-schmal', labelDE: 'Schmalband-Digimodes (FT8 28074 kHz)' },
      { minHz: 28190e3, maxHz: 28225e3, mode: 'bake', labelDE: 'Bakenbereich' },
      { minHz: 28225e3, maxHz: 29200e3, mode: 'allmode', labelDE: 'Alle Betriebsarten, überwiegend SSB' },
      { minHz: 29200e3, maxHz: 29300e3, mode: 'digital-breit', labelDE: 'Breitbandige Digimodes' },
      { minHz: 29300e3, maxHz: 29510e3, mode: 'satellit', labelDE: 'Satelliten-Downlink' },
      { minHz: 29510e3, maxHz: 29700e3, mode: 'fm', labelDE: 'FM-Simplex und Relaisfunk' },
    ],
    notesDE:
      'Mit 1,7 MHz das breiteste Kurzwellenband und das einzige, das auch der Klasse N ' +
      'offensteht. Im Sonnenfleckenmaximum weltweite Verbindungen mit wenigen Watt; im ' +
      'Minimum sind fast nur sporadische E-Öffnungen im Sommer nutzbar.',
    source: 'AFuV Anlage 1 (Klasse N seit 24.06.2024); IARU R1 HF-Bandplan',
  },

  // ==========================================================================
  // VHF / UHF
  // ==========================================================================
  {
    id: 'band-6m',
    nameDE: '6 m',
    minHz: 50e6,
    maxHz: 52e6,
    status: 'sekundaer',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 50e6, maxHz: 50.1e6, mode: 'bake', labelDE: 'Baken und Telegrafie' },
      { minHz: 50.1e6, maxHz: 50.5e6, mode: 'ssb', labelDE: 'SSB und CW (DX-Anruf 50,110 MHz, FT8 50,313 MHz)' },
      { minHz: 50.5e6, maxHz: 51e6, mode: 'allmode', labelDE: 'Alle Betriebsarten' },
      { minHz: 51e6, maxHz: 52e6, mode: 'fm', labelDE: 'FM-Simplex und Relaisfunk' },
    ],
    notesDE:
      'Das „magische Band" liegt genau am Übergang von Kurzwelle zu UKW. Meist nur ' +
      'Nahverkehr, aber im Frühsommer bringt sporadische E-Ausbreitung plötzlich ' +
      'Verbindungen über 1000 bis 2000 km. In Region 1 endet das Band bei 52 MHz, ' +
      'in den Regionen 2 und 3 bei 54 MHz.',
    source: 'AFuV Anlage 1; IARU R1 VHF-Bandplan',
  },
  {
    id: 'band-4m',
    nameDE: '4 m',
    minHz: 70.15e6,
    maxHz: 70.2e6,
    status: 'duldung',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_4M_ERP_W,
    powerLimitType: 'erp',
    segments: [
      { minHz: 70.15e6, maxHz: 70.2e6, mode: 'allmode', labelDE: 'Alle Betriebsarten (SSB/CW-Anruf 70,200 MHz-Nähe)' },
    ],
    notesDE:
      'In Deutschland kein reguläres Amateurband, sondern jeweils befristete ' +
      'Allgemeinzuteilungen für Inhaber der Klasse A. Grenzen und Gültigkeit haben sich ' +
      'mehrfach geändert (u. a. 70,150–70,180 MHz und 70,150–70,210 MHz). ' +
      'Vor Anzeige im Produkt aktuellen Stand bei der Bundesnetzagentur prüfen.',
    source: 'BNetzA-Allgemeinzuteilung (befristet); IARU R1 VHF-Bandplan — Status prüfen',
  },
  {
    id: 'band-2m',
    nameDE: '2 m',
    minHz: 144e6,
    maxHz: 146e6,
    status: 'primaer',
    licenseClasses: ['A', 'E', 'N'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 144e6, maxHz: 144.11e6, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 144.11e6, maxHz: 144.15e6, mode: 'digital-schmal', labelDE: 'Schmalband-Digimodes (FT8 144,174 MHz liegt darüber)' },
      { minHz: 144.15e6, maxHz: 144.4e6, mode: 'ssb', labelDE: 'SSB (Anruf 144,300 MHz)' },
      { minHz: 144.4e6, maxHz: 144.49e6, mode: 'bake', labelDE: 'Bakenbereich' },
      { minHz: 144.5e6, maxHz: 144.794e6, mode: 'allmode', labelDE: 'Alle Betriebsarten, ATV-Zubringer' },
      { minHz: 144.8e6, maxHz: 144.99e6, mode: 'digital-breit', labelDE: 'Digitale Kommunikation (APRS 144,800 MHz)' },
      { minHz: 145e6, maxHz: 145.194e6, mode: 'fm', labelDE: 'FM-Relaiseingaben' },
      { minHz: 145.2e6, maxHz: 145.594e6, mode: 'fm', labelDE: 'FM-Simplex (Anruf 145,500 MHz) und Relaisausgaben' },
      { minHz: 145.8e6, maxHz: 146e6, mode: 'satellit', labelDE: 'Satellitensegment (u. a. ISS)' },
    ],
    notesDE:
      'Wichtigstes UKW-Band für den Alltagsbetrieb: dichtes Relaisnetz, APRS und ' +
      'Satellitenverkehr. Reichweite im Wesentlichen quasioptisch, mit Überreichweiten ' +
      'bei Inversionswetterlagen sowie über sporadische E im Sommer.',
    source: 'AFuV Anlage 1; IARU R1 VHF-Bandplan',
  },
  {
    id: 'band-70cm',
    nameDE: '70 cm',
    minHz: 430e6,
    maxHz: 440e6,
    status: 'sekundaer',
    licenseClasses: ['A', 'E', 'N'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 430e6, maxHz: 431.975e6, mode: 'allmode', labelDE: 'Alle Betriebsarten, Relaiseingaben' },
      { minHz: 432e6, maxHz: 432.1e6, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 432.1e6, maxHz: 432.4e6, mode: 'ssb', labelDE: 'SSB (Anruf 432,200 MHz)' },
      { minHz: 432.4e6, maxHz: 432.5e6, mode: 'bake', labelDE: 'Bakenbereich' },
      { minHz: 433e6, maxHz: 433.375e6, mode: 'fm', labelDE: 'FM-Simplex (Anruf 433,500 MHz liegt darüber)' },
      { minHz: 433.4e6, maxHz: 434.6e6, mode: 'fm', labelDE: 'FM-Relaisausgaben und Simplex' },
      { minHz: 435e6, maxHz: 438e6, mode: 'satellit', labelDE: 'Satellitensegment' },
      { minHz: 438e6, maxHz: 440e6, mode: 'atv', labelDE: 'Amateurfernsehen und digitale Datenverbindungen' },
    ],
    notesDE:
      'Sekundärnutzung neben Funkortung und ISM-Anwendungen; der Bereich um 433 MHz ' +
      'ist durch Funkfernsteuerungen und Sensoren stark belegt. Trotzdem das Band mit ' +
      'der größten Anwendungsvielfalt von FM über Digitalsprache bis Amateurfernsehen.',
    source: 'AFuV Anlage 1; IARU R1 UHF-Bandplan',
  },

  // ==========================================================================
  // Mikrowellenbänder
  // ==========================================================================
  {
    id: 'band-23cm',
    nameDE: '23 cm',
    minHz: 1240e6,
    maxHz: 1300e6,
    status: 'sekundaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 1240e6, maxHz: 1260e6, mode: 'atv', labelDE: 'Amateurfernsehen und Datenverbindungen' },
      { minHz: 1260e6, maxHz: 1270e6, mode: 'satellit', labelDE: 'Satelliten-Uplink' },
      { minHz: 1296e6, maxHz: 1296.15e6, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 1296.15e6, maxHz: 1296.4e6, mode: 'ssb', labelDE: 'SSB (Anruf 1296,200 MHz)' },
      { minHz: 1296.8e6, maxHz: 1296.994e6, mode: 'bake', labelDE: 'Bakenbereich' },
      { minHz: 1297e6, maxHz: 1300e6, mode: 'fm', labelDE: 'FM-Simplex und Relaisfunk' },
    ],
    notesDE:
      'Erstes Mikrowellenband. Es überlappt die Satellitennavigation (Galileo E6, ' +
      'GLONASS L2), weshalb die WRC-23 zusätzliche Schutzbedingungen für den ' +
      'Amateurbetrieb festgelegt hat.',
    source: 'AFuV Anlage 1; IARU R1 Microwave Band Plan; WRC-23 Res. 774',
  },
  {
    id: 'band-13cm',
    nameDE: '13 cm',
    minHz: 2320e6,
    maxHz: 2450e6,
    status: 'sekundaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 2320e6, maxHz: 2320.15e6, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 2320.15e6, maxHz: 2320.8e6, mode: 'ssb', labelDE: 'SSB (Anruf 2320,200 MHz)' },
      { minHz: 2400e6, maxHz: 2410e6, mode: 'satellit', labelDE: 'Satellitensegment (u. a. QO-100-Uplink bei 2400 MHz)' },
      { minHz: 2410e6, maxHz: 2450e6, mode: 'allmode', labelDE: 'Breitbandanwendungen, ATV, Datenverbindungen' },
    ],
    notesDE:
      'Teilt sich das Spektrum mit dem ISM-Bereich 2,4 GHz und damit mit WLAN und ' +
      'Bluetooth. Über den geostationären Transponder QO-100 sind hier erstmals ' +
      'dauerhaft verfügbare Satellitenverbindungen für Funkamateure möglich.',
    source: 'AFuV Anlage 1; IARU R1 Microwave Band Plan',
  },
  {
    id: 'band-9cm',
    nameDE: '9 cm',
    minHz: 3400e6,
    maxHz: 3475e6,
    status: 'sekundaer',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 3400e6, maxHz: 3400.15e6, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 3400.15e6, maxHz: 3400.8e6, mode: 'ssb', labelDE: 'SSB (Anruf 3400,200 MHz)' },
      { minHz: 3400.8e6, maxHz: 3401e6, mode: 'bake', labelDE: 'Bakenbereich' },
      { minHz: 3401e6, maxHz: 3475e6, mode: 'allmode', labelDE: 'Breitbandanwendungen und ATV' },
    ],
    notesDE:
      'Steht durch die Vergabe des 3,6-GHz-Bereichs an den Mobilfunk unter Druck; ' +
      'der Amateurbetrieb ist strikt sekundär. In Deutschland weitgehend auf ' +
      'Schmalbandbetrieb im untersten Megahertz beschränkt.',
    source: 'AFuV Anlage 1; IARU R1 Microwave Band Plan — Obergrenze prüfen (Abschnitt C)',
  },
  {
    id: 'band-6cm',
    nameDE: '6 cm',
    minHz: 5650e6,
    maxHz: 5850e6,
    status: 'sekundaer',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 5650e6, maxHz: 5670e6, mode: 'satellit', labelDE: 'Satelliten-Uplink' },
      { minHz: 5760e6, maxHz: 5760.15e6, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 5760.15e6, maxHz: 5760.8e6, mode: 'ssb', labelDE: 'SSB (Anruf 5760,200 MHz)' },
      { minHz: 5830e6, maxHz: 5850e6, mode: 'satellit', labelDE: 'Satelliten-Downlink' },
    ],
    notesDE:
      'Liegt teilweise im WLAN-5-GHz-Bereich. Praktisch wird das Band für ' +
      'Schmalband-Weitverkehr über Berggipfel sowie für Hochgeschwindigkeits-' +
      'Datenverbindungen im Amateurfunknetz genutzt.',
    source: 'AFuV Anlage 1; IARU R1 Microwave Band Plan',
  },
  {
    id: 'band-3cm',
    nameDE: '3 cm',
    minHz: 10e9,
    maxHz: 10.5e9,
    status: 'gemischt',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 10e9, maxHz: 10.15e9, mode: 'allmode', labelDE: 'Breitbandanwendungen, ATV' },
      { minHz: 10.368e9, maxHz: 10.36815e9, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 10.36815e9, maxHz: 10.3688e9, mode: 'ssb', labelDE: 'SSB (Anruf 10 368,200 MHz)' },
      { minHz: 10.45e9, maxHz: 10.5e9, mode: 'satellit', labelDE: 'Satellitensegment' },
    ],
    notesDE:
      'Klassisches Experimentierband für Selbstbau-Transverter und Parabolantennen. ' +
      'Regen dämpft hier bereits messbar, dafür genügen kleine Spiegel für hohe ' +
      'Antennengewinne.',
    source: 'AFuV Anlage 1; IARU R1 Microwave Band Plan',
  },
  {
    id: 'band-1_2cm',
    nameDE: '1,2 cm',
    minHz: 24e9,
    maxHz: 24.25e9,
    status: 'gemischt',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    segments: [
      { minHz: 24e9, maxHz: 24.048e9, mode: 'allmode', labelDE: 'Breitbandanwendungen' },
      { minHz: 24.048e9, maxHz: 24.04815e9, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 24.04815e9, maxHz: 24.0488e9, mode: 'ssb', labelDE: 'SSB (Anruf 24 048,200 MHz)' },
      { minHz: 24.05e9, maxHz: 24.25e9, mode: 'allmode', labelDE: 'Gemeinsame Nutzung mit ISM-Anwendungen' },
    ],
    notesDE:
      'Oberhalb 24,05 GHz teilt sich der Amateurfunk das Spektrum mit ISM-Anwendungen ' +
      'wie Bewegungsmeldern und Verkehrsradar. Verbindungen über größere Strecken ' +
      'erfordern gute Sichtverbindung und trockenes Wetter.',
    source: 'AFuV Anlage 1; IARU R1 Microwave Band Plan',
  },
];

// ============================================================================
// Hilfsfunktionen
// ============================================================================

/**
 * Findet das Amateurfunkband, in dem die Frequenz liegt.
 * @param frequencyHz Frequenz in Hertz
 */
export function getAmateurBandForFrequency(frequencyHz: number): AmateurBand | undefined {
  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return undefined;
  return AMATEUR_BANDS.find((b) => frequencyHz >= b.minHz && frequencyHz <= b.maxHz);
}

/**
 * Findet das Bandsegment zu einer Frequenz.
 * @param frequencyHz Frequenz in Hertz
 */
export function getAmateurSegmentForFrequency(
  frequencyHz: number
): AmateurBandSegment | undefined {
  const band = getAmateurBandForFrequency(frequencyHz);
  return band?.segments.find((s) => frequencyHz >= s.minHz && frequencyHz <= s.maxHz);
}

/**
 * Liefert alle Bänder, die eine bestimmte Zeugnisklasse nutzen darf.
 * @param licenseClass Zeugnisklasse A, E oder N
 */
export function getBandsForLicenseClass(licenseClass: LicenseClassDE): AmateurBand[] {
  return AMATEUR_BANDS.filter((b) => b.licenseClasses.includes(licenseClass));
}
