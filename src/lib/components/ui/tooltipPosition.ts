/**
 * Positionsrechnung für schwebende Tooltips (`InfoTooltip`).
 *
 * Das Popup liegt `position: fixed` im Viewport, damit es nicht von
 * scrollenden oder überlaufbegrenzten Vorfahren (z. B. der Band-Sidebar mit
 * `overflow-y: auto`) abgeschnitten wird. Die Funktion ist DOM-frei und
 * zentriert das Popup unter dem Anker, klemmt es in den Viewport und klappt
 * nach oben, wenn unten kein Platz ist.
 */

import { clamp } from '$lib/utils/handlers';

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface TooltipPlacement {
  /** Abstand vom oberen Viewport-Rand in px */
  top: number;
  /** Abstand vom linken Viewport-Rand in px */
  left: number;
  /** Ob das Popup unter oder über dem Anker sitzt */
  side: 'below' | 'above';
}

/** Abstand zwischen Anker und Popup in px */
export const TOOLTIP_GAP = 8;
/** Mindestabstand des Popups zum Viewport-Rand in px */
export const TOOLTIP_VIEWPORT_MARGIN = 8;

/** Wie `clamp`, gibt aber bei einem leeren Bereich (max < min) den Randabstand zurück. */
function clampToRange(value: number, min: number, max: number): number {
  if (max < min) return min;
  return clamp(value, min, max);
}

export function computeTooltipPlacement(
  anchor: Rect,
  popup: Size,
  viewport: Size,
  gap: number = TOOLTIP_GAP,
  margin: number = TOOLTIP_VIEWPORT_MARGIN
): TooltipPlacement {
  const centeredLeft = anchor.left + anchor.width / 2 - popup.width / 2;
  const left = clampToRange(centeredLeft, margin, viewport.width - popup.width - margin);

  const belowTop = anchor.top + anchor.height + gap;
  const fitsBelow = belowTop + popup.height + margin <= viewport.height;
  const aboveTop = anchor.top - gap - popup.height;
  const fitsAbove = aboveTop >= margin;

  if (fitsBelow || !fitsAbove) {
    return {
      top: clampToRange(belowTop, margin, viewport.height - popup.height - margin),
      left,
      side: 'below'
    };
  }
  return { top: aboveTop, left, side: 'above' };
}
