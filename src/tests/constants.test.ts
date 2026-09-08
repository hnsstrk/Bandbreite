/**
 * Konsistenztests für src/lib/data/constants.ts und src/lib/utils/constants.ts
 * (Single Source of Truth für c, Referenztabellen im Einklang mit den Modellen)
 */

import { describe, it, expect } from 'vitest';
import {
  SPEED_OF_LIGHT,
  EFFECTIVE_EARTH_RADIUS_FACTOR,
  EFFECTIVE_EARTH_RADIUS,
  STANDARD_PRESSURE,
  STANDARD_PRESSURE_HPA,
  STANDARD_TEMPERATURE,
  STANDARD_WATER_VAPOR_DENSITY,
  RAIN_ATTENUATION_HEAVY,
  RAIN_RATES,
  ATMOSPHERIC_ABSORPTION_PEAKS,
  RCS_REFERENCE,
  MODULATION_SCHEMES,
  PRACTICAL_THROUGHPUT,
  WET_SNOW_THRESHOLD_K,
  RAIN_HEIGHT_KM
} from '$lib/data/constants';
import { SPEED_OF_LIGHT_EXACT, SPEED_OF_LIGHT_ROUNDED } from '$lib/utils/constants';
import {
  calculateRainAttenuation,
  calculateAtmosphericAttenuation,
  ABSORPTION_PEAKS
} from '$lib/utils/atmosphericAttenuation';
import { getFsplConstant } from '$lib/utils/calculations';

describe('Lichtgeschwindigkeit – eine Quelle', () => {
  it('SPEED_OF_LIGHT_EXACT ist identisch mit SPEED_OF_LIGHT (CODATA 2018)', () => {
    expect(SPEED_OF_LIGHT).toBe(299_792_458);
    expect(SPEED_OF_LIGHT_EXACT).toBe(SPEED_OF_LIGHT);
    expect(SPEED_OF_LIGHT_ROUNDED).toBe(3e8);
  });
  it('FSPL-Konstante 20·log₁₀(4π/c) = −147,5522 dB', () => {
    expect(getFsplConstant(SPEED_OF_LIGHT)).toBeCloseTo(-147.5522, 4);
    expect(getFsplConstant(SPEED_OF_LIGHT_ROUNDED)).toBeCloseTo(-147.5582, 4);
  });
});

describe('Erd- und Atmosphärenkonstanten', () => {
  it('k = 4/3 exakt, R_eff = 8 494 667 m', () => {
    expect(EFFECTIVE_EARTH_RADIUS_FACTOR).toBe(4 / 3);
    expect(EFFECTIVE_EARTH_RADIUS).toBeCloseTo(8_494_667, 0);
  });
  it('Standarddruck in Pa und hPa konsistent (Store-Defaults importieren diese Werte)', () => {
    expect(STANDARD_PRESSURE_HPA).toBe(STANDARD_PRESSURE / 100);
    expect(STANDARD_TEMPERATURE).toBe(288.15);
    expect(STANDARD_WATER_VAPOR_DENSITY).toBe(7.5);
  });
  it('Nassschnee-Schwelle 0 °C, Regenhöhe plausibel (2–5 km)', () => {
    expect(WET_SNOW_THRESHOLD_K).toBe(273.15);
    expect(RAIN_HEIGHT_KM).toBeGreaterThanOrEqual(2);
    expect(RAIN_HEIGHT_KM).toBeLessThanOrEqual(5);
  });
});

describe('RAIN_ATTENUATION_HEAVY stimmt mit ITU-R P.838-3 überein (25 mm/h, H-Pol., ±2 %)', () => {
  it.each(Object.values(RAIN_ATTENUATION_HEAVY))('%o', (entry) => {
    const model = calculateRainAttenuation(
      entry.frequencyGHz,
      RAIN_RATES.heavy.mmPerHour,
      'horizontal'
    );
    expect(entry.attenuationDbKm / model).toBeGreaterThan(0.98);
    expect(entry.attenuationDbKm / model).toBeLessThan(1.02);
  });
});

describe('Absorptionspeaks stimmen mit dem P.676-13-Modell überein (±25 %)', () => {
  const std = {
    temperatureK: STANDARD_TEMPERATURE,
    pressureHpa: STANDARD_PRESSURE_HPA,
    waterVaporDensity: STANDARD_WATER_VAPOR_DENSITY
  };
  it.each(ATMOSPHERIC_ABSORPTION_PEAKS)('$id', (peak) => {
    const model = calculateAtmosphericAttenuation(peak.peakFrequencyGHz, std).total;
    expect(peak.peakAttenuationDbKm / model).toBeGreaterThan(0.75);
    expect(peak.peakAttenuationDbKm / model).toBeLessThan(1.25);
  });
  it('ABSORPTION_PEAKS (atmosphericAttenuation.ts) nennt dieselben Linien', () => {
    const freqs = [...ABSORPTION_PEAKS.waterVapor, ...ABSORPTION_PEAKS.oxygen].map(
      (p) => p.frequency
    );
    for (const peak of ATMOSPHERIC_ABSORPTION_PEAKS) {
      expect(freqs.some((f) => Math.abs(f - peak.peakFrequencyGHz) < 0.5)).toBe(true);
    }
  });
});

describe('RCS_REFERENCE (Skolnik Tab. 2.2)', () => {
  it('Insekt ≈ 10⁻⁵ m², Mensch 1 m², PKW 100 m², großes Schiff ≥ 10⁴ m²', () => {
    const byId = Object.fromEntries(RCS_REFERENCE.map((r) => [r.id, r.rcsM2]));
    expect(byId.insect).toBeCloseTo(1e-5, 8);
    expect(byId.human).toBe(1);
    expect(byId.car).toBe(100);
    expect(byId.ship).toBeGreaterThanOrEqual(1e4);
    expect(byId['stealth-jet']).toBeLessThan(byId.fighter);
    expect(byId.bird).toBeGreaterThan(byId.insect);
  });
  it('alle Werte positiv und eindeutige IDs', () => {
    const ids = new Set(RCS_REFERENCE.map((r) => r.id));
    expect(ids.size).toBe(RCS_REFERENCE.length);
    for (const r of RCS_REFERENCE) expect(r.rcsM2).toBeGreaterThan(0);
  });
});

describe('MODULATION_SCHEMES / PRACTICAL_THROUGHPUT', () => {
  it('SNR-Schwellen und Bits/Symbol steigen monoton', () => {
    for (let i = 1; i < MODULATION_SCHEMES.length; i++) {
      expect(MODULATION_SCHEMES[i].requiredSnrDb).toBeGreaterThan(
        MODULATION_SCHEMES[i - 1].requiredSnrDb
      );
      expect(MODULATION_SCHEMES[i].bitsPerSymbol).toBeGreaterThan(
        MODULATION_SCHEMES[i - 1].bitsPerSymbol
      );
    }
  });
  it('Roll-off 0–0,5 und Effizienz 0–1', () => {
    expect(PRACTICAL_THROUGHPUT.rollOffFactor).toBeGreaterThanOrEqual(0);
    expect(PRACTICAL_THROUGHPUT.rollOffFactor).toBeLessThanOrEqual(0.5);
    expect(PRACTICAL_THROUGHPUT.protocolEfficiency).toBeGreaterThan(0);
    expect(PRACTICAL_THROUGHPUT.protocolEfficiency).toBeLessThanOrEqual(1);
  });
});
