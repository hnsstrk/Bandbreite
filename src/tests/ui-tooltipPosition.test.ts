import { describe, expect, it } from 'vitest';
import {
  computeTooltipPlacement,
  TOOLTIP_GAP,
  TOOLTIP_VIEWPORT_MARGIN
} from '$lib/components/ui/tooltipPosition';

const viewport = { width: 1000, height: 800 };
const popup = { width: 300, height: 120 };

describe('computeTooltipPlacement', () => {
  it('zentriert das Popup unter dem Anker, wenn Platz ist', () => {
    const anchor = { top: 100, left: 490, width: 20, height: 20 };
    const p = computeTooltipPlacement(anchor, popup, viewport);
    expect(p.side).toBe('below');
    expect(p.top).toBe(100 + 20 + TOOLTIP_GAP);
    expect(p.left).toBe(500 - 150);
  });

  it('klemmt das Popup am linken Viewport-Rand fest', () => {
    const anchor = { top: 100, left: 10, width: 20, height: 20 };
    const p = computeTooltipPlacement(anchor, popup, viewport);
    expect(p.left).toBe(TOOLTIP_VIEWPORT_MARGIN);
  });

  it('klemmt das Popup am rechten Viewport-Rand fest', () => {
    const anchor = { top: 100, left: 980, width: 20, height: 20 };
    const p = computeTooltipPlacement(anchor, popup, viewport);
    expect(p.left).toBe(viewport.width - popup.width - TOOLTIP_VIEWPORT_MARGIN);
  });

  it('klappt nach oben, wenn unten kein Platz ist', () => {
    const anchor = { top: 750, left: 490, width: 20, height: 20 };
    const p = computeTooltipPlacement(anchor, popup, viewport);
    expect(p.side).toBe('above');
    expect(p.top).toBe(750 - TOOLTIP_GAP - popup.height);
  });

  it('bleibt unten und klemmt, wenn weder unten noch oben Platz ist', () => {
    const small = { width: 400, height: 200 };
    const anchor = { top: 90, left: 190, width: 20, height: 20 };
    const p = computeTooltipPlacement(anchor, popup, small);
    expect(p.side).toBe('below');
    expect(p.top).toBe(small.height - popup.height - TOOLTIP_VIEWPORT_MARGIN);
  });

  it('gibt bei zu schmalem Viewport den Randabstand zurück statt negativer Werte', () => {
    const narrow = { width: 200, height: 800 };
    const anchor = { top: 100, left: 90, width: 20, height: 20 };
    const p = computeTooltipPlacement(anchor, popup, narrow);
    expect(p.left).toBe(TOOLTIP_VIEWPORT_MARGIN);
  });
});
