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
  KNOWN_WIDGET_IDS,
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

/** Widgets, die bereits in einem Kapitel eingebunden sind. */
const platzierte = WIDGET_ENTRIES.filter((entry) => (locations[entry.id] ?? []).length > 0);

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

  it('hat zu jedem Katalogeintrag eine Komponente', () => {
    for (const entry of WIDGET_ENTRIES) {
      expect(WIDGETS[entry.id], entry.id).toBeDefined();
    }
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
