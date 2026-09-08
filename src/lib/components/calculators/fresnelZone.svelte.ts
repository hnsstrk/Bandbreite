/**
 * Bereiche, Presets und Geometrie des Fresnel-Zonen-Rechners.
 *
 * Die Radiusformel selbst steht in `$lib/utils/calculations`
 * (`calculateFresnelRadius`).
 */

import { calculateFresnelRadius } from '$lib/utils/calculations';
import { FREQUENCY_UNITS } from '$lib/data/units';
import type { ParamSpecs } from '$lib/utils/urlState.svelte';

/** Frequenzbereich: 30 MHz bis 100 GHz, logarithmisch. */
export const FRESNEL_FREQUENCY_MIN_HZ = 3e7;
export const FRESNEL_FREQUENCY_MAX_HZ = 1e11;

/** Streckenlänge: 100 m bis 1000 km, logarithmisch. */
export const TOTAL_DISTANCE_MIN_M = 100;
export const TOTAL_DISTANCE_MAX_M = 1e6;

/** Mindestabstand des Hindernisses zu den Endpunkten in Metern. */
export const OBSTACLE_EDGE_MARGIN_M = 10;

export const FREQUENCY_UNIT_OPTIONS = FREQUENCY_UNITS;

export const DISTANCE_UNIT_OPTIONS = [
  { id: 'm', symbol: 'm', factor: 1 },
  { id: 'km', symbol: 'km', factor: 1000 }
];

export const FRESNEL_PARAMS = {
  f: { default: 5.8e9, min: FRESNEL_FREQUENCY_MIN_HZ, max: FRESNEL_FREQUENCY_MAX_HZ },
  d: { default: 10000, min: TOTAL_DISTANCE_MIN_M, max: TOTAL_DISTANCE_MAX_M },
  o: { default: 5000, min: 0, max: TOTAL_DISTANCE_MAX_M }
} satisfies ParamSpecs;

/** Typische Richtfunk- und WLAN-Frequenzen (Werte in Hertz). */
export const FRESNEL_FREQUENCY_PRESETS = [
  { label: '900 MHz', value: 900e6, hint: 'GSM und LTE' },
  { label: '2,4 GHz', value: 2.4e9, hint: 'WLAN' },
  { label: '5 GHz', value: 5e9, hint: 'WLAN 5' },
  { label: '5,8 GHz', value: 5.8e9, hint: 'FPV und ISM' },
  { label: '10 GHz', value: 10e9, hint: 'Richtfunk' },
  { label: '18 GHz', value: 18e9, hint: 'Richtfunk' }
];

/** Typische Streckenlängen (Werte in Metern). */
export const FRESNEL_DISTANCE_PRESETS = [
  { label: '1 km', value: 1000 },
  { label: '2 km', value: 2000 },
  { label: '5 km', value: 5000 },
  { label: '10 km', value: 10000 },
  { label: '20 km', value: 20000 },
  { label: '50 km', value: 50000 }
];

/** Anzahl Stützstellen je Ellipsenhälfte. */
export const ELLIPSE_POINTS = 100;

/** Punkt der Zonenkontur: x entlang der Strecke, y als Abstand zur Sichtlinie. */
export interface EllipsePoint {
  x: number;
  y: number;
}

/**
 * Erzeugt die geschlossene Kontur der n-ten Fresnel-Zone über der Strecke:
 * obere Hälfte hin, untere Hälfte zurück.
 */
export function generateFresnelEllipse(
  wavelengthM: number,
  totalDistanceM: number,
  n: number,
  scale: number = 1
): EllipsePoint[] {
  const points: EllipsePoint[] = [];
  if (totalDistanceM <= 0 || wavelengthM <= 0) return points;

  const radiusAt = (index: number) => {
    const d1 = (index / ELLIPSE_POINTS) * totalDistanceM;
    const d2 = totalDistanceM - d1;
    return { d1, radius: calculateFresnelRadius(wavelengthM, d1, d2, n) * scale };
  };

  for (let i = 0; i <= ELLIPSE_POINTS; i++) {
    const { d1, radius } = radiusAt(i);
    points.push({ x: d1, y: radius });
  }
  for (let i = ELLIPSE_POINTS; i >= 0; i--) {
    const { d1, radius } = radiusAt(i);
    points.push({ x: d1, y: -radius });
  }

  return points;
}

/** Begrenzt die Hindernisposition auf das offene Innere der Strecke. */
export function clampObstaclePosition(positionM: number, totalDistanceM: number): number {
  const min = Math.min(OBSTACLE_EDGE_MARGIN_M, totalDistanceM / 2);
  const max = Math.max(min, totalDistanceM - min);
  return Math.min(Math.max(positionM, min), max);
}
