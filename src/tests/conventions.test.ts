/**
 * Regelkonformität des Repos (CLAUDE.md und STYLE_GUIDE.md).
 *
 * Diese Datei prüft nicht Fachliches, sondern die Hausordnung:
 * Komponentengröße, Farbtokens statt Hex-Werten und Trailing Slash in der
 * Navigations-Registry. Die Dateien werden über `import.meta.glob(…, '?raw')`
 * eingelesen; das läuft ohne `node:fs` in jeder Umgebung.
 */

import { describe, it, expect } from 'vitest';
import { NAV_GROUPS, NAV_TREE, flattenNav } from '$lib/data/navigation';

const COMPONENTS = import.meta.glob('/src/lib/components/**/*.svelte', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const ROUTES = import.meta.glob('/src/routes/**/*.svelte', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

/**
 * Komponenten über 300 Zeilen. Seit der Aufteilung der geschützten
 * Kernkomponenten (Bericht 51) gibt es keine; ein Eintrag hier braucht eine
 * Begründung und die Freigabe des Besitzers.
 */
const GROESSEN_AUSNAHMEN: Record<string, string> = {};

/**
 * Dateien, in denen Hex-Farben zulässig sind: die geschützten
 * Spektrum-Komponenten mit ihren Bandfarben. Die illustrativen Szenenfarben
 * stehen inzwischen als `--color-scene-*`-Tokens in `app.css`.
 */
const HEX_AUSNAHMEN: Record<string, string> = {
  '/src/lib/components/SpectrumRows.svelte': 'Geschützte Spektrum-Unterkomponente (Bandrahmen, Auswahl).',
  '/src/lib/components/SpectrumMarker.svelte': 'Geschützte Spektrum-Unterkomponente (Frequenzmarker).',
  '/src/lib/components/SpectrumCursor.svelte': 'Geschützte Spektrum-Unterkomponente.',
  '/src/lib/components/SpectrumTooltip.svelte': 'Farbverlauf des sichtbaren Lichts.',
  '/src/lib/components/SpectrumLegend.svelte': 'Farbverlauf des sichtbaren Lichts.'
};

/** 6- und 8-stellige Hex-Farben; `&#955;` (HTML-Entity) fällt nicht darunter. */
const HEX = /#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?\b/g;

/** Zeilen wie `wc -l`: der abschließende Zeilenumbruch zählt nicht mit. */
function zeilen(quelltext: string): number {
  return quelltext.replace(/\n$/, '').split('\n').length;
}

describe('Komponentengröße', () => {
  const dateien = Object.entries({ ...COMPONENTS, ...ROUTES });

  it('findet überhaupt Komponenten', () => {
    expect(dateien.length).toBeGreaterThan(50);
  });

  it.each(dateien)('%s bleibt unter 300 Zeilen', (pfad, quelltext) => {
    const laenge = zeilen(quelltext);
    if (pfad in GROESSEN_AUSNAHMEN) {
      // Bekannte Ausnahme: nur festhalten, dass sie nicht weiter wächst.
      expect(laenge).toBeLessThanOrEqual(450);
      return;
    }
    expect(laenge).toBeLessThan(300);
  });

  it('führt keine Ausnahme, die inzwischen unnötig ist', () => {
    for (const pfad of Object.keys(GROESSEN_AUSNAHMEN)) {
      const quelltext = COMPONENTS[pfad] ?? ROUTES[pfad];
      expect(quelltext, `${pfad} existiert nicht mehr`).toBeDefined();
      expect(zeilen(quelltext), `${pfad} ist kurz genug — Ausnahme streichen`).toBeGreaterThan(300);
    }
  });
});

describe('Farbtokens statt Hex-Werten', () => {
  const dateien = Object.entries({ ...COMPONENTS, ...ROUTES }).filter(
    ([pfad]) => !(pfad in HEX_AUSNAHMEN)
  );

  it.each(dateien)('%s verwendet keine Hex-Farbe', (_pfad, quelltext) => {
    expect(quelltext.match(HEX) ?? []).toEqual([]);
  });

  it('führt keine Hex-Ausnahme für eine gelöschte Datei', () => {
    for (const pfad of Object.keys(HEX_AUSNAHMEN)) {
      expect(COMPONENTS[pfad], `${pfad} existiert nicht mehr`).toBeDefined();
    }
  });
});

describe('Navigations-Registry', () => {
  const knoten = flattenNav(NAV_TREE);

  it('enthält Knoten', () => {
    expect(knoten.length).toBeGreaterThan(20);
  });

  it.each(knoten.map((node) => [node.id, node.href] as const))(
    '%s endet mit Schrägstrich',
    (_id, href) => {
      expect(href.startsWith('/')).toBe(true);
      expect(href.endsWith('/')).toBe(true);
      expect(href).not.toContain('?');
      expect(href).not.toContain('#');
    }
  );

  it('auch die Gruppenziele des Mega-Menüs enden mit Schrägstrich', () => {
    for (const group of NAV_GROUPS) {
      if (!group.href) continue;
      expect(group.href.endsWith('/'), `${group.id}: ${group.href}`).toBe(true);
    }
  });
});
