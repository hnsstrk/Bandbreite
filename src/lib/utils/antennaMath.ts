/**
 * Rechenkern der Antennen-Widgets.
 *
 * Alle Funktionen sind rein und ohne DOM-Bezug, damit sie in Vitest geprüft
 * werden können. Die Richtdiagramme werden als **Feldstärkeverlauf** im
 * Bereich 0 … 1 berechnet; der Pegel in dB ergibt sich daraus mit
 * 20 · log₁₀(F) und entspricht damit dem üblichen Leistungsdiagramm.
 *
 * Quellen der Formeln:
 * - Halbwellendipol und Gruppenfaktor: Balanis, Antenna Theory
 * - Zusammenhang Gewinn/Öffnungswinkel: IEEE Std 145, Näherung nach Kraus
 * - Anpassung, Reflexionsfaktor, Rückflussdämpfung: IEEE Std 1785
 */

import { safeDivide, safeLog } from './handlers';
import {
  GAIN_DIPOLE_DBI,
  PARABOLIC_EFFICIENCY_TYPICAL,
  dbdToDbi,
  parabolicBeamwidthDeg,
  parabolicDiameterM,
  parabolicGainDbi,
  arrayGainDbi
} from '$lib/data/antennas';
import { SPEED_OF_LIGHT } from '$lib/data/constants';

// ============================================================================
// Konstanten
// ============================================================================

/** Vollkreis im Bogenmaß. */
export const TWO_PI = 2 * Math.PI;

/** Grad je Bogenmaß. */
export const DEG_PER_RAD = 180 / Math.PI;

/**
 * Näherung von Kraus für den Zusammenhang zwischen Gewinn und den beiden
 * Halbwertsbreiten: G ≈ 41253 / (θ_E · θ_H), Winkel in Grad.
 */
export const BEAM_SOLID_ANGLE_DEG2 = 41253;

/** Kleinster Feldwert, der noch als von null verschieden gilt. */
export const FIELD_EPSILON = 1e-9;

/** Untere Grenze der dB-Skala der Richtdiagramme. */
export const PATTERN_FLOOR_DB = -40;

/** Halbwertsbreite in Grad, unter die die Näherungen nicht gehen. */
export const MIN_BEAMWIDTH_DEG = 0.5;

// ============================================================================
// Grundlegende Umrechnungen
// ============================================================================

/** Wellenlänge aus der Frequenz: λ = c / f. */
export function wavelengthM(frequencyHz: number): number {
  return safeDivide(SPEED_OF_LIGHT, frequencyHz, 0);
}

/** Gewinn bezogen auf den Halbwellendipol (dBd) aus dBi. */
export function dbiToDbd(gainDbi: number): number {
  return gainDbi - GAIN_DIPOLE_DBI;
}

/** Linearer Gewinnfaktor aus dBi. */
export function gainLinearFromDbi(gainDbi: number): number {
  return Math.pow(10, gainDbi / 10);
}

/** Gewinn in dBi aus dem linearen Faktor. */
export function gainDbiFromLinear(gainLinear: number): number {
  return 10 * safeLog(gainLinear, 10, PATTERN_FLOOR_DB);
}

/**
 * Wirkfläche einer Antenne: A_eff = G · λ² / (4π).
 *
 * @param gainDbi Gewinn in dBi
 * @param wavelengthMeters Wellenlänge in Metern
 */
export function effectiveApertureM2(gainDbi: number, wavelengthMeters: number): number {
  const gain = gainLinearFromDbi(gainDbi);
  return safeDivide(gain * wavelengthMeters * wavelengthMeters, 4 * Math.PI, 0);
}

/**
 * Beginn des Fernfelds einer Apertur: r = 2 · D² / λ.
 *
 * @param apertureM größte Abmessung der Apertur in Metern
 * @param wavelengthMeters Wellenlänge in Metern
 */
export function farFieldDistanceM(apertureM: number, wavelengthMeters: number): number {
  return safeDivide(2 * apertureM * apertureM, wavelengthMeters, 0);
}

/**
 * Halbwertsbreite eines rotationssymmetrischen Strahlers aus dem Gewinn:
 * θ ≈ sqrt(41253 / G).
 *
 * @param gainDbi Gewinn in dBi
 */
export function beamwidthFromGainDeg(gainDbi: number): number {
  const gain = gainLinearFromDbi(gainDbi);
  const value = Math.sqrt(safeDivide(BEAM_SOLID_ANGLE_DEG2, gain, 0));
  return Math.max(MIN_BEAMWIDTH_DEG, value);
}

// ============================================================================
// Richtdiagramme (Feldstärke, normiert auf 1)
// ============================================================================

/** Isotroper Kugelstrahler: in jeder Richtung gleich stark. */
export function isotropicPattern(): number {
  return 1;
}

/**
 * Halbwellendipol: F(θ) = cos(π/2 · cos θ) / sin θ.
 * θ wird von der Drahtachse gezählt; das Maximum liegt quer dazu bei 90°.
 */
export function halfWaveDipolePattern(thetaRad: number): number {
  const sinTheta = Math.sin(thetaRad);
  if (Math.abs(sinTheta) < FIELD_EPSILON) return 0;
  return Math.abs(safeDivide(Math.cos((Math.PI / 2) * Math.cos(thetaRad)), sinTheta, 0));
}

/** Kurzer Dipol (Hertzscher Dipol): F(θ) = |sin θ|. */
export function shortDipolePattern(thetaRad: number): number {
  return Math.abs(Math.sin(thetaRad));
}

/**
 * Parametrisierte Hauptkeule als Gaußkurve.
 * Bei θ = ±HPBW/2 fällt die Leistung auf die Hälfte, das Feld also auf
 * 1/√2 des Maximums.
 *
 * @param offsetRad Winkelabstand von der Hauptstrahlrichtung
 * @param beamwidthDeg Halbwertsbreite in Grad
 */
export function gaussianMainLobe(offsetRad: number, beamwidthDeg: number): number {
  const halfWidthRad = Math.max(beamwidthDeg, MIN_BEAMWIDTH_DEG) / 2 / DEG_PER_RAD;
  const ratio = safeDivide(offsetRad, halfWidthRad, 0);
  return Math.exp(-(Math.LN2 / 2) * ratio * ratio);
}

/**
 * Gruppenfaktor einer linearen Gruppe aus N gleichartigen Strahlern:
 * AF(θ) = |sin(N·ψ/2) / (N · sin(ψ/2))| mit ψ = 2π · d/λ · cos θ + β.
 *
 * θ wird von der Gruppenachse gezählt: bei β = 0 liegt das Maximum quer zur
 * Achse (Broadside) bei θ = 90°.
 *
 * @param elementCount Zahl der Elemente N
 * @param spacingWavelengths Elementabstand d/λ
 * @param phaseShiftRad Phasenschub β je Element
 * @param thetaRad Winkel gegen die Gruppenachse
 */
export function arrayFactor(
  elementCount: number,
  spacingWavelengths: number,
  phaseShiftRad: number,
  thetaRad: number
): number {
  const n = Math.max(1, Math.round(elementCount));
  if (n === 1) return 1;
  const psi = TWO_PI * spacingWavelengths * Math.cos(thetaRad) + phaseShiftRad;
  const halfPsi = psi / 2;
  const denominator = n * Math.sin(halfPsi);
  if (Math.abs(Math.sin(halfPsi)) < FIELD_EPSILON) return 1;
  return Math.abs(safeDivide(Math.sin(n * halfPsi), denominator, 0));
}

/**
 * Phasenschub, der die Hauptkeule einer linearen Gruppe auf den Winkel
 * `steerDeg` (gegen die Gruppenachse) schwenkt: β = −2π · d/λ · cos θ₀.
 */
export function steeringPhaseRad(spacingWavelengths: number, steerDeg: number): number {
  return -TWO_PI * spacingWavelengths * Math.cos(steerDeg / DEG_PER_RAD);
}

/** Von {@link patternField} unterstützte Diagrammarten. */
export type PatternType = 'isotrop' | 'kurzdipol' | 'dipol' | 'yagi' | 'parabol' | 'array';

export interface PatternConfig {
  type: PatternType;
  /** Halbwertsbreite in Grad für Yagi und Parabol */
  beamwidthDeg?: number;
  /** Rückwärtsdämpfung in dB für Yagi (Vor-Rück-Verhältnis) */
  frontToBackDb?: number;
  /** Zahl der Elemente der linearen Gruppe */
  elementCount?: number;
  /** Elementabstand d/λ der Gruppe */
  spacingWavelengths?: number;
  /** Schwenkwinkel der Gruppe in Grad gegen die Gruppenachse */
  steerDeg?: number;
}

/** Vor-Rück-Verhältnis, das für Richtantennen ohne eigene Angabe gilt. */
export const DEFAULT_FRONT_TO_BACK_DB = 20;

/**
 * Feldstärke eines Richtdiagramms in der Ebene, normiert auf 1.
 *
 * @param config Diagrammbeschreibung
 * @param thetaRad Winkel; bei Dipol und Gruppe gegen die Achse, bei Yagi und
 *   Parabol gegen die Hauptstrahlrichtung
 */
export function patternField(config: PatternConfig, thetaRad: number): number {
  switch (config.type) {
    case 'isotrop':
      return isotropicPattern();
    case 'kurzdipol':
      return shortDipolePattern(thetaRad);
    case 'dipol':
      return halfWaveDipolePattern(thetaRad);
    case 'array': {
      const spacing = config.spacingWavelengths ?? 0.5;
      const beta = steeringPhaseRad(spacing, config.steerDeg ?? 90);
      return arrayFactor(config.elementCount ?? 4, spacing, beta, thetaRad);
    }
    case 'yagi':
    case 'parabol':
    default: {
      // Winkelabstand zur Hauptstrahlrichtung, gespiegelt auf 0 … π
      const offset = Math.abs(normalizeAngleRad(thetaRad));
      const main = gaussianMainLobe(offset, config.beamwidthDeg ?? DEFAULT_YAGI_BEAMWIDTH_DEG);
      const backLevel = Math.pow(10, -(config.frontToBackDb ?? DEFAULT_FRONT_TO_BACK_DB) / 20);
      // Rückkeule als flacher Sockel, der zur Rückseite hin zunimmt
      const back = backLevel * Math.pow(Math.sin(offset / 2), 2);
      return Math.min(1, Math.max(main, back));
    }
  }
}

/** Voreingestellte Halbwertsbreite einer mittelgroßen Yagi in Grad. */
export const DEFAULT_YAGI_BEAMWIDTH_DEG = 45;

/** Bildet einen Winkel auf −π … π ab. */
export function normalizeAngleRad(angleRad: number): number {
  let value = angleRad;
  while (value > Math.PI) value -= TWO_PI;
  while (value < -Math.PI) value += TWO_PI;
  return value;
}

/** Pegel eines Feldwerts in dB, nach unten begrenzt. */
export function fieldToDb(field: number, floorDb: number = PATTERN_FLOOR_DB): number {
  if (field <= FIELD_EPSILON) return floorDb;
  return Math.max(floorDb, 20 * safeLog(field, 10, floorDb / 20));
}

export interface PatternSample {
  /** Winkel in Grad, 0 … 360 */
  angleDeg: number;
  /** Feldstärke 0 … 1 */
  field: number;
  /** Pegel in dB, nach unten auf `floorDb` begrenzt */
  db: number;
}

/**
 * Tastet ein Richtdiagramm über den vollen Kreis ab.
 *
 * @param config Diagrammbeschreibung
 * @param stepDeg Schrittweite in Grad
 * @param floorDb untere Grenze der dB-Skala
 */
export function samplePattern(
  config: PatternConfig,
  stepDeg: number,
  floorDb: number = PATTERN_FLOOR_DB
): PatternSample[] {
  const step = Math.max(0.25, stepDeg);
  const samples: PatternSample[] = [];
  for (let angleDeg = 0; angleDeg <= 360; angleDeg += step) {
    const field = patternField(config, angleDeg / DEG_PER_RAD);
    samples.push({ angleDeg, field, db: fieldToDb(field, floorDb) });
  }
  return samples;
}

/** Winkel der Hauptstrahlrichtung in Grad aus einer Abtastung. */
export function mainLobeAngleDeg(samples: PatternSample[]): number {
  let best = 0;
  let bestField = -1;
  for (const sample of samples) {
    if (sample.field > bestField) {
      bestField = sample.field;
      best = sample.angleDeg;
    }
  }
  return best;
}

/**
 * Halbwertsbreite aus einer Abtastung: Winkelabstand der beiden Punkte
 * beiderseits des Maximums, an denen das Feld auf 1/√2 gefallen ist.
 * Rundstrahler ohne Abfall liefern 360.
 */
export function halfPowerBeamwidthDeg(samples: PatternSample[]): number {
  if (samples.length === 0) return 0;
  const peakAngle = mainLobeAngleDeg(samples);
  const threshold = Math.SQRT1_2;
  const step = safeDivide(360, samples.length - 1, 1);

  const edge = (direction: 1 | -1): number | null => {
    for (let offset = step; offset <= 180; offset += step) {
      const angle = peakAngle + direction * offset;
      const field = patternFieldFromSamples(samples, angle);
      if (field < threshold) return offset;
    }
    return null;
  };

  const upper = edge(1);
  const lower = edge(-1);
  if (upper === null || lower === null) return 360;
  return upper + lower;
}

/** Feldwert an einem beliebigen Winkel durch Nachschlagen in der Abtastung. */
export function patternFieldFromSamples(samples: PatternSample[], angleDeg: number): number {
  if (samples.length === 0) return 0;
  const step = safeDivide(360, samples.length - 1, 1);
  let normalized = angleDeg % 360;
  if (normalized < 0) normalized += 360;
  const index = Math.round(safeDivide(normalized, step, 0)) % samples.length;
  return samples[index].field;
}

/**
 * Vor-Rück-Verhältnis in dB: Pegelabstand zwischen Hauptstrahlrichtung und
 * der um 180° versetzten Richtung.
 */
export function frontToBackRatioDb(samples: PatternSample[]): number {
  if (samples.length === 0) return 0;
  const peakAngle = mainLobeAngleDeg(samples);
  const front = patternFieldFromSamples(samples, peakAngle);
  const back = patternFieldFromSamples(samples, peakAngle + 180);
  if (back <= FIELD_EPSILON) return -PATTERN_FLOOR_DB;
  return Math.min(-PATTERN_FLOOR_DB, 20 * safeLog(safeDivide(front, back, 1), 10, 0));
}

// ============================================================================
// Anpassung: Reflexionsfaktor, SWR, Rückflussdämpfung
// ============================================================================

/** Reflexionsfaktor aus dem Stehwellenverhältnis: Γ = (s − 1) / (s + 1). */
export function reflectionFromVswr(vswr: number): number {
  if (vswr < 1) return 0;
  return safeDivide(vswr - 1, vswr + 1, 0);
}

/** Stehwellenverhältnis aus dem Reflexionsfaktor: s = (1 + Γ) / (1 − Γ). */
export function vswrFromReflection(reflection: number): number {
  const gamma = Math.min(Math.abs(reflection), 1 - FIELD_EPSILON);
  return safeDivide(1 + gamma, 1 - gamma, Infinity);
}

/** Rückflussdämpfung in dB: RL = −20 · log₁₀ |Γ|. */
export function returnLossDb(reflection: number): number {
  const gamma = Math.abs(reflection);
  if (gamma <= FIELD_EPSILON) return Infinity;
  return -20 * safeLog(gamma, 10, 0);
}

/** Anteil der reflektierten Leistung in Prozent: |Γ|² · 100. */
export function reflectedPowerPercent(reflection: number): number {
  const gamma = Math.min(Math.abs(reflection), 1);
  return gamma * gamma * 100;
}

/** Fehlanpassungsverlust in dB: −10 · log₁₀(1 − |Γ|²). */
export function mismatchLossDb(reflection: number): number {
  const gamma = Math.min(Math.abs(reflection), 1 - FIELD_EPSILON);
  const transmitted = 1 - gamma * gamma;
  const loss = -10 * safeLog(transmitted, 10, 0);
  // Vermeidet die Anzeige „−0,00 dB" bei perfekter Anpassung.
  return loss === 0 ? 0 : loss;
}

/**
 * Reflexionsfaktor aus Last- und Systemimpedanz:
 * Γ = (Z_L − Z_0) / (Z_L + Z_0).
 */
export function reflectionFromImpedance(loadOhm: number, systemOhm: number): number {
  return safeDivide(loadOhm - systemOhm, loadOhm + systemOhm, 0);
}

export {
  parabolicGainDbi,
  parabolicBeamwidthDeg,
  parabolicDiameterM,
  arrayGainDbi,
  dbdToDbi,
  GAIN_DIPOLE_DBI,
  PARABOLIC_EFFICIENCY_TYPICAL
};
