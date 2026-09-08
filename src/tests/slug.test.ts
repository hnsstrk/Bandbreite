import { describe, it, expect } from 'vitest';
import { slugify, transliterate, normalizeForSearch, humanizeSegment } from '$lib/utils/slug';

describe('transliterate', () => {
  it('ersetzt deutsche Umlaute durch ASCII-Paare', () => {
    expect(transliterate('Wellenlänge')).toBe('Wellenlaenge');
    expect(transliterate('Dämpfung')).toBe('Daempfung');
    expect(transliterate('Übertragung')).toBe('uebertragung');
    expect(transliterate('Größe')).toBe('Groesse');
  });

  it('entfernt Diakritika', () => {
    expect(transliterate('Résumé')).toBe('Resume');
  });
});

describe('slugify', () => {
  it('erzeugt umlautfreie Slugs', () => {
    expect(slugify('Atmosphärische Dämpfung')).toBe('atmosphaerische-daempfung');
    expect(slugify('Kanalkapazität')).toBe('kanalkapazitaet');
    expect(slugify('Frequenzbänder')).toBe('frequenzbaender');
  });

  it('behandelt Sonderzeichen und Ränder', () => {
    expect(slugify('EM-Spektrum & Bänder')).toBe('em-spektrum-und-baender');
    expect(slugify('  --Test--  ')).toBe('test');
    expect(slugify('')).toBe('');
    expect(slugify(null)).toBe('');
  });

  it('ist idempotent', () => {
    const once = slugify('Ionosphärische Ausbreitung');
    expect(slugify(once)).toBe(once);
  });
});

describe('normalizeForSearch', () => {
  it('normalisiert für Vergleiche', () => {
    expect(normalizeForSearch('Kanalkapazität')).toBe('kanalkapazitaet');
    expect(normalizeForSearch('2,4 GHz')).toBe('2 4 ghz');
    expect(normalizeForSearch(undefined)).toBe('');
  });
});

describe('humanizeSegment', () => {
  it('macht Segmente lesbar', () => {
    expect(humanizeSegment('link-budget')).toBe('Link Budget');
    expect(humanizeSegment('sender')).toBe('Sender');
    expect(humanizeSegment('')).toBe('');
  });
});
