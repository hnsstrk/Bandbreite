/**
 * Rechenmodell der elektromagnetischen Welle (Widget `EmWaveWidget`).
 *
 * Reine Funktionen ohne DOM-Bezug: Feldvektoren einer ebenen Welle zu einem
 * Zeitpunkt, Nah-/Fernfeldgrenzen, Photonenenergie und Polarisationsverluste.
 *
 * Modell: ebene Welle, die sich in +x ausbreitet. Das elektrische Feld liegt
 * in der (y, z)-Ebene, das magnetische Feld steht senkrecht darauf und ist um
 * den Feldwellenwiderstand Z₀ kleiner (H = E / Z₀). E, H und die
 * Ausbreitungsrichtung bilden in dieser Reihenfolge ein Rechtssystem.
 *
 * Quellen:
 * - Meinke/Gundlach, Taschenbuch der Hochfrequenztechnik (ebene Welle,
 *   Feldwellenwiderstand, Nah- und Fernfeld)
 * - Pozar, Microwave Engineering (Polarisation, Polarisationsverlustfaktor)
 * - IEEE Std 145 / IEEE Std 100 (Definition RHCP/LHCP, Kreuzpolarisation)
 * - CODATA 2018 (h, c, Z₀); ICNIRP (Grenze der nichtionisierenden Strahlung)
 */

import {
  FREE_SPACE_IMPEDANCE,
  IONIZING_BOUNDARY_WAVELENGTH,
  PLANCK_CONSTANT,
  ELEMENTARY_CHARGE,
  SPEED_OF_LIGHT
} from '$lib/data/constants';
import { frequencyToWavelength } from '$lib/utils/calculations';
import { safeDivide, safeLog, clamp } from '$lib/utils/handlers';

/** Vier Polarisationszustände, die das Kapitel unterscheidet. */
export type Polarization = 'linear-h' | 'linear-v' | 'rhcp' | 'lhcp';

/** Anzeige-Kurzform der Polarisationszustände. */
export const POLARIZATION_LABELS: Record<Polarization, string> = {
  'linear-h': 'linear horizontal',
  'linear-v': 'linear vertikal',
  rhcp: 'zirkular rechtsdrehend (RHCP)',
  lhcp: 'zirkular linksdrehend (LHCP)'
};

/** Verlust beim Übergang linear ↔ zirkular: 10·log₁₀(2) ≈ 3,01 dB. */
export const CIRCULAR_TO_LINEAR_LOSS_DB = 10 * Math.log10(2);

/**
 * Praktisch erreichbare Entkopplung zwischen orthogonalen Polarisationen in dB.
 * Theoretisch ist der Verlust unendlich; reale Antennen erreichen 20 … 30 dB.
 * Annahme: 20 dB als konservativer Richtwert (IEEE Std 145, Kreuzpolarisation).
 */
export const CROSS_POLARIZATION_LOSS_DB = 20;

/** Kleinste Zahl sichtbarer Wellenzüge. */
export const STAGE_MIN_CYCLES = 1.5;
/** Größte Zahl sichtbarer Wellenzüge. */
export const STAGE_MAX_CYCLES = 9;
/** Zuwachs der sichtbaren Wellenzüge je Frequenzdekade. */
export const STAGE_CYCLES_PER_DECADE = 0.75;

/** Grenzen und Vorgabewerte des Wellen-Widgets. */
export const EM_WAVE_LIMITS = {
  frequencyHz: { min: 1e6, max: 1e16, default: 1e8 },
  apertureM: { min: 0.05, max: 20, default: 1.2 }
} as const;

/** Grenzfrequenz zur ionisierenden Strahlung: c / 100 nm ≈ 3 PHz. */
export const IONIZING_BOUNDARY_FREQUENCY = SPEED_OF_LIGHT / IONIZING_BOUNDARY_WAVELENGTH;

// ============================================================================
// Welle: Wellenlänge, Periodendauer, Feldwellenwiderstand
// ============================================================================

/** Periodendauer T = 1 / f in Sekunden. */
export function periodS(frequencyHz: number): number {
  return safeDivide(1, frequencyHz, 0);
}

/** Kreiswellenzahl k = 2π / λ in rad/m. */
export function waveNumber(wavelengthMeters: number): number {
  return safeDivide(2 * Math.PI, wavelengthMeters, 0);
}

/** Magnetische Feldstärke der ebenen Welle: H = E / Z₀ in A/m. */
export function magneticFromElectric(fieldVPerM: number): number {
  return safeDivide(fieldVPerM, FREE_SPACE_IMPEDANCE, 0);
}

// ============================================================================
// Nah- und Fernfeld
// ============================================================================

/** Grenze des reaktiven Nahfelds: λ / (2π). */
export function reactiveNearFieldM(wavelengthMeters: number): number {
  return safeDivide(wavelengthMeters, 2 * Math.PI, 0);
}

/**
 * Fernfeldgrenze (Fraunhofer-Abstand) einer Apertur: 2·D² / λ.
 * Nur sinnvoll für Antennen, die groß gegen λ sind.
 */
export function fraunhoferDistanceM(apertureM: number, wavelengthMeters: number): number {
  if (apertureM <= 0) return 0;
  return safeDivide(2 * apertureM * apertureM, wavelengthMeters, 0);
}

// ============================================================================
// Photonenenergie
// ============================================================================

/** Photonenenergie E = h · f in Joule. */
export function photonEnergyJoule(frequencyHz: number): number {
  if (frequencyHz <= 0) return 0;
  return PLANCK_CONSTANT * frequencyHz;
}

/** Photonenenergie in Elektronenvolt. */
export function photonEnergyEv(frequencyHz: number): number {
  return safeDivide(photonEnergyJoule(frequencyHz), ELEMENTARY_CHARGE, 0);
}

/** Ionisierend, wenn die Wellenlänge unter 100 nm liegt (ICNIRP-Grenze). */
export function isIonizing(frequencyHz: number): boolean {
  return frequencyHz >= IONIZING_BOUNDARY_FREQUENCY;
}

// ============================================================================
// Polarisation
// ============================================================================

/** Ist der Zustand eine zirkulare Polarisation? */
export function isCircular(polarization: Polarization): boolean {
  return polarization === 'rhcp' || polarization === 'lhcp';
}

/**
 * Polarisationsverlust zwischen Sende- und Empfangsantenne in dB.
 *
 * - gleiche Polarisation → 0 dB
 * - linear ↔ zirkular → 3,01 dB (die Hälfte der Leistung fehlt immer)
 * - orthogonal (H↔V bzw. RHCP↔LHCP) → theoretisch unendlich,
 *   hier {@link CROSS_POLARIZATION_LOSS_DB} als praktischer Richtwert
 */
export function polarizationLossDb(tx: Polarization, rx: Polarization): number {
  if (tx === rx) return 0;
  if (isCircular(tx) !== isCircular(rx)) return CIRCULAR_TO_LINEAR_LOSS_DB;
  return CROSS_POLARIZATION_LOSS_DB;
}

/**
 * Verlust zweier linearer Antennen bei Verdrehung um α: −20·log₁₀(|cos α|).
 * Bei 90° ist der Wert theoretisch unendlich und wird auf
 * {@link CROSS_POLARIZATION_LOSS_DB} begrenzt.
 *
 * @param angleDeg Verdrehungswinkel in Grad
 */
export function tiltLossDb(angleDeg: number): number {
  const cosine = Math.abs(Math.cos((angleDeg * Math.PI) / 180));
  if (cosine <= 0) return CROSS_POLARIZATION_LOSS_DB;
  const loss = -20 * safeLog(cosine, 10, 0);
  return Math.min(loss, CROSS_POLARIZATION_LOSS_DB);
}

// ============================================================================
// Feldvektoren zum Zeitpunkt t
// ============================================================================

/** Ein Abtastpunkt der Welle; alle Feldwerte auf die Amplitude 1 normiert. */
export interface FieldSample {
  /** Position entlang der Ausbreitungsrichtung, 0 … 1 der Bühnenbreite */
  x: number;
  /** E-Feld quer (Bild: senkrecht) */
  ey: number;
  /** E-Feld quer (Bild: in die Tiefe) */
  ez: number;
  /** H-Feld quer (Bild: senkrecht) */
  hy: number;
  /** H-Feld quer (Bild: in die Tiefe) */
  hz: number;
}

export interface WaveOptions {
  /** Sichtbare Wellenzüge auf der Bühne */
  cycles: number;
  /** Anzahl der Abtastpunkte */
  samples: number;
  /** Phasenwinkel ω·t in Radiant */
  phaseRad: number;
  polarization: Polarization;
}

/**
 * Momentaufnahme der Felder entlang der Ausbreitungsrichtung.
 *
 * Linear: E schwingt in einer festen Ebene, H senkrecht dazu.
 * Zirkular: der E-Vektor rotiert mit fortschreitendem x — die Spitze
 * beschreibt eine Schraubenlinie; die Drehrichtung unterscheidet RHCP und LHCP.
 */
export function fieldSamples(options: WaveOptions): FieldSample[] {
  const { cycles, samples, phaseRad, polarization } = options;
  const count = Math.max(2, Math.round(samples));
  const sense = polarization === 'lhcp' ? -1 : 1;
  const circular = isCircular(polarization);
  const horizontal = polarization === 'linear-h';

  return Array.from({ length: count }, (_, index) => {
    const x = index / (count - 1);
    const theta = 2 * Math.PI * cycles * x - phaseRad;
    const swing = Math.sin(theta);
    const ey = circular ? Math.cos(theta) : horizontal ? 0 : swing;
    const ez = circular ? sense * Math.sin(theta) : horizontal ? swing : 0;
    // H steht senkrecht auf E in der Querebene (E, H, Ausbreitung = Rechtssystem)
    return { x, ey, ez, hy: -ez, hz: ey };
  });
}

/** E-Vektor in der Frontansicht (Blick entgegen der Ausbreitungsrichtung). */
export function frontVector(
  phaseRad: number,
  polarization: Polarization
): { ey: number; ez: number } {
  const [sample] = fieldSamples({ cycles: 0, samples: 2, phaseRad, polarization });
  return { ey: sample.ey, ez: sample.ez };
}

/**
 * Sichtbare Wellenzüge auf der Bühne. Damit die Darstellung über zehn Dekaden
 * lesbar bleibt, wächst die Zahl der Züge logarithmisch mit der Frequenz und
 * wird begrenzt; die Bühnenlänge in Metern nennt den wahren Maßstab.
 */
export function visibleCycles(frequencyHz: number): number {
  const decades = safeLog(safeDivide(frequencyHz, EM_WAVE_LIMITS.frequencyHz.min, 1), 10, 0);
  return clamp(
    STAGE_MIN_CYCLES + decades * STAGE_CYCLES_PER_DECADE,
    STAGE_MIN_CYCLES,
    STAGE_MAX_CYCLES
  );
}

/** Physikalische Länge des dargestellten Ausschnitts in Metern. */
export function stageLengthM(frequencyHz: number): number {
  return visibleCycles(frequencyHz) * frequencyToWavelength(frequencyHz);
}

