/**
 * Flugfunk und Flugnavigation: Frequenzbereiche des beweglichen Flugfunkdienstes,
 * der Funknavigationsanlagen und der Datenverbindungen — dazu die Umrechnung
 * zwischen 8,33-kHz-Kanalbezeichnung und tatsächlicher Frequenz.
 *
 * Quellen:
 * - ICAO Annex 10 (Aeronautical Telecommunications), Volume I (Radio Navigation
 *   Aids), Volume III (Communication Systems), Volume IV (Surveillance Radar and
 *   Collision Avoidance Systems) und Volume V (Aeronautical Radio Frequency
 *   Spectrum Utilization) — insbesondere die Kanalbezeichnungstabelle für
 *   25 kHz und 8,33 kHz
 * - ITU Radio Regulations, Artikel 5 (Zuweisungen an den Flugfunkdienst und den
 *   Flugnavigationsfunkdienst) und Appendix 27 (HF-Flugfunkbänder)
 * - Durchführungsverordnung (EU) Nr. 1079/2012 der Kommission
 *   (Sprachkanalabstand 8,33 kHz im europäischen Luftraum)
 * - EUROCONTROL, 8.33 kHz Voice Channel Spacing Implementation
 * - RTCA DO-260 / EUROCAE ED-102 (ADS-B über 1090 MHz Extended Squitter)
 * - ARINC 618/620 (ACARS), ARINC 781 (Satcom)
 * - COSPAS-SARSAT C/S T.001 (406-MHz-Notfunkbaken)
 *
 * WARNUNG: Lern- und Nachschlagehilfe, kein Betriebsdokument. Verbindlich sind
 * das Luftfahrthandbuch AIP und die Veröffentlichungen der Flugsicherung.
 *
 * Alle Frequenzen in Hz.
 */

// ============================================================================
// Konstanten des VHF-Sprechfunkbandes (keine Magic Numbers)
// ============================================================================

/** Untere Grenze des zivilen VHF-Sprechfunkbandes in Hz. */
export const VHF_COM_MIN_HZ = 118_000_000;

/** Obere Grenze des zivilen VHF-Sprechfunkbandes in Hz (ICAO Annex 10 Vol. V). */
export const VHF_COM_MAX_HZ = 137_000_000;

/** Klassischer Kanalabstand im Flugfunk in Hz. */
export const VHF_SPACING_25_HZ = 25_000;

/**
 * Nomineller Kanalabstand des 8,33-kHz-Rasters in Hz.
 * Exakt ein Drittel von 25 kHz — daher die krummen Frequenzen.
 */
export const VHF_SPACING_833_HZ = 25_000 / 3;

/** Zahl der 8,33-kHz-Kanäle innerhalb eines 25-kHz-Rasterplatzes. */
export const CHANNELS_PER_25_KHZ = 3;

/** Zivile Notfrequenz im VHF-Flugfunk in Hz. */
export const AERO_EMERGENCY_VHF_HZ = 121_500_000;

/** Militärische Notfrequenz im UHF-Flugfunk in Hz. */
export const AERO_EMERGENCY_UHF_HZ = 243_000_000;

// ============================================================================
// Kanalbezeichnung ↔ Frequenz (ICAO Annex 10 Vol. V, Tabelle 4-1 bis 4-3)
// ============================================================================

/**
 * Ergebnis einer Kanalabfrage.
 *
 * `designator` ist die Bezeichnung, wie sie im Flugplan, in Karten und in der
 * Freigabe genannt wird. `frequencyHz` ist die tatsächlich abgestrahlte
 * Trägerfrequenz — beides fällt beim 8,33-kHz-Raster auseinander.
 */
export interface AviationChannel {
  designator: string;
  frequencyHz: number;
  /** Nomineller Kanalabstand in Hz: 25 kHz oder 8,33 kHz. */
  spacingHz: number;
}

/**
 * Rest des kHz-Anteils modulo 25 → Platz innerhalb des 25-kHz-Rasterplatzes.
 *
 * Das Muster wiederholt sich viermal je 100 kHz. Endungen auf 00, 25, 50 und 75
 * bezeichnen weiterhin 25-kHz-Kanäle (Rest 0); die Endungen 05/10/15, 30/35/40,
 * 55/60/65 und 80/85/90 bezeichnen die drei 8,33-kHz-Kanäle des jeweiligen
 * Rasterplatzes (Rest 5, 10, 15). Die Endungen 20, 45, 70 und 95 sind nicht
 * vergeben.
 */
const REMAINDER_TO_INDEX: Record<number, number> = { 5: 0, 10: 1, 15: 2 };

/** Rest 0 kennzeichnet einen 25-kHz-Kanal. */
const SPACING_25_REMAINDER = 0;

/** Erste vergebene Endung eines 8,33-kHz-Rasterplatzes in kHz. */
const FIRST_833_SUFFIX_KHZ = 5;

/** Abstand zwischen zwei Endungen desselben Rasterplatzes in kHz. */
const SUFFIX_STEP_KHZ = 5;

/** Kilohertz je Megahertz. */
const KHZ_PER_MHZ = 1000;

/** Kanalbezeichnung in ihre Bestandteile zerlegen: „118.005" → 118 und 5 kHz. */
function splitDesignator(designator: string): { mhz: number; khz: number } | undefined {
  const match = designator
    .trim()
    .replace(',', '.')
    .match(/^(\d{3})\.(\d{3})$/);
  if (!match) return undefined;
  return { mhz: Number(match[1]), khz: Number(match[2]) };
}

/**
 * Kanalbezeichnung → tatsächliche Frequenz.
 *
 * Beispiele nach ICAO Annex 10 Vol. V:
 * „118.005" → 118,000000 MHz, „118.010" → 118,008333 MHz,
 * „118.015" → 118,016667 MHz, „118.030" → 118,025000 MHz.
 * Bezeichnungen mit den Endungen 00/25/50/75 sind 25-kHz-Kanäle; dort stimmen
 * Bezeichnung und Frequenz überein.
 */
export function aviationChannelFromDesignator(designator: string): AviationChannel | undefined {
  const parts = splitDesignator(designator);
  if (!parts) return undefined;

  const baseHz = parts.mhz * 1e6;
  if (baseHz < VHF_COM_MIN_HZ || baseHz >= VHF_COM_MAX_HZ) return undefined;

  const rest = parts.khz % (VHF_SPACING_25_HZ / KHZ_PER_MHZ);

  if (rest === SPACING_25_REMAINDER) {
    return {
      designator: formatDesignator(parts.mhz, parts.khz),
      frequencyHz: Math.round(baseHz + parts.khz * KHZ_PER_MHZ),
      spacingHz: VHF_SPACING_25_HZ
    };
  }

  const index = REMAINDER_TO_INDEX[rest];
  if (index === undefined) return undefined;

  const blockStartKHz = parts.khz - rest;
  const frequencyHz = baseHz + blockStartKHz * KHZ_PER_MHZ + index * VHF_SPACING_833_HZ;
  return {
    designator: formatDesignator(parts.mhz, parts.khz),
    frequencyHz,
    spacingHz: VHF_SPACING_833_HZ
  };
}

/** Bezeichnung normieren: 118 und 5 → „118.005". */
function formatDesignator(mhzPart: number, khzPart: number): string {
  return `${mhzPart}.${String(khzPart).padStart(3, '0')}`;
}

/**
 * Tatsächliche Frequenz → Kanalbezeichnung im 8,33-kHz-Raster.
 *
 * Liefert `undefined`, wenn die Frequenz außerhalb des Bandes liegt oder nicht
 * auf einem Kanal des Rasters sitzt (Toleranz: eine halbe Kanalbreite).
 */
export function aviationChannelFromFrequency(
  frequencyHz: number,
  spacingHz: number = VHF_SPACING_833_HZ
): AviationChannel | undefined {
  if (!Number.isFinite(frequencyHz)) return undefined;
  if (frequencyHz < VHF_COM_MIN_HZ || frequencyHz >= VHF_COM_MAX_HZ) return undefined;

  const mhzPart = Math.floor(frequencyHz / 1e6);
  const offsetHz = frequencyHz - mhzPart * 1e6;

  if (spacingHz === VHF_SPACING_25_HZ) {
    const step = Math.round(offsetHz / VHF_SPACING_25_HZ);
    const khzPart = (step * VHF_SPACING_25_HZ) / KHZ_PER_MHZ;
    if (khzPart >= KHZ_PER_MHZ) return undefined;
    return {
      designator: formatDesignator(mhzPart, khzPart),
      frequencyHz: mhzPart * 1e6 + khzPart * KHZ_PER_MHZ,
      spacingHz: VHF_SPACING_25_HZ
    };
  }

  const step = Math.round(offsetHz / VHF_SPACING_833_HZ);
  const blockIndex = Math.floor(step / CHANNELS_PER_25_KHZ);
  const index = step - blockIndex * CHANNELS_PER_25_KHZ;
  const blockStartKHz = (blockIndex * VHF_SPACING_25_HZ) / KHZ_PER_MHZ;
  if (blockStartKHz >= KHZ_PER_MHZ) return undefined;
  const khzPart = blockStartKHz + FIRST_833_SUFFIX_KHZ + index * SUFFIX_STEP_KHZ;
  return {
    designator: formatDesignator(mhzPart, khzPart),
    frequencyHz: mhzPart * 1e6 + blockStartKHz * KHZ_PER_MHZ + index * VHF_SPACING_833_HZ,
    spacingHz: VHF_SPACING_833_HZ
  };
}

/** Ist die Endung einer Kanalbezeichnung überhaupt vergeben? */
export function isValidAviationDesignator(designator: string): boolean {
  return aviationChannelFromDesignator(designator) !== undefined;
}

/** Zahl der Sprechfunkkanäle im Band 118–137 MHz beim jeweiligen Raster. */
export function aviationChannelCount(spacingHz: number): number {
  return Math.round((VHF_COM_MAX_HZ - VHF_COM_MIN_HZ) / spacingHz);
}

// ============================================================================
// Frequenzbereiche des Flugfunk- und Flugnavigationsdienstes
// ============================================================================

/** Gruppierung der Bereiche für Filter und Tabellen. */
export type AviationBandGroup = 'sprechfunk' | 'navigation' | 'ueberwachung' | 'daten' | 'notfunk';

/** Anzeigetexte der Gruppen. */
export const AVIATION_GROUP_LABELS: Record<AviationBandGroup, string> = {
  sprechfunk: 'Sprechfunk',
  navigation: 'Funknavigation',
  ueberwachung: 'Überwachung und Radar',
  daten: 'Datenverbindungen',
  notfunk: 'Not- und Peilfunk'
};

/** Ein Frequenzbereich des Flugfunks. */
export interface AviationBand {
  id: string;
  nameDE: string;
  minHz: number;
  maxHz: number;
  group: AviationBandGroup;
  /** Betriebsart oder Modulation. */
  modeDE: string;
  /** Kanalraster in Hz, 0 falls keines festgelegt ist. */
  rasterHz: number;
  descriptionDE: string;
}

export const AVIATION_BANDS: AviationBand[] = [
  {
    id: 'ndb',
    nameDE: 'NDB — ungerichtetes Funkfeuer',
    minHz: 190_000,
    maxHz: 1_750_000,
    group: 'navigation',
    modeDE: 'Träger mit Kennungstastung (N0N A2A), Peilung im Bordgerät ADF',
    rasterHz: 1000,
    descriptionDE:
      'Die älteste Funknavigationshilfe: Das Bordgerät peilt die Richtung zur Bake und zeigt sie relativ zur Flugzeuglängsachse an. Reichweite und Genauigkeit hängen stark von Tageszeit, Gewittern und Küstenlinien ab.'
  },
  {
    id: 'marker',
    nameDE: 'Markierungsfunkfeuer',
    minHz: 74_800_000,
    maxHz: 75_200_000,
    group: 'navigation',
    modeDE: 'Amplitudenmodulierter Träger mit Tonkennung, senkrecht abstrahlend',
    rasterHz: 0,
    descriptionDE:
      'Alle Markierungsbaken senden auf 75 MHz und strahlen nach oben. Weil sie nur beim Überflug empfangen werden, genügt eine einzige Frequenz; unterschieden wird über den Modulationston.'
  },
  {
    id: 'vor',
    nameDE: 'VOR — UKW-Drehfunkfeuer',
    minHz: 108_000_000,
    maxHz: 117_975_000,
    group: 'navigation',
    modeDE: 'Amplitudenmodulierter Referenz- und Drehanteil, Phasenvergleich',
    rasterHz: 50_000,
    descriptionDE:
      'Das Drehfunkfeuer sendet ein rundum gleiches Referenzsignal und ein umlaufendes Signal. Aus der Phasendifferenz beider Signale ergibt sich die Richtung vom Sender aus — die Radiale. Zwischen 108 und 112 MHz teilt sich VOR den Bereich mit dem Landekurssender.'
  },
  {
    id: 'ils-loc',
    nameDE: 'ILS-Landekurssender (Localizer)',
    minHz: 108_100_000,
    maxHz: 111_975_000,
    group: 'navigation',
    modeDE: 'Zwei überlagerte Modulationstöne 90 Hz und 150 Hz, Differenzauswertung',
    rasterHz: 50_000,
    descriptionDE:
      'Der Landekurssender liegt am Ende der Bahn und spannt die Ebene der Anfluggrundlinie auf. Links überwiegt der 90-Hz-Ton, rechts der 150-Hz-Ton; im Kurs sind beide gleich stark. Belegt werden nur die ungeraden Zehntel-MHz.'
  },
  {
    id: 'ils-gs',
    nameDE: 'ILS-Gleitwegsender (Glide Path)',
    minHz: 328_600_000,
    maxHz: 335_400_000,
    group: 'navigation',
    modeDE: 'Dasselbe 90/150-Hz-Verfahren, jedoch in der Höhe',
    rasterHz: 150_000,
    descriptionDE:
      'Der Gleitwegsender steht seitlich der Aufsetzzone und legt den Anflugwinkel fest, üblicherweise 3°. Jede Landekursfrequenz ist fest mit einer Gleitwegfrequenz gepaart, sodass der Pilot nur eine Frequenz einstellt.'
  },
  {
    id: 'vhf-com',
    nameDE: 'VHF-Sprechfunk',
    minHz: VHF_COM_MIN_HZ,
    maxHz: VHF_COM_MAX_HZ,
    group: 'sprechfunk',
    modeDE: 'Amplitudenmodulation mit Doppelseitenband (A3E)',
    rasterHz: VHF_SPACING_25_HZ,
    descriptionDE:
      'Der Arbeitsbereich zwischen Lotse und Cockpit. Amplitudenmodulation ist Absicht: Sprechen zwei Stationen gleichzeitig, hört man beide überlagert — bei Frequenzmodulation würde die stärkere die schwächere vollständig verdrängen.'
  },
  {
    id: 'uhf-com',
    nameDE: 'UHF-Sprechfunk (militärisch)',
    minHz: 225_000_000,
    maxHz: 399_975_000,
    group: 'sprechfunk',
    modeDE: 'Amplitudenmodulation, 25-kHz-Raster',
    rasterHz: VHF_SPACING_25_HZ,
    descriptionDE:
      'Militärischer Flugfunk mit gleicher Betriebsart wie der zivile Bereich. Die Notfrequenz 243 MHz liegt genau bei der doppelten zivilen Notfrequenz.'
  },
  {
    id: 'dme',
    nameDE: 'DME — Entfernungsmessgerät',
    minHz: 962_000_000,
    maxHz: 1_213_000_000,
    group: 'navigation',
    modeDE: 'Impulspaare, Laufzeitmessung zwischen Abfrage und Antwort',
    rasterHz: 1_000_000,
    descriptionDE:
      'Das Bordgerät fragt mit Impulspaaren an, die Bodenstation antwortet nach einer festen Verzögerung. Aus der Laufzeit folgt die Schrägentfernung. Abfrage und Antwort liegen 63 MHz auseinander; die Kanalwahl erfolgt über die zugeordnete VOR- oder ILS-Frequenz.'
  },
  {
    id: 'ssr',
    nameDE: 'Sekundärradar SSR',
    minHz: 1_030_000_000,
    maxHz: 1_090_000_000,
    group: 'ueberwachung',
    modeDE: 'Abfrage 1030 MHz, Antwort 1090 MHz; Modus A/C und Modus S',
    rasterHz: 0,
    descriptionDE:
      'Das Sekundärradar misst nicht das Echo, sondern fragt den Transponder im Luftfahrzeug ab. Die Antwort enthält Kennung und Flughöhe. Modus S adressiert jedes Luftfahrzeug einzeln über eine weltweit eindeutige 24-Bit-Adresse.'
  },
  {
    id: 'adsb',
    nameDE: 'ADS-B über 1090 MHz',
    minHz: 1_090_000_000,
    maxHz: 1_090_000_000,
    group: 'ueberwachung',
    modeDE: 'Extended Squitter, Pulspositionsmodulation, 1 Mbit/s',
    rasterHz: 0,
    descriptionDE:
      'Das Luftfahrzeug sendet unaufgefordert Position, Höhe, Geschwindigkeit und Kennung aus der eigenen Navigationsanlage. Jeder Empfänger in Reichweite kann mithören — das ist die Grundlage der öffentlichen Flugverfolgung.'
  },
  {
    id: 'acars',
    nameDE: 'ACARS über VHF',
    minHz: 129_000_000,
    maxHz: 136_975_000,
    group: 'daten',
    modeDE: 'Minimum-Shift-Keying auf einem AM-Träger, 2400 bit/s',
    rasterHz: VHF_SPACING_25_HZ,
    descriptionDE:
      'Kurze Textnachrichten zwischen Cockpit und Betrieb: Abflugzeiten, Wetter, Störungsmeldungen. In Europa arbeitet der Hauptkanal auf 131,725 MHz, weltweit dient 131,550 MHz als Grundkanal.'
  },
  {
    id: 'hf-com',
    nameDE: 'HF-Flugfunk',
    minHz: 2_850_000,
    maxHz: 22_000_000,
    group: 'sprechfunk',
    modeDE: 'Einseitenband, oberes Seitenband (J3E), 3-kHz-Kanäle',
    rasterHz: 3000,
    descriptionDE:
      'Über Ozeanen und Polargebieten gibt es keine VHF-Abdeckung. Der Kurzwellenverkehr läuft in mehreren Bandsegmenten zwischen 2,85 und 22 MHz; die nutzbare Frequenz wechselt mit Tageszeit und Sonnenaktivität.'
  },
  {
    id: 'satcom',
    nameDE: 'Satcom im L-Band',
    minHz: 1_525_000_000,
    maxHz: 1_660_500_000,
    group: 'daten',
    modeDE: 'Digitale Sprach- und Datenkanäle über geostationäre und umlaufende Satelliten',
    rasterHz: 0,
    descriptionDE:
      'Sprech- und Datenverbindungen über Satellit ersetzen die Kurzwelle zunehmend. Der Abwärtsweg liegt bei 1525 bis 1559 MHz, der Aufwärtsweg bei 1626,5 bis 1660,5 MHz.'
  },
  {
    id: 'radhoehe',
    nameDE: 'Funkhöhenmesser',
    minHz: 4_200_000_000,
    maxHz: 4_400_000_000,
    group: 'navigation',
    modeDE: 'Frequenzmoduliertes Dauerstrichverfahren (FMCW)',
    rasterHz: 0,
    descriptionDE:
      'Der Funkhöhenmesser misst die tatsächliche Höhe über Grund und ist damit für die letzten Meter der Landung unentbehrlich. Die Nachbarschaft zu Mobilfunkbändern im C-Band wird deshalb aufmerksam beobachtet.'
  },
  {
    id: 'elt',
    nameDE: 'Notfunkbake ELT',
    minHz: 406_000_000,
    maxHz: 406_100_000,
    group: 'notfunk',
    modeDE: 'Digital kodierte Kurzaussendungen an das System Cospas-Sarsat',
    rasterHz: 0,
    descriptionDE:
      'Die Notfunkbake sendet eine kodierte Kennung an Satelliten. Zur Feinpeilung durch die Rettungsmannschaft läuft parallel ein schwaches Signal auf 121,5 MHz.'
  }
];

/** Bereiche einer Gruppe; `alle` liefert die vollständige Liste. */
export function aviationBandsByGroup(group: AviationBandGroup | 'alle'): AviationBand[] {
  if (group === 'alle') return AVIATION_BANDS;
  return AVIATION_BANDS.filter((band) => band.group === group);
}

// ============================================================================
// HF-Bandsegmente des Flugfunkdienstes (VO Funk Appendix 27)
// ============================================================================

/** Ein zusammenhängendes Segment des HF-Flugfunks in Hz. */
export interface AviationHfSegment {
  minHz: number;
  maxHz: number;
  /** Übliche Bandbezeichnung im Betrieb, z. B. „8-MHz-Band". */
  labelDE: string;
}

/**
 * Segmente des beweglichen Flugfunkdienstes auf Kurzwelle, Route-Bereich (R).
 * Die tatsächlich genutzten Familien wechseln mit der Tageszeit.
 */
export const AVIATION_HF_SEGMENTS: AviationHfSegment[] = [
  { minHz: 2_850_000, maxHz: 3_155_000, labelDE: '3-MHz-Band' },
  { minHz: 3_400_000, maxHz: 3_500_000, labelDE: '3,4-MHz-Band' },
  { minHz: 4_650_000, maxHz: 4_700_000, labelDE: '4-MHz-Band' },
  { minHz: 5_450_000, maxHz: 5_680_000, labelDE: '5-MHz-Band' },
  { minHz: 6_525_000, maxHz: 6_685_000, labelDE: '6-MHz-Band' },
  { minHz: 8_815_000, maxHz: 8_965_000, labelDE: '8-MHz-Band' },
  { minHz: 10_005_000, maxHz: 10_100_000, labelDE: '10-MHz-Band' },
  { minHz: 11_175_000, maxHz: 11_275_000, labelDE: '11-MHz-Band' },
  { minHz: 13_260_000, maxHz: 13_360_000, labelDE: '13-MHz-Band' },
  { minHz: 17_900_000, maxHz: 17_970_000, labelDE: '17-MHz-Band' },
  { minHz: 21_924_000, maxHz: 22_000_000, labelDE: '21-MHz-Band' }
];
