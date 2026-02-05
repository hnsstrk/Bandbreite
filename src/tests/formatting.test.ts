/**
 * Unit tests for src/lib/utils/formatting.ts
 */

import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatNumberAuto,
  formatNumberLocale,
  formatPrecisionNumber,
  formatFrequency,
  formatFrequencyGHz,
  formatWavelength,
  formatDistance,
  formatDistanceWithUnit,
  formatPowerDbm,
  formatPowerDb,
  formatPowerWatts,
  formatAttenuation,
  formatAttenuationTotal,
  formatPercentage,
  formatAngle,
  formatTemperatureCelsius,
  formatTemperatureKelvin,
  formatPressure
} from '$lib/utils/formatting';

describe('formatNumber', () => {
  it('should format number with default decimals', () => {
    expect(formatNumber(123.456)).toBe('123.46');
  });

  it('should format number with specified decimals', () => {
    expect(formatNumber(123.456, 1)).toBe('123.5');
    expect(formatNumber(123.456, 3)).toBe('123.456');
  });

  it('should return fallback for null', () => {
    expect(formatNumber(null)).toBe('—');
  });

  it('should return fallback for undefined', () => {
    expect(formatNumber(undefined)).toBe('—');
  });

  it('should return fallback for NaN', () => {
    expect(formatNumber(NaN)).toBe('—');
  });

  it('should return fallback for Infinity', () => {
    expect(formatNumber(Infinity)).toBe('—');
    expect(formatNumber(-Infinity)).toBe('—');
  });

  it('should use custom fallback', () => {
    expect(formatNumber(null, 2, 'N/A')).toBe('N/A');
  });
});

describe('formatNumberAuto', () => {
  it('should use fewer decimals for large numbers', () => {
    expect(formatNumberAuto(1234)).toBe('1234');
    expect(formatNumberAuto(123.4)).toBe('123.4');
  });

  it('should use more decimals for small numbers', () => {
    expect(formatNumberAuto(1.234)).toBe('1.234');
    expect(formatNumberAuto(0.1234)).toBe('0.1234');
  });

  it('should use exponential for very small numbers', () => {
    expect(formatNumberAuto(0.001234)).toMatch(/e/);
  });

  it('should return 0 for zero', () => {
    expect(formatNumberAuto(0)).toBe('0');
  });
});

describe('formatFrequency', () => {
  it('should format Hz', () => {
    expect(formatFrequency(500)).toBe('500.00 Hz');
  });

  it('should format kHz', () => {
    expect(formatFrequency(5000)).toBe('5.00 kHz');
  });

  it('should format MHz', () => {
    expect(formatFrequency(2.4e6)).toBe('2.40 MHz');
  });

  it('should format GHz', () => {
    expect(formatFrequency(2.4e9)).toBe('2.40 GHz');
  });

  it('should format THz', () => {
    expect(formatFrequency(1e12)).toBe('1.00 THz');
  });

  it('should return fallback for invalid values', () => {
    expect(formatFrequency(null)).toBe('—');
    expect(formatFrequency(-1)).toBe('—');
  });

  it('should format zero', () => {
    expect(formatFrequency(0)).toBe('0 Hz');
  });
});

describe('formatFrequencyGHz', () => {
  it('should format with GHz unit', () => {
    expect(formatFrequencyGHz(2.4)).toBe('2.40 GHz');
  });

  it('should return fallback for invalid values', () => {
    expect(formatFrequencyGHz(null)).toBe('—');
  });
});

describe('formatWavelength', () => {
  it('should format km', () => {
    expect(formatWavelength(5000)).toBe('5.00 km');
  });

  it('should format m', () => {
    expect(formatWavelength(1.5)).toBe('1.50 m');
  });

  it('should format cm', () => {
    expect(formatWavelength(0.125)).toBe('12.50 cm');
  });

  it('should format mm', () => {
    expect(formatWavelength(0.005)).toBe('5.00 mm');
  });

  it('should format um', () => {
    expect(formatWavelength(5e-6)).toContain('5.00');
    expect(formatWavelength(5e-6)).toContain('m');
  });

  it('should format nm', () => {
    expect(formatWavelength(500e-9)).toContain('500');
  });

  it('should return fallback for invalid values', () => {
    expect(formatWavelength(null)).toBe('—');
    expect(formatWavelength(0)).toBe('—');
    expect(formatWavelength(-1)).toBe('—');
  });
});

describe('formatDistance', () => {
  it('should format meters', () => {
    expect(formatDistance(500)).toBe('500.0 m');
  });

  it('should format kilometers', () => {
    expect(formatDistance(5000)).toBe('5.0 km');
  });

  it('should format zero', () => {
    expect(formatDistance(0)).toBe('0 m');
  });

  it('should return fallback for invalid values', () => {
    expect(formatDistance(null)).toBe('—');
    expect(formatDistance(-1)).toBe('—');
  });
});

describe('formatDistanceWithUnit', () => {
  it('should format with specified unit', () => {
    expect(formatDistanceWithUnit(100, 'km')).toBe('100.0 km');
    expect(formatDistanceWithUnit(5, 'mi')).toBe('5.0 mi');
  });
});

describe('formatPowerDbm', () => {
  it('should format dBm values', () => {
    expect(formatPowerDbm(20)).toBe('20.0 dBm');
    expect(formatPowerDbm(-80)).toBe('-80.0 dBm');
  });

  it('should return fallback for invalid values', () => {
    expect(formatPowerDbm(null)).toBe('—');
  });
});

describe('formatPowerDb', () => {
  it('should format dB values', () => {
    expect(formatPowerDb(3)).toBe('3.0 dB');
  });

  it('should show sign when requested', () => {
    expect(formatPowerDb(3, 1, true)).toBe('+3.0 dB');
    expect(formatPowerDb(-3, 1, true)).toBe('-3.0 dB');
  });
});

describe('formatPowerWatts', () => {
  it('should format kW', () => {
    expect(formatPowerWatts(5000)).toBe('5.00 kW');
  });

  it('should format W', () => {
    expect(formatPowerWatts(5)).toBe('5.00 W');
  });

  it('should format mW', () => {
    expect(formatPowerWatts(0.005)).toBe('5.00 mW');
  });

  it('should format uW', () => {
    expect(formatPowerWatts(0.000005)).toContain('5.00');
  });
});

describe('formatAttenuation', () => {
  it('should format high values with 1 decimal', () => {
    expect(formatAttenuation(15.5)).toBe('15.5 dB/km');
  });

  it('should format medium values with 2 decimals', () => {
    expect(formatAttenuation(1.55)).toBe('1.55 dB/km');
  });

  it('should format low values with more decimals', () => {
    expect(formatAttenuation(0.155)).toBe('0.155 dB/km');
  });

  it('should use exponential for very low values', () => {
    expect(formatAttenuation(0.001)).toMatch(/e/);
  });
});

describe('formatAttenuationTotal', () => {
  it('should format total attenuation', () => {
    expect(formatAttenuationTotal(92.5)).toBe('92.50 dB');
  });
});

describe('formatPercentage', () => {
  it('should format percentage', () => {
    expect(formatPercentage(75)).toBe('75.0%');
  });

  it('should handle decimal input', () => {
    expect(formatPercentage(0.75, 1, true)).toBe('75.0%');
  });
});

describe('formatAngle', () => {
  it('should format angle with degree symbol', () => {
    expect(formatAngle(45)).toBe('45.0\u00B0');
  });
});

describe('formatTemperatureCelsius', () => {
  it('should format temperature', () => {
    expect(formatTemperatureCelsius(20)).toBe('20.0 \u00B0C');
  });
});

describe('formatTemperatureKelvin', () => {
  it('should format temperature', () => {
    expect(formatTemperatureKelvin(293)).toBe('293.0 K');
  });
});

describe('formatPressure', () => {
  it('should format pressure', () => {
    expect(formatPressure(1013.25)).toBe('1013.3 hPa');
  });
});

// ============================================================================
// formatPrecisionNumber
// ============================================================================

describe('formatPrecisionNumber', () => {
  it('should return empty string for null', () => {
    expect(formatPrecisionNumber(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(formatPrecisionNumber(undefined)).toBe('');
  });

  it('should return empty string for NaN', () => {
    expect(formatPrecisionNumber(NaN)).toBe('');
  });

  it('should return empty string for Infinity', () => {
    expect(formatPrecisionNumber(Infinity)).toBe('');
  });

  it('should return custom fallback for invalid values', () => {
    expect(formatPrecisionNumber(null, 6, 1e6, 4, 'N/A')).toBe('N/A');
  });

  it('should return "0" for zero', () => {
    expect(formatPrecisionNumber(0)).toBe('0');
  });

  it('should format normal values with precision', () => {
    const result = formatPrecisionNumber(123.456, 6);
    expect(result).toBe('123.456');
  });

  it('should strip trailing zeros', () => {
    const result = formatPrecisionNumber(100, 6);
    expect(result).toBe('100');
  });

  it('should use exponential for very small values', () => {
    const result = formatPrecisionNumber(0.0001, 6, 1e6, 4);
    expect(result).toMatch(/e/);
  });

  it('should use exponential for very large values', () => {
    const result = formatPrecisionNumber(1e7, 6, 1e6, 4);
    expect(result).toMatch(/e\+/);
  });

  it('should respect custom precision', () => {
    const result = formatPrecisionNumber(3.14159, 4);
    expect(result).toBe('3.142');
  });

  it('should respect custom expThreshold', () => {
    // With threshold 1e3, 1500 should be in exponential
    const result = formatPrecisionNumber(1500, 6, 1e3, 4);
    expect(result).toMatch(/e\+/);
  });
});
