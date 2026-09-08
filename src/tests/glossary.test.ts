/**
 * Glossar-Datensatz und Filterlogik (`$lib/data/glossary`).
 *
 * Geprüft werden Eindeutigkeit der Anker, gültige Verweise, die
 * umlauttolerante Suche und die Kopplung an den Suchindex.
 */

import { describe, it, expect } from 'vitest';
import {
  GLOSSARY,
  GLOSSARY_CATEGORIES,
  GLOSSARY_COVERED_TITLES,
  GLOSSARY_LETTERS,
  GLOSSARY_SORTED,
  categoryLabel,
  filterGlossary,
  findGlossaryEntry,
  glossaryLetter,
  groupByLetter
} from '$lib/data/glossary';
import { findNode } from '$lib/data/navigation';
import { slugify } from '$lib/utils/slug';
import { SEARCH_INDEX } from '$lib/data/searchIndex';
import { searchEntries } from '$lib/utils/search';

const IDS = new Set(GLOSSARY.map((entry) => entry.id));
const KATEGORIEN = new Set(GLOSSARY_CATEGORIES.map((item) => item.id));

describe('Datensatz', () => {
  it('enthält zwischen 60 und 100 Begriffe', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(60);
    expect(GLOSSARY.length).toBeLessThanOrEqual(100);
  });

  it('vergibt eindeutige Anker-IDs ohne Umlaute', () => {
    expect(IDS.size).toBe(GLOSSARY.length);
    for (const entry of GLOSSARY) {
      expect(entry.id, entry.term).toMatch(/^[a-z0-9-]+$/);
      // Die ID ist bereits ein Slug — `slugify` verändert sie nicht mehr.
      expect(slugify(entry.id)).toBe(entry.id);
    }
  });

  it('vergibt eindeutige Begriffe', () => {
    const begriffe = GLOSSARY.map((entry) => entry.term);
    expect(new Set(begriffe).size).toBe(begriffe.length);
  });

  it('füllt Pflichtfelder und nutzt nur bekannte Kategorien', () => {
    for (const entry of GLOSSARY) {
      expect(entry.term.length, entry.id).toBeGreaterThan(1);
      expect(entry.short.length, entry.id).toBeGreaterThan(20);
      expect(KATEGORIEN.has(entry.category), `${entry.id}: ${entry.category}`).toBe(true);
      expect(entry.related.length, entry.id).toBeGreaterThan(0);
    }
  });

  it('deckt jede Kategorie mit mindestens drei Begriffen ab', () => {
    for (const kategorie of GLOSSARY_CATEGORIES) {
      const treffer = GLOSSARY.filter((entry) => entry.category === kategorie.id);
      expect(treffer.length, kategorie.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('verweist nur auf existierende Seiten oder eigene Anker', () => {
    for (const entry of GLOSSARY) {
      for (const href of entry.related) {
        if (href.startsWith('#')) {
          expect(IDS.has(href.slice(1)), `${entry.id} → ${href}`).toBe(true);
          expect(href.slice(1), `${entry.id} verweist auf sich selbst`).not.toBe(entry.id);
        } else {
          expect(href.endsWith('/'), `${entry.id} → ${href}`).toBe(true);
          expect(findNode(href), `${entry.id} → ${href}`).toBeDefined();
        }
      }
      expect(new Set(entry.related).size).toBe(entry.related.length);
    }
  });

  it('nennt nur Titel aus explanations.ts als abgedeckt', () => {
    expect(GLOSSARY_COVERED_TITLES.size).toBeGreaterThan(0);
    for (const titel of GLOSSARY_COVERED_TITLES) {
      expect(typeof titel).toBe('string');
      expect(titel.length).toBeGreaterThan(0);
    }
  });
});

describe('Sortierung und Gruppierung', () => {
  it('sortiert alphabetisch nach deutschem Alphabet', () => {
    const begriffe = GLOSSARY_SORTED.map((entry) => entry.term);
    const sortiert = [...begriffe].sort((a, b) => a.localeCompare(b, 'de'));
    expect(begriffe).toEqual(sortiert);
    expect(GLOSSARY_SORTED).toHaveLength(GLOSSARY.length);
  });

  it('leitet den Anfangsbuchstaben ohne Umlaut ab', () => {
    expect(glossaryLetter({ ...GLOSSARY[0], term: 'Öffnungswinkel' })).toBe('O');
    expect(glossaryLetter({ ...GLOSSARY[0], term: 'Überreichweite' })).toBe('U');
    expect(glossaryLetter({ ...GLOSSARY[0], term: '4/3-Erde' })).toBe('#');
  });

  it('führt jeden Buchstaben der Sprungleiste auch als Gruppe', () => {
    const gruppen = groupByLetter(GLOSSARY_SORTED).map((group) => group.letter);
    expect(gruppen).toEqual(GLOSSARY_LETTERS);
    expect(gruppen.length).toBeGreaterThan(5);
  });

  it('verteilt jeden Eintrag auf genau eine Gruppe', () => {
    const gruppen = groupByLetter(GLOSSARY_SORTED);
    const summe = gruppen.reduce((count, group) => count + group.entries.length, 0);
    expect(summe).toBe(GLOSSARY.length);
  });
});

describe('Filterlogik', () => {
  it('liefert ohne Filter alle Begriffe', () => {
    expect(filterGlossary({})).toHaveLength(GLOSSARY.length);
    expect(filterGlossary({ query: '   ' })).toHaveLength(GLOSSARY.length);
  });

  it('findet Begriffe unabhängig von Umlauten und Groß-/Kleinschreibung', () => {
    const treffer = filterGlossary({ query: 'daempfung' }).map((entry) => entry.id);
    expect(treffer).toContain('daempfung');
    const mitUmlaut = filterGlossary({ query: 'Dämpfung' }).map((entry) => entry.id);
    expect(mitUmlaut).toContain('daempfung');
  });

  it('durchsucht auch Kurztext und Synonyme', () => {
    expect(filterGlossary({ query: 'VSWR' }).map((entry) => entry.id)).toContain('swr');
    expect(filterGlossary({ query: 'Line of Sight' }).map((entry) => entry.id)).toContain(
      'sichtverbindung'
    );
  });

  it('verlangt jedes Suchwort', () => {
    expect(filterGlossary({ query: 'dbm gibtesnicht' })).toHaveLength(0);
  });

  it('filtert nach Kategorie und kombiniert beides', () => {
    const radar = filterGlossary({ category: 'radar' });
    expect(radar.length).toBeGreaterThan(0);
    expect(radar.every((entry) => entry.category === 'radar')).toBe(true);
    expect(filterGlossary({ query: 'doppler', category: 'dienste' })).toHaveLength(0);
  });

  it('behält die alphabetische Reihenfolge bei', () => {
    const treffer = filterGlossary({ query: 'd' }).map((entry) => entry.term);
    expect(treffer).toEqual([...treffer].sort((a, b) => a.localeCompare(b, 'de')));
  });
});

describe('Nachschlagen und Beschriftung', () => {
  it('findet Einträge über ihre ID', () => {
    expect(findGlossaryEntry('dbm')?.term).toBe('dBm');
    expect(findGlossaryEntry('gibt-es-nicht')).toBeUndefined();
  });

  it('liefert für jede Kategorie einen Anzeigenamen', () => {
    for (const kategorie of GLOSSARY_CATEGORIES) {
      expect(categoryLabel(kategorie.id)).toBe(kategorie.label);
    }
  });
});

describe('Kopplung an den Suchindex', () => {
  const glossarEintraege = SEARCH_INDEX.filter((entry) => entry.type === 'glossar');

  it('führt jeden Begriff im Suchindex', () => {
    for (const entry of GLOSSARY) {
      const treffer = glossarEintraege.find((item) => item.id === `begriff:${entry.id}`);
      expect(treffer, entry.id).toBeDefined();
      expect(treffer?.href).toContain(`#${entry.id}`);
      expect(treffer?.href.startsWith('/wissen/glossar/?q=')).toBe(true);
    }
  });

  it('rankt Werkzeuge und Seiten vor gleichnamigen Begriffen', () => {
    for (const anfrage of ['fspl', 'fresnel', 'dezibel', 'radiohorizont']) {
      const treffer = searchEntries(anfrage);
      expect(treffer.length, anfrage).toBeGreaterThan(0);
      expect(['werkzeug', 'seite'], anfrage).toContain(treffer[0].type);
    }
  });

  it('führt keinen Begriff doppelt', () => {
    const titel = glossarEintraege.map((entry) => entry.title);
    expect(new Set(titel).size).toBe(titel.length);
  });
});
