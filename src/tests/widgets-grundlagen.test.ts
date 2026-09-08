// @vitest-environment node
/**
 * Kapitel „Grundlagen" (/wissen/grundlagen/): Rechenmodell der EM-Welle,
 * SSR-Rendering der beiden neuen Widgets, Kapiteldaten und Anmeldung in
 * Navigation, Beziehungen und Widget-Katalog.
 *
 * Läuft in der Node-Umgebung, damit `render` aus 'svelte/server' die
 * Komponenten serverseitig erzeugt (wie in widgets-mount.test.ts).
 */
import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
// @ts-expect-error – jsdom ist nur Laufzeit-Abhängigkeit der Testumgebung (keine Typen)
import { JSDOM } from 'jsdom';
import type { Component } from 'svelte';
import EmWaveWidget from '$lib/components/widgets/EmWaveWidget.svelte';
import FieldStrengthWidget from '$lib/components/widgets/FieldStrengthWidget.svelte';
import ArticleLayout from '$lib/components/knowledge/ArticleLayout.svelte';
import { WIDGETS } from '$lib/components/knowledge/widgetRegistry';
import { WIDGET_META } from '$lib/data/widgets';
import {
  CIRCULAR_TO_LINEAR_LOSS_DB,
  CROSS_POLARIZATION_LOSS_DB,
  EM_WAVE_LIMITS,
  IONIZING_BOUNDARY_FREQUENCY,
  POLARIZATION_LABELS,
  STAGE_MAX_CYCLES,
  STAGE_MIN_CYCLES,
  fieldSamples,
  fraunhoferDistanceM,
  frontVector,
  isCircular,
  isIonizing,
  magneticFromElectric,
  periodS,
  photonEnergyEv,
  photonEnergyJoule,
  polarizationLossDb,
  reactiveNearFieldM,
  stageLengthM,
  tiltLossDb,
  visibleCycles,
  waveNumber,
  type Polarization
} from '$lib/components/widgets/EmWaveModel';
import { grundlagenHub } from '$lib/content/grundlagen/index';
import { emWellenArticle } from '$lib/content/grundlagen/em-wellen';
import { dezibelArticle } from '$lib/content/grundlagen/dezibel';
import { leistungUndPegelArticle } from '$lib/content/grundlagen/leistung-und-pegel';
import type { KnowledgeArticle } from '$lib/content/types';
import { findNode, getHubChildren } from '$lib/data/navigation';
import { getRelatedTopics } from '$lib/data/relations';
import { PLANCK_CONSTANT, SPEED_OF_LIGHT } from '$lib/data/constants';
import { frequencyToWavelength } from '$lib/utils/calculations';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = Component<any>;

function renderToDom(component: AnyComponent, props: Record<string, unknown> = {}): HTMLElement {
  const { body } = render(component, { props });
  const dom = new JSDOM(`<div id="root">${body}</div>`);
  return dom.window.document.getElementById('root') as HTMLElement;
}

const ROUTE_FILES = new Set([
  ...Object.keys(import.meta.glob('/src/routes/**/+page.svelte')),
  ...Object.keys(import.meta.glob('/src/routes/**/+page.ts'))
]);

const KAPITEL: [string, KnowledgeArticle][] = [
  ['Grundlagen-Hub', grundlagenHub],
  ['Elektromagnetische Wellen', emWellenArticle],
  ['Dezibel und Pegel', dezibelArticle],
  ['Leistung, EIRP und Feldstärke', leistungUndPegelArticle]
];

const ALLE_POLARISATIONEN = Object.keys(POLARIZATION_LABELS) as Polarization[];

// ============================================================================
// Rechenmodell der Welle
// ============================================================================

describe('EmWaveModel — Welle, Nah- und Fernfeld', () => {
  it('rechnet Periodendauer und Wellenzahl', () => {
    expect(periodS(100e6)).toBeCloseTo(1e-8, 15);
    expect(periodS(0)).toBe(0);
    expect(waveNumber(2 * Math.PI)).toBeCloseTo(1, 12);
  });

  it('koppelt E und H über den Feldwellenwiderstand', () => {
    expect(magneticFromElectric(376.730313668)).toBeCloseTo(1, 9);
  });

  it('setzt die Nahfeldgrenze auf λ/2π und das Fernfeld auf 2·D²/λ', () => {
    const lambda = frequencyToWavelength(100e6);
    expect(reactiveNearFieldM(lambda)).toBeCloseTo(lambda / (2 * Math.PI), 12);
    expect(fraunhoferDistanceM(1.2, 0.03)).toBeCloseTo(96, 6);
    expect(fraunhoferDistanceM(0, 0.03)).toBe(0);
  });
});

describe('EmWaveModel — Photonenenergie', () => {
  it('rechnet E = h·f', () => {
    expect(photonEnergyJoule(1e12)).toBeCloseTo(PLANCK_CONSTANT * 1e12, 40);
    expect(photonEnergyJoule(0)).toBe(0);
  });

  it('liefert an der ICNIRP-Grenze rund 12,4 eV', () => {
    expect(IONIZING_BOUNDARY_FREQUENCY).toBeCloseTo(SPEED_OF_LIGHT / 100e-9, 3);
    expect(photonEnergyEv(IONIZING_BOUNDARY_FREQUENCY)).toBeCloseTo(12.4, 1);
  });

  it('zählt Funkwellen und sichtbares Licht zur nichtionisierenden Strahlung', () => {
    expect(isIonizing(100e6)).toBe(false);
    expect(isIonizing(5e14)).toBe(false);
    expect(isIonizing(1e16)).toBe(true);
  });
});

describe('EmWaveModel — Polarisation', () => {
  it('erkennt zirkulare Zustände', () => {
    expect(isCircular('rhcp')).toBe(true);
    expect(isCircular('lhcp')).toBe(true);
    expect(isCircular('linear-h')).toBe(false);
  });

  it('kostet gleiche Polarisation nichts', () => {
    for (const polarisation of ALLE_POLARISATIONEN) {
      expect(polarizationLossDb(polarisation, polarisation)).toBe(0);
    }
  });

  it('kostet der Übergang linear ↔ zirkular 3,01 dB', () => {
    expect(CIRCULAR_TO_LINEAR_LOSS_DB).toBeCloseTo(3.01, 2);
    expect(polarizationLossDb('linear-v', 'rhcp')).toBeCloseTo(CIRCULAR_TO_LINEAR_LOSS_DB, 12);
    expect(polarizationLossDb('lhcp', 'linear-h')).toBeCloseTo(CIRCULAR_TO_LINEAR_LOSS_DB, 12);
  });

  it('setzt orthogonale Polarisationen auf den Kreuzpolarisationswert', () => {
    expect(polarizationLossDb('linear-h', 'linear-v')).toBe(CROSS_POLARIZATION_LOSS_DB);
    expect(polarizationLossDb('rhcp', 'lhcp')).toBe(CROSS_POLARIZATION_LOSS_DB);
    expect(CROSS_POLARIZATION_LOSS_DB).toBeGreaterThanOrEqual(20);
  });

  it('folgt bei Verdrehung dem cos²-Gesetz', () => {
    expect(tiltLossDb(0)).toBeCloseTo(0, 12);
    expect(tiltLossDb(45)).toBeCloseTo(3.01, 2);
    expect(tiltLossDb(60)).toBeCloseTo(6.02, 2);
    expect(tiltLossDb(90)).toBe(CROSS_POLARIZATION_LOSS_DB);
  });
});

describe('EmWaveModel — Feldvektoren', () => {
  const optionen = { cycles: 2, samples: 64, phaseRad: 0.7 };

  it('hält E und H in der Querebene senkrecht zueinander', () => {
    for (const polarization of ALLE_POLARISATIONEN) {
      for (const s of fieldSamples({ ...optionen, polarization })) {
        expect(s.ey * s.hy + s.ez * s.hz).toBeCloseTo(0, 12);
      }
    }
  });

  it('normiert die Amplitude auf eins', () => {
    for (const polarization of ALLE_POLARISATIONEN) {
      for (const s of fieldSamples({ ...optionen, polarization })) {
        expect(Math.hypot(s.ey, s.ez)).toBeLessThanOrEqual(1 + 1e-12);
        expect(Math.hypot(s.hy, s.hz)).toBeCloseTo(Math.hypot(s.ey, s.ez), 12);
      }
    }
  });

  it('lässt lineare Wellen in einer Ebene schwingen', () => {
    for (const s of fieldSamples({ ...optionen, polarization: 'linear-v' })) {
      expect(s.ez).toBe(0);
    }
    for (const s of fieldSamples({ ...optionen, polarization: 'linear-h' })) {
      expect(s.ey).toBe(0);
    }
  });

  it('lässt den E-Vektor zirkular rotieren — gegensinnig bei LHCP', () => {
    const rechts = fieldSamples({ ...optionen, polarization: 'rhcp' });
    const links = fieldSamples({ ...optionen, polarization: 'lhcp' });
    for (const s of rechts) expect(Math.hypot(s.ey, s.ez)).toBeCloseTo(1, 12);
    for (let i = 0; i < rechts.length; i += 1) {
      expect(links[i].ez).toBeCloseTo(-rechts[i].ez, 12);
      expect(links[i].ey).toBeCloseTo(rechts[i].ey, 12);
    }
  });

  it('dreht den Frontvektor mit der Phase', () => {
    const start = frontVector(0, 'rhcp');
    const viertel = frontVector(Math.PI / 2, 'rhcp');
    expect(start.ey).toBeCloseTo(1, 12);
    expect(viertel.ey).toBeCloseTo(0, 12);
    expect(frontVector(0, 'linear-v').ez).toBe(0);
  });

  it('liefert bei zu wenigen Abtastpunkten trotzdem zwei', () => {
    expect(fieldSamples({ ...optionen, samples: 1, polarization: 'linear-v' })).toHaveLength(2);
  });
});

describe('EmWaveModel — Bühnenmaßstab', () => {
  it('begrenzt die sichtbaren Wellenzüge', () => {
    expect(visibleCycles(EM_WAVE_LIMITS.frequencyHz.min)).toBeCloseTo(STAGE_MIN_CYCLES, 9);
    expect(visibleCycles(EM_WAVE_LIMITS.frequencyHz.max)).toBeLessThanOrEqual(STAGE_MAX_CYCLES);
    expect(visibleCycles(1e12)).toBeGreaterThan(visibleCycles(1e6));
  });

  it('nennt die Bühnenlänge als Vielfaches der Wellenlänge', () => {
    const f = EM_WAVE_LIMITS.frequencyHz.default;
    expect(stageLengthM(f)).toBeCloseTo(visibleCycles(f) * frequencyToWavelength(f), 9);
  });
});

// ============================================================================
// Widgets
// ============================================================================

const NEUE_WIDGETS: { name: string; component: AnyComponent; sliders: number }[] = [
  { name: 'EmWaveWidget', component: EmWaveWidget, sliders: 2 },
  { name: 'FieldStrengthWidget', component: FieldStrengthWidget, sliders: 3 }
];

describe('Widgets der Grundlagen', () => {
  for (const widget of NEUE_WIDGETS) {
    it(`${widget.name}: SVG, Regler mit Label, sr-only-Wertetabelle, Titel als h3`, () => {
      const root = renderToDom(widget.component);
      expect(root.querySelector('svg')).not.toBeNull();
      expect(root.querySelectorAll('input[type="range"]')).toHaveLength(widget.sliders);
      expect(root.querySelector('.sr-only table')).not.toBeNull();
      expect(root.querySelector('h3')).not.toBeNull();
      for (const input of root.querySelectorAll('input[type="range"]')) {
        expect(root.querySelector(`label[for="${input.id}"]`)).not.toBeNull();
      }
    });
  }

  it('EmWaveWidget: Pause-Schaltfläche und Polarisationsauswahl', () => {
    const root = renderToDom(EmWaveWidget);
    expect(root.querySelector('button[aria-pressed]')).not.toBeNull();
    const select = root.querySelector('select');
    expect(select).not.toBeNull();
    expect(select?.querySelectorAll('option')).toHaveLength(ALLE_POLARISATIONEN.length);
  });

  it('FieldStrengthWidget: ein Balken je Vergleichsabstand', () => {
    const root = renderToDom(FieldStrengthWidget);
    expect(root.querySelectorAll('svg rect').length).toBeGreaterThanOrEqual(5);
  });

  it('ist im Widget-Register und im Katalog angemeldet', () => {
    for (const id of ['em-wave', 'field-strength'] as const) {
      expect(WIDGETS[id]).toBeDefined();
      const meta = WIDGET_META[id];
      expect(meta).toBeDefined();
      expect(meta?.keywords.length ?? 0).toBeGreaterThan(2);
      expect(findNode(meta?.chapterHref ?? '')).toBeDefined();
    }
    expect(WIDGET_META['em-wave']?.chapterHref).toBe(emWellenArticle.href);
    expect(WIDGET_META['field-strength']?.chapterHref).toBe(leistungUndPegelArticle.href);
  });
});

// ============================================================================
// Kapitelinhalte
// ============================================================================

describe.each(KAPITEL)('Kapitel %s', (_name, article) => {
  it('nennt Lernziele, Abschnitte und Quellen', () => {
    expect(article.goals.length).toBeGreaterThanOrEqual(4);
    expect(article.sections.length).toBeGreaterThanOrEqual(3);
    expect(article.sources?.length ?? 0).toBeGreaterThanOrEqual(3);
    expect(article.lead.length).toBeGreaterThan(80);
  });

  it('vergibt eindeutige Anker-IDs ohne Umlaute', () => {
    const ids = article.sections.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
  });

  it('ist als lebender Knoten mit Route registriert', () => {
    const node = findNode(article.href);
    expect(node?.status).toBe('live');
    expect(node?.label).toBeTruthy();
    expect(ROUTE_FILES.has(`/src/routes${article.href}+page.svelte`)).toBe(true);
    expect(ROUTE_FILES.has(`/src/routes${article.href}+page.ts`)).toBe(true);
  });

  it('verweist auf mindestens drei lebende Seiten', () => {
    const topics = getRelatedTopics(article.href);
    expect(topics.length).toBeGreaterThanOrEqual(3);
    expect(topics.every((topic) => topic.node.status === 'live')).toBe(true);
  });
});

describe('Kapitelstruktur', () => {
  it('führt genau die drei Unterkapitel unter dem Hub', () => {
    expect(getHubChildren(grundlagenHub.href).map((node) => node.href)).toEqual([
      emWellenArticle.href,
      dezibelArticle.href,
      leistungUndPegelArticle.href
    ]);
  });

  it('bettet in jedem Unterkapitel genau ein Widget ein', () => {
    const erwartet: [KnowledgeArticle, string][] = [
      [emWellenArticle, 'em-wave'],
      [dezibelArticle, 'decibel'],
      [leistungUndPegelArticle, 'field-strength']
    ];
    for (const [article, id] of erwartet) {
      const ids = article.sections.flatMap((section) =>
        section.blocks.filter((block) => block.type === 'widget').map((block) => block.id)
      );
      expect(ids).toContain(id);
    }
  });

  it('verlinkt bereichsübergreifend in Rechner und Spektrum', () => {
    for (const article of [emWellenArticle, dezibelArticle, leistungUndPegelArticle]) {
      const ziele = getRelatedTopics(article.href).map((topic) => topic.node.href);
      expect(ziele.some((ziel) => !ziel.startsWith('/wissen/'))).toBe(true);
    }
  });

  it('nutzt in allen Verweisen einen Trailing Slash', () => {
    const html = JSON.stringify(KAPITEL.map(([, article]) => article));
    for (const match of html.matchAll(/href=\\"([^"\\]+)\\"/g)) {
      expect(match[1].endsWith('/'), match[1]).toBe(true);
    }
  });

  it('rendert die drei Kapitel ohne Fehler', () => {
    for (const article of [emWellenArticle, dezibelArticle, leistungUndPegelArticle]) {
      const root = renderToDom(ArticleLayout as AnyComponent, { article });
      expect(root.querySelector('h1')?.textContent).toContain(article.title);
      expect(root.querySelectorAll('h2').length).toBeGreaterThanOrEqual(article.sections.length);
    }
  });
});
