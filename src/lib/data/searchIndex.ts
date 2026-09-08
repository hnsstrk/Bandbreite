/**
 * Statischer Suchindex für die Command-Palette.
 *
 * Der Index wird zur Build-Zeit aus den vorhandenen Datenmodulen aufgebaut —
 * es gibt keinen Server und keine zusätzliche Abhängigkeit. Quellen sind der
 * Navigationsbaum, die Frequenzbänder, die Funkdienste, die Senderdatenbank
 * und die Glossareinträge aus `explanations.ts`.
 */

import { findNode, flattenNav, type NavNode, type NavStatus } from './navigation';
import { ALL_FREQUENCY_BANDS, type FrequencyBandCategory } from './frequencyBands';
import { ALL_APPLICATIONS, CATEGORY_NAMES } from './applications';
import { ALL_TRANSMITTERS, TYPE_NAMES } from './transmitters';
import {
  fsplExplanations,
  linkBudgetExplanations,
  bandExplanations,
  atmosphericExplanations,
  spectrumExplanations,
  type Explanation
} from './explanations';
import { GLOSSARY, GLOSSARY_COVERED_TITLES, categoryLabel } from './glossary';
import { WIDGET_ENTRIES, widgetHref, type WidgetMeta } from './widgets';
import { formatFrequency } from '$lib/utils/formatting';
import { formatFrequencyRange } from '$lib/data/bands';

export type SearchEntryType =
  'seite' | 'werkzeug' | 'widget' | 'band' | 'funkdienst' | 'sender' | 'glossar';

export interface SearchEntry {
  id: string;
  type: SearchEntryType;
  title: string;
  subtitle?: string;
  href: string;
  keywords: string[];
  status: NavStatus;
  /** Repräsentative Frequenz bzw. Bandgrenzen in Hz (für den Frequenz-Modus). */
  minHz?: number;
  maxHz?: number;
}

/** Anzeigenamen und Reihenfolge der Ergebnisgruppen. */
export const SEARCH_GROUPS: { type: SearchEntryType; label: string }[] = [
  { type: 'werkzeug', label: 'Werkzeuge' },
  { type: 'seite', label: 'Seiten' },
  { type: 'widget', label: 'Widgets' },
  { type: 'band', label: 'Frequenzbänder' },
  { type: 'funkdienst', label: 'Funkdienste' },
  { type: 'sender', label: 'Sender' },
  { type: 'glossar', label: 'Begriffe' }
];

const TOOL_PREFIXES = ['/rechner/', '/konverter/'];

const BAND_CATEGORY_LABELS: Record<FrequencyBandCategory, string> = {
  itu: 'ITU-Band',
  ieee: 'IEEE-Band',
  nato: 'NATO-Band',
  amateur: 'Amateurfunkband',
  broadcast: 'Rundfunkband'
};

function navEntry(node: NavNode): SearchEntry {
  const isTool =
    TOOL_PREFIXES.some((prefix) => node.href.startsWith(prefix)) && node.href.split('/').length > 3;
  return {
    id: `nav:${node.id}`,
    type: isTool ? 'werkzeug' : 'seite',
    title: node.label,
    subtitle: node.description,
    href: node.href,
    keywords: node.keywords ?? [],
    status: node.status
  };
}

/**
 * Mittenfrequenz eines Bandes für den Sprung in die Datenbank.
 * Geometrisch gemittelt, weil Bänder über Dekaden laufen — das arithmetische
 * Mittel läge sonst am oberen Rand.
 */
function bandCenterHz(minHz: number, maxHz: number): number {
  return Math.round(Math.sqrt(Math.max(minHz, 1) * Math.max(maxHz, 1)));
}

function bandEntry(band: (typeof ALL_FREQUENCY_BANDS)[number]): SearchEntry {
  return {
    id: `band:${band.id}`,
    type: 'band',
    title: band.nameDE,
    subtitle: `${BAND_CATEGORY_LABELS[band.category]} · ${formatFrequencyRange(band.frequencyHz.min, band.frequencyHz.max)}`,
    // Die Frequenzsuche der Datenbank startet in der Mitte des Bandes.
    href: `/datenbanken/frequenzbaender/?f=${bandCenterHz(band.frequencyHz.min, band.frequencyHz.max)}`,
    keywords: [band.name, band.id, ...(band.applicationsDE ?? []).slice(0, 6)],
    status: 'live',
    minHz: band.frequencyHz.min,
    maxHz: band.frequencyHz.max
  };
}

function applicationEntry(app: (typeof ALL_APPLICATIONS)[number]): SearchEntry {
  return {
    id: `app:${app.id}`,
    type: 'funkdienst',
    title: app.nameDE,
    subtitle: `${CATEGORY_NAMES[app.category]?.nameDE ?? app.category} · ${formatFrequencyRange(app.minHz, app.maxHz)}`,
    // Die Funkdienst-Datenbank übernimmt `?q=` als Suchbegriff und findet
    // damit genau diesen Eintrag.
    href: `/datenbanken/funkdienste/?q=${encodeURIComponent(app.id)}`,
    keywords: [app.id, app.name, app.standard ?? '', app.descriptionDE ?? ''].filter(Boolean),
    status: 'live',
    minHz: app.minHz,
    maxHz: app.maxHz
  };
}

function transmitterEntry(tx: (typeof ALL_TRANSMITTERS)[number]): SearchEntry {
  return {
    id: `tx:${tx.id}`,
    type: 'sender',
    title: tx.nameDE,
    subtitle: `${TYPE_NAMES[tx.type]?.nameDE ?? tx.type} · ${formatFrequency(tx.frequencyHz, 1)} · ${tx.location.name}`,
    // Die Senderdatenbank öffnet die Detailtafel des Eintrags über `?id=`.
    href: `/datenbanken/sender/?id=${encodeURIComponent(tx.id)}`,
    keywords: [tx.name, tx.location.country, tx.operator ?? ''].filter(Boolean),
    status: 'live',
    minHz: tx.frequencyHz,
    maxHz: tx.frequencyHz
  };
}

/**
 * Interaktive Widgets der Wissen-Kapitel. Der Link springt über `?w=<id>` in
 * das Kapitel und direkt an das Widget (`ArticleLayout` scrollt dorthin).
 *
 * Ein Widget, dessen Kapitel (noch) keinen Knoten im Navigationsbaum hat,
 * gilt als `geplant` und bleibt damit aus dem Live-Index — der Link führte
 * sonst ins Leere.
 */
function widgetEntry(meta: WidgetMeta): SearchEntry {
  const chapter = findNode(meta.chapterHref);
  return {
    id: `widget:${meta.id}`,
    type: 'widget',
    title: meta.label,
    subtitle: chapter ? `Widget · ${chapter.label}` : 'Widget',
    href: widgetHref(meta),
    keywords: [meta.id, 'Widget', 'interaktiv', ...meta.keywords, chapter?.label ?? ''].filter(
      Boolean
    ),
    status: chapter ? chapter.status : 'geplant'
  };
}

/** Glossarbegriffe mit dem Ort, an dem sie erklärt werden. */
const GLOSSARY_SOURCES: { entries: Record<string, Explanation>; href: string }[] = [
  { entries: fsplExplanations, href: '/rechner/fspl/' },
  { entries: linkBudgetExplanations, href: '/rechner/link-budget/' },
  { entries: bandExplanations, href: '/datenbanken/frequenzbaender/' },
  { entries: atmosphericExplanations, href: '/wissen/wellenausbreitung/daempfung/' },
  { entries: spectrumExplanations, href: '/spektrum/' }
];

function glossaryEntries(): SearchEntry[] {
  const seen = new Set<string>();
  const result: SearchEntry[] = [];
  for (const source of GLOSSARY_SOURCES) {
    for (const [key, explanation] of Object.entries(source.entries)) {
      // Begriffe, die das Glossar bereits führt, erscheinen nur einmal.
      if (GLOSSARY_COVERED_TITLES.has(explanation.title)) continue;
      if (seen.has(explanation.title)) continue;
      seen.add(explanation.title);
      result.push({
        id: `glossar:${key}`,
        type: 'glossar',
        title: explanation.title,
        subtitle: explanation.short,
        href: source.href,
        keywords: [key],
        status: 'live'
      });
    }
  }
  return result;
}

/**
 * Glossarbegriffe der Glossarseite. Der Link setzt zugleich den Suchtext,
 * damit der Eintrag auch nach dem Sprung sichtbar gefiltert ist.
 */
function glossaryTermEntries(): SearchEntry[] {
  return GLOSSARY.map((entry) => ({
    id: `begriff:${entry.id}`,
    type: 'glossar' as const,
    title: entry.term,
    subtitle: `${categoryLabel(entry.category)} · ${entry.short}`,
    href: `/wissen/glossar/?q=${encodeURIComponent(entry.term)}#${entry.id}`,
    keywords: [entry.id, ...(entry.synonyms ?? []), entry.unit ?? ''].filter(Boolean),
    status: 'live' as const
  }));
}

/** Vollständiger Suchindex. */
export const SEARCH_INDEX: SearchEntry[] = [
  ...flattenNav()
    .filter((node) => !node.hidden)
    .map(navEntry),
  ...WIDGET_ENTRIES.map(widgetEntry),
  ...ALL_FREQUENCY_BANDS.map(bandEntry),
  ...ALL_APPLICATIONS.map(applicationEntry),
  ...ALL_TRANSMITTERS.map(transmitterEntry),
  ...glossaryTermEntries(),
  ...glossaryEntries()
];

/** Nur Einträge, deren Ziel existiert. */
export const LIVE_SEARCH_INDEX: SearchEntry[] = SEARCH_INDEX.filter(
  (entry) => entry.status === 'live'
);
