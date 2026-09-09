/**
 * Gruppierung der Kapitelblöcke für den zweispaltigen Fließtext (Bericht 74).
 *
 * Geprüft wird, dass ausschließlich zusammenhängende Absätze und Listen zu
 * einer Spaltengruppe zusammenfallen und alle übrigen Blocktypen einzeln und
 * einspaltig bleiben.
 */
import { describe, it, expect } from 'vitest';
import {
  MIN_COLUMN_CHARS,
  blockTextLength,
  groupBlocks,
  isFlowBlock
} from '$lib/components/knowledge/articleColumns';
import type { ArticleBlock } from '$lib/content/types';

const langerAbsatz: ArticleBlock = {
  type: 'paragraph',
  html: 'Wellenlänge und Frequenz. '.repeat(30)
};

const kurzerAbsatz: ArticleBlock = { type: 'paragraph', html: 'Kurz.' };

const liste: ArticleBlock = { type: 'list', items: ['Erstens', 'Zweitens'] };

const tabelle: ArticleBlock = {
  type: 'table',
  columns: ['Band', 'Bereich'],
  rows: [['VHF', '30–300 MHz']]
};

const widget: ArticleBlock = { type: 'widget', id: 'doppler' };

describe('isFlowBlock', () => {
  it('erkennt Absätze und Listen als Fließtext', () => {
    expect(isFlowBlock(kurzerAbsatz)).toBe(true);
    expect(isFlowBlock(liste)).toBe(true);
  });

  it('schließt Tabellen, Widgets und Formeln aus', () => {
    expect(isFlowBlock(tabelle)).toBe(false);
    expect(isFlowBlock(widget)).toBe(false);
    expect(isFlowBlock({ type: 'formula', formula: 'c = f · λ', alt: 'c ist f mal Lambda' })).toBe(
      false
    );
  });
});

describe('blockTextLength', () => {
  it('zählt nur den sichtbaren Text, keine Auszeichnung', () => {
    expect(blockTextLength({ type: 'paragraph', html: '<strong>abc</strong>' })).toBe(3);
    expect(blockTextLength({ type: 'list', items: ['ab', 'cd'] })).toBe(4);
  });

  it('liefert 0 für Blöcke ohne Fließtext', () => {
    expect(blockTextLength(tabelle)).toBe(0);
  });
});

describe('groupBlocks', () => {
  it('fasst aufeinanderfolgende Absätze und Listen zu einer Spaltengruppe', () => {
    const gruppen = groupBlocks([kurzerAbsatz, liste, kurzerAbsatz]);
    expect(gruppen).toHaveLength(1);
    expect(gruppen[0].columns).toBe(true);
    expect(gruppen[0].blocks).toHaveLength(3);
  });

  it('lässt Tabellen, Widgets und Formeln einspaltig und einzeln stehen', () => {
    const gruppen = groupBlocks([kurzerAbsatz, kurzerAbsatz, tabelle, widget, langerAbsatz]);
    expect(gruppen.map((g) => g.columns)).toEqual([true, false, false, true]);
    expect(gruppen[1].blocks).toEqual([tabelle]);
    expect(gruppen[2].blocks).toEqual([widget]);
  });

  it('spaltet einen einzelnen kurzen Absatz nicht', () => {
    const gruppen = groupBlocks([kurzerAbsatz]);
    expect(gruppen).toHaveLength(1);
    expect(gruppen[0].columns).toBe(false);
  });

  it('spaltet einen einzelnen langen Absatz', () => {
    expect(blockTextLength(langerAbsatz)).toBeGreaterThanOrEqual(MIN_COLUMN_CHARS);
    expect(groupBlocks([langerAbsatz])[0].columns).toBe(true);
  });

  it('vergibt eindeutige Schlüssel und behält die Reihenfolge', () => {
    const gruppen = groupBlocks([kurzerAbsatz, tabelle, kurzerAbsatz]);
    expect(gruppen.map((g) => g.key)).toEqual([0, 1, 2]);
    expect(gruppen.flatMap((g) => g.blocks)).toEqual([kurzerAbsatz, tabelle, kurzerAbsatz]);
  });

  it('kommt mit einer leeren Blockliste zurecht', () => {
    expect(groupBlocks([])).toEqual([]);
  });
});
