/**
 * Daten des Zeitstrahls „vom analogen BOS-Funk zum Digitalfunk" und der
 * Vergleichstabelle beider Systeme.
 *
 * Quellen:
 * - BDBOS (Bundesanstalt für den Digitalfunk der Behörden und Organisationen
 *   mit Sicherheitsaufgaben): Gründung am 2. April 2007; Abschluss des
 *   Netzaufbaus 2016 mit dem letzten Netzabschnitt Schwaben Süd-West
 * - ETSI EN 300 392 (TETRA Voice plus Data) und ETSI EN 300 396 (Direktbetrieb)
 * - BNetzA-Frequenzplan (analoge BOS-Bereiche im 4-m- und 2-m-Band)
 * - Durchführungsverordnung (EU) 2017/79 und Verordnung (EU) 2015/758 (eCall,
 *   Pflicht für neue Pkw-Typen ab 31. März 2018)
 * - Bundesnetzagentur und Leitstellenbetreiber: Advanced Mobile Location (AML)
 *   im deutschen Notruf seit Oktober 2019
 *
 * Annahme: Die Einträge ohne Jahreszahl („1970er", „1980er", „1990er")
 * fassen eine schrittweise Entwicklung zusammen, die sich nicht auf einen
 * einzelnen Stichtag festlegen lässt. Sie sind als Einordnung gedacht, nicht
 * als Datumsangabe.
 */

// ============================================================================
// Analoge BOS-Bänder (BNetzA-Frequenzplan)
// ============================================================================

/** Kanalraster im analogen BOS-Funk in Hz. */
export const BOS_ANALOG_RASTER_HZ = 20_000;

/** Duplexabstand im 4-m-Band in Hz. */
export const BOS_4M_DUPLEX_OFFSET_HZ = 9_800_000;

/** Duplexabstand im 2-m-Band in Hz. */
export const BOS_2M_DUPLEX_OFFSET_HZ = 4_600_000;

/** Duplexabstand im TETRA-Netz der BOS in Hz. */
export const BOS_TETRA_DUPLEX_OFFSET_HZ = 10_000_000;

/** Kanalraster eines TETRA-Trägers in Hz. */
export const BOS_TETRA_RASTER_HZ = 25_000;

/** Zahl der Zeitschlitze je TETRA-Träger. */
export const BOS_TETRA_TIMESLOTS = 4;

/** Ein analoges BOS-Band mit Unter- und Oberband. */
export interface BosAnalogBand {
  id: '4m' | '2m';
  nameDE: string;
  /** Unterband: untere und obere Grenze in Hz. */
  lowerMinHz: number;
  lowerMaxHz: number;
  /** Oberband: untere und obere Grenze in Hz. */
  upperMinHz: number;
  upperMaxHz: number;
  duplexOffsetHz: number;
  /** Erster und letzter Kanal der durchgezählten Kanalliste. */
  firstChannel: number;
  lastChannel: number;
  usageDE: string;
  /** Besonderheit des Bandes, falls vorhanden. */
  noteDE?: string;
}

export const BOS_ANALOG_BANDS: BosAnalogBand[] = [
  {
    id: '4m',
    nameDE: '4-m-Band',
    lowerMinHz: 74_215_000,
    lowerMaxHz: 77_475_000,
    upperMinHz: 84_015_000,
    upperMaxHz: 87_255_000,
    duplexOffsetHz: BOS_4M_DUPLEX_OFFSET_HZ,
    firstChannel: 347,
    lastChannel: 510,
    usageDE:
      'Fahrzeug- und Leitstellenfunk. Die niedrige Frequenz reicht weit und kommt mit Bebauung und Bewuchs besser zurecht als das 2-m-Band.',
    noteDE:
      'Der letzte Kanal 510 ist nur im Unterband vorgesehen (Kolonnenkanal); das Oberband endet deshalb bei 87,255 MHz, also einen Rasterschritt vor dem rechnerischen Wert.'
  },
  {
    id: '2m',
    nameDE: '2-m-Band',
    lowerMinHz: 167_560_000,
    lowerMaxHz: 169_380_000,
    upperMinHz: 172_160_000,
    upperMaxHz: 173_980_000,
    duplexOffsetHz: BOS_2M_DUPLEX_OFFSET_HZ,
    firstChannel: 201,
    lastChannel: 292,
    usageDE:
      'Handsprechfunk an der Einsatzstelle und Alarmierung der Funkmeldeempfänger. Kleine Antennen, dafür geringere Reichweite.'
  }
];

/**
 * Frequenz eines analogen BOS-Kanals im Unterband.
 * Die Kanäle sind fortlaufend im 20-kHz-Raster durchgezählt.
 */
export function bosChannelFrequency(band: BosAnalogBand, channel: number): number | undefined {
  if (!Number.isInteger(channel)) return undefined;
  if (channel < band.firstChannel || channel > band.lastChannel) return undefined;
  return band.lowerMinHz + (channel - band.firstChannel) * BOS_ANALOG_RASTER_HZ;
}

// ============================================================================
// Zeitstrahl
// ============================================================================

/** Ein Abschnitt des Zeitstrahls. */
export interface BosMilestone {
  /** Anzeigetext des Zeitpunkts, z. B. „2007" oder „1980er". */
  labelDE: string;
  /** Jahr für die Platzierung auf der Achse. */
  year: number;
  titleDE: string;
  textDE: string;
  /** Analoge oder digitale Epoche — bestimmt die Farbe. */
  era: 'analog' | 'digital';
}

export const BOS_MILESTONES: BosMilestone[] = [
  {
    labelDE: '1950er',
    year: 1955,
    titleDE: 'Sprechfunk kommt zu den Einsatzkräften',
    textDE:
      'Polizei, Feuerwehr und Rettungsdienste erhalten eigene Frequenzbereiche. Der Funk ersetzt die Meldefahrt und macht die Leitstelle erst möglich.',
    era: 'analog'
  },
  {
    labelDE: '1970er',
    year: 1975,
    titleDE: 'Bundesweit einheitliche Kanäle',
    textDE:
      'Die BOS-Funkrichtlinie vereinheitlicht Kanäle, Rufnamen und Betriebsverfahren. Das 4-m-Band trägt den Fahrzeugverkehr, das 2-m-Band den Handsprechfunk an der Einsatzstelle.',
    era: 'analog'
  },
  {
    labelDE: '1980er',
    year: 1985,
    titleDE: 'Alarmierung mit dem Fünftonruf',
    textDE:
      'Funkmeldeempfänger im 2-m-Band werden über eine Folge von fünf Tönen gezielt angesprochen. Wer alarmiert wird, hört einen Melderton — mehr Information überträgt das Verfahren nicht.',
    era: 'analog'
  },
  {
    labelDE: '1990er',
    year: 1995,
    titleDE: 'Digitale Alarmierung mit POCSAG',
    textDE:
      'Die Alarmierung wird digital: Statt eines Tons erreicht die Einsatzkräfte eine Textmeldung mit Stichwort und Adresse. Der Sprechfunk selbst bleibt zunächst analog.',
    era: 'analog'
  },
  {
    labelDE: '2007',
    year: 2007,
    titleDE: 'Die BDBOS wird gegründet',
    textDE:
      'Am 2. April 2007 nimmt die Bundesanstalt für den Digitalfunk der BOS ihre Arbeit auf. Sie baut und betreibt ein einheitliches Netz für Bund und Länder.',
    era: 'digital'
  },
  {
    labelDE: '2016',
    year: 2016,
    titleDE: 'Netzaufbau abgeschlossen',
    textDE:
      'Mit dem letzten Netzabschnitt geht der Digitalfunk bundesweit in den Wirkbetrieb. Rund 500 000 Endgeräte arbeiten in einem gemeinsamen, verschlüsselten Netz.',
    era: 'digital'
  },
  {
    labelDE: '2018',
    year: 2018,
    titleDE: 'eCall wird Pflicht',
    textDE:
      'Neue Pkw-Typen müssen seit dem 31. März 2018 einen automatischen Notruf mitbringen. Er setzt über das Mobilfunknetz einen 112-Anruf ab und übermittelt dabei Ort, Fahrtrichtung und Fahrzeugdaten.',
    era: 'digital'
  },
  {
    labelDE: '2019',
    year: 2019,
    titleDE: 'Der Notruf meldet den Standort selbst',
    textDE:
      'Mit Advanced Mobile Location übermittelt das Mobiltelefon beim Wählen der 112 automatisch seine Position an die Leitstelle — deutlich genauer als die Funkzelle allein.',
    era: 'digital'
  }
];

// ============================================================================
// Vergleich analog ↔ digital
// ============================================================================

/** Eine Zeile der Vergleichstabelle. */
export interface BosComparisonRow {
  aspectDE: string;
  analogDE: string;
  digitalDE: string;
}

export const BOS_COMPARISON: BosComparisonRow[] = [
  {
    aspectDE: 'Frequenzbereich',
    analogDE: '4-m-Band 74–87 MHz, 2-m-Band 167–174 MHz',
    digitalDE: '380–385 MHz aufwärts, 390–395 MHz abwärts'
  },
  {
    aspectDE: 'Kanalzugriff',
    analogDE: 'Ein Kanal je Gespräch, 20-kHz-Raster',
    digitalDE: 'Vier Zeitschlitze je 25-kHz-Träger (TDMA)'
  },
  {
    aspectDE: 'Modulation',
    analogDE: 'Schmalband-Frequenzmodulation',
    digitalDE: 'π/4-DQPSK mit Kanalcodierung'
  },
  {
    aspectDE: 'Betriebsarten',
    analogDE: 'Wechselsprechen im Gegen- oder Wechselverkehr, Relaisstellen',
    digitalDE: 'Netzbetrieb (TMO) über Basisstationen, Direktbetrieb (DMO) ohne Netz'
  },
  {
    aspectDE: 'Gruppenbildung',
    analogDE: 'Kanalwahl am Gerät; wer denselben Kanal hat, hört mit',
    digitalDE: 'Rufgruppen werden im Netz verwaltet und lassen sich im Einsatz umschalten'
  },
  {
    aspectDE: 'Vertraulichkeit',
    analogDE: 'unverschlüsselt, mit jedem Empfänger mithörbar',
    digitalDE: 'Verschlüsselung auf der Luftschnittstelle, zusätzlich Ende-zu-Ende-Verschlüsselung über eine Sicherheitskarte'
  },
  {
    aspectDE: 'Alarmierung',
    analogDE: 'Fünftonruf, später POCSAG im 2-m-Band',
    digitalDE: 'Alarmierung über das TETRA-Netz; POCSAG bleibt vielerorts als zweiter Weg in Betrieb'
  },
  {
    aspectDE: 'Zusatzdienste',
    analogDE: 'Status über Funkmeldesystem (FMS) mit kurzen Datenblöcken',
    digitalDE: 'Status, Kurzmitteilungen, Notruftaste, Ortung und Datenanwendungen'
  }
];
