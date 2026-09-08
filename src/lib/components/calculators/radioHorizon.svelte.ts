/**
 * Bereiche, Presets und Zeichenmaße des Radiohorizont-Rechners.
 *
 * Gerechnet wird nicht hier: `horizonDistanceKm`, `losDistanceKm` und
 * `horizonFactor` stehen in `$lib/data/propagation`.
 */

import { REFRACTION_FACTOR_K, K_FACTOR_MAX, K_FACTOR_MIN } from '$lib/data/propagation';
import type { ParamSpecs } from '$lib/utils/urlState.svelte';
import type { PresetChip } from './presetChips.svelte';

/** Antennenhöhe: 1 m bis 12 km (Reiseflughöhe), logarithmisch. */
export const HEIGHT_MIN_M = 1;
export const HEIGHT_MAX_M = 12000;

/** Einheiten der Höheneingabe. */
export const HEIGHT_UNITS = [
  { id: 'm', symbol: 'm', factor: 1 },
  { id: 'km', symbol: 'km', factor: 1000 }
];

export { K_FACTOR_MAX, K_FACTOR_MIN };

export const RADIO_HORIZON_PARAMS = {
  h1: { default: 10, min: HEIGHT_MIN_M, max: HEIGHT_MAX_M },
  h2: { default: 1.5, min: HEIGHT_MIN_M, max: HEIGHT_MAX_M },
  k: { default: REFRACTION_FACTOR_K, min: K_FACTOR_MIN, max: K_FACTOR_MAX }
} satisfies ParamSpecs;

/**
 * Typische Aufbauhöhen.
 * Quellen: Reiseflughöhe der Verkehrsluftfahrt ≈ 10 km (ICAO Annex 2,
 * Flugflächen 290–410); die übrigen Werte sind übliche Praxiswerte.
 */
export const HEIGHT_PRESETS: PresetChip[] = [
  { id: 'handheld', label: 'Handfunkgerät 1,5 m', value: 1.5, hint: 'Antenne in Kopfhöhe' },
  { id: 'roof', label: 'Hausantenne 10 m', value: 10, hint: 'Dachmontage im Einfamilienhaus' },
  { id: 'mast', label: 'Sendemast 100 m', value: 100, hint: 'UKW- oder Mobilfunkstandort' },
  { id: 'aircraft', label: 'Flugzeug 10 km', value: 10000, hint: 'Reiseflughöhe' }
];

/** Marken des k-Reglers. */
export const K_FACTOR_TICKS = [
  { at: K_FACTOR_MIN, label: '1,0 geometrisch' },
  { at: REFRACTION_FACTOR_K, label: '4/3 Standard' },
  { at: K_FACTOR_MAX, label: '1,5 Überreichweite' }
];

/**
 * Kennzeichnung der Refraktionslage nach ITU-R P.834:
 * k < 1 Subrefraktion, k ≈ 4/3 Standardatmosphäre, k > 4/3 Superrefraktion.
 */
export function refractionLabel(kFactor: number): string {
  if (kFactor < 1.15) return 'Subrefraktion — der Horizont rückt näher';
  if (kFactor < 1.45) return 'Standardatmosphäre — 4/3-Erde-Modell';
  return 'Superrefraktion — Überreichweiten bis hin zum Ducting';
}

/** Höchste Höhe, die die Skizze maßstäblich fassen muss (in km). */
export function sketchAltitudeKm(height1M: number, height2M: number): number {
  return Math.max(height1M, height2M) / 1000;
}
