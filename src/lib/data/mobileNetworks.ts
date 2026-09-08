/**
 * Mobilfunk: Generationen 1G bis 5G (mit 6G-Ausblick) sowie die in
 * Deutschland und der EU genutzten Frequenzbänder.
 *
 * Quellen:
 * - 3GPP TS 36.101 (E-UTRA, LTE-Bandtabelle 5.5-1)
 * - 3GPP TS 38.101-1 (NR FR1) und TS 38.101-2 (NR FR2)
 * - ETSI TS 145 005 (GSM/EDGE Funkübertragung)
 * - Bundesnetzagentur, Frequenzplan und Auktionsergebnisse 2010/2015/2019
 * - ITU-R M.2150 (IMT-2020) und ITU-R M.2160 (IMT-2030 Framework)
 *
 * Datenraten sind als Größenordnungen der jeweiligen Technikstufe angegeben,
 * nicht als garantierte Werte einzelner Netze.
 */

// ============================================================================
// Generationen
// ============================================================================

/** Vielfachzugriffsverfahren. */
export type AccessMethod = 'FDMA' | 'TDMA' | 'CDMA' | 'OFDMA' | 'SC-FDMA' | 'OFDMA/AI';

/** Eine Mobilfunkgeneration. */
export interface MobileGeneration {
  id: string;
  /** Kurzbezeichnung, z. B. "2G" */
  generation: string;
  /** Systemnamen dieser Generation */
  nameDE: string;
  /** Jahr der ersten kommerziellen Netze weltweit */
  yearWorldwide: number;
  /** Jahr der ersten kommerziellen Netze in Deutschland */
  yearGermany: number;
  /** Zugriffsverfahren */
  access: AccessMethod[];
  /** Wichtigste Modulationsverfahren */
  modulationDE: string;
  /** Typische Kanalbandbreiten in Hz */
  channelBandwidthsHz: number[];
  /** Typische Nutzdatenrate im Downlink in Bit/s (praxisnah) */
  typicalDownlinkBps: number;
  /** Spitzendatenrate der Technikstufe im Downlink in Bit/s (theoretisch) */
  peakDownlinkBps: number;
  /** Typische Latenz der Luftschnittstelle in Millisekunden */
  latencyMs: number;
  /** Eigenständig formulierte Einordnung */
  descriptionDE: string;
  source: string;
}

export const MOBILE_GENERATIONS: MobileGeneration[] = [
  {
    id: 'gen-1g',
    generation: '1G',
    nameDE: 'Analoge Netze (C-Netz, NMT, AMPS, TACS)',
    yearWorldwide: 1981,
    yearGermany: 1985,
    access: ['FDMA'],
    modulationDE: 'Frequenzmodulation der Sprache, getrennte Steuerkanäle',
    channelBandwidthsHz: [12.5e3, 20e3, 25e3, 30e3],
    typicalDownlinkBps: 0,
    peakDownlinkBps: 9.6e3,
    latencyMs: 500,
    descriptionDE:
      'Reine Sprachnetze ohne Verschlüsselung: jeder Teilnehmer belegt einen eigenen ' +
      'Funkkanal. Das deutsche C-Netz arbeitete bei 450 MHz und bot als Erstes ein ' +
      'automatisches Handover zwischen Funkzellen; Datenübertragung war nur über ' +
      'Modems mit wenigen Kilobit pro Sekunde möglich.',
    source: 'Historische Netzbetreiberangaben; ITU-Statistiken',
  },
  {
    id: 'gen-2g',
    generation: '2G',
    nameDE: 'GSM, GPRS, EDGE',
    yearWorldwide: 1991,
    yearGermany: 1992,
    access: ['TDMA', 'FDMA'],
    modulationDE: 'GMSK (GSM/GPRS), zusätzlich 8-PSK bei EDGE',
    channelBandwidthsHz: [200e3],
    typicalDownlinkBps: 56e3,
    peakDownlinkBps: 236.8e3,
    latencyMs: 300,
    descriptionDE:
      'Erste digitale Generation: acht Zeitschlitze teilen sich einen 200-kHz-Kanal, ' +
      'die Sprache wird komprimiert und verschlüsselt übertragen. Mit GPRS kam die ' +
      'paketvermittelte Datenübertragung hinzu, mit EDGE eine höherwertige Modulation. ' +
      'GSM ist bis heute die Rückfallebene für Sprache und Maschinenkommunikation.',
    source: 'ETSI TS 145 005; 3GPP TS 45.001',
  },
  {
    id: 'gen-3g',
    generation: '3G',
    nameDE: 'UMTS, HSPA, HSPA+',
    yearWorldwide: 2001,
    yearGermany: 2004,
    access: ['CDMA'],
    modulationDE: 'QPSK, ab HSPA zusätzlich 16-QAM und 64-QAM',
    channelBandwidthsHz: [5e6],
    typicalDownlinkBps: 3e6,
    peakDownlinkBps: 42e6,
    latencyMs: 100,
    descriptionDE:
      'Alle Teilnehmer senden gleichzeitig auf denselben 5 MHz und werden durch ' +
      'orthogonale Spreizcodes getrennt. Damit wurde mobiles Internet praktikabel. ' +
      'In Deutschland sind die UMTS-Netze 2021 abgeschaltet und die Frequenzen an ' +
      'LTE und 5G übergegangen.',
    source: '3GPP TS 25.104; 3GPP TS 25.306',
  },
  {
    id: 'gen-4g',
    generation: '4G',
    nameDE: 'LTE und LTE-Advanced',
    yearWorldwide: 2009,
    yearGermany: 2010,
    access: ['OFDMA', 'SC-FDMA'],
    modulationDE: 'QPSK bis 256-QAM, MIMO bis 4x4 (LTE-A bis 8x8)',
    channelBandwidthsHz: [1.4e6, 3e6, 5e6, 10e6, 15e6, 20e6],
    typicalDownlinkBps: 50e6,
    peakDownlinkBps: 1e9,
    latencyMs: 30,
    descriptionDE:
      'Der Downlink verteilt die Daten auf tausende schmale Unterträger, was den ' +
      'Empfang auch bei starker Mehrwegeausbreitung robust macht; im Uplink senkt ' +
      'ein Einträgerverfahren die Spitzenlast des Endgerätesenders. Mit ' +
      'Trägeraggregation lassen sich mehrere Bänder bündeln.',
    source: '3GPP TS 36.101; 3GPP TS 36.306',
  },
  {
    id: 'gen-5g',
    generation: '5G',
    nameDE: '5G New Radio (FR1 und FR2)',
    yearWorldwide: 2019,
    yearGermany: 2019,
    access: ['OFDMA'],
    modulationDE: 'QPSK bis 256-QAM, massives MIMO und Strahlformung',
    channelBandwidthsHz: [5e6, 10e6, 20e6, 40e6, 50e6, 100e6, 200e6, 400e6],
    typicalDownlinkBps: 200e6,
    peakDownlinkBps: 20e9,
    latencyMs: 5,
    descriptionDE:
      'Die Unterträgerabstände sind skalierbar, wodurch dasselbe Verfahren von ' +
      '700 MHz bis in den Millimeterwellenbereich funktioniert. Neben hohen Datenraten ' +
      'adressiert 5G ausdrücklich sehr viele Sensoren pro Fläche und Anwendungen mit ' +
      'garantiert kurzer Verzögerung.',
    source: '3GPP TS 38.101-1/-2; ITU-R M.2150',
  },
  {
    id: 'gen-6g',
    generation: '6G',
    nameDE: '6G (IMT-2030, Ausblick)',
    yearWorldwide: 2030,
    yearGermany: 2030,
    access: ['OFDMA/AI'],
    modulationDE: 'Noch offen; erwartet werden OFDM-Varianten mit KI-gestützter Anpassung',
    channelBandwidthsHz: [400e6, 800e6, 2e9],
    typicalDownlinkBps: 1e9,
    peakDownlinkBps: 100e9,
    latencyMs: 1,
    descriptionDE:
      'Noch nicht standardisiert. Der ITU-Rahmen IMT-2030 nennt als Ziele die ' +
      'Verschmelzung von Funkübertragung und Ortung, allgegenwärtige Abdeckung durch ' +
      'Einbindung von Satelliten sowie Energieeffizienz. Als Kandidatenbereiche gelten ' +
      'das obere Mittelband um 7 bis 15 GHz und Sub-Terahertz-Frequenzen.',
    source: 'ITU-R M.2160 (IMT-2030 Framework, 2023); 3GPP Release 21 (in Arbeit)',
  },
];

// ============================================================================
// Frequenzbänder
// ============================================================================

/** Duplexverfahren eines Mobilfunkbandes. */
export type DuplexMode = 'FDD' | 'TDD' | 'SDL' | 'SUL';

/** Ein Mobilfunkband nach 3GPP-Nummerierung. */
export interface MobileBand {
  id: string;
  /** 3GPP-Bandnummer, z. B. "n78" oder "B20" */
  band: string;
  nameDE: string;
  /** Uplink-Untergrenze in Hz (bei TDD identisch mit Downlink) */
  uplinkMinHz: number;
  /** Uplink-Obergrenze in Hz */
  uplinkMaxHz: number;
  /** Downlink-Untergrenze in Hz */
  downlinkMinHz: number;
  /** Downlink-Obergrenze in Hz */
  downlinkMaxHz: number;
  duplex: DuplexMode;
  /** Technologien, die dieses Band in DE nutzen */
  technologiesDE: string[];
  /** Eigenständig formulierte Einordnung */
  notesDE: string;
  source: string;
}

export const MOBILE_BANDS: MobileBand[] = [
  {
    id: 'band-n28',
    band: 'B28 / n28',
    nameDE: '700 MHz',
    uplinkMinHz: 703e6,
    uplinkMaxHz: 748e6,
    downlinkMinHz: 758e6,
    downlinkMaxHz: 803e6,
    duplex: 'FDD',
    technologiesDE: ['LTE', '5G NR'],
    notesDE:
      'Ehemalige Fernsehfrequenzen, 2019 an den Mobilfunk übergeben. Große Zellradien ' +
      'und gute Gebäudedurchdringung; deshalb das Band der Wahl für Flächenversorgung ' +
      'und die 5G-Grundabdeckung.',
    source: '3GPP TS 36.101 / TS 38.101-1; BNetzA-Auktion 2015',
  },
  {
    id: 'band-n20',
    band: 'B20 / n20',
    nameDE: '800 MHz (Digitale Dividende I)',
    uplinkMinHz: 832e6,
    uplinkMaxHz: 862e6,
    downlinkMinHz: 791e6,
    downlinkMaxHz: 821e6,
    duplex: 'FDD',
    technologiesDE: ['LTE', '5G NR'],
    notesDE:
      'Ungewöhnlich: der Downlink liegt unterhalb des Uplinks. 2010 versteigert und ' +
      'zunächst mit Ausbauauflagen für unterversorgte Gebiete verknüpft.',
    source: '3GPP TS 36.101; BNetzA-Auktion 2010',
  },
  {
    id: 'band-n8',
    band: 'B8 / n8',
    nameDE: '900 MHz (E-GSM)',
    uplinkMinHz: 880e6,
    uplinkMaxHz: 915e6,
    downlinkMinHz: 925e6,
    downlinkMaxHz: 960e6,
    duplex: 'FDD',
    technologiesDE: ['GSM', 'LTE', '5G NR'],
    notesDE:
      'Ursprünglich das GSM-Kernband. Heute überwiegend für LTE und 5G umgewidmet, ' +
      'ein Reststreifen trägt weiterhin GSM für Sprache und Maschinenkommunikation.',
    source: 'ETSI TS 145 005; 3GPP TS 36.101',
  },
  {
    id: 'band-n3',
    band: 'B3 / n3',
    nameDE: '1800 MHz (DCS)',
    uplinkMinHz: 1710e6,
    uplinkMaxHz: 1785e6,
    downlinkMinHz: 1805e6,
    downlinkMaxHz: 1880e6,
    duplex: 'FDD',
    technologiesDE: ['GSM', 'LTE', '5G NR'],
    notesDE:
      'Mit 75 MHz je Richtung eines der breitesten gepaarten Bänder und daher die ' +
      'Kapazitätsstütze in Städten.',
    source: '3GPP TS 36.101 / TS 38.101-1',
  },
  {
    id: 'band-n1',
    band: 'B1 / n1',
    nameDE: '2100 MHz (IMT-Kernband)',
    uplinkMinHz: 1920e6,
    uplinkMaxHz: 1980e6,
    downlinkMinHz: 2110e6,
    downlinkMaxHz: 2170e6,
    duplex: 'FDD',
    technologiesDE: ['UMTS (abgeschaltet)', 'LTE', '5G NR'],
    notesDE:
      'Das ursprüngliche UMTS-Band aus der Auktion von 2000. Nach der UMTS-Abschaltung ' +
      '2021 vollständig für LTE und 5G nutzbar.',
    source: '3GPP TS 25.104; TS 38.101-1',
  },
  {
    id: 'band-n7',
    band: 'B7 / n7',
    nameDE: '2600 MHz (gepaart)',
    uplinkMinHz: 2500e6,
    uplinkMaxHz: 2570e6,
    downlinkMinHz: 2620e6,
    downlinkMaxHz: 2690e6,
    duplex: 'FDD',
    technologiesDE: ['LTE', '5G NR'],
    notesDE:
      'Kapazitätsband mit geringerer Reichweite, typisch für dicht bebaute Gebiete ' +
      'und Veranstaltungsorte.',
    source: '3GPP TS 36.101 / TS 38.101-1',
  },
  {
    id: 'band-n38',
    band: 'B38 / n38',
    nameDE: '2600 MHz (ungepaart, TDD)',
    uplinkMinHz: 2570e6,
    uplinkMaxHz: 2620e6,
    downlinkMinHz: 2570e6,
    downlinkMaxHz: 2620e6,
    duplex: 'TDD',
    technologiesDE: ['LTE', '5G NR'],
    notesDE:
      'Die 50 MHz zwischen den beiden gepaarten Hälften von Band 7 werden im ' +
      'Zeitduplex betrieben.',
    source: '3GPP TS 36.101 / TS 38.101-1',
  },
  {
    id: 'band-n78',
    band: 'n78',
    nameDE: '3,6 GHz (5G-Hauptband in Europa)',
    uplinkMinHz: 3300e6,
    uplinkMaxHz: 3800e6,
    downlinkMinHz: 3300e6,
    downlinkMaxHz: 3800e6,
    duplex: 'TDD',
    technologiesDE: ['5G NR'],
    notesDE:
      'Das zentrale 5G-Band: bis zu 100 MHz Kanalbandbreite und massives MIMO ' +
      'liefern die höchsten Kapazitäten der Flächennetze. In Deutschland wurden ' +
      '2019 die Bereiche 3,4 bis 3,7 GHz versteigert, 3,7 bis 3,8 GHz sind für ' +
      'lokale Campusnetze reserviert.',
    source: '3GPP TS 38.101-1; BNetzA-Auktion 2019',
  },
  {
    id: 'band-n79',
    band: 'n79',
    nameDE: '4,7 GHz',
    uplinkMinHz: 4400e6,
    uplinkMaxHz: 5000e6,
    downlinkMinHz: 4400e6,
    downlinkMaxHz: 5000e6,
    duplex: 'TDD',
    technologiesDE: ['5G NR'],
    notesDE: 'In Europa nicht zugeteilt; genutzt vor allem in Japan und China.',
    source: '3GPP TS 38.101-1',
  },
  {
    id: 'band-n75',
    band: 'B32 / n75',
    nameDE: '1,5 GHz (nur Downlink)',
    uplinkMinHz: 0,
    uplinkMaxHz: 0,
    downlinkMinHz: 1452e6,
    downlinkMaxHz: 1496e6,
    duplex: 'SDL',
    technologiesDE: ['LTE', '5G NR'],
    notesDE:
      'Reines Zusatz-Downlink-Band ohne Uplink; wird per Trägeraggregation an ein ' +
      'gepaartes Band angehängt. Der Bereich war zuvor für DAB im L-Band vorgesehen.',
    source: '3GPP TS 36.101 (Band 32); TS 38.101-1 (n75)',
  },
  {
    id: 'band-n258',
    band: 'n258',
    nameDE: '26 GHz (Millimeterwellen, FR2)',
    uplinkMinHz: 24.25e9,
    uplinkMaxHz: 27.5e9,
    downlinkMinHz: 24.25e9,
    downlinkMaxHz: 27.5e9,
    duplex: 'TDD',
    technologiesDE: ['5G NR'],
    notesDE:
      'Europäisches Pionierband für Millimeterwellen. Kanalbandbreiten bis 400 MHz, ' +
      'dafür Reichweiten von einigen hundert Metern und praktisch keine ' +
      'Gebäudedurchdringung. In Deutschland als lokale Zuteilung vergeben.',
    source: '3GPP TS 38.101-2; BNetzA lokale Zuteilungen 26 GHz',
  },
  {
    id: 'band-n257',
    band: 'n257',
    nameDE: '28 GHz (Millimeterwellen, FR2)',
    uplinkMinHz: 26.5e9,
    uplinkMaxHz: 29.5e9,
    downlinkMinHz: 26.5e9,
    downlinkMaxHz: 29.5e9,
    duplex: 'TDD',
    technologiesDE: ['5G NR'],
    notesDE: 'Hauptsächlich in den USA, Japan und Korea genutzt.',
    source: '3GPP TS 38.101-2',
  },
  {
    id: 'band-n260',
    band: 'n260',
    nameDE: '39 GHz (Millimeterwellen, FR2)',
    uplinkMinHz: 37e9,
    uplinkMaxHz: 40e9,
    downlinkMinHz: 37e9,
    downlinkMaxHz: 40e9,
    duplex: 'TDD',
    technologiesDE: ['5G NR'],
    notesDE: 'Überwiegend US-amerikanische Nutzung, Kanalbandbreiten bis 400 MHz.',
    source: '3GPP TS 38.101-2',
  },
];

/**
 * Prüft, ob eine Frequenz im Uplink oder Downlink eines Bandes liegt.
 * @param frequencyHz Frequenz in Hertz
 * @returns Liste der Treffer mit Richtungsangabe
 */
export function getMobileBandsForFrequency(
  frequencyHz: number
): Array<{ band: MobileBand; direction: 'uplink' | 'downlink' | 'beide' }> {
  if (!Number.isFinite(frequencyHz) || frequencyHz <= 0) return [];
  const result: Array<{ band: MobileBand; direction: 'uplink' | 'downlink' | 'beide' }> = [];
  for (const band of MOBILE_BANDS) {
    const inUplink =
      band.uplinkMaxHz > 0 && frequencyHz >= band.uplinkMinHz && frequencyHz <= band.uplinkMaxHz;
    const inDownlink =
      frequencyHz >= band.downlinkMinHz && frequencyHz <= band.downlinkMaxHz;
    if (inUplink && inDownlink) result.push({ band, direction: 'beide' });
    else if (inUplink) result.push({ band, direction: 'uplink' });
    else if (inDownlink) result.push({ band, direction: 'downlink' });
  }
  return result;
}
