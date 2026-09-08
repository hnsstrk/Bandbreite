/**
 * Beschreibung des Radar-Reichweiten-Rechners: Bereiche, Presets, URL-Parameter.
 *
 * Die Presets tragen eine **ID**. Der aktive Chip wird über diese ID bestimmt,
 * nicht über den Zahlenwert — sonst leuchten „PKW" und „Verkehrsflugzeug"
 * gleichzeitig auf, weil beide σ = 100 m² haben.
 */

import { RCS_REFERENCE } from '$lib/data/constants';
import { FREQUENCY_UNITS } from '$lib/data/units';
import type { ParamSpecs } from '$lib/utils/urlState.svelte';
import type { PresetChip } from './presetChips.svelte';

export { activePresetId, type PresetChip } from './presetChips.svelte';

/** Reglergrenzen der Radarfrequenz: 100 MHz bis 100 GHz, logarithmisch. */
export const RADAR_FREQUENCY_MIN_HZ = 1e8;
export const RADAR_FREQUENCY_MAX_HZ = 1e11;

/** Sendeleistung: 1 mW bis 10 MW, logarithmisch. */
export const TX_POWER_MIN_W = 1e-3;
export const TX_POWER_MAX_W = 1e7;

/** Antennengewinn in dBi, linear. */
export const GAIN_MIN_DBI = 0;
export const GAIN_MAX_DBI = 60;

/** Radarquerschnitt: 10⁻⁵ bis 10⁵ m², logarithmisch. */
export const RCS_MIN_M2 = 1e-5;
export const RCS_MAX_M2 = 1e5;

/** Empfängerempfindlichkeit in dBm. */
export const SENSITIVITY_MIN_DBM = -140;
export const SENSITIVITY_MAX_DBM = -30;

/** Systemverluste in dB (Skolnik: typisch 3–10 dB). */
export const SYSTEM_LOSS_MIN_DB = 0;
export const SYSTEM_LOSS_MAX_DB = 30;

export const FREQUENCY_UNIT_OPTIONS = FREQUENCY_UNITS;

/** Nur Watt — die Sendeleistung deckt über den Regler zehn Dekaden ab. */
export const POWER_UNIT_OPTIONS = [{ id: 'w', symbol: 'W', factor: 1 }];

export const RADAR_PARAMS = {
  f: { default: 9.4e9, min: RADAR_FREQUENCY_MIN_HZ, max: RADAR_FREQUENCY_MAX_HZ },
  pt: { default: 1000, min: TX_POWER_MIN_W, max: TX_POWER_MAX_W },
  g: { default: 30, min: GAIN_MIN_DBI, max: GAIN_MAX_DBI },
  rcs: { default: 1, min: RCS_MIN_M2, max: RCS_MAX_M2 },
  smin: { default: -90, min: SENSITIVITY_MIN_DBM, max: SENSITIVITY_MAX_DBM },
  l: { default: 0, min: SYSTEM_LOSS_MIN_DB, max: SYSTEM_LOSS_MAX_DB }
} satisfies ParamSpecs;

/** Radarbänder als Frequenz-Chips. */
export const RADAR_FREQUENCY_PRESETS: PresetChip[] = [
  { id: 'l', label: 'L-Band', value: 1.3e9, hint: 'Flugsicherung' },
  { id: 's', label: 'S-Band', value: 2.9e9, hint: 'Wetter und Anflugkontrolle' },
  { id: 'c', label: 'C-Band', value: 5.5e9, hint: 'Wetterradar' },
  { id: 'x', label: 'X-Band', value: 9.4e9, hint: 'Marine und Wetter' },
  { id: 'ku', label: 'Ku-Band', value: 15e9, hint: 'Satellit' },
  { id: 'k', label: 'K-Band', value: 24.125e9, hint: 'Geschwindigkeitsmessung' },
  { id: 'ka', label: 'Ka-Band', value: 35e9, hint: 'Militär' },
  { id: 'w', label: '77 GHz', value: 77e9, hint: 'Kfz-Radar' }
];

/** Vollständige RCS-Liste aus der zentralen Referenztabelle (Skolnik). */
export const RCS_PRESETS: PresetChip[] = RCS_REFERENCE.map((entry) => ({
  id: entry.id,
  label: entry.nameDE,
  value: entry.rcsM2,
  hint: entry.descriptionDE
}));

/** Distanzen, für die die Empfangsleistung ausgewiesen wird (in Metern). */
export const POWER_SAMPLE_RANGES_M = [1000, 10000, 50000, 100000] as const;
