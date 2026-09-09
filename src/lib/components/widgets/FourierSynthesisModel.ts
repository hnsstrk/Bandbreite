/**
 * Rechenmodell der Fourier-Synthese (Widget `FourierSynthesisWidget`).
 *
 * Jede periodische Schwingung lässt sich als Summe von Sinusschwingungen
 * ganzzahliger Vielfacher der Grundfrequenz darstellen. Die Amplituden der
 * Reihe sind für die klassischen Signalformen geschlossen bekannt
 * (Fourierreihen, ungerade Symmetrie, Mittelwert 0):
 *
 *  - **Rechteck**   aₙ = 4/(n·π) für ungerade n, sonst 0
 *  - **Dreieck**    aₙ = 8/(n²·π²)·(−1)^((n−1)/2) für ungerade n, sonst 0
 *  - **Sägezahn**   aₙ = 2/(n·π)·(−1)^(n+1) für alle n
 *
 * Reine Funktionen ohne DOM-Bezug.
 *
 * Quellen:
 * - Bronstein/Semendjajew, *Taschenbuch der Mathematik* — Fourierreihen der
 *   Rechteck-, Dreieck- und Sägezahnschwingung
 * - Meinke/Gundlach, *Taschenbuch der Hochfrequenztechnik* — Oberwellen und
 *   belegte Bandbreite
 */

import { TWO_PI } from '$lib/utils/modulationMath';
import { safeDivide } from '$lib/utils/handlers';

/** Signalformen, die das Widget synthetisiert. */
export type SynthesisShape = 'rechteck' | 'dreieck' | 'saegezahn';

/** Anzeigenamen der Signalformen. */
export const SHAPE_LABELS: Record<SynthesisShape, string> = {
  rechteck: 'Rechteck',
  dreieck: 'Dreieck',
  saegezahn: 'Sägezahn'
};

/** Grenzen und Vorgabewerte des Widgets. */
export const SYNTHESIS_LIMITS = {
  harmonics: { min: 1, max: 25, default: 5 }
} as const;

/**
 * Amplitude der n-ten Harmonischen (n = 1 ist die Grundwelle).
 * Nicht enthaltene Harmonische liefern 0.
 */
export function harmonicAmplitude(shape: SynthesisShape, order: number): number {
  if (order < 1) return 0;
  const odd = order % 2 === 1;
  if (shape === 'rechteck') {
    return odd ? safeDivide(4, order * Math.PI, 0) : 0;
  }
  if (shape === 'dreieck') {
    if (!odd) return 0;
    const sign = (-1) ** ((order - 1) / 2);
    return (sign * 8) / (order * order * Math.PI * Math.PI);
  }
  return ((-1) ** (order + 1) * 2) / (order * Math.PI);
}

/** Eine Harmonische mit Ordnungszahl und Amplitude. */
export interface Harmonic {
  order: number;
  amplitude: number;
}

/** Alle Harmonischen bis zur Ordnung `count` (auch die mit Amplitude 0). */
export function harmonics(shape: SynthesisShape, count: number): Harmonic[] {
  const last = Math.max(1, Math.round(count));
  return Array.from({ length: last }, (_, index) => ({
    order: index + 1,
    amplitude: harmonicAmplitude(shape, index + 1)
  }));
}

/** Nur die Harmonischen, die tatsächlich vorkommen. */
export function activeHarmonics(shape: SynthesisShape, count: number): Harmonic[] {
  return harmonics(shape, count).filter((harmonic) => harmonic.amplitude !== 0);
}

/**
 * Wert der Teilsumme bei der normierten Zeit u (0 … 1 entspricht einer Periode).
 */
export function synthesizedValue(shape: SynthesisShape, count: number, u: number): number {
  return harmonics(shape, count).reduce(
    (sum, harmonic) => sum + harmonic.amplitude * Math.sin(TWO_PI * harmonic.order * u),
    0
  );
}

/** Idealer Verlauf der Signalform, auf ±1 normiert (Sägezahn: −1 … +1). */
export function idealValue(shape: SynthesisShape, u: number): number {
  const t = ((u % 1) + 1) % 1;
  if (shape === 'rechteck') return t < 0.5 ? 1 : -1;
  if (shape === 'dreieck') {
    if (t < 0.25) return 4 * t;
    if (t < 0.75) return 2 - 4 * t;
    return 4 * t - 4;
  }
  return t < 0.5 ? 2 * t : 2 * t - 2;
}

/**
 * Abtastwerte von Teilsumme und Ideal über `cycles` Perioden.
 * @param samples Zahl der Stützstellen
 */
export function synthesisCurve(
  shape: SynthesisShape,
  count: number,
  cycles: number = 2,
  samples: number = 241
): { u: number; sum: number; ideal: number }[] {
  const total = Math.max(2, Math.round(samples));
  return Array.from({ length: total }, (_, index) => {
    const u = (index / (total - 1)) * cycles;
    return {
      u: index / (total - 1),
      sum: synthesizedValue(shape, count, u),
      ideal: idealValue(shape, u)
    };
  });
}

/** Wilbraham-Gibbs-Konstante: (2/π)·Si(π) = 1,178 979 … */
export const GIBBS_CONSTANT = 1.1789797444721675;

/**
 * Sprunghöhe der idealen Signalform. Rechteck und Sägezahn springen von +1 auf
 * −1 (Höhe 2), das Dreieck ist stetig und springt nicht.
 */
export function jumpHeight(shape: SynthesisShape): number {
  return shape === 'dreieck' ? 0 : 2;
}

/**
 * Größter Betrag der Teilsumme — zeigt das Gibbssche Phänomen: Beim Rechteck
 * strebt er gegen die Wilbraham-Gibbs-Konstante 1,1790, egal wie viele
 * Harmonische man addiert.
 */
export function peakValue(shape: SynthesisShape, count: number, samples: number = 721): number {
  let peak = 0;
  const total = Math.max(2, Math.round(samples));
  for (let index = 0; index < total; index++) {
    peak = Math.max(peak, Math.abs(synthesizedValue(shape, count, index / total)));
  }
  return peak;
}

/**
 * Überschwingen an der Sprungstelle, bezogen auf die **Sprunghöhe** — die
 * Lehrbuchangabe „rund 9 %". Für das stetige Dreieck ist der Wert 0.
 */
export function overshootFraction(shape: SynthesisShape, count: number): number {
  const jump = jumpHeight(shape);
  if (jump <= 0) return 0;
  return Math.max(0, peakValue(shape, count) - 1) / jump;
}
