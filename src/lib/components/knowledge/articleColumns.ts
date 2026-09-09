/**
 * Gruppierung der Kapitelblöcke für den zweispaltigen Fließtext (Bericht 74).
 *
 * Auf sehr breiten Monitoren (ab 96 rem, siehe `.prose-columns` in `app.css`)
 * laufen **nur** zusammenhängende Fließtext-Blöcke (`paragraph`, `list`) in
 * zwei Spalten. Alles andere — Tabellen, Widgets, Formeln, Karten,
 * Definitionslisten, Callouts, Fragen — bleibt einspaltig über die volle
 * Breite. Damit nicht jeder einzelne Absatz für sich spaltet (und dabei in
 * zwei halbe Zeilen zerfällt), fasst diese Funktion aufeinanderfolgende
 * Textblöcke zu **einer** Spaltengruppe zusammen.
 *
 * Eine Gruppe wird nur dann spaltenfähig, wenn sie genug Text trägt:
 * mindestens zwei Blöcke oder ein einzelner Block ab `MIN_COLUMN_CHARS`
 * Zeichen. Kurze Einzelabsätze bleiben einspaltig.
 */
import type { ArticleBlock } from '$lib/content/types';

/** Ab dieser Textlänge lohnt sich ein einzelner Block als Spaltengruppe. */
export const MIN_COLUMN_CHARS = 400;

/** Blocktypen, die als Fließtext gelten und deshalb spalten dürfen. */
const FLOW_TYPES = new Set<ArticleBlock['type']>(['paragraph', 'list']);

/**
 * Eine Gruppe aufeinanderfolgender Blöcke.
 * `columns = true`: als `.prose-columns`-Wrapper rendern.
 */
export interface BlockGroup {
  /** Stabiler Schlüssel für `{#each}` (Index des ersten Blocks). */
  key: number;
  columns: boolean;
  blocks: ArticleBlock[];
}

/** Sichtbare Textlänge eines Blocks (HTML-Auszeichnung zählt nicht mit). */
export function blockTextLength(block: ArticleBlock): number {
  const strip = (html: string) => html.replace(/<[^>]*>/g, '');
  if (block.type === 'paragraph') return strip(block.html).length;
  if (block.type === 'list') return block.items.reduce((sum, item) => sum + strip(item).length, 0);
  return 0;
}

/** Gehört der Block in den mehrspaltigen Fließtext? */
export function isFlowBlock(block: ArticleBlock): boolean {
  return FLOW_TYPES.has(block.type);
}

/**
 * Fasst aufeinanderfolgende Fließtext-Blöcke zu Spaltengruppen zusammen;
 * alle anderen Blöcke bleiben einzeln und einspaltig.
 */
export function groupBlocks(blocks: readonly ArticleBlock[]): BlockGroup[] {
  const groups: BlockGroup[] = [];
  let run: ArticleBlock[] = [];
  let runStart = 0;

  const flushRun = () => {
    if (run.length === 0) return;
    const chars = run.reduce((sum, block) => sum + blockTextLength(block), 0);
    const columns = run.length > 1 || chars >= MIN_COLUMN_CHARS;
    groups.push({ key: runStart, columns, blocks: run });
    run = [];
  };

  blocks.forEach((block, index) => {
    if (isFlowBlock(block)) {
      if (run.length === 0) runStart = index;
      run.push(block);
      return;
    }
    flushRun();
    groups.push({ key: index, columns: false, blocks: [block] });
  });
  flushRun();

  return groups;
}
