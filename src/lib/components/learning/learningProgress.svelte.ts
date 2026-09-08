/**
 * Fortschritt auf einem Lernpfad.
 *
 * Der Zustand lebt ausschließlich im Browser: aktiver Pfad, besuchte und
 * abgeschlossene Schritte liegen versioniert im `localStorage`. Es gibt kein
 * Konto und keinen Server — geht der Speicher verloren, ist nur der
 * Fortschritt weg, nie ein Inhalt.
 *
 * Alle Zugriffe sind in `try/catch` gekapselt und prüfen zuvor, ob es
 * überhaupt einen `localStorage` gibt; beim Prerendern (Node) ist das nicht
 * der Fall, dort bleibt der Zustand schlicht leer.
 */

import {
  LEARNING_PATHS,
  findLearningPath,
  resolvePathSteps,
  type LearningPath,
  type ResolvedStep
} from '$lib/data/learningPaths';
import { normalizeHref } from '$lib/data/navigation';

export const STORAGE_KEY = 'bandbreite:lernpfad';

/** Schemaversion des gespeicherten Objekts. Ältere Stände werden verworfen. */
export const SCHEMA_VERSION = 1;

/** Fortschritt eines einzelnen Pfads im Speicher. */
interface StoredPath {
  visited: string[];
  done: string[];
}

interface StoredState {
  version: number;
  activeId: string | null;
  paths: Record<string, StoredPath>;
}

/** Auswertung eines Pfads für Kacheln, Balken und Leiste. */
export interface PathProgress {
  pathId: string;
  /** Aufgelöste Schritte insgesamt (ohne noch fehlende Kapitel). */
  total: number;
  /** Davon nicht als optional gekennzeichnet. */
  required: number;
  done: number;
  visited: number;
  /** Anteil erledigter Schritte in Prozent (0–100). */
  percent: number;
  started: boolean;
  complete: boolean;
  /** Erster noch offener Schritt — Ziel von „Starten"/„Fortsetzen". */
  nextHref: string | null;
}

/** Position innerhalb des aktiven Pfads für die Pfad-Leiste. */
export interface CurrentStep {
  path: LearningPath;
  step: ResolvedStep;
  /** Nummer in der Anzeige, beginnend bei 1. */
  number: number;
  total: number;
  prev?: ResolvedStep;
  next?: ResolvedStep;
  done: boolean;
  progress: PathProgress;
}

function emptyState(): StoredState {
  return { version: SCHEMA_VERSION, activeId: null, paths: {} };
}

/** Gibt es einen benutzbaren `localStorage`? (SSR: nein) */
function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** Nur bekannte Pfad-IDs und Zeichenketten übernehmen. */
function sanitize(raw: unknown): StoredState {
  if (!raw || typeof raw !== 'object') return emptyState();
  const value = raw as Partial<StoredState>;
  if (value.version !== SCHEMA_VERSION) return emptyState();

  const known = new Set(LEARNING_PATHS.map((path) => path.id));
  const paths: Record<string, StoredPath> = {};
  for (const [id, entry] of Object.entries(value.paths ?? {})) {
    if (!known.has(id) || !entry || typeof entry !== 'object') continue;
    const list = (input: unknown) =>
      Array.isArray(input) ? input.filter((item): item is string => typeof item === 'string') : [];
    paths[id] = { visited: list(entry.visited), done: list(entry.done) };
  }

  const activeId =
    typeof value.activeId === 'string' && known.has(value.activeId) ? value.activeId : null;
  return { version: SCHEMA_VERSION, activeId, paths };
}

/**
 * Beobachtbarer Fortschritt. Die Instanz {@link learningProgress} ist die
 * einzige — Komponenten lesen und schreiben ausschließlich über sie.
 */
class LearningProgress {
  #state = $state<StoredState>(emptyState());
  #loaded = false;

  /**
   * Einmaliges Nachladen aus dem Speicher — gehört in einen `$effect`.
   *
   * Beim Prerendern ist der Fortschritt leer; würde ihn der Browser schon vor
   * der Hydration einlesen, unterschieden sich Server- und Client-Markup. Der
   * Aufruf aus einem Effekt erfolgt erst danach.
   */
  ensureLoaded(): void {
    if (this.#loaded) return;
    this.load();
  }

  /** Zustand aus dem Speicher lesen (auch für Tests nutzbar). */
  load(): void {
    this.#loaded = true;
    const store = storage();
    if (!store) return;
    try {
      const raw = store.getItem(STORAGE_KEY);
      this.#state = sanitize(raw ? JSON.parse(raw) : null);
    } catch {
      this.#state = emptyState();
    }
  }

  #persist(): void {
    const store = storage();
    if (!store) return;
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(this.#state));
    } catch {
      /* Speicher voll oder gesperrt — der Fortschritt ist optional. */
    }
  }

  #entry(pathId: string): StoredPath {
    const existing = this.#state.paths[pathId];
    if (existing) return existing;
    const created: StoredPath = { visited: [], done: [] };
    this.#state.paths[pathId] = created;
    return created;
  }

  /** ID des aktiven Pfads oder `null`. */
  get activePathId(): string | null {
    return this.#state.activeId;
  }

  /** Der aktive Pfad, falls einer läuft. */
  get activePath(): LearningPath | undefined {
    return this.#state.activeId ? findLearningPath(this.#state.activeId) : undefined;
  }

  /** Pfad aktivieren — der Fortschritt bleibt erhalten. */
  startPath(pathId: string): void {
    if (!findLearningPath(pathId)) return;
    this.#state.activeId = pathId;
    this.#entry(pathId);
    this.#persist();
  }

  /** Pfad verlassen, ohne den Fortschritt zu löschen. */
  leave(): void {
    this.#state.activeId = null;
    this.#persist();
  }

  /** Aufruf einer Route vermerken — nur innerhalb des aktiven Pfads. */
  visit(href: string): void {
    const pathId = this.#state.activeId;
    if (!pathId) return;
    const target = normalizeHref(href);
    if (!this.#steps(pathId).some((step) => step.href === target)) return;
    const entry = this.#entry(pathId);
    if (entry.visited.includes(target)) return;
    entry.visited = [...entry.visited, target];
    this.#persist();
  }

  /** Schritt als erledigt markieren (zählt zugleich als besucht). */
  markDone(href: string, pathId = this.#state.activeId): void {
    if (!pathId) return;
    const target = normalizeHref(href);
    if (!this.#steps(pathId).some((step) => step.href === target)) return;
    const entry = this.#entry(pathId);
    if (!entry.visited.includes(target)) entry.visited = [...entry.visited, target];
    if (!entry.done.includes(target)) entry.done = [...entry.done, target];
    this.#persist();
  }

  /** Erledigt-Markierung zurücknehmen. */
  markOpen(href: string, pathId = this.#state.activeId): void {
    if (!pathId) return;
    const target = normalizeHref(href);
    const entry = this.#entry(pathId);
    entry.done = entry.done.filter((item) => item !== target);
    this.#persist();
  }

  /** Ist der Schritt im genannten Pfad erledigt? */
  isDone(href: string, pathId = this.#state.activeId): boolean {
    if (!pathId) return false;
    return (this.#state.paths[pathId]?.done ?? []).includes(normalizeHref(href));
  }

  /** Wurde der Schritt im genannten Pfad schon aufgerufen? */
  isVisited(href: string, pathId = this.#state.activeId): boolean {
    if (!pathId) return false;
    return (this.#state.paths[pathId]?.visited ?? []).includes(normalizeHref(href));
  }

  /**
   * Fortschritt eines Pfads. Grundlage sind die aufgelösten Schritte, damit
   * ein noch fehlendes Kapitel den Balken nicht künstlich deckelt.
   */
  progress(pathId: string): PathProgress {
    const steps = this.#steps(pathId);
    const entry = this.#state.paths[pathId];
    const doneSet = new Set(entry?.done ?? []);
    const visitedSet = new Set(entry?.visited ?? []);
    const done = steps.filter((step) => doneSet.has(step.href)).length;
    const visited = steps.filter((step) => visitedSet.has(step.href)).length;
    const open = steps.find((step) => !doneSet.has(step.href));
    return {
      pathId,
      total: steps.length,
      required: steps.filter((step) => !step.optional).length,
      done,
      visited,
      percent: steps.length === 0 ? 0 : (done / steps.length) * 100,
      started: visited > 0 || done > 0,
      complete: steps.length > 0 && done === steps.length,
      nextHref: open?.href ?? steps[0]?.href ?? null
    };
  }

  /** Position der aktuellen Route im aktiven Pfad — sonst `null`. */
  currentStep(pathname: string): CurrentStep | null {
    const path = this.activePath;
    if (!path) return null;
    const steps = resolvePathSteps(path);
    const target = normalizeHref(pathname);
    const index = steps.findIndex((step) => step.href === target);
    if (index < 0) return null;
    return {
      path,
      step: steps[index],
      number: index + 1,
      total: steps.length,
      prev: index > 0 ? steps[index - 1] : undefined,
      next: index < steps.length - 1 ? steps[index + 1] : undefined,
      done: this.isDone(target, path.id),
      progress: this.progress(path.id)
    };
  }

  /** Fortschritt löschen — mit ID nur diesen Pfad, ohne ID alles. */
  reset(pathId?: string): void {
    if (pathId) {
      delete this.#state.paths[pathId];
      if (this.#state.activeId === pathId) this.#state.activeId = null;
    } else {
      this.#state = emptyState();
    }
    this.#persist();
  }

  #steps(pathId: string): ResolvedStep[] {
    return resolvePathSteps(findLearningPath(pathId));
  }
}

/** Einzige Instanz — der Fortschritt ist global, nicht je Komponente. */
export const learningProgress = new LearningProgress();
