/**
 * Logik und Parameterbeschreibung des FSPL-Rechners.
 *
 * Hier stehen nur DOM-freie Bausteine: die Bereichsgrenzen der Regler, die
 * URL-Parameter und die Umformung der Presets. Die Formel selbst kommt aus
 * `$lib/utils/calculations`.
 */

import { DISTANCE_UNITS, FREQUENCY_UNITS } from '$lib/data/units';
import { DISTANCE_PRESETS_METERS, FSPL_FREQUENCY_PRESETS } from '$lib/data/presets';
import type { ParamSpecs } from '$lib/utils/urlState.svelte';

/** Reglergrenzen der Frequenz: 1 kHz bis 300 GHz, logarithmisch. */
export const FREQUENCY_MIN_HZ = 1e3;
export const FREQUENCY_MAX_HZ = 3e11;

/** Reglergrenzen der Distanz: 1 m bis 1000 km, logarithmisch. */
export const DISTANCE_MIN_M = 1;
export const DISTANCE_MAX_M = 1e6;

/** Startwerte des Rechners (zugleich die Standardwerte der URL-Parameter). */
export const FSPL_DEFAULT_FREQUENCY_HZ = 2.4e9;
export const FSPL_DEFAULT_DISTANCE_M = 100;

/** Einheitenlisten für die Zahlenfelder. */
export const FREQUENCY_UNIT_OPTIONS = FREQUENCY_UNITS;
export const DISTANCE_UNIT_OPTIONS = DISTANCE_UNITS;

/** Suchparameter des Rechners — `f` in Hertz, `d` in Metern. */
export const FSPL_PARAMS = {
  f: { default: FSPL_DEFAULT_FREQUENCY_HZ, min: FREQUENCY_MIN_HZ, max: FREQUENCY_MAX_HZ },
  d: { default: FSPL_DEFAULT_DISTANCE_M, min: DISTANCE_MIN_M, max: DISTANCE_MAX_M },
  multi: { default: true }
} satisfies ParamSpecs;

/** Frequenz-Presets als Chips: Wert in Hertz plus Kurzbeschreibung. */
export const FREQUENCY_PRESETS = FSPL_FREQUENCY_PRESETS.map((preset) => ({
  label: preset.label,
  value: preset.hz,
  hint: preset.descriptionDE ?? preset.description
}));

/** Distanz-Presets als Chips: Wert in Metern. */
export const DISTANCE_PRESETS = DISTANCE_PRESETS_METERS.map((meters) => ({
  label: meters >= 1000 ? `${meters / 1000} km` : `${meters} m`,
  value: meters as number
}));

/**
 * Wählt die passende Frequenzeinheit zu einem Hertz-Wert, damit das Feld
 * nach einem Preset oder Deep-Link lesbare Zahlen zeigt.
 */
export function pickFrequencyUnit(hz: number): string {
  if (hz >= 1e12) return 'THz';
  if (hz >= 1e9) return 'GHz';
  if (hz >= 1e6) return 'MHz';
  if (hz >= 1e3) return 'kHz';
  return 'Hz';
}

/** Wählt die passende Distanzeinheit zu einem Meterwert. */
export function pickDistanceUnit(meters: number): string {
  return meters >= 1000 ? 'km' : 'm';
}
