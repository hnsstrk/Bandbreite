/**
 * Tests für das breitenabhängige Layout des Spektrums
 * (`components/spectrumLayout.ts`, `spectrumScroll.ts`) und für die
 * Tick-Ausdünnung in `components/spectrumZoom.ts`.
 */
import { describe, it, expect } from 'vitest';
import {
  COMPACT_MAX_WIDTH_PX,
  COMPACT_METRICS,
  DESKTOP_METRICS,
  LEGACY_LABEL_MIN_WIDTH,
  estimateTextWidth,
  fitsBandLabel,
  showBandLabel,
  spectrumMetrics,
  tickTextAnchor
} from '$lib/components/spectrumLayout';
import {
  COMPACT_AXIS_WIDTH_PX,
  MAX_DECADE_STEP,
  MIN_AXIS_TICKS,
  MIN_TICK_LABEL_SPACING_PX,
  NARROW_AXIS_WIDTH_PX,
  decadeExponent,
  frequencyTicks,
  thinDecadeTicks,
  tickDecadeStep,
  wavelengthTicks
} from '$lib/components/spectrumZoom';
import { rowY, rowsHeight, type VisibleRows } from '$lib/components/spectrumBands';
import {
  SIDEBAR_SIDE_BY_SIDE_WIDTH_PX,
  scrollBehaviorFor,
  shouldScrollToBandDetail
} from '$lib/components/spectrumScroll';
import { SPEED_OF_LIGHT } from '$lib/data/constants';

describe('spectrumMetrics', () => {
  it('liefert unter der Schwelle den schmalen Maßsatz', () => {
    expect(spectrumMetrics(COMPACT_MAX_WIDTH_PX - 1)).toBe(COMPACT_METRICS);
    expect(spectrumMetrics(360).compact).toBe(true);
  });

  it('liefert ab der Schwelle den vollen Maßsatz', () => {
    expect(spectrumMetrics(COMPACT_MAX_WIDTH_PX)).toBe(DESKTOP_METRICS);
    expect(spectrumMetrics(1200).compact).toBe(false);
  });

  it('hält die Maße der vollen Darstellung unverändert', () => {
    expect(DESKTOP_METRICS.margin).toEqual({ top: 60, right: 20, bottom: 60, left: 80 });
    expect(DESKTOP_METRICS.rowHeight).toBe(48);
    expect(DESKTOP_METRICS.gap).toBe(8);
    expect(DESKTOP_METRICS.dualTickLabels).toBe(true);
  });

  it('spart schmal Platz: Beschriftungsspalte unter 2,25 rem, engere Reihen', () => {
    expect(COMPACT_METRICS.margin.left).toBeLessThanOrEqual(36);
    expect(COMPACT_METRICS.rowHeight).toBe(36);
    expect(COMPACT_METRICS.gap).toBe(4);
    expect(COMPACT_METRICS.dualTickLabels).toBe(false);
  });

  it('lässt schmal mindestens 85 % der Containerbreite fürs Diagramm', () => {
    for (const containerWidth of [320, 360, 390, 412, 480]) {
      const m = spectrumMetrics(containerWidth);
      const innerWidth = containerWidth - m.margin.left - m.margin.right;
      expect(innerWidth / containerWidth).toBeGreaterThanOrEqual(0.85);
    }
  });
});

describe('Reihengeometrie mit Maßsatz', () => {
  const visible: VisibleRows = { em: true, itu: true, ieee: true, nato: true, civilian: false };

  it('bleibt ohne Maßsatz bei den bisherigen Werten', () => {
    expect(rowY(0, visible)).toBe(60);
    expect(rowY(2, visible)).toBe(60 + 2 * 56);
    expect(rowsHeight(4)).toBe(4 * 48 + 3 * 8);
  });

  it('rechnet schmal mit 36 px Reihen und 4 px Abstand', () => {
    expect(rowY(0, visible, COMPACT_METRICS)).toBe(30);
    expect(rowY(2, visible, COMPACT_METRICS)).toBe(30 + 2 * 40);
    expect(rowsHeight(4, COMPACT_METRICS)).toBe(4 * 36 + 3 * 4);
  });
});

describe('Bandbeschriftung', () => {
  it('schätzt die Textbreite aus Zeichenzahl und Schriftgröße', () => {
    expect(estimateTextWidth('Radio', 11)).toBeCloseTo(5 * 11 * 0.6, 6);
  });

  it('lässt den Namen nur zu, wenn er samt Polster ins Band passt', () => {
    expect(fitsBandLabel(40, 'Radio', 9)).toBe(true);
    expect(fitsBandLabel(20, 'Radio', 9)).toBe(false);
  });

  it('behält in voller Breite die feste Schwelle', () => {
    expect(showBandLabel(LEGACY_LABEL_MIN_WIDTH + 1, 'Microwave', DESKTOP_METRICS)).toBe(true);
    expect(showBandLabel(LEGACY_LABEL_MIN_WIDTH, 'HF', DESKTOP_METRICS)).toBe(false);
  });

  it('misst schmal nach der Textbreite', () => {
    // „SHF" bei 9 px: 3 · 9 · 0,6 + 4 = 20,2 px
    expect(showBandLabel(21, 'SHF', COMPACT_METRICS)).toBe(true);
    expect(showBandLabel(19, 'SHF', COMPACT_METRICS)).toBe(false);
    expect(showBandLabel(30, 'Microwave', COMPACT_METRICS)).toBe(false);
  });
});

describe('tickTextAnchor', () => {
  const innerWidth = 320;

  it('lässt die volle Darstellung mittig', () => {
    expect(tickTextAnchor(innerWidth, '1,0 PHz', innerWidth, DESKTOP_METRICS)).toBe('middle');
  });

  it('zieht schmal die Randbeschriftung nach innen', () => {
    expect(tickTextAnchor(innerWidth, '1,0 PHz', innerWidth, COMPACT_METRICS)).toBe('end');
    expect(tickTextAnchor(0, '100,0 THz', innerWidth, COMPACT_METRICS)).toBe('start');
  });

  it('lässt Ticks in der Mitte mittig', () => {
    expect(tickTextAnchor(160, '1,0 GHz', innerWidth, COMPACT_METRICS)).toBe('middle');
  });
});

describe('tickDecadeStep', () => {
  /** Gesamtansicht 3 Hz … 1 PHz. */
  const VOLLE_DEKADEN = Math.log10(1e15 / 3);

  it('nimmt jede Dekade in voller Breite', () => {
    expect(tickDecadeStep(COMPACT_AXIS_WIDTH_PX)).toBe(1);
    expect(tickDecadeStep(1100)).toBe(1);
    expect(tickDecadeStep(1100, VOLLE_DEKADEN)).toBe(1);
  });

  it('nimmt jede zweite Dekade unter 480 px', () => {
    expect(tickDecadeStep(COMPACT_AXIS_WIDTH_PX - 1)).toBe(2);
    expect(tickDecadeStep(NARROW_AXIS_WIDTH_PX)).toBe(2);
  });

  it('nimmt jede dritte Dekade unter 320 px', () => {
    expect(tickDecadeStep(NARROW_AXIS_WIDTH_PX - 1)).toBe(3);
    expect(tickDecadeStep(200)).toBe(3);
  });

  it('verdichtet nicht über den Platz je Dekade hinaus', () => {
    // 412-px-Telefon: 320 px Zeichenfläche, 14,5 Dekaden — 22 px je Dekade,
    // also jede dritte Dekade statt der Breitenregel (jede zweite)
    expect(tickDecadeStep(320, VOLLE_DEKADEN)).toBe(3);
    // Stark gezoomt bleibt es bei der Breitenregel, mehr wird nicht verlangt
    expect(tickDecadeStep(320, 1.5)).toBe(2);
    expect(tickDecadeStep(600, 1.5)).toBe(1);
  });

  it('bleibt bei höchstens jeder dritten Dekade', () => {
    expect(tickDecadeStep(120, VOLLE_DEKADEN)).toBe(MAX_DECADE_STEP);
  });

  it('sorgt bei der Gesamtansicht für genug Platz je Beschriftung', () => {
    for (const innerWidth of [298, 320, 344]) {
      const step = tickDecadeStep(innerWidth, VOLLE_DEKADEN);
      expect((innerWidth / VOLLE_DEKADEN) * step).toBeGreaterThanOrEqual(MIN_TICK_LABEL_SPACING_PX);
    }
  });
});

describe('decadeExponent', () => {
  it('erkennt Zehnerpotenzen', () => {
    expect(decadeExponent(1e6)).toBe(6);
    expect(decadeExponent(0.001)).toBe(-3);
  });

  it('weist Zwischenwerte und Unsinn ab', () => {
    expect(decadeExponent(3e6)).toBeNull();
    expect(decadeExponent(0)).toBeNull();
    expect(decadeExponent(-10)).toBeNull();
  });
});

describe('thinDecadeTicks', () => {
  const domain: [number, number] = [3, 1e15];

  it('lässt Schritt 1 unverändert', () => {
    const ticks = frequencyTicks(domain, 1);
    expect(thinDecadeTicks(ticks, 1, decadeExponent)).toEqual(ticks);
  });

  it('halbiert bzw. drittelt die Frequenzticks', () => {
    const ticks = frequencyTicks(domain, 1);
    const zwei = thinDecadeTicks(ticks, 2, decadeExponent);
    const drei = thinDecadeTicks(ticks, 3, decadeExponent);
    expect(zwei.length).toBeLessThan(ticks.length);
    expect(drei.length).toBeLessThan(zwei.length);
    expect(zwei.every((hz) => (decadeExponent(hz) as number) % 2 === 0)).toBe(true);
    expect(drei.every((hz) => (decadeExponent(hz) as number) % 3 === 0)).toBe(true);
  });

  it('verwirft Zwischenticks bei 3·10ⁿ', () => {
    const ticks = frequencyTicks([1e6, 1e9], 10);
    expect(ticks).toContain(3e6);
    expect(thinDecadeTicks(ticks, 2, decadeExponent)).not.toContain(3e6);
  });

  it('dünnt Wellenlängenticks über ihren eigenen Exponenten aus', () => {
    const ticks = wavelengthTicks(domain, SPEED_OF_LIGHT);
    const drei = thinDecadeTicks(ticks, 3, (t) => t.exponent);
    expect(drei.every((t) => ((t.exponent % 3) + 3) % 3 === 0)).toBe(true);
    expect(drei.length).toBeLessThan(ticks.length);
  });

  it('lockert den Schritt, bevor es Zwischenticks zulässt', () => {
    // Gezoomter Ausschnitt 3 MHz … 1 GHz: bei Schritt 2 bliebe nur 100 MHz übrig
    const ticks = frequencyTicks([3e6, 1e9], 5);
    const gedünnt = thinDecadeTicks(ticks, 2, decadeExponent);
    expect(gedünnt).toEqual([1e7, 1e8, 1e9]);
  });

  it('behält die volle Liste, wenn sonst zu wenige Ticks bleiben', () => {
    const eng = [1e6, 3e6];
    expect(thinDecadeTicks(eng, 3, decadeExponent)).toEqual(eng);
    expect(thinDecadeTicks(eng, 3, decadeExponent).length).toBeGreaterThanOrEqual(1);
  });

  it('behält mindestens MIN_AXIS_TICKS, wo die Achse ausgedünnt wird', () => {
    const ticks = frequencyTicks(domain, 1);
    expect(thinDecadeTicks(ticks, 3, decadeExponent).length).toBeGreaterThanOrEqual(MIN_AXIS_TICKS);
  });
});

describe('Sprung zur Banddetail-Spalte', () => {
  it('scrollt nur, solange die Spalte unter dem Diagramm liegt', () => {
    expect(shouldScrollToBandDetail(412)).toBe(true);
    expect(shouldScrollToBandDetail(SIDEBAR_SIDE_BY_SIDE_WIDTH_PX - 1)).toBe(true);
    expect(shouldScrollToBandDetail(SIDEBAR_SIDE_BY_SIDE_WIDTH_PX)).toBe(false);
  });

  it('verzichtet bei prefers-reduced-motion auf die Animation', () => {
    expect(scrollBehaviorFor(true)).toBe('auto');
    expect(scrollBehaviorFor(false)).toBe('smooth');
  });
});
