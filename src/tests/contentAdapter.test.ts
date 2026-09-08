/**
 * Übersetzung der Funktechnik-Textbausteine auf das kanonische Kapitelmodell
 * (`$lib/content/funktechnik/adapt.ts`). Seit der Zusammenführung der beiden
 * Artikel-Layouts rendert `knowledge/ArticleSection.svelte` auch diese Seiten.
 */

import { describe, it, expect } from 'vitest';
import { articleSection, articleSections, toArticleBlock } from '$lib/content/funktechnik/adapt';
import { SECTIONS as FUNKDIENSTE } from '$lib/content/funktechnik/funkdienste';
import { SECTIONS as AMATEURFUNK } from '$lib/content/funktechnik/amateurfunk';
import { SECTIONS as MOBILFUNK } from '$lib/content/funktechnik/mobilfunk';
import { SECTIONS as RUNDFUNK } from '$lib/content/funktechnik/rundfunk';
import { SECTIONS as NOTFREQUENZEN } from '$lib/content/funktechnik/notfrequenzen';
import { SECTIONS as QUELLEN } from '$lib/content/funktechnik/quellen';
import type { ArticleSection as FunkSection } from '$lib/content/funktechnik/types';

const ALLE: [string, FunkSection[]][] = [
  ['funkdienste', FUNKDIENSTE],
  ['amateurfunk', AMATEURFUNK],
  ['mobilfunk', MOBILFUNK],
  ['rundfunk', RUNDFUNK],
  ['notfrequenzen', NOTFREQUENZEN],
  ['quellen', QUELLEN]
];

describe('toArticleBlock', () => {
  it('übersetzt Absätze', () => {
    expect(toArticleBlock({ kind: 'p', text: 'Text' })).toEqual({
      type: 'paragraph',
      html: 'Text'
    });
  });

  it('unterscheidet geordnete und ungeordnete Listen', () => {
    expect(toArticleBlock({ kind: 'ul', items: ['a'] })).toEqual({ type: 'list', items: ['a'] });
    expect(toArticleBlock({ kind: 'ol', items: ['a'] })).toEqual({
      type: 'list',
      ordered: true,
      items: ['a']
    });
  });

  it('setzt Begriffslisten auf die Variante „term"', () => {
    expect(
      toArticleBlock({ kind: 'dl', items: [{ term: 'Ensemble', def: 'Alle Programme' }] })
    ).toEqual({
      type: 'definitions',
      variant: 'term',
      items: [{ term: 'Ensemble', description: 'Alle Programme' }]
    });
  });

  it('behält Ton, Titel und Quelle eines Hinweiskastens', () => {
    expect(
      toArticleBlock({
        kind: 'callout',
        tone: 'warning',
        title: 'Achtung',
        text: 'Inhalt',
        source: 'VO Funk'
      })
    ).toEqual({
      type: 'callout',
      tone: 'warning',
      title: 'Achtung',
      html: 'Inhalt',
      source: 'VO Funk'
    });
  });

  it('behält Formel, Alternativtext und Legende', () => {
    const block = toArticleBlock({
      kind: 'formula',
      formula: 'B = 2 · (Δf + f_max)',
      alt: 'B gleich zwei mal Klammer auf Delta f plus f max Klammer zu',
      label: 'Carson',
      number: '(1)',
      variables: [{ symbol: 'B', meaning: 'Bandbreite', unit: 'Hz' }]
    });
    expect(block).toMatchObject({ type: 'formula', label: 'Carson', number: '(1)' });
    expect(block).toHaveProperty('variables.0.unit', 'Hz');
  });

  it('macht aus dem Tabellenkopf die Spaltenüberschriften', () => {
    expect(
      toArticleBlock({
        kind: 'table',
        caption: 'Bänder',
        head: ['Band', 'MHz'],
        rows: [['2 m', '144']]
      })
    ).toEqual({
      type: 'table',
      caption: 'Bänder',
      columns: ['Band', 'MHz'],
      rows: [['2 m', '144']]
    });
  });
});

describe('toArticleSection', () => {
  it.each(ALLE)('%s: übersetzt alle Abschnitte verlustfrei', (_name, sections) => {
    const uebersetzt = articleSections(sections);
    expect(uebersetzt).toHaveLength(sections.length);
    for (const [index, section] of sections.entries()) {
      expect(uebersetzt[index].id).toBe(section.id);
      expect(uebersetzt[index].title).toBe(section.title);
      expect(uebersetzt[index].blocks).toHaveLength(section.blocks.length);
    }
  });

  it.each(ALLE)('%s: erzeugt nur bekannte Blocktypen', (_name, sections) => {
    const erlaubt = new Set(['paragraph', 'list', 'formula', 'callout', 'table', 'definitions']);
    for (const section of articleSections(sections)) {
      for (const block of section.blocks) {
        expect(erlaubt.has(block.type), `${section.id}: ${block.type}`).toBe(true);
      }
    }
  });

  it('übernimmt die Zeile über der Überschrift', () => {
    const erster = articleSections(FUNKDIENSTE)[0];
    expect(erster.eyebrow).toBe(FUNKDIENSTE[0].eyebrow);
  });
});

describe('articleSection', () => {
  it('schlägt einen Abschnitt nach', () => {
    expect(articleSection(FUNKDIENSTE, 'begriff').id).toBe('begriff');
  });

  it('wirft bei unbekannter Kennung', () => {
    expect(() => articleSection(FUNKDIENSTE, 'gibt-es-nicht')).toThrow(/gibt-es-nicht/);
  });
});
