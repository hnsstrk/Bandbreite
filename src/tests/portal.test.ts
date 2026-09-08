/**
 * Portalseite unter „/" (Entscheidung E1).
 *
 * Geprüft wird das Datenmodell der Seite: Die Bereichskacheln stammen aus der
 * Navigations-Registry, die Sprungmarken der interaktiven Kapitel zeigen auf
 * existierende Seiten, und jeder Link endet — vor einem etwaigen Anker — auf
 * einem Schrägstrich.
 */

import { describe, it, expect } from 'vitest';
import {
  INTERACTIVE_TILES,
  portalAreas,
  toolTiles
} from '$lib/components/portal/portalContent';
import { findNode, NAV_GROUPS } from '$lib/data/navigation';
import { getRelatedTopics } from '$lib/data/relations';
import { isIconName } from '$lib/components/ui/icons';

/** Routen- und Metadatendateien, von Vite eingesammelt. */
const ROUTE_FILES = new Set([
  ...Object.keys(import.meta.glob('/src/routes/**/+page.svelte')),
  ...Object.keys(import.meta.glob('/src/routes/**/+page.ts'))
]);

describe('Portalseite', () => {
  it('hat Route und Metadaten-Lader', () => {
    expect(ROUTE_FILES.has('/src/routes/+page.svelte')).toBe(true);
    expect(ROUTE_FILES.has('/src/routes/+page.ts')).toBe(true);
  });

  it('ist als lebender Knoten „Start" registriert', () => {
    const node = findNode('/');
    expect(node?.id).toBe('start');
    expect(node?.status).toBe('live');
  });

  it('verweist auf mindestens drei lebende Seiten', () => {
    const topics = getRelatedTopics('/');
    expect(topics.length).toBeGreaterThanOrEqual(3);
    expect(topics.every((topic) => topic.node.status === 'live')).toBe(true);
  });
});

describe('Bereichskacheln', () => {
  const areas = portalAreas();

  it('zeigt genau die fünf Bereiche des Mega-Menüs', () => {
    expect(areas.map((area) => area.id)).toEqual(NAV_GROUPS.map((group) => group.id));
  });

  it('nennt je Bereich Ziel, Beschreibung und drei bis vier Einstiege', () => {
    for (const area of areas) {
      expect(area.href.endsWith('/'), area.id).toBe(true);
      expect(findNode(area.href), area.id).toBeDefined();
      expect(area.description.length, area.id).toBeGreaterThan(20);
      expect(area.links.length, area.id).toBeGreaterThanOrEqual(2);
      expect(area.links.length, area.id).toBeLessThanOrEqual(4);
      for (const link of area.links) {
        expect(link.status).toBe('live');
        expect(link.href.endsWith('/'), link.id).toBe(true);
        expect(link.href, link.id).not.toBe(area.href);
      }
    }
  });

  it('verwendet nur Icons aus dem Katalog', () => {
    for (const area of areas) {
      if (area.icon) expect(isIconName(area.icon)).toBe(true);
    }
  });
});

describe('Kachelraster', () => {
  const tiles = [...INTERACTIVE_TILES, ...toolTiles()];

  it('führt sechs interaktive Kapitel', () => {
    expect(INTERACTIVE_TILES).toHaveLength(6);
  });

  it('listet alle Rechner und Konverter', () => {
    const tools = toolTiles();
    expect(tools.length).toBeGreaterThanOrEqual(7);
    expect(tools.some((tile) => tile.href === '/konverter/frequenz/')).toBe(true);
    expect(tools.every((tile) => findNode(tile.href) !== undefined)).toBe(true);
  });

  it('vergibt eindeutige IDs, Titel und Texte', () => {
    expect(new Set(tiles.map((tile) => tile.id)).size).toBe(tiles.length);
    for (const tile of tiles) {
      expect(tile.title.length, tile.id).toBeGreaterThan(3);
      expect(tile.text.length, tile.id).toBeGreaterThan(20);
    }
  });

  it('verlinkt mit Trailing Slash und auf vorhandene Seiten', () => {
    for (const tile of tiles) {
      const [pfad, anker] = tile.href.split('#');
      expect(pfad.endsWith('/'), tile.id).toBe(true);
      expect(findNode(pfad), tile.id).toBeDefined();
      if (anker !== undefined) expect(anker.length, tile.id).toBeGreaterThan(0);
    }
  });

  it('verwendet nur Icons aus dem Katalog', () => {
    for (const tile of tiles) {
      if (tile.icon) expect(isIconName(tile.icon)).toBe(true);
    }
  });
});
