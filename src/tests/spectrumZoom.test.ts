/**
 * Tests für die reine Zoom-/Skalenmathematik des Spektrums
 * (`components/spectrumZoom.ts`), herausgelöst aus `spectrumState.svelte.ts`.
 */
import { describe, it, expect } from 'vitest';
import {
  MIN_ZOOM,
  MAX_ZOOM,
  ZOOM_STEP_FACTOR,
  PAN_STEP_FRACTION,
  logRange,
  zoomedDomain,
  panOffsetKeepingCenter,
  panOffsetStepped,
  panOffsetCenteredOn,
  frequencyTicks,
  wavelengthTicks,
  WAVELENGTH_TICK_DEFS
} from '$lib/components/spectrumZoom';
import { SPECTRUM_MIN_HZ, SPECTRUM_MAX_VISIBLE_HZ } from '$lib/data/spectrum';
import { SPEED_OF_LIGHT } from '$lib/data/constants';

const MIN = SPECTRUM_MIN_HZ;
const MAX = SPECTRUM_MAX_VISIBLE_HZ;

describe('logRange', () => {
  it('zählt Dekaden zwischen Unter- und Obergrenze', () => {
    const r = logRange(10, 1e6);
    expect(r.logMin).toBeCloseTo(1, 12);
    expect(r.logRange).toBeCloseTo(5, 12);
  });
});

describe('zoomedDomain', () => {
  it('liefert bei Zoom 1 den Gesamtbereich', () => {
    const [lo, hi] = zoomedDomain(MIN, MAX, MIN_ZOOM, 0);
    expect(lo).toBeCloseTo(MIN, 9);
    expect(hi / MAX).toBeCloseTo(1, 9);
  });

  it('halbiert bei Zoom 2 die sichtbaren Dekaden', () => {
    const [lo, hi] = zoomedDomain(MIN, MAX, 2, 0);
    expect(Math.log10(hi) - Math.log10(lo)).toBeCloseTo(logRange(MIN, MAX).logRange / 2, 9);
  });

  it('begrenzt die Verschiebung auf den zulässigen Bereich', () => {
    const [, hi] = zoomedDomain(MIN, MAX, 2, 1e9);
    expect(hi / MAX).toBeCloseTo(1, 9);
    const [lo] = zoomedDomain(MIN, MAX, 2, -5);
    expect(lo).toBeCloseTo(MIN, 9);
  });
});

describe('panOffsetKeepingCenter', () => {
  it('hält die Bildmitte beim Hineinzoomen fest', () => {
    const zoom = 2;
    const pan = 1;
    const before = zoomedDomain(MIN, MAX, zoom, pan);
    const centerBefore = Math.sqrt(before[0] * before[1]);
    const newZoom = zoom * ZOOM_STEP_FACTOR;
    const newPan = panOffsetKeepingCenter(MIN, MAX, zoom, pan, newZoom);
    const after = zoomedDomain(MIN, MAX, newZoom, newPan);
    expect(Math.sqrt(after[0] * after[1]) / centerBefore).toBeCloseTo(1, 6);
  });

  it('geht beim Herauszoomen am linken Rand nicht unter 0', () => {
    expect(panOffsetKeepingCenter(MIN, MAX, 3, 0, 2)).toBe(0);
  });
});

describe('panOffsetStepped', () => {
  it('verschiebt um ein Viertel des sichtbaren Bereichs', () => {
    const zoom = 4;
    const visible = logRange(MIN, MAX).logRange / zoom;
    expect(panOffsetStepped(MIN, MAX, zoom, 1, 1)).toBeCloseTo(1 + visible * PAN_STEP_FRACTION, 12);
    expect(panOffsetStepped(MIN, MAX, zoom, 1, -1)).toBeCloseTo(
      1 - visible * PAN_STEP_FRACTION,
      12
    );
  });

  it('bleibt an beiden Rändern stehen', () => {
    expect(panOffsetStepped(MIN, MAX, 4, 0.01, -1)).toBe(0);
    const { logRange: range } = logRange(MIN, MAX);
    const maxPan = range - range / 4;
    expect(panOffsetStepped(MIN, MAX, 4, maxPan, 1)).toBeCloseTo(maxPan, 12);
  });

  it('bewegt sich bei Zoom 1 nicht', () => {
    expect(panOffsetStepped(MIN, MAX, MIN_ZOOM, 0, 1)).toBeCloseTo(0, 12);
  });
});

describe('panOffsetCenteredOn', () => {
  it('legt die Frequenz in die Bildmitte', () => {
    const zoom = 5;
    const f = 2.4e9;
    const pan = panOffsetCenteredOn(MIN, MAX, zoom, f);
    const [lo, hi] = zoomedDomain(MIN, MAX, zoom, pan);
    expect(Math.sqrt(lo * hi) / f).toBeCloseTo(1, 6);
  });

  it('klemmt am Rand fest', () => {
    expect(panOffsetCenteredOn(MIN, MAX, 5, MIN)).toBe(0);
    const { logRange: range } = logRange(MIN, MAX);
    expect(panOffsetCenteredOn(MIN, MAX, 5, MAX)).toBeCloseTo(range - range / 5, 9);
  });
});

describe('frequencyTicks', () => {
  it('liefert bei Zoom 1 nur Zehnerpotenzen, aufsteigend', () => {
    const ticks = frequencyTicks([3, 1e15], MIN_ZOOM);
    expect(ticks[0]).toBe(10);
    expect(ticks.at(-1)).toBe(1e15);
    for (const t of ticks) expect(Math.log10(t) % 1).toBeCloseTo(0, 9);
    expect([...ticks].sort((a, b) => a - b)).toEqual(ticks);
  });

  it('ergänzt ab Zoom > 3 Zwischenticks bei 3·10ⁿ', () => {
    const ticks = frequencyTicks([1e6, 1e9], 4);
    expect(ticks).toEqual([1e6, 3e6, 1e7, 3e7, 1e8, 3e8, 1e9]);
    expect(frequencyTicks([1e6, 1e9], 3)).toEqual([1e6, 1e7, 1e8, 1e9]);
  });

  it('hält sich an die Domänengrenzen', () => {
    for (const t of frequencyTicks([2e6, 5e8], MAX_ZOOM)) {
      expect(t).toBeGreaterThanOrEqual(2e6);
      expect(t).toBeLessThanOrEqual(5e8);
    }
  });
});

describe('wavelengthTicks', () => {
  it('rechnet λ über c in Frequenz um und filtert auf die Domäne', () => {
    const ticks = wavelengthTicks([1e6, 1e9], SPEED_OF_LIGHT);
    expect(ticks.map((t) => t.label)).toEqual(['100 m', '10 m', '1 m']);
    expect(ticks[0].freq).toBeCloseTo(SPEED_OF_LIGHT / 100, 6);
  });

  it('hat eindeutige Beschriftungen (Schlüssel im Markup)', () => {
    const labels = WAVELENGTH_TICK_DEFS.map((t) => t.label);
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels).toContain('100 μm');
  });
});

describe('Ansicht „IEEE" (IEEE Std 521)', () => {
  it('umfasst genau den Bereich der IEEE-Bänder von HF bis W', async () => {
    const { SPECTRUM_MIN_HZ, SPECTRUM_MAX_RF_HZ } = await import('$lib/data/spectrum');
    const { IEEE_BANDS, IEEE_VIEW_MIN_HZ, IEEE_VIEW_MAX_HZ } = await import('$lib/data/bands');
    expect(IEEE_VIEW_MIN_HZ).toBe(3e6); // HF-Band beginnt bei 3 MHz
    expect(IEEE_VIEW_MAX_HZ).toBe(110e9); // W-Band endet bei 110 GHz
    expect(IEEE_VIEW_MIN_HZ).toBeGreaterThan(SPECTRUM_MIN_HZ);
    expect(IEEE_VIEW_MAX_HZ).toBeLessThan(SPECTRUM_MAX_RF_HZ);
    for (const band of IEEE_BANDS) {
      expect(band.minHz).toBeGreaterThanOrEqual(IEEE_VIEW_MIN_HZ);
      expect(band.maxHz).toBeLessThanOrEqual(IEEE_VIEW_MAX_HZ);
    }
  });
});

describe('tickDecadeStep in voller Darstellung (Zweitangaben)', () => {
  it('lässt bei 1280 px Viewport alle Dekaden stehen, dünnt Tablets und Querformat aus', async () => {
    const { tickDecadeStep, MIN_TICK_LABEL_SPACING_WIDE_PX } =
      await import('$lib/components/spectrumZoom');
    const decades = 14.5; // Ansicht „RF + Licht": 3 Hz bis 1 PHz
    expect(tickDecadeStep(1100, decades, MIN_TICK_LABEL_SPACING_WIDE_PX)).toBe(1); // 1280 px Viewport
    expect(tickDecadeStep(830, decades, MIN_TICK_LABEL_SPACING_WIDE_PX)).toBe(2); // Handy quer 932 px
    expect(tickDecadeStep(560, decades, MIN_TICK_LABEL_SPACING_WIDE_PX)).toBe(2); // Tablet 700 px
  });
});
