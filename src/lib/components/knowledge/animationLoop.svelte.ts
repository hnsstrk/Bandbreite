/**
 * Gemeinsame Animationsschleife der Wissen-Widgets.
 *
 * Regeln (STYLE_GUIDE „Fokus und Accessibility"):
 *  - `prefers-reduced-motion` wird im JS geprüft, nicht nur im CSS;
 *  - bei verborgenem Tab (`document.hidden`) pausiert die Schleife;
 *  - ein Pause-Button steuert `playing`.
 *
 * Verwendung in einer Komponente:
 *   const loop = new AnimationLoop();
 *   $effect(() => loop.attach());
 *   … loop.elapsedMs lesen, loop.toggle() am Button.
 */
import { browser } from '$app/environment';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export class AnimationLoop {
  /** Vom Nutzer gewünschter Zustand (Play/Pause-Button) */
  playing = $state(true);
  /** Systemeinstellung „Bewegung reduzieren" */
  reducedMotion = $state(false);
  /** Tab ist nicht sichtbar */
  hidden = $state(false);
  /** Verstrichene Animationszeit in ms (läuft nur, wenn aktiv) */
  elapsedMs = $state(0);

  /** Läuft die Schleife tatsächlich? */
  get active(): boolean {
    return this.playing && !this.reducedMotion && !this.hidden;
  }

  toggle(): void {
    this.playing = !this.playing;
  }

  reset(): void {
    this.elapsedMs = 0;
  }

  /**
   * Innerhalb eines `$effect` aufrufen. Registriert Medien- und
   * Sichtbarkeits-Listener und treibt `elapsedMs` per requestAnimationFrame.
   * Gibt die Aufräumfunktion zurück.
   */
  attach(): () => void {
    if (!browser) return () => {};

    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const syncMotion = () => (this.reducedMotion = query.matches);
    const syncHidden = () => (this.hidden = document.hidden);
    syncMotion();
    syncHidden();
    query.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncHidden);

    let frame: number | null = null;
    let last: number | null = null;

    const step = (timestamp: number) => {
      if (!this.active) {
        frame = null;
        last = null;
        return;
      }
      if (last !== null) this.elapsedMs += timestamp - last;
      last = timestamp;
      frame = requestAnimationFrame(step);
    };

    // Der aufrufende $effect liest hier `active` und startet bei Änderung neu.
    if (this.active) frame = requestAnimationFrame(step);

    return () => {
      query.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', syncHidden);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }
}
