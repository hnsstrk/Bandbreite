/**
 * Bereiche und Voreinstellungen der atmosphärischen Eingaben.
 *
 * Die Zahlenwerte stammen aus `$lib/stores/atmosphericParameters.svelte`;
 * hier stehen nur die Bedienbereiche und die Chip-Listen.
 */

import {
  FOG_DENSITY_LIGHT,
  FOG_DENSITY_MEDIUM,
  FOG_DENSITY_THICK,
  RAIN_RATE_EXTREME,
  RAIN_RATE_HEAVY,
  RAIN_RATE_LIGHT,
  RAIN_RATE_MODERATE,
  RAIN_RATE_VERY_HEAVY,
  SNOW_RATE_HEAVY,
  SNOW_RATE_LIGHT,
  SNOW_RATE_MODERATE
} from '$lib/stores/atmosphericParameters.svelte';
import type { PresetChip } from '$lib/components/calculators/presetChips.svelte';

/** Reglergrenzen der atmosphärischen Größen. */
export const TEMPERATURE_MIN_C = -50;
export const TEMPERATURE_MAX_C = 50;
export const PRESSURE_MIN_HPA = 800;
export const PRESSURE_MAX_HPA = 1100;
export const WATER_VAPOR_MIN = 0;
export const WATER_VAPOR_MAX = 30;

/** Reglergrenzen der Niederschlagsgrößen. */
export const RAIN_MIN_MMH = 0;
export const RAIN_MAX_MMH = 200;
export const FOG_MIN_GM3 = 0;
export const FOG_MAX_GM3 = 1;
export const SNOW_MIN_MMH = 0;
export const SNOW_MAX_MMH = 20;

export const RAIN_PRESETS: PresetChip[] = [
  { id: 'none', label: 'Kein', value: 0 },
  { id: 'light', label: 'Leicht', value: RAIN_RATE_LIGHT, hint: '2,5 mm/h' },
  { id: 'moderate', label: 'Mäßig', value: RAIN_RATE_MODERATE, hint: '12,5 mm/h' },
  { id: 'heavy', label: 'Stark', value: RAIN_RATE_HEAVY, hint: '25 mm/h' },
  { id: 'very-heavy', label: 'Sehr stark', value: RAIN_RATE_VERY_HEAVY, hint: '50 mm/h' },
  { id: 'extreme', label: 'Extrem', value: RAIN_RATE_EXTREME, hint: 'Wolkenbruch, 100 mm/h' }
];

export const FOG_PRESETS: PresetChip[] = [
  { id: 'none', label: 'Kein', value: 0 },
  { id: 'light', label: 'Leicht', value: FOG_DENSITY_LIGHT, hint: 'Sichtweite etwa 1000 m' },
  { id: 'medium', label: 'Mittel', value: FOG_DENSITY_MEDIUM, hint: 'Sichtweite etwa 300 m' },
  { id: 'thick', label: 'Dicht', value: FOG_DENSITY_THICK, hint: 'Sichtweite etwa 50 m' }
];

export const SNOW_PRESETS: PresetChip[] = [
  { id: 'none', label: 'Kein', value: 0 },
  { id: 'light', label: 'Leicht', value: SNOW_RATE_LIGHT, hint: '1 mm/h Wasseräquivalent' },
  { id: 'moderate', label: 'Mäßig', value: SNOW_RATE_MODERATE, hint: '2,5 mm/h Wasseräquivalent' },
  { id: 'heavy', label: 'Stark', value: SNOW_RATE_HEAVY, hint: '5 mm/h Wasseräquivalent' }
];

export const POLARIZATION_OPTIONS = [
  { value: 'horizontal', label: 'Horizontal (H)' },
  { value: 'vertical', label: 'Vertikal (V)' },
  { value: 'circular', label: 'Zirkular' }
];

export const ATMOSPHERIC_TABS = [
  { id: 'atmospheric', label: 'Atmosphäre (P.676)' },
  { id: 'precipitation', label: 'Niederschlag (P.838/P.840)' }
];
