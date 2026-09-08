/**
 * Widget-Registry und Widget-Katalog.
 *
 * Geprüft wird die Kette Inhalt → Katalog → Deep-Link: Jedes Widget mit
 * Metadaten hat eine Komponente, sein Kapitel steht in den Kapiteldaten
 * (`widgetLocations()` liest sie) und — sobald das Kapitel im Navigationsbaum
 * geführt wird — existiert die Zielseite auch. Der Parser für `?w=` darf nur
 * bekannte Kennungen durchlassen.
 */

import { describe, it, expect } from 'vitest';
import { WIDGETS } from '$lib/components/knowledge/widgetRegistry';
import {
  CONTENT_WIDGET_ENTRIES,
  KNOWN_WIDGET_IDS,
  MARKUP_WIDGET_ENTRIES,
  WIDGET_ENTRIES,
  WIDGET_PARAM,
  findWidget,
  parseWidgetParam,
  widgetAnchorId,
  widgetHref,
  widgetIdsInArticle,
  widgetLabel,
  widgetLocations
} from '$lib/data/widgets';
import { findNode } from '$lib/data/navigation';
import { wellenausbreitungArticle } from '$lib/content/wellenausbreitung';

const locations = await widgetLocations();

/** Widgets, die bereits als Inhaltsblock in einem Kapitel eingebunden sind. */
const platzierte = CONTENT_WIDGET_ENTRIES.filter((entry) => (locations[entry.id] ?? []).length > 0);

/** Quelltext der Kapitelseiten, die Widgets direkt im Markup einbinden. */
const SEITEN_QUELLTEXT = import.meta.glob('/src/routes/wissen/*/+page.svelte', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

/** Kapitelseiten, die Widgets direkt im Markup einbinden. */
const MARKUP_SEITEN: Record<string, string> = {
  '/wissen/modulation/': '/src/routes/wissen/modulation/+page.svelte',
  '/wissen/antennen/': '/src/routes/wissen/antennen/+page.svelte'
};

describe('Widget-Katalog', () => {
  it('führt Metadaten für die eingebundenen Widgets', () => {
    expect(WIDGET_ENTRIES.length).toBeGreaterThanOrEqual(9);
    for (const entry of WIDGET_ENTRIES) {
      expect(entry.label.length, entry.id).toBeGreaterThan(3);
      expect(entry.description.length, entry.id).toBeGreaterThan(20);
      expect(entry.keywords.length, entry.id).toBeGreaterThan(0);
      expect(entry.chapterHref.startsWith('/'), entry.id).toBe(true);
      expect(entry.chapterHref.endsWith('/'), entry.id).toBe(true);
    }
  });

  it('vergibt eindeutige Kennungen', () => {
    expect(new Set(KNOWN_WIDGET_IDS).size).toBe(KNOWN_WIDGET_IDS.length);
  });

  it('hat zu jedem Inhaltsblock-Widget eine Komponente', () => {
    for (const entry of CONTENT_WIDGET_ENTRIES) {
      expect(WIDGETS[entry.id as keyof typeof WIDGETS], entry.id).toBeDefined();
    }
  });

  it('trennt Inhaltsblock- und Markup-Widgets vollständig', () => {
    expect(CONTENT_WIDGET_ENTRIES.length + MARKUP_WIDGET_ENTRIES.length).toBe(
      WIDGET_ENTRIES.length
    );
    expect(MARKUP_WIDGET_ENTRIES.length).toBeGreaterThanOrEqual(6);
  });

  it('nennt für platzierte Widgets ein Kapitel, in dem sie wirklich stehen', () => {
    // Ein Widget ohne Fundstelle wartet noch auf sein Kapitel — geprüft wird,
    // dass keine Zuordnung *falsch* ist.
    expect(platzierte.length).toBeGreaterThanOrEqual(9);
    for (const entry of platzierte) {
      expect(locations[entry.id], entry.id).toContain(entry.chapterHref);
    }
  });

  it('verweist auf lebende Kapitel des Navigationsbaums', () => {
    const bekannt = WIDGET_ENTRIES.filter((entry) => findNode(entry.chapterHref));
    expect(bekannt.length).toBeGreaterThanOrEqual(8);
    for (const entry of bekannt) {
      expect(findNode(entry.chapterHref)?.status, entry.id).toBe('live');
    }
  });

  it('findet Einträge über die Kennung', () => {
    expect(findWidget('fresnel')?.chapterHref).toBe('/wissen/wellenausbreitung/');
    expect(findWidget('gibt-es-nicht')).toBeUndefined();
    expect(findWidget(null)).toBeUndefined();
  });

  it('bildet für Widgets ohne Metadaten eine lesbare Bezeichnung', () => {
    expect(widgetLabel('fresnel')).toBe('Fresnel-Zone und Hindernis');
    expect(widgetLabel('gibt-es-nicht')).toBe('Gibt Es Nicht');
  });
});

describe('Widgets im Markup-Betrieb', () => {
  it('stehen in keiner Kapiteldatei als Inhaltsblock', () => {
    for (const entry of MARKUP_WIDGET_ENTRIES) {
      expect(locations[entry.id], entry.id).toBeUndefined();
    }
  });

  it('verweisen auf eine bekannte Kapitelseite', () => {
    for (const entry of MARKUP_WIDGET_ENTRIES) {
      expect(Object.keys(MARKUP_SEITEN), entry.id).toContain(entry.chapterHref);
      expect(findNode(entry.chapterHref)?.status, entry.id).toBe('live');
    }
  });

  it('tragen ihre Anker-ID in der Seitenkomponente — sonst greift `?w=` nicht', () => {
    for (const entry of MARKUP_WIDGET_ENTRIES) {
      const quelle = SEITEN_QUELLTEXT[MARKUP_SEITEN[entry.chapterHref]];
      expect(quelle, entry.chapterHref).toBeDefined();
      expect(quelle, entry.id).toContain(`widgetAnchorId('${entry.id}')`);
    }
  });

  it('werden vom Deep-Link-Parser akzeptiert', () => {
    for (const entry of MARKUP_WIDGET_ENTRIES) {
      expect(parseWidgetParam(`?${WIDGET_PARAM}=${entry.id}`)).toBe(entry.id);
    }
  });
});

describe('widgetLocations', () => {
  it('liest die Widget-Kennungen aus den Kapiteldaten', () => {
    expect(locations['ionospheric-propagation']).toEqual([
      '/wissen/wellenausbreitung/ionosphaere/'
    ]);
    expect(locations['fresnel']).toContain('/wissen/wellenausbreitung/');
    expect(locations['gibt-es-nicht']).toBeUndefined();
  });

  it('führt Mehrfachverwendungen mit allen Fundstellen', () => {
    const sandbox = locations['propagation-sandbox'] ?? [];
    expect(sandbox.length).toBeGreaterThanOrEqual(2);
    expect(sandbox).toContain('/wissen/wellenausbreitung/');
    expect(new Set(sandbox).size).toBe(sandbox.length);
  });

  it('liefert nur Kapitelpfade mit Trailing Slash', () => {
    for (const [id, hrefs] of Object.entries(locations)) {
      for (const href of hrefs) {
        expect(href.endsWith('/'), `${id}: ${href}`).toBe(true);
      }
    }
  });

  it('sammelt die Widgets eines Kapitels in Lesereihenfolge und ohne Dubletten', () => {
    const ids = widgetIdsInArticle(wellenausbreitungArticle);
    expect(ids).toContain('fresnel');
    expect(ids).toContain('attenuation-windows');
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.indexOf('fresnel')).toBeLessThan(ids.indexOf('attenuation-windows'));
  });
});

describe('Deep-Link `?w=`', () => {
  it('baut Anker und Pfad', () => {
    expect(widgetAnchorId('doppler')).toBe('widget-doppler');
    const entry = findWidget('fresnel')!;
    expect(widgetHref(entry)).toBe('/wissen/wellenausbreitung/?w=fresnel');
    const url = new URL(widgetHref(entry), 'https://example.org');
    expect(url.pathname.endsWith('/')).toBe(true);
    expect(url.searchParams.get(WIDGET_PARAM)).toBe('fresnel');
  });

  it('liest nur bekannte Kennungen aus den Suchparametern', () => {
    expect(parseWidgetParam(new URLSearchParams('w=fresnel'))).toBe('fresnel');
    expect(parseWidgetParam('?w=fresnel')).toBe('fresnel');
    expect(parseWidgetParam('?w= fresnel ')).toBe('fresnel');
    expect(parseWidgetParam('?w=decibel&f=2400')).toBe('decibel');
  });

  it('weist Unbekanntes und Leeres ab', () => {
    expect(parseWidgetParam('?w=<script>')).toBeNull();
    expect(parseWidgetParam('?w=')).toBeNull();
    expect(parseWidgetParam('?f=2400')).toBeNull();
    expect(parseWidgetParam(null)).toBeNull();
    expect(parseWidgetParam(undefined)).toBeNull();
  });
});
