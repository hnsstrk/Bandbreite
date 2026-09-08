/**
 * Kategorien, Ausbreitungsmodi und Formatierung der Frequenzband-Seite.
 */

import {
  AMATEUR_FREQUENCY_BANDS,
  BROADCAST_FREQUENCY_BANDS,
  IEEE_FREQUENCY_BANDS,
  ITU_FREQUENCY_BANDS,
  NATO_FREQUENCY_BANDS,
  type FrequencyBandCategory,
  type FrequencyBandDetail,
  type PropagationModeType
} from '$lib/data/frequencyBands';
import { FREQUENCY_UNITS } from '$lib/data/units';
import { formatFrequency } from '$lib/utils/formatting';
import type { IconName } from '$lib/components/ui/icons';

/** Die fünf Bandsysteme als Reiter. */
export const BAND_TABS: { id: FrequencyBandCategory; label: string; bands: FrequencyBandDetail[] }[] = [
  { id: 'itu', label: 'ITU', bands: ITU_FREQUENCY_BANDS },
  { id: 'ieee', label: 'IEEE-Radar', bands: IEEE_FREQUENCY_BANDS },
  { id: 'nato', label: 'NATO', bands: NATO_FREQUENCY_BANDS },
  { id: 'amateur', label: 'Amateurfunk', bands: AMATEUR_FREQUENCY_BANDS },
  { id: 'broadcast', label: 'Rundfunk', bands: BROADCAST_FREQUENCY_BANDS }
];

/** Einheiten der Frequenzsuche. */
export const SEARCH_UNITS = FREQUENCY_UNITS.filter((unit) => unit.id !== 'THz');

/** Suchbereich: 3 Hz bis 300 GHz. */
export const SEARCH_MIN_HZ = 3;
export const SEARCH_MAX_HZ = 3e11;

/**
 * Ausbreitungsmodus: Serien-Token statt Hex und ein Icon aus dem Katalog
 * statt eines Emoji (STYLE_GUIDE: keine Emoji als Symbole).
 */
export const PROPAGATION_CONFIG: Record<
  PropagationModeType,
  { token: string; icon: IconName; short: string }
> = {
  submarine: { token: 'var(--color-series-1)', icon: 'wave', short: 'U-Boot' },
  groundWave: { token: 'var(--color-series-2)', icon: 'globe', short: 'Bodenwelle' },
  skyWave: { token: 'var(--color-series-4)', icon: 'spectrum', short: 'Raumwelle' },
  lineOfSight: { token: 'var(--color-series-3)', icon: 'antenna', short: 'Sichtlinie' },
  mixed: { token: 'var(--color-series-5)', icon: 'signal', short: 'Gemischt' }
};

/** Frequenzbereich eines Bandes als Text. */
export function bandRange(band: FrequencyBandDetail): string {
  return `${formatFrequency(band.frequencyHz.min)} – ${formatFrequency(band.frequencyHz.max)}`;
}
