import { safeLog } from '$lib/utils/handlers';
import { FREQUENCY_FACTORS, POWER_FACTORS, WAVELENGTH_FACTORS } from '$lib/data/units';

// Die Faktoren-Tabellen leben in `$lib/data/units` und werden hier nur
// weitergereicht, damit beide historisch gewachsenen Importpfade gelten.
export { FREQUENCY_FACTORS, WAVELENGTH_FACTORS, POWER_FACTORS } from '$lib/data/units';

export function convertToHz(value: number, unit: string): number {
  return value * (FREQUENCY_FACTORS[unit] ?? 1);
}

export function convertFromHz(valueHz: number, unit: string): number {
  return valueHz / (FREQUENCY_FACTORS[unit] ?? 1);
}

export function convertToMeters(value: number, unit: string): number {
  return value * (WAVELENGTH_FACTORS[unit] ?? 1);
}

export function convertFromMeters(valueM: number, unit: string): number {
  return valueM / (WAVELENGTH_FACTORS[unit] ?? 1);
}

// ============================================
// Power Conversions
// ============================================

/**
 * Convert Watt to dBm
 * Formula: P(dBm) = 10 * log10(P(mW)) = 10 * log10(P(W) * 1000)
 * @param watt Power in Watts
 * @returns Power in dBm
 */
export function wattToDbm(watt: number): number {
  // 0 W entspricht −∞ dBm; negative/ungültige Eingaben ebenfalls (kein NaN)
  return 10 * safeLog(watt * 1000, 10, -Infinity);
}

/**
 * Convert dBm to Watt
 * Formula: P(W) = 10^(P(dBm)/10) / 1000
 * @param dbm Power in dBm
 * @returns Power in Watts
 */
export function dbmToWatt(dbm: number): number {
  return Math.pow(10, dbm / 10) / 1000;
}

/**
 * Convert Watt to dBW
 * Formula: P(dBW) = 10 * log10(P(W))
 * @param watt Power in Watts
 * @returns Power in dBW
 */
export function wattToDbW(watt: number): number {
  return 10 * safeLog(watt, 10, -Infinity);
}

/**
 * Convert dBW to Watt
 * Formula: P(W) = 10^(P(dBW)/10)
 * @param dbw Power in dBW
 * @returns Power in Watts
 */
export function dbWToWatt(dbw: number): number {
  return Math.pow(10, dbw / 10);
}

/**
 * Convert a power value from a given unit to Watt
 * @param value Power value in the specified unit
 * @param unitId Unit identifier (uw, mw, w, kw)
 * @returns Power in Watts
 */
export function convertToWatt(value: number, unitId: string): number {
  return value * (POWER_FACTORS[unitId] ?? 1);
}

/**
 * Convert a power value from Watt to a given unit
 * @param watt Power in Watts
 * @param unitId Unit identifier (uw, mw, w, kw)
 * @returns Power in the specified unit
 */
export function convertFromWatt(watt: number, unitId: string): number {
  return watt / (POWER_FACTORS[unitId] ?? 1);
}
