/**
 * Rechenmodelle der beiden neuen Widgets im Kapitel „HF-Mathematik":
 * Zeigerdiagramm (PhasorModel) und Fourier-Synthese (FourierSynthesisModel).
 *
 * Referenzwerte: Zeigeraddition (1 ∠ 0°) + (1 ∠ 90°) = √2 ∠ 45°;
 * Fourierkoeffizienten nach Bronstein/Semendjajew (Rechteck 4/(n·π),
 * Dreieck 8/(n²·π²), Sägezahn 2/(n·π)).
 */
import { describe, it, expect } from 'vitest';
import {
  PHASOR_LIMITS,
  degToRad,
  instantaneousValue,
  phasorPoint,
  phasorSum,
  radToDeg,
  waveSamples
} from '$lib/components/widgets/PhasorModel';
import {
  SHAPE_LABELS,
  SYNTHESIS_LIMITS,
  activeHarmonics,
  harmonicAmplitude,
  harmonics,
  GIBBS_CONSTANT,
  idealValue,
  jumpHeight,
  overshootFraction,
  peakValue,
  synthesisCurve,
  synthesizedValue
} from '$lib/components/widgets/FourierSynthesisModel';

describe('PhasorModel: Zeiger und Sinus', () => {
  it('projiziert den Zeiger auf den Momentanwert', () => {
    expect(phasorPoint(1, 0, 0)).toEqual({ x: 1, y: 0 });
    expect(phasorPoint(2, 0, Math.PI / 2).y).toBeCloseTo(2, 9);
    expect(instantaneousValue(2, Math.PI / 2, 0)).toBeCloseTo(2, 9);
    expect(instantaneousValue(1, 0, Math.PI)).toBeCloseTo(0, 9);
  });

  it('addiert zwei gleich große Zeiger je nach Phase zu 2, √2 oder 0', () => {
    expect(phasorSum(1, 0, 1, 0).amplitude).toBeCloseTo(2, 9);
    const quadrature = phasorSum(1, 0, 1, Math.PI / 2);
    expect(quadrature.amplitude).toBeCloseTo(Math.SQRT2, 9);
    expect(quadrature.phaseDeg).toBeCloseTo(45, 9);
    expect(phasorSum(1, 0, 1, Math.PI).amplitude).toBeCloseTo(0, 9);
  });

  it('folgt dem Kosinussatz für beliebige Amplituden', () => {
    const a = 0.8;
    const b = 0.35;
    const phi = degToRad(70);
    const expected = Math.sqrt(a * a + b * b + 2 * a * b * Math.cos(phi));
    expect(phasorSum(a, 0, b, phi).amplitude).toBeCloseTo(expected, 12);
  });

  it('normiert Winkel auf −180° … +180°', () => {
    expect(radToDeg(0)).toBeCloseTo(0, 9);
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90, 9);
    expect(radToDeg(degToRad(270))).toBeCloseTo(-90, 9);
    expect(PHASOR_LIMITS.phaseDeg.min).toBe(-180);
    expect(PHASOR_LIMITS.phaseDeg.max).toBe(180);
  });

  it('schließt die Kurve nahtlos an die Zeigerspitze an', () => {
    const omegaT = 1.1;
    const samples = waveSamples(1, 0.4, omegaT, 2, 51);
    expect(samples).toHaveLength(51);
    expect(samples[0].value).toBeCloseTo(instantaneousValue(1, 0.4, omegaT), 12);
    // Nach zwei vollen Perioden ist der Wert wieder derselbe.
    expect(samples[samples.length - 1].value).toBeCloseTo(samples[0].value, 9);
  });
});

describe('FourierSynthesisModel: Signal aus Harmonischen', () => {
  it('liefert die Reihenkoeffizienten der drei Signalformen', () => {
    expect(harmonicAmplitude('rechteck', 1)).toBeCloseTo(4 / Math.PI, 12);
    expect(harmonicAmplitude('rechteck', 1)).toBeCloseTo(1.2732, 4);
    expect(harmonicAmplitude('rechteck', 2)).toBe(0);
    expect(harmonicAmplitude('rechteck', 3)).toBeCloseTo(4 / (3 * Math.PI), 12);
    expect(harmonicAmplitude('rechteck', 3)).toBeCloseTo(0.4244, 4);

    expect(harmonicAmplitude('dreieck', 1)).toBeCloseTo(8 / Math.PI ** 2, 12);
    expect(harmonicAmplitude('dreieck', 1)).toBeCloseTo(0.8106, 4);
    expect(harmonicAmplitude('dreieck', 3)).toBeCloseTo(-8 / (9 * Math.PI ** 2), 12);
    expect(harmonicAmplitude('dreieck', 2)).toBe(0);

    expect(harmonicAmplitude('saegezahn', 1)).toBeCloseTo(2 / Math.PI, 12);
    expect(harmonicAmplitude('saegezahn', 2)).toBeCloseTo(-1 / Math.PI, 12);
    expect(harmonicAmplitude('rechteck', 0)).toBe(0);
  });

  it('zählt nur die tatsächlich vorhandenen Harmonischen', () => {
    expect(harmonics('rechteck', 5)).toHaveLength(5);
    expect(activeHarmonics('rechteck', 5).map((h) => h.order)).toEqual([1, 3, 5]);
    expect(activeHarmonics('saegezahn', 5).map((h) => h.order)).toEqual([1, 2, 3, 4, 5]);
  });

  it('nähert sich mit wachsender Ordnung dem Idealverlauf', () => {
    expect(idealValue('rechteck', 0.25)).toBe(1);
    expect(idealValue('rechteck', 0.75)).toBe(-1);
    expect(idealValue('dreieck', 0.25)).toBeCloseTo(1, 9);
    expect(idealValue('saegezahn', 0.25)).toBeCloseTo(0.5, 9);

    const grob = Math.abs(synthesizedValue('rechteck', 1, 0.25) - 1);
    const fein = Math.abs(synthesizedValue('rechteck', 25, 0.25) - 1);
    expect(fein).toBeLessThan(grob);
    expect(synthesizedValue('rechteck', 9, 0.5)).toBeCloseTo(0, 9);
  });

  it('zeigt das Gibbssche Überschwingen von rund 9 % der Sprunghöhe', () => {
    // Wilbraham-Gibbs-Konstante (2/π)·Si(π) = 1,1790 — der Spitzenwert der
    // Teilsumme strebt dagegen, das Überschwingen bleibt bei 8,95 % der
    // Sprunghöhe 2 stehen.
    const peak = peakValue('rechteck', SYNTHESIS_LIMITS.harmonics.max);
    expect(peak).toBeCloseTo(GIBBS_CONSTANT, 2);
    expect(overshootFraction('rechteck', SYNTHESIS_LIMITS.harmonics.max)).toBeCloseTo(0.0895, 3);
    expect(jumpHeight('rechteck')).toBe(2);
    // Das Dreieck ist stetig — dort gibt es kein Überschwingen.
    expect(jumpHeight('dreieck')).toBe(0);
    expect(overshootFraction('dreieck', 25)).toBe(0);
    expect(peakValue('dreieck', 25)).toBeLessThan(1.01);
  });

  it('liefert Kurvenpunkte für Teilsumme und Ideal', () => {
    const curve = synthesisCurve('rechteck', 5, 2, 61);
    expect(curve).toHaveLength(61);
    expect(curve[0].u).toBe(0);
    expect(curve[curve.length - 1].u).toBe(1);
    expect(Object.keys(SHAPE_LABELS)).toEqual(['rechteck', 'dreieck', 'saegezahn']);
  });
});
