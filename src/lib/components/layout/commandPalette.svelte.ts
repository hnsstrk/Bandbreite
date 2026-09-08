/**
 * Logik der Command-Palette: Ergebnismodell, Frequenz-Aktionen und der
 * „Zuletzt besucht"-Verlauf. Ausgelagert, damit die Komponente unter der
 * 300-Zeilen-Grenze bleibt.
 */

import { browser } from '$app/environment';
import { searchGrouped, parseFrequencyQuery, entriesForFrequency } from '$lib/utils/search';
import type { SearchEntry } from '$lib/data/searchIndex';
import { formatFrequency } from '$lib/utils/formatting';

export interface PaletteItem {
  id: string;
  label: string;
  sublabel?: string;
  href: string;
}

export interface PaletteGroup {
  label: string;
  items: PaletteItem[];
}

export const RECENTS_KEY = 'bandbreite:zuletzt-besucht';
export const MAX_RECENTS = 5;

export function toPaletteItem(entry: SearchEntry): PaletteItem {
  return {
    id: entry.id,
    label: entry.title,
    sublabel: entry.subtitle,
    href: entry.href
  };
}

/** Aktionen des Frequenz-Modus für eine erkannte Frequenz. */
export function frequencyActions(hz: number): PaletteItem[] {
  const label = formatFrequency(hz, 3);
  return [
    {
      id: 'freq:baender',
      label: `Bänder für ${label} anzeigen`,
      sublabel: 'Frequenzbänder-Datenbank',
      href: '/datenbanken/frequenzbaender/'
    },
    { id: 'freq:spektrum', label: 'Im Spektrum öffnen', sublabel: 'Spektrum-Dashboard', href: '/spektrum/' },
    {
      id: 'freq:wellenlaenge',
      label: 'Wellenlänge berechnen',
      sublabel: 'Frequenz ↔ Wellenlänge',
      href: '/konverter/frequenz/'
    },
    {
      id: 'freq:fspl',
      label: 'FSPL-Rechner mit dieser Frequenz',
      sublabel: 'Freiraumdämpfung berechnen',
      href: `/rechner/fspl/?f=${Math.round(hz)}`
    }
  ];
}

/** Vollständige, gruppierte Ergebnisliste für eine Eingabe. */
export function buildGroups(query: string, recents: PaletteItem[]): PaletteGroup[] {
  if (!query.trim()) {
    return recents.length > 0 ? [{ label: 'Zuletzt besucht', items: recents }] : [];
  }

  const groups: PaletteGroup[] = [];
  const frequency = parseFrequencyQuery(query);

  if (frequency) {
    const suffix = frequency.assumedUnit ? ' (MHz angenommen)' : '';
    groups.push({
      label: `Frequenz ${formatFrequency(frequency.hz, 3)}${suffix}`,
      items: frequencyActions(frequency.hz)
    });
    const matches = entriesForFrequency(frequency.hz).map(toPaletteItem);
    if (matches.length > 0) {
      groups.push({ label: 'Passende Bänder und Dienste', items: matches });
    }
  }

  for (const group of searchGrouped(query)) {
    groups.push({ label: group.label, items: group.entries.map(toPaletteItem) });
  }

  return groups;
}

/** Verlauf aus dem localStorage lesen — nie werfend, SSR-sicher. */
export function readRecents(): PaletteItem[] {
  if (!browser) return [];
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as PaletteItem[]).slice(0, MAX_RECENTS) : [];
  } catch {
    return [];
  }
}

/** Eintrag an den Anfang des Verlaufs setzen und den neuen Verlauf liefern. */
export function rememberRecent(item: PaletteItem): PaletteItem[] {
  if (!browser) return [];
  const next = [item, ...readRecents().filter((entry) => entry.href !== item.href)].slice(
    0,
    MAX_RECENTS
  );
  try {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* localStorage nicht verfügbar — der Verlauf ist optional */
  }
  return next;
}

/** Steht der Fokus in einem Eingabefeld? */
export function isTypingTarget(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) return false;
  const tag = element.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || element.isContentEditable;
}
