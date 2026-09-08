/**
 * Unit tests for src/lib/utils/calculations.ts
 * Testing FSPL, range, and wavelength calculations
 */

import { describe, it, expect, vi } from 'vitest';

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

// ============================================================================
// Referenzwert-Tests (Bericht 03, Abschnitt 4.1 / 4.5)
// ============================================================================

import {
  getFsplConstant,
  calculateSkinDepth,
  calculateLossTangent,
  calculateSkinDepthWithValidity,
  calculateFresnelRadius,
  calculateShannonCapacity,
  calculateSpectralEfficiency,
  calculateThermalNoiseDbm,
  snrDbToLinear,
  FRESNEL_CLEARANCE_FRACTION
} from '$lib/utils/calculations';

describe('Wellenlänge – Referenzwerte', () => {
  it('1 GHz → 0,299792458 m; 2,4 GHz → 0,12491352 m; 77 GHz → 3,8934 mm', () => {
    expect(frequencyToWavelength(1e9)).toBeCloseTo(0.299792458, 9);
    expect(frequencyToWavelength(2.4e9)).toBeCloseTo(0.12491352, 8);
    expect(frequencyToWavelength(77e9)).toBeCloseTo(0.0038934, 6);
  });
  it('0 / −1 → 0; f = c/λ: 1 m → 299 792 458 Hz, 0,125 m → 2 398 339 664 Hz', () => {
    expect(frequencyToWavelength(0)).toBe(0);
    expect(frequencyToWavelength(-1)).toBe(0);
    expect(wavelengthToFrequency(1)).toBeCloseTo(299792458, 0);
    expect(wavelengthToFrequency(0.125)).toBeCloseTo(2398339664, 0);
  });
  it('explizites c wird verwendet (eine Implementierung von λ = c/f)', () => {
    expect(frequencyToWavelength(100e6, 3e8)).toBeCloseTo(3, 12);
    expect(wavelengthToFrequency(3, 3e8)).toBeCloseTo(100e6, 6);
  });
});

describe('FSPL – Referenzwerte (±0,005 dB)', () => {
  const cases: [number, number, number][] = [
    [1000, 1e9, 92.448],
    [100, 2.4e9, 80.052],
    [1, 2.4e9, 40.052],
    [100e3, 1e9, 132.448],
    [100, 5e9, 86.427],
    [100, 28e9, 101.391],
    [100, 77e9, 110.178],
    [36000e3, 12e9, 205.157],
    [5000, 868e6, 105.198],
    [1000, 100e6, 72.448]
  ];
  it.each(cases)('d = %s m, f = %s Hz → %s dB', (d, f, ref) => {
    expect(Math.abs(calculateFSPL(d, f) - ref)).toBeLessThan(0.005);
  });
  it('FSPL-Konstante −147,5522 dB', () => {
    expect(getFsplConstant()).toBeCloseTo(-147.5522, 4);
  });
});

describe('Reichweite – Referenzwerte (±0,1 %)', () => {
  const cases: [number, number, number, number][] = [
    [2.4e9, 20, -90, 3143.4],
    [2.4e9, 20, -80, 994.0],
    [868e6, 14, -137, 975.2e3],
    [100e6, 20, -90, 75.44e3],
    [5e9, 20, -90, 1508.8]
  ];
  it.each(cases)('f = %s Hz, %s dBm, %s dBm → %s m', (f, tx, rx, ref) => {
    expect(calculateRange(f, tx, rx) / ref).toBeCloseTo(1, 2);
  });
  it('FSPL = 0 dB → d = λ/(4π) ≈ 9,94 mm bei 2,4 GHz', () => {
    // Hinweis: Bericht 03 nennt 3,94 mm – korrekt ist λ/(4π) = 0,1249 m / 12,566 = 9,94 mm
    expect(calculateRange(2.4e9, -80, -80)).toBeCloseTo(0.00994, 4);
  });
});

describe('calculateSkinDepth – Referenzwerte', () => {
  const cases: [number, number, number, number][] = [
    // f, σ, δ [m], Toleranz
    [3, 4, 145.3, 0.1],
    [30, 4, 45.94, 0.05],
    [76, 4, 28.87, 0.05],
    [10e3, 4, 2.516, 0.005],
    [77.5e3, 4, 0.904, 0.005],
    [1e9, 5.96e7, 2.062e-6, 5e-9],
    [50, 5.96e7, 9.22e-3, 1e-5],
    [10e9, 5.96e7, 0.652e-6, 2e-9],
    [1e6, 3.5e7, 85.1e-6, 1e-7]
  ];
  it.each(cases)('f = %s Hz, σ = %s S/m → δ = %s m', (f, sigma, ref, tol) => {
    expect(Math.abs(calculateSkinDepth(f, sigma) - ref)).toBeLessThan(tol);
  });
  it('Standard σ = Seewasser (4 S/m); 0 bei f ≤ 0 oder σ ≤ 0', () => {
    expect(calculateSkinDepth(10e3)).toBeCloseTo(2.516, 2);
    expect(calculateSkinDepth(0, 4)).toBe(0);
    expect(calculateSkinDepth(100, 0)).toBe(0);
  });
});

describe('Verlusttangens und Gültigkeit der Skin-Tiefe (F-16)', () => {
  it('trockene Erde (σ = 10⁻³ S/m, εᵣ = 5): σ = ωε bei ≈ 3,6 MHz', () => {
    expect(calculateLossTangent(3.6e6, 1e-3, 5)).toBeCloseTo(1, 1);
    expect(calculateLossTangent(1e9, 1e-3, 5)).toBeCloseTo(0.0036, 3);
  });
  it('Kupfer bei 1 GHz ist guter Leiter, trockene Erde bei 1 GHz nicht', () => {
    expect(calculateSkinDepthWithValidity(1e9, 5.96e7, 1).isGoodConductor).toBe(true);
    expect(calculateSkinDepthWithValidity(1e9, 1e-3, 5).isGoodConductor).toBe(false);
    expect(calculateSkinDepthWithValidity(10e3, 4, 81).isGoodConductor).toBe(true);
  });
  it('ungültige Eingaben → 0 / false', () => {
    expect(calculateLossTangent(0, 4)).toBe(0);
    expect(calculateSkinDepthWithValidity(0, 4).isGoodConductor).toBe(false);
  });
});

describe('calculateFresnelRadius – Referenzwerte', () => {
  const lambda = (fHz: number) => frequencyToWavelength(fHz);
  it('5,8 GHz, 5/5 km → r₁ = 11,367 m, r₂ = 16,076 m, 60 % = 6,821 m', () => {
    const r1 = calculateFresnelRadius(lambda(5.8e9), 5000, 5000, 1);
    expect(r1).toBeCloseTo(11.3675, 3);
    expect(calculateFresnelRadius(lambda(5.8e9), 5000, 5000, 2)).toBeCloseTo(r1 * Math.SQRT2, 9);
    expect(calculateFresnelRadius(lambda(5.8e9), 5000, 5000, 2)).toBeCloseTo(16.076, 2);
    expect(r1 * FRESNEL_CLEARANCE_FRACTION).toBeCloseTo(6.8205, 3);
  });
  it('5,8 GHz 2/8 km → 9,094 m; 2,4 GHz 1/1 km → 7,903 m; 900 MHz 10/10 km → 40,81 m', () => {
    expect(calculateFresnelRadius(lambda(5.8e9), 2000, 8000)).toBeCloseTo(9.094, 2);
    expect(calculateFresnelRadius(lambda(2.4e9), 1000, 1000)).toBeCloseTo(7.903, 2);
    expect(calculateFresnelRadius(lambda(900e6), 10000, 10000)).toBeCloseTo(40.81, 2);
  });
  it('0 bei ungültigen Eingaben', () => {
    expect(calculateFresnelRadius(0, 1, 1)).toBe(0);
    expect(calculateFresnelRadius(0.1, 0, 1)).toBe(0);
    expect(calculateFresnelRadius(0.1, 1, 1, 0)).toBe(0);
  });
});

describe('Shannon-Hartley – Referenzwerte', () => {
  it('20 MHz/20 dB → 133,16 Mbit/s; 40 MHz/25 dB → 332,38; 100 MHz/20 dB → 665,82', () => {
    expect(calculateShannonCapacity(20e6, 20) / 1e6).toBeCloseTo(133.16, 1);
    expect(calculateShannonCapacity(40e6, 25) / 1e6).toBeCloseTo(332.38, 1);
    expect(calculateShannonCapacity(100e6, 20) / 1e6).toBeCloseTo(665.82, 1);
  });
  it('1 MHz/0 dB → exakt 1 Mbit/s; 20 MHz/−10 dB → 2,750 Mbit/s', () => {
    expect(calculateShannonCapacity(1e6, 0)).toBeCloseTo(1e6, 6);
    expect(calculateShannonCapacity(20e6, -10) / 1e6).toBeCloseTo(2.75, 2);
  });
  it('spektrale Effizienz 20 dB → 6,658; 30 dB → 9,967 bit/s/Hz', () => {
    expect(calculateSpectralEfficiency(20)).toBeCloseTo(6.658, 3);
    expect(calculateSpectralEfficiency(30)).toBeCloseTo(9.967, 3);
    expect(snrDbToLinear(10)).toBeCloseTo(10, 9);
  });
  it('0 bei B ≤ 0', () => {
    expect(calculateShannonCapacity(0, 20)).toBe(0);
  });
});

describe('Thermisches Rauschen', () => {
  it('290 K: 1 Hz → −173,98 dBm; 1 MHz → −113,98 dBm', () => {
    expect(calculateThermalNoiseDbm(1)).toBeCloseTo(-173.98, 2);
    expect(calculateThermalNoiseDbm(1e6)).toBeCloseTo(-113.98, 2);
  });
  it('−Infinity bei B ≤ 0', () => {
    expect(calculateThermalNoiseDbm(0)).toBe(-Infinity);
  });
});
