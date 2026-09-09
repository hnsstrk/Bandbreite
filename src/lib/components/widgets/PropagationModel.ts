/**
 * Logik des Ausbreitungs-Sandkastens (W9): Radiohorizont aus den Antennenhöhen,
 * dominierender Ausbreitungsmodus aus der Frequenz, Sprungdistanz/Skip-Zone und
 * MUF aus `$lib/data/propagation`, dazu die Geometrie der Kugelerde-Skizze.
 */
import {
  calculateRadioHorizon,
  calculateMaxLOSDistance,
  calculateSkipDistanceForFrequency,
  estimateGroundWaveRangeKm,
  FOF2_PRESETS,
  estimateMUF,
  EARTH_RADIUS_KM,
  PROPAGATION_GROUND_WAVE,
  PROPAGATION_SKY_WAVE,
  SKIP_ZONE_PARAMS
} from '$lib/data/propagation';
import { IONOSPHERE_PARAMETERS } from '$lib/data/constants';
import { safeDivide } from '$lib/utils/handlers';

/** Reglerbereiche des Widgets */
export const PROPAGATION_LIMITS = {
  heightM: { min: 1, max: 500, defaultTx: 30, defaultRx: 10 },
  frequencyHz: { min: 30e3, max: 3e9, default: 7.1e6 }
} as const;

/** Kritische Frequenzen foF2 für Tag und Nacht — Werte aus `$lib/data/propagation`. */
export { FOF2_PRESETS };

export type PropagationModeId = 'bodenwelle' | 'raumwelle' | 'sichtlinie';

export const MODE_LABELS: Record<PropagationModeId, string> = {
  bodenwelle: 'Bodenwelle',
  raumwelle: 'Raumwelle',
  sichtlinie: 'Sichtverbindung'
};

/** Dominierender Modus nach Frequenzbereich der Projektdaten */
export function classifyMode(frequencyHz: number): PropagationModeId {
  if (frequencyHz < PROPAGATION_GROUND_WAVE.frequencyRangeHz.max) return 'bodenwelle';
  if (frequencyHz <= PROPAGATION_SKY_WAVE.frequencyRangeHz.max) return 'raumwelle';
  return 'sichtlinie';
}

/**
 * Bodenwellenreichweite als Faustregel — gerechnet wird in
 * `$lib/data/propagation`; hier nur weitergereicht, damit die bisherigen
 * Importpfade des Widgets bestehen bleiben.
 */
export { estimateGroundWaveRangeKm };

export interface PropagationScene {
  mode: PropagationModeId;
  horizonTxKm: number;
  horizonRxKm: number;
  /** Maximale Sichtverbindungsdistanz (Summe beider Horizonte) in km */
  losMaxKm: number;
  groundWaveRangeKm: number;
  /** Sprungdistanz in km; null = keine Reflexion (f über der MUF) */
  skipDistanceKm: number | null;
  /** Tote Zone zwischen Bodenwelle und erster Raumwelle in km (null = keine) */
  skipZone: { fromKm: number; toKm: number } | null;
  /** MUF für die Referenzdistanz 3000 km in MHz */
  mufKm3000MHz: number;
  reflectionHeightKm: number;
  foF2MHz: number;
}

export function computePropagationScene(
  txHeightM: number,
  rxHeightM: number,
  frequencyHz: number,
  isDay: boolean
): PropagationScene {
  const mode = classifyMode(frequencyHz);
  const foF2MHz = isDay ? FOF2_PRESETS.day : FOF2_PRESETS.night;
  const reflectionHeightKm = isDay
    ? SKIP_ZONE_PARAMS.reflectionHeightKm.day
    : SKIP_ZONE_PARAMS.reflectionHeightKm.night;
  const frequencyMHz = frequencyHz / 1e6;

  const horizonTxKm = calculateRadioHorizon(txHeightM, true);
  const horizonRxKm = calculateRadioHorizon(rxHeightM, true);
  const losMaxKm = calculateMaxLOSDistance(txHeightM, rxHeightM, true);
  const groundWaveRangeKm = estimateGroundWaveRangeKm(frequencyHz);

  let skipDistanceKm: number | null = null;
  if (mode !== 'sichtlinie') {
    skipDistanceKm = calculateSkipDistanceForFrequency(frequencyMHz, foF2MHz, reflectionHeightKm);
  }

  const skipZone =
    skipDistanceKm !== null && skipDistanceKm > groundWaveRangeKm
      ? { fromKm: groundWaveRangeKm, toKm: skipDistanceKm }
      : null;

  return {
    mode,
    horizonTxKm,
    horizonRxKm,
    losMaxKm,
    groundWaveRangeKm,
    skipDistanceKm,
    skipZone,
    mufKm3000MHz: estimateMUF(
      foF2MHz,
      IONOSPHERE_PARAMETERS.mufReferenceDistanceKm,
      reflectionHeightKm
    ),
    reflectionHeightKm,
    foF2MHz
  };
}

// ============================================================================
// Geometrie der Kugelerde-Skizze
// ============================================================================

export interface SketchGeometry {
  /** Mittelpunkt des gezeichneten Erdkreises */
  cx: number;
  cy: number;
  /** Gezeichneter Erdradius in px */
  radiusPx: number;
  /** Bogenlänge auf der Oberfläche: km → rad */
  kmToRad: number;
  /** Überhöhung der Höhen: km → px */
  altitudeScale: number;
  /** Streckenlänge, die der Skizze zugrunde liegt, in km */
  spanKm: number;
}

/** Breite/Höhe der Skizze (viewBox) */
export const SKETCH_WIDTH = 800;
export const SKETCH_HEIGHT = 380;
/** y-Koordinate der Erdoberfläche in der Bildmitte */
export const SKETCH_GROUND_Y = 320;

/**
 * Geometrie so wählen, dass die Strecke `spanKm` die Bildbreite füllt und
 * die höchste darzustellende Höhe `maxAltitudeKm` in den oberen Bildteil passt.
 * Für weite Strecken (Raumwelle) ist die Krümmung real, für kurze wird sie
 * schematisch übertrieben, damit der Horizont sichtbar bleibt.
 */
export function sketchGeometry(spanKm: number, maxAltitudeKm: number): SketchGeometry {
  const usableWidth = SKETCH_WIDTH * 0.85;
  const usableHeight = SKETCH_GROUND_Y * 0.7;
  const realHalfAngle = safeDivide(spanKm, 2 * EARTH_RADIUS_KM, 0);
  // Mindestens 12° Halbwinkel, damit der Bogen erkennbar gekrümmt ist
  const halfAngle = Math.max(realHalfAngle, (12 * Math.PI) / 180);
  const radiusPx = safeDivide(usableWidth / 2, Math.sin(halfAngle), usableWidth);
  const kmToRad = safeDivide(2 * halfAngle, spanKm, 0);
  const altitudeScale = safeDivide(usableHeight, Math.max(maxAltitudeKm, 1e-3), 0);
  return {
    cx: SKETCH_WIDTH / 2,
    cy: SKETCH_GROUND_Y + radiusPx,
    radiusPx,
    kmToRad,
    altitudeScale,
    spanKm
  };
}

/** Punkt auf/über der Kugeloberfläche: Bogenlänge ab Bildmitte (km) und Höhe (km) */
export function sketchPoint(
  geometry: SketchGeometry,
  distanceFromCenterKm: number,
  altitudeKm: number
): { x: number; y: number } {
  const angle = distanceFromCenterKm * geometry.kmToRad;
  const radius = geometry.radiusPx + altitudeKm * geometry.altitudeScale;
  return {
    x: geometry.cx + radius * Math.sin(angle),
    y: geometry.cy - radius * Math.cos(angle)
  };
}

/** SVG-Pfad eines Bogens auf konstanter Höhe zwischen zwei Bogenlängen (km) */
export function sketchArcPath(
  geometry: SketchGeometry,
  fromKm: number,
  toKm: number,
  altitudeKm: number,
  samples: number = 32
): string {
  const parts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const km = fromKm + ((toKm - fromKm) * i) / samples;
    const { x, y } = sketchPoint(geometry, km, altitudeKm);
    parts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return parts.join(' ');
}
