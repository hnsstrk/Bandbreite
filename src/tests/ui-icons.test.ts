/**
 * Unit-Tests für den Icon-Katalog und die Anker-Slugs
 * (src/lib/components/ui/icons.ts, src/lib/utils/slug.ts).
 */

import { describe, it, expect } from 'vitest';
import { ICONS, ICON_NAMES, isIconName } from '../lib/components/ui/icons';
import { NAV_TREE, type NavNode } from '$lib/data/navigation';
import { WIDGET_META } from '$lib/data/widgets';
import { slugify } from '$lib/utils/slug';

/** Icons, die das Design-System mindestens bereitstellen muss. */
const PFLICHT_ICONS = [
  'search',
  'menu',
  'close',
  'sun',
  'moon',
  'monitor',
  'chevron-down',
  'chevron-right',
  'chevron-left',
  'external',
  'calculator',
  'radio',
  'book',
  'database',
  'wave',
  'antenna',
  'satellite',
  'signal',
  'info',
  'warning',
  'check',
  'copy',
  'share',
  'reset',
  'arrow-right',
  'spectrum',
  'globe',
  'clock',
  'filter',
  'sliders',
  'play',
  'pause'
];

describe('Icon-Katalog', () => {
  it('enthält alle Pflicht-Icons', () => {
    for (const name of PFLICHT_ICONS) {
      expect(ICON_NAMES).toContain(name);
    }
  });

  it('umfasst mindestens 30 Icons', () => {
    expect(ICON_NAMES.length).toBeGreaterThanOrEqual(30);
  });

  it('liefert für jedes Icon mindestens einen Pfad', () => {
    for (const name of ICON_NAMES) {
      expect(ICONS[name].length).toBeGreaterThan(0);
    }
  });

  it('enthält ausschließlich gültig beginnende Pfaddaten', () => {
    for (const name of ICON_NAMES) {
      for (const path of ICONS[name]) {
        expect(path).toMatch(/^M/);
        expect(path.length).toBeGreaterThan(3);
      }
    }
  });

  it('verwendet keine festen Farbwerte', () => {
    const serialized = JSON.stringify(ICONS);
    expect(serialized).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    expect(serialized).not.toContain('fill=');
    expect(serialized).not.toContain('stroke=');
  });

  it('erkennt bekannte und unbekannte Namen', () => {
    expect(isIconName('search')).toBe(true);
    expect(isIconName('gibtesnicht')).toBe(false);
  });
});

/**
 * Icon-Namen in den Datenquellen sind Strings; fehlt einer im Katalog, rendert
 * `Icon.svelte` still ein leeres SVG. Dieser Test deckt die Lücke auf.
 */
describe('Icon-Namen der Datenquellen', () => {
  const navIcons = (() => {
    const found: Array<{ id: string; icon: string }> = [];
    const walk = (nodes: NavNode[]) => {
      for (const node of nodes) {
        if (node.icon) found.push({ id: node.id, icon: node.icon });
        if (node.children) walk(node.children);
      }
    };
    walk(NAV_TREE);
    return found;
  })();

  it('findet überhaupt Icons im NAV_TREE', () => {
    expect(navIcons.length).toBeGreaterThan(20);
  });

  it('jeder `icon` im NAV_TREE existiert im Katalog', () => {
    for (const { id, icon } of navIcons) {
      expect(ICON_NAMES, `${id} → ${icon}`).toContain(icon);
    }
  });

  it('jeder `icon` in WIDGET_META existiert im Katalog', () => {
    for (const [id, meta] of Object.entries(WIDGET_META)) {
      const icon = (meta as { icon?: string }).icon;
      if (icon) expect(ICON_NAMES, `${id} → ${icon}`).toContain(icon);
    }
  });
});

describe('slugify', () => {
  it('transliteriert Umlaute und ß', () => {
    expect(slugify('Atmosphärische Dämpfung')).toBe('atmosphaerische-daempfung');
    expect(slugify('Größe')).toBe('groesse');
  });

  it('entfernt Sonderzeichen und Randstriche', () => {
    expect(slugify('  FSPL — Freiraumdämpfung!  ')).toBe('fspl-freiraumdaempfung');
  });

  it('behält Ziffern', () => {
    expect(slugify('Kapitel 3: Radar')).toBe('kapitel-3-radar');
  });
});
