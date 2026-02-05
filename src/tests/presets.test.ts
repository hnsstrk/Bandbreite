/**
 * Unit tests for src/lib/data/presets.ts
 * Testing preset definitions and data integrity
 */

import { describe, it, expect } from 'vitest';

import {
  FREQUENCY_CONVERTER_PRESETS,
  FSPL_FREQUENCY_PRESETS,
  FSPL_CHART_FREQUENCIES,
  DISTANCE_PRESETS_METERS,
  LINK_BUDGET_PRESETS,
  POWER_CHART_CATEGORY_COLORS,
  POWER_CHART_CATEGORY_LABELS,
  frequencyPresets,
  distancePresets,
  linkBudgetPresets,
  type FrequencyPreset,
  type ChartFrequency,
  type LinkBudgetPreset,
} from '$lib/data/presets';

// ============================================================================
// FREQUENCY_CONVERTER_PRESETS
// ============================================================================

describe('FREQUENCY_CONVERTER_PRESETS', () => {
  it('should be a non-empty array', () => {
    expect(FREQUENCY_CONVERTER_PRESETS.length).toBeGreaterThan(0);
  });

  it('should have label, hz, and description for each preset', () => {
    for (const preset of FREQUENCY_CONVERTER_PRESETS) {
      expect(preset.label).toBeTruthy();
      expect(preset.label.length).toBeGreaterThan(0);
      expect(typeof preset.hz).toBe('number');
      expect(preset.hz).toBeGreaterThan(0);
      expect(preset.description).toBeTruthy();
      expect(preset.description.length).toBeGreaterThan(0);
    }
  });

  it('should have finite frequency values', () => {
    for (const preset of FREQUENCY_CONVERTER_PRESETS) {
      expect(isFinite(preset.hz)).toBe(true);
    }
  });

  it('should contain a 2.4 GHz WiFi preset', () => {
    const wifi = FREQUENCY_CONVERTER_PRESETS.find(p => p.hz === 2.4e9);
    expect(wifi).toBeDefined();
    expect(wifi!.label).toBe('2.4 GHz');
  });
});

// ============================================================================
// FSPL_FREQUENCY_PRESETS
// ============================================================================

describe('FSPL_FREQUENCY_PRESETS', () => {
  it('should be a non-empty array', () => {
    expect(FSPL_FREQUENCY_PRESETS.length).toBeGreaterThan(0);
  });

  it('should have label, hz, and description for each preset', () => {
    for (const preset of FSPL_FREQUENCY_PRESETS) {
      expect(preset.label).toBeTruthy();
      expect(preset.label.length).toBeGreaterThan(0);
      expect(typeof preset.hz).toBe('number');
      expect(preset.hz).toBeGreaterThan(0);
      expect(preset.description).toBeTruthy();
      expect(preset.description.length).toBeGreaterThan(0);
    }
  });

  it('should have finite frequency values', () => {
    for (const preset of FSPL_FREQUENCY_PRESETS) {
      expect(isFinite(preset.hz)).toBe(true);
    }
  });

  it('should have more presets than the converter (broader range)', () => {
    expect(FSPL_FREQUENCY_PRESETS.length).toBeGreaterThan(FREQUENCY_CONVERTER_PRESETS.length);
  });

  it('should include IoT frequencies (433, 868, 915 MHz)', () => {
    const frequencies = FSPL_FREQUENCY_PRESETS.map(p => p.hz);
    expect(frequencies).toContain(433e6);
    expect(frequencies).toContain(868e6);
    expect(frequencies).toContain(915e6);
  });

  it('should include mmWave frequencies (28, 60, 77 GHz)', () => {
    const frequencies = FSPL_FREQUENCY_PRESETS.map(p => p.hz);
    expect(frequencies).toContain(28e9);
    expect(frequencies).toContain(60e9);
    expect(frequencies).toContain(77e9);
  });
});

// ============================================================================
// FSPL_CHART_FREQUENCIES
// ============================================================================

describe('FSPL_CHART_FREQUENCIES', () => {
  it('should be a non-empty array', () => {
    expect(FSPL_CHART_FREQUENCIES.length).toBeGreaterThan(0);
  });

  it('should have hz, label, and color for each entry', () => {
    for (const freq of FSPL_CHART_FREQUENCIES) {
      expect(typeof freq.hz).toBe('number');
      expect(freq.hz).toBeGreaterThan(0);
      expect(freq.label).toBeTruthy();
      expect(freq.label.length).toBeGreaterThan(0);
      expect(freq.color).toBeTruthy();
    }
  });

  it('should have finite frequency values', () => {
    for (const freq of FSPL_CHART_FREQUENCIES) {
      expect(isFinite(freq.hz)).toBe(true);
    }
  });

  it('should have valid CSS hex color strings', () => {
    for (const freq of FSPL_CHART_FREQUENCIES) {
      expect(freq.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('should have unique colors for visual distinguishability', () => {
    const colors = FSPL_CHART_FREQUENCIES.map(f => f.color);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(colors.length);
  });

  it('should have unique frequency values', () => {
    const frequencies = FSPL_CHART_FREQUENCIES.map(f => f.hz);
    const uniqueFreqs = new Set(frequencies);
    expect(uniqueFreqs.size).toBe(frequencies.length);
  });
});

// ============================================================================
// DISTANCE_PRESETS_METERS
// ============================================================================

describe('DISTANCE_PRESETS_METERS', () => {
  it('should be a non-empty array', () => {
    expect(DISTANCE_PRESETS_METERS.length).toBeGreaterThan(0);
  });

  it('should contain only positive numbers', () => {
    for (const distance of DISTANCE_PRESETS_METERS) {
      expect(distance).toBeGreaterThan(0);
    }
  });

  it('should be sorted in ascending order', () => {
    for (let i = 0; i < DISTANCE_PRESETS_METERS.length - 1; i++) {
      expect(DISTANCE_PRESETS_METERS[i]).toBeLessThan(DISTANCE_PRESETS_METERS[i + 1]);
    }
  });

  it('should contain expected values', () => {
    const values = [...DISTANCE_PRESETS_METERS];
    expect(values).toContain(10);
    expect(values).toContain(100);
    expect(values).toContain(1000);
    expect(values).toContain(10000);
  });

  it('should have unique values', () => {
    const uniqueValues = new Set(DISTANCE_PRESETS_METERS);
    expect(uniqueValues.size).toBe(DISTANCE_PRESETS_METERS.length);
  });
});

// ============================================================================
// LINK_BUDGET_PRESETS
// ============================================================================

describe('LINK_BUDGET_PRESETS', () => {
  it('should be a non-empty array', () => {
    expect(LINK_BUDGET_PRESETS.length).toBeGreaterThan(0);
  });

  it('should have a non-empty name for each preset', () => {
    for (const preset of LINK_BUDGET_PRESETS) {
      expect(preset.name).toBeTruthy();
      expect(preset.name.length).toBeGreaterThan(0);
    }
  });

  it('should have numeric values for all RF parameters', () => {
    for (const preset of LINK_BUDGET_PRESETS) {
      expect(typeof preset.txPower).toBe('number');
      expect(typeof preset.txGain).toBe('number');
      expect(typeof preset.txLoss).toBe('number');
      expect(typeof preset.distance).toBe('number');
      expect(typeof preset.freq).toBe('number');
      expect(typeof preset.rxGain).toBe('number');
      expect(typeof preset.rxLoss).toBe('number');
      expect(typeof preset.rxSens).toBe('number');
      expect(typeof preset.fade).toBe('number');
    }
  });

  it('should have positive distance for each preset', () => {
    for (const preset of LINK_BUDGET_PRESETS) {
      expect(preset.distance).toBeGreaterThan(0);
    }
  });

  it('should have positive frequency for each preset', () => {
    for (const preset of LINK_BUDGET_PRESETS) {
      expect(preset.freq).toBeGreaterThan(0);
    }
  });

  it('should have valid distance units (m, km, or mi)', () => {
    const validUnits = ['m', 'km', 'mi'];
    for (const preset of LINK_BUDGET_PRESETS) {
      expect(validUnits).toContain(preset.distUnit);
    }
  });

  it('should have valid frequency units (MHz or GHz)', () => {
    const validUnits = ['MHz', 'GHz'];
    for (const preset of LINK_BUDGET_PRESETS) {
      expect(validUnits).toContain(preset.freqUnit);
    }
  });

  it('should have non-negative loss values', () => {
    for (const preset of LINK_BUDGET_PRESETS) {
      expect(preset.txLoss).toBeGreaterThanOrEqual(0);
      expect(preset.rxLoss).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have non-negative gain values', () => {
    for (const preset of LINK_BUDGET_PRESETS) {
      expect(preset.txGain).toBeGreaterThanOrEqual(0);
      expect(preset.rxGain).toBeGreaterThanOrEqual(0);
    }
  });

  it('should have negative RX sensitivity (dBm) for all presets', () => {
    for (const preset of LINK_BUDGET_PRESETS) {
      expect(preset.rxSens).toBeLessThan(0);
    }
  });

  it('should have positive fading margin', () => {
    for (const preset of LINK_BUDGET_PRESETS) {
      expect(preset.fade).toBeGreaterThan(0);
    }
  });

  it('should contain a WLAN Indoor preset', () => {
    const wlan = LINK_BUDGET_PRESETS.find(p => p.name === 'WLAN Indoor');
    expect(wlan).toBeDefined();
  });

  it('should contain a LoRa Outdoor preset', () => {
    const lora = LINK_BUDGET_PRESETS.find(p => p.name === 'LoRa Outdoor');
    expect(lora).toBeDefined();
  });

  it('should have unique names', () => {
    const names = LINK_BUDGET_PRESETS.map(p => p.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});

// ============================================================================
// POWER_CHART_CATEGORY_COLORS
// ============================================================================

describe('POWER_CHART_CATEGORY_COLORS', () => {
  it('should have valid hex color values', () => {
    for (const [, color] of Object.entries(POWER_CHART_CATEGORY_COLORS)) {
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it('should have entries for known categories', () => {
    expect(POWER_CHART_CATEGORY_COLORS.communication).toBeDefined();
    expect(POWER_CHART_CATEGORY_COLORS.radar).toBeDefined();
    expect(POWER_CHART_CATEGORY_COLORS.satellite).toBeDefined();
    expect(POWER_CHART_CATEGORY_COLORS.iot).toBeDefined();
    expect(POWER_CHART_CATEGORY_COLORS.industrial).toBeDefined();
  });
});

// ============================================================================
// POWER_CHART_CATEGORY_LABELS
// ============================================================================

describe('POWER_CHART_CATEGORY_LABELS', () => {
  it('should have non-empty string labels', () => {
    for (const [, label] of Object.entries(POWER_CHART_CATEGORY_LABELS)) {
      expect(label).toBeTruthy();
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it('should have matching keys with POWER_CHART_CATEGORY_COLORS', () => {
    const colorKeys = Object.keys(POWER_CHART_CATEGORY_COLORS).sort();
    const labelKeys = Object.keys(POWER_CHART_CATEGORY_LABELS).sort();
    expect(labelKeys).toEqual(colorKeys);
  });
});

// ============================================================================
// Grouped exports
// ============================================================================

describe('frequencyPresets (grouped export)', () => {
  it('should reference FREQUENCY_CONVERTER_PRESETS as converter', () => {
    expect(frequencyPresets.converter).toBe(FREQUENCY_CONVERTER_PRESETS);
  });

  it('should reference FSPL_FREQUENCY_PRESETS as fspl', () => {
    expect(frequencyPresets.fspl).toBe(FSPL_FREQUENCY_PRESETS);
  });

  it('should reference FSPL_CHART_FREQUENCIES as fsplChart', () => {
    expect(frequencyPresets.fsplChart).toBe(FSPL_CHART_FREQUENCIES);
  });
});

describe('distancePresets (grouped export)', () => {
  it('should reference DISTANCE_PRESETS_METERS as meters', () => {
    expect(distancePresets.meters).toBe(DISTANCE_PRESETS_METERS);
  });
});

describe('linkBudgetPresets (grouped export)', () => {
  it('should reference LINK_BUDGET_PRESETS', () => {
    expect(linkBudgetPresets).toBe(LINK_BUDGET_PRESETS);
  });
});
