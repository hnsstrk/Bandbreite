/**
 * Modell des Pegelrechners: Bereiche, Presets und die Kette in der
 * Adresszeile.
 *
 * Referenz: 1 W = 30 dBm = 0 dBW = 137 dBµV an 50 Ω.
 */

import { describe, it, expect } from 'vitest';
import {
  CHAIN_AXIS_LEFT,
  CHAIN_AXIS_RIGHT,
  CHAIN_LEVEL_MAX_DBM,
  CHAIN_LEVEL_MIN_DBM,
  CHAIN_TICKS,
  DECIBEL_PARAMS,
  DEFAULT_LEVEL_CHAIN,
  IMPEDANCE_OPTIONS,
  LEVEL_MAX_DBM,
  LEVEL_MIN_DBM,
  LEVEL_PRESETS,
  POWER_MAX_W,
  POWER_MIN_W,
  RATIO_MAX_DB,
  RATIO_MIN_DB,
  RATIO_PRESETS,
  chainX,
  parseChain,
  serializeChain,
  voltageParts
} from '$lib/components/calculators/decibelCalculator.svelte';
import { IMPEDANCE_RF_OHM, chainTotalDbm, dbmToDbuv, levelsFromDbm } from '$lib/utils/decibel';
import { wattToDbm } from '$lib/utils/conversions';

describe('Referenzpunkt 1 Watt', () => {
  it('ist 30 dBm, 0 dBW und 137 dBµV an 50 Ω', () => {
    const dbm = wattToDbm(1);
    expect(dbm).toBeCloseTo(30, 10);
    const levels = levelsFromDbm(dbm, IMPEDANCE_RF_OHM);
    expect(levels.dbw).toBeCloseTo(0, 10);
    expect(levels.dbuv).toBeCloseTo(137, 0);
    expect(dbmToDbuv(dbm, IMPEDANCE_RF_OHM)).toBeCloseTo(136.99, 2);
  });
});

describe('Bereiche und Presets', () => {
  it('leitet die Leistungsgrenzen aus dem Pegelbereich ab', () => {
    expect(wattToDbm(POWER_MIN_W)).toBeCloseTo(LEVEL_MIN_DBM, 8);
    expect(wattToDbm(POWER_MAX_W)).toBeCloseTo(LEVEL_MAX_DBM, 8);
  });

  it('hält die Standardwerte in ihren Grenzen', () => {
    expect(DECIBEL_PARAMS.l.default).toBeGreaterThanOrEqual(LEVEL_MIN_DBM);
    expect(DECIBEL_PARAMS.l.default).toBeLessThanOrEqual(LEVEL_MAX_DBM);
    expect(DECIBEL_PARAMS.r.default).toBeGreaterThanOrEqual(RATIO_MIN_DB);
    expect(DECIBEL_PARAMS.r.default).toBeLessThanOrEqual(RATIO_MAX_DB);
    expect(DECIBEL_PARAMS.z.options).toContain(DECIBEL_PARAMS.z.default);
  });

  it('bietet nur Impedanzen an, die der Parameter kennt', () => {
    for (const option of IMPEDANCE_OPTIONS) {
      expect(DECIBEL_PARAMS.z.options).toContain(option.value);
      expect(Number(option.value)).toBeGreaterThan(0);
    }
  });

  it('hält jedes Preset in seinem Bereich und vergibt eindeutige IDs', () => {
    for (const preset of LEVEL_PRESETS) {
      expect(preset.value).toBeGreaterThanOrEqual(LEVEL_MIN_DBM);
      expect(preset.value).toBeLessThanOrEqual(LEVEL_MAX_DBM);
    }
    for (const preset of RATIO_PRESETS) {
      expect(preset.value).toBeGreaterThanOrEqual(RATIO_MIN_DB);
      expect(preset.value).toBeLessThanOrEqual(RATIO_MAX_DB);
    }
    const ids = [...LEVEL_PRESETS, ...RATIO_PRESETS].map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('nennt 1 W als Preset mit 30 dBm', () => {
    const watt = LEVEL_PRESETS.find((preset) => preset.id === 'watt');
    expect(watt?.value).toBe(30);
  });
});

describe('Spannungsanzeige', () => {
  it('wählt die passende Einheit', () => {
    expect(voltageParts(7.0711)).toEqual({ value: 7.0711, symbol: 'V' });
    expect(voltageParts(0.005).symbol).toBe('mV');
    expect(voltageParts(2.2e-6).symbol).toBe('µV');
    expect(voltageParts(0)).toEqual({ value: 0, symbol: 'µV' });
  });

  it('rechnet den Zahlenwert in die gewählte Einheit um', () => {
    expect(voltageParts(0.005).value).toBeCloseTo(5, 10);
    expect(voltageParts(2.2e-6).value).toBeCloseTo(2.2, 10);
  });
});

describe('Kette in der Adresszeile', () => {
  it('schreibt und liest die Kette verlustfrei', () => {
    const roh = serializeChain(DEFAULT_LEVEL_CHAIN);
    expect(roh).toBe('20,-3,12,-100,12,-2');
    const zurueck = parseChain(roh);
    expect(zurueck.map((stage) => stage.db)).toEqual(DEFAULT_LEVEL_CHAIN.map((stage) => stage.db));
    expect(zurueck.map((stage) => stage.id)).toEqual(DEFAULT_LEVEL_CHAIN.map((s) => s.id));
  });

  it('begrenzt gelesene Werte auf die Grenzen der Stufe', () => {
    const zurueck = parseChain('9999,-9999,12,-100,12,-2');
    expect(zurueck[0].db).toBe(DEFAULT_LEVEL_CHAIN[0].max);
    expect(zurueck[1].db).toBe(DEFAULT_LEVEL_CHAIN[1].min);
  });

  it('behält den Standard bei fehlenden oder ungültigen Werten', () => {
    const zurueck = parseChain('10,,keine-zahl');
    expect(zurueck[0].db).toBe(10);
    expect(zurueck[1].db).toBe(DEFAULT_LEVEL_CHAIN[1].db);
    expect(zurueck[2].db).toBe(DEFAULT_LEVEL_CHAIN[2].db);
    expect(zurueck).toHaveLength(DEFAULT_LEVEL_CHAIN.length);
  });

  it('lässt den Standard der Adresszeile zur Standardkette passen', () => {
    expect(DECIBEL_PARAMS.c.default).toBe(serializeChain(DEFAULT_LEVEL_CHAIN));
  });

  it('summiert die Standardkette auf −61 dBm', () => {
    expect(chainTotalDbm(DEFAULT_LEVEL_CHAIN)).toBe(-61);
  });
});

describe('Achse des Kettendiagramms', () => {
  it('bildet die Randwerte auf die Achsenenden ab', () => {
    expect(chainX(CHAIN_LEVEL_MIN_DBM)).toBeCloseTo(CHAIN_AXIS_LEFT, 10);
    expect(chainX(CHAIN_LEVEL_MAX_DBM)).toBeCloseTo(CHAIN_AXIS_RIGHT, 10);
  });

  it('begrenzt Werte außerhalb der Achse', () => {
    expect(chainX(-1000)).toBeCloseTo(CHAIN_AXIS_LEFT, 10);
    expect(chainX(1000)).toBeCloseTo(CHAIN_AXIS_RIGHT, 10);
  });

  it('legt alle Marken in den Achsenbereich', () => {
    for (const tick of CHAIN_TICKS) {
      expect(tick).toBeGreaterThanOrEqual(CHAIN_LEVEL_MIN_DBM);
      expect(tick).toBeLessThanOrEqual(CHAIN_LEVEL_MAX_DBM);
      expect(chainX(tick)).toBeGreaterThanOrEqual(CHAIN_AXIS_LEFT);
      expect(chainX(tick)).toBeLessThanOrEqual(CHAIN_AXIS_RIGHT);
    }
  });

  it('wächst streng monoton', () => {
    expect(chainX(-40)).toBeLessThan(chainX(0));
    expect(chainX(0)).toBeLessThan(chainX(40));
  });
});
