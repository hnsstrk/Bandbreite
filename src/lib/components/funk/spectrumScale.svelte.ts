/**
 * Logarithmische Frequenzachse für die Spektrumsleisten der Funk-Widgets.
 *
 * Alle Funktionen sind rein und liefern Prozentwerte, damit die Balken ohne
 * Messung der Elementbreite gezeichnet werden können (SSR-tauglich).
 */

import { safeDivide, safeLog, clamp } from '$lib/utils/handlers';

/** Prozentanteil in [0, 100] auf der logarithmischen Achse. */
export function logPositionPercent(hz: number, minHz: number, maxHz: number): number {
  if (!Number.isFinite(hz) || hz <= 0) return 0;
  if (minHz <= 0 || maxHz <= minHz) return 0;
  const span = safeLog(maxHz, 10, 0) - safeLog(minHz, 10, 0);
  const offset = safeLog(hz, 10, 0) - safeLog(minHz, 10, 0);
  return clamp(safeDivide(offset, span, 0) * 100, 0, 100);
}

/** Umkehrung: Prozentwert der Achse zurück in eine Frequenz in Hz. */
export function frequencyAtPercent(percent: number, minHz: number, maxHz: number): number {
  if (minHz <= 0 || maxHz <= minHz) return minHz;
  const ratio = clamp(percent, 0, 100) / 100;
  const logMin = safeLog(minHz, 10, 0);
  const logMax = safeLog(maxHz, 10, 0);
  return 10 ** (logMin + ratio * (logMax - logMin));
}

/** Geometrie eines Bandsegments auf der Achse. */
export interface SegmentGeometry {
  leftPercent: number;
  widthPercent: number;
}

/**
 * Links- und Breitenanteil eines Frequenzbereichs.
 * Sehr schmale Bereiche erhalten `minWidthPercent`, damit sie sichtbar bleiben.
 */
export function segmentGeometry(
  fromHz: number,
  toHz: number,
  minHz: number,
  maxHz: number,
  minWidthPercent = 0.35
): SegmentGeometry {
  const left = logPositionPercent(fromHz, minHz, maxHz);
  const right = logPositionPercent(Math.max(toHz, fromHz), minHz, maxHz);
  const width = Math.max(right - left, minWidthPercent);
  return {
    leftPercent: clamp(left, 0, 100),
    widthPercent: clamp(width, 0, 100 - clamp(left, 0, 100))
  };
}

/** Ein Achsenstrich mit Beschriftung. */
export interface AxisTick {
  hz: number;
  label: string;
  positionPercent: number;
}

const DECADE_UNITS: { factor: number; symbol: string }[] = [
  { factor: 1e9, symbol: 'GHz' },
  { factor: 1e6, symbol: 'MHz' },
  { factor: 1e3, symbol: 'kHz' },
  { factor: 1, symbol: 'Hz' }
];

/** Kurzbeschriftung einer Dekadenmarke, z. B. „10 MHz". */
export function decadeLabel(hz: number): string {
  const unit = DECADE_UNITS.find((candidate) => hz >= candidate.factor) ?? DECADE_UNITS[3];
  const value = safeDivide(hz, unit.factor, 0);
  const rounded = Number(value.toPrecision(3));
  return `${rounded.toLocaleString('de-DE')} ${unit.symbol}`;
}

/** Dekadenmarken zwischen zwei Frequenzen (10^n innerhalb der Grenzen). */
export function decadeTicks(minHz: number, maxHz: number): AxisTick[] {
  if (minHz <= 0 || maxHz <= minHz) return [];
  const first = Math.ceil(safeLog(minHz, 10, 0));
  const last = Math.floor(safeLog(maxHz, 10, 0));
  const ticks: AxisTick[] = [];
  for (let exponent = first; exponent <= last; exponent += 1) {
    const hz = 10 ** exponent;
    ticks.push({
      hz,
      label: decadeLabel(hz),
      positionPercent: logPositionPercent(hz, minHz, maxHz)
    });
  }
  return ticks;
}
