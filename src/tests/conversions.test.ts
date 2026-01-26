/**
 * Unit tests for src/lib/utils/conversions.ts
 * Testing frequency, wavelength, and power conversions
 */

import { describe, it, expect } from 'vitest';
import {
  FREQUENCY_FACTORS,
  WAVELENGTH_FACTORS,
  POWER_FACTORS,
  convertToHz,
  convertFromHz,
  convertToMeters,
  convertFromMeters,
  wattToDbm,
  dbmToWatt,
  wattToDbW,
  dbWToWatt,
  convertToWatt,
  convertFromWatt
} from '$lib/utils/conversions';

describe('FREQUENCY_FACTORS', () => {
  it('should have correct conversion factors', () => {
    expect(FREQUENCY_FACTORS.Hz).toBe(1);
    expect(FREQUENCY_FACTORS.kHz).toBe(1e3);
    expect(FREQUENCY_FACTORS.MHz).toBe(1e6);
    expect(FREQUENCY_FACTORS.GHz).toBe(1e9);
    expect(FREQUENCY_FACTORS.THz).toBe(1e12);
  });
});

describe('WAVELENGTH_FACTORS', () => {
  it('should have correct conversion factors', () => {
    expect(WAVELENGTH_FACTORS.km).toBe(1e3);
    expect(WAVELENGTH_FACTORS.m).toBe(1);
    expect(WAVELENGTH_FACTORS.cm).toBe(1e-2);
    expect(WAVELENGTH_FACTORS.mm).toBe(1e-3);
    expect(WAVELENGTH_FACTORS['μm']).toBe(1e-6);
    expect(WAVELENGTH_FACTORS.nm).toBe(1e-9);
  });
});

describe('POWER_FACTORS', () => {
  it('should have correct conversion factors', () => {
    expect(POWER_FACTORS.uw).toBe(1e-6);
    expect(POWER_FACTORS.mw).toBe(1e-3);
    expect(POWER_FACTORS.w).toBe(1);
    expect(POWER_FACTORS.kw).toBe(1e3);
  });
});

describe('convertToHz', () => {
  it('should convert Hz correctly', () => {
    expect(convertToHz(1000, 'Hz')).toBe(1000);
  });

  it('should convert kHz correctly', () => {
    expect(convertToHz(1, 'kHz')).toBe(1000);
    expect(convertToHz(100, 'kHz')).toBe(100000);
  });

  it('should convert MHz correctly', () => {
    expect(convertToHz(1, 'MHz')).toBe(1e6);
    expect(convertToHz(2.4, 'MHz')).toBe(2.4e6);
  });

  it('should convert GHz correctly', () => {
    expect(convertToHz(1, 'GHz')).toBe(1e9);
    expect(convertToHz(2.4, 'GHz')).toBe(2.4e9);
    expect(convertToHz(5.8, 'GHz')).toBe(5.8e9);
  });

  it('should convert THz correctly', () => {
    expect(convertToHz(1, 'THz')).toBe(1e12);
  });

  it('should return value unchanged for unknown unit', () => {
    expect(convertToHz(1000, 'unknown')).toBe(1000);
  });
});

describe('convertFromHz', () => {
  it('should convert to Hz correctly', () => {
    expect(convertFromHz(1000, 'Hz')).toBe(1000);
  });

  it('should convert to kHz correctly', () => {
    expect(convertFromHz(1000, 'kHz')).toBe(1);
    expect(convertFromHz(100000, 'kHz')).toBe(100);
  });

  it('should convert to MHz correctly', () => {
    expect(convertFromHz(1e6, 'MHz')).toBe(1);
    expect(convertFromHz(2.4e6, 'MHz')).toBe(2.4);
  });

  it('should convert to GHz correctly', () => {
    expect(convertFromHz(1e9, 'GHz')).toBe(1);
    expect(convertFromHz(2.4e9, 'GHz')).toBe(2.4);
  });

  it('should convert to THz correctly', () => {
    expect(convertFromHz(1e12, 'THz')).toBe(1);
  });

  it('should be inverse of convertToHz', () => {
    const original = 2.4;
    const hz = convertToHz(original, 'GHz');
    const back = convertFromHz(hz, 'GHz');
    expect(back).toBeCloseTo(original, 10);
  });
});

describe('convertToMeters', () => {
  it('should convert m correctly', () => {
    expect(convertToMeters(1, 'm')).toBe(1);
  });

  it('should convert km correctly', () => {
    expect(convertToMeters(1, 'km')).toBe(1000);
  });

  it('should convert cm correctly', () => {
    expect(convertToMeters(100, 'cm')).toBe(1);
  });

  it('should convert mm correctly', () => {
    expect(convertToMeters(1000, 'mm')).toBe(1);
  });

  it('should convert μm correctly', () => {
    expect(convertToMeters(1e6, 'μm')).toBe(1);
  });

  it('should convert nm correctly', () => {
    expect(convertToMeters(1e9, 'nm')).toBe(1);
  });

  it('should return value unchanged for unknown unit', () => {
    expect(convertToMeters(100, 'unknown')).toBe(100);
  });
});

describe('convertFromMeters', () => {
  it('should convert to m correctly', () => {
    expect(convertFromMeters(1, 'm')).toBe(1);
  });

  it('should convert to km correctly', () => {
    expect(convertFromMeters(1000, 'km')).toBe(1);
  });

  it('should convert to cm correctly', () => {
    expect(convertFromMeters(1, 'cm')).toBe(100);
  });

  it('should convert to mm correctly', () => {
    expect(convertFromMeters(1, 'mm')).toBe(1000);
  });

  it('should be inverse of convertToMeters', () => {
    const original = 125;
    const meters = convertToMeters(original, 'mm');
    const back = convertFromMeters(meters, 'mm');
    expect(back).toBeCloseTo(original, 10);
  });
});

describe('wattToDbm', () => {
  it('should convert 1 mW to 0 dBm', () => {
    expect(wattToDbm(0.001)).toBeCloseTo(0, 5);
  });

  it('should convert 1 W to 30 dBm', () => {
    expect(wattToDbm(1)).toBeCloseTo(30, 5);
  });

  it('should convert 100 mW to 20 dBm', () => {
    expect(wattToDbm(0.1)).toBeCloseTo(20, 5);
  });

  it('should convert 10 mW to 10 dBm', () => {
    expect(wattToDbm(0.01)).toBeCloseTo(10, 5);
  });

  it('should convert 1 uW to -30 dBm', () => {
    expect(wattToDbm(1e-6)).toBeCloseTo(-30, 5);
  });

  it('should handle 100 W correctly', () => {
    expect(wattToDbm(100)).toBeCloseTo(50, 5);
  });
});

describe('dbmToWatt', () => {
  it('should convert 0 dBm to 1 mW', () => {
    expect(dbmToWatt(0)).toBeCloseTo(0.001, 10);
  });

  it('should convert 30 dBm to 1 W', () => {
    expect(dbmToWatt(30)).toBeCloseTo(1, 5);
  });

  it('should convert 20 dBm to 100 mW', () => {
    expect(dbmToWatt(20)).toBeCloseTo(0.1, 5);
  });

  it('should convert 10 dBm to 10 mW', () => {
    expect(dbmToWatt(10)).toBeCloseTo(0.01, 5);
  });

  it('should convert -30 dBm to 1 uW', () => {
    expect(dbmToWatt(-30)).toBeCloseTo(1e-6, 12);
  });

  it('should be inverse of wattToDbm', () => {
    const originalWatt = 0.05; // 50 mW
    const dbm = wattToDbm(originalWatt);
    const backToWatt = dbmToWatt(dbm);
    expect(backToWatt).toBeCloseTo(originalWatt, 10);
  });
});

describe('wattToDbW', () => {
  it('should convert 1 W to 0 dBW', () => {
    expect(wattToDbW(1)).toBeCloseTo(0, 5);
  });

  it('should convert 10 W to 10 dBW', () => {
    expect(wattToDbW(10)).toBeCloseTo(10, 5);
  });

  it('should convert 100 W to 20 dBW', () => {
    expect(wattToDbW(100)).toBeCloseTo(20, 5);
  });

  it('should convert 1 kW to 30 dBW', () => {
    expect(wattToDbW(1000)).toBeCloseTo(30, 5);
  });

  it('should convert 0.001 W to -30 dBW', () => {
    expect(wattToDbW(0.001)).toBeCloseTo(-30, 5);
  });
});

describe('dbWToWatt', () => {
  it('should convert 0 dBW to 1 W', () => {
    expect(dbWToWatt(0)).toBeCloseTo(1, 5);
  });

  it('should convert 10 dBW to 10 W', () => {
    expect(dbWToWatt(10)).toBeCloseTo(10, 5);
  });

  it('should convert 20 dBW to 100 W', () => {
    expect(dbWToWatt(20)).toBeCloseTo(100, 5);
  });

  it('should convert -30 dBW to 1 mW', () => {
    expect(dbWToWatt(-30)).toBeCloseTo(0.001, 8);
  });

  it('should be inverse of wattToDbW', () => {
    const originalWatt = 50;
    const dbw = wattToDbW(originalWatt);
    const backToWatt = dbWToWatt(dbw);
    expect(backToWatt).toBeCloseTo(originalWatt, 5);
  });
});

describe('convertToWatt', () => {
  it('should convert uW correctly', () => {
    expect(convertToWatt(1000000, 'uw')).toBeCloseTo(1, 10);
  });

  it('should convert mW correctly', () => {
    expect(convertToWatt(1000, 'mw')).toBeCloseTo(1, 10);
  });

  it('should convert W correctly', () => {
    expect(convertToWatt(1, 'w')).toBe(1);
  });

  it('should convert kW correctly', () => {
    expect(convertToWatt(1, 'kw')).toBe(1000);
  });

  it('should return value unchanged for unknown unit', () => {
    expect(convertToWatt(100, 'unknown')).toBe(100);
  });
});

describe('convertFromWatt', () => {
  it('should convert to uW correctly', () => {
    expect(convertFromWatt(1, 'uw')).toBe(1000000);
  });

  it('should convert to mW correctly', () => {
    expect(convertFromWatt(1, 'mw')).toBe(1000);
  });

  it('should convert to W correctly', () => {
    expect(convertFromWatt(1, 'w')).toBe(1);
  });

  it('should convert to kW correctly', () => {
    expect(convertFromWatt(1000, 'kw')).toBe(1);
  });

  it('should be inverse of convertToWatt', () => {
    const original = 500;
    const watt = convertToWatt(original, 'mw');
    const back = convertFromWatt(watt, 'mw');
    expect(back).toBeCloseTo(original, 10);
  });
});

describe('dBm to dBW relationship', () => {
  it('should have 30 dB difference (dBm = dBW + 30)', () => {
    const watt = 0.1; // 100 mW = 0.1 W
    const dbm = wattToDbm(watt);
    const dbw = wattToDbW(watt);
    expect(dbm - dbw).toBeCloseTo(30, 5);
  });

  it('should work for various power levels', () => {
    const testWatts = [0.001, 0.01, 0.1, 1, 10, 100];
    testWatts.forEach(watt => {
      const dbm = wattToDbm(watt);
      const dbw = wattToDbW(watt);
      expect(dbm - dbw).toBeCloseTo(30, 5);
    });
  });
});

describe('Edge cases', () => {
  it('should handle very small power values', () => {
    const microWatt = 1e-6; // 1 uW
    const dbm = wattToDbm(microWatt);
    expect(dbm).toBeCloseTo(-30, 5);
  });

  it('should handle very large power values', () => {
    const kiloWatt = 1000; // 1 kW
    const dbm = wattToDbm(kiloWatt);
    expect(dbm).toBeCloseTo(60, 5);
  });

  it('should handle zero frequency correctly', () => {
    expect(convertToHz(0, 'GHz')).toBe(0);
    expect(convertFromHz(0, 'GHz')).toBe(0);
  });

  it('should handle negative frequency values', () => {
    // Negative frequencies are technically invalid but should not crash
    expect(convertToHz(-1, 'GHz')).toBe(-1e9);
    expect(convertFromHz(-1e9, 'GHz')).toBe(-1);
  });
});
