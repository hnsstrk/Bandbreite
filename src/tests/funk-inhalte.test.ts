/**
 * Struktur- und Konsistenztests der Textbausteine der Funktechnik-Kapitel.
 *
 * Geprüft wird, was die Seiten voraussetzen: eindeutige Anker, gefüllte
 * Bausteine, vollständige Tabellenzeilen und die Bausteine, auf die die
 * Routen namentlich zugreifen.
 */

import { describe, it, expect } from 'vitest';
import {
  findSection,
  sectionIds,
  tocItems,
  type ArticleSection
} from '$lib/content/funktechnik/types';
import * as funkdienste from '$lib/content/funktechnik/funkdienste';
import * as amateurfunk from '$lib/content/funktechnik/amateurfunk';
import * as mobilfunk from '$lib/content/funktechnik/mobilfunk';
import * as rundfunk from '$lib/content/funktechnik/rundfunk';
import * as notfrequenzen from '$lib/content/funktechnik/notfrequenzen';
import * as quellen from '$lib/content/funktechnik/quellen';

const PAGES: { name: string; sections: ArticleSection[]; goals?: string[] }[] = [
  { name: 'funkdienste', sections: funkdienste.SECTIONS, goals: funkdienste.LEARNING_GOALS },
  { name: 'amateurfunk', sections: amateurfunk.SECTIONS, goals: amateurfunk.LEARNING_GOALS },
  { name: 'mobilfunk', sections: mobilfunk.SECTIONS, goals: mobilfunk.LEARNING_GOALS },
  { name: 'rundfunk', sections: rundfunk.SECTIONS, goals: rundfunk.LEARNING_GOALS },
  { name: 'notfrequenzen', sections: notfrequenzen.SECTIONS, goals: notfrequenzen.LEARNING_GOALS },
  { name: 'quellen', sections: quellen.SECTIONS }
];

describe.each(PAGES)('Inhalte: $name', ({ sections, goals }) => {
  it('hat mindestens drei Abschnitte mit eindeutigen Ankern', () => {
    expect(sections.length).toBeGreaterThanOrEqual(3);
    const ids = sectionIds(sections);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('verwendet nur kleingeschriebene Anker ohne Leerzeichen', () => {
    for (const id of sectionIds(sections)) {
      expect(id).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('füllt jeden Abschnitt mit Bausteinen', () => {
    for (const section of sections) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.blocks.length).toBeGreaterThan(0);
    }
  });

  it('lässt keinen leeren Baustein zu', () => {
    for (const section of sections) {
      for (const block of section.blocks) {
        if (block.kind === 'p') expect(block.text.length).toBeGreaterThan(20);
        if (block.kind === 'ul' || block.kind === 'ol') {
          expect(block.items.length).toBeGreaterThan(1);
          expect(block.items.every((item) => item.length > 0)).toBe(true);
        }
        if (block.kind === 'dl') {
          expect(block.items.length).toBeGreaterThan(0);
          expect(block.items.every((item) => item.term && item.def)).toBe(true);
        }
        if (block.kind === 'callout') expect(block.text.length).toBeGreaterThan(20);
        if (block.kind === 'formula') {
          expect(block.formula.length).toBeGreaterThan(0);
          expect(block.alt.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('gibt jeder Tabelle so viele Zellen wie Spalten', () => {
    for (const section of sections) {
      for (const block of section.blocks) {
        if (block.kind !== 'table') continue;
        expect(block.caption.length).toBeGreaterThan(0);
        expect(block.head.length).toBeGreaterThan(1);
        for (const row of block.rows) {
          expect(row).toHaveLength(block.head.length);
        }
      }
    }
  });

  it('formuliert Lernziele, sofern die Seite welche hat', () => {
    if (!goals) return;
    expect(goals.length).toBeGreaterThanOrEqual(4);
    expect(goals.every((goal) => goal.length > 20)).toBe(true);
  });
});

describe('tocItems', () => {
  const sections: ArticleSection[] = [
    { id: 'eins', title: 'Eins', blocks: [{ kind: 'p', text: 'x' }] },
    { id: 'zwei', title: 'Zwei', level: 3, blocks: [{ kind: 'p', text: 'y' }] }
  ];

  it('übernimmt Reihenfolge und Ebene der Abschnitte', () => {
    expect(tocItems(sections)).toEqual([
      { id: 'eins', label: 'Eins', level: 2 },
      { id: 'zwei', label: 'Zwei', level: 3 }
    ]);
  });

  it('fügt Zusatzanker hinter dem genannten Abschnitt ein', () => {
    const items = tocItems(sections, [{ id: 'widget', label: 'Widget', after: 'eins' }]);
    expect(items.map((item) => item.id)).toEqual(['eins', 'widget', 'zwei']);
  });

  it('hängt Zusatzanker ohne bekannten Vorgänger hinten an', () => {
    const items = tocItems(sections, [{ id: 'widget', label: 'Widget', after: 'gibt-es-nicht' }]);
    expect(items[items.length - 1].id).toBe('widget');
  });
});

describe('findSection', () => {
  it('findet die von den Routen benannten Abschnitte', () => {
    const erwartet: Record<string, string[]> = {
      funkdienste: ['begriff', 'regionen', 'primaer-sekundaer', 'vom-vertrag-zur-zuteilung', 'frequenzplan', 'lesen'],
      amateurfunk: ['dienst', 'klassen', 'rufzeichen', 'bandplan-prinzip', 'betriebsarten', 'welches-band'],
      mobilfunk: ['zellprinzip', 'zugriffsverfahren', 'duplex', 'baender-de', 'mimo'],
      rundfunk: ['am-bereiche', 'ukw', 'dab', 'dvbt2', 'wandel'],
      notfrequenzen: ['grundidee', 'see', 'luft', 'land']
    };
    const bySeite: Record<string, ArticleSection[]> = {
      funkdienste: funkdienste.SECTIONS,
      amateurfunk: amateurfunk.SECTIONS,
      mobilfunk: mobilfunk.SECTIONS,
      rundfunk: rundfunk.SECTIONS,
      notfrequenzen: notfrequenzen.SECTIONS
    };
    for (const [seite, ids] of Object.entries(erwartet)) {
      for (const id of ids) {
        expect(findSection(bySeite[seite], id), `${seite}#${id}`).toBeDefined();
      }
    }
  });

  it('liefert für unbekannte Anker nichts', () => {
    expect(findSection(funkdienste.SECTIONS, 'gibt-es-nicht')).toBeUndefined();
  });
});

describe('Warnhinweise', () => {
  it('weist auf den Seiten mit Betriebsbezug auf die fehlende Amtlichkeit hin', () => {
    const texte = [...notfrequenzen.SECTIONS, ...quellen.SECTIONS, ...funkdienste.SECTIONS]
      .flatMap((section) => section.blocks)
      .filter((block) => block.kind === 'callout')
      .map((block) => `${block.title ?? ''} ${block.text}`.toLowerCase());
    expect(texte.some((text) => text.includes('amtlich'))).toBe(true);
    expect(texte.some((text) => text.includes('betriebsdokument'))).toBe(true);
  });
});
