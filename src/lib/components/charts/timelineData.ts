/**
 * Achsen-, Layout- und Farbberechnung für {@link HistoricalTimeline}.
 *
 * Die Ereignisse selbst stehen in `data/history.ts`; hier liegt nur, wie sie
 * über der Jahresachse angeordnet und eingefärbt werden.
 */

import {
  CATEGORY_CONFIG,
  HISTORICAL_EVENTS,
  type HistoricalEvent,
  type HistoryCategory
} from '$lib/data/history';

/** Dargestellter Zeitraum. */
export const MIN_YEAR = 1860;
export const MAX_YEAR = 2030;

/** Abstand der Jahresmarken. */
export const DECADE_STEP = 10;

/** Platzbedarf einer Ereignisbeschriftung in Pixeln. */
export const EVENT_WIDTH = 120;
/** Höhe einer Ereigniszeile in Pixeln. */
export const ROW_HEIGHT = 50;
/** Mindestabstand zweier Ereignisse in derselben Zeile. */
export const ROW_GAP = 10;

/** Kürzung langer Titel im Diagramm. */
export const TITLE_MAX_LENGTH = 20;
export const TITLE_CUT_LENGTH = 18;

/**
 * Serien-Token je Kategorie. `CATEGORY_CONFIG` in `data/history.ts` führt
 * Hex-Farben; hier werden sie auf das Token-System abgebildet, ohne die
 * Zuordnung Kategorie → Farbe zu ändern.
 */
export const CATEGORY_TOKENS: Record<HistoryCategory, string> = {
  theory: 'var(--color-series-4)',
  invention: 'var(--color-series-1)',
  broadcast: 'var(--color-series-6)',
  mobile: 'var(--color-series-2)',
  satellite: 'var(--color-series-3)',
  digital: 'var(--color-series-5)',
  telegraphy: 'var(--color-series-7)',
  navigation: 'var(--color-series-9)'
};

/** Alle Kategorien mit deutschem Namen, Token und Anzahl der Ereignisse. */
export const CATEGORY_ENTRIES = (Object.keys(CATEGORY_CONFIG) as HistoryCategory[]).map(
  (category) => ({
    id: category,
    label: CATEGORY_CONFIG[category].nameDE,
    token: CATEGORY_TOKENS[category],
    count: HISTORICAL_EVENTS.filter((event) => event.category === category).length
  })
);

/** Alle Kategorien — Ausgangszustand des Filters, damit nichts verborgen bleibt. */
export const ALL_CATEGORIES: HistoryCategory[] = CATEGORY_ENTRIES.map((entry) => entry.id);

/** Epochen als farbig hinterlegte Bänder. */
export const ERAS = [
  { id: 'discovery', startYear: 1860, endYear: 1900, label: 'Entdeckung', token: 'var(--color-series-4)' },
  { id: 'early', startYear: 1900, endYear: 1950, label: 'Frühe Funkära', token: 'var(--color-series-1)' },
  { id: 'analog', startYear: 1950, endYear: 1990, label: 'Analoge Ära', token: 'var(--color-series-2)' },
  { id: 'digital', startYear: 1990, endYear: 2030, label: 'Digitale Ära', token: 'var(--color-series-3)' }
];

/** Beschriftung der Bedeutung eines Ereignisses. */
export const SIGNIFICANCE_LABELS: Record<HistoricalEvent['significance'], string> = {
  major: 'Hoch',
  moderate: 'Mittel',
  minor: 'Gering'
};

/** Jahresmarken im Zehnerschritt. */
export function decadeTicks(): number[] {
  const ticks: number[] = [];
  for (let year = MIN_YEAR; year <= MAX_YEAR; year += DECADE_STEP) ticks.push(year);
  return ticks;
}

/** Ein platziertes Ereignis. */
export interface PlacedEvent {
  event: HistoricalEvent;
  x: number;
  y: number;
  row: number;
}

/**
 * Verteilt die Ereignisse kollisionsfrei auf Zeilen: jedes Ereignis kommt in
 * die erste Zeile, in der links davon genug Platz frei ist.
 */
export function placeEvents(
  events: HistoricalEvent[],
  xScale: (year: number) => number,
  chartHeight: number
): PlacedEvent[] {
  const placed: PlacedEvent[] = [];
  const rowEnds: number[] = [];
  const maxRows = Math.max(1, Math.floor(chartHeight / ROW_HEIGHT));

  for (const event of events) {
    const x = xScale(event.year);
    let row = rowEnds.findIndex((endX) => x > endX + ROW_GAP);
    if (row === -1) {
      row = rowEnds.length < maxRows ? rowEnds.length : placed.length % maxRows;
    }
    rowEnds[row] = x + EVENT_WIDTH;
    placed.push({ event, x, y: row * ROW_HEIGHT, row });
  }

  return placed;
}

/** Filtert die Ereignisse nach Kategorien und Bedeutung, sortiert nach Jahr. */
export function filterEvents(
  categories: Set<HistoryCategory>,
  onlyMajor: boolean
): HistoricalEvent[] {
  return HISTORICAL_EVENTS.filter(
    (event) =>
      categories.has(event.category) && (!onlyMajor || event.significance === 'major')
  ).sort((a, b) => a.year - b.year);
}

/** Kürzt einen Titel für die Darstellung im Diagramm. */
export function shortTitle(title: string): string {
  return title.length > TITLE_MAX_LENGTH ? `${title.slice(0, TITLE_CUT_LENGTH)}…` : title;
}
