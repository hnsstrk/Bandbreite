/**
 * Rechenlogik des Bandplan-Visualisierers.
 *
 * Die Segmente eines Amateurfunkbandes werden innerhalb des Bandes linear
 * aufgetragen — ein Band ist relativ schmal, eine logarithmische Achse würde
 * die Segmente nur verzerren. Zwischen den Bändern sorgt die Wellenlänge für
 * die Einordnung.
 */

import {
  AMATEUR_BANDS,
  POWER_CLASS_A_W,
  POWER_CLASS_E_W,
  POWER_CLASS_N_EIRP_W,
  type AmateurBand,
  type AmateurBandSegment,
  type BandSegmentMode,
  type LicenseClassDE,
  type PowerLimitType
} from '$lib/data/amateurBands';
import { formatFrequencyRange } from '$lib/data/bands';
import { frequencyToWavelength } from '$lib/utils/calculations';
import { formatLocaleNumber } from '$lib/utils/formatting';
import { clamp, safeDivide } from '$lib/utils/handlers';

/** Anzeigetexte der Betriebsartengruppen. */
export const MODE_LABELS: Record<BandSegmentMode, string> = {
  cw: 'Telegrafie (CW)',
  'digital-schmal': 'Digital schmalbandig',
  'digital-breit': 'Digital breitbandig',
  bake: 'Baken',
  ssb: 'Einseitenband (SSB)',
  allmode: 'Alle Betriebsarten',
  fm: 'FM und Relais',
  satellit: 'Satellit',
  atv: 'Amateurfernsehen'
};

/** Anzeigetexte der Zeugnisklassen. */
export const CLASS_LABELS: Record<LicenseClassDE, string> = {
  A: 'Klasse A',
  E: 'Klasse E',
  N: 'Klasse N'
};

/** Anzeigetexte des Zuweisungsstatus eines Bandes. */
export const BAND_STATUS_LABELS: Record<AmateurBand['status'], string> = {
  primaer: 'primär',
  sekundaer: 'sekundär',
  gemischt: 'teils primär, teils sekundär',
  duldung: 'befristete Allgemeinzuteilung'
};

/**
 * Regelleistung je Klasse in Watt als Überblickswert. Maßgeblich ist immer die
 * bandbezogene Grenze aus `powerLimits`; die Klasse E darf beispielsweise auf
 * 2 m nur 75 W und ab 13 cm nur 5 W.
 */
export const CLASS_POWER_W: Record<LicenseClassDE, number> = {
  A: POWER_CLASS_A_W,
  E: POWER_CLASS_E_W,
  N: POWER_CLASS_N_EIRP_W
};

/** Bezugsgröße der Leistungsangabe als Kurztext. */
export function powerUnitLabel(type: PowerLimitType): string {
  if (type === 'eirp') return 'W EIRP';
  if (type === 'erp') return 'W ERP';
  return 'W PEP';
}

/**
 * Höchstzulässige Leistung eines Bandes für eine Klasse nach AFuV Anlage 1.
 * Die Werte stehen je Band und Klasse im Datensatz; es wird nichts abgeleitet.
 * Bänder, die der Klasse nicht offenstehen, geben `null` zurück.
 */
export function powerLimitFor(
  band: AmateurBand,
  licenseClass: LicenseClassDE
): { value: number; unit: string } | null {
  const limit = band.powerLimits[licenseClass];
  if (!limit) return null;
  return { value: limit.watt, unit: powerUnitLabel(limit.type) };
}

/** Nachkommastellen der Leistungsanzeige (6,1 W ERP, 9,14 W ERP). */
const POWER_DECIMALS = 2;

/**
 * Abweichende Leistungsgrenzen eines Bandes für eine Klasse, aufbereitet als
 * Text. Leeres Array, wenn das Band keine Teilbereiche kennt.
 */
export function powerSubrangeTexts(
  band: AmateurBand,
  licenseClass: LicenseClassDE
): string[] {
  return (band.powerSubranges ?? []).flatMap((range) => {
    const limit = range.limits[licenseClass];
    if (!limit) return [];
    return [
      `${formatFrequencyRange(range.minHz, range.maxHz)}: ` +
        `${formatLocaleNumber(limit.watt, { maxFrac: POWER_DECIMALS })} ` +
        `${powerUnitLabel(limit.type)} — ${range.noteDE}`
    ];
  });
}

/** Bänder, die einer Klasse offenstehen (`'alle'` liefert alle Bänder). */
export function bandsForClass(
  licenseClass: LicenseClassDE | 'alle',
  bands: AmateurBand[] = AMATEUR_BANDS
): AmateurBand[] {
  return licenseClass === 'alle'
    ? [...bands]
    : bands.filter((band) => band.licenseClasses.includes(licenseClass));
}

/** Ein Segment mit Position und Breite in Prozent der Bandbreite. */
export interface PlacedSegment {
  segment: AmateurBandSegment;
  leftPercent: number;
  widthPercent: number;
  modeLabel: string;
}

/** Segmente eines Bandes mit linearer Geometrie innerhalb der Bandgrenzen. */
export function placeSegments(band: AmateurBand, minWidthPercent = 1.5): PlacedSegment[] {
  const span = band.maxHz - band.minHz;
  return band.segments.map((segment) => {
    const left = clamp(safeDivide(segment.minHz - band.minHz, span, 0) * 100, 0, 100);
    const raw = safeDivide(segment.maxHz - segment.minHz, span, 0) * 100;
    return {
      segment,
      leftPercent: left,
      widthPercent: clamp(Math.max(raw, minWidthPercent), 0, 100 - left),
      modeLabel: MODE_LABELS[segment.mode]
    };
  });
}

/** Bandmitte in Hz. */
export function bandCenterHz(band: AmateurBand): number {
  return (band.minHz + band.maxHz) / 2;
}

/** Wellenlänge zur Bandmitte in Metern. */
export function bandWavelengthM(band: AmateurBand): number {
  return frequencyToWavelength(bandCenterHz(band));
}

/** Bandbreite des Bandes in Hz. */
export function bandWidthHz(band: AmateurBand): number {
  return band.maxHz - band.minHz;
}

/**
 * Grundregel zur Ausbreitung: Welche Tageszeit ist auf diesem Band typisch?
 * Bewusst als Faustregel formuliert — maßgeblich sind Sonnenstand,
 * Sonnenfleckenzahl und Jahreszeit.
 */
export function openingHint(band: AmateurBand): string {
  const center = bandCenterHz(band);
  if (center < 500e3) {
    return 'Nachts und im Winter am besten: tagsüber verschluckt die D-Schicht fast alles.';
  }
  if (center < 5e6) {
    return 'Nachtband. Tagsüber nur Nahverkehr über die Bodenwelle und die steile Raumwelle.';
  }
  if (center < 10e6) {
    return 'Nachts weite Strecken, tagsüber sichere Verbindungen bis einige hundert Kilometer.';
  }
  if (center < 20e6) {
    return 'Tagband mit langer Öffnung; bei hoher Sonnenaktivität auch abends nutzbar.';
  }
  if (center < 30e6) {
    return 'Reines Tagband. Weltweite Öffnungen vor allem im Maximum des Sonnenfleckenzyklus.';
  }
  if (center < 60e6) {
    return 'Sporadisch: Es-Wolken im Frühsommer bringen Sprünge über 1000 bis 2000 km.';
  }
  if (center < 500e6) {
    return 'Im Alltag Sichtverbindung über Relais; Überreichweiten bei Inversionswetterlagen.';
  }
  return 'Quasioptische Ausbreitung. Freie Sicht, saubere Antennenanlage und kurze Kabel entscheiden.';
}
