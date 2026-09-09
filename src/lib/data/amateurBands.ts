/**
 * Amateurfunkbänder der IARU-Region 1 mit den in Deutschland geltenden
 * Nutzungsbedingungen.
 *
 * Struktur: Bandgrenzen in Hz, wichtigste Betriebsartensegmente nach
 * IARU-Region-1-Bandplan sowie Lizenzklassen und Leistungsgrenzen nach der
 * deutschen Amateurfunkverordnung (AFuV).
 *
 * Quellen:
 * - AFuV Anlage 1 „Nutzungsbedingungen für die im Frequenzplan für den
 *   Amateurfunkdienst … ausgewiesenen Frequenzbereiche“, Buchstabe A
 *   (Tabellarische Übersicht) und Buchstabe B (Zusätzliche
 *   Nutzungsbestimmungen), Fundstelle BGBl. 2024 I Nr. 175, S. 1–4,
 *   in Kraft seit 24.06.2024 (Einführung der Klasse N).
 *   https://www.gesetze-im-internet.de/afuv_2005/anlage_1.html — abgerufen 2026-09-09
 * - IARU Region 1 HF Band Plan (Stand Generalkonferenz Novi Sad 2023)
 * - IARU Region 1 VHF/UHF/Microwave Band Plan (50 MHz – 250 GHz), darin der
 *   µWave-Bandplan für 47 GHz, 76 GHz, 122 GHz, 134 GHz und 245 GHz
 * - BNetzA-Allgemeinzuteilungen und Duldungsregelungen für 70 MHz (4 m)
 *
 * Status, Zeugnisklassen und Leistungsgrenzen stammen Zeile für Zeile aus der
 * Tabelle unter Buchstabe A; `status` gibt deshalb den nationalen Status nach
 * AFuV wieder (Spalte 3), der vom ITU-Status der Region 1 abweichen kann.
 *
 * Annahme: Nur zwei Angaben sind nicht aus der AFuV belegt — die Segmentgrenzen
 * innerhalb der Bänder (IARU-Empfehlung, rechtlich nicht bindend) und der Stand
 * der befristeten 4-m-Regelung (siehe `band-4m`).
 *
 * Vollständig abgebildet sind die lfd. Nrn. 1 bis 44 der Anlage 1, also alle
 * Frequenzbereiche von 135,7 kHz bis 250 GHz. Nicht als Band modelliert ist
 * allein die lfd. Nr. 45 („> 275 GHz“): dort weist die Anlage weder einen
 * Status noch eine Leistungsgrenze aus. Nutzungsbestimmung 14 nennt für diesen
 * Bereich die Teilbereiche 444–453 GHz, 510–546 GHz, 711–730 GHz,
 * 909–926 GHz, 945–951 GHz und Frequenzen oberhalb von 956 GHz; dort kann der
 * Amateurfunkdienst keinen Schutz vor Störungen beanspruchen.
 */

// ============================================================================
// Konstanten (keine Magic Numbers)
// ============================================================================

/** Regelleistung Klasse A in Watt PEP (AFuV Anlage 1, lfd. Nr. 3 bis 21). */
export const POWER_CLASS_A_W = 750;

/**
 * Leistungsgrenze Klasse A ab dem 13-cm-Band in Watt PEP
 * (AFuV Anlage 1, lfd. Nr. 22 bis 44).
 */
export const POWER_MICROWAVE_CLASS_A_W = 75;

/**
 * Regelleistung Klasse E in Watt PEP auf den Kurzwellenbändern und auf 10 m
 * (AFuV Anlage 1, lfd. Nrn. 3, 6, 12 und 14).
 */
export const POWER_CLASS_E_W = 100;

/**
 * Leistungsgrenze Klasse E auf 2 m, 70 cm und 23 cm in Watt PEP
 * (AFuV Anlage 1, lfd. Nrn. 17 bis 21).
 */
export const POWER_CLASS_E_VHF_W = 75;

/**
 * Leistungsgrenze Klasse E ab dem 13-cm-Band in Watt PEP
 * (AFuV Anlage 1, lfd. Nr. 22 bis 44).
 */
export const POWER_CLASS_E_SHF_W = 5;

/**
 * Leistungsgrenze Klasse N auf 2 m und 70 cm als effektive Strahlungsleistung
 * in Watt (AFuV Anlage 1, lfd. Nrn. 17 und 18). 6,1 W ERP entsprechen den
 * verbreitet genannten 10 W EIRP (Bezug: Halbwellendipol, 2,15 dBi).
 */
export const POWER_CLASS_N_ERP_VHF_W = 6.1;

/**
 * Leistungsgrenze Klasse N im 10-m-Band als effektive Strahlungsleistung in
 * Watt (AFuV Anlage 1, lfd. Nr. 14). Auf 10 m gilt ein höherer Wert als auf
 * 2 m und 70 cm.
 */
export const POWER_CLASS_N_ERP_10M_W = 10;

/**
 * Klassenkennwert der Klasse N in Watt EIRP, wie er in der Fachpresse und in
 * der Prüfungsliteratur genannt wird. 10 W EIRP ≙ 6,1 W ERP; maßgeblich sind
 * die ERP-Werte der AFuV.
 */
export const POWER_CLASS_N_EIRP_W = 10;

/** Sonderleistungsgrenze im 30-m-Band in Watt PEP (AFuV Anlage 1, lfd. Nr. 9). */
export const POWER_30M_W = 150;

/**
 * Sonderleistungsgrenze im 60-m-Band als effektive Strahlungsleistung in Watt
 * (AFuV Anlage 1, lfd. Nr. 7).
 */
export const POWER_60M_ERP_W = 9.14;

/**
 * Dieselbe Grenze als äquivalente isotrope Strahlungsleistung in Watt — der
 * Wert, den WRC-15 und die IARU nennen. 9,14 W ERP ≙ 15 W EIRP.
 */
export const POWER_60M_EIRP_W = 15;

/**
 * Sonderleistungsgrenze in den Bändern 2200 m und 630 m als effektive
 * Strahlungsleistung in Watt (AFuV Anlage 1, lfd. Nrn. 1 und 2).
 */
export const POWER_LF_MF_ERP_W = 1;

/** Leistungsgrenze im 160-m-Teilbereich 1850–1890 kHz in Watt PEP. */
export const POWER_160M_MID_W = 75;

/** Leistungsgrenze im 160-m-Teilbereich 1890–2000 kHz in Watt PEP. */
export const POWER_160M_TOP_W = 10;

/** Leistungsgrenze im 6-m-Teilbereich 50,4–52 MHz in Watt PEP. */
export const POWER_6M_UPPER_W = 25;

/**
 * Leistungsgrenze im 23-cm-Teilbereich 1247–1263 MHz als effektive
 * Strahlungsleistung in Watt (Schutz des Satellitennavigationsdienstes,
 * AFuV Anlage 1 Buchstabe A, Fußnote zur lfd. Nr. 19 bis 21).
 */
export const POWER_23CM_GNSS_ERP_W = 3.05;

/**
 * Leistungsgrenze der befristeten 4-m-Duldungsregelung als ERP in Watt
 * (BNetzA-Amtsblattmitteilungen, zuletzt gültig bis 31.12.2025).
 */
export const POWER_4M_ERP_W = 25;

/**
 * Höchstzulässige Strahlungsleistung fernbedienter oder automatisch
 * arbeitender Amateurfunkstellen oberhalb 30 MHz in Watt ERP
 * (AFuV Anlage 1, Vorbemerkung; Linkstrecken ausgenommen).
 */
export const POWER_AUTOMATIC_STATION_ERP_W = 50;

// ============================================================================
// Typen
// ============================================================================

/** Deutsche Amateurfunk-Zeugnisklassen. */
export type LicenseClassDE = 'A' | 'E' | 'N';

/** Bezugsgröße einer Leistungsangabe. */
export type PowerLimitType = 'pep' | 'eirp' | 'erp';

/** Eine Leistungsgrenze mit ihrer Bezugsgröße. */
export interface AmateurPowerLimit {
  /** Zahlenwert in Watt */
  watt: number;
  /** Bezugsgröße: Spitzenleistung, ERP oder EIRP */
  type: PowerLimitType;
}

/** Leistungsgrenzen je Zeugnisklasse; fehlende Klasse = kein Zugang. */
export type AmateurPowerLimits = Partial<Record<LicenseClassDE, AmateurPowerLimit>>;

/** Abweichende Leistungsgrenzen in einem Teilbereich eines Bandes. */
export interface AmateurPowerSubrange {
  /** Untergrenze des Teilbereichs in Hz */
  minHz: number;
  /** Obergrenze des Teilbereichs in Hz */
  maxHz: number;
  /** Grenzen je Klasse innerhalb des Teilbereichs */
  limits: AmateurPowerLimits;
  /** Begründung in deutscher Sprache */
  noteDE: string;
}

/** Betriebsartengruppe eines Bandsegments nach IARU-Bandplan. */
export type BandSegmentMode =
  | 'cw' // Telegrafie
  | 'digital-schmal' // schmalbandige digitale Betriebsarten (z. B. FT8, PSK31)
  | 'digital-breit' // breitbandigere Digimodes
  | 'bake' // Bakenbereich
  | 'ssb' // Einseitenbandtelefonie
  | 'allmode' // alle Betriebsarten
  | 'fm' // Schmalband-FM, Relaisfunk
  | 'satellit' // Satellitensegment
  | 'atv'; // Amateurfernsehen

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
  /**
   * Zuweisungsstatus nach AFuV Anlage 1 Buchstabe A, Spalte 3.
   * `gemischt` steht für Bänder, die dort in mehreren Zeilen mit
   * unterschiedlichem Status geführt werden.
   */
  status: 'primaer' | 'sekundaer' | 'gemischt' | 'duldung';
  /** Klassen, die dieses Band nutzen dürfen (Schlüssel von `powerLimits`) */
  licenseClasses: LicenseClassDE[];
  /** Maximale Sendeleistung in Watt für Klasse A (Kurzform von `powerLimits.A`) */
  maxPowerClassAW: number;
  /** Bezugsgröße von `maxPowerClassAW` (Kurzform von `powerLimits.A.type`) */
  powerLimitType: PowerLimitType;
  /** Leistungsgrenzen je Zeugnisklasse nach AFuV Anlage 1, Spalten 4 bis 6 */
  powerLimits: AmateurPowerLimits;
  /** Teilbereiche mit abweichenden Grenzen, falls vorhanden */
  powerSubranges?: AmateurPowerSubrange[];
  /** Wichtigste Segmente nach IARU-Region-1-Bandplan */
  segments: AmateurBandSegment[];
  /** Eigenständig formulierte Anmerkung zu Ausbreitung und Nutzung */
  notesDE: string;
  /** Hinweis zu Klassen-, Leistungs- und Nutzungsbestimmungen */
  licenseNote?: string;
  /** Quellenangabe */
  source: string;
  /** Genaue Fundstelle in der Primärquelle */
  sourceRef?: string;
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
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_LF_MF_ERP_W,
    powerLimitType: 'erp',
    powerLimits: { A: { watt: POWER_LF_MF_ERP_W, type: 'erp' } },
    segments: [
      {
        minHz: 135.7e3,
        maxHz: 137.8e3,
        mode: 'cw',
        labelDE: 'Telegrafie und sehr schmalbandige Digimodes'
      }
    ],
    notesDE:
      'Auf WRC-07 zugewiesen. Nur 2,1 kHz Bandbreite; wegen des extrem schlechten ' +
      'Antennenwirkungsgrades begrenzt die AFuV die Strahlungsleistung (ERP), nicht die ' +
      'Senderleistung. Übliche Betriebsarten ' +
      'sind QRSS-Telegrafie und WSPR.',
    licenseNote:
      'Nur der Klasse A zugänglich und auf 1 W ERP begrenzt; höchstens 800 Hz belegte ' +
      'Bandbreite. Die Betriebsorte sind der Bundesnetzagentur anzuzeigen.',
    source: 'WRC-07; AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 LF/MF-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 1; Nutzungsbestimmungen 1, 2 und 10'
  },
  {
    id: 'band-630m',
    nameDE: '630 m',
    minHz: 472e3,
    maxHz: 479e3,
    status: 'sekundaer',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_LF_MF_ERP_W,
    powerLimitType: 'erp',
    powerLimits: { A: { watt: POWER_LF_MF_ERP_W, type: 'erp' } },
    segments: [
      { minHz: 472e3, maxHz: 475e3, mode: 'cw', labelDE: 'Telegrafie' },
      { minHz: 475e3, maxHz: 479e3, mode: 'digital-schmal', labelDE: 'Digimodes (u. a. WSPR, FT8)' }
    ],
    notesDE:
      'Auf WRC-12 zugewiesen, direkt oberhalb des historischen Seenot-Rufbereichs. ' +
      'Schutz des Flugnavigationsfunkdienstes ist Bedingung der Zuweisung.',
    licenseNote: 'Nur der Klasse A zugänglich, 1 W ERP, höchstens 800 Hz belegte Bandbreite.',
    source: 'WRC-12; AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 LF/MF-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 2; Nutzungsbestimmung 1'
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
    powerLimits: {
      A: { watt: POWER_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_W, type: 'pep' }
    },
    powerSubranges: [
      {
        minHz: 1850e3,
        maxHz: 1890e3,
        limits: {
          A: { watt: POWER_160M_MID_W, type: 'pep' },
          E: { watt: POWER_160M_MID_W, type: 'pep' }
        },
        noteDE:
          'Sekundärer Status; an Wochenenden gelten stattdessen 750 W PEP (Klasse A) ' +
          'bzw. 100 W PEP (Klasse E).'
      },
      {
        minHz: 1890e3,
        maxHz: 2000e3,
        limits: {
          A: { watt: POWER_160M_TOP_W, type: 'pep' },
          E: { watt: POWER_160M_TOP_W, type: 'pep' }
        },
        noteDE:
          'Sekundärer Status; an Wochenenden gelten stattdessen 750 W PEP (Klasse A) ' +
          'bzw. 100 W PEP (Klasse E).'
      }
    ],
    segments: [
      { minHz: 1810e3, maxHz: 1838e3, mode: 'cw', labelDE: 'Telegrafie (QRP-Anruf 1836 kHz)' },
      { minHz: 1838e3, maxHz: 1840e3, mode: 'digital-schmal', labelDE: 'Schmalband-Digimodes' },
      {
        minHz: 1840e3,
        maxHz: 1843e3,
        mode: 'digital-breit',
        labelDE: 'Digimodes (u. a. FT8 auf 1840 kHz)'
      },
      {
        minHz: 1843e3,
        maxHz: 2000e3,
        mode: 'allmode',
        labelDE: 'Alle Betriebsarten, überwiegend SSB'
      }
    ],
    notesDE:
      'Das „Topband" liegt unmittelbar über dem Mittelwellenrundfunk. Verbindungen über ' +
      'große Entfernungen gelingen fast nur in der Dunkelheit, weil die D-Schicht am Tag ' +
      'stark dämpft. In Deutschland gelten oberhalb 1850 kHz zeitliche und leistungsbezogene ' +
      'Sonderregelungen.',
    licenseNote:
      'Das Band steht in der AFuV in drei Zeilen: 1810–1850 kHz primär mit 750 W PEP ' +
      '(Klasse A) und 100 W PEP (Klasse E), 1850–1890 kHz sekundär mit je 75 W PEP, ' +
      '1890–2000 kHz sekundär mit je 10 W PEP. An Wochenenden gelten in beiden oberen ' +
      'Teilbereichen wieder 750 W bzw. 100 W PEP.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 HF-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nrn. 3 bis 5; Nutzungsbestimmungen 3, 10, 12 und 15'
  },
  {
    id: 'band-80m',
    nameDE: '80 m',
    minHz: 3500e3,
    maxHz: 3800e3,
    status: 'primaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    powerLimits: {
      A: { watt: POWER_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_W, type: 'pep' }
    },
    segments: [
      { minHz: 3500e3, maxHz: 3570e3, mode: 'cw', labelDE: 'Telegrafie (QRP-Anruf 3560 kHz)' },
      {
        minHz: 3570e3,
        maxHz: 3600e3,
        mode: 'digital-schmal',
        labelDE: 'Schmalband-Digimodes (FT8 3573 kHz)'
      },
      {
        minHz: 3600e3,
        maxHz: 3620e3,
        mode: 'digital-breit',
        labelDE: 'Digimodes und Digitale Sprache'
      },
      { minHz: 3620e3, maxHz: 3800e3, mode: 'ssb', labelDE: 'Telefonie (Notfunk-Anruf 3760 kHz)' }
    ],
    notesDE:
      'Klassisches Nacht- und Regionalband. Bei steilem Abstrahlwinkel entstehen ' +
      'Nahverbindungen über die Raumwelle (NVIS) bis rund 500 km. In Region 2 reicht das ' +
      'Band bis 4000 kHz, in Region 1 nur bis 3800 kHz.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 HF-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 6; Nutzungsbestimmung 3'
  },
  {
    id: 'band-60m',
    nameDE: '60 m',
    minHz: 5351.5e3,
    maxHz: 5366.5e3,
    status: 'sekundaer',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_60M_ERP_W,
    powerLimitType: 'erp',
    powerLimits: { A: { watt: POWER_60M_ERP_W, type: 'erp' } },
    segments: [
      { minHz: 5351.5e3, maxHz: 5354e3, mode: 'cw', labelDE: 'Telegrafie' },
      {
        minHz: 5354e3,
        maxHz: 5366e3,
        mode: 'allmode',
        labelDE: 'Alle Betriebsarten (FT8 5357 kHz)'
      },
      {
        minHz: 5366e3,
        maxHz: 5366.5e3,
        mode: 'digital-schmal',
        labelDE: 'Sehr schmalbandige Betriebsarten'
      }
    ],
    notesDE:
      'Auf WRC-15 als weltweite Sekundärzuweisung geschaffen; mit nur 15 kHz das schmalste ' +
      'HF-Band. Schließt die Ausbreitungslücke zwischen 80 m und 40 m und ist deshalb für ' +
      'den Notfunk interessant.',
    licenseNote:
      'Nur der Klasse A zugänglich. Die AFuV nennt 9,14 W ERP; das entspricht den ' +
      '15 W EIRP der WRC-15-Zuweisung.',
    source: 'WRC-15; AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 HF-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 7; Nutzungsbestimmung 3'
  },
  {
    id: 'band-40m',
    nameDE: '40 m',
    minHz: 7000e3,
    maxHz: 7200e3,
    status: 'primaer',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    powerLimits: { A: { watt: POWER_CLASS_A_W, type: 'pep' } },
    segments: [
      { minHz: 7000e3, maxHz: 7040e3, mode: 'cw', labelDE: 'Telegrafie (QRP-Anruf 7030 kHz)' },
      {
        minHz: 7040e3,
        maxHz: 7050e3,
        mode: 'digital-schmal',
        labelDE: 'Schmalband-Digimodes (FT8 7074 kHz liegt darüber)'
      },
      { minHz: 7050e3, maxHz: 7060e3, mode: 'digital-breit', labelDE: 'Digimodes' },
      { minHz: 7060e3, maxHz: 7200e3, mode: 'ssb', labelDE: 'Telefonie (Notfunk-Anruf 7110 kHz)' }
    ],
    notesDE:
      'Ganzjährig nutzbares Allrounder-Band: tagsüber regional, nachts weltweit. In ' +
      'Region 1 endet die Amateurzuweisung bei 7200 kHz, darüber beginnt das ' +
      '41-m-Rundfunkband.',
    licenseNote:
      'Nur der Klasse A zugänglich — anders als 80 m und 15 m steht 40 m der Klasse E ' +
      'nicht offen.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 HF-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 8; Nutzungsbestimmungen 3 und 13'
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
    powerLimits: { A: { watt: POWER_30M_W, type: 'pep' } },
    segments: [
      { minHz: 10100e3, maxHz: 10130e3, mode: 'cw', labelDE: 'Telegrafie' },
      {
        minHz: 10130e3,
        maxHz: 10150e3,
        mode: 'digital-schmal',
        labelDE: 'Schmalband-Digimodes (FT8 10136 kHz)'
      }
    ],
    notesDE:
      'Erstes der drei WARC-Bänder von 1979. Telefonie ist hier nicht zugelassen, ' +
      'Conteste sind nach IARU-Beschluss ausgeschlossen. Sekundärstatus gegenüber dem ' +
      'festen Funkdienst; deshalb Leistungsbegrenzung.',
    licenseNote:
      'Nur der Klasse A zugänglich, 150 W PEP, höchstens 800 Hz belegte Bandbreite; ' +
      'Telefonie ist deshalb ausgeschlossen.',
    source: 'WARC-79; AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 HF-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 9; Nutzungsbestimmungen 1, 10 und 12'
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
    powerLimits: { A: { watt: POWER_CLASS_A_W, type: 'pep' } },
    segments: [
      { minHz: 14000e3, maxHz: 14070e3, mode: 'cw', labelDE: 'Telegrafie (QRP-Anruf 14060 kHz)' },
      {
        minHz: 14070e3,
        maxHz: 14099e3,
        mode: 'digital-schmal',
        labelDE: 'Schmalband-Digimodes (FT8 14074 kHz)'
      },
      {
        minHz: 14099e3,
        maxHz: 14101e3,
        mode: 'bake',
        labelDE: 'Internationales Bakenprojekt (NCDXF/IARU)'
      },
      {
        minHz: 14101e3,
        maxHz: 14350e3,
        mode: 'allmode',
        labelDE: 'Alle Betriebsarten (Notfunk-Anruf 14300 kHz)'
      }
    ],
    notesDE:
      'Das wichtigste Weitverkehrsband: auch bei niedriger Sonnenaktivität am Tag meist ' +
      'offen. Enthält eine der 18 Stationen des weltweiten Bakennetzes, mit dem sich die ' +
      'Ausbreitungsbedingungen laufend beurteilen lassen.',
    licenseNote: 'Nur der Klasse A zugänglich.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 HF-Bandplan; NCDXF/IARU Beacon Project',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 10; Nutzungsbestimmungen 3 und 13'
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
    powerLimits: { A: { watt: POWER_CLASS_A_W, type: 'pep' } },
    segments: [
      { minHz: 18068e3, maxHz: 18095e3, mode: 'cw', labelDE: 'Telegrafie' },
      {
        minHz: 18095e3,
        maxHz: 18109e3,
        mode: 'digital-schmal',
        labelDE: 'Schmalband-Digimodes (FT8 18100 kHz)'
      },
      { minHz: 18109e3, maxHz: 18111e3, mode: 'bake', labelDE: 'Bakenbereich' },
      {
        minHz: 18111e3,
        maxHz: 18168e3,
        mode: 'allmode',
        labelDE: 'Alle Betriebsarten (Notfunk-Anruf 18160 kHz)'
      }
    ],
    notesDE:
      'WARC-Band, contestfrei und dadurch auch an Wochenenden ruhig. Verhält sich ' +
      'ausbreitungstechnisch als Zwischenschritt zwischen 20 m und 15 m.',
    licenseNote: 'Nur der Klasse A zugänglich.',
    source: 'WARC-79; AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 HF-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 11; Nutzungsbestimmungen 3 und 13'
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
    powerLimits: {
      A: { watt: POWER_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_W, type: 'pep' }
    },
    segments: [
      { minHz: 21000e3, maxHz: 21070e3, mode: 'cw', labelDE: 'Telegrafie (QRP-Anruf 21060 kHz)' },
      {
        minHz: 21070e3,
        maxHz: 21110e3,
        mode: 'digital-schmal',
        labelDE: 'Schmalband-Digimodes (FT8 21074 kHz)'
      },
      { minHz: 21149e3, maxHz: 21151e3, mode: 'bake', labelDE: 'Bakenbereich' },
      {
        minHz: 21151e3,
        maxHz: 21450e3,
        mode: 'allmode',
        labelDE: 'Alle Betriebsarten (Notfunk-Anruf 21360 kHz)'
      }
    ],
    notesDE:
      'Tagesband, dessen Nutzbarkeit stark vom elfjährigen Sonnenfleckenzyklus abhängt. ' +
      'Im Maximum sind mit kleinen Leistungen interkontinentale Verbindungen möglich.',
    licenseNote:
      'Neben 160 m, 80 m und 10 m eines der vier Kurzwellenbänder der Klasse E ' + '(100 W PEP).',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 HF-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 12; Nutzungsbestimmungen 3 und 13'
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
    powerLimits: { A: { watt: POWER_CLASS_A_W, type: 'pep' } },
    segments: [
      { minHz: 24890e3, maxHz: 24915e3, mode: 'cw', labelDE: 'Telegrafie' },
      {
        minHz: 24915e3,
        maxHz: 24929e3,
        mode: 'digital-schmal',
        labelDE: 'Schmalband-Digimodes (FT8 24915 kHz)'
      },
      { minHz: 24929e3, maxHz: 24931e3, mode: 'bake', labelDE: 'Bakenbereich' },
      { minHz: 24931e3, maxHz: 24990e3, mode: 'allmode', labelDE: 'Alle Betriebsarten' }
    ],
    notesDE:
      'Drittes WARC-Band. Öffnet nur bei mittlerer bis hoher Sonnenaktivität, ist dann ' +
      'aber sehr ergiebig und kaum belegt.',
    licenseNote: 'Nur der Klasse A zugänglich.',
    source: 'WARC-79; AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 HF-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 13; Nutzungsbestimmungen 3 und 13'
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
    powerLimits: {
      A: { watt: POWER_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_W, type: 'pep' },
      N: { watt: POWER_CLASS_N_ERP_10M_W, type: 'erp' }
    },
    segments: [
      { minHz: 28000e3, maxHz: 28070e3, mode: 'cw', labelDE: 'Telegrafie (QRP-Anruf 28060 kHz)' },
      {
        minHz: 28070e3,
        maxHz: 28190e3,
        mode: 'digital-schmal',
        labelDE: 'Schmalband-Digimodes (FT8 28074 kHz)'
      },
      { minHz: 28190e3, maxHz: 28225e3, mode: 'bake', labelDE: 'Bakenbereich' },
      {
        minHz: 28225e3,
        maxHz: 29200e3,
        mode: 'allmode',
        labelDE: 'Alle Betriebsarten, überwiegend SSB'
      },
      { minHz: 29200e3, maxHz: 29300e3, mode: 'digital-breit', labelDE: 'Breitbandige Digimodes' },
      { minHz: 29300e3, maxHz: 29510e3, mode: 'satellit', labelDE: 'Satelliten-Downlink' },
      { minHz: 29510e3, maxHz: 29700e3, mode: 'fm', labelDE: 'FM-Simplex und Relaisfunk' }
    ],
    notesDE:
      'Mit 1,7 MHz das breiteste Kurzwellenband und das einzige, das auch der Klasse N ' +
      'offensteht. Im Sonnenfleckenmaximum weltweite Verbindungen mit wenigen Watt; im ' +
      'Minimum sind fast nur sporadische E-Öffnungen im Sommer nutzbar.',
    licenseNote:
      'Einziges Kurzwellenband der Klasse N — dort gelten 10 W ERP, mehr als die ' +
      '6,1 W ERP auf 2 m und 70 cm. Klasse E darf mit 100 W PEP senden.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024, Klasse N); IARU R1 HF-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 14; Nutzungsbestimmungen 4 und 13'
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
    powerLimits: { A: { watt: POWER_CLASS_A_W, type: 'pep' } },
    powerSubranges: [
      {
        minHz: 50.4e6,
        maxHz: 52e6,
        limits: { A: { watt: POWER_6M_UPPER_W, type: 'pep' } },
        noteDE: 'Oberhalb 50,4 MHz begrenzt die AFuV auf 25 W PEP.'
      }
    ],
    segments: [
      { minHz: 50e6, maxHz: 50.1e6, mode: 'bake', labelDE: 'Baken und Telegrafie' },
      {
        minHz: 50.1e6,
        maxHz: 50.5e6,
        mode: 'ssb',
        labelDE: 'SSB und CW (DX-Anruf 50,110 MHz, FT8 50,313 MHz)'
      },
      { minHz: 50.5e6, maxHz: 51e6, mode: 'allmode', labelDE: 'Alle Betriebsarten' },
      { minHz: 51e6, maxHz: 52e6, mode: 'fm', labelDE: 'FM-Simplex und Relaisfunk' }
    ],
    notesDE:
      'Das „magische Band" liegt genau am Übergang von Kurzwelle zu UKW. Meist nur ' +
      'Nahverkehr, aber im Frühsommer bringt sporadische E-Ausbreitung plötzlich ' +
      'Verbindungen über 1000 bis 2000 km. In Region 1 endet das Band bei 52 MHz, ' +
      'in den Regionen 2 und 3 bei 54 MHz.',
    licenseNote:
      'Nur der Klasse A zugänglich: Die Duldungsregelung, die der Klasse E den Betrieb ' +
      'auf 50–52 MHz erlaubte, lief am 31.12.2025 aus und wurde nicht verlängert. ' +
      'Oberhalb 50,4 MHz gelten 25 W PEP statt 750 W PEP.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 VHF-Bandplan',
    sourceRef:
      'AFuV Anlage 1 Buchstabe A, lfd. Nrn. 15 und 16; BNetzA-Amtsblatt (Ende der ' +
      'Duldung für die Klasse E zum 31.12.2025)'
  },
  {
    id: 'band-4m',
    nameDE: '4 m',
    minHz: 70.15e6,
    maxHz: 70.21e6,
    status: 'duldung',
    licenseClasses: ['A'],
    maxPowerClassAW: POWER_4M_ERP_W,
    powerLimitType: 'erp',
    powerLimits: { A: { watt: POWER_4M_ERP_W, type: 'erp' } },
    segments: [
      {
        minHz: 70.15e6,
        maxHz: 70.21e6,
        mode: 'allmode',
        labelDE: 'Alle Betriebsarten (SSB-Anruf 70,200 MHz)'
      }
    ],
    notesDE:
      'In Deutschland kein reguläres Amateurband, sondern eine jahrweise verlängerte ' +
      'Duldungsregelung für Inhaber der Klasse A. Die Grenzen wanderten von ' +
      '70,150–70,180 MHz über 70,150–70,200 MHz auf 70,150–70,210 MHz, womit ab 2022 ' +
      'auch die internationale SSB-Anruffrequenz 70,200 MHz erreichbar war. Zum ' +
      '31.12.2025 lief die Regelung aus, ohne verlängert zu werden.',
    licenseNote:
      'Kein Band der AFuV Anlage 1. Die jährlich verlängerte Duldungsregelung galt für ' +
      'Inhaber der Klasse A auf 70,150–70,210 MHz mit 25 W ERP, horizontaler ' +
      'Polarisation und höchstens 12 kHz Bandbreite; sie lief am 31.12.2025 aus. ' +
      'Annahme: Bis zu einer neuen Verfügung besteht kein Sendebetrieb-Recht — ' +
      'Stand der Prüfung 2026-09-08.',
    source: 'BNetzA-Duldungsregelung 70 MHz (ausgelaufen 31.12.2025); IARU R1 VHF-Bandplan',
    sourceRef:
      'BNetzA-Amtsblattmitteilungen (Duldungsregelung 70 MHz, zuletzt bis 31.12.2025); ' +
      'IARU R1 VHF-Bandplan'
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
    powerLimits: {
      A: { watt: POWER_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_VHF_W, type: 'pep' },
      N: { watt: POWER_CLASS_N_ERP_VHF_W, type: 'erp' }
    },
    segments: [
      { minHz: 144e6, maxHz: 144.11e6, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      {
        minHz: 144.11e6,
        maxHz: 144.15e6,
        mode: 'digital-schmal',
        labelDE: 'Schmalband-Digimodes (FT8 144,174 MHz liegt darüber)'
      },
      { minHz: 144.15e6, maxHz: 144.4e6, mode: 'ssb', labelDE: 'SSB (Anruf 144,300 MHz)' },
      { minHz: 144.4e6, maxHz: 144.49e6, mode: 'bake', labelDE: 'Bakenbereich' },
      {
        minHz: 144.5e6,
        maxHz: 144.794e6,
        mode: 'allmode',
        labelDE: 'Alle Betriebsarten, ATV-Zubringer'
      },
      {
        minHz: 144.8e6,
        maxHz: 144.99e6,
        mode: 'digital-breit',
        labelDE: 'Digitale Kommunikation (APRS 144,800 MHz)'
      },
      { minHz: 145e6, maxHz: 145.194e6, mode: 'fm', labelDE: 'FM-Relaiseingaben' },
      {
        minHz: 145.2e6,
        maxHz: 145.594e6,
        mode: 'fm',
        labelDE: 'FM-Simplex (Anruf 145,500 MHz) und Relaisausgaben'
      },
      { minHz: 145.8e6, maxHz: 146e6, mode: 'satellit', labelDE: 'Satellitensegment (u. a. ISS)' }
    ],
    notesDE:
      'Wichtigstes UKW-Band für den Alltagsbetrieb: dichtes Relaisnetz, APRS und ' +
      'Satellitenverkehr. Reichweite im Wesentlichen quasioptisch, mit Überreichweiten ' +
      'bei Inversionswetterlagen sowie über sporadische E im Sommer.',
    licenseNote:
      'Klasse E: 75 W PEP, nicht die Regelleistung von 100 W. Klasse N: 6,1 W ERP ' +
      '(≙ 10 W EIRP). Fernbediente und automatisch arbeitende Stellen sind oberhalb ' +
      '30 MHz auf 50 W ERP begrenzt.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 VHF-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 17; Nutzungsbestimmungen 6 und 13'
  },
  {
    id: 'band-70cm',
    nameDE: '70 cm',
    minHz: 430e6,
    maxHz: 440e6,
    status: 'primaer',
    licenseClasses: ['A', 'E', 'N'],
    maxPowerClassAW: POWER_CLASS_A_W,
    powerLimitType: 'pep',
    powerLimits: {
      A: { watt: POWER_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_VHF_W, type: 'pep' },
      N: { watt: POWER_CLASS_N_ERP_VHF_W, type: 'erp' }
    },
    segments: [
      {
        minHz: 430e6,
        maxHz: 431.975e6,
        mode: 'allmode',
        labelDE: 'Alle Betriebsarten, Relaiseingaben'
      },
      { minHz: 432e6, maxHz: 432.1e6, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 432.1e6, maxHz: 432.4e6, mode: 'ssb', labelDE: 'SSB (Anruf 432,200 MHz)' },
      { minHz: 432.4e6, maxHz: 432.5e6, mode: 'bake', labelDE: 'Bakenbereich' },
      {
        minHz: 433e6,
        maxHz: 433.375e6,
        mode: 'fm',
        labelDE: 'FM-Simplex (Anruf 433,500 MHz liegt darüber)'
      },
      { minHz: 433.4e6, maxHz: 434.6e6, mode: 'fm', labelDE: 'FM-Relaisausgaben und Simplex' },
      { minHz: 435e6, maxHz: 438e6, mode: 'satellit', labelDE: 'Satellitensegment' },
      {
        minHz: 438e6,
        maxHz: 440e6,
        mode: 'atv',
        labelDE: 'Amateurfernsehen und digitale Datenverbindungen'
      }
    ],
    notesDE:
      'Sekundärnutzung neben Funkortung und ISM-Anwendungen; der Bereich um 433 MHz ' +
      'ist durch Funkfernsteuerungen und Sensoren stark belegt. Trotzdem das Band mit ' +
      'der größten Anwendungsvielfalt von FM über Digitalsprache bis Amateurfernsehen.',
    licenseNote:
      'Die AFuV führt 430–440 MHz als primären Frequenzbereich, obwohl der ' +
      'Amateurfunkdienst in der VO Funk hier sekundär steht. Klasse E: 75 W PEP, ' +
      'Klasse N: 6,1 W ERP (≙ 10 W EIRP).',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 UHF-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 18; Nutzungsbestimmungen 7 und 13'
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
    powerLimits: {
      A: { watt: POWER_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_VHF_W, type: 'pep' }
    },
    powerSubranges: [
      {
        minHz: 1247e6,
        maxHz: 1263e6,
        limits: {
          A: { watt: POWER_23CM_GNSS_ERP_W, type: 'erp' },
          E: { watt: POWER_23CM_GNSS_ERP_W, type: 'erp' }
        },
        noteDE:
          'Zum Schutz des Satellitennavigationsdienstes (Galileo E6) auf 3,05 W ERP ' + 'begrenzt.'
      }
    ],
    segments: [
      {
        minHz: 1240e6,
        maxHz: 1260e6,
        mode: 'atv',
        labelDE: 'Amateurfernsehen und Datenverbindungen'
      },
      { minHz: 1260e6, maxHz: 1270e6, mode: 'satellit', labelDE: 'Satelliten-Uplink' },
      { minHz: 1296e6, maxHz: 1296.15e6, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 1296.15e6, maxHz: 1296.4e6, mode: 'ssb', labelDE: 'SSB (Anruf 1296,200 MHz)' },
      { minHz: 1296.8e6, maxHz: 1296.994e6, mode: 'bake', labelDE: 'Bakenbereich' },
      { minHz: 1297e6, maxHz: 1300e6, mode: 'fm', labelDE: 'FM-Simplex und Relaisfunk' }
    ],
    notesDE:
      'Erstes Mikrowellenband. Es überlappt die Satellitennavigation (Galileo E6, ' +
      'GLONASS L2), weshalb die WRC-23 zusätzliche Schutzbedingungen für den ' +
      'Amateurbetrieb festgelegt hat.',
    licenseNote:
      'Klasse E: 75 W PEP. Im Teilbereich 1247–1263 MHz begrenzt die AFuV auf 3,05 W ERP; ' +
      '1260–1270 MHz dürfen nur in Richtung Erde–Weltraum genutzt werden.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 Microwave Band Plan; WRC-23 Res. 774',
    sourceRef:
      'AFuV Anlage 1 Buchstabe A, lfd. Nrn. 19 bis 21 und Fußnote; ' +
      'Nutzungsbestimmungen 8, 11, 13 und 17'
  },
  {
    id: 'band-13cm',
    nameDE: '13 cm',
    minHz: 2320e6,
    maxHz: 2450e6,
    status: 'sekundaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_MICROWAVE_CLASS_A_W,
    powerLimitType: 'pep',
    powerLimits: {
      A: { watt: POWER_MICROWAVE_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_SHF_W, type: 'pep' }
    },
    segments: [
      { minHz: 2320e6, maxHz: 2320.15e6, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 2320.15e6, maxHz: 2320.8e6, mode: 'ssb', labelDE: 'SSB (Anruf 2320,200 MHz)' },
      {
        minHz: 2400e6,
        maxHz: 2410e6,
        mode: 'satellit',
        labelDE: 'Satellitensegment (u. a. QO-100-Uplink bei 2400 MHz)'
      },
      {
        minHz: 2410e6,
        maxHz: 2450e6,
        mode: 'allmode',
        labelDE: 'Breitbandanwendungen, ATV, Datenverbindungen'
      }
    ],
    notesDE:
      'Teilt sich das Spektrum mit dem ISM-Bereich 2,4 GHz und damit mit WLAN und ' +
      'Bluetooth. Über den geostationären Transponder QO-100 sind hier erstmals ' +
      'dauerhaft verfügbare Satellitenverbindungen für Funkamateure möglich.',
    licenseNote:
      'Ab 13 cm sinkt die Leistungsgrenze deutlich: 75 W PEP für die Klasse A, ' +
      '5 W PEP für die Klasse E.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 Microwave Band Plan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nrn. 22 und 23; Nutzungsbestimmungen 9, 13 und 17'
  },
  {
    id: 'band-9cm',
    nameDE: '9 cm',
    minHz: 3400e6,
    maxHz: 3475e6,
    status: 'sekundaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_MICROWAVE_CLASS_A_W,
    powerLimitType: 'pep',
    powerLimits: {
      A: { watt: POWER_MICROWAVE_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_SHF_W, type: 'pep' }
    },
    segments: [
      { minHz: 3400e6, maxHz: 3400.15e6, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 3400.15e6, maxHz: 3400.8e6, mode: 'ssb', labelDE: 'SSB (Anruf 3400,200 MHz)' },
      { minHz: 3400.8e6, maxHz: 3401e6, mode: 'bake', labelDE: 'Bakenbereich' },
      { minHz: 3401e6, maxHz: 3475e6, mode: 'allmode', labelDE: 'Breitbandanwendungen und ATV' }
    ],
    notesDE:
      'Steht durch die Vergabe des 3,6-GHz-Bereichs an den Mobilfunk unter Druck; ' +
      'der Amateurbetrieb ist strikt sekundär. In Deutschland weitgehend auf ' +
      'Schmalbandbetrieb im untersten Megahertz beschränkt.',
    licenseNote:
      'Die Obergrenze 3475 MHz steht so in der AFuV; der IARU-R1-Plan behandelt nur ' +
      '3400–3410 MHz. 75 W PEP für die Klasse A, 5 W PEP für die Klasse E.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 Microwave Band Plan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 24; Nutzungsbestimmungen 9 und 17'
  },
  {
    id: 'band-6cm',
    nameDE: '6 cm',
    minHz: 5650e6,
    maxHz: 5850e6,
    status: 'sekundaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_MICROWAVE_CLASS_A_W,
    powerLimitType: 'pep',
    powerLimits: {
      A: { watt: POWER_MICROWAVE_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_SHF_W, type: 'pep' }
    },
    segments: [
      { minHz: 5650e6, maxHz: 5670e6, mode: 'satellit', labelDE: 'Satelliten-Uplink' },
      { minHz: 5760e6, maxHz: 5760.15e6, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 5760.15e6, maxHz: 5760.8e6, mode: 'ssb', labelDE: 'SSB (Anruf 5760,200 MHz)' },
      { minHz: 5830e6, maxHz: 5850e6, mode: 'satellit', labelDE: 'Satelliten-Downlink' }
    ],
    notesDE:
      'Liegt teilweise im WLAN-5-GHz-Bereich. Praktisch wird das Band für ' +
      'Schmalband-Weitverkehr über Berggipfel sowie für Hochgeschwindigkeits-' +
      'Datenverbindungen im Amateurfunknetz genutzt.',
    licenseNote:
      '75 W PEP für die Klasse A, 5 W PEP für die Klasse E. 5650–5670 MHz nur in ' +
      'Richtung Erde–Weltraum, 5830–5850 MHz nur Weltraum–Erde.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 Microwave Band Plan',
    sourceRef:
      'AFuV Anlage 1 Buchstabe A, lfd. Nrn. 25 bis 29; Nutzungsbestimmungen 9, 11, 13 und 17'
  },
  {
    id: 'band-3cm',
    nameDE: '3 cm',
    minHz: 10e9,
    maxHz: 10.5e9,
    status: 'sekundaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_MICROWAVE_CLASS_A_W,
    powerLimitType: 'pep',
    powerLimits: {
      A: { watt: POWER_MICROWAVE_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_SHF_W, type: 'pep' }
    },
    segments: [
      { minHz: 10e9, maxHz: 10.15e9, mode: 'allmode', labelDE: 'Breitbandanwendungen, ATV' },
      { minHz: 10.368e9, maxHz: 10.36815e9, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 10.36815e9, maxHz: 10.3688e9, mode: 'ssb', labelDE: 'SSB (Anruf 10 368,200 MHz)' },
      { minHz: 10.45e9, maxHz: 10.5e9, mode: 'satellit', labelDE: 'Satellitensegment' }
    ],
    notesDE:
      'Klassisches Experimentierband für Selbstbau-Transverter und Parabolantennen. ' +
      'Regen dämpft hier bereits messbar, dafür genügen kleine Spiegel für hohe ' +
      'Antennengewinne.',
    licenseNote: '75 W PEP für die Klasse A, 5 W PEP für die Klasse E.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 Microwave Band Plan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nrn. 30 bis 32; Nutzungsbestimmungen 9, 13 und 17'
  },
  {
    id: 'band-1_2cm',
    nameDE: '1,2 cm',
    minHz: 24e9,
    maxHz: 24.25e9,
    status: 'gemischt',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_MICROWAVE_CLASS_A_W,
    powerLimitType: 'pep',
    powerLimits: {
      A: { watt: POWER_MICROWAVE_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_SHF_W, type: 'pep' }
    },
    segments: [
      { minHz: 24e9, maxHz: 24.048e9, mode: 'allmode', labelDE: 'Breitbandanwendungen' },
      { minHz: 24.048e9, maxHz: 24.04815e9, mode: 'cw', labelDE: 'Telegrafie und Erde-Mond-Erde' },
      { minHz: 24.04815e9, maxHz: 24.0488e9, mode: 'ssb', labelDE: 'SSB (Anruf 24 048,200 MHz)' },
      {
        minHz: 24.05e9,
        maxHz: 24.25e9,
        mode: 'allmode',
        labelDE: 'Gemeinsame Nutzung mit ISM-Anwendungen'
      }
    ],
    notesDE:
      'Oberhalb 24,05 GHz teilt sich der Amateurfunk das Spektrum mit ISM-Anwendungen ' +
      'wie Bewegungsmeldern und Verkehrsradar. Verbindungen über größere Strecken ' +
      'erfordern gute Sichtverbindung und trockenes Wetter.',
    licenseNote:
      '24–24,05 GHz ist primär, 24,05–24,25 GHz sekundär zugewiesen. 75 W PEP für die ' +
      'Klasse A, 5 W PEP für die Klasse E.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 Microwave Band Plan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nrn. 33 und 34; Nutzungsbestimmungen 9, 13 und 17'
  },

  // ==========================================================================
  // EHF — Millimeterwellen
  // ==========================================================================
  {
    id: 'band-6mm',
    nameDE: '6 mm',
    minHz: 47e9,
    maxHz: 47.2e9,
    status: 'primaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_MICROWAVE_CLASS_A_W,
    powerLimitType: 'pep',
    powerLimits: {
      A: { watt: POWER_MICROWAVE_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_SHF_W, type: 'pep' }
    },
    segments: [
      { minHz: 47e9, maxHz: 47.088e9, mode: 'allmode', labelDE: 'Breitbandanwendungen' },
      {
        minHz: 47.088e9,
        maxHz: 47.09e9,
        mode: 'cw',
        labelDE: 'Schmalbandsegment, Aktivitätszentrum 47 088,000 MHz'
      },
      {
        minHz: 47.09e9,
        maxHz: 47.2e9,
        mode: 'allmode',
        labelDE: 'Breitbandanwendungen und Satellitenbetrieb'
      }
    ],
    notesDE:
      'Erstes Millimeterwellenband des Amateurfunkdienstes und eines der wenigen mit ' +
      'primärem Status. Es liegt im Ausbreitungsfenster zwischen der Wasserdampflinie ' +
      'bei 22 GHz und dem Sauerstoffband um 60 GHz; Verbindungen laufen quasioptisch ' +
      'über wenige Kilometer, meist mit Selbstbau-Transvertern und kleinen Spiegeln.',
    licenseNote:
      'Primärer Status. 75 W PEP für die Klasse A, 5 W PEP für die Klasse E. Der ganze ' +
      'Bereich darf auch für den Amateurfunkdienst über Satelliten genutzt werden; dieser ' +
      'ist dort primärer Funkdienst.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 µWave-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 35; Nutzungsbestimmungen 13 und 17'
  },
  {
    id: 'band-4mm',
    nameDE: '4 mm',
    minHz: 76e9,
    maxHz: 81e9,
    status: 'sekundaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_MICROWAVE_CLASS_A_W,
    powerLimitType: 'pep',
    powerLimits: {
      A: { watt: POWER_MICROWAVE_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_SHF_W, type: 'pep' }
    },
    segments: [
      {
        minHz: 76e9,
        maxHz: 81e9,
        mode: 'allmode',
        labelDE: 'Alle Betriebsarten; Schmalband- und Breitbandbetrieb'
      }
    ],
    notesDE:
      'Mit 5 GHz Breite der größte zusammenhängende Frequenzbereich des Amateurfunks. ' +
      'Die AFuV führt ihn in vier Zeilen mit gleichem Status und gleichen Grenzen. ' +
      'Denselben Bereich belegen die Abstands- und Nahbereichsradare von Kraftfahrzeugen, ' +
      'weshalb der Amateurfunkdienst hier durchgehend sekundär bleibt.',
    licenseNote:
      'Sekundärer Status im gesamten Bereich. 75 W PEP für die Klasse A, 5 W PEP für die ' +
      'Klasse E. Der Amateurfunkdienst über Satelliten darf den Bereich sekundär mitnutzen.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 µWave-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nrn. 36 bis 39; Nutzungsbestimmungen 9, 13 und 17'
  },
  {
    id: 'band-2_5mm',
    nameDE: '2,5 mm',
    minHz: 122.25e9,
    maxHz: 123e9,
    status: 'sekundaer',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_MICROWAVE_CLASS_A_W,
    powerLimitType: 'pep',
    powerLimits: {
      A: { watt: POWER_MICROWAVE_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_SHF_W, type: 'pep' }
    },
    segments: [
      {
        minHz: 122.25e9,
        maxHz: 123e9,
        mode: 'allmode',
        labelDE: 'Alle Betriebsarten; Schmalband- und Breitbandbetrieb'
      }
    ],
    notesDE:
      'Der Bereich liegt im ISM-Bereich 122–123 GHz der Vollzugsordnung für den Funkdienst ' +
      'und damit neben industriellen und medizinischen Anwendungen. Kurz darunter dämpft ' +
      'die Sauerstofflinie bei 118,75 GHz; erreichbar sind in der Praxis wenige Kilometer ' +
      'bei freier Sicht.',
    licenseNote:
      'Sekundärer Status. 75 W PEP für die Klasse A, 5 W PEP für die Klasse E. Nutzungs' +
      'bestimmung 13 nennt diesen Bereich nicht — Satellitenbetrieb ist hier nicht vorgesehen.',
    source:
      'AFuV Anlage 1 (Fassung 24.06.2024); VO Funk Fußnote 5.138 (ISM); IARU R1 µWave-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nr. 40; Nutzungsbestimmungen 9 und 17'
  },
  {
    id: 'band-2mm',
    nameDE: '2 mm',
    minHz: 134e9,
    maxHz: 141e9,
    status: 'gemischt',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_MICROWAVE_CLASS_A_W,
    powerLimitType: 'pep',
    powerLimits: {
      A: { watt: POWER_MICROWAVE_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_SHF_W, type: 'pep' }
    },
    segments: [
      { minHz: 134e9, maxHz: 134.928e9, mode: 'allmode', labelDE: 'Breitbandanwendungen' },
      {
        minHz: 134.928e9,
        maxHz: 134.93e9,
        mode: 'cw',
        labelDE: 'Schmalbandsegment (höchstens 2,7 kHz Bandbreite)'
      },
      {
        minHz: 134.93e9,
        maxHz: 141e9,
        mode: 'allmode',
        labelDE: 'Breitbandanwendungen und Satellitenbetrieb'
      }
    ],
    notesDE:
      'Zwei Zeilen der Anlage 1 mit unterschiedlichem Status bilden zusammen das 2-mm-Band. ' +
      'Es liegt im Ausbreitungsfenster zwischen der Sauerstofflinie bei 118,75 GHz und der ' +
      'Wasserdampflinie bei 183,3 GHz und wird vom Radioastronomiefunkdienst mitgenutzt.',
    licenseNote:
      '134–136 GHz ist primär, 136–141 GHz sekundär zugewiesen. 75 W PEP für die Klasse A, ' +
      '5 W PEP für die Klasse E. Über Satelliten ist der Amateurfunk in 134–136 GHz primär, ' +
      'in 136–141 GHz sekundär.',
    source: 'AFuV Anlage 1 (Fassung 24.06.2024); IARU R1 µWave-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nrn. 41 und 42; Nutzungsbestimmungen 9, 13 und 17'
  },
  {
    id: 'band-1_2mm',
    nameDE: '1,2 mm',
    minHz: 241e9,
    maxHz: 250e9,
    status: 'gemischt',
    licenseClasses: ['A', 'E'],
    maxPowerClassAW: POWER_MICROWAVE_CLASS_A_W,
    powerLimitType: 'pep',
    powerLimits: {
      A: { watt: POWER_MICROWAVE_CLASS_A_W, type: 'pep' },
      E: { watt: POWER_CLASS_E_SHF_W, type: 'pep' }
    },
    segments: [
      {
        minHz: 241e9,
        maxHz: 248e9,
        mode: 'allmode',
        labelDE: 'Alle Betriebsarten; Satellitenbetrieb sekundär'
      },
      {
        minHz: 248e9,
        maxHz: 250e9,
        mode: 'satellit',
        labelDE: 'Alle Betriebsarten; Satellitenbetrieb primär'
      }
    ],
    notesDE:
      'Höchstes Band, dem die Anlage 1 einen Status und eine Leistungsgrenze zuweist. ' +
      'Der Teilbereich 244–246 GHz ist zugleich ISM-Bereich der Vollzugsordnung für den ' +
      'Funkdienst. Verbindungen sind Experimente über wenige hundert Meter bis Kilometer; ' +
      'Feuchte in der Luft dämpft stark.',
    licenseNote:
      '241–248 GHz ist sekundär, 248–250 GHz primär zugewiesen. 75 W PEP für die Klasse A, ' +
      '5 W PEP für die Klasse E. Über Satelliten ist der Amateurfunk in 241–248 GHz ' +
      'sekundär, in 248–250 GHz primär.',
    source:
      'AFuV Anlage 1 (Fassung 24.06.2024); VO Funk Fußnote 5.138 (ISM); IARU R1 µWave-Bandplan',
    sourceRef: 'AFuV Anlage 1 Buchstabe A, lfd. Nrn. 43 und 44; Nutzungsbestimmungen 13 und 17'
  }
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
export function getAmateurSegmentForFrequency(frequencyHz: number): AmateurBandSegment | undefined {
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
