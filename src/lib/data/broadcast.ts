/**
 * Rundfunk: analoge und digitale Verbreitungswege mit ihren Frequenzbereichen,
 * Kanalrastern und Kanaltabellen.
 *
 * Quellen:
 * - ITU Radio Regulations, Artikel 5 (Rundfunkbänder HF)
 * - Genfer Wellenplan 1975 (GE75) für LW/MW, Genf 1984 (GE84) für UKW
 * - Regionale Vereinbarung Genf 2006 (GE06) für T-DAB und DVB-T
 * - ETSI EN 300 401 (DAB) und ETSI EN 302 755 (DVB-T2)
 * - HFCC-Saisonpläne für die Kurzwellen-Rundfunkbänder
 *
 * Alle Frequenzen in Hz.
 */

// ============================================================================
// Kanalraster und Bandbreiten (benannte Konstanten)
// ============================================================================

/** Kanalraster im Mittel- und Langwellenrundfunk der ITU-Region 1 in Hz. */
export const AM_CHANNEL_SPACING_R1_HZ = 9e3;

/** Kanalraster im Mittelwellenrundfunk der ITU-Region 2 in Hz. */
export const AM_CHANNEL_SPACING_R2_HZ = 10e3;

/** Kanalraster im Kurzwellenrundfunk in Hz. */
export const SW_CHANNEL_SPACING_HZ = 5e3;

/** Feinstes UKW-Frequenzraster in Europa in Hz. */
export const FM_CHANNEL_RASTER_HZ = 100e3;

/** Maximaler Frequenzhub im UKW-Rundfunk in Hz. */
export const FM_MAX_DEVIATION_HZ = 75e3;

/** Höchste übertragene Modulationsfrequenz im UKW-Rundfunk (Mono) in Hz. */
export const FM_MAX_AUDIO_HZ = 15e3;

/** Pilotton für die Stereodecodierung in Hz. */
export const FM_PILOT_TONE_HZ = 19e3;

/** Hilfsträger des Radiodatensystems RDS in Hz. */
export const RDS_SUBCARRIER_HZ = 57e3;

/** Belegte Bandbreite eines DAB-Blocks in Hz. */
export const DAB_BLOCK_BANDWIDTH_HZ = 1.536e6;

/** Belegte Bandbreite eines DVB-T2-Kanals in Europa in Hz. */
export const DVBT2_CHANNEL_BANDWIDTH_HZ = 8e6;

// ============================================================================
// Analoge Rundfunkbereiche
// ============================================================================

export interface BroadcastRange {
  id: string;
  nameDE: string;
  minHz: number;
  maxHz: number;
  /** Kanalraster in Hz, 0 falls kein festes Raster */
  rasterHz: number;
  descriptionDE: string;
  source: string;
}

export const BROADCAST_RANGES: BroadcastRange[] = [
  {
    id: 'lw',
    nameDE: 'Langwelle',
    minHz: 148.5e3,
    maxHz: 283.5e3,
    rasterHz: AM_CHANNEL_SPACING_R1_HZ,
    descriptionDE:
      'Nur in ITU-Region 1 für Rundfunk zugewiesen. Die Bodenwelle trägt tagsüber ' +
      'mehrere hundert Kilometer weit und schwankt kaum, weshalb Langwelle lange für ' +
      'landesweite Programme und Zeitzeichen genutzt wurde. In Mitteleuropa ist der ' +
      'Betrieb bis auf wenige Ausnahmen eingestellt.',
    source: 'GE75; ITU RR Art. 5',
  },
  {
    id: 'mw',
    nameDE: 'Mittelwelle',
    minHz: 526.5e3,
    maxHz: 1606.5e3,
    rasterHz: AM_CHANNEL_SPACING_R1_HZ,
    descriptionDE:
      'Tagsüber Bodenwellenversorgung im Umkreis von etwa hundert Kilometern, nachts ' +
      'überlagert die an der Ionosphäre reflektierte Raumwelle das Signal und bringt ' +
      'Fernempfang, aber auch Schwund und gegenseitige Störungen. In Region 2 gilt ' +
      'ein 10-kHz-Raster und der Bereich reicht bis 1705 kHz.',
    source: 'GE75; ITU RR Art. 5',
  },
  {
    id: 'fm',
    nameDE: 'UKW (Band II)',
    minHz: 87.5e6,
    maxHz: 108e6,
    rasterHz: FM_CHANNEL_RASTER_HZ,
    descriptionDE:
      'Frequenzmodulierter Hörfunk mit einem Frequenzhub von bis zu 75 kHz. Nach der ' +
      'Carson-Regel ergibt sich daraus eine belegte Bandbreite von etwa 180 kHz, ' +
      'weshalb benachbarte Sender am selben Ort mindestens 300 bis 400 kHz Abstand ' +
      'halten. Der Stereo-Differenzkanal liegt oberhalb des Pilottons, RDS auf 57 kHz.',
    source: 'GE84; ITU RR Anhang 10',
  },
];

// ============================================================================
// Kurzwellen-Rundfunkbänder
// ============================================================================

export interface ShortwaveBand {
  /** Wellenlängenbezeichnung, z. B. "49 m" */
  nameDE: string;
  minHz: number;
  maxHz: number;
  /** true für die Tropenbänder mit regional beschränkter Nutzung */
  tropical: boolean;
}

/**
 * Kurzwellen-Rundfunkbänder nach ITU RR Art. 5.
 * Die Tropenbänder 120 m, 90 m, 75 m und 60 m sind auf tropische Zonen beschränkt.
 */
export const SHORTWAVE_BANDS: ShortwaveBand[] = [
  { nameDE: '120 m', minHz: 2300e3, maxHz: 2495e3, tropical: true },
  { nameDE: '90 m', minHz: 3200e3, maxHz: 3400e3, tropical: true },
  { nameDE: '75 m', minHz: 3900e3, maxHz: 4000e3, tropical: true },
  { nameDE: '60 m (unterer Teil)', minHz: 4750e3, maxHz: 4995e3, tropical: true },
  { nameDE: '60 m (oberer Teil)', minHz: 5005e3, maxHz: 5060e3, tropical: true },
  { nameDE: '49 m', minHz: 5900e3, maxHz: 6200e3, tropical: false },
  { nameDE: '41 m', minHz: 7200e3, maxHz: 7450e3, tropical: false },
  { nameDE: '31 m', minHz: 9400e3, maxHz: 9900e3, tropical: false },
  { nameDE: '25 m', minHz: 11600e3, maxHz: 12100e3, tropical: false },
  { nameDE: '22 m', minHz: 13570e3, maxHz: 13870e3, tropical: false },
  { nameDE: '19 m', minHz: 15100e3, maxHz: 15800e3, tropical: false },
  { nameDE: '16 m', minHz: 17480e3, maxHz: 17900e3, tropical: false },
  { nameDE: '15 m', minHz: 18900e3, maxHz: 19020e3, tropical: false },
  { nameDE: '13 m', minHz: 21450e3, maxHz: 21850e3, tropical: false },
  { nameDE: '11 m', minHz: 25670e3, maxHz: 26100e3, tropical: false },
];

// ============================================================================
// DAB+ — Band III, Blöcke 5A bis 12D
// Blockmitten gemäß dem T-DAB-Frequenzraster der Region 1 (GE06).
// Jeder Block belegt DAB_BLOCK_BANDWIDTH_HZ; die Bandgrenzen ergeben sich
// aus centerHz ∓ DAB_BLOCK_BANDWIDTH_HZ / 2.
// ============================================================================

export interface DabBlock {
  /** Blockbezeichnung, z. B. "11C" */
  block: string;
  /** Blockmittenfrequenz in Hz */
  centerHz: number;
}

export const DAB_BLOCKS: DabBlock[] = [
  { block: '5A', centerHz: 174928000 },
  { block: '5B', centerHz: 176640000 },
  { block: '5C', centerHz: 178352000 },
  { block: '5D', centerHz: 180064000 },
  { block: '6A', centerHz: 181936000 },
  { block: '6B', centerHz: 183648000 },
  { block: '6C', centerHz: 185360000 },
  { block: '6D', centerHz: 187072000 },
  { block: '7A', centerHz: 188928000 },
  { block: '7B', centerHz: 190640000 },
  { block: '7C', centerHz: 192352000 },
  { block: '7D', centerHz: 194064000 },
  { block: '8A', centerHz: 195936000 },
  { block: '8B', centerHz: 197648000 },
  { block: '8C', centerHz: 199360000 },
  { block: '8D', centerHz: 201072000 },
  { block: '9A', centerHz: 202928000 },
  { block: '9B', centerHz: 204640000 },
  { block: '9C', centerHz: 206352000 },
  { block: '9D', centerHz: 208064000 },
  { block: '10A', centerHz: 209936000 },
  { block: '10B', centerHz: 211648000 },
  { block: '10C', centerHz: 213360000 },
  { block: '10D', centerHz: 215072000 },
  { block: '11A', centerHz: 216928000 },
  { block: '11B', centerHz: 218640000 },
  { block: '11C', centerHz: 220352000 },
  { block: '11D', centerHz: 222064000 },
  { block: '12A', centerHz: 223936000 },
  { block: '12B', centerHz: 225648000 },
  { block: '12C', centerHz: 227360000 },
  { block: '12D', centerHz: 229072000 },
];

/** Untere Bandgrenze des für DAB+ genutzten VHF-Band III in Hz. */
export const DAB_BAND_III_MIN_HZ = 174e6;

/** Obere Bandgrenze des für DAB+ genutzten VHF-Band III in Hz. */
export const DAB_BAND_III_MAX_HZ = 230e6;

/**
 * Liefert die Bandgrenzen eines DAB-Blocks.
 * @param block Blockbezeichnung, z. B. "5C"
 */
export function getDabBlockRange(block: string): { minHz: number; maxHz: number } | undefined {
  const entry = DAB_BLOCKS.find((b) => b.block === block);
  if (!entry) return undefined;
  const half = DAB_BLOCK_BANDWIDTH_HZ / 2;
  return { minHz: entry.centerHz - half, maxHz: entry.centerHz + half };
}

// ============================================================================
// DVB-T2 — UHF-Kanäle 21 bis 48
// Kanalmitte = 306 MHz + 8 MHz · Kanalnummer (europäisches 8-MHz-Raster).
// Der nutzbare Bereich endet seit der 700-MHz-Umwidmung bei 694 MHz.
// ============================================================================

export interface DvbT2Channel {
  /** Kanalnummer nach europäischer UHF-Kanaltabelle */
  channel: number;
  /** Kanalmittenfrequenz in Hz */
  centerHz: number;
}

/** Offset der europäischen UHF-Kanaltabelle in Hz (Kanalmitte = Offset + 8 MHz · N). */
export const DVBT2_CHANNEL_OFFSET_HZ = 306e6;

export const DVBT2_CHANNELS: DvbT2Channel[] = [
  { channel: 21, centerHz: 474e6 },
  { channel: 22, centerHz: 482e6 },
  { channel: 23, centerHz: 490e6 },
  { channel: 24, centerHz: 498e6 },
  { channel: 25, centerHz: 506e6 },
  { channel: 26, centerHz: 514e6 },
  { channel: 27, centerHz: 522e6 },
  { channel: 28, centerHz: 530e6 },
  { channel: 29, centerHz: 538e6 },
  { channel: 30, centerHz: 546e6 },
  { channel: 31, centerHz: 554e6 },
  { channel: 32, centerHz: 562e6 },
  { channel: 33, centerHz: 570e6 },
  { channel: 34, centerHz: 578e6 },
  { channel: 35, centerHz: 586e6 },
  { channel: 36, centerHz: 594e6 },
  { channel: 37, centerHz: 602e6 },
  { channel: 38, centerHz: 610e6 },
  { channel: 39, centerHz: 618e6 },
  { channel: 40, centerHz: 626e6 },
  { channel: 41, centerHz: 634e6 },
  { channel: 42, centerHz: 642e6 },
  { channel: 43, centerHz: 650e6 },
  { channel: 44, centerHz: 658e6 },
  { channel: 45, centerHz: 666e6 },
  { channel: 46, centerHz: 674e6 },
  { channel: 47, centerHz: 682e6 },
  { channel: 48, centerHz: 690e6 },
];

/** Untere Grenze des terrestrischen Fernsehbereichs in Deutschland in Hz. */
export const DVBT2_BAND_MIN_HZ = 470e6;

/** Obere Grenze des terrestrischen Fernsehbereichs in Deutschland in Hz. */
export const DVBT2_BAND_MAX_HZ = 694e6;

/**
 * Liefert die Bandgrenzen eines DVB-T2-Kanals.
 * @param channel Kanalnummer (21 bis 48)
 */
export function getDvbT2ChannelRange(
  channel: number
): { minHz: number; maxHz: number } | undefined {
  const entry = DVBT2_CHANNELS.find((c) => c.channel === channel);
  if (!entry) return undefined;
  const half = DVBT2_CHANNEL_BANDWIDTH_HZ / 2;
  return { minHz: entry.centerHz - half, maxHz: entry.centerHz + half };
}

// ============================================================================
// Satellitenfernsehen (Ku-Band)
// ============================================================================

export interface SatelliteTvBand {
  id: string;
  nameDE: string;
  minHz: number;
  maxHz: number;
  descriptionDE: string;
  source: string;
}

/** Oszillatorfrequenz des LNB im unteren Ku-Band in Hz. */
export const LNB_LO_LOW_HZ = 9.75e9;

/** Oszillatorfrequenz des LNB im oberen Ku-Band in Hz. */
export const LNB_LO_HIGH_HZ = 10.6e9;

/** Untere Grenze der Satelliten-Zwischenfrequenz in Hz. */
export const SAT_IF_MIN_HZ = 950e6;

/** Obere Grenze der Satelliten-Zwischenfrequenz in Hz. */
export const SAT_IF_MAX_HZ = 2150e6;

export const SATELLITE_TV_BANDS: SatelliteTvBand[] = [
  {
    id: 'ku-low',
    nameDE: 'Ku-Band Downlink, unteres Band',
    minHz: 10.7e9,
    maxHz: 11.7e9,
    descriptionDE:
      'Wird vom LNB mit einem Oszillator bei 9,75 GHz auf die Zwischenfrequenz ' +
      '950 bis 1950 MHz heruntergesetzt und über Koaxialkabel zum Empfänger geführt.',
    source: 'ITU RR Anhang 30; Satellitenbetreiberangaben',
  },
  {
    id: 'ku-high',
    nameDE: 'Ku-Band Downlink, oberes Band',
    minHz: 11.7e9,
    maxHz: 12.75e9,
    descriptionDE:
      'Umsetzung mit einem Oszillator bei 10,6 GHz auf 1100 bis 2150 MHz. Die ' +
      'Umschaltung zwischen unterem und oberem Band erfolgt über einen 22-kHz-Ton ' +
      'auf der Antennenleitung.',
    source: 'ITU RR Anhang 30; Satellitenbetreiberangaben',
  },
  {
    id: 'ku-uplink',
    nameDE: 'Ku-Band Uplink',
    minHz: 13.75e9,
    maxHz: 14.5e9,
    descriptionDE:
      'Aufwärtsstrecke der Bodenstationen zum Satelliten. Die Trennung von Hin- und ' +
      'Rückrichtung über verschiedene Bänder vermeidet Selbststörungen des Transponders.',
    source: 'ITU RR Anhang 30A',
  },
  {
    id: 'ka-downlink',
    nameDE: 'Ka-Band Downlink (Breitband)',
    minHz: 17.7e9,
    maxHz: 21.2e9,
    descriptionDE:
      'Von modernen Breitbandsatelliten und Konstellationen im niedrigen Erdorbit ' +
      'genutzt. Höhere Bandbreite als Ku, dafür deutlich stärkere Regendämpfung.',
    source: 'ITU RR Art. 5',
  },
];
