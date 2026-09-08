/**
 * Rechenmodell des Radiohorizont-Rechners.
 *
 * Referenz: h = 10 m ergibt 13,0 km mit Refraktion (k = 4/3) und 11,3 km
 * geometrisch (k = 1) — die Faustformeln 4,12·√h und 3,57·√h.
 * Quelle: ITU-R P.834-9.
 */

import { describe, it, expect } from 'vitest';
import {
  EARTH_RADIUS_KM,
  REFRACTION_FACTOR_K,
  calculateMaxLOSDistance,
  calculateRadioHorizon,
  horizonDistanceKm,
  horizonFactor,
  losDistanceKm
} from '$lib/data/propagation';
import {
  HEIGHT_MAX_M,
  HEIGHT_MIN_M,
  HEIGHT_PRESETS,
  K_FACTOR_MAX,
  K_FACTOR_MIN,
  RADIO_HORIZON_PARAMS,
  refractionLabel,
  sketchAltitudeKm
} from '$lib/components/calculators/radioHorizon.svelte';

describe('Vorfaktor der Faustformel', () => {
  it('liefert 4,12 für k = 4/3 und 3,57 für k = 1', () => {
    expect(horizonFactor(REFRACTION_FACTOR_K)).toBeCloseTo(4.1216, 3);
    expect(horizonFactor(1)).toBeCloseTo(3.5697, 3);
  });

  it('folgt der Wurzel des k-Faktors', () => {
    expect(horizonFactor(1.5) / horizonFactor(1)).toBeCloseTo(Math.sqrt(1.5), 10);
    expect(horizonFactor(0)).toBe(0);
  });

  it('passt zum Erdradius', () => {
    expect(horizonFactor(1)).toBeCloseTo(Math.sqrt((2 * EARTH_RADIUS_KM) / 1000), 10);
  });
});

describe('Horizontdistanz', () => {
  it('liefert für h = 10 m 13,0 km bzw. 11,3 km', () => {
    expect(horizonDistanceKm(10, REFRACTION_FACTOR_K)).toBeCloseTo(13.03, 2);
    expect(horizonDistanceKm(10, 1)).toBeCloseTo(11.29, 2);
  });

  it('stimmt mit der bisherigen Funktion überein', () => {
    for (const h of [1.5, 10, 100, 10000]) {
      expect(horizonDistanceKm(h, REFRACTION_FACTOR_K)).toBeCloseTo(
        calculateRadioHorizon(h, true),
        9
      );
      expect(horizonDistanceKm(h, 1)).toBeCloseTo(calculateRadioHorizon(h, false), 9);
    }
  });

  it('rechnet die Presets nach', () => {
    expect(horizonDistanceKm(1.5, REFRACTION_FACTOR_K)).toBeCloseTo(5.05, 2);
    expect(horizonDistanceKm(100, REFRACTION_FACTOR_K)).toBeCloseTo(41.22, 2);
    expect(horizonDistanceKm(10000, REFRACTION_FACTOR_K)).toBeCloseTo(412.18, 2);
  });

  it('liefert 0 für unbrauchbare Eingaben', () => {
    expect(horizonDistanceKm(0)).toBe(0);
    expect(horizonDistanceKm(-5)).toBe(0);
    expect(horizonDistanceKm(10, 0)).toBe(0);
  });

  it('wächst mit der Wurzel der Höhe', () => {
    expect(horizonDistanceKm(40) / horizonDistanceKm(10)).toBeCloseTo(2, 10);
  });
});

describe('Gesamtsichtweite', () => {
  it('addiert beide Horizonte', () => {
    expect(losDistanceKm(10, 1.5, REFRACTION_FACTOR_K)).toBeCloseTo(13.03 + 5.05, 1);
    expect(losDistanceKm(100, 10, REFRACTION_FACTOR_K)).toBeCloseTo(54.25, 2);
  });

  it('deckt sich mit calculateMaxLOSDistance', () => {
    expect(losDistanceKm(30, 30, REFRACTION_FACTOR_K)).toBeCloseTo(
      calculateMaxLOSDistance(30, 30, true),
      9
    );
  });

  it('gewinnt mit k = 4/3 rund 15 Prozent gegenüber k = 1', () => {
    const refraktiv = losDistanceKm(100, 10, REFRACTION_FACTOR_K);
    const geometrisch = losDistanceKm(100, 10, 1);
    expect((refraktiv / geometrisch - 1) * 100).toBeCloseTo(15.47, 2);
  });
});

describe('Bereiche und Presets', () => {
  it('hält die Standardwerte in ihren Grenzen', () => {
    expect(RADIO_HORIZON_PARAMS.h1.default).toBeGreaterThanOrEqual(HEIGHT_MIN_M);
    expect(RADIO_HORIZON_PARAMS.h2.default).toBeLessThanOrEqual(HEIGHT_MAX_M);
    expect(RADIO_HORIZON_PARAMS.k.default).toBe(REFRACTION_FACTOR_K);
    expect(RADIO_HORIZON_PARAMS.k.min).toBe(K_FACTOR_MIN);
    expect(RADIO_HORIZON_PARAMS.k.max).toBe(K_FACTOR_MAX);
  });

  it('hält jedes Höhen-Preset in den Eingabegrenzen', () => {
    for (const preset of HEIGHT_PRESETS) {
      expect(preset.value).toBeGreaterThanOrEqual(HEIGHT_MIN_M);
      expect(preset.value).toBeLessThanOrEqual(HEIGHT_MAX_M);
    }
    const ids = HEIGHT_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('benennt die Refraktionslage', () => {
    expect(refractionLabel(1)).toContain('Subrefraktion');
    expect(refractionLabel(REFRACTION_FACTOR_K)).toContain('Standardatmosphäre');
    expect(refractionLabel(K_FACTOR_MAX)).toContain('Superrefraktion');
  });

  it('nennt für die Skizze die größere Höhe in Kilometern', () => {
    expect(sketchAltitudeKm(10, 10000)).toBeCloseTo(10, 10);
    expect(sketchAltitudeKm(1.5, 10)).toBeCloseTo(0.01, 10);
  });
});
