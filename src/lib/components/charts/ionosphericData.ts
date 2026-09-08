/**
 * Bereiche, Farben und Kennzahlen des Ionosphären-Diagramms.
 *
 * Die Schichtdaten stehen in `data/constants.ts` (`IONOSPHERIC_LAYERS`,
 * `IONOSPHERE_PARAMETERS`), die Ausbreitungsformeln in `data/propagation.ts`.
 */

import { IONOSPHERE_PARAMETERS, IONOSPHERIC_LAYERS } from '$lib/data/constants';
import { calculateSkipDistanceForFrequency, estimateMUF } from '$lib/data/propagation';
import { safeDivide } from '$lib/utils/handlers';

/** Dargestellte Höhe in Kilometern. */
export const MAX_ALTITUDE_KM = 450;

/** Höhenmarken der linken Achse. */
export const ALTITUDE_TICKS_KM = [100, 200, 300, 400] as const;

/** Reglergrenzen. */
export const FREQUENCY_MIN_MHZ = 1;
export const FREQUENCY_MAX_MHZ = 30;
export const SOLAR_FLUX_MIN = 65;
export const SOLAR_FLUX_MAX = 300;

/** Reflexionshöhen der Schichten in Kilometern. */
export const E_LAYER_HEIGHT_KM = 110;
export const F1_LAYER_HEIGHT_KM = 200;

/** Grenzfrequenzen, ab denen eine höhere Schicht reflektiert (in MHz). */
export const E_LAYER_MAX_MHZ = 4;
export const F1_LAYER_MAX_MHZ = 10;

/** Farbpaare der Schichten — Fläche und Kontur aus Serien-Tokens. */
export const LAYER_COLORS: Record<string, { fill: string; fillOpacity: number; stroke: string }> = {
  'd-layer': { fill: 'var(--color-series-6)', fillOpacity: 0.2, stroke: 'var(--color-series-6)' },
  'e-layer': { fill: 'var(--color-series-3)', fillOpacity: 0.2, stroke: 'var(--color-series-3)' },
  'f1-layer': { fill: 'var(--color-series-2)', fillOpacity: 0.2, stroke: 'var(--color-series-2)' },
  'f2-layer': { fill: 'var(--color-series-1)', fillOpacity: 0.3, stroke: 'var(--color-series-1)' }
};

/** Amateurfunkbänder als Frequenz-Presets (Werte in MHz). */
export const BAND_PRESETS = [
  { label: '80 m', value: 3.6, hint: '3,5 bis 3,8 MHz' },
  { label: '40 m', value: 7.1, hint: '7,0 bis 7,2 MHz' },
  { label: '20 m', value: 14.2, hint: '14,0 bis 14,35 MHz' },
  { label: '15 m', value: 21.2, hint: '21,0 bis 21,45 MHz' },
  { label: '10 m', value: 28.5, hint: '28,0 bis 29,7 MHz' }
];

export const TIME_OPTIONS = [
  { value: 'day', label: 'Tag' },
  { value: 'night', label: 'Nacht' }
];

/**
 * Kritische Frequenz foF2 aus dem solaren Fluss — lineare Interpolation
 * zwischen den typischen Grenzwerten; nachts um den Reduktionsfaktor gedämpft.
 */
export function criticalFrequency(solarFluxIndex: number, isNight: boolean): number {
  const { typicalF2CriticalFrequencyMHz, solarFluxRange, nightF2ReductionFactor } =
    IONOSPHERE_PARAMETERS;
  const normalized = safeDivide(
    solarFluxIndex - solarFluxRange.min,
    solarFluxRange.max - solarFluxRange.min,
    0
  );
  const foF2 =
    typicalF2CriticalFrequencyMHz.low +
    normalized * (typicalF2CriticalFrequencyMHz.high - typicalF2CriticalFrequencyMHz.low);
  return isNight ? foF2 * nightF2ReductionFactor : foF2;
}

/** MUF für die Referenzdistanz nach dem Sekantengesetz. */
export function maximumUsableFrequency(foF2MHz: number): number {
  return estimateMUF(foF2MHz, IONOSPHERE_PARAMETERS.mufReferenceDistanceKm);
}

/**
 * LUF als schematische Schätzung. Die reale LUF hängt von D-Schicht-Absorption,
 * Sendeleistung, Antennen und Rauschen ab und hat keinen festen MUF-Bezug.
 */
export function lowestUsableFrequency(mufMHz: number, isNight: boolean): number {
  const factor = isNight
    ? IONOSPHERE_PARAMETERS.lufEstimateFactor.night
    : IONOSPHERE_PARAMETERS.lufEstimateFactor.day;
  return mufMHz * factor;
}

/** Sichtbare Schichten je Tageszeit. */
export function visibleLayers(isNight: boolean) {
  return IONOSPHERIC_LAYERS.filter((layer) =>
    isNight ? layer.nighttimePresent : layer.daytimePresent
  );
}

/** Reflexionshöhe und minimale Sprungdistanz zur eingestellten Frequenz. */
export function reflectionFor(
  frequencyMHz: number,
  foF2MHz: number
): { altitude: number; skipDistance: number | null } {
  let altitude: number = IONOSPHERE_PARAMETERS.typicalF2HeightKm;
  if (frequencyMHz < E_LAYER_MAX_MHZ) altitude = E_LAYER_HEIGHT_KM;
  else if (frequencyMHz < F1_LAYER_MAX_MHZ) altitude = F1_LAYER_HEIGHT_KM;

  return {
    altitude,
    skipDistance: calculateSkipDistanceForFrequency(frequencyMHz, foF2MHz, altitude)
  };
}

/** Rechnet eine Höhe in eine Y-Koordinate um. */
export function altitudeToY(altitudeKm: number, chartHeight: number): number {
  return chartHeight - (altitudeKm / MAX_ALTITUDE_KM) * chartHeight;
}
