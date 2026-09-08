/**
 * Suchlogik der Command-Palette — ohne externe Abhängigkeit.
 *
 * Bewertung: Präfix des Titels > Wortanfang im Titel > Teilstring im Titel >
 * Treffer in Stichworten oder Untertitel. Umlaute werden für den Vergleich
 * normalisiert (`ä → ae`), angezeigt wird weiterhin der Originaltext.
 */

import { parseLocaleNumber } from './handlers';
import { normalizeForSearch } from './slug';
import {
  LIVE_SEARCH_INDEX,
  SEARCH_GROUPS,
  type SearchEntry,
  type SearchEntryType
} from '$lib/data/searchIndex';

export interface ScoredEntry {
  entry: SearchEntry;
  score: number;
}

export interface SearchGroupResult {
  type: SearchEntryType;
  label: string;
  entries: SearchEntry[];
}

const TYPE_BONUS: Record<SearchEntryType, number> = {
  werkzeug: 12,
  seite: 10,
  widget: 7,
  band: 6,
  funkdienst: 5,
  sender: 4,
  glossar: 3
};

/**
 * Gewicht des Treffers je Ergebnistyp.
 *
 * Der Zuschlag oben allein reicht nicht: ein Glossarbegriff, dessen Titel mit
 * dem Suchwort beginnt, läge sonst vor der Seite, die den Begriff behandelt.
 * Wer „fspl" sucht, will zuerst den Rechner — die Definition steht danach.
 *
 * Widgets liegen zwischen Seite und Glossar: Sie sind ein eigenständiges Ziel
 * im Kapitel, aber die Kapitelseite selbst bleibt der Haupttreffer.
 */
const TYPE_WEIGHT: Record<SearchEntryType, number> = {
  werkzeug: 1,
  seite: 1,
  widget: 0.8,
  band: 0.8,
  funkdienst: 0.8,
  sender: 0.8,
  glossar: 0.6
};

/** Punktwert eines einzelnen Feldes für ein Suchwort. */
function fieldScore(field: string, token: string, weight: number): number {
  if (!field || !token) return 0;
  if (field === token) return 100 * weight;
  if (field.startsWith(token)) return 70 * weight;
  if (field.includes(` ${token}`)) return 45 * weight;
  if (field.includes(token)) return 20 * weight;
  return 0;
}

/** Bewertet einen Indexeintrag gegen eine bereits normalisierte Suchanfrage. */
export function scoreEntry(entry: SearchEntry, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const title = normalizeForSearch(entry.title);
  const subtitle = normalizeForSearch(entry.subtitle);
  const keywords = entry.keywords.map(normalizeForSearch);

  let total = 0;
  for (const token of tokens) {
    let best = fieldScore(title, token, 1);
    for (const keyword of keywords) {
      best = Math.max(best, fieldScore(keyword, token, 0.6));
    }
    best = Math.max(best, fieldScore(subtitle, token, 0.3));
    if (best === 0) return 0; // jedes Suchwort muss irgendwo vorkommen
    total += best;
  }
  return total * TYPE_WEIGHT[entry.type] + TYPE_BONUS[entry.type];
}

/** Zerlegt eine Suchanfrage in normalisierte Suchwörter. */
export function tokenize(query: string): string[] {
  return normalizeForSearch(query).split(' ').filter(Boolean);
}

/** Flache, nach Punktwert sortierte Trefferliste. */
export function searchEntries(
  query: string,
  index: SearchEntry[] = LIVE_SEARCH_INDEX,
  limit = 40
): SearchEntry[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const scored: ScoredEntry[] = [];
  for (const entry of index) {
    const score = scoreEntry(entry, tokens);
    if (score > 0) scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, 'de'));
  return scored.slice(0, limit).map((item) => item.entry);
}

/** Nach Ergebnistyp gruppierte Treffer, je Gruppe höchstens `perGroup`. */
export function searchGrouped(
  query: string,
  index: SearchEntry[] = LIVE_SEARCH_INDEX,
  perGroup = 5
): SearchGroupResult[] {
  const hits = searchEntries(query, index, 200);
  return SEARCH_GROUPS.map((group) => ({
    type: group.type,
    label: group.label,
    entries: hits.filter((entry) => entry.type === group.type).slice(0, perGroup)
  })).filter((group) => group.entries.length > 0);
}

// ============================================================================
// Frequenz-Modus
// ============================================================================

const FREQUENCY_UNIT_FACTORS: Record<string, number> = {
  hz: 1,
  khz: 1e3,
  mhz: 1e6,
  ghz: 1e9,
  thz: 1e12
};

const FREQUENCY_UNIT_LABELS: Record<string, string> = {
  hz: 'Hz',
  khz: 'kHz',
  mhz: 'MHz',
  ghz: 'GHz',
  thz: 'THz'
};

export interface ParsedFrequency {
  /** Frequenz in Hertz. */
  hz: number;
  /** Eingegebene Einheit (normalisiert), z. B. 'GHz'. */
  unit: string;
  /** War die Einheit angegeben oder wurde MHz angenommen? */
  assumedUnit: boolean;
}

const FREQUENCY_PATTERN =
  /^\s*([0-9]{1,3}(?:[.\s][0-9]{3})+|[0-9]+(?:[.,][0-9]+)?)\s*(hz|khz|mhz|ghz|thz)?\s*$/i;

/**
 * Erkennt Frequenzeingaben wie „2,4 GHz", „144.800 MHz" oder „77,5 kHz".
 * Ohne Einheit wird MHz angenommen (`assumedUnit`).
 */
export function parseFrequencyQuery(query: string): ParsedFrequency | null {
  const match = FREQUENCY_PATTERN.exec(query);
  if (!match) return null;

  const raw = match[1];
  const unitKey = (match[2] ?? 'mhz').toLowerCase();
  const factor = FREQUENCY_UNIT_FACTORS[unitKey];
  if (!factor) return null;

  const value = parseLocaleNumber(raw);
  if (!Number.isFinite(value) || value <= 0) return null;

  return {
    hz: value * factor,
    unit: FREQUENCY_UNIT_LABELS[unitKey],
    assumedUnit: !match[2]
  };
}

/** Indexeinträge, deren Frequenzbereich `hz` enthält. */
export function entriesForFrequency(
  hz: number,
  index: SearchEntry[] = LIVE_SEARCH_INDEX,
  limit = 8
): SearchEntry[] {
  return index
    .filter(
      (entry) =>
        entry.minHz !== undefined &&
        entry.maxHz !== undefined &&
        hz >= entry.minHz &&
        hz <= entry.maxHz
    )
    .sort((a, b) => a.maxHz! - a.minHz! - (b.maxHz! - b.minHz!))
    .slice(0, limit);
}
