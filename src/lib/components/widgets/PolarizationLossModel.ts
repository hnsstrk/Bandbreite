/**
 * Rechenmodell des Polarisationsverlust-Widgets (`PolarizationLossWidget`).
 *
 * Zwei linear polarisierte Antennen, deren Polarisationsebenen um den Winkel α
 * gegeneinander verdreht sind, übertragen nur den Bruchteil cos²α der Leistung
 * (Polarisationsverlustfaktor PLF). In Dezibel: L = −10·log₁₀(cos²α)
 * = −20·log₁₀(|cos α|).
 *
 * Der Dezibelwert selbst kommt aus `tiltLossDb()` in `EmWaveModel.ts` (dort
 * getestet und auf einen praxisnahen Höchstwert begrenzt); hier stehen der
 * lineare Faktor, die Projektion des E-Vektors und der Vergleich mit dem
 * festen Verlust beim Übergang linear ↔ zirkular.
 *
 * Quellen:
 * - Pozar, *Microwave Engineering* — Polarisationsverlustfaktor PLF = |ê_t · ê_r|²
 * - IEEE Std 145 — Kreuzpolarisationsentkopplung realer Antennen
 * - Balanis, *Antenna Theory*, Abschnitt 2.12 — PLF, zirkular ↔ linear = 0,5
 */

import { safeLog } from '$lib/utils/handlers';
import { CIRCULAR_TO_LINEAR_LOSS_DB, CROSS_POLARIZATION_LOSS_DB, tiltLossDb } from './EmWaveModel';

/** Grenzen und Vorgabewert des Verdrehungswinkels. */
export const TILT_LIMITS = { angleDeg: { min: 0, max: 90, default: 30 } } as const;

/** Winkel, für die die Tabelle im Widget Referenzwerte zeigt. */
export const TILT_REFERENCE_ANGLES = [0, 30, 45, 60, 90] as const;

/** Grad → Radiant. */
export function toRadians(angleDeg: number): number {
  return (angleDeg * Math.PI) / 180;
}

/**
 * Polarisationsverlustfaktor zweier linearer Antennen: PLF = cos²α.
 * Bei α = 0° kommt die volle Leistung an, bei 90° theoretisch nichts.
 */
export function tiltLossFactor(angleDeg: number): number {
  return Math.cos(toRadians(angleDeg)) ** 2;
}

/** Anteil der ankommenden Leistung in Prozent. */
export function tiltLossPercent(angleDeg: number): number {
  return tiltLossFactor(angleDeg) * 100;
}

/**
 * Anteil der **Spannung** am Empfängereingang: |cos α|. Die Projektion des
 * E-Vektors auf die Empfangsantenne — das Quadrat davon ist der PLF.
 */
export function projectedFieldFactor(angleDeg: number): number {
  return Math.abs(Math.cos(toRadians(angleDeg)));
}

/**
 * Verlust in dB aus dem linearen Faktor: L = −10·log₁₀(PLF).
 * Ergibt für PLF = 0 den praxisnahen Höchstwert
 * {@link CROSS_POLARIZATION_LOSS_DB}, weil reale Antennen nie ideal entkoppeln.
 */
export function lossDbFromFactor(factor: number): number {
  if (factor <= 0) return CROSS_POLARIZATION_LOSS_DB;
  return Math.min(-10 * safeLog(factor, 10, 0), CROSS_POLARIZATION_LOSS_DB);
}

/** Ergebnissatz zu einem Verdrehungswinkel. */
export interface TiltResult {
  angleDeg: number;
  /** cos²α */
  factor: number;
  /** Anteil der Leistung in Prozent */
  percent: number;
  /** Verlust in dB (aus EmWaveModel.tiltLossDb, praxisnah begrenzt) */
  lossDb: number;
  /** Ist der Verlust nur noch durch die Entkopplung realer Antennen begrenzt? */
  capped: boolean;
}

/** Alle Kennwerte zu einem Verdrehungswinkel. */
export function tiltResult(angleDeg: number): TiltResult {
  const factor = tiltLossFactor(angleDeg);
  const lossDb = tiltLossDb(angleDeg);
  return {
    angleDeg,
    factor,
    percent: factor * 100,
    lossDb,
    capped: lossDb >= CROSS_POLARIZATION_LOSS_DB
  };
}

/**
 * Verlustkurve über den Winkel für die Darstellung.
 * @param steps Zahl der Stützstellen zwischen 0° und 90°
 */
export function lossCurve(steps: number = 91): { angleDeg: number; lossDb: number }[] {
  const count = Math.max(2, Math.round(steps));
  return Array.from({ length: count }, (_, index) => {
    const angleDeg = (index / (count - 1)) * TILT_LIMITS.angleDeg.max;
    return { angleDeg, lossDb: tiltLossDb(angleDeg) };
  });
}

/**
 * Verlust einer zirkular polarisierten Gegenstelle: immer 3,01 dB, unabhängig
 * von der Verdrehung — das ist der Handel, den Satellitenfunk eingeht.
 */
export function circularLossDb(): number {
  return CIRCULAR_TO_LINEAR_LOSS_DB;
}
