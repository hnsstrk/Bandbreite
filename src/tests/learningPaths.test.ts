/**
 * Lernpfade: Struktur der Daten und ihre Verankerung im Navigationsbaum.
 *
 * Geprüft wird gegen `NAV_TREE` — ein Pfadschritt darf nur auf eine Seite
 * zeigen, die es wirklich gibt. Fehlt ein Kapitel (etwa weil es noch
 * entsteht), blendet `resolvePathSteps` den Schritt zur Laufzeit aus; hier
 * schlägt der Test dann fehl und weist auf die Lücke hin.
 */

import { describe, it, expect } from 'vitest';
import {
  LEARNING_PATHS,
  LEVEL_LABELS,
  LEVEL_TONES,
  findLearningPath,
  learningPathHref,
  learningPathsForHref,
  resolvePathSteps
} from '$lib/data/learningPaths';
import { findNode } from '$lib/data/navigation';
import { getRelatedTopics } from '$lib/data/relations';
import { ICON_NAMES } from '$lib/components/ui/icons';
import { slugify } from '$lib/utils/slug';

/** Alle vorhandenen Routen- und Metadaten-Dateien, von Vite eingesammelt. */
const ROUTE_FILES = new Set([
  ...Object.keys(import.meta.glob('/src/routes/**/+page.svelte')),
  ...Object.keys(import.meta.glob('/src/routes/**/+page.ts'))
]);

const alleSchritte = LEARNING_PATHS.flatMap((path) =>
  path.steps.map((step) => ({ path, step }))
);

describe('LEARNING_PATHS', () => {
  it('führt vier Pfade mit eindeutigen IDs', () => {
    expect(LEARNING_PATHS).toHaveLength(4);
    expect(new Set(LEARNING_PATHS.map((path) => path.id)).size).toBe(4);
  });

  it('nutzt als ID einen Slug ohne Umlaute', () => {
    for (const path of LEARNING_PATHS) {
      expect(path.id).toBe(slugify(path.id));
    }
  });

  it.each(LEARNING_PATHS.map((path) => [path.id, path] as const))(
    '%s hat fünf bis neun Schritte, Titel, Einleitung und Stufe',
    (_id, path) => {
      expect(path.steps.length).toBeGreaterThanOrEqual(5);
      expect(path.steps.length).toBeLessThanOrEqual(9);
      expect(path.title.length).toBeGreaterThan(5);
      expect(path.lead.length).toBeGreaterThan(40);
      expect(Object.keys(LEVEL_LABELS)).toContain(path.level);
      expect(Object.keys(LEVEL_TONES)).toContain(path.level);
      expect(path.durationMin).toBeGreaterThanOrEqual(30);
      expect(path.durationMin).toBeLessThanOrEqual(180);
      expect(ICON_NAMES).toContain(path.icon);
    }
  );

  it('nennt in jedem Pfad jede Seite höchstens einmal', () => {
    for (const path of LEARNING_PATHS) {
      const hrefs = path.steps.map((step) => step.href);
      expect(new Set(hrefs).size, path.id).toBe(hrefs.length);
    }
  });

  it('führt jeden Schritt mit Titel und Lernziel', () => {
    for (const { path, step } of alleSchritte) {
      expect(step.title.length, `${path.id} → ${step.href}`).toBeGreaterThan(3);
      expect(step.goal.length, `${path.id} → ${step.href}`).toBeGreaterThan(20);
      expect(step.goal.endsWith('.'), `${path.id} → ${step.href}`).toBe(true);
    }
  });

  it('beginnt und endet jeden Schritt-href mit einem Schrägstrich', () => {
    for (const { step } of alleSchritte) {
      expect(step.href.startsWith('/')).toBe(true);
      expect(step.href.endsWith('/')).toBe(true);
      expect(step.href).not.toContain('?');
      expect(step.href).not.toContain('#');
    }
  });

  it('beginnt jeden Pfad mit einem Pflichtschritt', () => {
    for (const path of LEARNING_PATHS) {
      expect(path.steps[0].optional ?? false, path.id).toBe(false);
    }
  });

  it('führt jeden Pfad über mindestens zwei Bereiche', () => {
    for (const path of LEARNING_PATHS) {
      const bereiche = new Set(path.steps.map((step) => step.href.split('/')[1]));
      expect(bereiche.size, path.id).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('Verankerung im Navigationsbaum', () => {
  it.each(alleSchritte.map(({ path, step }) => [`${path.id} → ${step.href}`, step.href] as const))(
    '%s zeigt auf einen lebenden Knoten',
    (_label, href) => {
      const node = findNode(href);
      expect(node, `${href} fehlt in NAV_TREE`).toBeDefined();
      expect(node?.status).toBe('live');
    }
  );

  it('blendet keinen Schritt aus — jeder Pfad ist vollständig begehbar', () => {
    for (const path of LEARNING_PATHS) {
      expect(resolvePathSteps(path).length, path.id).toBe(path.steps.length);
    }
  });
});

describe('resolvePathSteps', () => {
  const path = LEARNING_PATHS[0];

  it('nummeriert die aufgelösten Schritte lückenlos ab 1', () => {
    const steps = resolvePathSteps(path);
    expect(steps.map((step) => step.position)).toEqual(
      steps.map((_step, index) => index + 1)
    );
  });

  it('reicht den Navigationsknoten mit durch', () => {
    for (const step of resolvePathSteps(path)) {
      expect(step.node.href).toBe(step.href);
      expect(step.node.status).toBe('live');
    }
  });

  it('liefert für einen unbekannten Pfad eine leere Liste', () => {
    expect(resolvePathSteps(undefined)).toEqual([]);
  });

  it('lässt keinen Schritt auf eine geplante oder fehlende Seite zu', () => {
    for (const p of LEARNING_PATHS) {
      for (const step of resolvePathSteps(p)) {
        expect(findNode(step.href)?.status).toBe('live');
      }
    }
  });
});

describe('Hilfsfunktionen', () => {
  it('findet Pfade über ihre ID', () => {
    expect(findLearningPath('radar-verstehen')?.title).toBe('Radar verstehen');
    expect(findLearningPath('gibt-es-nicht')).toBeUndefined();
  });

  it('bildet die Detailroute mit Trailing Slash', () => {
    for (const path of LEARNING_PATHS) {
      expect(learningPathHref(path.id)).toBe(`/wissen/lernpfade/${path.id}/`);
    }
  });

  it('findet zu einer Route die Pfade, die sie enthalten', () => {
    expect(learningPathsForHref('/wissen/antennen/').map((path) => path.id)).toContain(
      'amateurfunk-einstieg'
    );
    expect(learningPathsForHref('/service/sitemap/')).toEqual([]);
  });
});

describe('Seite /wissen/lernpfade/', () => {
  const HREF = '/wissen/lernpfade/';

  it('ist als lebender Knoten registriert', () => {
    const node = findNode(HREF);
    expect(node?.id).toBe('wissen.lernpfade');
    expect(node?.status).toBe('live');
    expect(node?.description?.length ?? 0).toBeGreaterThan(20);
  });

  it('hat Route, Metadaten-Lader und eine Detailroute', () => {
    expect(ROUTE_FILES.has('/src/routes/wissen/lernpfade/+page.svelte')).toBe(true);
    expect(ROUTE_FILES.has('/src/routes/wissen/lernpfade/+page.ts')).toBe(true);
    expect(ROUTE_FILES.has('/src/routes/wissen/lernpfade/[slug]/+page.svelte')).toBe(true);
    expect(ROUTE_FILES.has('/src/routes/wissen/lernpfade/[slug]/+page.ts')).toBe(true);
  });

  it('verweist auf mindestens drei lebende Seiten', () => {
    const topics = getRelatedTopics(HREF);
    expect(topics.length).toBeGreaterThanOrEqual(3);
    expect(topics.every((topic) => topic.node.status === 'live')).toBe(true);
    expect(topics.some((topic) => topic.node.href.startsWith('/rechner/'))).toBe(true);
  });
});
