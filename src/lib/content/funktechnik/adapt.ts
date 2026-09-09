/**
 * Brücke vom Blockmodell der Funktechnik-Kapitel auf das kanonische
 * Kapitelmodell in `$lib/content/types.ts`.
 *
 * Die Funktechnik-Texte liegen in einem eigenen, knapperen Datenmodell
 * (`kind: 'p' | 'ul' | …`). Gerendert werden sie inzwischen von denselben
 * Komponenten wie alle übrigen Wissen-Kapitel (`knowledge/ArticleSection`).
 * Diese Datei übersetzt zwischen beiden Modellen — eine reine Funktion ohne
 * DOM-Bezug, damit sie in `src/tests/funk-inhalte.test.ts` prüfbar bleibt.
 */
import type { ArticleBlock, ArticleSection } from '$lib/content/types';
import type { ContentBlock, ArticleSection as FunkSection } from './types';

/** Übersetzt einen einzelnen Baustein. */
export function toArticleBlock(block: ContentBlock): ArticleBlock {
  switch (block.kind) {
    case 'p':
      return { type: 'paragraph', html: block.text };
    case 'ul':
      return { type: 'list', items: block.items };
    case 'ol':
      return { type: 'list', ordered: true, items: block.items };
    case 'dl':
      return {
        type: 'definitions',
        variant: 'term',
        items: block.items.map((item) => ({ term: item.term, description: item.def }))
      };
    case 'callout':
      return {
        type: 'callout',
        tone: block.tone,
        title: block.title,
        html: block.text,
        source: block.source
      };
    case 'formula':
      return {
        type: 'formula',
        formula: block.formula,
        alt: block.alt,
        label: block.label,
        number: block.number,
        variables: block.variables
      };
    case 'table':
      return {
        type: 'table',
        caption: block.caption,
        columns: block.head,
        rows: block.rows
      };
    case 'widget':
      return { type: 'widget', id: block.id };
  }
}

/** Übersetzt einen Abschnitt samt aller Bausteine. */
export function toArticleSection(section: FunkSection): ArticleSection {
  return {
    id: section.id,
    title: section.title,
    eyebrow: section.eyebrow,
    description: section.description,
    blocks: section.blocks.map(toArticleBlock)
  };
}

/** Übersetzt alle Abschnitte einer Seite. */
export function articleSections(sections: FunkSection[]): ArticleSection[] {
  return sections.map(toArticleSection);
}

/**
 * Schlägt einen Abschnitt nach und übersetzt ihn.
 * Wirft bei unbekannter ID, damit Tippfehler im Routen-Markup auffallen.
 */
export function articleSection(sections: FunkSection[], id: string): ArticleSection {
  const found = sections.find((section) => section.id === id);
  if (!found) throw new Error(`Abschnitt „${id}" ist in dieser Seite nicht enthalten.`);
  return toArticleSection(found);
}
