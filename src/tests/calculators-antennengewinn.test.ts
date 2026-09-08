/**
 * Rechenmodell des Antennengewinn-Rechners: Gewinn, Öffnungswinkel,
 * Wirkfläche, Fernfeld und die Umkehrung zum Durchmesser.
 *
 * Referenz: D = 1 m, f = 10 GHz, η = 0,55 ergibt rund 37,8 dBi
 * (Balanis, Antenna Theory, Kap. 15).
 */

import { describe, it, expect } from 'vitest';
import {
  dbiToDbd,
  dbdToDbi,
  effectiveApertureM2,
  farFieldDistanceM,
  parabolicBeamwidthDeg,
  parabolicDiameterM,
  parabolicGainDbi,
  wavelengthM,
  GAIN_DIPOLE_DBI
} from '$lib/utils/antennaMath';
import {
  ANTENNA_GAIN_PARAMS,
  ANTENNA_PRESETS,
  DIAMETER_MAX_M,
  DIAMETER_MIN_M,
  DISH_MAX_DRAWN_HALF_ANGLE_DEG,
  DISH_MIN_DRAWN_HALF_ANGLE_DEG,
  EFFICIENCY_MAX,
  EFFICIENCY_MIN,
  drawnHalfAngleDeg
} from '$lib/components/calculators/antennaGain.svelte';

const LAMBDA_10GHZ = wavelengthM(10e9);

describe('Parabolgewinn', () => {
  it('liefert für D = 1 m, 10 GHz, η = 0,55 rund 37,8 dBi', () => {
    expect(parabolicGainDbi(1, LAMBDA_10GHZ, 0.55)).toBeCloseTo(37.81, 2);
  });

  it('gewinnt 6 dB bei doppeltem Durchmesser und bei doppelter Frequenz', () => {
    const basis = parabolicGainDbi(1, LAMBDA_10GHZ, 0.55);
    expect(parabolicGainDbi(2, LAMBDA_10GHZ, 0.55) - basis).toBeCloseTo(6.0206, 3);
    expect(parabolicGainDbi(1, wavelengthM(20e9), 0.55) - basis).toBeCloseTo(6.0206, 3);
  });

  it('rechnet die Presets nach', () => {
    const werte = Object.fromEntries(
      ANTENNA_PRESETS.map((preset) => [
        preset.id,
        parabolicGainDbi(preset.diameterM, wavelengthM(preset.frequencyHz), preset.efficiency)
      ])
    );
    // Sat-Schüssel 60 cm bei 11 GHz, η = 0,6
    expect(werte.sat).toBeCloseTo(34.58, 1);
    // Gitterreflektor 60 cm bei 2,4 GHz, η = 0,5
    expect(werte['wlan-gitter']).toBeCloseTo(20.6, 1);
    // Effelsberg 100 m bei 1,4 GHz, η = 0,5
    expect(werte.effelsberg).toBeCloseTo(60.32, 1);
    // DSN 70 m bei 8,4 GHz, η = 0,7
    expect(werte.dsn).toBeCloseTo(74.25, 1);
  });

  it('liefert 0 bzw. −∞ für unbrauchbare Eingaben', () => {
    expect(parabolicGainDbi(0, LAMBDA_10GHZ, 0.55)).toBe(-Infinity);
    expect(parabolicBeamwidthDeg(1, 0)).toBe(0);
  });
});

describe('Öffnungswinkel, Wirkfläche und Fernfeld', () => {
  it('nutzt die 70-Grad-Näherung', () => {
    expect(parabolicBeamwidthDeg(1, LAMBDA_10GHZ)).toBeCloseTo(2.0985, 3);
    // Doppelter Durchmesser halbiert die Keule.
    expect(parabolicBeamwidthDeg(2, LAMBDA_10GHZ)).toBeCloseTo(
      parabolicBeamwidthDeg(1, LAMBDA_10GHZ) / 2,
      10
    );
  });

  it('führt die Wirkfläche auf die geometrische Fläche zurück', () => {
    const gain = parabolicGainDbi(1, LAMBDA_10GHZ, 0.55);
    const geometrisch = (Math.PI / 4) * 1 * 1 * 0.55;
    expect(effectiveApertureM2(gain, LAMBDA_10GHZ)).toBeCloseTo(geometrisch, 4);
  });

  it('beginnt das Fernfeld bei 2·D²/λ', () => {
    expect(farFieldDistanceM(1, LAMBDA_10GHZ)).toBeCloseTo(66.71, 2);
    expect(farFieldDistanceM(0, LAMBDA_10GHZ)).toBe(0);
  });
});

describe('Umkehrung und Bezugsgrößen', () => {
  it('findet den Durchmesser zum geforderten Gewinn zurück', () => {
    const gain = parabolicGainDbi(1.8, LAMBDA_10GHZ, 0.6);
    expect(parabolicDiameterM(gain, LAMBDA_10GHZ, 0.6)).toBeCloseTo(1.8, 8);
  });

  it('liefert 0 für unbrauchbare Eingaben', () => {
    expect(parabolicDiameterM(30, 0, 0.6)).toBe(0);
    expect(parabolicDiameterM(30, LAMBDA_10GHZ, 0)).toBe(0);
  });

  it('trennt dBi und dBd um den Dipolgewinn', () => {
    expect(GAIN_DIPOLE_DBI).toBeCloseTo(2.15, 10);
    expect(dbiToDbd(11.15)).toBeCloseTo(9, 10);
    expect(dbdToDbi(9)).toBeCloseTo(11.15, 10);
    expect(dbdToDbi(dbiToDbd(37.81))).toBeCloseTo(37.81, 10);
  });
});

describe('Bereiche und Zeichenmaße', () => {
  it('hält die Standardwerte in ihren Grenzen', () => {
    expect(ANTENNA_GAIN_PARAMS.d.default).toBeGreaterThanOrEqual(DIAMETER_MIN_M);
    expect(ANTENNA_GAIN_PARAMS.d.default).toBeLessThanOrEqual(DIAMETER_MAX_M);
    expect(ANTENNA_GAIN_PARAMS.eta.default).toBeGreaterThanOrEqual(EFFICIENCY_MIN);
    expect(ANTENNA_GAIN_PARAMS.eta.default).toBeLessThanOrEqual(EFFICIENCY_MAX);
  });

  it('hält jedes Preset in den Eingabegrenzen', () => {
    for (const preset of ANTENNA_PRESETS) {
      expect(preset.diameterM).toBeGreaterThanOrEqual(DIAMETER_MIN_M);
      expect(preset.diameterM).toBeLessThanOrEqual(DIAMETER_MAX_M);
      expect(preset.frequencyHz).toBeGreaterThanOrEqual(ANTENNA_GAIN_PARAMS.f.min);
      expect(preset.frequencyHz).toBeLessThanOrEqual(ANTENNA_GAIN_PARAMS.f.max);
      expect(preset.value).toBe(preset.diameterM);
    }
  });

  it('vergibt eindeutige Preset-IDs', () => {
    const ids = ANTENNA_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('zeichnet sehr schmale Keulen überhöht, breite maßstäblich', () => {
    const schmal = drawnHalfAngleDeg(0.05);
    expect(schmal.deg).toBe(DISH_MIN_DRAWN_HALF_ANGLE_DEG);
    expect(schmal.exaggerated).toBe(true);

    const passend = drawnHalfAngleDeg(10);
    expect(passend.deg).toBe(10);
    expect(passend.exaggerated).toBe(false);

    expect(drawnHalfAngleDeg(90).deg).toBe(DISH_MAX_DRAWN_HALF_ANGLE_DEG);
    expect(drawnHalfAngleDeg(0).exaggerated).toBe(true);
  });
});
