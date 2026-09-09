/**
 * Breitenabhängiges Layout des Spektrums — reine Funktionen ohne Zustand.
 *
 * Auf dem Telefon im Hochformat blieben von der Containerbreite nur rund
 * zwei Drittel für die Zeichenfläche übrig: die linke Beschriftungsspalte war
 * 80 px breit, das Kartenpolster 1 rem je Seite, und beide Achsen trugen eine
 * eingeklammerte Zweitangabe. Diese Datei hält deshalb zwei Maßsätze bereit:
 * `DESKTOP_METRICS` (unverändert wie bisher) und `COMPACT_METRICS` für
 * Container unter `COMPACT_MAX_WIDTH_PX`. Entschieden wird allein über die
 * gemessene Containerbreite (ResizeObserver), damit SVG-Geometrie und CSS
 * dieselbe Quelle haben.
 */

/** Ab dieser Containerbreite (px) gilt die volle Darstellung. */
export const COMPACT_MAX_WIDTH_PX = 640;

/** Innenmaße der Zeichenfläche in der vollen Darstellung. */
const DESKTOP_ROW_HEIGHT = 48;
const DESKTOP_GAP = 8;

/** Schmale Darstellung: Reihenhöhe 2,25 rem, Abstand 0,25 rem (16 px Basis). */
const COMPACT_ROW_HEIGHT = 36;
const COMPACT_GAP = 4;

export interface SpectrumMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SpectrumMetrics {
  /** true, sobald der Container schmaler als `COMPACT_MAX_WIDTH_PX` ist. */
  compact: boolean;
  margin: SpectrumMargin;
  rowHeight: number;
  gap: number;
  /** Abstand der Reihenbeschriftung vom linken Rand der Zeichenfläche. */
  rowLabelOffset: number;
  /** Schriftgröße der Reihenbeschriftung (CSS-Länge). */
  rowLabelFontSize: string;
  /** Schriftgröße der Tick-Beschriftung (CSS-Länge). */
  tickFontSize: string;
  /** Dieselbe Schriftgröße in px, für Breitenschätzungen. */
  tickFontSizePx: number;
  /** Schriftgröße der Achsenbeschriftung links außen (CSS-Länge). */
  axisLabelFontSize: string;
  /** Grundlinie der Tick-Beschriftung über der oberen Achse (negativ). */
  tickLabelTop: number;
  /** Grundlinie der Tick-Beschriftung unter der unteren Achse. */
  tickLabelBottom: number;
  /** Zweitangabe in Klammern (Frequenz an der Wellenlängenachse und umgekehrt). */
  dualTickLabels: boolean;
  /** Schriftgröße der Bandnamen in den Reihen (px, für die Breitenschätzung). */
  bandLabelFontSize: number;
  /** Beschriftung der Wellenlängenachse links außen. */
  wavelengthAxisLabel: string;
}

export const DESKTOP_METRICS: SpectrumMetrics = {
  compact: false,
  margin: { top: 60, right: 20, bottom: 60, left: 80 },
  rowHeight: DESKTOP_ROW_HEIGHT,
  gap: DESKTOP_GAP,
  rowLabelOffset: 10,
  rowLabelFontSize: '0.875rem',
  tickFontSize: '10px',
  tickFontSizePx: 10,
  axisLabelFontSize: '0.75rem',
  tickLabelTop: -12,
  tickLabelBottom: 20,
  dualTickLabels: true,
  bandLabelFontSize: 11,
  wavelengthAxisLabel: 'wavelength'
};

export const COMPACT_METRICS: SpectrumMetrics = {
  compact: true,
  // links 28 px = schmale Spalte (< 2,25 rem) für „λ · EM · ITU · IEEE · NATO · f"
  margin: { top: 30, right: 8, bottom: 30, left: 28 },
  rowHeight: COMPACT_ROW_HEIGHT,
  gap: COMPACT_GAP,
  rowLabelOffset: 3,
  rowLabelFontSize: '0.5625rem',
  tickFontSize: '0.65rem',
  // 0,65 rem bei 16 px Grundschrift
  tickFontSizePx: 10.4,
  axisLabelFontSize: '0.5625rem',
  tickLabelTop: -10,
  tickLabelBottom: 14,
  dualTickLabels: false,
  bandLabelFontSize: 9,
  wavelengthAxisLabel: 'λ'
};

/** Maßsatz zur gemessenen Containerbreite. */
export function spectrumMetrics(containerWidth: number): SpectrumMetrics {
  return containerWidth < COMPACT_MAX_WIDTH_PX ? COMPACT_METRICS : DESKTOP_METRICS;
}

// =============================================================================
// Bandbeschriftungen
// =============================================================================

/** Mindestbreite eines Bands für seinen Namen in der vollen Darstellung. */
export const LEGACY_LABEL_MIN_WIDTH = 25;
/** Luft links und rechts neben dem Bandnamen (px). */
export const BAND_LABEL_PADDING_PX = 4;
/**
 * Mittlere Zeichenbreite als Anteil der Schriftgröße. Annahme: 0,6 für die
 * halbfette Grotesk der Bandnamen — gemessen an „Microwave" (9 Zeichen,
 * 11 px) mit rund 59 px Textbreite, also 0,596 je Zeichen.
 */
export const AVG_GLYPH_WIDTH_RATIO = 0.6;

/** Geschätzte Textbreite in px. */
export function estimateTextWidth(text: string, fontSizePx: number): number {
  return text.length * fontSizePx * AVG_GLYPH_WIDTH_RATIO;
}

/** Passt der Name samt Polster in ein Band dieser Pixelbreite? */
export function fitsBandLabel(bandWidth: number, text: string, fontSizePx: number): boolean {
  return bandWidth >= estimateTextWidth(text, fontSizePx) + BAND_LABEL_PADDING_PX;
}

/**
 * Ausrichtung einer Tick-Beschriftung. Mittig, solange sie beidseitig in den
 * Rand passt; an den Enden der schmalen Achse rückt sie nach innen, damit
 * „1,0 PHz" am rechten Rand nicht angeschnitten wird.
 */
export function tickTextAnchor(
  tickX: number,
  label: string,
  innerWidth: number,
  metrics: SpectrumMetrics
): 'middle' | 'start' | 'end' {
  // Volle Darstellung unverändert: dort bleibt jede Beschriftung mittig.
  if (!metrics.compact) return 'middle';
  const half = estimateTextWidth(label, metrics.tickFontSizePx) / 2;
  if (tickX + half > innerWidth + metrics.margin.right) return 'end';
  if (tickX - half < -metrics.margin.left) return 'start';
  return 'middle';
}

/**
 * Wird der Bandname gezeichnet? In der vollen Darstellung bleibt die bisherige
 * feste Schwelle erhalten (Erscheinungsbild unverändert), schmal entscheidet
 * die geschätzte Textbreite, damit kein Name über sein Band hinausragt.
 */
export function showBandLabel(bandWidth: number, text: string, metrics: SpectrumMetrics): boolean {
  if (!metrics.compact) return bandWidth > LEGACY_LABEL_MIN_WIDTH;
  return fitsBandLabel(bandWidth, text, metrics.bandLabelFontSize);
}
