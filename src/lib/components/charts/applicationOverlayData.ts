/**
 * Kategorienfarben und Zeilenlayout für {@link ApplicationOverlay}.
 *
 * Die Anwendungen selbst stehen in `data/applications.ts`; hier liegt nur,
 * wie sie über der logarithmischen Frequenzachse angeordnet werden.
 */

import {
  APPLICATIONS_BY_CATEGORY,
  CATEGORY_NAMES,
  type ApplicationCategory,
  type RFApplication
} from '$lib/data/applications';

/** Höhe eines Balkens und Abstand zwischen den Zeilen. */
export const ROW_HEIGHT = 24;
export const ROW_GAP = 4;
/** Mindestabstand zweier Balken in derselben Zeile. */
export const ROW_PADDING = 5;
/** Schmalste sichtbare Balkenbreite. */
export const MIN_BAR_WIDTH = 4;
/** Ab dieser Breite passt eine Beschriftung in den Balken. */
export const LABEL_MIN_WIDTH = 40;
/** Ab dieser Breite wird die Beschriftung größer gesetzt. */
export const LABEL_WIDE_WIDTH = 80;
/** Grobe Zeichenbreite zur Titelkürzung. */
export const CHAR_WIDTH = 7;

/** Serien-Token je Anwendungskategorie. */
export const CATEGORY_TOKENS: Record<ApplicationCategory, string> = {
  broadcast: 'var(--color-series-6)',
  mobile: 'var(--color-series-1)',
  wlan: 'var(--color-series-2)',
  satellite: 'var(--color-series-4)',
  radar: 'var(--color-series-3)',
  amateur: 'var(--color-series-9)',
  navigation: 'var(--color-series-5)',
  military: 'var(--color-series-8)',
  ism: 'var(--color-series-7)',
  pmr: 'var(--color-series-2)',
  maritime: 'var(--color-series-5)',
  aviation: 'var(--color-series-3)'
};

/** Alle Kategorien mit deutschem Namen und Token. */
export const CATEGORY_ENTRIES = (Object.keys(CATEGORY_NAMES) as ApplicationCategory[]).map(
  (category) => ({
    id: category,
    label: CATEGORY_NAMES[category].nameDE,
    token: CATEGORY_TOKENS[category]
  })
);

/** Ein platzierter Anwendungsbalken. */
export interface ApplicationRect {
  app: RFApplication;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

/**
 * Ordnet die Anwendungen zeilenweise an: jede kommt in die erste Zeile,
 * in der links von ihr genug Platz frei ist.
 */
export function layoutApplications(
  applications: RFApplication[],
  xScale: (hz: number) => number,
  minHz: number,
  maxHz: number
): ApplicationRect[] {
  const sorted = [...applications].sort((a, b) => a.minHz - b.minHz);
  const rowEnds: number[] = [];

  return sorted.map((app) => {
    const x1 = xScale(Math.max(app.minHz, minHz));
    const x2 = xScale(Math.min(app.maxHz, maxHz));

    let rowIndex = rowEnds.findIndex((endX) => x1 >= endX + ROW_PADDING);
    if (rowIndex === -1) rowIndex = rowEnds.length;
    rowEnds[rowIndex] = x2;

    return {
      app,
      x: x1,
      y: rowIndex * (ROW_HEIGHT + ROW_GAP),
      width: Math.max(x2 - x1, MIN_BAR_WIDTH),
      height: ROW_HEIGHT,
      color: CATEGORY_TOKENS[app.category]
    };
  });
}

/** Zehnerpotenzen als Achsenmarken im dargestellten Bereich. */
export function decadeTicks(minHz: number, maxHz: number): number[] {
  const ticks: number[] = [];
  for (let current = 1e3; current <= maxHz; current *= 10) {
    if (current >= minHz) ticks.push(current);
  }
  return ticks;
}

/** Anzahl der Anwendungen einer Kategorie im dargestellten Bereich. */
export function categoryCount(category: ApplicationCategory, minHz: number, maxHz: number): number {
  return APPLICATIONS_BY_CATEGORY[category].filter(
    (app) => app.maxHz >= minHz && app.minHz <= maxHz
  ).length;
}

/** Kürzt einen Namen so, dass er in den Balken passt. */
export function fitLabel(name: string, barWidth: number): string {
  const maxChars = Math.floor(barWidth / CHAR_WIDTH);
  return name.length > maxChars ? `${name.slice(0, maxChars)}…` : name;
}
