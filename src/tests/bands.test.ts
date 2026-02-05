/**
 * Unit tests for src/lib/data/bands.ts
 * Testing frequency band definitions and lookup functions
 */

import { describe, it, expect } from 'vitest';

import {
  IEEE_BANDS,
  NATO_BANDS,
  CIVILIAN_BANDS,
  ITU_BANDS,
  EM_BANDS,
  DE_ALT_BANDS,
  US_ALT_BANDS,
  EU_NATO_BANDS,
  ALL_BANDS,
  getBandsForFrequency,
  getIEEEBandsForFrequency,
  getNATOBandsForFrequency,
  getCivilianBandsForFrequency,
  formatFrequencyRange,
  type FrequencyBand,
  type ITUBand,
} from '$lib/data/bands';

// ============================================================================
// Helper to validate a band array
// ============================================================================

function validateBandArray(bands: FrequencyBand[], expectedCategory: string) {
  describe(`common structure checks for ${expectedCategory}`, () => {
    it('should be a non-empty array', () => {
      expect(bands.length).toBeGreaterThan(0);
    });

    it('should have required fields for each band', () => {
      for (const band of bands) {
        expect(band.id).toBeTruthy();
        expect(band.name).toBeTruthy();
        expect(band.nameDE).toBeTruthy();
        expect(band.color).toBeTruthy();
        expect(band.category).toBe(expectedCategory);
      }
    });

    it('should have minHz < maxHz for each band', () => {
      for (const band of bands) {
        expect(band.minHz).toBeLessThan(band.maxHz);
      }
    });

    it('should have non-negative frequencies for each band', () => {
      for (const band of bands) {
        expect(band.minHz).toBeGreaterThanOrEqual(0);
        expect(band.maxHz).toBeGreaterThan(0);
      }
    });

    it('should have finite frequencies for each band (except gamma EM)', () => {
      for (const band of bands) {
        expect(isFinite(band.minHz)).toBe(true);
        // Allow Infinity only for the gamma band in EM spectrum
        if (band.id !== 'em-gamma') {
          expect(isFinite(band.maxHz)).toBe(true);
        }
      }
    });

    it('should have no duplicate IDs', () => {
      const ids = bands.map(b => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid CSS color strings', () => {
      for (const band of bands) {
        // All colors in the data are hex colors
        expect(band.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });
  });
}

// ============================================================================
// IEEE_BANDS
// ============================================================================

describe('IEEE_BANDS', () => {
  validateBandArray(IEEE_BANDS, 'ieee');

  it('should contain known IEEE bands (HF, VHF, UHF, L, S, C, X, Ku, K, Ka, V, W)', () => {
    const names = IEEE_BANDS.map(b => b.name);
    expect(names).toContain('HF');
    expect(names).toContain('VHF');
    expect(names).toContain('UHF');
    expect(names).toContain('L');
    expect(names).toContain('S');
    expect(names).toContain('C');
    expect(names).toContain('X');
    expect(names).toContain('Ku');
    expect(names).toContain('K');
    expect(names).toContain('Ka');
    expect(names).toContain('V');
    expect(names).toContain('W');
  });

  it('should have no overlapping frequency ranges', () => {
    const sorted = [...IEEE_BANDS].sort((a, b) => a.minHz - b.minHz);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].maxHz).toBeLessThanOrEqual(sorted[i + 1].minHz);
    }
  });
});

// ============================================================================
// NATO_BANDS
// ============================================================================

describe('NATO_BANDS', () => {
  validateBandArray(NATO_BANDS, 'nato');

  it('should contain bands A through O', () => {
    const names = NATO_BANDS.map(b => b.name);
    const expectedNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
    for (const name of expectedNames) {
      expect(names).toContain(name);
    }
  });

  it('should have contiguous frequency coverage (no gaps)', () => {
    const sorted = [...NATO_BANDS].sort((a, b) => a.minHz - b.minHz);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].maxHz).toBe(sorted[i + 1].minHz);
    }
  });
});

// ============================================================================
// CIVILIAN_BANDS
// ============================================================================

describe('CIVILIAN_BANDS', () => {
  validateBandArray(CIVILIAN_BANDS, 'civilian');

  it('should contain common civilian bands', () => {
    const ids = CIVILIAN_BANDS.map(b => b.id);
    expect(ids).toContain('wifi-2g');
    expect(ids).toContain('wifi-5g');
    expect(ids).toContain('fm-radio');
    expect(ids).toContain('gps');
  });

  it('should have WiFi 2.4 GHz band in the 2.4 GHz range', () => {
    const wifi = CIVILIAN_BANDS.find(b => b.id === 'wifi-2g');
    expect(wifi).toBeDefined();
    expect(wifi!.minHz).toBe(2.4e9);
    expect(wifi!.maxHz).toBe(2.5e9);
  });
});

// ============================================================================
// ITU_BANDS
// ============================================================================

describe('ITU_BANDS', () => {
  validateBandArray(ITU_BANDS as FrequencyBand[], 'itu');

  it('should contain all ITU designations from ELF to THF', () => {
    const names = ITU_BANDS.map(b => b.name);
    expect(names).toContain('ELF');
    expect(names).toContain('SLF');
    expect(names).toContain('ULF');
    expect(names).toContain('VLF');
    expect(names).toContain('LF');
    expect(names).toContain('MF');
    expect(names).toContain('HF');
    expect(names).toContain('VHF');
    expect(names).toContain('UHF');
    expect(names).toContain('SHF');
    expect(names).toContain('EHF');
    expect(names).toContain('THF');
  });

  it('should have contiguous frequency coverage (no gaps)', () => {
    const sorted = [...ITU_BANDS].sort((a, b) => a.minHz - b.minHz);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].maxHz).toBe(sorted[i + 1].minHz);
    }
  });

  it('should have a valid propagation mode for each band', () => {
    const validModes = ['groundWave', 'skyWave', 'lineOfSight', 'mixed'];
    for (const band of ITU_BANDS) {
      expect(validModes).toContain(band.propagation);
    }
  });

  it('should have a non-empty applications array for each band', () => {
    for (const band of ITU_BANDS) {
      expect(band.applications).toBeDefined();
      expect(Array.isArray(band.applications)).toBe(true);
      expect(band.applications.length).toBeGreaterThan(0);
    }
  });

  it('should have non-empty strings in the applications array', () => {
    for (const band of ITU_BANDS) {
      for (const app of band.applications) {
        expect(app).toBeTruthy();
        expect(app.length).toBeGreaterThan(0);
      }
    }
  });
});

// ============================================================================
// EM_BANDS
// ============================================================================

describe('EM_BANDS', () => {
  it('should be a non-empty array', () => {
    expect(EM_BANDS.length).toBeGreaterThan(0);
  });

  it('should have required fields for each band', () => {
    for (const band of EM_BANDS) {
      expect(band.id).toBeTruthy();
      expect(band.name).toBeTruthy();
      expect(band.nameDE).toBeTruthy();
      expect(band.color).toBeTruthy();
      expect(band.category).toBe('em');
    }
  });

  it('should have minHz < maxHz for each band', () => {
    for (const band of EM_BANDS) {
      expect(band.minHz).toBeLessThan(band.maxHz);
    }
  });

  it('should contain major EM spectrum divisions', () => {
    const names = EM_BANDS.map(b => b.name);
    expect(names).toContain('Radio');
    expect(names).toContain('Microwave');
    expect(names).toContain('Infrared');
    expect(names).toContain('Visible');
    expect(names).toContain('Ultraviolet');
    expect(names).toContain('X-Ray');
    expect(names).toContain('Gamma');
  });

  it('should have Gamma band extending to Infinity', () => {
    const gamma = EM_BANDS.find(b => b.id === 'em-gamma');
    expect(gamma).toBeDefined();
    expect(gamma!.maxHz).toBe(Infinity);
  });

  it('should have no duplicate IDs', () => {
    const ids = EM_BANDS.map(b => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ============================================================================
// DE_ALT_BANDS
// ============================================================================

describe('DE_ALT_BANDS', () => {
  validateBandArray(DE_ALT_BANDS, 'de-alt');

  it('should have no overlapping frequency ranges', () => {
    const sorted = [...DE_ALT_BANDS].sort((a, b) => a.minHz - b.minHz);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].maxHz).toBeLessThanOrEqual(sorted[i + 1].minHz);
    }
  });
});

// ============================================================================
// US_ALT_BANDS
// ============================================================================

describe('US_ALT_BANDS', () => {
  validateBandArray(US_ALT_BANDS, 'us-alt');

  it('should have no overlapping frequency ranges', () => {
    const sorted = [...US_ALT_BANDS].sort((a, b) => a.minHz - b.minHz);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].maxHz).toBeLessThanOrEqual(sorted[i + 1].minHz);
    }
  });
});

// ============================================================================
// EU_NATO_BANDS
// ============================================================================

describe('EU_NATO_BANDS', () => {
  validateBandArray(EU_NATO_BANDS, 'eu-nato');

  it('should have contiguous frequency coverage (no gaps)', () => {
    const sorted = [...EU_NATO_BANDS].sort((a, b) => a.minHz - b.minHz);
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].maxHz).toBe(sorted[i + 1].minHz);
    }
  });
});

// ============================================================================
// ALL_BANDS
// ============================================================================

describe('ALL_BANDS', () => {
  it('should be a non-empty array', () => {
    expect(ALL_BANDS.length).toBeGreaterThan(0);
  });

  it('should contain all individual band arrays combined', () => {
    const expectedLength =
      IEEE_BANDS.length +
      NATO_BANDS.length +
      CIVILIAN_BANDS.length +
      ITU_BANDS.length +
      EM_BANDS.length +
      DE_ALT_BANDS.length +
      US_ALT_BANDS.length +
      EU_NATO_BANDS.length;
    expect(ALL_BANDS.length).toBe(expectedLength);
  });

  it('should have no duplicate IDs across all band systems', () => {
    const ids = ALL_BANDS.map(b => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ============================================================================
// getBandsForFrequency()
// ============================================================================

describe('getBandsForFrequency', () => {
  it('should return matching bands for 2.4 GHz (WiFi)', () => {
    const bands = getBandsForFrequency(2.4e9);
    expect(bands.length).toBeGreaterThan(0);
    // Should include IEEE S-band (2-4 GHz) and WiFi civilian band
    const ids = bands.map(b => b.id);
    expect(ids).toContain('s');
    expect(ids).toContain('wifi-2g');
  });

  it('should return matching bands for 100 MHz (FM Radio range)', () => {
    const bands = getBandsForFrequency(100e6);
    expect(bands.length).toBeGreaterThan(0);
    const ids = bands.map(b => b.id);
    expect(ids).toContain('fm-radio');
  });

  it('should return empty array for zero frequency', () => {
    expect(getBandsForFrequency(0)).toEqual([]);
  });

  it('should return empty array for negative frequency', () => {
    expect(getBandsForFrequency(-1e9)).toEqual([]);
  });

  it('should return empty array for Infinity', () => {
    expect(getBandsForFrequency(Infinity)).toEqual([]);
  });

  it('should return empty array for NaN', () => {
    expect(getBandsForFrequency(NaN)).toEqual([]);
  });
});

// ============================================================================
// getIEEEBandsForFrequency()
// ============================================================================

describe('getIEEEBandsForFrequency', () => {
  it('should return L-band for 1.5 GHz', () => {
    const bands = getIEEEBandsForFrequency(1.5e9);
    expect(bands.length).toBe(1);
    expect(bands[0].name).toBe('L');
  });

  it('should return X-band for 10 GHz', () => {
    const bands = getIEEEBandsForFrequency(10e9);
    expect(bands.length).toBe(1);
    expect(bands[0].name).toBe('X');
  });

  it('should return empty array for 0 Hz', () => {
    expect(getIEEEBandsForFrequency(0)).toEqual([]);
  });

  it('should return empty array for negative frequency', () => {
    expect(getIEEEBandsForFrequency(-5e9)).toEqual([]);
  });
});

// ============================================================================
// getNATOBandsForFrequency()
// ============================================================================

describe('getNATOBandsForFrequency', () => {
  it('should return D-band for 1.5 GHz', () => {
    const bands = getNATOBandsForFrequency(1.5e9);
    expect(bands.length).toBe(1);
    expect(bands[0].name).toBe('D');
  });

  it('should return empty array for 0 Hz', () => {
    expect(getNATOBandsForFrequency(0)).toEqual([]);
  });

  it('should return empty array for negative frequency', () => {
    expect(getNATOBandsForFrequency(-5e9)).toEqual([]);
  });
});

// ============================================================================
// getCivilianBandsForFrequency()
// ============================================================================

describe('getCivilianBandsForFrequency', () => {
  it('should return WiFi 2.4 GHz band for 2.45 GHz', () => {
    const bands = getCivilianBandsForFrequency(2.45e9);
    const ids = bands.map(b => b.id);
    expect(ids).toContain('wifi-2g');
  });

  it('should return GPS band for 1.575 GHz', () => {
    const bands = getCivilianBandsForFrequency(1.575e9);
    const ids = bands.map(b => b.id);
    expect(ids).toContain('gps');
  });

  it('should return empty array for 0 Hz', () => {
    expect(getCivilianBandsForFrequency(0)).toEqual([]);
  });

  it('should return empty array for negative frequency', () => {
    expect(getCivilianBandsForFrequency(-1e9)).toEqual([]);
  });
});

// ============================================================================
// formatFrequencyRange()
// ============================================================================

describe('formatFrequencyRange', () => {
  it('should format same-unit range (GHz)', () => {
    const result = formatFrequencyRange(2e9, 4e9);
    expect(result).toBe('2-4 GHz');
  });

  it('should format same-unit range (MHz)', () => {
    const result = formatFrequencyRange(30e6, 300e6);
    expect(result).toBe('30-300 MHz');
  });

  it('should format different-unit ranges', () => {
    const result = formatFrequencyRange(300e6, 3e9);
    // 300 MHz - 3 GHz (different units)
    expect(result).toContain('MHz');
    expect(result).toContain('GHz');
  });

  it('should handle Hz range', () => {
    const result = formatFrequencyRange(3, 30);
    expect(result).toBe('3-30 Hz');
  });

  it('should handle kHz range', () => {
    const result = formatFrequencyRange(3e3, 30e3);
    expect(result).toBe('3-30 kHz');
  });

  it('should handle THz range', () => {
    const result = formatFrequencyRange(300e9, 3e12);
    // 300 GHz to 3 THz -- different units
    expect(result).toContain('GHz');
    expect(result).toContain('THz');
  });
});
