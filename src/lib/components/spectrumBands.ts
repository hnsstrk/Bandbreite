/**
 * Bandreihen des Spektrums: Datenquellen, Reihenreihenfolge, Rechteck- und
 * Farbberechnung — reine Funktionen ohne Zustand.
 */

import {
  IEEE_BANDS,
  NATO_BANDS,
  ITU_BANDS,
  CIVILIAN_BANDS,
  type FrequencyBand
} from '$lib/data/bands';
import { safeDivide } from '$lib/utils/handlers';
import { VISIBLE_LIGHT } from '$lib/data/spectrum';
import type { Domain } from './spectrumZoom';

// =============================================================================
// Types
// =============================================================================

export type RowKey = 'em' | 'itu' | 'ieee' | 'nato' | 'civilian';

export interface VisibleRows {
  em: boolean;
  itu: boolean;
  ieee: boolean;
  nato: boolean;
  civilian: boolean;
}

export interface BandRect extends FrequencyBand {
  x: number;
  width: number;
  visible: boolean;
}

export interface RowConfig {
  key: RowKey;
  label: string;
  bands: BandRect[];
}

// =============================================================================
// Layout constants
// =============================================================================

export const ROW_HEIGHT = 48;
export const MARGIN = { top: 60, right: 20, bottom: 60, left: 80 };
export const GAP = 8;

/** Reihenfolge der Bandreihen von oben nach unten. */
export const ROW_ORDER: readonly RowKey[] = ['em', 'itu', 'ieee', 'nato', 'civilian'];

export const ROW_LABELS: Record<RowKey, string> = {
  em: 'EM',
  itu: 'ITU',
  ieee: 'IEEE',
  nato: 'NATO',
  civilian: 'Zivil'
};

export const DEFAULT_VISIBLE_ROWS: VisibleRows = {
  em: true,
  itu: true,
  ieee: true,
  nato: true,
  civilian: false
};

// =============================================================================
// Extended EM Bands
// =============================================================================

export const VISIBLE_MIN_HZ = VISIBLE_LIGHT.minHz;
export const VISIBLE_MAX_HZ = VISIBLE_LIGHT.maxHz;

/**
 * Feingliedrige EM-Bänder der obersten Reihe (IR/UV/Röntgen dreigeteilt).
 * Die Farben bilden zugleich die Legende in `SpectrumLegend.svelte`.
 */
export const EXTENDED_EM_BANDS: FrequencyBand[] = [
  {
    id: 'em-radio',
    name: 'Radio',
    nameDE: 'Radiowellen',
    minHz: 3,
    maxHz: 300e9,
    color: '#3b82f6',
    category: 'em'
  },
  {
    id: 'em-microwave',
    name: 'Microwave',
    nameDE: 'Mikrowellen',
    minHz: 300e6,
    maxHz: 300e9,
    color: '#6366f1',
    category: 'em'
  },
  {
    id: 'em-infrared-far',
    name: 'Far-IR',
    nameDE: 'Fernes Infrarot',
    minHz: 300e9,
    maxHz: 30e12,
    color: '#991b1b',
    category: 'em'
  },
  {
    id: 'em-infrared-mid',
    name: 'Mid-IR',
    nameDE: 'Mittleres Infrarot',
    minHz: 30e12,
    maxHz: 120e12,
    color: '#b91c1c',
    category: 'em'
  },
  {
    id: 'em-infrared-near',
    name: 'Near-IR',
    nameDE: 'Nahes Infrarot',
    minHz: 120e12,
    maxHz: VISIBLE_MIN_HZ,
    color: '#dc2626',
    category: 'em'
  },
  {
    id: 'em-visible',
    name: 'Visible',
    nameDE: 'Sichtbares Licht',
    minHz: VISIBLE_MIN_HZ,
    maxHz: VISIBLE_MAX_HZ,
    color: 'visible',
    category: 'em'
  },
  {
    id: 'em-uv-near',
    name: 'UV-A',
    nameDE: 'UV-A',
    minHz: VISIBLE_MAX_HZ,
    maxHz: 952e12,
    color: '#7c3aed',
    category: 'em'
  },
  {
    id: 'em-uv-mid',
    name: 'UV-B',
    nameDE: 'UV-B',
    minHz: 952e12,
    maxHz: 1.07e15,
    color: '#6d28d9',
    category: 'em'
  },
  {
    id: 'em-uv-far',
    name: 'UV-C',
    nameDE: 'UV-C',
    minHz: 1.07e15,
    maxHz: 3e15,
    color: '#5b21b6',
    category: 'em'
  },
  {
    id: 'em-euv',
    name: 'EUV',
    nameDE: 'Extremes UV',
    minHz: 3e15,
    maxHz: 30e15,
    color: '#4c1d95',
    category: 'em'
  },
  {
    id: 'em-xray-soft',
    name: 'Soft X-Ray',
    nameDE: 'Weiche Röntgenstrahlung',
    minHz: 30e15,
    maxHz: 3e17,
    color: '#0891b2',
    category: 'em'
  },
  {
    id: 'em-xray-hard',
    name: 'Hard X-Ray',
    nameDE: 'Harte Röntgenstrahlung',
    minHz: 3e17,
    maxHz: 30e18,
    color: '#0e7490',
    category: 'em'
  },
  {
    id: 'em-gamma',
    name: 'Gamma',
    nameDE: 'Gammastrahlung',
    minHz: 30e18,
    maxHz: 3e22,
    color: '#ec4899',
    category: 'em'
  }
];

/** Datenquelle jeder Bandreihe. */
export const ROW_SOURCES: Record<RowKey, FrequencyBand[]> = {
  em: EXTENDED_EM_BANDS,
  itu: ITU_BANDS,
  ieee: IEEE_BANDS,
  nato: NATO_BANDS,
  civilian: CIVILIAN_BANDS
};

// =============================================================================
// Geometry
// =============================================================================

/** Rechteck eines Bands innerhalb der sichtbaren Domäne (auf sie beschnitten). */
export function calcBandRect(
  band: { minHz: number; maxHz: number },
  domain: Domain,
  xScale: (hz: number) => number
): { x: number; width: number; visible: boolean } {
  const [domainMin, domainMax] = domain;
  const clampedMin = Math.max(band.minHz, domainMin);
  const clampedMax = Math.min(band.maxHz, domainMax);
  if (clampedMin >= domainMax || clampedMax <= domainMin) {
    return { x: 0, width: 0, visible: false };
  }
  const x = xScale(clampedMin);
  const width = xScale(clampedMax) - x;
  return { x, width, visible: width > 0 };
}

/** Sichtbare Bandrechtecke einer Datenquelle. */
export function bandRects(
  bands: FrequencyBand[],
  domain: Domain,
  xScale: (hz: number) => number
): BandRect[] {
  return bands
    .map((band) => ({ ...band, ...calcBandRect(band, domain, xScale) }))
    .filter((b) => b.visible);
}

/** Y-Position einer Reihe: Summe der sichtbaren Reihen darüber. */
export function rowY(rowIndex: number, visibleRows: VisibleRows): number {
  let y = MARGIN.top;
  for (let i = 0; i < rowIndex; i++) {
    if (visibleRows[ROW_ORDER[i]]) y += ROW_HEIGHT + GAP;
  }
  return y;
}

/** Höhe aller sichtbaren Reihen samt Zwischenräumen. */
export function rowsHeight(visibleRowCount: number): number {
  return visibleRowCount * ROW_HEIGHT + (visibleRowCount - 1) * GAP;
}

// =============================================================================
// Visible light color
// =============================================================================

/**
 * Näherung der Spektralfarbe für eine Frequenz (380–780 nm), nach dem
 * verbreiteten Schema von Dan Bruton („Color Science", 1996) mit Gamma 0,8.
 */
export function getVisibleLightColor(frequencyHz: number, c: number): string {
  // Guard: frequencyHz must be positive
  if (frequencyHz <= 0) return 'rgb(0, 0, 0)';

  const wavelengthNm = safeDivide(c, frequencyHz, 0) * 1e9;

  let r = 0,
    g = 0,
    b = 0;

  if (wavelengthNm >= 380 && wavelengthNm < 440) {
    r = -(wavelengthNm - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wavelengthNm >= 440 && wavelengthNm < 490) {
    r = 0;
    g = (wavelengthNm - 440) / (490 - 440);
    b = 1;
  } else if (wavelengthNm >= 490 && wavelengthNm < 510) {
    r = 0;
    g = 1;
    b = -(wavelengthNm - 510) / (510 - 490);
  } else if (wavelengthNm >= 510 && wavelengthNm < 580) {
    r = (wavelengthNm - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wavelengthNm >= 580 && wavelengthNm < 645) {
    r = 1;
    g = -(wavelengthNm - 645) / (645 - 580);
    b = 0;
  } else if (wavelengthNm >= 645 && wavelengthNm <= 780) {
    r = 1;
    g = 0;
    b = 0;
  }

  let factor = 1.0;
  if (wavelengthNm >= 380 && wavelengthNm < 420) {
    factor = 0.3 + (0.7 * (wavelengthNm - 380)) / (420 - 380);
  } else if (wavelengthNm >= 645 && wavelengthNm <= 780) {
    factor = 0.3 + (0.7 * (780 - wavelengthNm)) / (780 - 645);
  }

  r = Math.round(255 * Math.pow(r * factor, 0.8));
  g = Math.round(255 * Math.pow(g * factor, 0.8));
  b = Math.round(255 * Math.pow(b * factor, 0.8));

  return `rgb(${r}, ${g}, ${b})`;
}

/** Anzahl der Farbstützen des Regenbogen-Verlaufs. */
const GRADIENT_STOPS = 20;

/** Verlaufsstützen des sichtbaren Lichts innerhalb der Domäne (leer, wenn außerhalb). */
export function visibleLightGradientStops(
  domain: Domain,
  c: number
): { offset: string; color: string }[] {
  const [domainMin, domainMax] = domain;
  const visMin = Math.max(VISIBLE_MIN_HZ, domainMin);
  const visMax = Math.min(VISIBLE_MAX_HZ, domainMax);

  if (visMin >= visMax) return [];

  const stops: { offset: string; color: string }[] = [];
  const logMin = Math.log10(visMin);
  const logMax = Math.log10(visMax);

  for (let i = 0; i <= GRADIENT_STOPS; i++) {
    const t = i / GRADIENT_STOPS;
    const freq = Math.pow(10, logMin + t * (logMax - logMin));
    stops.push({ offset: `${t * 100}%`, color: getVisibleLightColor(freq, c) });
  }

  return stops;
}
