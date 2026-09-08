/**
 * Statischer Suchindex für die Command-Palette.
 *
 * Der Index wird zur Build-Zeit aus den vorhandenen Datenmodulen aufgebaut —
 * es gibt keinen Server und keine zusätzliche Abhängigkeit. Quellen sind der
 * Navigationsbaum, die Frequenzbänder, die Funkdienste, die Senderdatenbank
 * und die Glossareinträge aus `explanations.ts`.
 */

import { flattenNav, type NavNode, type NavStatus } from './navigation';
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
import { formatFrequency } from '$lib/utils/formatting';
import { formatFrequencyRange } from '$lib/data/bands';

export type SearchEntryType = 'seite' | 'werkzeug' | 'band' | 'funkdienst' | 'sender' | 'glossar';

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

function bandEntry(band: (typeof ALL_FREQUENCY_BANDS)[number]): SearchEntry {
  return {
    id: `band:${band.id}`,
    type: 'band',
    title: band.nameDE,
    subtitle: `${BAND_CATEGORY_LABELS[band.category]} · ${formatFrequencyRange(band.frequencyHz.min, band.frequencyHz.max)}`,
    href: '/datenbanken/frequenzbaender/',
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
    // Ziel ist die Funkdienst-Datenbank. Ohne Query-Anhang, weil
    // `search.test.ts` für jeden Treffer einen Pfad mit Trailing Slash
    // verlangt; der Eintrag ist über seine ID in `keywords` auffindbar.
    href: '/datenbanken/funkdienste/',
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
    href: '/datenbanken/sender/',
    keywords: [tx.name, tx.location.country, tx.operator ?? ''].filter(Boolean),
    status: 'live',
    minHz: tx.frequencyHz,
    maxHz: tx.frequencyHz
  };
}

/** Glossarbegriffe mit dem Ort, an dem sie erklärt werden. */
const GLOSSARY_SOURCES: { entries: Record<string, Explanation>; href: string }[] = [
  { entries: fsplExplanations, href: '/rechner/fspl/' },
  { entries: linkBudgetExplanations, href: '/rechner/link-budget/' },
  { entries: bandExplanations, href: '/datenbanken/frequenzbaender/' },
  { entries: atmosphericExplanations, href: '/spektrum/daempfung/' },
  { entries: spectrumExplanations, href: '/spektrum/' }
];

function glossaryEntries(): SearchEntry[] {
  const seen = new Set<string>();
  const result: SearchEntry[] = [];
  for (const source of GLOSSARY_SOURCES) {
    for (const [key, explanation] of Object.entries(source.entries)) {
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

/** Vollständiger Suchindex. */
export const SEARCH_INDEX: SearchEntry[] = [
  ...flattenNav().map(navEntry),
  ...ALL_FREQUENCY_BANDS.map(bandEntry),
  ...ALL_APPLICATIONS.map(applicationEntry),
  ...ALL_TRANSMITTERS.map(transmitterEntry),
  ...glossaryEntries()
];

/** Nur Einträge, deren Ziel existiert. */
export const LIVE_SEARCH_INDEX: SearchEntry[] = SEARCH_INDEX.filter(
  (entry) => entry.status === 'live'
);
