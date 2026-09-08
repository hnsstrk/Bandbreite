import { describe, it, expect } from 'vitest';
import {
  tokenize,
  scoreEntry,
  searchEntries,
  searchGrouped,
  parseFrequencyQuery,
  entriesForFrequency
} from '$lib/utils/search';
import { SEARCH_INDEX, LIVE_SEARCH_INDEX, type SearchEntry } from '$lib/data/searchIndex';

const entry = (over: Partial<SearchEntry> = {}): SearchEntry => ({
  id: 'test',
  type: 'seite',
  title: 'Kanalkapazität',
  subtitle: 'Shannon-Hartley',
  href: '/rechner/kanalkapazitaet/',
  keywords: ['SNR', 'Bandbreite'],
  status: 'live',
  ...over
});

describe('tokenize', () => {
  it('normalisiert und zerlegt', () => {
    expect(tokenize('Atmosphärische  Dämpfung')).toEqual(['atmosphaerische', 'daempfung']);
    expect(tokenize('   ')).toEqual([]);
  });
});

describe('scoreEntry', () => {
  it('bewertet exakte Treffer am höchsten', () => {
    const exact = scoreEntry(entry(), tokenize('Kanalkapazität'));
    const prefix = scoreEntry(entry(), tokenize('Kanal'));
    const keyword = scoreEntry(entry(), tokenize('SNR'));
    const sub = scoreEntry(entry(), tokenize('Hartley'));
    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(keyword);
    expect(keyword).toBeGreaterThan(sub);
  });

  it('ist umlautunempfindlich', () => {
    expect(scoreEntry(entry(), tokenize('kanalkapazitaet'))).toBeGreaterThan(0);
    expect(scoreEntry(entry(), tokenize('KANALKAPAZITÄT'))).toBeGreaterThan(0);
  });

  it('verlangt, dass jedes Suchwort vorkommt', () => {
    expect(scoreEntry(entry(), tokenize('Kanal Radar'))).toBe(0);
    expect(scoreEntry(entry(), [])).toBe(0);
  });
});

describe('searchEntries', () => {
  it('findet Seiten und Werkzeuge', () => {
    const hits = searchEntries('fspl');
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].href).toBe('/rechner/fspl/');
  });

  it('findet Bänder', () => {
    const hits = searchEntries('X-Band');
    expect(hits.some((h) => h.type === 'band')).toBe(true);
  });

  it('liefert bei leerer Anfrage nichts', () => {
    expect(searchEntries('')).toEqual([]);
    expect(searchEntries('zzzzqqqq')).toEqual([]);
  });

  it('respektiert das Limit', () => {
    expect(searchEntries('a', LIVE_SEARCH_INDEX, 5).length).toBeLessThanOrEqual(5);
  });
});

describe('searchGrouped', () => {
  it('gruppiert nach Ergebnistyp', () => {
    const groups = searchGrouped('radar');
    expect(groups.length).toBeGreaterThan(0);
    for (const group of groups) {
      expect(group.entries.length).toBeGreaterThan(0);
      expect(group.entries.length).toBeLessThanOrEqual(5);
      expect(group.entries.every((e) => e.type === group.type)).toBe(true);
    }
  });
});

describe('parseFrequencyQuery', () => {
  it('erkennt deutsche Dezimalkommata', () => {
    expect(parseFrequencyQuery('2,4 GHz')?.hz).toBeCloseTo(2.4e9);
    expect(parseFrequencyQuery('77,5 kHz')?.hz).toBeCloseTo(77_500);
  });

  it('erkennt Punktschreibweise', () => {
    expect(parseFrequencyQuery('144.800 MHz')?.hz).toBeCloseTo(144.8e6);
    expect(parseFrequencyQuery('868MHz')?.hz).toBeCloseTo(868e6);
  });

  it('nimmt ohne Einheit MHz an', () => {
    const parsed = parseFrequencyQuery('433');
    expect(parsed?.hz).toBeCloseTo(433e6);
    expect(parsed?.assumedUnit).toBe(true);
    expect(parsed?.unit).toBe('MHz');
  });

  it('lehnt Nicht-Frequenzen ab', () => {
    expect(parseFrequencyQuery('radar')).toBeNull();
    expect(parseFrequencyQuery('2,4 Meter')).toBeNull();
    expect(parseFrequencyQuery('0 GHz')).toBeNull();
  });
});

describe('entriesForFrequency', () => {
  it('findet Bänder, die eine Frequenz enthalten', () => {
    const hits = entriesForFrequency(2.45e9);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.minHz! <= 2.45e9 && h.maxHz! >= 2.45e9)).toBe(true);
  });

  it('sortiert das engste Band zuerst', () => {
    const hits = entriesForFrequency(2.45e9, LIVE_SEARCH_INDEX, 5);
    const spans = hits.map((h) => h.maxHz! - h.minHz!);
    expect([...spans].sort((a, b) => a - b)).toEqual(spans);
  });
});

describe('SEARCH_INDEX', () => {
  it('enthält alle Quellen', () => {
    const types = new Set(SEARCH_INDEX.map((e) => e.type));
    expect(types).toEqual(new Set(['seite', 'werkzeug', 'band', 'funkdienst', 'sender', 'glossar']));
  });

  it('vergibt eindeutige IDs', () => {
    expect(new Set(SEARCH_INDEX.map((e) => e.id)).size).toBe(SEARCH_INDEX.length);
  });

  it('verlinkt ausschließlich mit Trailing Slash', () => {
    expect(SEARCH_INDEX.every((e) => e.href.endsWith('/'))).toBe(true);
  });

  it('schließt geplante Seiten aus dem Live-Index aus', () => {
    expect(LIVE_SEARCH_INDEX.every((e) => e.status === 'live')).toBe(true);
    expect(LIVE_SEARCH_INDEX.length).toBeLessThanOrEqual(SEARCH_INDEX.length);
  });
});
