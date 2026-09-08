/**
 * Satellitenfunk: Bahnklassen, Frequenzbänder der Erde-Weltraum-Strecke und
 * die wichtigsten Systeme mit ihren Kennwerten.
 *
 * Quellen:
 * - ITU Radio Regulations, Artikel 5 (Zuweisungen an die Satellitenfunkdienste)
 *   und Artikel 22 (Betriebsbestimmungen für Raumfunkstellen)
 * - IEEE Std 521-2019 (Bandbuchstaben L bis W)
 * - ITU-R P.618-13 (Ausbreitung auf der Erde-Weltraum-Strecke),
 *   ITU-R P.838-3 (Regendämpfung), ITU-R P.840-8 (Wolken und Nebel)
 * - ETSI EN 300 421 / EN 302 307 (DVB-S und DVB-S2)
 * - Inmarsat, Iridium und SpaceX: öffentliche Systembeschreibungen und
 *   FCC-/ITU-Anmeldungen
 * - AMSAT-DL: QO-100 (Es'hail-2) Transponderplan
 * - NOAA/NESDIS: APT-Aussendungen der POES-Satelliten
 *
 * WARNUNG: Lern- und Nachschlagehilfe. Bahnhöhen und Frequenzen sind
 * Nennwerte; für den Betrieb gelten die Angaben der Betreiber.
 *
 * Alle Frequenzen in Hz, Höhen in m.
 */

// ============================================================================
// Bahnklassen
// ============================================================================

/** Kennung einer Bahnklasse. */
export type OrbitClass = 'leo' | 'meo' | 'geo' | 'heo';

/** Beschreibung einer Bahnklasse. */
export interface OrbitClassInfo {
  id: OrbitClass;
  nameDE: string;
  /** Typische Höhe über der Erdoberfläche in m (untere Grenze). */
  minAltitudeM: number;
  /** Typische Höhe über der Erdoberfläche in m (obere Grenze). */
  maxAltitudeM: number;
  /** Kennzeichnende Höhe für Rechenbeispiele in m. */
  referenceAltitudeM: number;
  descriptionDE: string;
  /** Was diese Bahn für den Funkbetrieb bedeutet. */
  consequenceDE: string;
}

/** Bahnhöhe der geostationären Bahn in m (Nennwert). */
export const GEO_ALTITUDE_M = 35_786_000;

/** Typische Bahnhöhe der Internationalen Raumstation in m. */
export const ISS_ALTITUDE_M = 420_000;

/** Bahnhöhe der GPS-Satelliten in m. */
export const GPS_ALTITUDE_M = 20_180_000;

/** Typische Bahnhöhe der Starlink-Schale in m. */
export const STARLINK_ALTITUDE_M = 550_000;

/** Bahnhöhe der Iridium-Satelliten in m. */
export const IRIDIUM_ALTITUDE_M = 780_000;

export const ORBIT_CLASSES: OrbitClassInfo[] = [
  {
    id: 'leo',
    nameDE: 'Niedrige Erdumlaufbahn (LEO)',
    minAltitudeM: 160_000,
    maxAltitudeM: 2_000_000,
    referenceAltitudeM: ISS_ALTITUDE_M,
    descriptionDE:
      'Umlaufzeit rund 90 bis 120 Minuten. Ein einzelner Satellit ist von einem festen Punkt aus nur wenige Minuten sichtbar, deshalb braucht ein durchgehender Dienst hier viele Satelliten.',
    consequenceDE:
      'Kurze Wege, geringe Laufzeit und wenig Freiraumdämpfung — dafür starke Dopplerverschiebung und ständiger Wechsel des Satelliten.'
  },
  {
    id: 'meo',
    nameDE: 'Mittlere Erdumlaufbahn (MEO)',
    minAltitudeM: 2_000_000,
    maxAltitudeM: 35_000_000,
    referenceAltitudeM: GPS_ALTITUDE_M,
    descriptionDE:
      'Klassische Bahn der Navigationssysteme. GPS umläuft die Erde in etwa zwölf Stunden, sodass sich die Bodenspur täglich wiederholt.',
    consequenceDE:
      'Große Ausleuchtzone bei noch erträglicher Laufzeit; wenige Dutzend Satelliten genügen für weltweite Abdeckung.'
  },
  {
    id: 'geo',
    nameDE: 'Geostationäre Bahn (GEO)',
    minAltitudeM: GEO_ALTITUDE_M,
    maxAltitudeM: GEO_ALTITUDE_M,
    referenceAltitudeM: GEO_ALTITUDE_M,
    descriptionDE:
      'Kreisbahn über dem Äquator mit einer Umlaufzeit von einem siderischen Tag. Der Satellit steht von der Erde aus gesehen still — die Empfangsantenne wird einmal ausgerichtet und bleibt es.',
    consequenceDE:
      'Ein Satellit deckt fast ein Drittel der Erdoberfläche ab, aber die Signallaufzeit hin und zurück beträgt rund eine Viertelsekunde. Oberhalb von etwa 76° Breite steht er unter dem Horizont.'
  },
  {
    id: 'heo',
    nameDE: 'Stark elliptische Bahn (HEO)',
    minAltitudeM: 500_000,
    maxAltitudeM: 40_000_000,
    referenceAltitudeM: 39_000_000,
    descriptionDE:
      'Eine langgestreckte Ellipse mit erdfernem Punkt über hohen Breiten. Der Satellit verweilt dort den größten Teil seines Umlaufs, weil er sich im Apogäum am langsamsten bewegt.',
    consequenceDE:
      'Der einzige Weg, Skandinavien, Russland und die Polargebiete mit wenigen Satelliten unter hohem Elevationswinkel zu versorgen.'
  }
];

// ============================================================================
// Frequenzbänder der Erde-Weltraum-Strecke
// ============================================================================

/**
 * Ein Bandbuchstabe mit den typischen Auf- und Abwärtsstrecken.
 *
 * In den Bändern der festen und mobilen Satellitendienste liegt die
 * Aufwärtsstrecke (Erde → Weltraum) höher als die Abwärtsstrecke. Der Grund
 * ist praktisch: Der Satellit hat wenig Leistung und soll auf der niedrigeren,
 * schwächer gedämpften Frequenz senden, während die Erdfunkstelle mit großer
 * Antenne und viel Leistung den schwierigeren Aufwärtsweg trägt. Das S-Band
 * der Raumfahrt-Telemetrie kehrt die Lage um; `uplinkAbove` hält das fest.
 */
export interface SatelliteBand {
  id: string;
  letter: string;
  nameDE: string;
  /** Aufwärtsstrecke Erde → Weltraum in Hz. */
  uplinkMinHz: number;
  uplinkMaxHz: number;
  /** Abwärtsstrecke Weltraum → Erde in Hz. */
  downlinkMinHz: number;
  downlinkMaxHz: number;
  usageDE: string;
  /** Verhalten bei Regen und Feuchte. */
  rainDE: string;
  /**
   * Liegt die Aufwärtsstrecke über der Abwärtsstrecke? Das ist die Regel;
   * das S-Band der Raumfahrt-Telemetrie ist die dokumentierte Ausnahme.
   */
  uplinkAbove: boolean;
  /** Erläuterung, falls das Band von der Regel abweicht. */
  noteDE?: string;
}

export const SATELLITE_BANDS: SatelliteBand[] = [
  {
    id: 'l',
    letter: 'L',
    nameDE: 'L-Band',
    uplinkMinHz: 1_626_500_000,
    uplinkMaxHz: 1_660_500_000,
    downlinkMinHz: 1_525_000_000,
    downlinkMaxHz: 1_559_000_000,
    usageDE: 'Mobile Satellitendienste, Seefunk und Flugfunk über Satellit, Navigation',
    rainDE: 'praktisch regenunempfindlich; kleine Rundstrahlantennen genügen',
    uplinkAbove: true
  },
  {
    id: 's',
    letter: 'S',
    nameDE: 'S-Band',
    uplinkMinHz: 2_025_000_000,
    uplinkMaxHz: 2_110_000_000,
    downlinkMinHz: 2_200_000_000,
    downlinkMaxHz: 2_290_000_000,
    usageDE:
      'Telemetrie und Steuerung von Raumfahrzeugen, Wettersatelliten, Rundfunk über Satellit',
    rainDE: 'nahezu regenunempfindlich',
    uplinkAbove: false,
    noteDE:
      'Ausnahme von der Regel: Im Bereich für Raumfahrt-Telemetrie und -Steuerung liegt die Aufwärtsstrecke (2025 bis 2110 MHz) unter der Abwärtsstrecke (2200 bis 2290 MHz).'
  },
  {
    id: 'c',
    letter: 'C',
    nameDE: 'C-Band',
    uplinkMinHz: 5_850_000_000,
    uplinkMaxHz: 6_425_000_000,
    downlinkMinHz: 3_625_000_000,
    downlinkMaxHz: 4_200_000_000,
    usageDE: 'Klassischer Fernsehzubringer und Weitverkehr, besonders in den Tropen',
    rainDE: 'geringe Regendämpfung — deshalb in Regionen mit starken Niederschlägen bevorzugt',
    uplinkAbove: true
  },
  {
    id: 'x',
    letter: 'X',
    nameDE: 'X-Band',
    uplinkMinHz: 7_900_000_000,
    uplinkMaxHz: 8_400_000_000,
    downlinkMinHz: 7_250_000_000,
    downlinkMaxHz: 7_750_000_000,
    usageDE: 'Behördliche und militärische Verbindungen, Erdbeobachtung',
    rainDE: 'mäßige Regendämpfung',
    uplinkAbove: true
  },
  {
    id: 'ku',
    letter: 'Ku',
    nameDE: 'Ku-Band',
    uplinkMinHz: 14_000_000_000,
    uplinkMaxHz: 14_500_000_000,
    downlinkMinHz: 10_700_000_000,
    downlinkMaxHz: 12_750_000_000,
    usageDE: 'Fernsehen über Satellit (DVB-S/S2), VSAT-Netze, Breitband an Bord',
    rainDE: 'deutlich regenempfindlich; starker Regen kostet mehrere Dezibel',
    uplinkAbove: true
  },
  {
    id: 'ka',
    letter: 'Ka',
    nameDE: 'Ka-Band',
    uplinkMinHz: 27_500_000_000,
    uplinkMaxHz: 30_000_000_000,
    downlinkMinHz: 17_700_000_000,
    downlinkMaxHz: 20_200_000_000,
    usageDE: 'Breitband mit vielen engen Spotbeams, moderne Konstellationen',
    rainDE:
      'stark regenempfindlich; Verbindungen brauchen eine Leistungsreserve und adaptive Codierung',
    uplinkAbove: true
  }
];

// ============================================================================
// Systeme
// ============================================================================

/** Einsatzgebiet eines Satellitensystems. */
export type SatelliteCategory =
  'kommunikation' | 'navigation' | 'rundfunk' | 'wetter' | 'amateur' | 'notruf';

/** Anzeigetexte der Einsatzgebiete. */
export const SATELLITE_CATEGORY_LABELS: Record<SatelliteCategory, string> = {
  kommunikation: 'Kommunikation',
  navigation: 'Navigation',
  rundfunk: 'Rundfunk',
  wetter: 'Wetter und Erdbeobachtung',
  amateur: 'Amateurfunk',
  notruf: 'Not- und Sicherheitsfunk'
};

/** Ein Satellitensystem mit den für den Funkbetrieb wesentlichen Kennwerten. */
export interface SatelliteSystem {
  id: string;
  nameDE: string;
  category: SatelliteCategory;
  orbit: OrbitClass;
  /** Bahnhöhe in m; bei GEO die Nennhöhe. */
  altitudeM: number;
  /** Zahl der Satelliten im Regelbetrieb; `null`, wenn stark veränderlich. */
  satelliteCount: number | null;
  /** Genutzte Bänder als Buchstaben, z. B. „Ku, Ka". */
  bandsDE: string;
  descriptionDE: string;
}

export const SATELLITE_SYSTEMS: SatelliteSystem[] = [
  {
    id: 'inmarsat',
    nameDE: 'Inmarsat',
    category: 'kommunikation',
    orbit: 'geo',
    altitudeM: GEO_ALTITUDE_M,
    satelliteCount: null,
    bandsDE: 'L-Band (mobil), Ka-Band (Breitband)',
    descriptionDE:
      'Aus dem Seefunk entstanden und bis heute tragende Säule des GMDSS im Seegebiet A3. Die Notruftaste einer Schiffs-Erdfunkstelle erreicht über Inmarsat unmittelbar eine Rettungsleitstelle.'
  },
  {
    id: 'iridium',
    nameDE: 'Iridium',
    category: 'kommunikation',
    orbit: 'leo',
    altitudeM: IRIDIUM_ALTITUDE_M,
    satelliteCount: 66,
    bandsDE: 'L-Band zum Endgerät, Ka-Band zum Boden und zwischen den Satelliten',
    descriptionDE:
      'Sechs polare Bahnebenen mit je elf Satelliten decken die gesamte Erde ab, auch die Pole. Die Satelliten reichen Verbindungen untereinander weiter, sodass nur wenige Bodenstationen nötig sind. Seit 2020 auch für das GMDSS anerkannt.'
  },
  {
    id: 'starlink',
    nameDE: 'Starlink',
    category: 'kommunikation',
    orbit: 'leo',
    altitudeM: STARLINK_ALTITUDE_M,
    satelliteCount: null,
    bandsDE: 'Ku-Band zum Endgerät, Ka-Band zu den Bodenstationen, E-Band im Ausbau',
    descriptionDE:
      'Tausende Satelliten in niedriger Bahn liefern Latenzen im Bereich einiger Dutzend Millisekunden. Die Nutzerantenne ist eine elektronisch schwenkbare Gruppenantenne, die dem jeweils günstigsten Satelliten folgt.'
  },
  {
    id: 'gnss',
    nameDE: 'GNSS (GPS, Galileo, GLONASS, BeiDou)',
    category: 'navigation',
    orbit: 'meo',
    altitudeM: GPS_ALTITUDE_M,
    satelliteCount: null,
    bandsDE: 'L-Band um 1176, 1227 und 1575 MHz',
    descriptionDE:
      'Die Satelliten senden hochgenaue Zeitzeichen. Der Empfänger misst die Laufzeitunterschiede von mindestens vier Satelliten und löst daraus Ort und Uhrzeit — er sendet selbst nichts.'
  },
  {
    id: 'dvbs',
    nameDE: 'Fernsehen über Satellit (DVB-S2)',
    category: 'rundfunk',
    orbit: 'geo',
    altitudeM: GEO_ALTITUDE_M,
    satelliteCount: null,
    bandsDE: 'Ku-Band, Abwärtsstrecke 10,7 bis 12,75 GHz',
    descriptionDE:
      'Ein Transponder überträgt einen Multiplex aus mehreren Programmen. Die beiden Polarisationsebenen werden doppelt belegt, sodass sich die nutzbare Bandbreite verdoppelt; der Universal-LNB setzt das Ku-Band auf 950 bis 2150 MHz um.'
  },
  {
    id: 'noaa-apt',
    nameDE: 'NOAA-Wettersatelliten (APT)',
    category: 'wetter',
    orbit: 'leo',
    altitudeM: 850_000,
    satelliteCount: null,
    bandsDE: 'VHF um 137 MHz',
    descriptionDE:
      'Die polumlaufenden NOAA-Satelliten senden ihre Bilder unverschlüsselt und analog moduliert. Eine einfache Rundstrahlantenne mit zirkularer Polarisation und ein SDR-Empfänger genügen, um beim Überflug ein Wolkenbild aufzuzeichnen.'
  },
  {
    id: 'meteor',
    nameDE: 'Meteor-M (LRPT)',
    category: 'wetter',
    orbit: 'leo',
    altitudeM: 820_000,
    satelliteCount: null,
    bandsDE: 'VHF um 137 MHz, digital',
    descriptionDE:
      'Der digitale Nachfolger des analogen Bildfunks: gleiche Frequenzlage, aber ein QPSK-moduliertes Signal mit deutlich besserer Bildqualität.'
  },
  {
    id: 'qo100',
    nameDE: 'QO-100 (Es’hail-2)',
    category: 'amateur',
    orbit: 'geo',
    altitudeM: GEO_ALTITUDE_M,
    satelliteCount: 1,
    bandsDE: 'Aufwärts 2400 MHz (13 cm), abwärts 10 489 MHz (3 cm)',
    descriptionDE:
      'Der erste geostationäre Amateurfunk-Transponder. Weil der Satellit stillsteht, ist die Verbindung rund um die Uhr verfügbar — von Brasilien bis Thailand, ohne Nachführung und ohne Doppler.'
  },
  {
    id: 'iss',
    nameDE: 'Internationale Raumstation',
    category: 'amateur',
    orbit: 'leo',
    altitudeM: ISS_ALTITUDE_M,
    satelliteCount: 1,
    bandsDE: 'VHF 145 MHz und UHF 437 MHz für den Amateurfunkbetrieb',
    descriptionDE:
      'Ein Umlauf dauert rund 93 Minuten, ein Überflug ist wenige Minuten lang. Der Amateurfunkdienst an Bord betreibt Sprechfunk, Digipeater und Schulkontakte; die Dopplerverschiebung von einigen Kilohertz muss nachgeführt werden.'
  },
  {
    id: 'cospas',
    nameDE: 'Cospas-Sarsat',
    category: 'notruf',
    orbit: 'meo',
    altitudeM: GPS_ALTITUDE_M,
    satelliteCount: null,
    bandsDE: 'Empfang der Baken auf 406 MHz',
    descriptionDE:
      'Ein Verbund aus Nutzlasten auf niedrigen, mittleren und geostationären Bahnen. Die MEO-Nutzlasten auf den Navigationssatelliten orten eine Bake heute binnen Minuten, während die frühere Ortung über die Dopplerverschiebung einen Überflug abwarten musste.'
  }
];

/** Systeme einer Kategorie; `alle` liefert die vollständige Liste. */
export function satelliteSystemsByCategory(
  category: SatelliteCategory | 'alle'
): SatelliteSystem[] {
  if (category === 'alle') return SATELLITE_SYSTEMS;
  return SATELLITE_SYSTEMS.filter((system) => system.category === category);
}

/** Bahnklasse nachschlagen. */
export function orbitClassInfo(id: OrbitClass): OrbitClassInfo | undefined {
  return ORBIT_CLASSES.find((entry) => entry.id === id);
}
