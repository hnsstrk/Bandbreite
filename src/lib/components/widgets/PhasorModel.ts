/**
 * Rechenmodell des Zeigerdiagramms (Widget `PhasorWidget`).
 *
 * Ein Zeiger (Phasor) der Länge A, der mit der Kreisfrequenz ω rotiert und um
 * φ vorgedreht ist, hat zur Zeit t die Projektion A·sin(ωt + φ) — genau die
 * Sinusschwingung. Zwei Schwingungen gleicher Frequenz addieren sich deshalb
 * wie Vektoren: Aus den kartesischen Komponenten folgen Betrag und Phase der
 * Summe. Zwei gleich große Zeiger können sich verstärken (φ = 0°), zur
 * √2-fachen Amplitude ergänzen (φ = 90°) oder auslöschen (φ = 180°).
 *
 * Reine Funktionen ohne DOM-Bezug.
 *
 * Quellen:
 * - Meinke/Gundlach, *Taschenbuch der Hochfrequenztechnik* — komplexe
 *   Wechselstromrechnung, Zeigerdarstellung
 * - Tietze/Schenk, *Halbleiter-Schaltungstechnik* — Zeigeraddition
 */

import { TWO_PI } from '$lib/utils/modulationMath';

/** Grenzen und Vorgabewerte des Zeiger-Widgets. */
export const PHASOR_LIMITS = {
  amplitude: { min: 0, max: 1, default: 1 },
  phaseDeg: { min: -180, max: 180, default: 90 }
} as const;

/** Grad → Radiant. */
export function degToRad(angleDeg: number): number {
  return (angleDeg * Math.PI) / 180;
}

/** Radiant → Grad, auf −180° … +180° normiert. */
export function radToDeg(angleRad: number): number {
  const deg = (angleRad * 180) / Math.PI;
  return ((((deg + 180) % 360) + 360) % 360) - 180;
}

/** Ein Zeiger in kartesischen Koordinaten. */
export interface PhasorPoint {
  x: number;
  y: number;
}

/**
 * Spitze eines rotierenden Zeigers: A·cos(ωt + φ) und A·sin(ωt + φ).
 * Die y-Komponente ist der Momentanwert der Schwingung.
 */
export function phasorPoint(amplitude: number, phaseRad: number, omegaT: number): PhasorPoint {
  const angle = omegaT + phaseRad;
  return { x: amplitude * Math.cos(angle), y: amplitude * Math.sin(angle) };
}

/** Betrag und Phase einer Summe zweier Zeiger gleicher Frequenz. */
export interface PhasorSum {
  amplitude: number;
  phaseRad: number;
  phaseDeg: number;
}

/**
 * Zeigeraddition: kartesisch addieren, dann Betrag und Phase bilden.
 * Beispiel: (1 ∠ 0°) + (1 ∠ 90°) = √2 ∠ 45°.
 */
export function phasorSum(
  amplitude1: number,
  phase1Rad: number,
  amplitude2: number,
  phase2Rad: number
): PhasorSum {
  const x = amplitude1 * Math.cos(phase1Rad) + amplitude2 * Math.cos(phase2Rad);
  const y = amplitude1 * Math.sin(phase1Rad) + amplitude2 * Math.sin(phase2Rad);
  const phaseRad = Math.atan2(y, x);
  return { amplitude: Math.hypot(x, y), phaseRad, phaseDeg: radToDeg(phaseRad) };
}

/**
 * Momentanwert der Schwingung: v(t) = A·sin(ωt + φ).
 * @param omegaT Winkel ωt in Radiant
 */
export function instantaneousValue(amplitude: number, phaseRad: number, omegaT: number): number {
  return amplitude * Math.sin(omegaT + phaseRad);
}

/**
 * Abtastwerte der Schwingung über mehrere Perioden, beginnend beim aktuellen
 * Zeigerwinkel. So schließt die Kurve nahtlos an die Zeigerspitze an.
 *
 * @param cycles Zahl der dargestellten Perioden
 * @param samples Zahl der Stützstellen
 */
export function waveSamples(
  amplitude: number,
  phaseRad: number,
  omegaT: number,
  cycles: number,
  samples: number
): { u: number; value: number }[] {
  const count = Math.max(2, Math.round(samples));
  return Array.from({ length: count }, (_, index) => {
    const u = index / (count - 1);
    return {
      u,
      value: instantaneousValue(amplitude, phaseRad, omegaT - TWO_PI * cycles * u)
    };
  });
}
