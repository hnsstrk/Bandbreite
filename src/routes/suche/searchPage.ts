/**
 * Logik der Suchseite `/suche/` — reine Funktionen, ohne DOM und ohne Runes.
 *
 * Die Seite zeigt dieselben Treffer wie die Command-Palette, nur vollständig:
 * alle Gruppen, jede Gruppe mit Zähler und Filter-Chip. Die Bewertung selbst
 * steht in `$lib/utils/search.ts` — hier wird nur gruppiert und gezählt.
 */

import {
  entriesForFrequency,
  parseFrequencyQuery,
  searchEntries,
  type ParsedFrequency
} from '$lib/utils/search';
import {
  LIVE_SEARCH_INDEX,
  SEARCH_GROUPS,
  type SearchEntry,
  type SearchEntryType
} from '$lib/data/searchIndex';
import { frequencyActions, type PaletteItem } from '$lib/components/layout/commandPalette.svelte';

/** Höchstzahl der bewerteten Treffer — darüber hilft ein genauerer Begriff. */
export const MAX_RESULTS = 200;

export interface SearchPageGroup {
  type: SearchEntryType;
  label: string;
  entries: SearchEntry[];
}

/** Alle Treffer einer Anfrage, gruppiert in der Reihenfolge von `SEARCH_GROUPS`. */
export function resultGroups(
  query: string,
  index: SearchEntry[] = LIVE_SEARCH_INDEX
): SearchPageGroup[] {
  const hits = searchEntries(query, index, MAX_RESULTS);
  return SEARCH_GROUPS.map((group) => ({
    type: group.type,
    label: group.label,
    entries: hits.filter((entry) => entry.type === group.type)
  })).filter((group) => group.entries.length > 0);
}

/** Nur die gewählte Gruppe, oder alle, wenn kein Filter gesetzt ist. */
export function filterGroups(
  groups: SearchPageGroup[],
  type: SearchEntryType | null
): SearchPageGroup[] {
  return type ? groups.filter((group) => group.type === type) : groups;
}

/** Summe der Treffer über alle übergebenen Gruppen. */
export function countEntries(groups: SearchPageGroup[]): number {
  return groups.reduce((sum, group) => sum + group.entries.length, 0);
}

export interface FrequencyResult {
  parsed: ParsedFrequency;
  /** Sprünge in Spektrum, Datenbank und Rechner. */
  actions: PaletteItem[];
  /** Bänder und Dienste, deren Bereich die Frequenz enthält. */
  matches: SearchEntry[];
}

/**
 * Frequenz-Modus der Seite: erkennt „2,4 GHz" und liefert dieselben Aktionen
 * wie die Palette, dazu die passenden Bänder und Dienste.
 */
export function frequencyResult(
  query: string,
  index: SearchEntry[] = LIVE_SEARCH_INDEX
): FrequencyResult | null {
  const parsed = parseFrequencyQuery(query);
  if (!parsed) return null;
  return {
    parsed,
    actions: frequencyActions(parsed.hz),
    matches: entriesForFrequency(parsed.hz, index, 12)
  };
}

/** Vorschläge für den Leer- und den Nulltrefferzustand. */
export const SEARCH_SUGGESTIONS: { query: string; hint: string }[] = [
  { query: 'FSPL', hint: 'Freiraumdämpfung berechnen' },
  { query: 'Fresnel', hint: 'Fresnel-Zone und Hindernis' },
  { query: '2,4 GHz', hint: 'Frequenz-Modus: Bänder und Dienste' },
  { query: 'Doppler', hint: 'Widget im Radar-Kapitel' },
  { query: 'Amateurfunk', hint: 'Bandplan und Kapitel' },
  { query: 'Ionosphäre', hint: 'Kurzwellenausbreitung' }
];

/** Link auf die Suchseite mit vorbelegter Anfrage. */
export function searchPageHref(query: string): string {
  return `/suche/?q=${encodeURIComponent(query)}`;
}
