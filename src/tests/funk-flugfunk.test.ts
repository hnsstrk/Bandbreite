/**
 * Tests der Flugfunk-Daten und der 8,33-kHz-Kanalumrechnung.
 *
 * Der Kern ist die Kanalbezeichnungstabelle aus ICAO Annex 10 Volume V: Die
 * Bezeichnung „118.005" steht für 118,000 000 MHz, „118.010" für
 * 118,008 333 MHz. Verglichen werden ausschließlich Zahlenwerte.
 */

import { describe, it, expect } from 'vitest';
import {
  AERO_EMERGENCY_UHF_HZ,
  AERO_EMERGENCY_VHF_HZ,
  AVIATION_BANDS,
  AVIATION_GROUP_LABELS,
  AVIATION_HF_SEGMENTS,
  CHANNELS_PER_25_KHZ,
  VHF_COM_MAX_HZ,
  VHF_COM_MIN_HZ,
  VHF_SPACING_25_HZ,
  VHF_SPACING_833_HZ,
  aviationBandsByGroup,
  aviationChannelCount,
  aviationChannelFromDesignator,
  aviationChannelFromFrequency,
  isValidAviationDesignator
} from '$lib/data/aviationBands';

/** Toleranz beim Vergleich von Frequenzen in Hz. */
const TOLERANCE_HZ = 0.5;

describe('8,33-kHz-Kanalbezeichnungen', () => {
  it.each([
    ['118.005', 118_000_000],
    ['118.010', 118_000_000 + VHF_SPACING_833_HZ],
    ['118.015', 118_000_000 + 2 * VHF_SPACING_833_HZ],
    ['118.030', 118_025_000],
    ['118.035', 118_025_000 + VHF_SPACING_833_HZ],
    ['118.040', 118_025_000 + 2 * VHF_SPACING_833_HZ],
    ['118.055', 118_050_000],
    ['118.080', 118_075_000],
    ['118.090', 118_075_000 + 2 * VHF_SPACING_833_HZ]
  ])('%s liegt auf der erwarteten Frequenz', (designator, expected) => {
    const channel = aviationChannelFromDesignator(designator);
    expect(channel?.frequencyHz).toBeCloseTo(expected, 3);
    expect(channel?.spacingHz).toBeCloseTo(VHF_SPACING_833_HZ, 6);
  });

  it('unterscheidet Bezeichnung und Frequenz — das ist der Kern der Sache', () => {
    const channel = aviationChannelFromDesignator('118.010');
    expect(channel).toBeDefined();
    // Die Bezeichnung suggeriert 118,010 MHz, gesendet wird auf 118,00833 MHz.
    expect(Math.abs((channel?.frequencyHz ?? 0) - 118_010_000)).toBeGreaterThan(1000);
  });

  it('behandelt Endungen auf 00, 25, 50 und 75 als 25-kHz-Kanäle', () => {
    for (const [designator, expected] of [
      ['118.000', 118_000_000],
      ['118.025', 118_025_000],
      ['121.500', 121_500_000],
      ['136.975', 136_975_000]
    ] as const) {
      const channel = aviationChannelFromDesignator(designator);
      expect(channel?.frequencyHz).toBe(expected);
      expect(channel?.spacingHz).toBe(VHF_SPACING_25_HZ);
    }
  });

  it('weist die nicht vergebenen Endungen 20, 45, 70 und 95 zurück', () => {
    for (const suffix of ['020', '045', '070', '095']) {
      expect(isValidAviationDesignator(`118.${suffix}`)).toBe(false);
    }
  });

  it('weist Bezeichnungen außerhalb des Bandes zurück', () => {
    expect(aviationChannelFromDesignator('117.975')).toBeUndefined();
    expect(aviationChannelFromDesignator('137.000')).toBeUndefined();
    expect(aviationChannelFromDesignator('unfug')).toBeUndefined();
    expect(aviationChannelFromDesignator('118.0')).toBeUndefined();
  });

  it('akzeptiert das deutsche Dezimalkomma und Leerzeichen', () => {
    expect(aviationChannelFromDesignator(' 121,500 ')?.frequencyHz).toBe(121_500_000);
  });
});

describe('Rückweg Frequenz → Kanalbezeichnung', () => {
  it('findet zu jeder 8,33-Bezeichnung wieder dieselbe Bezeichnung', () => {
    for (const designator of ['118.005', '118.010', '118.015', '118.030', '132.090', '136.990']) {
      const channel = aviationChannelFromDesignator(designator);
      expect(channel).toBeDefined();
      const back = aviationChannelFromFrequency(channel?.frequencyHz ?? 0);
      expect(back?.designator).toBe(designator);
    }
  });

  it('findet im 25-kHz-Raster die klassische Bezeichnung', () => {
    expect(aviationChannelFromFrequency(121_500_000, VHF_SPACING_25_HZ)?.designator).toBe(
      '121.500'
    );
    expect(aviationChannelFromFrequency(118_000_000, VHF_SPACING_25_HZ)?.designator).toBe(
      '118.000'
    );
  });

  it('rastet leicht verstimmte Frequenzen auf den nächsten Kanal', () => {
    const channel = aviationChannelFromFrequency(118_008_000);
    expect(channel?.designator).toBe('118.010');
    expect(channel?.frequencyHz).toBeCloseTo(118_000_000 + VHF_SPACING_833_HZ, 3);
  });

  it('liefert außerhalb des Bandes nichts', () => {
    expect(aviationChannelFromFrequency(108_000_000)).toBeUndefined();
    expect(aviationChannelFromFrequency(137_500_000)).toBeUndefined();
    expect(aviationChannelFromFrequency(Number.NaN)).toBeUndefined();
  });
});

describe('Kanalraster', () => {
  it('setzt 8,33 kHz als exaktes Drittel von 25 kHz an', () => {
    expect(VHF_SPACING_833_HZ * CHANNELS_PER_25_KHZ).toBeCloseTo(VHF_SPACING_25_HZ, 9);
  });

  it('verdreifacht die Kanalzahl im Band 118 bis 137 MHz', () => {
    expect(aviationChannelCount(VHF_SPACING_25_HZ)).toBe(760);
    expect(aviationChannelCount(VHF_SPACING_833_HZ)).toBe(2280);
  });

  it('hält jede erzeugte Frequenz innerhalb des Bandes', () => {
    for (const designator of ['118.005', '127.505', '136.990']) {
      const channel = aviationChannelFromDesignator(designator);
      expect(channel?.frequencyHz).toBeGreaterThanOrEqual(VHF_COM_MIN_HZ - TOLERANCE_HZ);
      expect(channel?.frequencyHz).toBeLessThan(VHF_COM_MAX_HZ);
    }
  });
});

describe('Frequenzbereiche des Flugfunks', () => {
  it('führt jeden Bereich mit sinnvollen Grenzen und Beschreibung', () => {
    expect(AVIATION_BANDS.length).toBeGreaterThanOrEqual(10);
    for (const band of AVIATION_BANDS) {
      expect(band.minHz).toBeGreaterThan(0);
      expect(band.maxHz).toBeGreaterThanOrEqual(band.minHz);
      expect(band.descriptionDE.length).toBeGreaterThan(40);
      expect(AVIATION_GROUP_LABELS[band.group]).toBeDefined();
    }
  });

  it('vergibt eindeutige Kennungen', () => {
    const ids = AVIATION_BANDS.map((band) => band.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ordnet die Notfrequenzen den richtigen Bändern zu', () => {
    const vhf = AVIATION_BANDS.find((band) => band.id === 'vhf-com');
    expect(vhf?.minHz).toBeLessThanOrEqual(AERO_EMERGENCY_VHF_HZ);
    expect(vhf?.maxHz).toBeGreaterThanOrEqual(AERO_EMERGENCY_VHF_HZ);

    const uhf = AVIATION_BANDS.find((band) => band.id === 'uhf-com');
    expect(uhf?.minHz).toBeLessThanOrEqual(AERO_EMERGENCY_UHF_HZ);
    expect(uhf?.maxHz).toBeGreaterThanOrEqual(AERO_EMERGENCY_UHF_HZ);
  });

  it('setzt die militärische Notfrequenz auf das Doppelte der zivilen', () => {
    expect(AERO_EMERGENCY_UHF_HZ).toBe(2 * AERO_EMERGENCY_VHF_HZ);
  });

  it('filtert nach Gruppe', () => {
    expect(aviationBandsByGroup('alle')).toHaveLength(AVIATION_BANDS.length);
    const navigation = aviationBandsByGroup('navigation');
    expect(navigation.length).toBeGreaterThan(3);
    expect(navigation.every((band) => band.group === 'navigation')).toBe(true);
  });

  it('legt den Landekurssender in den unteren Teil des VOR-Bereichs', () => {
    const loc = AVIATION_BANDS.find((band) => band.id === 'ils-loc');
    const vor = AVIATION_BANDS.find((band) => band.id === 'vor');
    expect(loc?.minHz).toBeGreaterThanOrEqual(vor?.minHz ?? 0);
    expect(loc?.maxHz).toBeLessThan(112_000_000);
  });
});

describe('HF-Bandsegmente', () => {
  it('liegt vollständig zwischen 2,8 und 22 MHz', () => {
    expect(AVIATION_HF_SEGMENTS.length).toBeGreaterThan(8);
    for (const segment of AVIATION_HF_SEGMENTS) {
      expect(segment.minHz).toBeGreaterThanOrEqual(2_800_000);
      expect(segment.maxHz).toBeLessThanOrEqual(22_000_000);
      expect(segment.maxHz).toBeGreaterThan(segment.minHz);
    }
  });

  it('ist aufsteigend sortiert und überschneidungsfrei', () => {
    for (let i = 1; i < AVIATION_HF_SEGMENTS.length; i += 1) {
      expect(AVIATION_HF_SEGMENTS[i].minHz).toBeGreaterThan(AVIATION_HF_SEGMENTS[i - 1].maxHz);
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
import { LEARNING_GOALS as PAGE_GOALS_FLUGFUNK, SECTIONS as PAGE_SECTIONS_FLUGFUNK } from '$lib/content/funktechnik/flugfunk';

const PAGE_HREF_FLUGFUNK = '/wissen/funktechnik/flugfunk/';

const ROUTE_FILES_FLUGFUNK = new Set([
  ...Object.keys(import.meta.glob('/src/routes/**/+page.svelte')),
  ...Object.keys(import.meta.glob('/src/routes/**/+page.ts'))
]);

describe('Seite /wissen/funktechnik/flugfunk/', () => {
  it('ist als lebender Knoten registriert', () => {
    const node = findNode(PAGE_HREF_FLUGFUNK);
    expect(node).toBeDefined();
    expect(node?.status).toBe('live');
    expect(node?.description?.length ?? 0).toBeGreaterThan(20);
    expect((node?.keywords ?? []).length).toBeGreaterThan(4);
  });

  it('hat Route und Metadaten-Lader', () => {
    expect(ROUTE_FILES_FLUGFUNK.has(`/src/routes${PAGE_HREF_FLUGFUNK}+page.svelte`)).toBe(true);
    expect(ROUTE_FILES_FLUGFUNK.has(`/src/routes${PAGE_HREF_FLUGFUNK}+page.ts`)).toBe(true);
  });

  it('verweist auf mindestens drei lebende Seiten, davon eine aus einem anderen Bereich', () => {
    const topics = getRelatedTopics(PAGE_HREF_FLUGFUNK);
    expect(topics.length).toBeGreaterThanOrEqual(3);
    expect(topics.every((topic) => topic.node.status === 'live')).toBe(true);
    expect(topics.every((topic) => topic.node.href !== PAGE_HREF_FLUGFUNK)).toBe(true);
    expect(topics.some((topic) => !topic.node.href.startsWith('/wissen/funktechnik/'))).toBe(true);
  });

  it('nennt Lernziele und gliedert den Text in eindeutige Abschnitte', () => {
    expect(PAGE_GOALS_FLUGFUNK.length).toBeGreaterThanOrEqual(4);
    const ids = sectionIds(PAGE_SECTIONS_FLUGFUNK);
    expect(ids.length).toBeGreaterThanOrEqual(4);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('lässt sich vollständig in das Kapitelmodell übersetzen', () => {
    const sections = articleSections(PAGE_SECTIONS_FLUGFUNK);
    expect(sections).toHaveLength(PAGE_SECTIONS_FLUGFUNK.length);
    for (const section of sections) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.blocks.length).toBeGreaterThan(0);
    }
  });

  it('enthält die Abschnitte, auf die die Route zugreift', () => {
    const ids = sectionIds(PAGE_SECTIONS_FLUGFUNK);
    for (const id of ['sprechfunk', 'kanalabstand', 'notfrequenzen', 'navigation', 'ueberwachung', 'daten-und-hf']) expect(ids, id).toContain(id);
  });
});
