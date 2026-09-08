/**
 * Anzeigetexte des Spektrums: Einheitenleitern für Frequenz und Wellenlänge.
 *
 * Die Achsen reichen weiter als die allgemeinen Formatter in
 * `$lib/utils/formatting` (PHz/EHz nach oben, pm/fm nach unten) und arbeiten
 * mit magnitudenabhängigen Nachkommastellen, damit die Tick-Beschriftungen
 * kurz bleiben. Die Ziffern selbst kommen ausschließlich aus `formatFixed`
 * (de-DE: Dezimalkomma, Tausenderpunkt) — hier steht nur die Einheitenwahl.
 */

import { formatFixed } from '$lib/utils/formatting';

/** Frequenz-Einheitenleiter Hz … EHz, eine Nachkommastelle ab kHz. */
const FREQUENCY_STEPS: ReadonlyArray<{ factor: number; unit: string }> = [
  { factor: 1e18, unit: 'EHz' },
  { factor: 1e15, unit: 'PHz' },
  { factor: 1e12, unit: 'THz' },
  { factor: 1e9, unit: 'GHz' },
  { factor: 1e6, unit: 'MHz' },
  { factor: 1e3, unit: 'kHz' }
];

/** Kurzform einer Frequenz für Achsen, Cursor und Markeranzeige. */
export function formatFrequencyLocal(hz: number): string {
  for (const step of FREQUENCY_STEPS) {
    if (hz >= step.factor) return `${formatFixed(hz / step.factor, 1)} ${step.unit}`;
  }
  return `${formatFixed(hz, 0)} Hz`;
}

/**
 * Wellenlängen-Einheitenleiter km … fm. Ab `tenMin` (zehn Einheiten) entfällt
 * die Nachkommastelle („1,5 m", aber „15 m"); die Schwellen stehen explizit,
 * damit kein Gleitkommaprodukt über die Stellenzahl entscheidet.
 */
const WAVELENGTH_STEPS: ReadonlyArray<{ min: number; tenMin: number; factor: number; unit: string }> = [
  { min: 1, tenMin: 10, factor: 1, unit: 'm' },
  { min: 0.01, tenMin: 0.1, factor: 100, unit: 'cm' },
  { min: 0.001, tenMin: 0.01, factor: 1000, unit: 'mm' },
  { min: 1e-6, tenMin: 1e-5, factor: 1e6, unit: 'μm' },
  { min: 1e-9, tenMin: 1e-8, factor: 1e9, unit: 'nm' },
  { min: 1e-12, tenMin: 1e-11, factor: 1e12, unit: 'pm' }
];

/** Kurzform einer Wellenlänge für Achsen, Cursor und Tooltip. */
export function formatWavelengthLocal(meters: number): string {
  if (meters >= 1000) return `${formatFixed(meters / 1000, 0)} km`;
  for (const step of WAVELENGTH_STEPS) {
    if (meters >= step.min) {
      return `${formatFixed(meters * step.factor, meters >= step.tenMin ? 0 : 1)} ${step.unit}`;
    }
  }
  return `${formatFixed(meters * 1e15, 0)} fm`;
}

/** Zoomstufe: „1,5x" unter 10, sonst ganzzahlig „15x". */
export function formatZoom(level: number): string {
  if (level >= 10) return `${Math.round(level)}x`;
  return `${formatFixed(level, 1)}x`;
}
