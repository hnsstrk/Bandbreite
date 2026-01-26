/**
 * Unit tests for src/lib/utils/calculations.ts
 * Testing FSPL, range, and wavelength calculations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Speed of light constant for calculations
const SPEED_OF_LIGHT = 299792458;

// Mock the speedOfLight store before importing
vi.mock('$lib/stores/speedOfLight.svelte', () => ({
  speedOfLight: {
    value: 299792458,
    isExact: true
  }
}));

// Import after mocking
import {
  frequencyToWavelength,
  wavelengthToFrequency,
  calculateFSPL,
  calculateRange
} from '$lib/utils/calculations';

describe('frequencyToWavelength', () => {
  it('should calculate wavelength correctly for 1 GHz', () => {
    const frequencyHz = 1e9; // 1 GHz
    const expected = SPEED_OF_LIGHT / frequencyHz; // ~0.3 m
    const result = frequencyToWavelength(frequencyHz);
    expect(result).toBeCloseTo(expected, 6);
  });

  it('should calculate wavelength correctly for 2.4 GHz (WiFi)', () => {
    const frequencyHz = 2.4e9;
    const expected = SPEED_OF_LIGHT / frequencyHz; // ~0.125 m
    const result = frequencyToWavelength(frequencyHz);
    expect(result).toBeCloseTo(expected, 6);
  });

  it('should calculate wavelength correctly for 5 GHz (WiFi 5)', () => {
    const frequencyHz = 5e9;
    const expected = SPEED_OF_LIGHT / frequencyHz; // ~0.06 m
    const result = frequencyToWavelength(frequencyHz);
    expect(result).toBeCloseTo(expected, 6);
  });

  it('should return 0 for zero frequency', () => {
    expect(frequencyToWavelength(0)).toBe(0);
  });

  it('should return 0 for negative frequency', () => {
    expect(frequencyToWavelength(-1000)).toBe(0);
  });

  it('should handle very low frequencies (VLF)', () => {
    const frequencyHz = 3000; // 3 kHz VLF
    const expected = SPEED_OF_LIGHT / frequencyHz; // ~100 km
    const result = frequencyToWavelength(frequencyHz);
    expect(result).toBeCloseTo(expected, 0);
  });

  it('should handle very high frequencies (THz)', () => {
    const frequencyHz = 1e12; // 1 THz
    const expected = SPEED_OF_LIGHT / frequencyHz; // ~0.0003 m
    const result = frequencyToWavelength(frequencyHz);
    expect(result).toBeCloseTo(expected, 9);
  });
});

describe('wavelengthToFrequency', () => {
  it('should calculate frequency correctly for 1 m wavelength', () => {
    const wavelengthM = 1;
    const expected = SPEED_OF_LIGHT; // ~300 MHz
    const result = wavelengthToFrequency(wavelengthM);
    expect(result).toBeCloseTo(expected, 0);
  });

  it('should calculate frequency correctly for 0.125 m wavelength (2.4 GHz)', () => {
    const wavelengthM = 0.125;
    const expected = SPEED_OF_LIGHT / wavelengthM;
    const result = wavelengthToFrequency(wavelengthM);
    expect(result).toBeCloseTo(expected, 0);
  });

  it('should return 0 for zero wavelength', () => {
    expect(wavelengthToFrequency(0)).toBe(0);
  });

  it('should return 0 for negative wavelength', () => {
    expect(wavelengthToFrequency(-1)).toBe(0);
  });

  it('should be inverse of frequencyToWavelength', () => {
    const frequencyHz = 2.4e9;
    const wavelength = frequencyToWavelength(frequencyHz);
    const backToFrequency = wavelengthToFrequency(wavelength);
    expect(backToFrequency).toBeCloseTo(frequencyHz, 0);
  });
});

describe('calculateFSPL', () => {
  // FSPL formula: 20*log10(d) + 20*log10(f) + 20*log10(4*PI/c)
  // FSPL constant: 20*log10(4*PI/c) ≈ -147.55 dB (for d in m, f in Hz)

  it('should calculate FSPL correctly for 1 km at 1 GHz', () => {
    const distanceM = 1000;
    const frequencyHz = 1e9;
    // Expected FSPL = 20*log10(1000) + 20*log10(1e9) + 20*log10(4*PI/c)
    // = 60 + 180 - 147.55 ≈ 92.45 dB
    const result = calculateFSPL(distanceM, frequencyHz);
    expect(result).toBeCloseTo(92.45, 1);
  });

  it('should calculate FSPL correctly for 100 m at 2.4 GHz', () => {
    const distanceM = 100;
    const frequencyHz = 2.4e9;
    // Expected: 20*log10(100) + 20*log10(2.4e9) - 147.55
    // = 40 + 187.6 - 147.55 ≈ 80.05 dB
    const result = calculateFSPL(distanceM, frequencyHz);
    expect(result).toBeCloseTo(80.05, 1);
  });

  it('should increase by ~6 dB when distance doubles', () => {
    const frequencyHz = 2.4e9;
    const fspl100m = calculateFSPL(100, frequencyHz);
    const fspl200m = calculateFSPL(200, frequencyHz);
    // Doubling distance adds 20*log10(2) ≈ 6.02 dB
    expect(fspl200m - fspl100m).toBeCloseTo(6.02, 1);
  });

  it('should increase by ~6 dB when frequency doubles', () => {
    const distanceM = 100;
    const fspl1GHz = calculateFSPL(distanceM, 1e9);
    const fspl2GHz = calculateFSPL(distanceM, 2e9);
    // Doubling frequency adds 20*log10(2) ≈ 6.02 dB
    expect(fspl2GHz - fspl1GHz).toBeCloseTo(6.02, 1);
  });

  it('should return 0 for zero distance', () => {
    expect(calculateFSPL(0, 1e9)).toBe(0);
  });

  it('should return 0 for zero frequency', () => {
    expect(calculateFSPL(100, 0)).toBe(0);
  });

  it('should return 0 for negative distance', () => {
    expect(calculateFSPL(-100, 1e9)).toBe(0);
  });

  it('should return 0 for negative frequency', () => {
    expect(calculateFSPL(100, -1e9)).toBe(0);
  });

  it('should handle very short distances', () => {
    const result = calculateFSPL(1, 2.4e9);
    // At 1 m and 2.4 GHz: 0 + 187.6 - 147.55 ≈ 40 dB
    expect(result).toBeCloseTo(40.05, 1);
  });

  it('should handle very long distances', () => {
    const result = calculateFSPL(100000, 1e9); // 100 km at 1 GHz
    // At 100 km and 1 GHz: 100 + 180 - 147.55 ≈ 132.45 dB
    expect(result).toBeCloseTo(132.45, 1);
  });
});

describe('calculateRange', () => {
  it('should calculate range correctly for typical link budget', () => {
    const frequencyHz = 2.4e9;
    const txPowerDbm = 20; // 100 mW
    const rxSensitivityDbm = -80;
    // Max path loss = 20 - (-80) = 100 dB
    const result = calculateRange(frequencyHz, txPowerDbm, rxSensitivityDbm);
    // Should be in the ballpark of 1 km for these parameters
    expect(result).toBeGreaterThan(100);
    expect(result).toBeLessThan(10000);
  });

  it('should return larger range with higher TX power', () => {
    const frequencyHz = 2.4e9;
    const rxSensitivityDbm = -80;
    const range10dBm = calculateRange(frequencyHz, 10, rxSensitivityDbm);
    const range20dBm = calculateRange(frequencyHz, 20, rxSensitivityDbm);
    // +10 dB TX power should roughly triple the range (10^(10/20) ≈ 3.16)
    expect(range20dBm / range10dBm).toBeCloseTo(3.16, 1);
  });

  it('should return larger range with better RX sensitivity', () => {
    const frequencyHz = 2.4e9;
    const txPowerDbm = 20;
    const range80dBm = calculateRange(frequencyHz, txPowerDbm, -80);
    const range90dBm = calculateRange(frequencyHz, txPowerDbm, -90);
    // +10 dB sensitivity improvement should roughly triple the range
    expect(range90dBm / range80dBm).toBeCloseTo(3.16, 1);
  });

  it('should return smaller range at higher frequency', () => {
    const txPowerDbm = 20;
    const rxSensitivityDbm = -80;
    const range2_4GHz = calculateRange(2.4e9, txPowerDbm, rxSensitivityDbm);
    const range5GHz = calculateRange(5e9, txPowerDbm, rxSensitivityDbm);
    // Higher frequency = shorter range
    expect(range5GHz).toBeLessThan(range2_4GHz);
  });

  it('should return 0 for zero frequency', () => {
    expect(calculateRange(0, 20, -80)).toBe(0);
  });

  it('should return 0 for negative frequency', () => {
    expect(calculateRange(-1e9, 20, -80)).toBe(0);
  });

  it('should handle edge case where TX power equals RX sensitivity', () => {
    const frequencyHz = 2.4e9;
    const result = calculateRange(frequencyHz, -80, -80);
    // Path loss = 0 dB, so range should be very small (around 1 cm)
    expect(result).toBeLessThan(0.01);
  });

  it('should be consistent with calculateFSPL', () => {
    const frequencyHz = 2.4e9;
    const txPowerDbm = 20;
    const rxSensitivityDbm = -80;
    const range = calculateRange(frequencyHz, txPowerDbm, rxSensitivityDbm);
    const fspl = calculateFSPL(range, frequencyHz);
    // FSPL at calculated range should equal max allowable path loss
    const maxPathLoss = txPowerDbm - rxSensitivityDbm;
    expect(fspl).toBeCloseTo(maxPathLoss, 0);
  });
});
