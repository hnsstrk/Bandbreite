/**
 * Datenmodell der Fließtext-Abschnitte für die Funktechnik-Kapitel.
 *
 * Die Seiten unter `/wissen/funktechnik/` halten ihren Text nicht im Markup,
 * sondern hier als Daten. Das hält die Routen-Dateien klein, macht die Texte
 * prüfbar (Tests über Struktur und Anker) und erlaubt es, jeden Abschnitt mit
 * derselben Komponente zu rendern: `components/knowledge/ArticleSection.svelte`,
 * gespeist über die Übersetzung in `adapt.ts`.
 */

/** Legendeneintrag eines Formelblocks. */
export interface FormulaVariable {
  symbol: string;
  meaning: string;
  unit?: string;
}

/** Ein Inhaltsbaustein innerhalb eines Abschnitts. */
export type ContentBlock =
  /** Fließtextabsatz. */
  | { kind: 'p'; text: string }
  /** Ungeordnete Aufzählung. */
  | { kind: 'ul'; items: string[] }
  /** Nummerierte Aufzählung, z. B. für Ablauffolgen. */
  | { kind: 'ol'; items: string[] }
  /** Begriffsliste „Begriff — Erklärung". */
  | { kind: 'dl'; items: { term: string; def: string }[] }
  /** Hinweiskasten; wird auf `ui/Callout.svelte` abgebildet. */
  | {
      kind: 'callout';
      tone: 'info' | 'warning' | 'tip' | 'formula';
      title?: string;
      text: string;
      source?: string;
    }
  /** Formel in Unicode-Klartext; wird auf `ui/FormulaBlock.svelte` abgebildet. */
  | {
      kind: 'formula';
      formula: string;
      alt: string;
      label?: string;
      number?: string;
      variables?: FormulaVariable[];
    }
  /** Tabelle mit Beschriftung; erste Spalte ist Zeilenkopf. */
  | { kind: 'table'; caption: string; head: string[]; rows: string[][] };

/** Ein Abschnitt einer Wissensseite. */
export interface ArticleSection {
  /** Anker-ID; identisch mit dem Eintrag im Inhaltsverzeichnis. */
  id: string;
  title: string;
  /** 2 = Kapitel, 3 = Unterabschnitt. */
  level?: 2 | 3;
  /** Kleine Zeile über der Überschrift. */
  eyebrow?: string;
  /** Erläuternder Satz unter der Überschrift. */
  description?: string;
  blocks: ContentBlock[];
}

/**
 * Baut die Einträge für `ui/TableOfContents.svelte` aus Abschnitten.
 *
 * `extra` nimmt Anker auf, die nicht als Abschnitt vorliegen (etwa ein
 * interaktives Widget mit eigener Überschrift). Die Reihenfolge bleibt die
 * Reihenfolge der übergebenen Liste.
 */
export function tocItems(
  sections: ArticleSection[],
  extra: { id: string; label: string; level?: 2 | 3; after?: string }[] = []
): { id: string; label: string; level: 2 | 3 }[] {
  const items = sections.map((section) => ({
    id: section.id,
    label: section.title,
    level: section.level ?? 2
  }));

  for (const entry of extra) {
    const item = { id: entry.id, label: entry.label, level: entry.level ?? 2 };
    const index = entry.after ? items.findIndex((i) => i.id === entry.after) : -1;
    if (index >= 0) items.splice(index + 1, 0, item);
    else items.push(item);
  }

  return items;
}

/** Schlägt einen Abschnitt anhand seiner ID nach. */
export function findSection(
  sections: ArticleSection[],
  id: string
): ArticleSection | undefined {
  return sections.find((section) => section.id === id);
}

/** Alle Abschnitts-IDs einer Seite — Grundlage der Strukturtests. */
export function sectionIds(sections: ArticleSection[]): string[] {
  return sections.map((section) => section.id);
}
