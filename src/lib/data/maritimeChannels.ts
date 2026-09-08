/**
 * Seefunk: UKW-Kanäle des mobilen Seefunkdienstes, die Not- und
 * Sicherheitsfrequenzen auf Grenz- und Kurzwelle sowie die GMDSS-Seegebiete.
 *
 * Quellen:
 * - ITU Radio Regulations, Appendix 18 (Rev. WRC-19) — Tabelle der Sende-
 *   frequenzen im UKW-Seefunkband
 * - ITU Radio Regulations, Appendix 15 — Frequenzen für Not- und
 *   Sicherheitsverkehr im GMDSS
 * - SOLAS Kapitel IV (Funkverkehr) — Seegebiete A1 bis A4 und Ausrüstung
 * - ITU-R M.493 (Digitaler Selektivruf DSC), ITU-R M.541 (Betriebsverfahren)
 * - ITU-R M.1371 / IEC 61993-2 (Automatisches Identifikationssystem AIS)
 * - IMO Res. A.801(19) — Kriterien für die Festlegung der Seegebiete
 * - BSH, Nachrichten für Seefahrer und Handbuch Seefunk
 * - RAINWAT (Regionale Vereinbarung über den Binnenschifffahrtsfunk,
 *   Basel 2000 / Bukarest 2012) — ATIS-Pflicht auf Binnenwasserstraßen
 *
 * WARNUNG: Lern- und Nachschlagehilfe, kein Betriebsdokument. Verbindlich sind
 * ausschließlich die amtlichen Veröffentlichungen (VO Funk, NfS, AIP, ITU List IV/V).
 *
 * Alle Frequenzen in Hz.
 */

// ============================================================================
// Konstanten (keine Magic Numbers)
// ============================================================================

/** Untere Grenze des UKW-Seefunkbandes in Hz (VO Funk Appendix 18). */
export const MARITIME_VHF_MIN_HZ = 156_000_000;

/** Obere Grenze des UKW-Seefunkbandes in Hz. */
export const MARITIME_VHF_MAX_HZ = 162_050_000;

/** Kanalraster im UKW-Seefunk in Hz. */
export const MARITIME_VHF_RASTER_HZ = 25_000;

/** Duplexabstand zwischen Schiffs- und Küstenfrequenz in Hz. */
export const MARITIME_DUPLEX_OFFSET_HZ = 4_600_000;

/** Höchstleistung einer UKW-Schiffsfunkstelle in W (VO Funk Appendix 18). */
export const MARITIME_MAX_POWER_W = 25;

/** Leistungsgrenze für Bordverkehr und navigationsbezogene Kanäle in W. */
export const MARITIME_LOW_POWER_W = 1;

/** Not-, Dringlichkeits- und Sicherheitskanal (Sprechfunk) in Hz. */
export const MARITIME_DISTRESS_VHF_HZ = 156_800_000;

/** UKW-Kanal des digitalen Selektivrufs in Hz. */
export const MARITIME_DSC_VHF_HZ = 156_525_000;

/** Not- und Anruffrequenz im Grenzwellenbereich (Sprechfunk) in Hz. */
export const MARITIME_DISTRESS_MF_HZ = 2_182_000;

/** Grenzwellenfrequenz des digitalen Selektivrufs in Hz. */
export const MARITIME_DSC_MF_HZ = 2_187_500;

/** NAVTEX international (englischsprachig) in Hz. */
export const NAVTEX_INTERNATIONAL_HZ = 518_000;

/** NAVTEX national (Landessprache) in Hz. */
export const NAVTEX_NATIONAL_HZ = 490_000;

/** NAVTEX auf Kurzwelle für tropische Gebiete in Hz. */
export const NAVTEX_HF_HZ = 4_209_500;

/** Untere Grenze des Frequenzbereichs der Seenotfunkbaken in Hz. */
export const EPIRB_MIN_HZ = 406_000_000;

/** Obere Grenze des Frequenzbereichs der Seenotfunkbaken in Hz. */
export const EPIRB_MAX_HZ = 406_100_000;

// ============================================================================
// UKW-Kanäle nach VO Funk Appendix 18
// ============================================================================

/**
 * Nutzungsart eines Kanals. Die VO Funk unterscheidet in Appendix 18 mehrere
 * Spalten (Schiff-Schiff, Hafenfunk, Schiffsbewegungsdienst, öffentlicher
 * Verkehr); hier steht die im Alltag maßgebliche Hauptnutzung.
 */
export type MaritimeUsage =
  | 'not-sicherheit'
  | 'dsc'
  | 'schiff-schiff'
  | 'hafen-verkehr'
  | 'oeffentlich'
  | 'bordverkehr'
  | 'ais';

/** Anzeigetexte der Nutzungsarten. */
export const MARITIME_USAGE_LABELS: Record<MaritimeUsage, string> = {
  'not-sicherheit': 'Not, Dringlichkeit, Sicherheit und Anruf',
  dsc: 'Digitaler Selektivruf',
  'schiff-schiff': 'Schiff–Schiff',
  'hafen-verkehr': 'Hafenfunk und Schiffsbewegungsdienst',
  oeffentlich: 'Öffentlicher Sprechfunk über Küstenfunkstellen',
  bordverkehr: 'Bordverkehr und navigationsbezogene Kanäle',
  ais: 'Automatisches Identifikationssystem'
};

/** Ein Kanal des UKW-Seefunks. */
export interface MaritimeChannel {
  /** Kanalbezeichnung nach Appendix 18, z. B. „16", „70", „AIS 1". */
  channel: string;
  /** Sendefrequenz der Schiffsfunkstelle in Hz. */
  shipTxHz: number;
  /** Sendefrequenz der Küstenfunkstelle in Hz; bei Simplex gleich `shipTxHz`. */
  coastTxHz: number;
  /** Zweifrequenzbetrieb (Duplex/Semiduplex)? */
  duplex: boolean;
  usage: MaritimeUsage;
  /** Leistungsgrenze der Schiffsfunkstelle in W, falls abweichend. */
  maxPowerW?: number;
  noteDE: string;
}

/** MHz-Angabe in Hz, ohne Rundungsreste aus der Gleitkommarechnung. */
function mhz(value: number): number {
  return Math.round(value * 1e6);
}

/**
 * Rohtabelle: Kanal, Schiffsfrequenz in MHz, Küstenfrequenz in MHz
 * (`null` = Einfrequenzbetrieb), Hauptnutzung, Hinweis, Leistungsgrenze.
 *
 * Die Reihenfolge folgt der aufsteigenden Schiffsfrequenz und damit dem
 * Verschachtelungsmuster 60/01/61/02 … der VO Funk: Die Kanäle 60 bis 88 liegen
 * genau zwischen den Kanälen 1 bis 28, weil das Raster 1964 von 50 kHz auf
 * 25 kHz halbiert wurde.
 */
const RAW_CHANNELS: [
  channel: string,
  shipMHz: number,
  coastMHz: number | null,
  usage: MaritimeUsage,
  note: string,
  maxPowerW?: number
][] = [
  ['60', 156.025, 160.625, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['01', 156.05, 160.65, 'oeffentlich', 'Zweifrequenzkanal; regional auch Hafenfunk.'],
  ['61', 156.075, 160.675, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['02', 156.1, 160.7, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['62', 156.125, 160.725, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['03', 156.15, 160.75, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['63', 156.175, 160.775, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['04', 156.2, 160.8, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['64', 156.225, 160.825, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['05', 156.25, 160.85, 'oeffentlich', 'Zweifrequenzkanal; vielerorts Revierfunk.'],
  ['65', 156.275, 160.875, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst.'],
  ['06', 156.3, null, 'schiff-schiff', 'Schiff–Schiff; zusätzlich Verkehr mit Luftfahrzeugen bei Such- und Rettungseinsätzen.'],
  ['66', 156.325, 160.925, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst.'],
  ['07', 156.35, 160.95, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['67', 156.375, null, 'schiff-schiff', 'Schiff–Schiff; in mehreren Staaten Sicherheitskanal für kleine Fahrzeuge.'],
  ['08', 156.4, null, 'schiff-schiff', 'Schiff–Schiff, ausschließlich Einfrequenzbetrieb.'],
  ['68', 156.425, null, 'hafen-verkehr', 'Hafenfunk im Einfrequenzbetrieb.'],
  ['09', 156.45, null, 'schiff-schiff', 'Schiff–Schiff und Hafenfunk; vielerorts Lotsenkanal.'],
  ['69', 156.475, null, 'schiff-schiff', 'Schiff–Schiff und Hafenfunk.'],
  ['10', 156.5, null, 'schiff-schiff', 'Schiff–Schiff und Hafenfunk; auch für Meeresverschmutzung.'],
  ['70', 156.525, null, 'dsc', 'Ausschließlich digitaler Selektivruf — hier läuft die Alarmierung, kein Sprechverkehr.'],
  ['11', 156.55, null, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst.'],
  ['71', 156.575, null, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst.'],
  ['12', 156.6, null, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst.'],
  ['72', 156.625, null, 'schiff-schiff', 'Ausschließlich Schiff–Schiff.'],
  ['13', 156.65, null, 'schiff-schiff', 'Brücke–Brücke: Verkehr zur Sicherheit der Schifffahrt; weltweit mitgehört.'],
  ['73', 156.675, null, 'schiff-schiff', 'Schiff–Schiff und Hafenfunk.'],
  ['14', 156.7, null, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst.'],
  ['74', 156.725, null, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst.'],
  ['15', 156.75, null, 'bordverkehr', 'Bordverkehr; höchstens 1 W.', MARITIME_LOW_POWER_W],
  ['75', 156.775, null, 'bordverkehr', 'Nur navigationsbezogener Verkehr im Schutzabstand zu Kanal 16; höchstens 1 W.', MARITIME_LOW_POWER_W],
  ['16', 156.8, null, 'not-sicherheit', 'Not-, Dringlichkeits- und Sicherheitsverkehr sowie Anruf. Dauerwache der Küstenfunkstellen.'],
  ['76', 156.825, null, 'bordverkehr', 'Nur navigationsbezogener Verkehr im Schutzabstand zu Kanal 16; höchstens 1 W.', MARITIME_LOW_POWER_W],
  ['17', 156.85, null, 'bordverkehr', 'Bordverkehr; höchstens 1 W.', MARITIME_LOW_POWER_W],
  ['77', 156.875, null, 'schiff-schiff', 'Ausschließlich Schiff–Schiff.'],
  ['18', 156.9, 161.5, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst im Zweifrequenzbetrieb.'],
  ['78', 156.925, 161.525, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst im Zweifrequenzbetrieb.'],
  ['19', 156.95, 161.55, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst im Zweifrequenzbetrieb.'],
  ['79', 156.975, 161.575, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst im Zweifrequenzbetrieb.'],
  ['20', 157.0, 161.6, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst im Zweifrequenzbetrieb.'],
  ['80', 157.025, 161.625, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst im Zweifrequenzbetrieb.'],
  ['21', 157.05, 161.65, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst im Zweifrequenzbetrieb.'],
  ['81', 157.075, 161.675, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst im Zweifrequenzbetrieb.'],
  ['22', 157.1, 161.7, 'hafen-verkehr', 'Hafenfunk und Schiffsbewegungsdienst im Zweifrequenzbetrieb.'],
  ['82', 157.125, 161.725, 'hafen-verkehr', 'Hafenfunk, Schiffsbewegungsdienst und öffentlicher Verkehr.'],
  ['23', 157.15, 161.75, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['83', 157.175, 161.775, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['24', 157.2, 161.8, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['84', 157.225, 161.825, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['25', 157.25, 161.85, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['85', 157.275, 161.875, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['26', 157.3, 161.9, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['86', 157.325, 161.925, 'oeffentlich', 'Zweifrequenzkanal der Küstenfunkstellen.'],
  ['27', 157.35, 161.95, 'oeffentlich', 'Zweifrequenzkanal; die Küstenfrequenz 161,950 MHz ist seit WRC-15 dem Anwendungsspezifischen Nachrichtendienst ASM 1 zugewiesen.'],
  ['87', 157.375, null, 'hafen-verkehr', 'Seit WRC-12 Einfrequenzkanal; die frühere Küstenfrequenz trägt heute AIS 1.'],
  ['28', 157.4, 162.0, 'oeffentlich', 'Zweifrequenzkanal; die Küstenfrequenz 162,000 MHz ist seit WRC-15 dem Nachrichtendienst ASM 2 zugewiesen.'],
  ['88', 157.425, null, 'hafen-verkehr', 'Seit WRC-12 Einfrequenzkanal; die frühere Küstenfrequenz trägt heute AIS 2.'],
  ['AIS 1', 161.975, null, 'ais', 'Automatisches Identifikationssystem, Kanal 1 (früher 87B). Kennung, Position, Kurs und Fahrt im Zeitschlitzverfahren.'],
  ['AIS 2', 162.025, null, 'ais', 'Automatisches Identifikationssystem, Kanal 2 (früher 88B). Die Stationen wechseln zwischen beiden AIS-Kanälen.']
];

/** Alle UKW-Seefunkkanäle, aufsteigend nach Schiffsfrequenz. */
export const MARITIME_VHF_CHANNELS: MaritimeChannel[] = RAW_CHANNELS.map(
  ([channel, shipMHz, coastMHz, usage, noteDE, maxPowerW]) => ({
    channel,
    shipTxHz: mhz(shipMHz),
    coastTxHz: coastMHz === null ? mhz(shipMHz) : mhz(coastMHz),
    duplex: coastMHz !== null,
    usage,
    maxPowerW,
    noteDE
  })
);

/** Kanal nach Bezeichnung; tolerant gegenüber führender Null und Leerzeichen. */
export function findMaritimeChannel(channel: string): MaritimeChannel | undefined {
  const wanted = channel.trim().toUpperCase();
  const direct = MARITIME_VHF_CHANNELS.find((entry) => entry.channel.toUpperCase() === wanted);
  if (direct) return direct;
  // „6" statt „06", „AIS1" statt „AIS 1"
  const compact = wanted.replace(/\s+/g, '');
  return MARITIME_VHF_CHANNELS.find((entry) => {
    const id = entry.channel.replace(/\s+/g, '').toUpperCase();
    if (id === compact) return true;
    return /^\d+$/.test(id) && /^\d+$/.test(compact) && Number(id) === Number(compact);
  });
}

/**
 * Alle Kanäle, deren Schiffs- oder Küstenfrequenz in das Raster um die
 * gesuchte Frequenz fällt. Mehrfachtreffer sind möglich, weil sich
 * Duplexkanäle die Küstenfrequenz mit einem anderen Dienst teilen können.
 */
export function maritimeChannelsForFrequency(
  frequencyHz: number,
  toleranceHz: number = MARITIME_VHF_RASTER_HZ / 2
): { channel: MaritimeChannel; direction: 'schiff' | 'kueste' }[] {
  if (!Number.isFinite(frequencyHz)) return [];
  const hits: { channel: MaritimeChannel; direction: 'schiff' | 'kueste' }[] = [];
  for (const channel of MARITIME_VHF_CHANNELS) {
    if (Math.abs(channel.shipTxHz - frequencyHz) <= toleranceHz) {
      hits.push({ channel, direction: 'schiff' });
    }
    if (channel.duplex && Math.abs(channel.coastTxHz - frequencyHz) <= toleranceHz) {
      hits.push({ channel, direction: 'kueste' });
    }
  }
  return hits;
}

/** Kanäle einer Nutzungsart; `alle` liefert die vollständige Liste. */
export function maritimeChannelsByUsage(usage: MaritimeUsage | 'alle'): MaritimeChannel[] {
  if (usage === 'alle') return MARITIME_VHF_CHANNELS;
  return MARITIME_VHF_CHANNELS.filter((entry) => entry.usage === usage);
}

/** Anzahl der Kanäle je Nutzungsart, für Filterbeschriftungen. */
export function maritimeUsageCounts(): { id: MaritimeUsage; label: string; count: number }[] {
  return (Object.keys(MARITIME_USAGE_LABELS) as MaritimeUsage[]).map((id) => ({
    id,
    label: MARITIME_USAGE_LABELS[id],
    count: MARITIME_VHF_CHANNELS.filter((entry) => entry.usage === id).length
  }));
}

// ============================================================================
// Not- und Sicherheitsfrequenzen auf Grenz- und Kurzwelle (Appendix 15)
// ============================================================================

/** Betriebsart einer GMDSS-Frequenz auf Grenz- und Kurzwelle. */
export type MaritimeHfMode = 'sprechfunk' | 'dsc' | 'nbdp' | 'navtex';

/** Eine Not- oder Sicherheitsfrequenz unterhalb des UKW-Bereichs. */
export interface MaritimeHfFrequency {
  id: string;
  /** Bandbezeichnung, z. B. „Grenzwelle 2 MHz" oder „8-MHz-Band". */
  bandDE: string;
  frequencyHz: number;
  mode: MaritimeHfMode;
  noteDE: string;
}

/**
 * Not- und Sicherheitsfrequenzen des GMDSS auf Grenz- und Kurzwelle.
 * Reihenfolge: aufsteigend nach Frequenz.
 */
export const MARITIME_HF_FREQUENCIES: MaritimeHfFrequency[] = [
  {
    id: 'navtex-490',
    bandDE: 'Grenzwelle',
    frequencyHz: NAVTEX_NATIONAL_HZ,
    mode: 'navtex',
    noteDE: 'NAVTEX in der Landessprache; in Deutschland Sendungen des BSH.'
  },
  {
    id: 'navtex-518',
    bandDE: 'Grenzwelle',
    frequencyHz: NAVTEX_INTERNATIONAL_HZ,
    mode: 'navtex',
    noteDE: 'Internationaler NAVTEX-Dienst, ausschließlich in englischer Sprache.'
  },
  {
    id: 'nbdp-2174',
    bandDE: 'Grenzwelle 2 MHz',
    frequencyHz: 2_174_500,
    mode: 'nbdp',
    noteDE: 'Funkfernschreiben mit Fehlerkorrektur für Not- und Sicherheitsverkehr.'
  },
  {
    id: 'voice-2182',
    bandDE: 'Grenzwelle 2 MHz',
    frequencyHz: MARITIME_DISTRESS_MF_HZ,
    mode: 'sprechfunk',
    noteDE: 'Weltweite Not- und Anruffrequenz im Sprechfunk (Einseitenband, oberes Seitenband).'
  },
  {
    id: 'dsc-2187',
    bandDE: 'Grenzwelle 2 MHz',
    frequencyHz: MARITIME_DSC_MF_HZ,
    mode: 'dsc',
    noteDE: 'Digitaler Selektivruf im Seegebiet A2; Dauerwache der Küstenfunkstellen.'
  },
  {
    id: 'voice-4125',
    bandDE: '4-MHz-Band',
    frequencyHz: 4_125_000,
    mode: 'sprechfunk',
    noteDE: 'Not- und Sicherheitsverkehr; wird auch von Luftfahrzeugen im Rettungseinsatz genutzt.'
  },
  { id: 'nbdp-4177', bandDE: '4-MHz-Band', frequencyHz: 4_177_500, mode: 'nbdp', noteDE: 'Funkfernschreiben für Not- und Sicherheitsverkehr.' },
  { id: 'dsc-4207', bandDE: '4-MHz-Band', frequencyHz: 4_207_500, mode: 'dsc', noteDE: 'Digitaler Selektivruf im Seegebiet A3/A4.' },
  { id: 'navtex-4209', bandDE: '4-MHz-Band', frequencyHz: NAVTEX_HF_HZ, mode: 'navtex', noteDE: 'NAVTEX-Aussendungen in tropischen Seegebieten.' },
  { id: 'voice-6215', bandDE: '6-MHz-Band', frequencyHz: 6_215_000, mode: 'sprechfunk', noteDE: 'Not- und Sicherheitsverkehr im Sprechfunk.' },
  { id: 'nbdp-6268', bandDE: '6-MHz-Band', frequencyHz: 6_268_000, mode: 'nbdp', noteDE: 'Funkfernschreiben für Not- und Sicherheitsverkehr.' },
  { id: 'dsc-6312', bandDE: '6-MHz-Band', frequencyHz: 6_312_000, mode: 'dsc', noteDE: 'Digitaler Selektivruf im Seegebiet A3/A4.' },
  { id: 'voice-8291', bandDE: '8-MHz-Band', frequencyHz: 8_291_000, mode: 'sprechfunk', noteDE: 'Not- und Sicherheitsverkehr im Sprechfunk.' },
  { id: 'nbdp-8376', bandDE: '8-MHz-Band', frequencyHz: 8_376_500, mode: 'nbdp', noteDE: 'Funkfernschreiben für Not- und Sicherheitsverkehr.' },
  { id: 'dsc-8414', bandDE: '8-MHz-Band', frequencyHz: 8_414_500, mode: 'dsc', noteDE: 'Digitaler Selektivruf; das am weitesten reichende DSC-Band bei Tag.' },
  { id: 'voice-12290', bandDE: '12-MHz-Band', frequencyHz: 12_290_000, mode: 'sprechfunk', noteDE: 'Not- und Sicherheitsverkehr im Sprechfunk.' },
  { id: 'nbdp-12520', bandDE: '12-MHz-Band', frequencyHz: 12_520_000, mode: 'nbdp', noteDE: 'Funkfernschreiben für Not- und Sicherheitsverkehr.' },
  { id: 'dsc-12577', bandDE: '12-MHz-Band', frequencyHz: 12_577_000, mode: 'dsc', noteDE: 'Digitaler Selektivruf im Seegebiet A3/A4.' },
  { id: 'voice-16420', bandDE: '16-MHz-Band', frequencyHz: 16_420_000, mode: 'sprechfunk', noteDE: 'Not- und Sicherheitsverkehr im Sprechfunk.' },
  { id: 'nbdp-16695', bandDE: '16-MHz-Band', frequencyHz: 16_695_000, mode: 'nbdp', noteDE: 'Funkfernschreiben für Not- und Sicherheitsverkehr.' },
  { id: 'dsc-16804', bandDE: '16-MHz-Band', frequencyHz: 16_804_500, mode: 'dsc', noteDE: 'Digitaler Selektivruf über große Entfernungen bei guter Ausbreitung.' }
];

// ============================================================================
// GMDSS-Seegebiete (SOLAS Kapitel IV, IMO Res. A.801)
// ============================================================================

/** Ein Seegebiet des weltweiten Seenot- und Sicherheitsfunksystems. */
export interface GmdssSeaArea {
  id: 'A1' | 'A2' | 'A3' | 'A4';
  nameDE: string;
  /** Grobe Ausdehnung als Text. */
  extentDE: string;
  /** Typische Reichweite in Seemeilen; `null`, wenn nicht sinnvoll angebbar. */
  typicalRangeNm: number | null;
  /** Tragendes Funksystem. */
  systemDE: string;
  /** Ausrüstung, die dieses Gebiet zusätzlich verlangt. */
  equipmentDE: string[];
  descriptionDE: string;
}

/**
 * Annahme: Die Reichweitenangaben sind Richtwerte. SOLAS definiert die Gebiete
 * über die tatsächliche Funkabdeckung der Küstenfunkstellen, die jede
 * Verwaltung selbst festlegt und in der ITU List of Coast Stations bekannt gibt.
 */
export const GMDSS_SEA_AREAS: GmdssSeaArea[] = [
  {
    id: 'A1',
    nameDE: 'Seegebiet A1',
    extentDE: 'Küstennah, innerhalb der UKW-Reichweite einer Küstenfunkstelle mit DSC-Wache',
    typicalRangeNm: 25,
    systemDE: 'UKW mit DSC auf Kanal 70',
    equipmentDE: ['UKW-Anlage mit DSC (Kanal 70)', 'Kanal 16 für den Sprechverkehr', 'NAVTEX-Empfänger', 'Satelliten-EPIRB 406 MHz'],
    descriptionDE:
      'Die Alarmierung läuft über den digitalen Selektivruf auf Kanal 70; die Reichweite folgt der Sichtweite und hängt vor allem von der Antennenhöhe der Küstenstation ab.'
  },
  {
    id: 'A2',
    nameDE: 'Seegebiet A2',
    extentDE: 'Außerhalb von A1, aber innerhalb der Grenzwellenreichweite einer Küstenfunkstelle mit DSC-Wache',
    typicalRangeNm: 150,
    systemDE: 'Grenzwelle mit DSC auf 2187,5 kHz',
    equipmentDE: ['Grenzwellenanlage mit DSC (2187,5 kHz)', 'Sprechfunk auf 2182 kHz', 'zusätzlich die A1-Ausrüstung'],
    descriptionDE:
      'Die Bodenwelle im 2-MHz-Bereich trägt über den Horizont hinaus. Nachts steigt die Reichweite durch die Raumwelle, gleichzeitig nehmen Störungen zu.'
  },
  {
    id: 'A3',
    nameDE: 'Seegebiet A3',
    extentDE: 'Außerhalb von A1 und A2 innerhalb der Ausleuchtzone geostationärer Kommunikationssatelliten, etwa zwischen 76° Nord und 76° Süd',
    typicalRangeNm: null,
    systemDE: 'Satellitenfunk (Inmarsat, Iridium) oder Kurzwelle mit DSC',
    equipmentDE: ['Schiffs-Erdfunkstelle mit Notruftaste', 'Kurzwellenanlage mit DSC', 'EGC-Empfänger für Sicherheitsmeldungen', 'zusätzlich die A1- und A2-Ausrüstung'],
    descriptionDE:
      'Ein geostationärer Satellit steht über dem Äquator; in hohen Breiten sinkt er unter den Horizont. Daraus ergibt sich die Grenze des Gebiets A3.'
  },
  {
    id: 'A4',
    nameDE: 'Seegebiet A4',
    extentDE: 'Die Polargebiete außerhalb von A1, A2 und A3',
    typicalRangeNm: null,
    systemDE: 'Kurzwelle mit DSC; ergänzend Satellitensysteme in polaren Umlaufbahnen',
    equipmentDE: ['Kurzwellenanlage mit DSC und Funkfernschreiben', 'zusätzlich die A1-, A2- und A3-Ausrüstung'],
    descriptionDE:
      'Ohne geostationäre Abdeckung bleibt die Kurzwelle das tragende System. Systeme in polnaher Umlaufbahn schließen die Lücke zunehmend.'
  }
];
