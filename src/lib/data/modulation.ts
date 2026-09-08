/**
 * Modulations- und Zugriffsverfahren mit Bandbreitenbedarf, spektraler
 * Effizienz, Robustheit und typischen Anwendungen.
 *
 * Quellen:
 * - ITU-R SM.328 (Spektren und Bandbreiten von Aussendungen)
 * - ITU-R SM.1138 (Bestimmung der notwendigen Bandbreite)
 * - IEEE 802.11 und 3GPP-Spezifikationen für die digitalen Verfahren
 * - Semtech AN1200.22 (LoRa-Modulation, Zusammenhang Spreizfaktor/Datenrate)
 *
 * Die Angaben zur spektralen Effizienz sind Richtwerte der jeweiligen
 * Technikstufe unter guten Empfangsbedingungen, keine garantierten Werte.
 */

// ============================================================================
// Formelkonstanten
// ============================================================================

/**
 * Carson-Regel für die belegte Bandbreite frequenz- und phasenmodulierter
 * Signale: B = 2 · (Δf + f_max).
 *
 * @param deviationHz Frequenzhub Δf in Hertz
 * @param maxAudioHz höchste Modulationsfrequenz f_max in Hertz
 * @returns belegte Bandbreite in Hertz
 */
export function carsonBandwidthHz(deviationHz: number, maxAudioHz: number): number {
  if (deviationHz < 0 || maxAudioHz < 0) return 0;
  return 2 * (deviationHz + maxAudioHz);
}

/**
 * Modulationsindex frequenzmodulierter Signale: β = Δf / f_max.
 *
 * @param deviationHz Frequenzhub in Hertz
 * @param maxAudioHz höchste Modulationsfrequenz in Hertz
 */
export function fmModulationIndex(deviationHz: number, maxAudioHz: number): number {
  if (maxAudioHz <= 0) return 0;
  return deviationHz / maxAudioHz;
}

/**
 * Bit je Symbol einer M-wertigen Modulation: k = log2(M).
 *
 * @param symbolStates Anzahl der Symbolzustände M
 */
export function bitsPerSymbol(symbolStates: number): number {
  if (symbolStates < 2) return 0;
  return Math.log2(symbolStates);
}

/**
 * Prozessgewinn eines Spreizbandverfahrens in dB.
 *
 * @param chipRate Chiprate in Chips pro Sekunde
 * @param dataRate Nutzdatenrate in Bit pro Sekunde
 */
export function spreadingGainDb(chipRate: number, dataRate: number): number {
  if (dataRate <= 0 || chipRate <= 0) return 0;
  return 10 * Math.log10(chipRate / dataRate);
}

// ============================================================================
// Typen
// ============================================================================

/** Klasse eines Modulationsverfahrens. */
export type ModulationClass = 'analog' | 'digital-einzeltraeger' | 'digital-mehrtraeger' | 'spreizband';

/** Robustheit gegenüber Rauschen und Mehrwegeausbreitung. */
export type Robustness = 'sehr hoch' | 'hoch' | 'mittel' | 'gering' | 'sehr gering';

export interface Modulation {
  id: string;
  /** Übliche Abkürzung */
  abbr: string;
  nameDE: string;
  class: ModulationClass;
  /** Bit je Symbol; 0 bei analogen Verfahren */
  bitsPerSymbol: number;
  /**
   * Typische spektrale Effizienz in Bit/s/Hz einschließlich Kanalcodierung
   * und Schutzintervallen. Bei analogen Verfahren 0.
   */
  spectralEfficiencyBpsPerHz: number;
  /** Typische belegte Bandbreite eines realen Systems in Hz */
  typicalBandwidthHz: number;
  robustness: Robustness;
  /** Beschreibung des Verfahrens, eigenständig formuliert */
  descriptionDE: string;
  /** Hinweis zum Bandbreitenbedarf */
  bandwidthNoteDE: string;
  applicationsDE: string[];
  source: string;
}

export const MODULATIONS: Modulation[] = [
  {
    id: 'am',
    abbr: 'AM (A3E)',
    nameDE: 'Amplitudenmodulation mit Träger',
    class: 'analog',
    bitsPerSymbol: 0,
    spectralEfficiencyBpsPerHz: 0,
    typicalBandwidthHz: 9e3,
    robustness: 'gering',
    descriptionDE:
      'Die Amplitude eines Trägers folgt dem Nutzsignal. Der Empfänger braucht nur ' +
      'einen Gleichrichter, was AM historisch billig und massentauglich machte. ' +
      'Nachteil: Störungen wirken sich direkt auf die Amplitude und damit auf das ' +
      'Nutzsignal aus, und der Träger selbst trägt keine Information, verbraucht ' +
      'aber mindestens zwei Drittel der Sendeleistung.',
    bandwidthNoteDE: 'B = 2 · f_max; im Mittelwellenrundfunk auf 9 kHz Kanalraster begrenzt.',
    applicationsDE: ['Mittelwellen- und Kurzwellenrundfunk', 'VHF-Flugfunk'],
    source: 'ITU-R SM.328',
  },
  {
    id: 'dsb-sc',
    abbr: 'DSB-SC',
    nameDE: 'Zweiseitenband ohne Träger',
    class: 'analog',
    bitsPerSymbol: 0,
    spectralEfficiencyBpsPerHz: 0,
    typicalBandwidthHz: 6e3,
    robustness: 'gering',
    descriptionDE:
      'Wie AM, aber ohne den leistungsfressenden Träger. Der Empfänger muss den ' +
      'Träger phasenrichtig zurückgewinnen, was den Aufwand erhöht. In der Praxis ' +
      'vor allem als Zwischenschritt bei der Erzeugung von Einseitenbandsignalen ' +
      'und im Stereo-Differenzkanal des UKW-Rundfunks.',
    bandwidthNoteDE: 'B = 2 · f_max, identisch zu AM.',
    applicationsDE: ['Stereo-Differenzsignal im UKW-Rundfunk', 'Messtechnik'],
    source: 'ITU-R SM.328',
  },
  {
    id: 'ssb',
    abbr: 'SSB (J3E)',
    nameDE: 'Einseitenbandmodulation',
    class: 'analog',
    bitsPerSymbol: 0,
    spectralEfficiencyBpsPerHz: 0,
    typicalBandwidthHz: 2.7e3,
    robustness: 'mittel',
    descriptionDE:
      'Es wird nur ein Seitenband ohne Träger übertragen. Dadurch halbiert sich die ' +
      'Bandbreite gegenüber AM und die gesamte Sendeleistung steckt im Nutzsignal, ' +
      'was bei gleicher Spitzenleistung einen erheblichen Reichweitenvorteil bringt. ' +
      'Der Preis ist ein aufwendigerer Empfänger, dessen Frequenzabweichung sich ' +
      'unmittelbar als Tonhöhenverschiebung bemerkbar macht.',
    bandwidthNoteDE: 'B = f_max; für Sprache üblich 2,4 bis 3,0 kHz.',
    applicationsDE: ['Kurzwellen-Amateurfunk', 'See- und Flugfunk auf HF', 'Militärische Kurzwelle'],
    source: 'ITU-R SM.328',
  },
  {
    id: 'fm',
    abbr: 'FM (F3E)',
    nameDE: 'Frequenzmodulation',
    class: 'analog',
    bitsPerSymbol: 0,
    spectralEfficiencyBpsPerHz: 0,
    typicalBandwidthHz: 180e3,
    robustness: 'hoch',
    descriptionDE:
      'Die Augenblicksfrequenz folgt dem Nutzsignal, die Amplitude bleibt konstant. ' +
      'Amplitudenstörungen lassen sich dadurch im Empfänger abschneiden, was FM ' +
      'deutlich rauschärmer macht als AM. Oberhalb einer Mindestfeldstärke setzt ' +
      'sich das stärkere von zwei Signalen praktisch vollständig durch.',
    bandwidthNoteDE:
      'Carson-Regel B = 2 · (Δf + f_max). UKW-Rundfunk: 2 · (75 kHz + 15 kHz) = 180 kHz. ' +
      'Schmalband-FM im Betriebsfunk: 2 · (2,5 kHz + 3 kHz) = 11 kHz.',
    applicationsDE: ['UKW-Rundfunk', 'Betriebs- und Amateurfunk', 'Seefunk VHF'],
    source: 'ITU-R SM.328; Carson-Regel',
  },
  {
    id: 'pm',
    abbr: 'PM (G3E)',
    nameDE: 'Phasenmodulation',
    class: 'analog',
    bitsPerSymbol: 0,
    spectralEfficiencyBpsPerHz: 0,
    typicalBandwidthHz: 16e3,
    robustness: 'hoch',
    descriptionDE:
      'Nahe verwandt mit der Frequenzmodulation: die Phasenlage folgt dem Nutzsignal. ' +
      'Ein FM-Sender lässt sich als PM-Sender mit vorgeschaltetem Integrator ' +
      'realisieren und umgekehrt. Praktisch wird PM meist als Erzeugungsweg für ' +
      'FM verwendet.',
    bandwidthNoteDE: 'Ebenfalls nach Carson, mit dem Phasenhub anstelle des Frequenzhubs.',
    applicationsDE: ['Erzeugung von FM in Sendern', 'Telemetrie'],
    source: 'ITU-R SM.328',
  },
  {
    id: 'ask',
    abbr: 'ASK / OOK',
    nameDE: 'Amplitudenumtastung',
    class: 'digital-einzeltraeger',
    bitsPerSymbol: 1,
    spectralEfficiencyBpsPerHz: 0.5,
    typicalBandwidthHz: 200e3,
    robustness: 'sehr gering',
    descriptionDE:
      'Der Träger wird schlicht ein- und ausgeschaltet. Extrem einfach und ' +
      'stromsparend zu erzeugen, aber empfindlich gegen Pegelschwankungen und ' +
      'Störungen. Deshalb fast nur in sehr billigen Kurzstreckenanwendungen.',
    bandwidthNoteDE: 'Etwa das Doppelte der Bitrate; steile Flanken erzeugen breite Nebenspektren.',
    applicationsDE: ['Funkfernsteuerungen 433 MHz', 'einfache Sensorfunkstrecken', 'RFID'],
    source: 'ITU-R SM.328',
  },
  {
    id: 'fsk',
    abbr: 'FSK / GFSK / GMSK',
    nameDE: 'Frequenzumtastung',
    class: 'digital-einzeltraeger',
    bitsPerSymbol: 1,
    spectralEfficiencyBpsPerHz: 1.35,
    typicalBandwidthHz: 200e3,
    robustness: 'hoch',
    descriptionDE:
      'Die Information steckt in einem Frequenzsprung. Da die Hüllkurve konstant ' +
      'bleibt, dürfen die Sendeverstärker im Sättigungsbereich arbeiten, was den ' +
      'Wirkungsgrad stark erhöht. Bei GMSK glättet ein Gaußfilter die Übergänge und ' +
      'hält das Spektrum schmal — deshalb hat GSM diese Variante gewählt.',
    bandwidthNoteDE:
      'GSM erreicht 270,833 kBit/s in einem 200-kHz-Kanal, also rund 1,35 Bit/s/Hz.',
    applicationsDE: ['GSM', 'Bluetooth', 'Wireless M-Bus', 'Pager (POCSAG)'],
    source: '3GPP TS 45.004; ETSI TS 145 005',
  },
  {
    id: 'bpsk',
    abbr: 'BPSK',
    nameDE: 'Zweiwertige Phasenumtastung',
    class: 'digital-einzeltraeger',
    bitsPerSymbol: 1,
    spectralEfficiencyBpsPerHz: 0.8,
    typicalBandwidthHz: 2e6,
    robustness: 'sehr hoch',
    descriptionDE:
      'Zwei um 180 Grad versetzte Phasenlagen. Der maximal mögliche Abstand der ' +
      'Symbole im Signalraum macht BPSK zum robustesten der gängigen Verfahren; ' +
      'entsprechend wird es dort eingesetzt, wo der Störabstand knapp ist.',
    bandwidthNoteDE: 'Symbolrate gleich Bitrate; Bandbreite etwa Bitrate mal Rolloff-Faktor.',
    applicationsDE: ['Satellitennavigation', 'Telemetrie aus dem Weltraum', 'PSK31 im Amateurfunk'],
    source: 'IS-GPS-200; ITU-R SM.328',
  },
  {
    id: 'qpsk',
    abbr: 'QPSK',
    nameDE: 'Vierwertige Phasenumtastung',
    class: 'digital-einzeltraeger',
    bitsPerSymbol: 2,
    spectralEfficiencyBpsPerHz: 1.6,
    typicalBandwidthHz: 5e6,
    robustness: 'hoch',
    descriptionDE:
      'Vier Phasenlagen übertragen zwei Bit je Symbol, bei gleicher Bandbreite und ' +
      'gleichem Störabstand wie BPSK. Deshalb die Standardwahl für Satellitenstrecken ' +
      'und die Basisstufe vieler Mobilfunksysteme.',
    bandwidthNoteDE: 'Halbe Symbolrate gegenüber BPSK bei gleicher Bitrate.',
    applicationsDE: ['UMTS', 'DVB-S', 'LTE und 5G bei schlechtem Empfang'],
    source: '3GPP TS 25.213; ETSI EN 300 421',
  },
  {
    id: 'qam16',
    abbr: '16-QAM',
    nameDE: '16-wertige Quadraturamplitudenmodulation',
    class: 'digital-einzeltraeger',
    bitsPerSymbol: 4,
    spectralEfficiencyBpsPerHz: 3,
    typicalBandwidthHz: 20e6,
    robustness: 'mittel',
    descriptionDE:
      'Amplitude und Phase werden gemeinsam ausgewertet, sodass sich 16 ' +
      'unterscheidbare Zustände ergeben. Jede Verdopplung der Zustandszahl bringt ' +
      'ein weiteres Bit je Symbol, verlangt aber rund 6 dB mehr Störabstand.',
    bandwidthNoteDE: 'Vier Bit je Symbol; netto rund 3 Bit/s/Hz nach Codierung.',
    applicationsDE: ['LTE', 'WLAN', 'DVB-T2 bei mittlerer Empfangsqualität'],
    source: '3GPP TS 36.211; IEEE 802.11',
  },
  {
    id: 'qam64',
    abbr: '64-QAM',
    nameDE: '64-wertige Quadraturamplitudenmodulation',
    class: 'digital-einzeltraeger',
    bitsPerSymbol: 6,
    spectralEfficiencyBpsPerHz: 4.5,
    typicalBandwidthHz: 20e6,
    robustness: 'gering',
    descriptionDE:
      'Sechs Bit je Symbol. Erfordert einen sauberen Kanal und einen sehr linearen ' +
      'Sendeverstärker, weil Amplitudenfehler direkt Symbolverwechslungen erzeugen.',
    bandwidthNoteDE: 'Sechs Bit je Symbol; netto rund 4,5 Bit/s/Hz.',
    applicationsDE: ['LTE', 'WLAN 802.11n', 'DVB-T2', 'DOCSIS'],
    source: '3GPP TS 36.211; ETSI EN 302 755',
  },
  {
    id: 'qam256',
    abbr: '256-QAM',
    nameDE: '256-wertige Quadraturamplitudenmodulation',
    class: 'digital-einzeltraeger',
    bitsPerSymbol: 8,
    spectralEfficiencyBpsPerHz: 6,
    typicalBandwidthHz: 20e6,
    robustness: 'sehr gering',
    descriptionDE:
      'Acht Bit je Symbol, praktisch nur bei sehr gutem Empfang nutzbar — etwa in ' +
      'Zellmitte oder auf kurzen Richtfunkstrecken. Benötigt typischerweise über ' +
      '30 dB Signal-Rausch-Abstand.',
    bandwidthNoteDE: 'Acht Bit je Symbol; netto rund 6 Bit/s/Hz.',
    applicationsDE: ['LTE-Advanced', 'WLAN 802.11ac/ax', 'Richtfunk'],
    source: '3GPP TS 36.211; IEEE 802.11ac',
  },
  {
    id: 'ofdm',
    abbr: 'OFDM',
    nameDE: 'Orthogonales Frequenzmultiplexverfahren',
    class: 'digital-mehrtraeger',
    bitsPerSymbol: 0,
    spectralEfficiencyBpsPerHz: 5,
    typicalBandwidthHz: 20e6,
    robustness: 'hoch',
    descriptionDE:
      'Der Datenstrom wird auf hunderte bis tausende schmale, orthogonal zueinander ' +
      'liegende Unterträger verteilt. Weil jedes Symbol dadurch sehr lang wird, ' +
      'stören Echos aus Mehrwegeausbreitung kaum noch; ein zusätzliches ' +
      'Schutzintervall fängt die restliche Verzögerung auf. Nachteil ist das hohe ' +
      'Verhältnis von Spitzen- zu Mittelwertleistung, das lineare und damit ' +
      'ineffiziente Endstufen erzwingt.',
    bandwidthNoteDE:
      'Bandbreite = Unterträgerzahl mal Unterträgerabstand; die effektive Effizienz ' +
      'ergibt sich aus der Modulation je Unterträger abzüglich Schutzintervall und ' +
      'Pilottönen.',
    applicationsDE: ['DAB+', 'DVB-T2', 'WLAN', 'LTE', '5G NR', 'Powerline'],
    source: 'ETSI EN 300 401; ETSI EN 302 755; 3GPP TS 38.211',
  },
  {
    id: 'dsss',
    abbr: 'DSSS / CDMA',
    nameDE: 'Direktsequenz-Spreizverfahren',
    class: 'spreizband',
    bitsPerSymbol: 1,
    spectralEfficiencyBpsPerHz: 0.1,
    typicalBandwidthHz: 5e6,
    robustness: 'sehr hoch',
    descriptionDE:
      'Das Nutzsignal wird mit einer sehr viel schnelleren Codefolge multipliziert ' +
      'und dadurch über eine große Bandbreite verteilt. Der Empfänger korreliert mit ' +
      'derselben Folge und gewinnt dabei einen Störabstandsgewinn, der dem ' +
      'Spreizverhältnis entspricht. Mehrere Teilnehmer können denselben Kanal ' +
      'gleichzeitig nutzen, solange ihre Codes orthogonal sind.',
    bandwidthNoteDE:
      'Prozessgewinn = 10 · log10(Chiprate / Datenrate). Beispiel GPS C/A: ' +
      '1,023 Mchip/s bei 50 Bit/s ergibt rund 43 dB.',
    applicationsDE: ['GPS und Galileo', 'UMTS', 'WLAN 802.11b', 'militärische Störfestigkeit'],
    source: 'IS-GPS-200; 3GPP TS 25.213',
  },
  {
    id: 'fhss',
    abbr: 'FHSS',
    nameDE: 'Frequenzsprungverfahren',
    class: 'spreizband',
    bitsPerSymbol: 1,
    spectralEfficiencyBpsPerHz: 0.7,
    typicalBandwidthHz: 1e6,
    robustness: 'hoch',
    descriptionDE:
      'Sender und Empfänger wechseln nach einem gemeinsam bekannten Muster ' +
      'fortlaufend die Frequenz. Schmalbandige Störer treffen dadurch nur einen ' +
      'Bruchteil der Übertragung, der sich durch Codierung ausgleichen lässt. ' +
      'Bluetooth springt im 2,4-GHz-Band 1600-mal je Sekunde.',
    bandwidthNoteDE:
      'Momentane Bandbreite entspricht einem Kanal, die belegte Gesamtbandbreite ' +
      'dem gesamten Sprungbereich.',
    applicationsDE: ['Bluetooth', 'militärische Funkgeräte (SATURN, HAVE QUICK)', 'Industriefunk'],
    source: 'Bluetooth Core Specification; ETSI EN 300 328',
  },
  {
    id: 'lora-css',
    abbr: 'LoRa (CSS)',
    nameDE: 'Chirp-Spreizverfahren',
    class: 'spreizband',
    bitsPerSymbol: 7,
    spectralEfficiencyBpsPerHz: 0.02,
    typicalBandwidthHz: 125e3,
    robustness: 'sehr hoch',
    descriptionDE:
      'Jedes Symbol ist ein linearer Frequenzdurchlauf über die gesamte ' +
      'Kanalbandbreite; die Information steckt im Startpunkt des Durchlaufs. Das ' +
      'Verfahren ist außerordentlich unempfindlich gegen Rauschen und ' +
      'Frequenzablagen und erlaubt Empfang deutlich unterhalb des Rauschpegels. ' +
      'Der Spreizfaktor 7 bis 12 wird gegen Datenrate und Reichweite abgewogen.',
    bandwidthNoteDE:
      'Bandbreiten von 125, 250 oder 500 kHz; Nutzdatenraten je nach Spreizfaktor ' +
      'etwa 250 Bit/s bis 11 kBit/s. Sehr geringe spektrale Effizienz, dafür hohe ' +
      'Reichweite bei minimaler Sendeleistung.',
    applicationsDE: ['LoRaWAN-Sensornetze', 'Zählerfernauslesung', 'Ortungsbaken'],
    source: 'Semtech AN1200.22; LoRa Alliance LoRaWAN-Spezifikation',
  },
];

/**
 * Liefert alle Modulationsverfahren einer Klasse.
 * @param modulationClass Verfahrensklasse
 */
export function getModulationsByClass(modulationClass: ModulationClass): Modulation[] {
  return MODULATIONS.filter((m) => m.class === modulationClass);
}
