/**
 * Referenztests für src/lib/utils/radar.ts (Bericht 03, Abschnitt 4.5)
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRadarMaxRange,
  calculateRadarReceivedPowerDbm,
  calculateDopplerShift,
  calculateRangeResolution,
  calculateUnambiguousRange,
  calculateUnambiguousVelocity,
  calculateRoundTripTime,
  type RadarParameters
} from '$lib/utils/radar';

const C = 299792458;
const wavelength = (fHz: number) => C / fHz;

const DEFAULTS: RadarParameters = {
  txPowerW: 1000,
  antennaGainDbi: 30,
  wavelengthM: wavelength(9.4e9),
  rcsM2: 1
};

describe('calculateRadarMaxRange', () => {
  it('Defaults (9,4 GHz, 1 kW, 30 dBi, 1 m², −90 dBm) → 4758 m', () => {
    expect(calculateRadarMaxRange(DEFAULTS, -90)).toBeCloseTo(4758, -1);
  });
  it('9,4 GHz, 25 kW, 30 dBi, 100 m², −100 dBm → 59,83 km', () => {
    const r = calculateRadarMaxRange({ ...DEFAULTS, txPowerW: 25000, rcsM2: 100 }, -100);
    expect(r / 1000).toBeCloseTo(59.83, 1);
  });
  it('77 GHz, 10 mW, 20 dBi, 10 m², −100 dBm → 93,5 m', () => {
    const r = calculateRadarMaxRange(
      { txPowerW: 0.01, antennaGainDbi: 20, wavelengthM: wavelength(77e9), rcsM2: 10 },
      -100
    );
    expect(r).toBeCloseTo(93.5, 0);
  });
  it('16-fache Sendeleistung verdoppelt die Reichweite', () => {
    const r1 = calculateRadarMaxRange(DEFAULTS, -90);
    const r16 = calculateRadarMaxRange({ ...DEFAULTS, txPowerW: 16000 }, -90);
    expect(r16 / r1).toBeCloseTo(2, 9);
  });
  it('12 dB Systemverluste halbieren die Reichweite (⁴√(1/16))', () => {
    const r0 = calculateRadarMaxRange(DEFAULTS, -90);
    const r12 = calculateRadarMaxRange({ ...DEFAULTS, systemLossDb: 12.0412 }, -90);
    expect(r12 / r0).toBeCloseTo(0.5, 3);
  });
  it('0 bei ungültigen Eingaben', () => {
    expect(calculateRadarMaxRange({ ...DEFAULTS, txPowerW: 0 }, -90)).toBe(0);
    expect(calculateRadarMaxRange({ ...DEFAULTS, rcsM2: 0 }, -90)).toBe(0);
    expect(calculateRadarMaxRange({ ...DEFAULTS, wavelengthM: 0 }, -90)).toBe(0);
  });
});

describe('calculateRadarReceivedPowerDbm', () => {
  it('Defaults, R = 10 km → −102,9 dBm', () => {
    expect(calculateRadarReceivedPowerDbm(DEFAULTS, 10000)).toBeCloseTo(-102.9, 1);
  });
  it('bei R_max ist P_r = P_min', () => {
    const rMax = calculateRadarMaxRange(DEFAULTS, -90);
    expect(calculateRadarReceivedPowerDbm(DEFAULTS, rMax)).toBeCloseTo(-90, 6);
  });
  it('Verluste reduzieren P_r um L dB', () => {
    const p0 = calculateRadarReceivedPowerDbm(DEFAULTS, 10000);
    const p3 = calculateRadarReceivedPowerDbm({ ...DEFAULTS, systemLossDb: 3 }, 10000);
    expect(p0 - p3).toBeCloseTo(3, 9);
  });
  it('−Infinity bei ungültiger Entfernung', () => {
    expect(calculateRadarReceivedPowerDbm(DEFAULTS, 0)).toBe(-Infinity);
  });
});

describe('calculateDopplerShift', () => {
  it('f_d = 2·v·f/c: 100 km/h bei 24,125 GHz → 4470 Hz', () => {
    expect(calculateDopplerShift(100 / 3.6, 24.125e9)).toBeCloseTo(4470.4, 0);
  });
  it('30 m/s bei 10 GHz → 2001 Hz', () => {
    expect(calculateDopplerShift(30, 10e9)).toBeCloseTo(2001.4, 0);
  });
  it('negativ für sich entfernende Ziele, 0 bei f ≤ 0', () => {
    expect(calculateDopplerShift(-30, 10e9)).toBeLessThan(0);
    expect(calculateDopplerShift(30, 0)).toBe(0);
  });
});

describe('Puls-Parameter', () => {
  it('ΔR = c·τ/2: 1 µs → 149,9 m', () => {
    expect(calculateRangeResolution(1e-6)).toBeCloseTo(149.896, 2);
  });
  it('R_u = c/(2·PRF): 1 kHz → 149,9 km', () => {
    expect(calculateUnambiguousRange(1000) / 1000).toBeCloseTo(149.896, 2);
  });
  it('v_u = λ·PRF/4: 3 cm, 1 kHz → 7,5 m/s', () => {
    expect(calculateUnambiguousVelocity(1000, 0.03)).toBeCloseTo(7.5, 9);
  });
  it('t = 2R/c: 150 km → 1,0007 ms', () => {
    expect(calculateRoundTripTime(150000) * 1e3).toBeCloseTo(1.0007, 3);
  });
  it('0 bei ungültigen Eingaben', () => {
    expect(calculateRangeResolution(0)).toBe(0);
    expect(calculateUnambiguousRange(0)).toBe(0);
    expect(calculateUnambiguousVelocity(0, 0.03)).toBe(0);
    expect(calculateRoundTripTime(-1)).toBe(0);
  });
});
