/**
 * Tests der Seefunk-Daten: UKW-Kanaltabelle nach VO Funk Appendix 18, die
 * Not- und Sicherheitsfrequenzen auf Grenz- und Kurzwelle sowie die
 * GMDSS-Seegebiete. Verglichen werden Zahlenwerte, keine formatierten Texte.
 */

import { describe, it, expect } from 'vitest';
import {
  GMDSS_SEA_AREAS,
  MARITIME_DISTRESS_MF_HZ,
  MARITIME_DISTRESS_VHF_HZ,
  MARITIME_DSC_MF_HZ,
  MARITIME_DSC_VHF_HZ,
  MARITIME_DUPLEX_OFFSET_HZ,
  MARITIME_HF_FREQUENCIES,
  MARITIME_LOW_POWER_W,
  MARITIME_USAGE_LABELS,
  MARITIME_VHF_CHANNELS,
  MARITIME_VHF_MAX_HZ,
  MARITIME_VHF_MIN_HZ,
  MARITIME_VHF_RASTER_HZ,
  NAVTEX_INTERNATIONAL_HZ,
  NAVTEX_NATIONAL_HZ,
  findMaritimeChannel,
  maritimeChannelsByUsage,
  maritimeChannelsForFrequency,
  maritimeUsageCounts,
  type MaritimeUsage
} from '$lib/data/maritimeChannels';

describe('UKW-Kanaltabelle', () => {
  it('enthält alle Kanäle 1 bis 28 und 60 bis 88 sowie die AIS-Kanäle', () => {
    expect(MARITIME_VHF_CHANNELS.length).toBeGreaterThanOrEqual(57);
    for (let n = 1; n <= 28; n += 1) {
      expect(findMaritimeChannel(String(n)), `Kanal ${n}`).toBeDefined();
    }
    for (let n = 60; n <= 88; n += 1) {
      expect(findMaritimeChannel(String(n)), `Kanal ${n}`).toBeDefined();
    }
    expect(findMaritimeChannel('AIS 1')).toBeDefined();
    expect(findMaritimeChannel('AIS 2')).toBeDefined();
  });

  it('legt die bekannten Frequenzen richtig fest', () => {
    expect(findMaritimeChannel('16')?.shipTxHz).toBe(MARITIME_DISTRESS_VHF_HZ);
    expect(findMaritimeChannel('70')?.shipTxHz).toBe(MARITIME_DSC_VHF_HZ);
    expect(findMaritimeChannel('13')?.shipTxHz).toBe(156_650_000);
    expect(findMaritimeChannel('06')?.shipTxHz).toBe(156_300_000);
    expect(findMaritimeChannel('AIS 1')?.shipTxHz).toBe(161_975_000);
    expect(findMaritimeChannel('AIS 2')?.shipTxHz).toBe(162_025_000);
  });

  it('ist bei der Kanalbezeichnung tolerant', () => {
    expect(findMaritimeChannel(' 6 ')?.channel).toBe('06');
    expect(findMaritimeChannel('06')?.channel).toBe('06');
    expect(findMaritimeChannel('ais1')?.channel).toBe('AIS 1');
    expect(findMaritimeChannel('99')).toBeUndefined();
  });

  it('hält jede Schiffsfrequenz im Band und auf dem 25-kHz-Raster', () => {
    for (const channel of MARITIME_VHF_CHANNELS) {
      expect(channel.shipTxHz).toBeGreaterThanOrEqual(MARITIME_VHF_MIN_HZ);
      expect(channel.shipTxHz).toBeLessThanOrEqual(MARITIME_VHF_MAX_HZ);
      expect(channel.shipTxHz % MARITIME_VHF_RASTER_HZ).toBe(0);
      expect(channel.coastTxHz % MARITIME_VHF_RASTER_HZ).toBe(0);
    }
  });

  it('setzt die Küstenfrequenz jedes Duplexkanals genau 4,6 MHz höher', () => {
    const duplex = MARITIME_VHF_CHANNELS.filter((channel) => channel.duplex);
    expect(duplex.length).toBeGreaterThan(20);
    for (const channel of duplex) {
      expect(channel.coastTxHz - channel.shipTxHz).toBe(MARITIME_DUPLEX_OFFSET_HZ);
    }
  });

  it('lässt Simplexkanäle auf derselben Frequenz senden', () => {
    for (const channel of MARITIME_VHF_CHANNELS.filter((entry) => !entry.duplex)) {
      expect(channel.coastTxHz).toBe(channel.shipTxHz);
    }
  });

  it('sortiert die Kanäle aufsteigend nach Schiffsfrequenz', () => {
    for (let i = 1; i < MARITIME_VHF_CHANNELS.length; i += 1) {
      expect(MARITIME_VHF_CHANNELS[i].shipTxHz).toBeGreaterThan(
        MARITIME_VHF_CHANNELS[i - 1].shipTxHz
      );
    }
  });

  it('bildet das Verschachtelungsmuster 60 / 01 / 61 / 02 ab', () => {
    const order = MARITIME_VHF_CHANNELS.slice(0, 4).map((channel) => channel.channel);
    expect(order).toEqual(['60', '01', '61', '02']);
  });

  it('begrenzt die Leistung auf den Bordverkehrs- und Schutzkanälen', () => {
    for (const id of ['15', '17', '75', '76']) {
      expect(findMaritimeChannel(id)?.maxPowerW, id).toBe(MARITIME_LOW_POWER_W);
    }
    expect(findMaritimeChannel('16')?.maxPowerW).toBeUndefined();
  });

  it('vergibt jedem Kanal eine bekannte Nutzungsart mit Beschreibung', () => {
    for (const channel of MARITIME_VHF_CHANNELS) {
      expect(MARITIME_USAGE_LABELS[channel.usage], channel.channel).toBeDefined();
      expect(channel.noteDE.length).toBeGreaterThan(15);
    }
  });
});

describe('Nachschlagen und Filtern', () => {
  it('findet den Kanal zu einer Frequenz', () => {
    const hits = maritimeChannelsForFrequency(MARITIME_DISTRESS_VHF_HZ);
    expect(hits.map((hit) => hit.channel.channel)).toContain('16');
    expect(hits.every((hit) => hit.direction === 'schiff' || hit.direction === 'kueste')).toBe(
      true
    );
  });

  it('unterscheidet Schiffs- und Küstenrichtung', () => {
    const shipSide = maritimeChannelsForFrequency(156_025_000);
    expect(shipSide.some((hit) => hit.channel.channel === '60' && hit.direction === 'schiff')).toBe(
      true
    );
    const coastSide = maritimeChannelsForFrequency(160_625_000);
    expect(
      coastSide.some((hit) => hit.channel.channel === '60' && hit.direction === 'kueste')
    ).toBe(true);
  });

  it('liefert außerhalb des Bandes keine Treffer', () => {
    expect(maritimeChannelsForFrequency(145_000_000)).toHaveLength(0);
    expect(maritimeChannelsForFrequency(Number.NaN)).toHaveLength(0);
  });

  it('filtert nach Nutzungsart', () => {
    expect(maritimeChannelsByUsage('alle')).toHaveLength(MARITIME_VHF_CHANNELS.length);
    const dsc = maritimeChannelsByUsage('dsc');
    expect(dsc).toHaveLength(1);
    expect(dsc[0].channel).toBe('70');
    const distress = maritimeChannelsByUsage('not-sicherheit');
    expect(distress.map((entry) => entry.channel)).toEqual(['16']);
  });

  it('zählt die Kanäle je Nutzungsart vollständig ab', () => {
    const counts = maritimeUsageCounts();
    const total = counts.reduce((sum, entry) => sum + entry.count, 0);
    expect(total).toBe(MARITIME_VHF_CHANNELS.length);
    for (const entry of counts) {
      expect(MARITIME_USAGE_LABELS[entry.id as MaritimeUsage]).toBe(entry.label);
    }
  });
});

describe('Grenz- und Kurzwelle', () => {
  it('führt 2182 kHz und 2187,5 kHz mit der richtigen Betriebsart', () => {
    const voice = MARITIME_HF_FREQUENCIES.find(
      (entry) => entry.frequencyHz === MARITIME_DISTRESS_MF_HZ
    );
    expect(voice?.mode).toBe('sprechfunk');
    const dsc = MARITIME_HF_FREQUENCIES.find((entry) => entry.frequencyHz === MARITIME_DSC_MF_HZ);
    expect(dsc?.mode).toBe('dsc');
  });

  it('führt beide NAVTEX-Frequenzen', () => {
    const navtex = MARITIME_HF_FREQUENCIES.filter((entry) => entry.mode === 'navtex');
    const frequencies = navtex.map((entry) => entry.frequencyHz);
    expect(frequencies).toContain(NAVTEX_INTERNATIONAL_HZ);
    expect(frequencies).toContain(NAVTEX_NATIONAL_HZ);
  });

  it('hat in jedem Kurzwellenband Sprechfunk, DSC und Funkfernschreiben', () => {
    for (const band of ['4-MHz-Band', '6-MHz-Band', '8-MHz-Band', '12-MHz-Band', '16-MHz-Band']) {
      const modes = MARITIME_HF_FREQUENCIES.filter((entry) => entry.bandDE === band).map(
        (entry) => entry.mode
      );
      expect(modes, band).toContain('sprechfunk');
      expect(modes, band).toContain('dsc');
      expect(modes, band).toContain('nbdp');
    }
  });

  it('ist aufsteigend sortiert und hat eindeutige Kennungen', () => {
    const ids = MARITIME_HF_FREQUENCIES.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (let i = 1; i < MARITIME_HF_FREQUENCIES.length; i += 1) {
      expect(MARITIME_HF_FREQUENCIES[i].frequencyHz).toBeGreaterThan(
        MARITIME_HF_FREQUENCIES[i - 1].frequencyHz
      );
    }
  });
});

describe('GMDSS-Seegebiete', () => {
  it('führt genau die vier Gebiete A1 bis A4 in dieser Reihenfolge', () => {
    expect(GMDSS_SEA_AREAS.map((area) => area.id)).toEqual(['A1', 'A2', 'A3', 'A4']);
  });

  it('beschreibt jedes Gebiet mit System und Ausrüstung', () => {
    for (const area of GMDSS_SEA_AREAS) {
      expect(area.systemDE.length).toBeGreaterThan(10);
      expect(area.equipmentDE.length).toBeGreaterThan(1);
      expect(area.descriptionDE.length).toBeGreaterThan(40);
    }
  });

  it('gibt nur für die küstennahen Gebiete eine Reichweite an', () => {
    expect(GMDSS_SEA_AREAS[0].typicalRangeNm).toBeGreaterThan(0);
    expect(GMDSS_SEA_AREAS[1].typicalRangeNm).toBeGreaterThan(
      GMDSS_SEA_AREAS[0].typicalRangeNm ?? 0
    );
    expect(GMDSS_SEA_AREAS[2].typicalRangeNm).toBeNull();
    expect(GMDSS_SEA_AREAS[3].typicalRangeNm).toBeNull();
  });
});

// ============================================================================
// Seite, Navigation und Inhalte
// ============================================================================

import { findNode } from '$lib/data/navigation';
import { getRelatedTopics } from '$lib/data/relations';
import { sectionIds } from '$lib/content/funktechnik/types';
import { articleSections } from '$lib/content/funktechnik/adapt';
import {
  LEARNING_GOALS as PAGE_GOALS_SEEFUNK,
  SECTIONS as PAGE_SECTIONS_SEEFUNK
} from '$lib/content/funktechnik/seefunk';

const PAGE_HREF_SEEFUNK = '/wissen/funktechnik/seefunk/';

const ROUTE_FILES_SEEFUNK = new Set([
  ...Object.keys(import.meta.glob('/src/routes/**/+page.svelte')),
  ...Object.keys(import.meta.glob('/src/routes/**/+page.ts'))
]);

describe('Seite /wissen/funktechnik/seefunk/', () => {
  it('ist als lebender Knoten registriert', () => {
    const node = findNode(PAGE_HREF_SEEFUNK);
    expect(node).toBeDefined();
    expect(node?.status).toBe('live');
    expect(node?.description?.length ?? 0).toBeGreaterThan(20);
    expect((node?.keywords ?? []).length).toBeGreaterThan(4);
  });

  it('hat Route und Metadaten-Lader', () => {
    expect(ROUTE_FILES_SEEFUNK.has(`/src/routes${PAGE_HREF_SEEFUNK}+page.svelte`)).toBe(true);
    expect(ROUTE_FILES_SEEFUNK.has(`/src/routes${PAGE_HREF_SEEFUNK}+page.ts`)).toBe(true);
  });

  it('verweist auf mindestens drei lebende Seiten, davon eine aus einem anderen Bereich', () => {
    const topics = getRelatedTopics(PAGE_HREF_SEEFUNK);
    expect(topics.length).toBeGreaterThanOrEqual(3);
    expect(topics.every((topic) => topic.node.status === 'live')).toBe(true);
    expect(topics.every((topic) => topic.node.href !== PAGE_HREF_SEEFUNK)).toBe(true);
    expect(topics.some((topic) => !topic.node.href.startsWith('/wissen/funktechnik/'))).toBe(true);
  });

  it('nennt Lernziele und gliedert den Text in eindeutige Abschnitte', () => {
    expect(PAGE_GOALS_SEEFUNK.length).toBeGreaterThanOrEqual(4);
    const ids = sectionIds(PAGE_SECTIONS_SEEFUNK);
    expect(ids.length).toBeGreaterThanOrEqual(4);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('lässt sich vollständig in das Kapitelmodell übersetzen', () => {
    const sections = articleSections(PAGE_SECTIONS_SEEFUNK);
    expect(sections).toHaveLength(PAGE_SECTIONS_SEEFUNK.length);
    for (const section of sections) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.blocks.length).toBeGreaterThan(0);
    }
  });

  it('enthält die Abschnitte, auf die die Route zugreift', () => {
    const ids = sectionIds(PAGE_SECTIONS_SEEFUNK);
    for (const id of [
      'gmdss',
      'ukw-seefunk',
      'dsc',
      'grenzwelle-kurzwelle',
      'navtex-ais',
      'satellit',
      'betrieb'
    ])
      expect(ids, id).toContain(id);
  });
});
