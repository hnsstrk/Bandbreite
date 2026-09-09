/**
 * Rechenmodell der Tag-Nacht-Ionosphäre (Widget `IonosphereDayNightWidget`).
 *
 * Die vier Schichten entstehen durch Ionisation der Hochatmosphäre und
 * verschwinden nach Sonnenuntergang unterschiedlich schnell wieder: Die
 * D-Schicht ist nachts weg, E schwächt sich stark ab, F1 verschmilzt mit F2,
 * und nur F2 bleibt — mit etwa halber Elektronendichte.
 *
 * Modell: Die Beleuchtung folgt einem einfachen Sonnenstand
 * (Sonnenaufgang 6 Uhr, Höchststand 12 Uhr, Untergang 18 Uhr), die
 * Elektronendichte jeder Schicht wird zwischen Nacht- und Tageswert
 * interpoliert. Das Höhenprofil ist eine Summe glockenförmiger Schichten um
 * die typische Höhe — **schematisch**, kein Chapman-Profil.
 *
 * Kritische Frequenz und MUF kommen aus `$lib/data/propagation.ts`
 * (`calculateCriticalFrequency`, `estimateMUF`), die Schichthöhen aus
 * `$lib/data/constants.ts` (`IONOSPHERIC_LAYERS`).
 *
 * Quellen der Dichtewerte (Richtwerte mittlerer Breiten, mittlere
 * Sonnenaktivität):
 * - Davies, K.: *Ionospheric Radio*, Kap. 3 — Tages- und Nachtwerte von
 *   N_max je Schicht
 * - ITU-R P.1239 — foE, foF1, foF2 im Tagesgang
 * Annahme: Der Tagesgang wird sinusförmig genähert; reale Profile hängen von
 * Jahreszeit, Breite und Sonnenaktivität ab.
 */

import { IONOSPHERIC_LAYERS } from '$lib/data/constants';
import { calculateCriticalFrequency, estimateMUF } from '$lib/data/propagation';
import { clamp, safeDivide } from '$lib/utils/handlers';

/** Grenzen und Vorgabewerte des Widgets. */
export const DAY_NIGHT_LIMITS = {
  hourOfDay: { min: 0, max: 24, default: 12 },
  distanceKm: { min: 0, max: 3000, default: 2000 }
} as const;

/** Sonnenaufgang und -untergang des vereinfachten Tagesgangs (Ortszeit). */
export const SUNRISE_HOUR = 6;
export const SUNSET_HOUR = 18;

/** Maximale Elektronendichte je Schicht in e⁻/m³ (Richtwerte, siehe Modulkopf). */
export const LAYER_DENSITY: Record<string, { day: number; night: number }> = {
  'd-layer': { day: 1e9, night: 1e7 },
  'e-layer': { day: 1.1e11, night: 5e9 },
  'f1-layer': { day: 2.5e11, night: 1e9 },
  'f2-layer': { day: 1e12, night: 2.5e11 }
};

/**
 * Beleuchtung 0 … 1 aus der Ortszeit: null vor Sonnenaufgang und nach
 * Sonnenuntergang, sinusförmig dazwischen mit dem Höchstwert um 12 Uhr.
 */
export function illumination(hourOfDay: number): number {
  const hour = ((hourOfDay % 24) + 24) % 24;
  if (hour <= SUNRISE_HOUR || hour >= SUNSET_HOUR) return 0;
  return Math.sin((Math.PI * (hour - SUNRISE_HOUR)) / (SUNSET_HOUR - SUNRISE_HOUR));
}

/** Ist es zu dieser Stunde Tag? */
export function isDaylight(hourOfDay: number): boolean {
  return illumination(hourOfDay) > 0;
}

/** Elektronendichte einer Schicht zur gegebenen Stunde in e⁻/m³. */
export function layerDensity(layerId: string, hourOfDay: number): number {
  const range = LAYER_DENSITY[layerId];
  if (!range) return 0;
  const t = clamp(illumination(hourOfDay), 0, 1);
  return range.night + (range.day - range.night) * t;
}

/** Kritische Frequenz einer Schicht in MHz: f_c = 9·√N_max (in Hz). */
export function layerCriticalFrequencyMHz(layerId: string, hourOfDay: number): number {
  return calculateCriticalFrequency(layerDensity(layerId, hourOfDay));
}

/** Zustand einer Schicht zur gegebenen Stunde. */
export interface LayerState {
  id: string;
  nameDE: string;
  altitudeMinKm: number;
  altitudeMaxKm: number;
  peakKm: number;
  densityPerM3: number;
  criticalFrequencyMHz: number;
  /** Dichte bezogen auf den Tageshöchstwert der Schicht, 0 … 1 */
  relative: number;
}

/** Zustand aller vier Schichten zur gegebenen Stunde. */
export function layerStates(hourOfDay: number): LayerState[] {
  return IONOSPHERIC_LAYERS.map((layer) => {
    const densityPerM3 = layerDensity(layer.id, hourOfDay);
    const peak = LAYER_DENSITY[layer.id]?.day ?? densityPerM3;
    return {
      id: layer.id,
      nameDE: layer.nameDE,
      altitudeMinKm: layer.altitudeMinKm,
      altitudeMaxKm: layer.altitudeMaxKm,
      peakKm: layer.typicalPeakKm,
      densityPerM3,
      criticalFrequencyMHz: calculateCriticalFrequency(densityPerM3),
      relative: clamp(safeDivide(densityPerM3, peak, 0), 0, 1)
    };
  });
}

/**
 * Schematisches Höhenprofil der Elektronendichte: Summe glockenförmiger
 * Beiträge um die typische Höhe jeder Schicht.
 *
 * @param maxAltitudeKm oberer Rand des Profils
 * @param samples Zahl der Stützstellen
 */
export function densityProfile(
  hourOfDay: number,
  maxAltitudeKm: number = 450,
  samples: number = 120
): { altitudeKm: number; densityPerM3: number }[] {
  const states = layerStates(hourOfDay);
  const count = Math.max(2, Math.round(samples));
  return Array.from({ length: count }, (_, index) => {
    const altitudeKm = (index / (count - 1)) * maxAltitudeKm;
    const densityPerM3 = states.reduce((sum, layer) => {
      const width = Math.max(10, (layer.altitudeMaxKm - layer.altitudeMinKm) / 2);
      const z = (altitudeKm - layer.peakKm) / width;
      return sum + layer.densityPerM3 * Math.exp(-z * z);
    }, 0);
    return { altitudeKm, densityPerM3 };
  });
}

/** MUF der F2-Schicht für eine Sprungdistanz, in MHz. */
export function mufMHz(hourOfDay: number, distanceKm: number): number {
  return estimateMUF(layerCriticalFrequencyMHz('f2-layer', hourOfDay), distanceKm);
}

/**
 * Schematisches Maß der D-Schicht-Absorption, 0 … 1: proportional zur
 * Elektronendichte der D-Schicht. Am Tag schluckt sie die unteren
 * Kurzwellenbänder, nachts ist sie verschwunden.
 */
export function absorptionIndex(hourOfDay: number): number {
  const range = LAYER_DENSITY['d-layer'];
  return clamp(safeDivide(layerDensity('d-layer', hourOfDay), range.day, 0), 0, 1);
}
