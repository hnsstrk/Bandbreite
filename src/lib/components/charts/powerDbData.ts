/**
 * PowerDbChart - Daten, Typen und Hilfsfunktionen
 *
 * Enthält alle statischen Datenpunkte, Tick-Werte und Formatierungsfunktionen
 * für das Sendeleistungs-Frequenz-Diagramm.
 */

import { wattToDbm } from '$lib/utils/conversions';
import { SPEED_OF_LIGHT } from '$lib/data/constants';
import { CHART_FREQUENCY_RANGES, CHART_POWER_RANGES } from '$lib/data/spectrum';

// ============================================================================
// Typen
// ============================================================================

export interface DataPoint {
  name: string;
  nameDE: string;
  frequencyHz: number;
  powerWatt: number;
  category: 'communication' | 'radar' | 'satellite' | 'iot' | 'industrial';
  labelOffset?: { x: number; y: number };
}

export type Category = DataPoint['category'];

// ============================================================================
// Chart-Konstanten
// ============================================================================

/** Chart-Margins (erhöht für Dual-Achsen) */
export const MARGIN = { top: 60, right: 100, bottom: 100, left: 100 } as const;

/** Frequenzbereich: 100 kHz bis 100 GHz (logarithmisch) */
export const MIN_FREQ = CHART_FREQUENCY_RANGES.powerChart.minHz;
export const MAX_FREQ = CHART_FREQUENCY_RANGES.powerChart.maxHz;

/** Leistungsbereich: 1 mW bis 100 MW (logarithmisch) */
export const MIN_POWER = CHART_POWER_RANGES.standard.minWatt;
export const MAX_POWER = CHART_POWER_RANGES.standard.maxWatt;

// ============================================================================
// Achsen-Tick-Werte
// ============================================================================

/** X-Achse Frequenz-Ticks (logarithmisch) */
export const X_TICK_VALUES = [1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11] as const;
export const X_TICK_LABELS = ['100 kHz', '1 MHz', '10 MHz', '100 MHz', '1 GHz', '10 GHz', '100 GHz'] as const;

/** Y-Achse Leistungs-Ticks (logarithmisch) */
export const Y_TICK_VALUES = [1e-3, 1e-2, 1e-1, 1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8] as const;
export const Y_TICK_LABELS = ['1 mW', '10 mW', '100 mW', '1 W', '10 W', '100 W', '1 kW', '10 kW', '100 kW', '1 MW', '10 MW', '100 MW'] as const;

/** dBm-Werte für rechte Achse (korrespondierend zu Leistungs-Ticks) */
export const Y_DBM_LABELS = Y_TICK_VALUES.map(w => `${wattToDbm(w).toFixed(0)} dBm`);

// ============================================================================
// Datenpunkte
// ============================================================================

export const COMMUNICATION_POINTS: DataPoint[] = [
  { name: 'Bluetooth', nameDE: 'Bluetooth', frequencyHz: 2.4e9, powerWatt: 0.001, category: 'communication' },
  { name: 'WiFi 2.4 GHz', nameDE: 'WLAN 2,4 GHz', frequencyHz: 2.4e9, powerWatt: 0.1, category: 'communication', labelOffset: { x: 0, y: -28 } },
  { name: 'WiFi 5 GHz', nameDE: 'WLAN 5 GHz', frequencyHz: 5e9, powerWatt: 0.2, category: 'communication' },
  { name: 'Cell Phone', nameDE: 'Handy', frequencyHz: 1.8e9, powerWatt: 2, category: 'communication' },
  { name: 'Ham Radio HF', nameDE: 'Amateurfunk KW', frequencyHz: 14e6, powerWatt: 100, category: 'communication' },
  { name: 'Ham Radio VHF', nameDE: 'Amateurfunk VHF', frequencyHz: 145e6, powerWatt: 50, category: 'communication' },
  { name: 'AM Broadcast', nameDE: 'AM Rundfunk', frequencyHz: 1e6, powerWatt: 50000, category: 'communication' },
  { name: 'FM Broadcast', nameDE: 'FM Rundfunk', frequencyHz: 100e6, powerWatt: 100000, category: 'communication' },
  { name: '4G/5G Base Station', nameDE: '4G/5G Basisstation', frequencyHz: 2.6e9, powerWatt: 40, category: 'communication' },
  { name: '2G/3G Base Station', nameDE: '2G/3G Basisstation', frequencyHz: 900e6, powerWatt: 20, category: 'communication' },
];

export const RADAR_POINTS: DataPoint[] = [
  { name: 'Automotive Radar', nameDE: 'Kfz-Radar', frequencyHz: 77e9, powerWatt: 0.05, category: 'radar' },
  { name: 'Ship Radar', nameDE: 'Schiffsradar', frequencyHz: 9.4e9, powerWatt: 25000, category: 'radar' },
  { name: 'Weather Radar', nameDE: 'Wetterradar', frequencyHz: 2.8e9, powerWatt: 750000, category: 'radar', labelOffset: { x: -40, y: 0 } },
  { name: 'Airport Radar', nameDE: 'Flughafenradar', frequencyHz: 2.8e9, powerWatt: 1300000, category: 'radar', labelOffset: { x: 40, y: 0 } },
  { name: 'Military Radar', nameDE: 'Militärradar', frequencyHz: 442e6, powerWatt: 32000000, category: 'radar' },
];

export const SATELLITE_POINTS: DataPoint[] = [
  { name: 'GPS Satellite', nameDE: 'GPS Satellit', frequencyHz: 1.575e9, powerWatt: 27, category: 'satellite' },
  { name: 'Ku-Band Sat', nameDE: 'Ku-Band Satellit', frequencyHz: 12e9, powerWatt: 150, category: 'satellite' },
  { name: 'Ka-Band Sat', nameDE: 'Ka-Band Satellit', frequencyHz: 20e9, powerWatt: 200, category: 'satellite' },
  { name: 'Sat Uplink', nameDE: 'Sat-Bodenstation', frequencyHz: 14e9, powerWatt: 2500, category: 'satellite' },
];

export const IOT_POINTS: DataPoint[] = [
  { name: 'LoRaWAN EU', nameDE: 'LoRaWAN EU', frequencyHz: 868e6, powerWatt: 0.025, category: 'iot' },
  { name: 'LoRaWAN US', nameDE: 'LoRaWAN US', frequencyHz: 915e6, powerWatt: 1, category: 'iot' },
  { name: 'UHF RFID', nameDE: 'UHF RFID', frequencyHz: 868e6, powerWatt: 2, category: 'iot', labelOffset: { x: 50, y: 0 } },
  { name: 'NFC', nameDE: 'NFC', frequencyHz: 13.56e6, powerWatt: 0.002, category: 'iot' },
];

export const INDUSTRIAL_POINTS: DataPoint[] = [
  { name: 'Microwave Oven', nameDE: 'Mikrowellenherd', frequencyHz: 2.45e9, powerWatt: 1000, category: 'industrial', labelOffset: { x: 0, y: 28 } },
];

// ============================================================================
// Formatierungsfunktionen
// ============================================================================

/** Frequenz mit SI-Präfix formatieren */
export function formatFrequencyLocal(hz: number): string {
  if (hz >= 1e12) return `${(hz / 1e12).toFixed(1)} THz`;
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(0)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(0)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(0)} kHz`;
  return `${hz.toFixed(0)} Hz`;
}

/** Wellenlänge mit SI-Präfix formatieren */
export function formatWavelengthLocal(m: number): string {
  if (m >= 1e3) return `${(m / 1e3).toFixed(0)} km`;
  if (m >= 1) return `${m.toFixed(0)} m`;
  if (m >= 1e-2) return `${(m * 100).toFixed(0)} cm`;
  if (m >= 1e-3) return `${(m * 1000).toFixed(1)} mm`;
  return `${(m * 1e6).toFixed(0)} \u03BCm`;
}

/** Leistung mit SI-Präfix formatieren */
export function formatPower(watt: number): string {
  if (watt >= 1e6) return `${(watt / 1e6).toFixed(1)} MW`;
  if (watt >= 1e3) return `${(watt / 1e3).toFixed(0)} kW`;
  if (watt >= 1) return `${watt.toFixed(1)} W`;
  if (watt >= 1e-3) return `${(watt * 1000).toFixed(0)} mW`;
  return `${(watt * 1e6).toFixed(0)} \u03BCW`;
}

/** dBm formatieren */
export function formatDbm(watt: number): string {
  const dbm = wattToDbm(watt);
  return `${dbm.toFixed(0)} dBm`;
}

/** Frequenz zu Wellenlänge berechnen */
export function freqToWavelength(freqHz: number): number {
  return SPEED_OF_LIGHT / freqHz;
}
