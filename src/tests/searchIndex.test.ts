/**
 * Aufbau des Suchindex — insbesondere die Widget-Einträge und die
 * Sichtbarkeitsregel für ausgeblendete Navigationsknoten.
 *
 * Die Bewertung selbst prüft `search.test.ts`; hier geht es um die Daten:
 * Gruppen, Kennungen, Ziele.
 */

import { describe, it, expect } from 'vitest';
import {
  LIVE_SEARCH_INDEX,
  SEARCH_GROUPS,
  SEARCH_INDEX,
  type SearchEntry
} from '$lib/data/searchIndex';
import { WIDGET_ENTRIES, findWidget } from '$lib/data/widgets';
import { findNode } from '$lib/data/navigation';

const widgetEntries = SEARCH_INDEX.filter((entry) => entry.type === 'widget');
const liveWidgetEntries = LIVE_SEARCH_INDEX.filter((entry) => entry.type === 'widget');

/** Pfadteil eines Eintrags ohne Suchparameter. */
function pathOf(entry: SearchEntry): string {
  return entry.href.split('?')[0];
}

describe('Ergebnisgruppen', () => {
  it('führt die Widgets zwischen Seiten und Bändern', () => {
    const types = SEARCH_GROUPS.map((group) => group.type);
    expect(types).toContain('widget');
    expect(types.indexOf('widget')).toBeGreaterThan(types.indexOf('seite'));
    expect(types.indexOf('widget')).toBeLessThan(types.indexOf('band'));
    expect(SEARCH_GROUPS.find((group) => group.type === 'widget')?.label).toBe('Widgets');
  });

  it('deckt jede Gruppe mit mindestens einem Eintrag ab', () => {
    for (const group of SEARCH_GROUPS) {
      expect(
        LIVE_SEARCH_INDEX.some((entry) => entry.type === group.type),
        group.type
      ).toBe(true);
    }
  });
});

describe('Widget-Einträge', () => {
  it('bildet jedes Widget des Katalogs ab', () => {
    expect(widgetEntries).toHaveLength(WIDGET_ENTRIES.length);
    expect(widgetEntries.length).toBeGreaterThanOrEqual(9);
  });

  it('verlinkt Kapitel plus `?w=<id>`', () => {
    for (const entry of widgetEntries) {
      const id = entry.id.replace(/^widget:/, '');
      const meta = findWidget(id);
      expect(meta, entry.id).toBeDefined();
      const url = new URL(entry.href, 'https://example.org');
      expect(url.pathname).toBe(meta!.chapterHref);
      expect(url.pathname.endsWith('/')).toBe(true);
      expect(url.searchParams.get('w')).toBe(id);
    }
  });

  it('führt nur Widgets mit vorhandenem Kapitel im Live-Index', () => {
    expect(liveWidgetEntries.length).toBeGreaterThanOrEqual(8);
    for (const entry of liveWidgetEntries) {
      const node = findNode(pathOf(entry));
      expect(node, entry.href).toBeDefined();
      expect(node?.status).toBe('live');
    }
  });

  it('nennt Kapitel und Kennung als Stichwort', () => {
    const eintrag = liveWidgetEntries[0];
    expect(eintrag.subtitle?.startsWith('Widget · ')).toBe(true);
    expect(eintrag.keywords).toContain('Widget');
  });
});

describe('Ausgeblendete Seiten', () => {
  it('nimmt die Suchseite selbst nicht in den Index auf', () => {
    expect(SEARCH_INDEX.some((entry) => entry.href === '/suche/')).toBe(false);
    expect(findNode('/suche/')?.hidden).toBe(true);
  });
});

describe('Index insgesamt', () => {
  it('vergibt eindeutige Kennungen', () => {
    expect(new Set(SEARCH_INDEX.map((entry) => entry.id)).size).toBe(SEARCH_INDEX.length);
  });

  it('verlinkt jeden Eintrag mit Trailing Slash im Pfadteil', () => {
    for (const entry of SEARCH_INDEX) {
      expect(pathOf(entry).endsWith('/'), `${entry.id}: ${entry.href}`).toBe(true);
    }
  });

  it('führt im Live-Index nur existierende Seiten', () => {
    expect(LIVE_SEARCH_INDEX.every((entry) => entry.status === 'live')).toBe(true);
    expect(LIVE_SEARCH_INDEX.length).toBeLessThanOrEqual(SEARCH_INDEX.length);
  });
});
