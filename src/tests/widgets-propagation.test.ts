/**
 * Tests für die Widget-Logik Fresnel (W5), dB-Spielplatz (W10),
 * Dämpfungsfenster (W8) und Ausbreitungs-Sandkasten (W9)
 */
import { describe, it, expect } from 'vitest';
import { computeFresnelScene, FRESNEL_ELLIPSE_SAMPLES } from '$lib/components/widgets/FresnelModel';
import {
  dbToPowerRatio,
  dbToVoltageRatio,
  powerRatioToDb,
  voltageRatioToDb,
  buildDecibelTable,
  accumulateChain,
  chainTotalDbm,
  DEFAULT_CHAIN
} from '$lib/components/widgets/DecibelModel';
import {
  generateWindowCurve,
  windowCurveFrequencies,
  frequencyToFraction,
  fractionToFrequency,
  attenuationToFraction,
  findNearestPoint,
  WINDOW_MARKERS,
  WINDOW_CURVE_MIN_GHZ,
  WINDOW_CURVE_MAX_GHZ
} from '$lib/components/widgets/AttenuationWindowsModel';
import {
  classifyMode,
  estimateGroundWaveRangeKm,
  computePropagationScene,
  sketchGeometry,
  sketchPoint,
  sketchArcPath,
  SKETCH_WIDTH,
  SKETCH_GROUND_Y
} from '$lib/components/widgets/PropagationModel';
import { calculateRadioHorizon } from '$lib/data/propagation';

const C = 299792458;

describe('computeFresnelScene (W5)', () => {
  it('5,8 GHz, 10 km → r₁ in Streckenmitte ≈ 11,37 m', () => {
    const scene = computeFresnelScene(10_000, 5.8e9, 0.5, 0, 20, C);
    expect(scene.midRadiusM).toBeCloseTo(11.37, 2);
    expect(scene.clearance.radiusM).toBeCloseTo(11.37, 2);
  });

  it('Ellipse hat Stützstellen mit Radius 0 an beiden Antennen', () => {
    const scene = computeFresnelScene(10_000, 5.8e9, 0.5, 0, 20, C);
    expect(scene.ellipse).toHaveLength(FRESNEL_ELLIPSE_SAMPLES + 1);
    expect(scene.ellipse[0].rM).toBe(0);
    expect(scene.ellipse[FRESNEL_ELLIPSE_SAMPLES].rM).toBe(0);
  });

  it('Hindernis 10 m hoch bei 20 m Antennen → 10 m unter Sichtlinie, frei', () => {
    const scene = computeFresnelScene(10_000, 5.8e9, 0.5, 10, 20, C);
    expect(scene.obstacleAboveLosM).toBe(-10);
    expect(scene.clearance.status).toBe('frei');
  });

  it('Hindernis 25 m hoch bei 20 m Antennen → blockiert mit Dämpfung', () => {
    const scene = computeFresnelScene(10_000, 5.8e9, 0.5, 25, 20, C);
    expect(scene.clearance.status).toBe('blockiert');
    expect(scene.clearance.lossDb).toBeGreaterThan(6);
  });

  it('Hindernisposition teilt die Strecke in d₁ und d₂', () => {
    const scene = computeFresnelScene(10_000, 5.8e9, 0.25, 0, 20, C);
    expect(scene.d1M).toBe(2500);
    expect(scene.d2M).toBe(7500);
  });
});

describe('Dezibel (W10)', () => {
  it('3 dB → Leistungsfaktor 1,995', () => {
    expect(dbToPowerRatio(3)).toBeCloseTo(1.995, 3);
  });

  it('6 dB → Spannungsfaktor 1,995, 20 dB → Spannungsfaktor 10', () => {
    expect(dbToVoltageRatio(6)).toBeCloseTo(1.995, 3);
    expect(dbToVoltageRatio(20)).toBeCloseTo(10, 6);
  });

  it('Umkehrung: Faktor 2 → 3,01 dB Leistung / 6,02 dB Spannung', () => {
    expect(powerRatioToDb(2)).toBeCloseTo(3.0103, 3);
    expect(voltageRatioToDb(2)).toBeCloseTo(6.0206, 3);
    expect(powerRatioToDb(0)).toBe(-Infinity);
  });

  it('Tabelle enthält ±-Werte mit korrekten Faktoren', () => {
    const table = buildDecibelTable([10, -3]);
    expect(table[0].powerRatio).toBeCloseTo(10, 6);
    expect(table[1].powerRatio).toBeCloseTo(0.5012, 3);
    expect(table[1].voltageRatio).toBeCloseTo(0.7079, 3);
  });

  it('Kettenrechnung summiert laufend', () => {
    const points = accumulateChain(DEFAULT_CHAIN);
    expect(points[0].levelDbm).toBe(DEFAULT_CHAIN[0].db);
    expect(points[points.length - 1].levelDbm).toBeCloseTo(chainTotalDbm(DEFAULT_CHAIN), 9);
    expect(chainTotalDbm(DEFAULT_CHAIN)).toBe(20 - 3 + 12 - 100 + 12);
  });
});

describe('Dämpfungsfenster (W8)', () => {
  it('Frequenzstützstellen beginnen bei 1 GHz und enden bei 350 GHz', () => {
    const frequencies = windowCurveFrequencies();
    expect(frequencies[0]).toBeCloseTo(WINDOW_CURVE_MIN_GHZ, 6);
    expect(frequencies[frequencies.length - 1]).toBeCloseTo(WINDOW_CURVE_MAX_GHZ, 6);
  });

  it('Kurve: 60-GHz-Sauerstoffpeak liegt über dem Ka-Fenster (35 GHz)', () => {
    const curve = generateWindowCurve(7.5);
    const peak = findNearestPoint(curve, 60);
    const window = findNearestPoint(curve, 35);
    expect(peak).not.toBeNull();
    expect(window).not.toBeNull();
    expect(peak!.total).toBeGreaterThan(5);
    expect(window!.total).toBeLessThan(0.3);
    expect(peak!.total).toBeGreaterThan(window!.total * 20);
  });

  it('mehr Wasserdampf erhöht die Dämpfung bei 22 GHz, nicht bei 60 GHz (Sauerstoff)', () => {
    const dry = findNearestPoint(generateWindowCurve(0), 22.235)!;
    const wet = findNearestPoint(generateWindowCurve(20), 22.235)!;
    expect(wet.waterVapor).toBeGreaterThan(dry.waterVapor * 5);
    expect(wet.oxygen).toBeCloseTo(dry.oxygen, 1);
  });

  it('Skalenabbildungen sind invers zueinander', () => {
    expect(frequencyToFraction(1)).toBe(0);
    expect(frequencyToFraction(350)).toBe(1);
    expect(fractionToFrequency(frequencyToFraction(60))).toBeCloseTo(60, 6);
    expect(attenuationToFraction(1e-3)).toBe(0);
    expect(attenuationToFraction(1e2)).toBe(1);
    expect(attenuationToFraction(1e5)).toBe(1);
  });

  it('Marker enthalten die Peaks 22, 60, 118, 183 GHz und die Fenster 35/94 GHz', () => {
    const peakFrequencies = WINDOW_MARKERS.filter((m) => m.kind === 'peak').map((m) =>
      Math.round(m.frequencyGHz)
    );
    expect(peakFrequencies).toEqual(expect.arrayContaining([22, 60, 119, 183]));
    const windowFrequencies = WINDOW_MARKERS.filter((m) => m.kind === 'window').map(
      (m) => m.frequencyGHz
    );
    expect(windowFrequencies).toEqual(expect.arrayContaining([35, 94]));
    expect(WINDOW_MARKERS.every((m) => m.frequencyGHz <= WINDOW_CURVE_MAX_GHZ)).toBe(true);
  });
});

describe('Ausbreitungs-Sandkasten (W9)', () => {
  it('klassifiziert den Modus nach Frequenz', () => {
    expect(classifyMode(200e3)).toBe('bodenwelle');
    expect(classifyMode(7e6)).toBe('raumwelle');
    expect(classifyMode(145e6)).toBe('sichtlinie');
  });

  it('Bodenwellenreichweite fällt mit der Frequenz (300 km → 30 km)', () => {
    expect(estimateGroundWaveRangeKm(30e3)).toBeCloseTo(300, 6);
    expect(estimateGroundWaveRangeKm(3e6)).toBeCloseTo(30, 6);
    expect(estimateGroundWaveRangeKm(300e3)).toBeGreaterThan(30);
    expect(estimateGroundWaveRangeKm(300e3)).toBeLessThan(300);
  });

  it('Horizont: 30 m + 10 m → ≈ 22,6 km + 13,1 km', () => {
    const scene = computePropagationScene(30, 10, 145e6, true);
    expect(scene.horizonTxKm).toBeCloseTo(calculateRadioHorizon(30), 6);
    expect(scene.horizonTxKm).toBeCloseTo(22.6, 1);
    expect(scene.horizonRxKm).toBeCloseTo(13.0, 1);
    expect(scene.losMaxKm).toBeCloseTo(scene.horizonTxKm + scene.horizonRxKm, 6);
    expect(scene.mode).toBe('sichtlinie');
    expect(scene.skipDistanceKm).toBeNull();
  });

  it('Raumwelle bei 14 MHz tagsüber: Sprungdistanz > Bodenwelle → tote Zone', () => {
    const scene = computePropagationScene(30, 10, 14e6, true);
    expect(scene.mode).toBe('raumwelle');
    expect(scene.skipDistanceKm).not.toBeNull();
    expect(scene.skipZone).not.toBeNull();
    expect(scene.skipZone!.toKm).toBeGreaterThan(scene.skipZone!.fromKm);
  });

  it('nachts ist die MUF niedriger als tagsüber', () => {
    const day = computePropagationScene(30, 10, 7e6, true);
    const night = computePropagationScene(30, 10, 7e6, false);
    expect(night.mufKm3000MHz).toBeLessThan(day.mufKm3000MHz);
    expect(night.reflectionHeightKm).toBeGreaterThan(day.reflectionHeightKm);
  });

  it('Frequenz über der MUF → keine Reflexion', () => {
    const scene = computePropagationScene(30, 10, 29e6, false);
    expect(scene.skipDistanceKm).toBeNull();
  });

  it('Skizzengeometrie: Bildmitte liegt auf der Oberfläche, Höhe geht nach oben', () => {
    const geometry = sketchGeometry(3000, 300);
    const ground = sketchPoint(geometry, 0, 0);
    expect(ground.x).toBeCloseTo(SKETCH_WIDTH / 2, 6);
    expect(ground.y).toBeCloseTo(SKETCH_GROUND_Y, 6);
    const high = sketchPoint(geometry, 0, 300);
    expect(high.y).toBeLessThan(ground.y);
    const right = sketchPoint(geometry, 1500, 0);
    expect(right.x).toBeGreaterThan(ground.x);
    expect(right.y).toBeGreaterThan(ground.y);
  });

  it('Bogenpfad beginnt mit M und enthält alle Stützstellen', () => {
    const geometry = sketchGeometry(100, 1);
    const path = sketchArcPath(geometry, -50, 50, 0, 4);
    expect(path.startsWith('M')).toBe(true);
    expect(path.split(' ')).toHaveLength(5);
  });
});
