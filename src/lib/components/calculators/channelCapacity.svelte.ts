/**
 * Logik des Kanalkapazitäts-Rechners (Shannon-Hartley).
 *
 * Bereiche, Presets, URL-Parameter, die Modulationsfarben als Serien-Tokens
 * und die Kennlinie des Shannon-Limits — alles DOM-frei und testbar.
 */

import { MODULATION_SCHEMES, PRACTICAL_THROUGHPUT, type ModulationScheme } from '$lib/data/constants';
import { calculateSpectralEfficiency } from '$lib/utils/calculations';
import { safeDivide } from '$lib/utils/handlers';
import type { ParamSpecs } from '$lib/utils/urlState.svelte';

/** Bandbreite: 0,1 MHz bis 1000 MHz, logarithmisch. */
export const BANDWIDTH_MIN_HZ = 1e5;
export const BANDWIDTH_MAX_HZ = 1e9;

/** Störabstand in dB. */
export const SNR_MIN_DB = -10;
export const SNR_MAX_DB = 50;

/** Achsenbereiche des Diagramms */
export const CHART_SNR_MIN_DB = 0;
export const CHART_SNR_MAX_DB = 40;
export const CHART_EFFICIENCY_MAX = 15;

/** Schrittweite der Kennlinie in dB */
export const CURVE_STEP_DB = 0.5;

export const CAPACITY_PARAMS = {
  b: { default: 20e6, min: BANDWIDTH_MIN_HZ, max: BANDWIDTH_MAX_HZ },
  snr: { default: 20, min: SNR_MIN_DB, max: SNR_MAX_DB }
} satisfies ParamSpecs;

/** Bandbreiten-Einheiten für das Zahlenfeld. */
export const BANDWIDTH_UNIT_OPTIONS = [
  { id: 'kHz', symbol: 'kHz', factor: 1e3 },
  { id: 'MHz', symbol: 'MHz', factor: 1e6 },
  { id: 'GHz', symbol: 'GHz', factor: 1e9 }
];

/** Typische Kanalbandbreiten als Chips (Werte in Hertz). */
export const BANDWIDTH_PRESETS = [
  { label: 'WLAN 20', value: 20e6, hint: '802.11n/ac' },
  { label: 'WLAN 40', value: 40e6, hint: '802.11n/ac' },
  { label: 'WLAN 80', value: 80e6, hint: '802.11ac' },
  { label: 'WLAN 160', value: 160e6, hint: '802.11ax' },
  { label: 'LTE 10', value: 10e6, hint: 'LTE-Träger' },
  { label: '5G 100', value: 100e6, hint: 'NR n78' }
];

/** Modulationsart mit Serien-Token statt der Hex-Farbe aus `constants.ts`. */
export interface ModulationEntry extends ModulationScheme {
  /** Serien-Token für Fläche und Beschriftung */
  token: string;
}

export const MODULATION_ENTRIES: ModulationEntry[] = MODULATION_SCHEMES.map((scheme, index) => ({
  ...scheme,
  token: `var(--color-series-${index + 1})`
}));

/**
 * Praktische Datenrate: R_b = B/(1+α) · bit/Symbol · η
 * (Symbolrate = B/(1+α) mit Roll-off α, Protokolleffizienz η).
 */
export function practicalDataRate(bandwidthHz: number, scheme: ModulationScheme): number {
  if (bandwidthHz <= 0) return 0;
  const symbolRate = safeDivide(bandwidthHz, 1 + PRACTICAL_THROUGHPUT.rollOffFactor, 0);
  return symbolRate * scheme.bitsPerSymbol * PRACTICAL_THROUGHPUT.protocolEfficiency;
}

/** Höchste Modulationsart, die der Störabstand noch trägt. */
export function achievableModulation(snrDb: number): ModulationEntry | null {
  const suitable = MODULATION_ENTRIES.filter((entry) => snrDb >= entry.requiredSnrDb);
  return suitable.length > 0 ? suitable[suitable.length - 1] : null;
}

/** Ein Punkt der Shannon-Kennlinie */
export interface ShannonPoint {
  snr: number;
  capacity: number;
}

/** Kennlinie der spektralen Effizienz über dem Störabstand. */
export const SHANNON_CURVE: ShannonPoint[] = (() => {
  const points: ShannonPoint[] = [];
  for (let snr = CHART_SNR_MIN_DB; snr <= CHART_SNR_MAX_DB; snr += CURVE_STEP_DB) {
    points.push({ snr, capacity: calculateSpectralEfficiency(snr) });
  }
  return points;
})();

export const CHART_X_TICKS = [0, 5, 10, 15, 20, 25, 30, 35, 40] as const;
export const CHART_Y_TICKS = [0, 2, 4, 6, 8, 10, 12, 14] as const;
