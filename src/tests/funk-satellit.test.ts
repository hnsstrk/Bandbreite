/**
 * Tests der Satellitenfunk-Daten: Bahnklassen, Frequenzbänder der
 * Erde-Weltraum-Strecke und die Systemliste. Die Bahnmechanik selbst prüft
 * `orbitMath.test.ts`.
 */

import { describe, it, expect } from 'vitest';
import {
  GEO_ALTITUDE_M,
  GPS_ALTITUDE_M,
  IRIDIUM_ALTITUDE_M,
  ISS_ALTITUDE_M,
  ORBIT_CLASSES,
  SATELLITE_BANDS,
  SATELLITE_CATEGORY_LABELS,
  SATELLITE_SYSTEMS,
  STARLINK_ALTITUDE_M,
  orbitClassInfo,
  satelliteSystemsByCategory
} from '$lib/data/satelliteSystems';
import { GEOSTATIONARY_ALTITUDE_M, orbitalPeriod, roundTripDelay } from '$lib/utils/orbitMath';

const MINUTE_S = 60;
const HOUR_S = 3600;

describe('Bahnklassen', () => {
  it('führt LEO, MEO, GEO und HEO', () => {
    expect(ORBIT_CLASSES.map((entry) => entry.id)).toEqual(['leo', 'meo', 'geo', 'heo']);
  });

  it('beschreibt jede Klasse mit Höhenbereich und Folgerung', () => {
    for (const entry of ORBIT_CLASSES) {
      expect(entry.maxAltitudeM).toBeGreaterThanOrEqual(entry.minAltitudeM);
      expect(entry.referenceAltitudeM).toBeGreaterThan(0);
      expect(entry.descriptionDE.length).toBeGreaterThan(40);
      expect(entry.consequenceDE.length).toBeGreaterThan(40);
    }
  });

  it('setzt die geostationäre Nennhöhe auf den gerechneten Wert', () => {
    expect(GEO_ALTITUDE_M / 1000).toBeCloseTo(GEOSTATIONARY_ALTITUDE_M / 1000, 0);
  });

  it('schlägt eine Klasse nach', () => {
    expect(orbitClassInfo('geo')?.referenceAltitudeM).toBe(GEO_ALTITUDE_M);
    expect(orbitClassInfo('leo')?.referenceAltitudeM).toBe(ISS_ALTITUDE_M);
  });

  it('ordnet die Referenzhöhen den Klassen richtig zu', () => {
    expect(orbitalPeriod(ISS_ALTITUDE_M) / MINUTE_S).toBeLessThan(120);
    expect(orbitalPeriod(GPS_ALTITUDE_M) / HOUR_S).toBeGreaterThan(11);
    expect(orbitalPeriod(GPS_ALTITUDE_M) / HOUR_S).toBeLessThan(13);
  });

  it('hält die niedrigen Bahnen unter der MEO-Grenze', () => {
    for (const altitude of [ISS_ALTITUDE_M, STARLINK_ALTITUDE_M, IRIDIUM_ALTITUDE_M]) {
      expect(altitude).toBeLessThan(2_000_000);
    }
  });
});

describe('Frequenzbänder der Erde-Weltraum-Strecke', () => {
  it('legt die Aufwärtsstrecke über die Abwärtsstrecke, wo die Regel gilt', () => {
    expect(SATELLITE_BANDS.length).toBeGreaterThanOrEqual(6);
    for (const band of SATELLITE_BANDS.filter((entry) => entry.uplinkAbove)) {
      expect(band.uplinkMinHz, band.id).toBeGreaterThan(band.downlinkMaxHz);
    }
  });

  it('kennzeichnet das S-Band als dokumentierte Ausnahme', () => {
    const exceptions = SATELLITE_BANDS.filter((band) => !band.uplinkAbove);
    expect(exceptions.map((band) => band.id)).toEqual(['s']);
    for (const band of exceptions) {
      expect(band.uplinkMaxHz).toBeLessThan(band.downlinkMinHz);
      expect(band.noteDE?.length ?? 0).toBeGreaterThan(30);
    }
  });

  it('hält jede Bandgrenze in der richtigen Reihenfolge', () => {
    for (const band of SATELLITE_BANDS) {
      expect(band.uplinkMaxHz).toBeGreaterThan(band.uplinkMinHz);
      expect(band.downlinkMaxHz).toBeGreaterThan(band.downlinkMinHz);
    }
  });

  it('sortiert die Bänder aufsteigend nach Frequenz', () => {
    for (let i = 1; i < SATELLITE_BANDS.length; i += 1) {
      expect(SATELLITE_BANDS[i].downlinkMinHz).toBeGreaterThan(
        SATELLITE_BANDS[i - 1].downlinkMinHz
      );
    }
  });

  it('führt die Bandbuchstaben L, S, C, X, Ku und Ka', () => {
    expect(SATELLITE_BANDS.map((band) => band.letter)).toEqual(['L', 'S', 'C', 'X', 'Ku', 'Ka']);
  });

  it('beschreibt Nutzung und Regenverhalten jedes Bandes', () => {
    for (const band of SATELLITE_BANDS) {
      expect(band.usageDE.length).toBeGreaterThan(20);
      expect(band.rainDE.length).toBeGreaterThan(15);
    }
  });
});

describe('Systeme', () => {
  it('vergibt eindeutige Kennungen und bekannte Kategorien', () => {
    const ids = SATELLITE_SYSTEMS.map((system) => system.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const system of SATELLITE_SYSTEMS) {
      expect(SATELLITE_CATEGORY_LABELS[system.category], system.id).toBeDefined();
      expect(orbitClassInfo(system.orbit), system.id).toBeDefined();
      expect(system.altitudeM).toBeGreaterThan(0);
      expect(system.descriptionDE.length).toBeGreaterThan(40);
    }
  });

  it('filtert nach Einsatzgebiet', () => {
    expect(satelliteSystemsByCategory('alle')).toHaveLength(SATELLITE_SYSTEMS.length);
    const amateur = satelliteSystemsByCategory('amateur');
    expect(amateur.length).toBeGreaterThanOrEqual(2);
    expect(amateur.every((system) => system.category === 'amateur')).toBe(true);
  });

  it('setzt geostationäre Systeme auf die geostationäre Höhe', () => {
    for (const system of SATELLITE_SYSTEMS.filter((entry) => entry.orbit === 'geo')) {
      expect(system.altitudeM, system.id).toBe(GEO_ALTITUDE_M);
    }
  });

  it('gibt geostationären Systemen die deutlich längere Signallaufzeit', () => {
    const geo = SATELLITE_SYSTEMS.find((system) => system.id === 'qo100');
    const leo = SATELLITE_SYSTEMS.find((system) => system.id === 'starlink');
    expect(roundTripDelay(geo?.altitudeM ?? 0)).toBeGreaterThan(
      20 * roundTripDelay(leo?.altitudeM ?? 0)
    );
  });

  it('führt die im Kapitel genannten Systeme', () => {
    const ids = SATELLITE_SYSTEMS.map((system) => system.id);
    for (const id of ['inmarsat', 'iridium', 'starlink', 'gnss', 'qo100', 'iss', 'noaa-apt']) {
      expect(ids, id).toContain(id);
    }
  });
});

// ============================================================================
// Seite, Navigation und Inhalte
// ============================================================================

import { findNode } from '$lib/data/navigation';
import { getRelatedTopics } from '$lib/data/relations';
import { sectionIds } from '$lib/content/funktechnik/types';
import { articleSections } from '$lib/content/funktechnik/adapt';
import { LEARNING_GOALS as PAGE_GOALS_SATELLITENFUNK, SECTIONS as PAGE_SECTIONS_SATELLITENFUNK } from '$lib/content/funktechnik/satellitenfunk';

const PAGE_HREF_SATELLITENFUNK = '/wissen/funktechnik/satellitenfunk/';

const ROUTE_FILES_SATELLITENFUNK = new Set([
  ...Object.keys(import.meta.glob('/src/routes/**/+page.svelte')),
  ...Object.keys(import.meta.glob('/src/routes/**/+page.ts'))
]);

describe('Seite /wissen/funktechnik/satellitenfunk/', () => {
  it('ist als lebender Knoten registriert', () => {
    const node = findNode(PAGE_HREF_SATELLITENFUNK);
    expect(node).toBeDefined();
    expect(node?.status).toBe('live');
    expect(node?.description?.length ?? 0).toBeGreaterThan(20);
    expect((node?.keywords ?? []).length).toBeGreaterThan(4);
  });

  it('hat Route und Metadaten-Lader', () => {
    expect(ROUTE_FILES_SATELLITENFUNK.has(`/src/routes${PAGE_HREF_SATELLITENFUNK}+page.svelte`)).toBe(true);
    expect(ROUTE_FILES_SATELLITENFUNK.has(`/src/routes${PAGE_HREF_SATELLITENFUNK}+page.ts`)).toBe(true);
  });

  it('verweist auf mindestens drei lebende Seiten, davon eine aus einem anderen Bereich', () => {
    const topics = getRelatedTopics(PAGE_HREF_SATELLITENFUNK);
    expect(topics.length).toBeGreaterThanOrEqual(3);
    expect(topics.every((topic) => topic.node.status === 'live')).toBe(true);
    expect(topics.every((topic) => topic.node.href !== PAGE_HREF_SATELLITENFUNK)).toBe(true);
    expect(topics.some((topic) => !topic.node.href.startsWith('/wissen/funktechnik/'))).toBe(true);
  });

  it('nennt Lernziele und gliedert den Text in eindeutige Abschnitte', () => {
    expect(PAGE_GOALS_SATELLITENFUNK.length).toBeGreaterThanOrEqual(4);
    const ids = sectionIds(PAGE_SECTIONS_SATELLITENFUNK);
    expect(ids.length).toBeGreaterThanOrEqual(4);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('lässt sich vollständig in das Kapitelmodell übersetzen', () => {
    const sections = articleSections(PAGE_SECTIONS_SATELLITENFUNK);
    expect(sections).toHaveLength(PAGE_SECTIONS_SATELLITENFUNK.length);
    for (const section of sections) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.blocks.length).toBeGreaterThan(0);
    }
  });

  it('enthält die Abschnitte, auf die die Route zugreift', () => {
    const ids = sectionIds(PAGE_SECTIONS_SATELLITENFUNK);
    for (const id of ['bahnen', 'strecke', 'baender', 'transponder', 'systeme']) expect(ids, id).toContain(id);
  });
});
