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
  calculateBandwidthRangeResolution,
  calculateBeatFrequency,
  calculateBlindSpeed,
  calculateCompressionGain,
  calculateStaggeredBlindSpeed,
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

// ---------------------------------------------------------------------------
// Ergänzungen für FMCW, Pulskompression und Blindgeschwindigkeiten
// ---------------------------------------------------------------------------

describe('FMCW und Pulskompression', () => {
  it('ΔR = c/(2·B): 1 GHz → 15 cm, 4 GHz → 3,7 cm', () => {
    expect(calculateBandwidthRangeResolution(1e9)).toBeCloseTo(0.1499, 3);
    expect(calculateBandwidthRangeResolution(4e9)).toBeCloseTo(0.03747, 4);
  });

  it('f_b = 2·R·B/(c·T): 100 m, 4 GHz, 50 µs → 53,4 MHz', () => {
    const beat = calculateBeatFrequency(100, 4e9, 50e-6);
    expect(beat / 1e6).toBeCloseTo(53.37, 1);
  });

  it('Beat-Frequenz wächst linear mit der Entfernung', () => {
    const a = calculateBeatFrequency(50, 1e9, 100e-6);
    const b = calculateBeatFrequency(100, 1e9, 100e-6);
    expect(b / a).toBeCloseTo(2, 9);
  });

  it('Kompressionsgewinn B·τ: 1 MHz über 100 µs → 100 (20 dB)', () => {
    expect(calculateCompressionGain(1e6, 100e-6)).toBeCloseTo(100, 9);
    expect(10 * Math.log10(calculateCompressionGain(1e6, 100e-6))).toBeCloseTo(20, 9);
  });

  it('0 bei ungültigen Eingaben', () => {
    expect(calculateBandwidthRangeResolution(0)).toBe(0);
    expect(calculateBeatFrequency(100, 0, 50e-6)).toBe(0);
    expect(calculateBeatFrequency(0, 1e9, 50e-6)).toBe(0);
    expect(calculateCompressionGain(1e6, 0)).toBe(0);
  });
});

describe('Blindgeschwindigkeiten', () => {
  const lambdaX = wavelength(10e9);

  it('v_b = n·λ·PRF/2: 10 GHz, 1 kHz → 15,0 m/s, Vielfache linear', () => {
    expect(calculateBlindSpeed(1, lambdaX, 1000)).toBeCloseTo(14.99, 1);
    expect(calculateBlindSpeed(3, lambdaX, 1000)).toBeCloseTo(3 * calculateBlindSpeed(1, lambdaX, 1000), 9);
  });

  it('erste Blindgeschwindigkeit ist das Doppelte der eindeutigen Geschwindigkeit', () => {
    expect(calculateBlindSpeed(1, lambdaX, 1000)).toBeCloseTo(
      2 * calculateUnambiguousVelocity(1000, lambdaX),
      9
    );
  });

  it('Staffelung 1000/1200 Hz → erste gemeinsame Lücke bei 6·v_b1', () => {
    const common = calculateStaggeredBlindSpeed(1000, 1200, lambdaX);
    expect(common).toBeCloseTo(6 * calculateBlindSpeed(1, lambdaX, 1000), 6);
  });

  it('gleiche PRFs bringen keinen Gewinn', () => {
    expect(calculateStaggeredBlindSpeed(1000, 1000, lambdaX)).toBeCloseTo(
      calculateBlindSpeed(1, lambdaX, 1000),
      9
    );
  });

  it('0 bei ungültigen Eingaben', () => {
    expect(calculateBlindSpeed(0, lambdaX, 1000)).toBe(0);
    expect(calculateBlindSpeed(1, 0, 1000)).toBe(0);
    expect(calculateStaggeredBlindSpeed(0, 1200, lambdaX)).toBe(0);
  });
});
