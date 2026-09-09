/**
 * Rechenmodell der OFDM-Unterträger (Widget `OfdmWidget`).
 *
 * Ein OFDM-Symbol besteht aus vielen Unterträgern, die alle über dieselbe
 * Symboldauer T_s gesendet werden. Weil jeder Träger im Zeitbereich ein
 * Rechteckfenster der Länge T_s durchläuft, ist sein Spektrum ein
 * si-Verlauf: |sin(π·x)/(π·x)| mit x = (f − f_k)/Δf. Der Trick von OFDM ist
 * der Trägerabstand
 *
 *     Δf = 1 / T_s,
 *
 * denn dann liegt jede Nullstelle eines Trägers genau auf den Maxima aller
 * anderen: Die Träger überlappen sich, stören sich aber nicht — sie sind
 * orthogonal.
 *
 * Reine Funktionen ohne DOM-Bezug.
 *
 * Quellen:
 * - 3GPP TS 36.211 — LTE: Δf = 15 kHz, also T_s ≈ 66,7 µs
 * - ETSI EN 300 744 — DVB-T, 8k-Modus: Δf ≈ 1116 Hz
 * - Proakis/Salehi, *Digital Communications* — Orthogonalität der Träger
 */

import { safeDivide } from '$lib/utils/handlers';

/** Trägerabstand in LTE und 5G-NR (Numerologie µ = 0): 15 kHz. */
export const LTE_SUBCARRIER_SPACING_HZ = 15_000;

/** Trägerabstand in DVB-T, 8k-Modus: rund 1116 Hz. */
export const DVBT_8K_SPACING_HZ = 1116;

/** Grenzen und Vorgabewerte des Widgets. */
export const OFDM_LIMITS = {
  subcarriers: { min: 2, max: 16, default: 6 },
  spacingHz: { min: 1000, max: 60_000, default: LTE_SUBCARRIER_SPACING_HZ }
} as const;

/** Bit je Symbol der üblichen Unterträger-Modulationen. */
export const BITS_PER_SYMBOL_OPTIONS = [
  { value: '1', label: 'BPSK · 1 Bit/Symbol' },
  { value: '2', label: 'QPSK · 2 Bit/Symbol' },
  { value: '4', label: '16-QAM · 4 Bit/Symbol' },
  { value: '6', label: '64-QAM · 6 Bit/Symbol' }
] as const;

/** Normierte si-Funktion: sin(π·x)/(π·x), mit si(0) = 1. */
export function sinc(x: number): number {
  if (x === 0) return 1;
  const argument = Math.PI * x;
  return Math.sin(argument) / argument;
}

/** Symboldauer aus dem Trägerabstand: T_s = 1/Δf in Sekunden. */
export function symbolDurationS(spacingHz: number): number {
  return safeDivide(1, spacingHz, 0);
}

/** Trägerabstand aus der Symboldauer: Δf = 1/T_s in Hz. */
export function spacingFromDurationHz(durationS: number): number {
  return safeDivide(1, durationS, 0);
}

/**
 * Mittenfrequenzen der Unterträger, symmetrisch um 0 gelegt.
 * Bei gerader Trägerzahl liegt kein Träger genau auf der Mitte.
 */
export function subcarrierFrequencies(count: number, spacingHz: number): number[] {
  const total = Math.max(1, Math.round(count));
  const offset = (total - 1) / 2;
  return Array.from({ length: total }, (_, index) => (index - offset) * spacingHz);
}

/** Spektrale Amplitude eines Unterträgers an der Stelle f (auf 1 normiert). */
export function subcarrierAmplitude(
  frequencyHz: number,
  centerHz: number,
  spacingHz: number
): number {
  return sinc(safeDivide(frequencyHz - centerHz, spacingHz, 0));
}

/**
 * Belegte Bandbreite von Nullstelle zu Nullstelle: (N + 1)·Δf.
 * Die nominelle Bandbreite N·Δf ist der Abstand der äußersten Trägermitten
 * plus einem halben Abstand auf jeder Seite.
 */
export function nullToNullBandwidthHz(count: number, spacingHz: number): number {
  return (Math.max(1, Math.round(count)) + 1) * spacingHz;
}

/** Nominelle Bandbreite: N·Δf. */
export function nominalBandwidthHz(count: number, spacingHz: number): number {
  return Math.max(1, Math.round(count)) * spacingHz;
}

/**
 * Bruttodatenrate ohne Schutzintervall: N · Bit/Symbol · Δf, denn je Träger
 * wird alle T_s = 1/Δf ein Symbol übertragen.
 */
export function grossBitRateBps(count: number, bitsPerSymbol: number, spacingHz: number): number {
  return Math.max(0, Math.round(count)) * bitsPerSymbol * spacingHz;
}

/** Ein Abtastpunkt des Summenspektrums. */
export interface SpectrumSample {
  frequencyHz: number;
  /** Amplituden der einzelnen Träger an dieser Stelle */
  amplitudes: number[];
}

/**
 * Abtastwerte des Spektrums über den dargestellten Bereich.
 *
 * @param span Halbe Breite des Ausschnitts in Vielfachen von Δf
 */
export function spectrumSamples(
  count: number,
  spacingHz: number,
  span: number = 1.5,
  samples: number = 481
): SpectrumSample[] {
  const centers = subcarrierFrequencies(count, spacingHz);
  const half = nominalBandwidthHz(count, spacingHz) / 2 + span * spacingHz;
  const total = Math.max(2, Math.round(samples));
  return Array.from({ length: total }, (_, index) => {
    const frequencyHz = -half + (index / (total - 1)) * 2 * half;
    return {
      frequencyHz,
      amplitudes: centers.map((center) => subcarrierAmplitude(frequencyHz, center, spacingHz))
    };
  });
}

/**
 * Übersprechen auf die Nachbarn im Abtastzeitpunkt: Summe der Beträge aller
 * anderen Träger an der Mittenfrequenz eines Trägers. Bei Δf = 1/T_s ist das
 * exakt null — das ist die Orthogonalitätsbedingung.
 */
export function crosstalkAtCenter(count: number, spacingHz: number): number {
  const centers = subcarrierFrequencies(count, spacingHz);
  if (centers.length < 2) return 0;
  const target = centers[Math.floor(centers.length / 2)];
  return centers
    .filter((center) => center !== target)
    .reduce((sum, center) => sum + Math.abs(subcarrierAmplitude(target, center, spacingHz)), 0);
}
