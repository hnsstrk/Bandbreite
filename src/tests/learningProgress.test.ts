/**
 * Fortschritt auf einem Lernpfad — Zustand, Speicherformat und die Position
 * innerhalb des aktiven Pfads. Der `localStorage` stammt aus jsdom.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  learningProgress,
  STORAGE_KEY,
  SCHEMA_VERSION
} from '$lib/components/learning/learningProgress.svelte';
import { LEARNING_PATHS, resolvePathSteps } from '$lib/data/learningPaths';

const PFAD = LEARNING_PATHS[0];
const SCHRITTE = resolvePathSteps(PFAD);
const ERSTER = SCHRITTE[0].href;
const ZWEITER = SCHRITTE[1].href;

/** Rohzustand aus dem Speicher lesen. */
function gespeichert(): Record<string, unknown> | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
}

beforeEach(() => {
  localStorage.clear();
  learningProgress.load();
});

describe('Pfad starten und verlassen', () => {
  it('merkt sich den aktiven Pfad', () => {
    expect(learningProgress.activePathId).toBeNull();
    learningProgress.startPath(PFAD.id);
    expect(learningProgress.activePathId).toBe(PFAD.id);
    expect(learningProgress.activePath?.title).toBe(PFAD.title);
  });

  it('ignoriert unbekannte Pfade', () => {
    learningProgress.startPath('gibt-es-nicht');
    expect(learningProgress.activePathId).toBeNull();
  });

  it('behält den Fortschritt beim Verlassen', () => {
    learningProgress.startPath(PFAD.id);
    learningProgress.markDone(ERSTER);
    learningProgress.leave();
    expect(learningProgress.activePathId).toBeNull();
    expect(learningProgress.progress(PFAD.id).done).toBe(1);
  });
});

describe('visit und markDone', () => {
  beforeEach(() => learningProgress.startPath(PFAD.id));

  it('vermerkt nur Routen, die zum Pfad gehören', () => {
    learningProgress.visit(ERSTER);
    learningProgress.visit('/service/sitemap/');
    expect(learningProgress.isVisited(ERSTER)).toBe(true);
    expect(learningProgress.isVisited('/service/sitemap/')).toBe(false);
    expect(learningProgress.progress(PFAD.id).visited).toBe(1);
  });

  it('ergänzt einen fehlenden Schrägstrich', () => {
    learningProgress.visit(ERSTER.slice(0, -1));
    expect(learningProgress.isVisited(ERSTER)).toBe(true);
  });

  it('zählt jede Route nur einmal', () => {
    learningProgress.visit(ERSTER);
    learningProgress.visit(ERSTER);
    learningProgress.markDone(ERSTER);
    learningProgress.markDone(ERSTER);
    expect(learningProgress.progress(PFAD.id).visited).toBe(1);
    expect(learningProgress.progress(PFAD.id).done).toBe(1);
  });

  it('markiert einen erledigten Schritt zugleich als besucht', () => {
    learningProgress.markDone(ZWEITER);
    expect(learningProgress.isVisited(ZWEITER)).toBe(true);
    expect(learningProgress.isDone(ZWEITER)).toBe(true);
  });

  it('nimmt die Markierung wieder zurück', () => {
    learningProgress.markDone(ERSTER);
    learningProgress.markOpen(ERSTER);
    expect(learningProgress.isDone(ERSTER)).toBe(false);
    expect(learningProgress.isVisited(ERSTER)).toBe(true);
  });

  it('schreibt nichts ohne aktiven Pfad', () => {
    learningProgress.leave();
    learningProgress.visit(ERSTER);
    learningProgress.markDone(ERSTER);
    expect(learningProgress.progress(PFAD.id).done).toBe(0);
  });
});

describe('progress', () => {
  it('meldet den unberührten Pfad als nicht begonnen', () => {
    const stand = learningProgress.progress(PFAD.id);
    expect(stand.total).toBe(SCHRITTE.length);
    expect(stand.done).toBe(0);
    expect(stand.percent).toBe(0);
    expect(stand.started).toBe(false);
    expect(stand.complete).toBe(false);
    expect(stand.nextHref).toBe(ERSTER);
  });

  it('rechnet den Anteil erledigter Schritte aus', () => {
    learningProgress.startPath(PFAD.id);
    learningProgress.markDone(ERSTER);
    const stand = learningProgress.progress(PFAD.id);
    expect(stand.done).toBe(1);
    expect(stand.percent).toBeCloseTo((1 / SCHRITTE.length) * 100, 6);
    expect(stand.started).toBe(true);
    expect(stand.nextHref).toBe(ZWEITER);
  });

  it('zählt die Pflichtschritte ohne die optionalen', () => {
    const stand = learningProgress.progress(PFAD.id);
    const optionale = SCHRITTE.filter((step) => step.optional).length;
    expect(stand.required).toBe(SCHRITTE.length - optionale);
  });

  it('erkennt den vollständig abgeschlossenen Pfad', () => {
    learningProgress.startPath(PFAD.id);
    for (const step of SCHRITTE) learningProgress.markDone(step.href);
    const stand = learningProgress.progress(PFAD.id);
    expect(stand.complete).toBe(true);
    expect(stand.percent).toBe(100);
  });

  it('liefert für einen unbekannten Pfad einen leeren Stand', () => {
    const stand = learningProgress.progress('gibt-es-nicht');
    expect(stand.total).toBe(0);
    expect(stand.percent).toBe(0);
    expect(stand.nextHref).toBeNull();
  });
});

describe('currentStep', () => {
  it('liefert ohne aktiven Pfad nichts', () => {
    expect(learningProgress.currentStep(ERSTER)).toBeNull();
  });

  it('liefert Position, Nachbarn und Fortschritt', () => {
    learningProgress.startPath(PFAD.id);
    const aktuell = learningProgress.currentStep(ZWEITER);
    expect(aktuell?.number).toBe(2);
    expect(aktuell?.total).toBe(SCHRITTE.length);
    expect(aktuell?.prev?.href).toBe(ERSTER);
    expect(aktuell?.next?.href).toBe(SCHRITTE[2].href);
    expect(aktuell?.done).toBe(false);
    expect(aktuell?.progress.pathId).toBe(PFAD.id);
  });

  it('kennt am Anfang keinen Vorgänger und am Ende keinen Nachfolger', () => {
    learningProgress.startPath(PFAD.id);
    expect(learningProgress.currentStep(ERSTER)?.prev).toBeUndefined();
    expect(learningProgress.currentStep(SCHRITTE.at(-1)!.href)?.next).toBeUndefined();
  });

  it('schweigt auf Routen außerhalb des Pfads', () => {
    learningProgress.startPath(PFAD.id);
    expect(learningProgress.currentStep('/service/sitemap/')).toBeNull();
  });
});

describe('Speicherformat', () => {
  it('schreibt versioniert in den localStorage', () => {
    learningProgress.startPath(PFAD.id);
    learningProgress.markDone(ERSTER);
    const roh = gespeichert();
    expect(roh?.version).toBe(SCHEMA_VERSION);
    expect(roh?.activeId).toBe(PFAD.id);
  });

  it('liest einen gespeicherten Stand wieder ein', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: SCHEMA_VERSION,
        activeId: PFAD.id,
        paths: { [PFAD.id]: { visited: [ERSTER], done: [ERSTER] } }
      })
    );
    learningProgress.load();
    expect(learningProgress.activePathId).toBe(PFAD.id);
    expect(learningProgress.progress(PFAD.id).done).toBe(1);
  });

  it('verwirft einen Stand mit anderer Schemaversion', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: SCHEMA_VERSION + 1, activeId: PFAD.id, paths: {} })
    );
    learningProgress.load();
    expect(learningProgress.activePathId).toBeNull();
  });

  it('verwirft unlesbare oder fremde Inhalte', () => {
    localStorage.setItem(STORAGE_KEY, '{kein json');
    learningProgress.load();
    expect(learningProgress.activePathId).toBeNull();

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: SCHEMA_VERSION,
        activeId: 'gibt-es-nicht',
        paths: { 'gibt-es-nicht': { visited: [ERSTER], done: 5 } }
      })
    );
    learningProgress.load();
    expect(learningProgress.activePathId).toBeNull();
    expect(learningProgress.progress('gibt-es-nicht').total).toBe(0);
  });
});

describe('reset', () => {
  beforeEach(() => {
    learningProgress.startPath(PFAD.id);
    learningProgress.markDone(ERSTER);
  });

  it('löscht einen einzelnen Pfad samt Aktivierung', () => {
    learningProgress.reset(PFAD.id);
    expect(learningProgress.progress(PFAD.id).done).toBe(0);
    expect(learningProgress.activePathId).toBeNull();
  });

  it('löscht ohne ID alles', () => {
    learningProgress.reset();
    expect(learningProgress.activePathId).toBeNull();
    expect(learningProgress.progress(PFAD.id).started).toBe(false);
    expect(gespeichert()?.paths).toEqual({});
  });
});
