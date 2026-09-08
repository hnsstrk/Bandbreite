/**
 * Umrechnung zwischen Kanalbezeichnung und Frequenz für DAB+, DVB-T2 und UKW.
 *
 * Die Kanaltabellen liegen in `data/broadcast.ts`; hier stehen nur die
 * Nachschlage- und Umkehrfunktionen sowie das UKW-Kanalraster, das sich
 * vollständig aus einer Rechenregel ergibt.
 */

import {
  DAB_BLOCKS,
  DAB_BLOCKS_DE,
  DAB_BLOCK_BANDWIDTH_HZ,
  DVBT2_CHANNELS,
  DVBT2_CHANNEL_BANDWIDTH_HZ,
  FM_CHANNEL_RASTER_HZ,
  getDabBlockRange,
  getDvbT2ChannelRange
} from '$lib/data/broadcast';

/** Untere Grenze des UKW-Rundfunkbereichs (Band II) in Hz. */
export const FM_BAND_MIN_HZ = 87.5e6;

/** Obere Grenze des UKW-Rundfunkbereichs (Band II) in Hz. */
export const FM_BAND_MAX_HZ = 108e6;

/** Ergebnis einer Kanalabfrage. */
export interface ChannelRange {
  label: string;
  centerHz: number;
  minHz: number;
  maxHz: number;
  bandwidthHz: number;
  /** Nur bei DAB-Blöcken gesetzt: wird der Block in Deutschland genutzt? */
  usedInGermany?: boolean;
  /** Nur bei DAB-Blöcken gesetzt: Hinweis zu national nicht genutzten Blöcken */
  noteDE?: string;
}

/** DAB-Block nach Bezeichnung, z. B. „11C“. */
export function dabBlock(block: string): ChannelRange | undefined {
  const entry = DAB_BLOCKS.find((b) => b.block.toUpperCase() === block.trim().toUpperCase());
  if (!entry) return undefined;
  const range = getDabBlockRange(entry.block);
  if (!range) return undefined;
  return {
    label: entry.block,
    centerHz: entry.centerHz,
    minHz: range.minHz,
    maxHz: range.maxHz,
    bandwidthHz: DAB_BLOCK_BANDWIDTH_HZ,
    usedInGermany: entry.usedInGermany,
    noteDE: entry.noteDE
  };
}

/**
 * DAB-Block, der eine Frequenz enthält.
 *
 * Gesucht wird nur unter den in Deutschland genutzten Blöcken: Die
 * Zwischenblöcke 10N, 11N und 12N liegen in den Schutzabständen und
 * überlappen ihre Nachbarn, eine Zuordnung wäre sonst mehrdeutig.
 */
export function dabBlockForFrequency(frequencyHz: number): ChannelRange | undefined {
  if (!Number.isFinite(frequencyHz)) return undefined;
  const half = DAB_BLOCK_BANDWIDTH_HZ / 2;
  const entry = DAB_BLOCKS_DE.find(
    (b) => frequencyHz >= b.centerHz - half && frequencyHz <= b.centerHz + half
  );
  return entry ? dabBlock(entry.block) : undefined;
}

/** DVB-T2-Kanal nach Nummer (21 bis 48). */
export function dvbT2Channel(channel: number): ChannelRange | undefined {
  const entry = DVBT2_CHANNELS.find((c) => c.channel === channel);
  if (!entry) return undefined;
  const range = getDvbT2ChannelRange(entry.channel);
  if (!range) return undefined;
  return {
    label: `Kanal ${entry.channel}`,
    centerHz: entry.centerHz,
    minHz: range.minHz,
    maxHz: range.maxHz,
    bandwidthHz: DVBT2_CHANNEL_BANDWIDTH_HZ
  };
}

/** DVB-T2-Kanal, der eine Frequenz enthält. */
export function dvbT2ChannelForFrequency(frequencyHz: number): ChannelRange | undefined {
  if (!Number.isFinite(frequencyHz)) return undefined;
  const half = DVBT2_CHANNEL_BANDWIDTH_HZ / 2;
  const entry = DVBT2_CHANNELS.find(
    (c) => frequencyHz >= c.centerHz - half && frequencyHz <= c.centerHz + half
  );
  return entry ? dvbT2Channel(entry.channel) : undefined;
}

/** Anzahl der UKW-Rasterplätze zwischen 87,5 und 108,0 MHz. */
export const FM_CHANNEL_COUNT =
  Math.round((FM_BAND_MAX_HZ - FM_BAND_MIN_HZ) / FM_CHANNEL_RASTER_HZ) + 1;

/**
 * Frequenz eines UKW-Rasterplatzes.
 * Platz 1 liegt auf 87,5 MHz, jeder weitere 100 kHz höher.
 */
export function fmRasterFrequency(index: number): number | undefined {
  if (!Number.isInteger(index) || index < 1 || index > FM_CHANNEL_COUNT) return undefined;
  return FM_BAND_MIN_HZ + (index - 1) * FM_CHANNEL_RASTER_HZ;
}

/** Nächstgelegener UKW-Rasterplatz zu einer Frequenz. */
export function fmNearestRaster(
  frequencyHz: number
): { index: number; frequencyHz: number; offsetHz: number } | undefined {
  if (!Number.isFinite(frequencyHz)) return undefined;
  if (frequencyHz < FM_BAND_MIN_HZ - FM_CHANNEL_RASTER_HZ / 2) return undefined;
  if (frequencyHz > FM_BAND_MAX_HZ + FM_CHANNEL_RASTER_HZ / 2) return undefined;
  const index =
    Math.round((frequencyHz - FM_BAND_MIN_HZ) / FM_CHANNEL_RASTER_HZ) + 1;
  const clamped = Math.min(Math.max(index, 1), FM_CHANNEL_COUNT);
  const exact = fmRasterFrequency(clamped);
  if (exact === undefined) return undefined;
  return { index: clamped, frequencyHz: exact, offsetHz: frequencyHz - exact };
}

/** Liegt die Frequenz genau auf dem 100-kHz-Raster? */
export function isOnFmRaster(frequencyHz: number, toleranceHz = 1): boolean {
  const nearest = fmNearestRaster(frequencyHz);
  return nearest !== undefined && Math.abs(nearest.offsetHz) <= toleranceHz;
}
