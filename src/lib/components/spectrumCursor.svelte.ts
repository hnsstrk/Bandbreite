/**
 * Fadenkreuz-Zustand des Spektrums: Mausposition → Frequenz → Beschriftungen.
 *
 * Die Skala kommt per Getter aus dem Hauptzustand, damit der Cursor jeder
 * Zoom- oder Breitenänderung folgt, ohne den Zustand zu duplizieren.
 */

import { formatFrequencyLocal, formatWavelengthLocal } from './spectrumFormat';

export const ROUNDED_SPEED_OF_LIGHT = 3e8; // 3 × 10⁸ m/s

export interface CursorScale {
  xScale: () => { (hz: number): number; invert(px: number): number };
  innerWidth: () => number;
}

export function createSpectrumCursor(scale: CursorScale) {
  let cursorFrequencyHz = $state<number | null>(null);

  let cursorX = $derived(cursorFrequencyHz !== null ? scale.xScale()(cursorFrequencyHz) : null);

  let cursorWavelengthLabel = $derived(
    cursorFrequencyHz !== null && cursorFrequencyHz > 0
      ? formatWavelengthLocal(ROUNDED_SPEED_OF_LIGHT / cursorFrequencyHz)
      : ''
  );

  let cursorFrequencyLabel = $derived(
    cursorFrequencyHz !== null && cursorFrequencyHz > 0
      ? formatFrequencyLocal(cursorFrequencyHz)
      : ''
  );

  /** Mausposition relativ zum linken Rand der Zeichenfläche (ohne MARGIN.left). */
  function handleCursorMove(svgLocalX: number) {
    if (svgLocalX < 0 || svgLocalX > scale.innerWidth()) {
      cursorFrequencyHz = null;
      return;
    }
    try {
      cursorFrequencyHz = scale.xScale().invert(svgLocalX);
    } catch {
      cursorFrequencyHz = null;
    }
  }

  function handleCursorLeave() {
    cursorFrequencyHz = null;
  }

  return {
    get cursorFrequencyHz() {
      return cursorFrequencyHz;
    },
    get cursorX() {
      return cursorX;
    },
    get cursorWavelengthLabel() {
      return cursorWavelengthLabel;
    },
    get cursorFrequencyLabel() {
      return cursorFrequencyLabel;
    },
    handleCursorMove,
    handleCursorLeave
  };
}
