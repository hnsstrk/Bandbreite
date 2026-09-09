/**
 * Rechenmodell der Strom- und Spannungsverteilung auf einem Dipol
 * (Widget `DipoleCurrentWidget`).
 *
 * Auf einem dünnen, mittengespeisten Dipol der Gesamtlänge L stellt sich eine
 * stehende Welle ein. Mit der halben Länge h = L/2 und k = 2π/λ gilt für den
 * Strom die klassische sinusförmige Näherung
 *
 *     I(z) = I₀ · sin(k·(h − |z|)),
 *
 * die an den Enden null wird (dort kann kein Strom weiterfließen). Die
 * Spannung ist dazu um 90° versetzt und folgt cos(k·(h − |z|)): am Ende ein
 * Spannungsbauch, in der Mitte des λ/2-Dipols ein Spannungsknoten.
 *
 * Daraus folgt die Fußpunktimpedanz: Beim λ/2-Dipol liegt in der Mitte ein
 * Strombauch — die Impedanz ist niedrig (73 Ω). Beim Ganzwellendipol liegt
 * dort ein Stromknoten — die Impedanz wird sehr hoch (einige kΩ).
 *
 * Quellen:
 * - Balanis, *Antenna Theory*, Kap. 4.5 — sinusförmige Stromverteilung,
 *   R_r = 73 Ω für den λ/2-Dipol
 * - Kraus, *Antennas* — Strahlungswiderstand des kurzen Dipols
 *   R_r = 20·π²·(L/λ)²
 * - Rothammels Antennenbuch — Strom- und Spannungsbild, Speisepunktwahl
 */

import { TWO_PI } from '$lib/utils/modulationMath';
import { safeDivide } from '$lib/utils/handlers';

/** Strahlungswiderstand des λ/2-Dipols (Balanis: 73 Ω + j42,5 Ω). */
export const HALF_WAVE_RESISTANCE_OHM = 73.1;

/** Grenzen und Vorgabewerte des Widgets. */
export const DIPOLE_LIMITS = {
  lengthWavelengths: { min: 0.1, max: 1.5, default: 0.5 }
} as const;

/** Bekannte Bauformen als Sprungmarken auf dem Regler. */
export const DIPOLE_PRESETS = [
  { value: 0.5, label: 'λ/2-Dipol' },
  { value: 1, label: 'Ganzwellendipol' },
  { value: 1.25, label: '5/4-λ-Dipol' }
] as const;

/**
 * Stromamplitude an der Stelle z (in Wellenlängen, 0 = Speisepunkt),
 * unnormiert: sin(k·(h − |z|)).
 */
export function rawCurrent(zWavelengths: number, lengthWavelengths: number): number {
  const halfLength = lengthWavelengths / 2;
  const distanceFromEnd = halfLength - Math.abs(zWavelengths);
  if (distanceFromEnd < 0) return 0;
  return Math.sin(TWO_PI * distanceFromEnd);
}

/** Spannungsamplitude an der Stelle z, unnormiert: cos(k·(h − |z|)). */
export function rawVoltage(zWavelengths: number, lengthWavelengths: number): number {
  const halfLength = lengthWavelengths / 2;
  const distanceFromEnd = halfLength - Math.abs(zWavelengths);
  if (distanceFromEnd < 0) return 0;
  return Math.cos(TWO_PI * distanceFromEnd);
}

/**
 * Größte Stromamplitude auf dem Draht — Bezugswert der Normierung.
 * Für L ≤ λ/2 liegt sie im Speisepunkt, darüber wandert sie nach außen.
 */
export function peakCurrent(lengthWavelengths: number, samples: number = 401): number {
  const halfLength = lengthWavelengths / 2;
  let peak = 0;
  const count = Math.max(2, Math.round(samples));
  for (let index = 0; index < count; index++) {
    const z = -halfLength + (index / (count - 1)) * lengthWavelengths;
    peak = Math.max(peak, Math.abs(rawCurrent(z, lengthWavelengths)));
  }
  return peak;
}

/**
 * Anteil des Speisepunktstroms am Strommaximum: |sin(π·L/λ)| / I_max.
 * 1 beim λ/2-Dipol (Strombauch), 0 beim Ganzwellendipol (Stromknoten).
 */
export function feedCurrentFraction(lengthWavelengths: number): number {
  const peak = peakCurrent(lengthWavelengths);
  return safeDivide(Math.abs(rawCurrent(0, lengthWavelengths)), peak, 0);
}

/**
 * Strahlungswiderstand des **kurzen** Dipols: R_r = 20·π²·(L/λ)².
 * Gültig bis etwa L = 0,1·λ (Kraus).
 */
export function shortDipoleResistanceOhm(lengthWavelengths: number): number {
  return 20 * Math.PI * Math.PI * lengthWavelengths * lengthWavelengths;
}

/** Ein Abtastpunkt der stehenden Welle, auf das Strommaximum normiert. */
export interface DipoleSample {
  /** Ort auf dem Draht in Wellenlängen, 0 = Speisepunkt */
  zWavelengths: number;
  current: number;
  voltage: number;
}

/** Strom- und Spannungsverteilung über die ganze Drahtlänge. */
export function dipoleSamples(lengthWavelengths: number, samples: number = 161): DipoleSample[] {
  const halfLength = lengthWavelengths / 2;
  const peak = peakCurrent(lengthWavelengths);
  const count = Math.max(2, Math.round(samples));
  return Array.from({ length: count }, (_, index) => {
    const zWavelengths = -halfLength + (index / (count - 1)) * lengthWavelengths;
    return {
      zWavelengths,
      current: safeDivide(rawCurrent(zWavelengths, lengthWavelengths), peak, 0),
      voltage: rawVoltage(zWavelengths, lengthWavelengths)
    };
  });
}

/**
 * Qualitative Einordnung der Fußpunktimpedanz aus dem Speisepunktstrom.
 * Genaue Werte verlangen eine Momentenmethode; hier reicht die Tendenz.
 */
export function feedImpedanceNote(lengthWavelengths: number): string {
  const fraction = feedCurrentFraction(lengthWavelengths);
  if (fraction > 0.9)
    return 'Strombauch am Speisepunkt — niedrige Impedanz (rund 73 Ω beim λ/2-Dipol)';
  if (fraction > 0.4)
    return 'Speisepunkt zwischen Bauch und Knoten — Impedanz steigt, kräftiger Blindanteil';
  return 'Stromknoten am Speisepunkt — sehr hohe Impedanz (einige kΩ), Spannungsspeisung nötig';
}
