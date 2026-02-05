/**
 * Unit tests for src/lib/data/units.ts
 * Testing unit definitions, helper functions, and data integrity
 */

import { describe, it, expect } from 'vitest';

import {
  FREQUENCY_UNITS,
  WAVELENGTH_UNITS,
  POWER_UNITS_WATT,
  POWER_UNITS_DB,
  DISTANCE_UNITS,
  ATTENUATION_UNITS,
  DEFAULT_FREQUENCY_UNIT,
  DEFAULT_WAVELENGTH_UNIT,
  DEFAULT_POWER_UNIT_WATT,
  DEFAULT_POWER_UNIT_DB,
  DEFAULT_DISTANCE_UNIT,
  DEFAULT_ATTENUATION_UNIT,
  getUnitById,
  getDistanceFactor,
  type UnitDefinition,
  type PowerUnitWatt,
  type PowerUnitDb,
  type DistanceUnit,
  type AttenuationUnit,
} from '$lib/data/units';

// ============================================================================
// getUnitById()
// ============================================================================

describe('getUnitById', () => {
  it('should find an existing frequency unit by ID', () => {
    const result = getUnitById(FREQUENCY_UNITS, 'MHz');
    expect(result).toBeDefined();
    expect(result!.id).toBe('MHz');
    expect(result!.label).toBe('Megahertz');
    expect(result!.symbol).toBe('MHz');
  });

  it('should find an existing distance unit by ID', () => {
    const result = getUnitById(DISTANCE_UNITS, 'km');
    expect(result).toBeDefined();
    expect(result!.id).toBe('km');
    expect(result!.label).toBe('Kilometer');
  });

  it('should find an existing power watt unit by ID', () => {
    const result = getUnitById(POWER_UNITS_WATT, 'mw');
    expect(result).toBeDefined();
    expect(result!.id).toBe('mw');
  });

  it('should find an existing power dB unit by ID', () => {
    const result = getUnitById(POWER_UNITS_DB, 'dbm');
    expect(result).toBeDefined();
    expect(result!.id).toBe('dbm');
  });

  it('should return undefined for an unknown ID', () => {
    const result = getUnitById(FREQUENCY_UNITS, 'unknown');
    expect(result).toBeUndefined();
  });

  it('should return undefined for an empty ID', () => {
    const result = getUnitById(FREQUENCY_UNITS, '');
    expect(result).toBeUndefined();
  });

  it('should return undefined for an empty array', () => {
    const result = getUnitById([] as UnitDefinition[], 'MHz');
    expect(result).toBeUndefined();
  });

  it('should be case-sensitive', () => {
    const result = getUnitById(FREQUENCY_UNITS, 'mhz');
    expect(result).toBeUndefined();
  });
});

// ============================================================================
// getDistanceFactor()
// ============================================================================

describe('getDistanceFactor', () => {
  it('should return 1 for meters', () => {
    expect(getDistanceFactor('m')).toBe(1);
  });

  it('should return 1000 for kilometers', () => {
    expect(getDistanceFactor('km')).toBe(1000);
  });

  it('should return 1609.344 for miles', () => {
    expect(getDistanceFactor('mi')).toBe(1609.344);
  });

  it('should return 0.3048 for feet', () => {
    expect(getDistanceFactor('ft')).toBe(0.3048);
  });

  it('should return 0.9144 for yards', () => {
    expect(getDistanceFactor('yd')).toBe(0.9144);
  });

  it('should return 1852 for nautical miles', () => {
    expect(getDistanceFactor('nmi')).toBe(1852);
  });

  it('should return 1 for unknown unit ID (fallback)', () => {
    expect(getDistanceFactor('unknown')).toBe(1);
  });

  it('should return 1 for empty string (fallback)', () => {
    expect(getDistanceFactor('')).toBe(1);
  });
});

// ============================================================================
// FREQUENCY_UNITS
// ============================================================================

describe('FREQUENCY_UNITS', () => {
  it('should contain exactly 5 units', () => {
    expect(FREQUENCY_UNITS).toHaveLength(5);
  });

  it('should contain Hz, kHz, MHz, GHz, THz in order', () => {
    const ids = FREQUENCY_UNITS.map(u => u.id);
    expect(ids).toEqual(['Hz', 'kHz', 'MHz', 'GHz', 'THz']);
  });

  it('should have non-empty labels for all units', () => {
    for (const unit of FREQUENCY_UNITS) {
      expect(unit.label).toBeTruthy();
      expect(unit.label.length).toBeGreaterThan(0);
    }
  });

  it('should have non-empty symbols for all units', () => {
    for (const unit of FREQUENCY_UNITS) {
      expect(unit.symbol).toBeTruthy();
      expect(unit.symbol.length).toBeGreaterThan(0);
    }
  });

  it('should have no duplicate IDs', () => {
    const ids = FREQUENCY_UNITS.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ============================================================================
// WAVELENGTH_UNITS
// ============================================================================

describe('WAVELENGTH_UNITS', () => {
  it('should contain exactly 6 units', () => {
    expect(WAVELENGTH_UNITS).toHaveLength(6);
  });

  it('should contain km, m, cm, mm, \u03bcm, nm in order', () => {
    const ids = WAVELENGTH_UNITS.map(u => u.id);
    expect(ids).toEqual(['km', 'm', 'cm', 'mm', '\u03bcm', 'nm']);
  });

  it('should have non-empty labels for all units', () => {
    for (const unit of WAVELENGTH_UNITS) {
      expect(unit.label).toBeTruthy();
      expect(unit.label.length).toBeGreaterThan(0);
    }
  });

  it('should have non-empty symbols for all units', () => {
    for (const unit of WAVELENGTH_UNITS) {
      expect(unit.symbol).toBeTruthy();
      expect(unit.symbol.length).toBeGreaterThan(0);
    }
  });

  it('should have no duplicate IDs', () => {
    const ids = WAVELENGTH_UNITS.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ============================================================================
// DISTANCE_UNITS
// ============================================================================

describe('DISTANCE_UNITS', () => {
  it('should be a non-empty array', () => {
    expect(DISTANCE_UNITS.length).toBeGreaterThan(0);
  });

  it('should contain m, km, mi, ft, yd, nmi', () => {
    const ids = DISTANCE_UNITS.map(u => u.id);
    expect(ids).toContain('m');
    expect(ids).toContain('km');
    expect(ids).toContain('mi');
    expect(ids).toContain('ft');
    expect(ids).toContain('yd');
    expect(ids).toContain('nmi');
  });

  it('should have id, label, symbol, and positive factor for each unit', () => {
    for (const unit of DISTANCE_UNITS) {
      expect(unit.id).toBeTruthy();
      expect(unit.label).toBeTruthy();
      expect(unit.symbol).toBeTruthy();
      expect(unit.factor).toBeGreaterThan(0);
    }
  });

  it('should have meter with factor 1 as the base unit', () => {
    const meter = DISTANCE_UNITS.find(u => u.id === 'm');
    expect(meter).toBeDefined();
    expect(meter!.factor).toBe(1);
  });

  it('should have no duplicate IDs', () => {
    const ids = DISTANCE_UNITS.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have nmi > mi > km > m by factor', () => {
    const nmi = getUnitById(DISTANCE_UNITS, 'nmi');
    const mi = getUnitById(DISTANCE_UNITS, 'mi');
    const km = getUnitById(DISTANCE_UNITS, 'km');
    const m = getUnitById(DISTANCE_UNITS, 'm');
    expect(nmi!.factor).toBeGreaterThan(mi!.factor);
    expect(mi!.factor).toBeGreaterThan(km!.factor);
    expect(km!.factor).toBeGreaterThan(m!.factor);
  });
});

// ============================================================================
// POWER_UNITS_WATT
// ============================================================================

describe('POWER_UNITS_WATT', () => {
  it('should be a non-empty array', () => {
    expect(POWER_UNITS_WATT.length).toBeGreaterThan(0);
  });

  it('should have id, label, symbol, and positive factor for each unit', () => {
    for (const unit of POWER_UNITS_WATT) {
      expect(unit.id).toBeTruthy();
      expect(unit.label).toBeTruthy();
      expect(unit.symbol).toBeTruthy();
      expect(unit.factor).toBeGreaterThan(0);
    }
  });

  it('should contain uw, mw, w, kw', () => {
    const ids = POWER_UNITS_WATT.map(u => u.id);
    expect(ids).toContain('uw');
    expect(ids).toContain('mw');
    expect(ids).toContain('w');
    expect(ids).toContain('kw');
  });

  it('should have Watt with factor 1 as the base unit', () => {
    const watt = POWER_UNITS_WATT.find(u => u.id === 'w');
    expect(watt).toBeDefined();
    expect(watt!.factor).toBe(1);
  });

  it('should have factors in ascending order from uw to kw', () => {
    const uw = getUnitById(POWER_UNITS_WATT, 'uw') as PowerUnitWatt;
    const mw = getUnitById(POWER_UNITS_WATT, 'mw') as PowerUnitWatt;
    const w = getUnitById(POWER_UNITS_WATT, 'w') as PowerUnitWatt;
    const kw = getUnitById(POWER_UNITS_WATT, 'kw') as PowerUnitWatt;
    expect(uw.factor).toBeLessThan(mw.factor);
    expect(mw.factor).toBeLessThan(w.factor);
    expect(w.factor).toBeLessThan(kw.factor);
  });

  it('should have no duplicate IDs', () => {
    const ids = POWER_UNITS_WATT.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ============================================================================
// POWER_UNITS_DB
// ============================================================================

describe('POWER_UNITS_DB', () => {
  it('should be a non-empty array', () => {
    expect(POWER_UNITS_DB.length).toBeGreaterThan(0);
  });

  it('should have id, label, symbol, and positive reference for each unit', () => {
    for (const unit of POWER_UNITS_DB) {
      expect(unit.id).toBeTruthy();
      expect(unit.label).toBeTruthy();
      expect(unit.symbol).toBeTruthy();
      expect(unit.reference).toBeGreaterThan(0);
    }
  });

  it('should contain dbm and dbw', () => {
    const ids = POWER_UNITS_DB.map(u => u.id);
    expect(ids).toContain('dbm');
    expect(ids).toContain('dbw');
  });

  it('should have dBm reference of 1 mW (0.001 W)', () => {
    const dbm = POWER_UNITS_DB.find(u => u.id === 'dbm') as PowerUnitDb;
    expect(dbm).toBeDefined();
    expect(dbm.reference).toBe(1e-3);
  });

  it('should have dBW reference of 1 W', () => {
    const dbw = POWER_UNITS_DB.find(u => u.id === 'dbw') as PowerUnitDb;
    expect(dbw).toBeDefined();
    expect(dbw.reference).toBe(1);
  });

  it('should have no duplicate IDs', () => {
    const ids = POWER_UNITS_DB.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ============================================================================
// ATTENUATION_UNITS
// ============================================================================

describe('ATTENUATION_UNITS', () => {
  it('should be a non-empty array', () => {
    expect(ATTENUATION_UNITS.length).toBeGreaterThan(0);
  });

  it('should have id, label, symbol, and boolean perKm for each unit', () => {
    for (const unit of ATTENUATION_UNITS) {
      expect(unit.id).toBeTruthy();
      expect(unit.label).toBeTruthy();
      expect(unit.symbol).toBeTruthy();
      expect(typeof unit.perKm).toBe('boolean');
    }
  });

  it('should contain dB/km and dB/m', () => {
    const ids = ATTENUATION_UNITS.map(u => u.id);
    expect(ids).toContain('dB/km');
    expect(ids).toContain('dB/m');
  });

  it('should have dB/km with perKm = true', () => {
    const dbKm = ATTENUATION_UNITS.find(u => u.id === 'dB/km') as AttenuationUnit;
    expect(dbKm).toBeDefined();
    expect(dbKm.perKm).toBe(true);
  });

  it('should have dB/m with perKm = false', () => {
    const dbM = ATTENUATION_UNITS.find(u => u.id === 'dB/m') as AttenuationUnit;
    expect(dbM).toBeDefined();
    expect(dbM.perKm).toBe(false);
  });

  it('should have no duplicate IDs', () => {
    const ids = ATTENUATION_UNITS.map(u => u.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ============================================================================
// Default values
// ============================================================================

describe('Default unit constants', () => {
  it('should have valid default frequency unit', () => {
    expect(DEFAULT_FREQUENCY_UNIT).toBe('MHz');
    const unit = getUnitById(FREQUENCY_UNITS, DEFAULT_FREQUENCY_UNIT);
    expect(unit).toBeDefined();
  });

  it('should have valid default wavelength unit', () => {
    expect(DEFAULT_WAVELENGTH_UNIT).toBe('m');
    const unit = getUnitById(WAVELENGTH_UNITS, DEFAULT_WAVELENGTH_UNIT);
    expect(unit).toBeDefined();
  });

  it('should have valid default power watt unit', () => {
    expect(DEFAULT_POWER_UNIT_WATT).toBe('w');
    const unit = getUnitById(POWER_UNITS_WATT, DEFAULT_POWER_UNIT_WATT);
    expect(unit).toBeDefined();
  });

  it('should have valid default power dB unit', () => {
    expect(DEFAULT_POWER_UNIT_DB).toBe('dbm');
    const unit = getUnitById(POWER_UNITS_DB, DEFAULT_POWER_UNIT_DB);
    expect(unit).toBeDefined();
  });

  it('should have valid default distance unit', () => {
    expect(DEFAULT_DISTANCE_UNIT).toBe('m');
    const unit = getUnitById(DISTANCE_UNITS, DEFAULT_DISTANCE_UNIT);
    expect(unit).toBeDefined();
  });

  it('should have valid default attenuation unit', () => {
    expect(DEFAULT_ATTENUATION_UNIT).toBe('dB/km');
    const unit = getUnitById(ATTENUATION_UNITS, DEFAULT_ATTENUATION_UNIT);
    expect(unit).toBeDefined();
  });
});
