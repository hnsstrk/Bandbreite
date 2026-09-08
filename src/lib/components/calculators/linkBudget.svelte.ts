/**
 * Typen, Bereiche und Presets des Link-Budget-Rechners.
 *
 * `LinkBudgetData` wird hier **einmal** definiert und von Rechner wie
 * Wasserfalldiagramm importiert — vorher stand dieselbe 16-Feld-Form
 * zusätzlich inline in der Seite.
 */

import { DEFAULT_EARTH_SPACE_ELEVATION_DEG } from '$lib/data/constants';
import { LINK_BUDGET_PRESETS, type LinkBudgetPreset } from '$lib/data/presets';
import { DISTANCE_UNITS, FREQUENCY_UNITS, getDistanceFactor } from '$lib/data/units';
import type { ParamSpecs } from '$lib/utils/urlState.svelte';

export type { PresetChip } from './presetChips.svelte';

/** Vollständiger Zustand einer Streckenbilanz. */
export interface LinkBudgetData {
  txPowerDbm: number;
  txAntennaGainDbi: number;
  txCableLossDb: number;
  eirpDbm: number;
  fsplDb: number;
  atmosphericLossDb: number;
  miscLossDb: number;
  totalPathLossDb: number;
  rxAntennaGainDbi: number;
  rxCableLossDb: number;
  receivedPowerDbm: number;
  rxSensitivityDbm: number;
  linkMarginDb: number;
  fadingMarginDb: number;
  systemMarginDb: number;
  linkViable: boolean;
}

/** Art der Funkstrecke. */
export type PathType = 'terrestrial' | 'earth-space';

export const FREQUENCY_UNIT_OPTIONS = FREQUENCY_UNITS;
export const DISTANCE_UNIT_OPTIONS = DISTANCE_UNITS;

/** Reglergrenzen */
export const TX_POWER_MIN_DBM = -30;
export const TX_POWER_MAX_DBM = 60;
export const GAIN_MIN_DBI = -10;
export const GAIN_MAX_DBI = 60;
export const CABLE_LOSS_MIN_DB = 0;
export const CABLE_LOSS_MAX_DB = 20;
export const MISC_LOSS_MIN_DB = 0;
export const MISC_LOSS_MAX_DB = 30;
export const FADING_MARGIN_MIN_DB = 0;
export const FADING_MARGIN_MAX_DB = 40;
export const SENSITIVITY_MIN_DBM = -140;
export const SENSITIVITY_MAX_DBM = -20;
export const PATH_LENGTH_MIN_M = 1;
export const PATH_LENGTH_MAX_M = 4e7;
export const LINK_FREQUENCY_MIN_HZ = 1e6;
export const LINK_FREQUENCY_MAX_HZ = 1e11;
export const ELEVATION_MIN_DEG = 5;
export const ELEVATION_MAX_DEG = 90;

export const LINK_BUDGET_PARAMS = {
  pt: { default: 20, min: TX_POWER_MIN_DBM, max: TX_POWER_MAX_DBM },
  gt: { default: 2, min: GAIN_MIN_DBI, max: GAIN_MAX_DBI },
  lt: { default: 1, min: CABLE_LOSS_MIN_DB, max: CABLE_LOSS_MAX_DB },
  d: { default: 1000, min: PATH_LENGTH_MIN_M, max: PATH_LENGTH_MAX_M },
  f: { default: 2.4e9, min: LINK_FREQUENCY_MIN_HZ, max: LINK_FREQUENCY_MAX_HZ },
  gr: { default: 2, min: GAIN_MIN_DBI, max: GAIN_MAX_DBI },
  lr: { default: 1, min: CABLE_LOSS_MIN_DB, max: CABLE_LOSS_MAX_DB },
  s: { default: -90, min: SENSITIVITY_MIN_DBM, max: SENSITIVITY_MAX_DBM },
  fade: { default: 10, min: FADING_MARGIN_MIN_DB, max: FADING_MARGIN_MAX_DB },
  misc: { default: 0, min: MISC_LOSS_MIN_DB, max: MISC_LOSS_MAX_DB },
  atm: { default: false },
  path: { default: 'terrestrial', options: ['terrestrial', 'earth-space'] as const },
  el: {
    default: DEFAULT_EARTH_SPACE_ELEVATION_DEG,
    min: ELEVATION_MIN_DEG,
    max: ELEVATION_MAX_DEG
  }
} satisfies ParamSpecs;

/** Die Szenario-Presets aus `data/presets.ts`, unverändert weitergereicht. */
export const LINK_PRESETS = LINK_BUDGET_PRESETS;
export type { LinkBudgetPreset };

/** Rechnet die Distanz eines Presets in Meter um. */
export function presetDistanceM(preset: LinkBudgetPreset): number {
  return preset.distance * getDistanceFactor(preset.distUnit);
}

/** Frequenz eines Presets in Hertz. */
export function presetFrequencyHz(preset: LinkBudgetPreset): number {
  const factor = FREQUENCY_UNITS.find((unit) => unit.id === preset.freqUnit)?.factor ?? 1;
  return preset.freq * factor;
}

export const PATH_TYPE_OPTIONS = [
  { value: 'terrestrial', label: 'Terrestrisch (γ · d)' },
  { value: 'earth-space', label: 'Erde–Raum (troposphärischer Anteil)' }
];
