/**
 * Datenmodell der Wissen-Kapitel.
 *
 * Ein Kapitel (`KnowledgeArticle`) besteht aus Abschnitten (`ArticleSection`),
 * die wiederum aus typisierten Blöcken bestehen. Die Blöcke enthalten **kein**
 * Svelte-Markup; kleine Inline-Auszeichnungen (`<strong>`, `<sub>`, `<sup>`,
 * `<a>`) sind als HTML-Strings erlaubt, weil die Inhalte ausschließlich aus
 * dem Projektcode stammen und per `{@html}` gerendert werden.
 */
import type { IconName } from '$lib/components/ui/icons';

/** Kennungen der einbettbaren interaktiven Widgets. */
export type WidgetId =
  | 'radar-pulse'
  | 'doppler'
  | 'rcs-comparison'
  | 'fresnel'
  | 'decibel'
  | 'attenuation-windows'
  | 'propagation-sandbox'
  | 'wave-propagation-diagram'
  | 'ionospheric-propagation'
  | 'fmcw'
  | 'blind-speed'
  | 'ssr-interrogation'
  | 'em-wave'
  | 'field-strength'
  | 'near-far-field'
  | 'polarization-loss'
  | 'log-linear'
  | 'inverse-square'
  | 'phasor'
  | 'fourier-synthesis'
  | 'two-ray'
  | 'ionosphere-day-night'
  | 'cell-reuse'
  | 'fm-multiplex'
  | 'dab-sfn'
  | 'mode-bandwidth'
  | 'vor-radial'
  | 'leo-pass'
  | 'maritime-duplex'
  | 'radar-range'
  | 'pulse-compression'
  | 'mode-s-frame'
  | 'radio-service-flow'
  | 'bos-alarm-chain'
  | 'cospas-sarsat-chain'
  | 'fdd-tdd'
  | 'amateur-band-openings';

/**
 * Widgets, die in einer Kapitel**seite** direkt im Markup stehen — die Kapitel
 * „Modulation" und „Antennen" sind (noch) keine Inhaltsdaten. Sie tragen
 * keinen `widget`-Block, bekommen ihre Anker-ID aber ebenso vergeben, damit
 * Deep-Link (`?w=<id>`) und Suchtreffer funktionieren.
 */
export type MarkupWidgetId =
  | 'modulation-visualizer'
  | 'constellation'
  | 'carson'
  | 'antenna-pattern'
  | 'parabolic-gain'
  | 'swr'
  | 'dipole-current'
  | 'ofdm';

/** Alle Kennungen des Widget-Katalogs (`data/widgets.ts`). */
export type CatalogWidgetId = WidgetId | MarkupWidgetId;

export interface FormulaVariable {
  symbol: string;
  meaning: string;
  unit?: string;
}

export interface ParagraphBlock {
  type: 'paragraph';
  /** Inline-HTML (nur Projektinhalt) */
  html: string;
}

export interface ListBlock {
  type: 'list';
  ordered?: boolean;
  items: string[];
}

export interface FormulaBlockData {
  type: 'formula';
  formula: string;
  /** Gesprochene Fassung für Screenreader */
  alt: string;
  label?: string;
  number?: string;
  variables?: FormulaVariable[];
}

export interface CalloutBlock {
  type: 'callout';
  tone?: 'info' | 'warning' | 'tip' | 'formula';
  title?: string;
  html: string;
  source?: string;
}

export interface TableBlock {
  type: 'table';
  caption?: string;
  columns: string[];
  rows: string[][];
  /** Spaltenindizes, die in Monospace (Zahlen) gesetzt werden */
  monoColumns?: number[];
}

export interface DefinitionBlock {
  type: 'definitions';
  items: { term: string; description: string }[];
  /**
   * `symbol` (Standard) setzt kurze Formelzeichen in Monospace,
   * `term` ist für ausgeschriebene Fachbegriffe gedacht.
   */
  variant?: 'symbol' | 'term';
}

export interface CardItem {
  title: string;
  subtitle?: string;
  html?: string;
  points?: string[];
  /** Kleine Kennzahl-Zeile, z. B. Frequenzbereich */
  facts?: { label: string; value: string }[];
}

export interface CardsBlock {
  type: 'cards';
  items: CardItem[];
  columns?: 2 | 3;
}

export interface WidgetBlock {
  type: 'widget';
  id: WidgetId;
}

export interface QuestionBlock {
  type: 'question';
  question: string;
  answer: string;
}

export type ArticleBlock =
  | ParagraphBlock
  | ListBlock
  | FormulaBlockData
  | CalloutBlock
  | TableBlock
  | DefinitionBlock
  | CardsBlock
  | WidgetBlock
  | QuestionBlock;

export interface ArticleSection {
  /** Anker-ID ohne Umlaute (landet in der URL) */
  id: string;
  title: string;
  /** Kleine Zeile über der Überschrift */
  eyebrow?: string;
  /** Kurze Einleitung unter der Überschrift */
  description?: string;
  blocks: ArticleBlock[];
  /** Unterabschnitte werden als h3 gerendert */
  children?: ArticleSection[];
}

export interface KnowledgeArticle {
  /** Route mit Trailing Slash, z. B. '/wissen/radar/' */
  href: string;
  title: string;
  kicker: string;
  lead: string;
  icon?: IconName;
  meta?: { label: string; value: string }[];
  /** Lernziele: „Nach diesem Kapitel kannst du …" */
  goals: string[];
  sections: ArticleSection[];
  /** Quellenangaben am Kapitelende */
  sources?: string[];
}
