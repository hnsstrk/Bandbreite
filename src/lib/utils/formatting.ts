/**
 * Centralized formatting utilities for the Bandbreite application.
 * These functions provide consistent formatting for frequencies, wavelengths,
 * distances, power, and other values throughout the application.
 */

// ============================================================================
// Number Formatting
// ============================================================================

/**
 * Format a number with a specified number of decimal places.
 * Returns '—' for null, undefined, NaN, or Infinity.
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @param fallback - Fallback string for invalid values (default: '—')
 * @returns Formatted string
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 2,
  fallback: string = '—'
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  return value.toFixed(decimals);
}

/**
 * Format a number with automatic precision based on magnitude.
 * Uses fewer decimals for larger numbers, more for smaller.
 *
 * @param value - The number to format
 * @param fallback - Fallback string for invalid values
 * @returns Formatted string
 */
export function formatNumberAuto(
  value: number | null | undefined,
  fallback: string = '—'
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  const absValue = Math.abs(value);
  if (absValue === 0) return '0';
  if (absValue >= 1000) return value.toFixed(0);
  if (absValue >= 100) return value.toFixed(1);
  if (absValue >= 10) return value.toFixed(2);
  if (absValue >= 1) return value.toFixed(3);
  if (absValue >= 0.1) return value.toFixed(4);
  if (absValue >= 0.01) return value.toFixed(5);
  return value.toExponential(2);
}

/**
 * Format a number using significant digits (toPrecision) with exponential notation
 * for very small or large values. Strips trailing zeros.
 * Useful for converter input fields where precision matters.
 *
 * @param value - The number to format
 * @param precision - Number of significant digits (default: 6)
 * @param expThreshold - Magnitude threshold for exponential notation (default: 1e6)
 * @param expDigits - Digits in exponential notation (default: 4)
 * @param fallback - Fallback string for null/invalid values (default: '')
 * @returns Formatted string
 */
export function formatPrecisionNumber(
  value: number | null | undefined,
  precision: number = 6,
  expThreshold: number = 1e6,
  expDigits: number = 4,
  fallback: string = ''
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  if (value === 0) return '0';
  if (Math.abs(value) < 0.001 || Math.abs(value) >= expThreshold) {
    return value.toExponential(expDigits);
  }
  return value.toPrecision(precision).replace(/\.?0+$/, '');
}

/**
 * Format a number with thousands separator (German style: 1.000.000).
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places
 * @returns Formatted string with German locale
 */
export function formatNumberLocale(
  value: number | null | undefined,
  decimals: number = 0
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// ============================================================================
// Frequency Formatting
// ============================================================================

/**
 * Format frequency in Hz with automatic unit selection.
 * Selects the most appropriate unit (Hz, kHz, MHz, GHz, THz).
 *
 * @param hz - Frequency in Hertz
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with unit
 */
export function formatFrequency(
  hz: number | null | undefined,
  decimals: number = 2
): string {
  if (hz === null || hz === undefined || !Number.isFinite(hz) || hz < 0) {
    return '—';
  }

  if (hz === 0) return '0 Hz';

  if (hz >= 1e12) return `${(hz / 1e12).toFixed(decimals)} THz`;
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(decimals)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(decimals)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(decimals)} kHz`;
  return `${hz.toFixed(decimals)} Hz`;
}

/**
 * Format frequency in GHz with specified decimals.
 *
 * @param ghz - Frequency in GHz
 * @param decimals - Number of decimal places
 * @returns Formatted string with GHz unit
 */
export function formatFrequencyGHz(
  ghz: number | null | undefined,
  decimals: number = 2
): string {
  if (ghz === null || ghz === undefined || !Number.isFinite(ghz)) {
    return '—';
  }
  return `${ghz.toFixed(decimals)} GHz`;
}

// ============================================================================
// Wavelength Formatting
// ============================================================================

/**
 * Format wavelength in meters with automatic unit selection.
 * Selects the most appropriate unit (km, m, cm, mm, um, nm).
 *
 * @param meters - Wavelength in meters
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with unit
 */
export function formatWavelength(
  meters: number | null | undefined,
  decimals: number = 2
): string {
  if (meters === null || meters === undefined || !Number.isFinite(meters) || meters <= 0) {
    return '—';
  }

  if (meters >= 1000) return `${(meters / 1000).toFixed(decimals)} km`;
  if (meters >= 1) return `${meters.toFixed(decimals)} m`;
  if (meters >= 0.01) return `${(meters * 100).toFixed(decimals)} cm`;
  if (meters >= 0.001) return `${(meters * 1000).toFixed(decimals)} mm`;
  if (meters >= 1e-6) return `${(meters * 1e6).toFixed(decimals)} \u03BCm`;
  return `${(meters * 1e9).toFixed(decimals)} nm`;
}

// ============================================================================
// Distance Formatting
// ============================================================================

/**
 * Format distance in meters with automatic unit selection.
 * Selects m or km based on magnitude.
 *
 * @param meters - Distance in meters
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with unit
 */
export function formatDistance(
  meters: number | null | undefined,
  decimals: number = 1
): string {
  if (meters === null || meters === undefined || !Number.isFinite(meters) || meters < 0) {
    return '—';
  }

  if (meters === 0) return '0 m';
  if (meters >= 1000) return `${(meters / 1000).toFixed(decimals)} km`;
  return `${meters.toFixed(decimals)} m`;
}

/**
 * Format distance with explicit unit control.
 *
 * @param value - Distance value
 * @param unit - Unit symbol (m, km, mi, ft)
 * @param decimals - Number of decimal places
 * @returns Formatted string with unit
 */
export function formatDistanceWithUnit(
  value: number | null | undefined,
  unit: string,
  decimals: number = 1
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  return `${value.toFixed(decimals)} ${unit}`;
}

// ============================================================================
// Power Formatting
// ============================================================================

/**
 * Format power in dBm.
 *
 * @param dbm - Power in dBm
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with dBm unit
 */
export function formatPowerDbm(
  dbm: number | null | undefined,
  decimals: number = 1
): string {
  if (dbm === null || dbm === undefined || !Number.isFinite(dbm)) {
    return '—';
  }
  return `${dbm.toFixed(decimals)} dBm`;
}

/**
 * Format power in dB (for gains/losses).
 *
 * @param db - Power in dB
 * @param decimals - Number of decimal places (default: 1)
 * @param showSign - Whether to show + for positive values
 * @returns Formatted string with dB unit
 */
export function formatPowerDb(
  db: number | null | undefined,
  decimals: number = 1,
  showSign: boolean = false
): string {
  if (db === null || db === undefined || !Number.isFinite(db)) {
    return '—';
  }
  const sign = showSign && db > 0 ? '+' : '';
  return `${sign}${db.toFixed(decimals)} dB`;
}

/**
 * Format power in Watts with automatic unit selection.
 *
 * @param watts - Power in Watts
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with unit
 */
export function formatPowerWatts(
  watts: number | null | undefined,
  decimals: number = 2
): string {
  if (watts === null || watts === undefined || !Number.isFinite(watts) || watts < 0) {
    return '—';
  }

  if (watts === 0) return '0 W';
  if (watts >= 1000) return `${(watts / 1000).toFixed(decimals)} kW`;
  if (watts >= 1) return `${watts.toFixed(decimals)} W`;
  if (watts >= 0.001) return `${(watts * 1000).toFixed(decimals)} mW`;
  return `${(watts * 1e6).toFixed(decimals)} \u03BCW`;
}

// ============================================================================
// Attenuation Formatting
// ============================================================================

/**
 * Format attenuation in dB/km with automatic precision.
 *
 * @param dbPerKm - Attenuation in dB/km
 * @returns Formatted string with unit
 */
export function formatAttenuation(dbPerKm: number | null | undefined): string {
  if (dbPerKm === null || dbPerKm === undefined || !Number.isFinite(dbPerKm)) {
    return '—';
  }

  if (dbPerKm >= 10) return `${dbPerKm.toFixed(1)} dB/km`;
  if (dbPerKm >= 1) return `${dbPerKm.toFixed(2)} dB/km`;
  if (dbPerKm >= 0.1) return `${dbPerKm.toFixed(3)} dB/km`;
  if (dbPerKm >= 0.01) return `${dbPerKm.toFixed(4)} dB/km`;
  return `${dbPerKm.toExponential(2)} dB/km`;
}

/**
 * Format total attenuation in dB.
 *
 * @param db - Total attenuation in dB
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with unit
 */
export function formatAttenuationTotal(
  db: number | null | undefined,
  decimals: number = 2
): string {
  if (db === null || db === undefined || !Number.isFinite(db)) {
    return '—';
  }
  return `${db.toFixed(decimals)} dB`;
}

// ============================================================================
// Percentage Formatting
// ============================================================================

/**
 * Format a value as percentage.
 *
 * @param value - The value (0-1 or 0-100 depending on isDecimal)
 * @param decimals - Number of decimal places
 * @param isDecimal - Whether input is 0-1 (true) or 0-100 (false)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals: number = 1,
  isDecimal: boolean = false
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return '—';
  }
  const pct = isDecimal ? value * 100 : value;
  return `${pct.toFixed(decimals)}%`;
}

// ============================================================================
// Angle Formatting
// ============================================================================

/**
 * Format angle in degrees.
 *
 * @param degrees - Angle in degrees
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with degree symbol
 */
export function formatAngle(
  degrees: number | null | undefined,
  decimals: number = 1
): string {
  if (degrees === null || degrees === undefined || !Number.isFinite(degrees)) {
    return '—';
  }
  return `${degrees.toFixed(decimals)}\u00B0`;
}

// ============================================================================
// Temperature Formatting
// ============================================================================

/**
 * Format temperature in Celsius.
 *
 * @param celsius - Temperature in Celsius
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with unit
 */
export function formatTemperatureCelsius(
  celsius: number | null | undefined,
  decimals: number = 1
): string {
  if (celsius === null || celsius === undefined || !Number.isFinite(celsius)) {
    return '—';
  }
  return `${celsius.toFixed(decimals)} \u00B0C`;
}

/**
 * Format temperature in Kelvin.
 *
 * @param kelvin - Temperature in Kelvin
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with unit
 */
export function formatTemperatureKelvin(
  kelvin: number | null | undefined,
  decimals: number = 1
): string {
  if (kelvin === null || kelvin === undefined || !Number.isFinite(kelvin)) {
    return '—';
  }
  return `${kelvin.toFixed(decimals)} K`;
}

// ============================================================================
// Pressure Formatting
// ============================================================================

/**
 * Format atmospheric pressure in hPa.
 *
 * @param hpa - Pressure in hPa
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with unit
 */
export function formatPressure(
  hpa: number | null | undefined,
  decimals: number = 1
): string {
  if (hpa === null || hpa === undefined || !Number.isFinite(hpa)) {
    return '—';
  }
  return `${hpa.toFixed(decimals)} hPa`;
}
