/**
 * Materialdaten, Bereiche und Kennlinien des Skin-Tiefen-Rechners.
 *
 * Die Formel selbst steht in `$lib/utils/calculations`
 * (`calculateSkinDepth`, `calculateSkinDepthWithValidity`).
 */

import { SEAWATER_CONDUCTIVITY } from '$lib/data/constants';
import { calculateSkinDepth } from '$lib/utils/calculations';
import type { ParamSpecs } from '$lib/utils/urlState.svelte';

/** Frequenzbereich des Rechners: 1 Hz bis 1 GHz, logarithmisch. */
export const SKIN_FREQUENCY_MIN_HZ = 1;
export const SKIN_FREQUENCY_MAX_HZ = 1e9;

/** Leitfähigkeitsbereich: 10⁻⁶ bis 10⁸ S/m, logarithmisch. */
export const CONDUCTIVITY_MIN = 1e-6;
export const CONDUCTIVITY_MAX = 1e8;

/** Achsenbereiche des Diagramms */
export const CHART_FREQ_MIN_HZ = 1;
export const CHART_FREQ_MAX_HZ = 1e5;
export const CHART_DEPTH_MIN_M = 0.1;
export const CHART_DEPTH_MAX_M = 1000;

/** Praktische Kommunikationstiefe entspricht etwa 2,5 Skin-Tiefen. */
export const PRACTICAL_DEPTH_FACTOR = 2.5;

/** Restamplitude in zwei Skin-Tiefen: e⁻² ≈ 13,5 %. */
export const SIGNAL_AT_TWO_DEPTHS = Math.exp(-2);

export const SKIN_PARAMS = {
  f: { default: 10000, min: SKIN_FREQUENCY_MIN_HZ, max: SKIN_FREQUENCY_MAX_HZ },
  sigma: { default: SEAWATER_CONDUCTIVITY, min: CONDUCTIVITY_MIN, max: CONDUCTIVITY_MAX },
  eps: { default: 81, min: 1, max: 100 }
} satisfies ParamSpecs;

/** Ein Ausbreitungsmedium mit Leitfähigkeit und Permittivität. */
export interface Medium {
  id: string;
  label: string;
  /** Leitfähigkeit σ in S/m */
  conductivity: number;
  /** Relative Permittivität εᵣ (ITU-R P.527) */
  relativePermittivity: number;
  /** Serien-Token für die Kennlinie */
  color: string;
  /** Im Kennlinienfeld darstellbar (Metalle liegen weit außerhalb) */
  inChart: boolean;
}

export const MEDIA: Medium[] = [
  {
    id: 'seawater',
    label: 'Seewasser',
    conductivity: 4,
    relativePermittivity: 81,
    color: 'var(--color-series-1)',
    inChart: true
  },
  {
    id: 'freshwater',
    label: 'Süßwasser',
    conductivity: 0.01,
    relativePermittivity: 81,
    color: 'var(--color-series-2)',
    inChart: true
  },
  {
    id: 'wet-earth',
    label: 'Feuchte Erde',
    conductivity: 0.1,
    relativePermittivity: 30,
    color: 'var(--color-series-4)',
    inChart: true
  },
  {
    id: 'dry-earth',
    label: 'Trockene Erde',
    conductivity: 0.001,
    relativePermittivity: 5,
    color: 'var(--color-series-3)',
    inChart: true
  },
  {
    id: 'copper',
    label: 'Kupfer',
    conductivity: 5.96e7,
    relativePermittivity: 1,
    color: 'var(--color-series-6)',
    inChart: false
  },
  {
    id: 'aluminum',
    label: 'Aluminium',
    conductivity: 3.5e7,
    relativePermittivity: 1,
    color: 'var(--color-series-8)',
    inChart: false
  }
];

/** Kennlinien-Medien (ohne Metalle). */
export const CHART_MEDIA = MEDIA.filter((medium) => medium.inChart);

/**
 * Beispiele für die Erläuterung zur U-Boot-Kommunikation.
 * Die Tiefen werden aus `calculateSkinDepth` gerechnet, nicht abgeschrieben —
 * bei 76 Hz und σ = 4 S/m sind es rund 29 m, nicht 46 m.
 */
export const SEAWATER_EXAMPLES = [
  { frequencyHz: 30, label: 'Projekt Sanguine', conductivity: SEAWATER_CONDUCTIVITY },
  { frequencyHz: 76, label: 'US Navy ELF', conductivity: SEAWATER_CONDUCTIVITY },
  { frequencyHz: 20000, label: 'VLF-Betrieb', conductivity: SEAWATER_CONDUCTIVITY }
];

/** Frequenz-Presets für ELF/VLF. */
export const SKIN_FREQUENCY_PRESETS = [
  { label: '3 Hz', value: 3, hint: 'ELF — U-Boot in großer Tiefe' },
  { label: '30 Hz', value: 30, hint: 'ELF — Projekt Sanguine' },
  { label: '300 Hz', value: 300, hint: 'ULF' },
  { label: '3 kHz', value: 3000, hint: 'VLF, unteres Ende' },
  { label: '10 kHz', value: 10000, hint: 'VLF, typisch' },
  { label: '30 kHz', value: 30000, hint: 'VLF, oberes Ende' },
  { label: '77,5 kHz', value: 77500, hint: 'DCF77' }
];

/** Schrittweite der Kennlinie in Dekaden-Zehnteln. */
const CURVE_LOG_STEP = 0.1;

/** Ein Kennlinienpunkt */
export interface DepthPoint {
  frequency: number;
  depth: number;
}

/** Erzeugt die Kennlinie eines Mediums über der Frequenz. */
export function generateDepthCurve(conductivity: number): DepthPoint[] {
  const points: DepthPoint[] = [];
  const logMin = Math.log10(CHART_FREQ_MIN_HZ);
  const logMax = Math.log10(CHART_FREQ_MAX_HZ);

  for (let logF = logMin; logF <= logMax + 1e-9; logF += CURVE_LOG_STEP) {
    const frequency = Math.pow(10, logF);
    const depth = calculateSkinDepth(frequency, conductivity);
    if (depth > 0 && depth < 1e4) {
      points.push({ frequency, depth });
    }
  }
  return points;
}

/** Kennlinien aller darstellbaren Medien. */
export function generateAllCurves(): { medium: Medium; points: DepthPoint[] }[] {
  return CHART_MEDIA.map((medium) => ({
    medium,
    points: generateDepthCurve(medium.conductivity)
  }));
}

/** Findet das Medium, dessen Leitfähigkeit exakt passt — sonst „eigener Wert". */
export function mediumForConductivity(conductivity: number): Medium | null {
  return MEDIA.find((medium) => medium.conductivity === conductivity) ?? null;
}

export const CHART_X_TICKS = [1, 10, 100, 1000, 10000, 100000] as const;
export const CHART_Y_TICKS = [0.1, 1, 10, 100, 1000] as const;
