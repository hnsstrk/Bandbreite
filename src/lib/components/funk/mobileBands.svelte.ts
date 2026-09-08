/**
 * Rechenlogik der Mobilfunk-Widgets: Bandfilter, Balkengeometrie für Uplink
 * und Downlink sowie die Abschätzung der Datenrate aus Bandbreite und
 * spektraler Effizienz.
 */

import { MOBILE_BANDS, type MobileBand } from '$lib/data/mobileNetworks';
import { safeDivide, clamp } from '$lib/utils/handlers';

/** Filterzustand der Bandtabelle. */
export interface BandFilter {
  /** Technologie als Teilzeichenkette, z. B. „LTE“, „5G NR“ oder „alle“. */
  technology: string;
  /** Duplexverfahren oder „alle“. */
  duplex: string;
}

/** Auswahlwerte des Technologiefilters, abgeleitet aus dem Datensatz. */
export function technologyOptions(bands: MobileBand[] = MOBILE_BANDS): string[] {
  const set = new Set<string>();
  for (const band of bands) for (const tech of band.technologiesDE) set.add(tech);
  return [...set].sort((a, b) => a.localeCompare(b, 'de'));
}

/** Bänder nach Technologie und Duplexverfahren filtern. */
export function filterBands(
  filter: BandFilter,
  bands: MobileBand[] = MOBILE_BANDS
): MobileBand[] {
  return bands.filter((band) => {
    const techOk =
      filter.technology === 'alle' || band.technologiesDE.includes(filter.technology);
    const duplexOk = filter.duplex === 'alle' || band.duplex === filter.duplex;
    return techOk && duplexOk;
  });
}

/** Gesamter belegter Bereich eines Bandes (Uplink und Downlink zusammen). */
export function bandSpan(band: MobileBand): { minHz: number; maxHz: number } {
  return {
    minHz: Math.min(band.uplinkMinHz, band.downlinkMinHz),
    maxHz: Math.max(band.uplinkMaxHz, band.downlinkMaxHz)
  };
}

/** Gepaarte Bandbreite je Richtung in Hz (bei TDD die gemeinsame Bandbreite). */
export function bandwidthHz(band: MobileBand): number {
  return band.duplex === 'TDD'
    ? band.downlinkMaxHz - band.downlinkMinHz
    : Math.min(
        band.uplinkMaxHz - band.uplinkMinHz,
        band.downlinkMaxHz - band.downlinkMinHz
      );
}

/** Balkengeometrie eines Teilbereichs relativ zum Gesamtbereich des Bandes. */
export function barGeometry(
  fromHz: number,
  toHz: number,
  span: { minHz: number; maxHz: number },
  minWidthPercent = 2
): { leftPercent: number; widthPercent: number } {
  const total = span.maxHz - span.minHz;
  const left = clamp(safeDivide(fromHz - span.minHz, total, 0) * 100, 0, 100);
  const raw = safeDivide(toHz - fromHz, total, 0) * 100;
  return {
    leftPercent: left,
    widthPercent: clamp(Math.max(raw, minWidthPercent), 0, 100 - left)
  };
}

/**
 * Theoretische Bruttodatenrate einer Funkstrecke.
 * R = B · η · N — Bandbreite mal spektraler Effizienz mal Anzahl der
 * räumlichen Schichten (MIMO-Ströme).
 */
export function dataRateBps(
  bandwidthInHz: number,
  efficiencyBpsPerHz: number,
  layers = 1
): number {
  if (
    !Number.isFinite(bandwidthInHz) ||
    !Number.isFinite(efficiencyBpsPerHz) ||
    bandwidthInHz <= 0 ||
    efficiencyBpsPerHz <= 0 ||
    layers < 1
  ) {
    return 0;
  }
  return bandwidthInHz * efficiencyBpsPerHz * Math.floor(layers);
}

/** Datenrate mit passender Einheit, z. B. „1,2 Gbit/s“. */
export function formatDataRate(bitsPerSecond: number, decimals = 1): string {
  if (!Number.isFinite(bitsPerSecond) || bitsPerSecond <= 0) return '—';
  const units = [
    { factor: 1e9, symbol: 'Gbit/s' },
    { factor: 1e6, symbol: 'Mbit/s' },
    { factor: 1e3, symbol: 'kbit/s' }
  ];
  const unit = units.find((candidate) => bitsPerSecond >= candidate.factor);
  if (!unit) return `${bitsPerSecond.toFixed(0)} bit/s`;
  const value = safeDivide(bitsPerSecond, unit.factor, 0);
  return `${value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })} ${unit.symbol}`;
}

/** Ein Voreinstellungspunkt für die spektrale Effizienz. */
export interface EfficiencyPreset {
  id: string;
  label: string;
  /** Bit pro Sekunde und Hertz je räumlicher Schicht. */
  value: number;
  hint: string;
}

/**
 * Praxisnahe Richtwerte der spektralen Effizienz.
 * Keine Normwerte: die tatsächlich erreichte Effizienz hängt von Modulation,
 * Kanalkodierung, Signal-Rausch-Verhältnis und Zellauslastung ab.
 */
export const EFFICIENCY_PRESETS: EfficiencyPreset[] = [
  { id: 'zellrand', label: 'Zellrand (QPSK)', value: 0.8, hint: 'schlechtes SNR, robuste Modulation' },
  { id: 'mittel', label: 'Mittlere Lage (16-QAM)', value: 2.5, hint: 'typischer Durchschnitt im Netz' },
  { id: 'gut', label: 'Gute Lage (64-QAM)', value: 4.5, hint: 'nahe der Basisstation' },
  { id: 'spitze', label: 'Spitzenwert (256-QAM)', value: 6.5, hint: 'Laborbedingungen, kaum Störer' }
];
