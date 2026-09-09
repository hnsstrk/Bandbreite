/**
 * Rechenmodell der Tag-Nacht-Ionosphäre (Widget `IonosphereDayNightWidget`).
 *
 * Referenzwerte: foF2 = 9·√N_e (ITU-R P.1239); N_e = 10¹² e⁻/m³ → foF2 = 9 MHz
 * am Tag, 2,5·10¹¹ e⁻/m³ → 4,5 MHz nachts (Davies, Ionospheric Radio).
 */
import { describe, it, expect } from 'vitest';
import {
  DAY_NIGHT_LIMITS,
  LAYER_DENSITY,
  SUNRISE_HOUR,
  SUNSET_HOUR,
  absorptionIndex,
  densityProfile,
  illumination,
  isDaylight,
  layerCriticalFrequencyMHz,
  layerDensity,
  layerStates,
  mufMHz
} from '$lib/components/widgets/IonosphereDayNightModel';
import { IONOSPHERIC_LAYERS } from '$lib/data/constants';

describe('IonosphereDayNightModel: Tagesgang', () => {
  it('bildet den Sonnenstand auf 0 … 1 ab', () => {
    expect(illumination(12)).toBeCloseTo(1, 9);
    expect(illumination(SUNRISE_HOUR)).toBe(0);
    expect(illumination(SUNSET_HOUR)).toBe(0);
    expect(illumination(0)).toBe(0);
    expect(illumination(3)).toBe(0);
    expect(illumination(9)).toBeCloseTo(Math.SQRT1_2, 9);
    expect(illumination(15)).toBeCloseTo(Math.SQRT1_2, 9);
    expect(isDaylight(12)).toBe(true);
    expect(isDaylight(2)).toBe(false);
  });

  it('interpoliert die Elektronendichte zwischen Nacht- und Tageswert', () => {
    expect(layerDensity('f2-layer', 12)).toBeCloseTo(LAYER_DENSITY['f2-layer'].day, 0);
    expect(layerDensity('f2-layer', 2)).toBeCloseTo(LAYER_DENSITY['f2-layer'].night, 0);
    expect(layerDensity('d-layer', 2)).toBeCloseTo(LAYER_DENSITY['d-layer'].night, 0);
    expect(layerDensity('gibt-es-nicht', 12)).toBe(0);
    // Mittags am dichtesten, nachts am dünnsten
    expect(layerDensity('e-layer', 12)).toBeGreaterThan(layerDensity('e-layer', 20));
  });

  it('liefert foF2 = 9 MHz am Tag und 4,5 MHz nachts', () => {
    expect(layerCriticalFrequencyMHz('f2-layer', 12)).toBeCloseTo(9, 6);
    expect(layerCriticalFrequencyMHz('f2-layer', 1)).toBeCloseTo(4.5, 6);
    // E-Schicht am Tag: foE rund 3 MHz
    expect(layerCriticalFrequencyMHz('e-layer', 12)).toBeCloseTo(2.985, 2);
  });

  it('beschreibt alle vier Schichten mit Höhe und Dichte', () => {
    const states = layerStates(12);
    expect(states).toHaveLength(IONOSPHERIC_LAYERS.length);
    expect(states.map((layer) => layer.id)).toEqual(IONOSPHERIC_LAYERS.map((layer) => layer.id));
    for (const layer of states) {
      expect(layer.altitudeMinKm).toBeLessThan(layer.altitudeMaxKm);
      expect(layer.relative).toBeGreaterThan(0);
      expect(layer.relative).toBeLessThanOrEqual(1);
    }
    // Mittags stehen alle Schichten auf ihrem Tageswert
    expect(states.every((layer) => layer.relative > 0.99)).toBe(true);
    // Nachts ist die D-Schicht praktisch verschwunden
    const night = layerStates(3);
    expect(night[0].relative).toBeCloseTo(0.01, 6);
  });

  it('hebt die MUF mit der Sprungdistanz an (Sekantengesetz)', () => {
    expect(mufMHz(12, 0)).toBeCloseTo(9, 6);
    const far = mufMHz(12, 3000);
    expect(far).toBeGreaterThan(25);
    expect(far).toBeLessThan(32);
    // Nachts sinkt die MUF mit foF2
    expect(mufMHz(2, 3000)).toBeLessThan(far);
  });

  it('macht die D-Schicht-Absorption am Tag sichtbar und nachts null', () => {
    expect(absorptionIndex(12)).toBeCloseTo(1, 6);
    expect(absorptionIndex(2)).toBeCloseTo(0.01, 6);
    expect(absorptionIndex(9)).toBeGreaterThan(0.5);
  });

  it('liefert ein Höhenprofil mit dem Maximum in der F2-Schicht', () => {
    const profile = densityProfile(12, 450, 91);
    expect(profile).toHaveLength(91);
    expect(profile[0].altitudeKm).toBe(0);
    expect(profile[profile.length - 1].altitudeKm).toBeCloseTo(450, 6);
    const peak = profile.reduce((best, point) =>
      point.densityPerM3 > best.densityPerM3 ? point : best
    );
    expect(peak.altitudeKm).toBeGreaterThan(250);
    expect(peak.altitudeKm).toBeLessThan(350);
  });

  it('nennt sinnvolle Reglergrenzen', () => {
    expect(DAY_NIGHT_LIMITS.hourOfDay.min).toBe(0);
    expect(DAY_NIGHT_LIMITS.hourOfDay.max).toBe(24);
    expect(DAY_NIGHT_LIMITS.distanceKm.max).toBe(3000);
  });
});
