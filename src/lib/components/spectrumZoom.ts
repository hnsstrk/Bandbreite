/**
 * Skalen- und Zoom-Mathematik des Spektrums — reine Funktionen ohne Zustand.
 *
 * Das Spektrum wird logarithmisch dargestellt. „Zoom" und „Verschiebung"
 * arbeiten deshalb im Log10-Raum: `zoomLevel` teilt die sichtbare Dekadenzahl,
 * `panOffset` ist der Abstand des linken Rands zur Untergrenze in Dekaden.
 * Die Sichtbarkeitsprüfung der Ticks und die Domäne selbst liegen hier,
 * damit `spectrumState.svelte.ts` nur noch Zustand verwaltet.
 */

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 100;

/** Faktor je Zoomschritt (Hinein: ×1,5, Heraus: ÷1,5). */
export const ZOOM_STEP_FACTOR = 1.5;
/** Anteil des sichtbaren Bereichs, um den ein Pfeil-Klick verschiebt. */
export const PAN_STEP_FRACTION = 0.25;
/** Zoomstufe des Sprungs „Sichtbares Licht". */
export const VISIBLE_LIGHT_ZOOM = 3;
/** Ab dieser Zoomstufe erhält jede Dekade einen Zwischen-Tick bei 3·10ⁿ. */
export const MID_TICK_MIN_ZOOM = 3;
const MID_TICK_FACTOR = 3;

export type Domain = [number, number];

/** Gesamtbereich in Dekaden zwischen zwei Frequenzen. */
export function logRange(minHz: number, maxHz: number): { logMin: number; logRange: number } {
  const logMin = Math.log10(minHz);
  return { logMin, logRange: Math.log10(maxHz) - logMin };
}

/**
 * Sichtbare Domäne [Hz, Hz] für Zoomstufe und Verschiebung; die Verschiebung
 * wird auf den zulässigen Bereich begrenzt.
 */
export function zoomedDomain(
  minHz: number,
  maxHz: number,
  zoomLevel: number,
  panOffset: number
): Domain {
  const { logMin, logRange: range } = logRange(minHz, maxHz);
  const visibleLogRange = range / zoomLevel;
  const maxPan = range - visibleLogRange;
  const clampedPan = Math.max(0, Math.min(panOffset, maxPan));
  const newLogMin = logMin + clampedPan;
  return [Math.pow(10, newLogMin), Math.pow(10, newLogMin + visibleLogRange)];
}

/**
 * Neue Verschiebung, wenn von `zoomLevel` auf `newZoom` gewechselt wird und
 * die Bildmitte stehen bleiben soll. Nach unten auf 0 begrenzt; die obere
 * Grenze setzt `zoomedDomain`.
 */
export function panOffsetKeepingCenter(
  minHz: number,
  maxHz: number,
  zoomLevel: number,
  panOffset: number,
  newZoom: number
): number {
  const { logRange: range } = logRange(minHz, maxHz);
  const oldVisibleRange = range / zoomLevel;
  const newVisibleRange = range / newZoom;
  const centerOffset = panOffset + oldVisibleRange / 2;
  return Math.max(0, centerOffset - newVisibleRange / 2);
}

/** Verschiebung um einen Schritt nach links (−1) oder rechts (+1), begrenzt. */
export function panOffsetStepped(
  minHz: number,
  maxHz: number,
  zoomLevel: number,
  panOffset: number,
  direction: -1 | 1
): number {
  const { logRange: range } = logRange(minHz, maxHz);
  const visibleLogRange = range / zoomLevel;
  const panStep = visibleLogRange * PAN_STEP_FRACTION;
  if (direction < 0) return Math.max(0, panOffset - panStep);
  return Math.min(range - visibleLogRange, panOffset + panStep);
}

/** Verschiebung, die `frequencyHz` bei gegebener Zoomstufe in die Bildmitte legt. */
export function panOffsetCenteredOn(
  minHz: number,
  maxHz: number,
  zoomLevel: number,
  frequencyHz: number
): number {
  const { logMin, logRange: range } = logRange(minHz, maxHz);
  const visibleLogRange = range / zoomLevel;
  const target = Math.log10(frequencyHz) - logMin - visibleLogRange / 2;
  return Math.max(0, Math.min(range - visibleLogRange, target));
}

/** Frequenz-Ticks: jede Dekade, ab `MID_TICK_MIN_ZOOM` zusätzlich 3·10ⁿ. */
export function frequencyTicks(domain: Domain, zoomLevel: number): number[] {
  const [domainMin, domainMax] = domain;
  const logMin = Math.floor(Math.log10(domainMin));
  const logMax = Math.ceil(Math.log10(domainMax));
  const ticks: number[] = [];

  for (let exp = logMin; exp <= logMax; exp++) {
    const value = Math.pow(10, exp);
    if (value >= domainMin && value <= domainMax) ticks.push(value);
    if (zoomLevel > MID_TICK_MIN_ZOOM) {
      const midValue = value * MID_TICK_FACTOR;
      if (midValue >= domainMin && midValue <= domainMax) ticks.push(midValue);
    }
  }

  return ticks.sort((a, b) => a - b);
}

/** Feste Wellenlängen-Ticks der oberen Achse (Beschriftung ohne Zahlformatierung). */
export const WAVELENGTH_TICK_DEFS: ReadonlyArray<{ wavelength: number; label: string }> = [
  { wavelength: 100e6, label: '100 Mm' },
  { wavelength: 10e6, label: '10 Mm' },
  { wavelength: 1e6, label: '1 Mm' },
  { wavelength: 100e3, label: '100 km' },
  { wavelength: 10e3, label: '10 km' },
  { wavelength: 1e3, label: '1 km' },
  { wavelength: 100, label: '100 m' },
  { wavelength: 10, label: '10 m' },
  { wavelength: 1, label: '1 m' },
  { wavelength: 0.1, label: '10 cm' },
  { wavelength: 0.01, label: '1 cm' },
  { wavelength: 0.001, label: '1 mm' },
  { wavelength: 0.0001, label: '100 μm' },
  { wavelength: 0.00001, label: '10 μm' },
  { wavelength: 0.000001, label: '1 μm' },
  { wavelength: 1e-7, label: '100 nm' },
  { wavelength: 1e-8, label: '10 nm' },
  { wavelength: 1e-9, label: '1 nm' },
  { wavelength: 1e-10, label: '100 pm' },
  { wavelength: 1e-11, label: '10 pm' },
  { wavelength: 1e-12, label: '1 pm' },
  { wavelength: 1e-13, label: '100 fm' },
  { wavelength: 1e-14, label: '10 fm' }
];

export interface WavelengthTick {
  freq: number;
  label: string;
  /** Zehnerexponent der Wellenlänge (1 m = 0, 10 cm = −1) für das Ausdünnen. */
  exponent: number;
}

/** Wellenlängen-Ticks, die bei Lichtgeschwindigkeit `c` in der Domäne liegen. */
export function wavelengthTicks(domain: Domain, c: number): WavelengthTick[] {
  const [domainMin, domainMax] = domain;
  return WAVELENGTH_TICK_DEFS.map((t) => ({
    freq: c / t.wavelength,
    label: t.label,
    exponent: Math.round(Math.log10(t.wavelength))
  })).filter((t) => t.freq >= domainMin && t.freq <= domainMax);
}

// =============================================================================
// Tick-Dichte nach Zeichenbreite
// =============================================================================

/** Unter dieser Zeichenbreite (px) trägt nur jede dritte Dekade einen Tick. */
export const NARROW_AXIS_WIDTH_PX = 320;
/** Unter dieser Zeichenbreite (px) trägt nur jede zweite Dekade einen Tick. */
export const COMPACT_AXIS_WIDTH_PX = 480;
/** So viele Ticks muss eine ausgedünnte Achse mindestens behalten. */
export const MIN_AXIS_TICKS = 2;
/** Größter zulässiger Dekadenschritt (ein Tick je drei Dekaden). */
export const MAX_DECADE_STEP = 3;
/**
 * Platzbedarf einer Tick-Beschriftung samt Luft (px). Die längste Aufschrift
 * der schmalen Achse ist „100,0 THz" (9 Zeichen à 0,65 rem ≈ 6,2 px) ≈ 56 px.
 */
export const MIN_TICK_LABEL_SPACING_PX = 56;
/**
 * Mindestabstand in der vollen Darstellung: dort tragen die Ticks zusätzlich
 * die eingeklammerte Zweitangabe (z. B. „(3,0 m)") und brauchen mehr Platz.
 * Bei 1280 px Viewport bleiben es weiterhin alle Dekaden (≈ 76 px je Dekade).
 */
export const MIN_TICK_LABEL_SPACING_WIDE_PX = 64;
/** Zulässige Abweichung, damit `log10` eine Zehnerpotenz erkennt. */
const DECADE_EPSILON = 1e-9;

/**
 * Dekadenschritt der Achsenbeschriftung: 1 (jede Dekade), 2 oder 3.
 *
 * Zwei Größen entscheiden. Erstens die innere Zeichenbreite: unter 480 px
 * mindestens jede zweite, unter 320 px jede dritte Dekade. Zweitens der
 * tatsächliche Platz je Dekade — bei 3 Hz bis 1 PHz liegen 14,5 Dekaden auf
 * der Achse, auf einem Telefon also rund 22 px je Dekade, während eine
 * Aufschrift wie „100,0 MHz" gut 50 px braucht. Ohne `decadeCount` gilt nur
 * die Breitenregel.
 */
export function tickDecadeStep(
  innerWidth: number,
  decadeCount = 1,
  minLabelSpacingPx = MIN_TICK_LABEL_SPACING_PX
): number {
  const widthStep =
    innerWidth < NARROW_AXIS_WIDTH_PX ? 3 : innerWidth < COMPACT_AXIS_WIDTH_PX ? 2 : 1;
  const pxPerDecade = decadeCount > 0 ? innerWidth / decadeCount : innerWidth;
  const spacingStep = Math.ceil(minLabelSpacingPx / Math.max(pxPerDecade, 1));
  return Math.min(MAX_DECADE_STEP, Math.max(widthStep, spacingStep));
}

/** Exponent einer Zehnerpotenz, sonst `null` (z. B. für Zwischenticks 3·10ⁿ). */
export function decadeExponent(value: number): number | null {
  if (!(value > 0)) return null;
  const log = Math.log10(value);
  const rounded = Math.round(log);
  return Math.abs(log - rounded) < DECADE_EPSILON ? rounded : null;
}

/**
 * Dünnt Ticks auf jeden `step`-ten Dekadenwert aus; Zwischenticks (keine
 * Zehnerpotenz) entfallen dabei.
 *
 * Bleiben weniger als `MIN_AXIS_TICKS` übrig, wird der Schritt stufenweise
 * gelockert (…, 2, 1 = alle Dekaden). Erst wenn selbst jede Dekade zu wenige
 * Marken ergibt — stark gezoomt liegt manchmal nur eine im Bild —, gilt die
 * ursprüngliche Liste samt Zwischenticks.
 */
export function thinDecadeTicks<T>(
  ticks: readonly T[],
  step: number,
  exponentOf: (tick: T) => number | null
): T[] {
  if (step <= 1) return [...ticks];
  for (let current = step; current >= 1; current--) {
    const kept = ticks.filter((tick) => {
      const exponent = exponentOf(tick);
      return exponent !== null && ((exponent % current) + current) % current === 0;
    });
    if (kept.length >= MIN_AXIS_TICKS) return kept;
  }
  return [...ticks];
}
