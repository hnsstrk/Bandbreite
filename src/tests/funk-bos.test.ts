/**
 * Tests der BOS-Daten: analoge Bänder mit ihrer Kanalregel, der Zeitstrahl und
 * die Vergleichstabelle. Geprüft werden Zahlenwerte und die Vollständigkeit
 * der Texte — nicht ihre Formatierung.
 */

import { describe, it, expect } from 'vitest';
import {
  BOS_2M_DUPLEX_OFFSET_HZ,
  BOS_4M_DUPLEX_OFFSET_HZ,
  BOS_ANALOG_BANDS,
  BOS_ANALOG_RASTER_HZ,
  BOS_COMPARISON,
  BOS_MILESTONES,
  BOS_TETRA_DUPLEX_OFFSET_HZ,
  BOS_TETRA_RASTER_HZ,
  BOS_TETRA_TIMESLOTS,
  bosChannelFrequency
} from '$lib/components/funk/BosTimelineModel';
import { EMERGENCY_FREQUENCIES } from '$lib/data/emergencyFrequencies';

/** Beide Bänder müssen vorhanden sein; der erste Test stellt das sicher. */
function band(id: '4m' | '2m') {
  const found = BOS_ANALOG_BANDS.find((entry) => entry.id === id);
  if (!found) throw new Error(`Band ${id} fehlt in BOS_ANALOG_BANDS.`);
  return found;
}

const band4m = band('4m');
const band2m = band('2m');

describe('Analoge BOS-Bänder', () => {
  it('führt genau das 4-m- und das 2-m-Band', () => {
    expect(BOS_ANALOG_BANDS.map((entry) => entry.id)).toEqual(['4m', '2m']);
    expect(band4m.nameDE.length).toBeGreaterThan(0);
    expect(band2m.nameDE.length).toBeGreaterThan(0);
  });

  it('legt Unter- und Oberband mit dem richtigen Duplexabstand fest', () => {
    expect(band4m.upperMinHz - band4m.lowerMinHz).toBe(BOS_4M_DUPLEX_OFFSET_HZ);
    expect(band2m.upperMinHz - band2m.lowerMinHz).toBe(BOS_2M_DUPLEX_OFFSET_HZ);
    expect(band2m.upperMaxHz - band2m.lowerMaxHz).toBe(BOS_2M_DUPLEX_OFFSET_HZ);
  });

  it('endet im 4-m-Oberband einen Rasterschritt früher — Kanal 510 gibt es nur unten', () => {
    expect(band4m.upperMaxHz - band4m.lowerMaxHz).toBe(
      BOS_4M_DUPLEX_OFFSET_HZ - BOS_ANALOG_RASTER_HZ
    );
    expect(band4m.noteDE?.length ?? 0).toBeGreaterThan(20);
  });

  it('lässt Kanalzahl und Bandbreite zusammenpassen', () => {
    for (const band of BOS_ANALOG_BANDS) {
      const spanHz = band.lowerMaxHz - band.lowerMinHz;
      const steps = band.lastChannel - band.firstChannel;
      expect(spanHz, band.id).toBe(steps * BOS_ANALOG_RASTER_HZ);
    }
  });

  it('rechnet die Kanalfrequenz nach der Rasterregel', () => {
    expect(bosChannelFrequency(band4m, 347)).toBe(74_215_000);
    expect(bosChannelFrequency(band4m, 348)).toBe(74_215_000 + BOS_ANALOG_RASTER_HZ);
    expect(bosChannelFrequency(band4m, 510)).toBe(77_475_000);
    expect(bosChannelFrequency(band2m, 201)).toBe(167_560_000);
    expect(bosChannelFrequency(band2m, 292)).toBe(169_380_000);
  });

  it('weist Kanäle außerhalb des Bereichs zurück', () => {
    expect(bosChannelFrequency(band4m, 346)).toBeUndefined();
    expect(bosChannelFrequency(band4m, 511)).toBeUndefined();
    expect(bosChannelFrequency(band4m, 400.5)).toBeUndefined();
  });

  it('gibt dem 4-m-Band die niedrigere Frequenz und damit die größere Reichweite', () => {
    expect(band4m.lowerMinHz).toBeLessThan(band2m.lowerMinHz);
  });
});

describe('TETRA-Kennwerte', () => {
  it('setzt Raster, Zeitschlitze und Duplexabstand wie im Standard', () => {
    expect(BOS_TETRA_RASTER_HZ).toBe(25_000);
    expect(BOS_TETRA_TIMESLOTS).toBe(4);
    expect(BOS_TETRA_DUPLEX_OFFSET_HZ).toBe(10_000_000);
  });

  it('passt zu den TETRA-Einträgen der Notfrequenz-Datenbank', () => {
    const uplink = EMERGENCY_FREQUENCIES.find((entry) => entry.id === 'bos-tetra-ul');
    const downlink = EMERGENCY_FREQUENCIES.find((entry) => entry.id === 'bos-tetra-dl');
    expect(uplink?.frequencyHz).toBe(380e6);
    expect(downlink?.frequencyHz).toBe(390e6);
    expect((downlink?.frequencyHz ?? 0) - (uplink?.frequencyHz ?? 0)).toBe(
      BOS_TETRA_DUPLEX_OFFSET_HZ
    );
  });

  it('deckt sich mit dem analogen 4-m-Eintrag der Notfrequenz-Datenbank', () => {
    const analog = EMERGENCY_FREQUENCIES.find((entry) => entry.id === 'bos-4m');
    expect(analog?.frequencyHz).toBe(band4m.lowerMinHz);
    expect(analog?.frequencyMaxHz).toBe(band4m.upperMaxHz);
  });
});

describe('Zeitstrahl', () => {
  it('ist chronologisch sortiert', () => {
    for (let i = 1; i < BOS_MILESTONES.length; i += 1) {
      expect(BOS_MILESTONES[i].year).toBeGreaterThanOrEqual(BOS_MILESTONES[i - 1].year);
    }
  });

  it('beschreibt jeden Meilenstein vollständig', () => {
    expect(BOS_MILESTONES.length).toBeGreaterThanOrEqual(6);
    for (const milestone of BOS_MILESTONES) {
      expect(milestone.labelDE.length).toBeGreaterThan(3);
      expect(milestone.titleDE.length).toBeGreaterThan(10);
      expect(milestone.textDE.length).toBeGreaterThan(40);
      expect(['analog', 'digital']).toContain(milestone.era);
    }
  });

  it('wechselt genau einmal von der analogen in die digitale Epoche', () => {
    const eras = BOS_MILESTONES.map((milestone) => milestone.era);
    const switches = eras.filter((era, index) => index > 0 && era !== eras[index - 1]);
    expect(switches).toHaveLength(1);
    expect(eras[0]).toBe('analog');
    expect(eras[eras.length - 1]).toBe('digital');
  });

  it('setzt die Gründung der BDBOS auf 2007 und den Netzabschluss auf 2016', () => {
    const years = BOS_MILESTONES.map((milestone) => milestone.year);
    expect(years).toContain(2007);
    expect(years).toContain(2016);
  });
});

describe('Vergleichstabelle', () => {
  it('füllt jede Zeile in beiden Spalten', () => {
    expect(BOS_COMPARISON.length).toBeGreaterThanOrEqual(6);
    for (const row of BOS_COMPARISON) {
      expect(row.aspectDE.length).toBeGreaterThan(3);
      expect(row.analogDE.length).toBeGreaterThan(10);
      expect(row.digitalDE.length).toBeGreaterThan(10);
    }
  });

  it('vergibt jedes Merkmal nur einmal', () => {
    const aspects = BOS_COMPARISON.map((row) => row.aspectDE);
    expect(new Set(aspects).size).toBe(aspects.length);
  });
});

// ============================================================================
// Seite, Navigation und Inhalte
// ============================================================================

import { findNode } from '$lib/data/navigation';
import { getRelatedTopics } from '$lib/data/relations';
import { sectionIds } from '$lib/content/funktechnik/types';
import { articleSections } from '$lib/content/funktechnik/adapt';
import { LEARNING_GOALS as PAGE_GOALS_BOS, SECTIONS as PAGE_SECTIONS_BOS } from '$lib/content/funktechnik/bos';

const PAGE_HREF_BOS = '/wissen/funktechnik/bos/';

const ROUTE_FILES_BOS = new Set([
  ...Object.keys(import.meta.glob('/src/routes/**/+page.svelte')),
  ...Object.keys(import.meta.glob('/src/routes/**/+page.ts'))
]);

describe('Seite /wissen/funktechnik/bos/', () => {
  it('ist als lebender Knoten registriert', () => {
    const node = findNode(PAGE_HREF_BOS);
    expect(node).toBeDefined();
    expect(node?.status).toBe('live');
    expect(node?.description?.length ?? 0).toBeGreaterThan(20);
    expect((node?.keywords ?? []).length).toBeGreaterThan(4);
  });

  it('hat Route und Metadaten-Lader', () => {
    expect(ROUTE_FILES_BOS.has(`/src/routes${PAGE_HREF_BOS}+page.svelte`)).toBe(true);
    expect(ROUTE_FILES_BOS.has(`/src/routes${PAGE_HREF_BOS}+page.ts`)).toBe(true);
  });

  it('verweist auf mindestens drei lebende Seiten, davon eine aus einem anderen Bereich', () => {
    const topics = getRelatedTopics(PAGE_HREF_BOS);
    expect(topics.length).toBeGreaterThanOrEqual(3);
    expect(topics.every((topic) => topic.node.status === 'live')).toBe(true);
    expect(topics.every((topic) => topic.node.href !== PAGE_HREF_BOS)).toBe(true);
    expect(topics.some((topic) => !topic.node.href.startsWith('/wissen/funktechnik/'))).toBe(true);
  });

  it('nennt Lernziele und gliedert den Text in eindeutige Abschnitte', () => {
    expect(PAGE_GOALS_BOS.length).toBeGreaterThanOrEqual(4);
    const ids = sectionIds(PAGE_SECTIONS_BOS);
    expect(ids.length).toBeGreaterThanOrEqual(4);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('lässt sich vollständig in das Kapitelmodell übersetzen', () => {
    const sections = articleSections(PAGE_SECTIONS_BOS);
    expect(sections).toHaveLength(PAGE_SECTIONS_BOS.length);
    for (const section of sections) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.blocks.length).toBeGreaterThan(0);
    }
  });

  it('enthält die Abschnitte, auf die die Route zugreift', () => {
    const ids = sectionIds(PAGE_SECTIONS_BOS);
    for (const id of ['grundlagen', 'analog', 'digitalfunk', 'alarmierung', 'recht']) expect(ids, id).toContain(id);
  });
});
