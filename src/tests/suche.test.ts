/**
 * Logik der Suchseite `/suche/`: Gruppierung, Typfilter, Zähler,
 * Frequenz-Modus und Vorschläge.
 */

import { describe, it, expect } from 'vitest';
import {
  MAX_RESULTS,
  SEARCH_SUGGESTIONS,
  countEntries,
  filterGroups,
  frequencyResult,
  resultGroups,
  searchPageHref
} from '../routes/suche/searchPage';
import { SEARCH_GROUPS, LIVE_SEARCH_INDEX } from '$lib/data/searchIndex';
import { allResultsHref, allResultsItem, ALL_RESULTS_ID, buildGroups } from '$lib/components/layout/commandPalette.svelte';
import { findNode } from '$lib/data/navigation';

describe('resultGroups', () => {
  it('gruppiert in der Reihenfolge der Ergebnisgruppen', () => {
    const groups = resultGroups('radar');
    expect(groups.length).toBeGreaterThan(1);
    const order = SEARCH_GROUPS.map((group) => group.type);
    const indices = groups.map((group) => order.indexOf(group.type));
    expect([...indices].sort((a, b) => a - b)).toEqual(indices);
  });

  it('lässt leere Gruppen weg und zählt vollständig', () => {
    const groups = resultGroups('radar');
    for (const group of groups) {
      expect(group.entries.length).toBeGreaterThan(0);
      expect(group.entries.every((entry) => entry.type === group.type)).toBe(true);
    }
    // Die Palette zeigt je Gruppe höchstens fünf Treffer, die Seite alle.
    expect(countEntries(groups)).toBeGreaterThan(5);
    expect(countEntries(groups)).toBeLessThanOrEqual(MAX_RESULTS);
  });

  it('liefert für leere und unbekannte Anfragen nichts', () => {
    expect(resultGroups('')).toEqual([]);
    expect(resultGroups('   ')).toEqual([]);
    expect(resultGroups('zzzzqqqq')).toEqual([]);
    expect(countEntries([])).toBe(0);
  });

  it('findet die Widgets eines Kapitels', () => {
    const groups = resultGroups('Fresnel');
    const widgets = groups.find((group) => group.type === 'widget');
    expect(widgets?.entries.some((entry) => entry.href.includes('?w=fresnel'))).toBe(true);
  });
});

describe('filterGroups', () => {
  const groups = resultGroups('radar');

  it('zeigt ohne Filter alle Gruppen', () => {
    expect(filterGroups(groups, null)).toEqual(groups);
  });

  it('beschränkt auf einen Ergebnistyp', () => {
    const gefiltert = filterGroups(groups, 'band');
    expect(gefiltert.every((group) => group.type === 'band')).toBe(true);
    expect(countEntries(gefiltert)).toBeLessThanOrEqual(countEntries(groups));
  });

  it('liefert für einen Typ ohne Treffer eine leere Liste', () => {
    expect(filterGroups(resultGroups('Fresnel'), 'sender')).toEqual([]);
  });
});

describe('frequencyResult', () => {
  it('erkennt eine Frequenz und bietet vier Sprünge an', () => {
    const result = frequencyResult('2,4 GHz');
    expect(result?.parsed.hz).toBeCloseTo(2.4e9);
    expect(result?.actions).toHaveLength(4);
    expect(result?.matches.length).toBeGreaterThan(0);
    expect(
      result?.matches.every((entry) => entry.minHz! <= 2.4e9 && entry.maxHz! >= 2.4e9)
    ).toBe(true);
  });

  it('nimmt ohne Einheit Megahertz an', () => {
    const result = frequencyResult('433');
    expect(result?.parsed.hz).toBeCloseTo(433e6);
    expect(result?.parsed.assumedUnit).toBe(true);
  });

  it('bleibt bei Textanfragen leer', () => {
    expect(frequencyResult('radar')).toBeNull();
    expect(frequencyResult('')).toBeNull();
  });
});

describe('Vorschläge', () => {
  it('führen zu Treffern oder in den Frequenz-Modus', () => {
    for (const suggestion of SEARCH_SUGGESTIONS) {
      const treffer = countEntries(resultGroups(suggestion.query, LIVE_SEARCH_INDEX));
      const frequenz = frequencyResult(suggestion.query);
      expect(treffer > 0 || frequenz !== null, suggestion.query).toBe(true);
    }
  });

  it('bauen einen gültigen Link auf die Suchseite', () => {
    expect(searchPageHref('2,4 GHz')).toBe('/suche/?q=2%2C4%20GHz');
    const url = new URL(searchPageHref('Fresnel'), 'https://example.org');
    expect(url.pathname).toBe('/suche/');
    expect(url.searchParams.get('q')).toBe('Fresnel');
  });
});

describe('„Alle Ergebnisse zeigen" in der Palette', () => {
  it('führt auf die Suchseite mit derselben Anfrage', () => {
    const item = allResultsItem('2,4 GHz');
    expect(item.id).toBe(ALL_RESULTS_ID);
    expect(item.href).toBe(allResultsHref('2,4 GHz'));
    const url = new URL(item.href, 'https://example.org');
    expect(url.pathname).toBe('/suche/');
    expect(url.searchParams.get('q')).toBe('2,4 GHz');
  });

  it('steht am Ende der Trefferliste', () => {
    const groups = buildGroups('radar', []);
    const last = groups.at(-1);
    expect(last?.items).toHaveLength(1);
    expect(last?.items[0].id).toBe(ALL_RESULTS_ID);
  });

  it('erscheint nicht ohne Treffer und nicht ohne Anfrage', () => {
    expect(buildGroups('zzzzqqqq', [])).toEqual([]);
    expect(buildGroups('', [])).toEqual([]);
  });

  it('zielt auf eine Seite, die es gibt', () => {
    expect(findNode('/suche/')?.status).toBe('live');
  });
});
