/**
 * Prüft, dass die neuen Funktechnik-Seiten in der Navigations-Registry
 * angemeldet sind, dass die zugehörigen Routen existieren und dass jede Seite
 * genügend lebende Querverweise hat.
 */

import { describe, it, expect } from 'vitest';
import { findNode } from '$lib/data/navigation';
import { getRelatedTopics } from '$lib/data/relations';

/** Alle vorhandenen Routen- und Metadaten-Dateien, von Vite eingesammelt. */
const ROUTE_FILES = new Set([
  ...Object.keys(import.meta.glob('/src/routes/**/+page.svelte')),
  ...Object.keys(import.meta.glob('/src/routes/**/+page.ts'))
]);

const NEUE_SEITEN = [
  '/wissen/funktechnik/funkdienste/',
  '/wissen/funktechnik/amateurfunk/',
  '/wissen/funktechnik/mobilfunk/',
  '/wissen/funktechnik/rundfunk/',
  '/wissen/funktechnik/notfrequenzen/',
  '/datenbanken/funkdienste/',
  '/service/quellen/'
];

describe.each(NEUE_SEITEN)('Seite %s', (href) => {
  it('ist als lebender Knoten registriert', () => {
    const node = findNode(href);
    expect(node).toBeDefined();
    expect(node?.status).toBe('live');
    expect(node?.description?.length ?? 0).toBeGreaterThan(20);
  });

  it('hat Route und Metadaten-Lader', () => {
    const base = `/src/routes${href}`;
    expect(ROUTE_FILES.has(`${base}+page.svelte`)).toBe(true);
    expect(ROUTE_FILES.has(`${base}+page.ts`)).toBe(true);
  });

  it('verweist auf mindestens drei lebende Seiten', () => {
    const topics = getRelatedTopics(href);
    expect(topics.length).toBeGreaterThanOrEqual(3);
    expect(topics.every((topic) => topic.node.status === 'live')).toBe(true);
    expect(topics.every((topic) => topic.node.href !== href)).toBe(true);
  });
});

describe('Suchbegriffe', () => {
  it('führt die Notfrequenz-Seite mit einschlägigen Stichworten', () => {
    const node = findNode('/wissen/funktechnik/notfrequenzen/');
    expect(node?.keywords).toContain('GMDSS');
    expect(node?.keywords).toContain('Kanal 16');
  });

  it('verlinkt bereichsübergreifend aus dem Amateurfunk-Kapitel', () => {
    const ziele = getRelatedTopics('/wissen/funktechnik/amateurfunk/').map(
      (topic) => topic.node.href
    );
    expect(ziele.some((ziel) => ziel.startsWith('/rechner/'))).toBe(true);
  });
});
