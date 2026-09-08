/**
 * Bereiche, Presets und Kettenmodell des Pegelrechners.
 *
 * Gerechnet wird nicht hier: Umrechnungen und Kettensummen stehen in
 * `$lib/utils/decibel`, die Leistungsfaktoren in `$lib/data/units`.
 */

import { POWER_UNITS_WATT } from '$lib/data/units';
import { clamp, safeDivide } from '$lib/utils/handlers';
import { IMPEDANCE_RF_OHM, IMPEDANCE_VIDEO_OHM, type ChainStage } from '$lib/utils/decibel';
import type { ParamSpecs } from '$lib/utils/urlState.svelte';

/** Pegelbereich des Reglers in dBm: von der Rauschgrenze bis zum Großsender. */
export const LEVEL_MIN_DBM = -140;
export const LEVEL_MAX_DBM = 90;

/** Bereich des Verhältnisreglers in dB. */
export const RATIO_MIN_DB = -60;
export const RATIO_MAX_DB = 60;

/** Wählbare Bezugsimpedanzen als Select-Optionen. */
export const IMPEDANCE_OPTIONS = [
  { value: String(IMPEDANCE_RF_OHM), label: '50 Ω — Funk und Messtechnik' },
  { value: String(IMPEDANCE_VIDEO_OHM), label: '75 Ω — Antennen- und Kabelanlagen' }
];

/** Einheiten der Leistungseingabe. */
export const POWER_UNITS = POWER_UNITS_WATT;

/** Einheiten der Spannungseingabe (Basiseinheit Volt). */
export const VOLTAGE_UNITS = [
  { id: 'uv', symbol: 'µV', factor: 1e-6 },
  { id: 'mv', symbol: 'mV', factor: 1e-3 },
  { id: 'v', symbol: 'V', factor: 1 }
];

/**
 * Wählt für eine Spannung die passende Einheit — µV, mV oder V —, damit die
 * Anzeige weder Nullenketten noch Exponenten braucht.
 */
export function voltageParts(volt: number): { value: number; symbol: string } {
  const magnitude = Math.abs(volt);
  const unit =
    [...VOLTAGE_UNITS].reverse().find((option) => magnitude >= option.factor) ?? VOLTAGE_UNITS[0];
  return { value: safeDivide(volt, unit.factor, 0), symbol: unit.symbol };
}

/** Leistungsgrenzen der Eingabe in Watt (aus dem Pegelbereich abgeleitet). */
export const POWER_MIN_W = Math.pow(10, LEVEL_MIN_DBM / 10) / 1000;
export const POWER_MAX_W = Math.pow(10, LEVEL_MAX_DBM / 10) / 1000;

/** Spannungsgrenzen der Eingabe in Volt (an 50 Ω, nur als Feldgrenzen). */
export const VOLTAGE_MIN_V = 1e-9;
export const VOLTAGE_MAX_V = 1e4;

/** Standardkette: Sender, Kabel, Antenne, Strecke, Antenne. */
export const DEFAULT_LEVEL_CHAIN: (ChainStage & { min: number; max: number })[] = [
  { id: 'tx', label: 'Sendeleistung', db: 20, min: -30, max: 60 },
  { id: 'txCable', label: 'Kabel Sender', db: -3, min: -30, max: 0 },
  { id: 'txAntenna', label: 'Sendeantenne', db: 12, min: 0, max: 60 },
  { id: 'path', label: 'Streckendämpfung', db: -100, min: -200, max: 0 },
  { id: 'rxAntenna', label: 'Empfangsantenne', db: 12, min: 0, max: 60 },
  { id: 'rxCable', label: 'Kabel Empfänger', db: -2, min: -30, max: 0 }
];

/** Trennzeichen der Kette in der Adresszeile. */
const CHAIN_SEPARATOR = ',';

/** Serialisiert die dB-Werte der Kette für die Adresszeile. */
export function serializeChain(stages: readonly { db: number }[]): string {
  return stages.map((stage) => String(Math.round(stage.db * 10) / 10)).join(CHAIN_SEPARATOR);
}

/**
 * Liest die Kette aus der Adresszeile zurück. Fehlende oder unbrauchbare
 * Werte behalten den Standard, jeder Wert bleibt in den Grenzen seiner Stufe.
 */
export function parseChain(
  raw: string,
  template: readonly (ChainStage & { min: number; max: number })[] = DEFAULT_LEVEL_CHAIN
): (ChainStage & { min: number; max: number })[] {
  const parts = raw.split(CHAIN_SEPARATOR);
  return template.map((stage, index) => {
    const rohwert = parts[index]?.trim() ?? '';
    const value = rohwert === '' ? Number.NaN : Number(rohwert);
    if (!Number.isFinite(value)) return { ...stage };
    return { ...stage, db: clamp(value, stage.min, stage.max) };
  });
}

/** Typische Empfängerempfindlichkeit als Referenzlinie der Kette in dBm. */
export const CHAIN_REFERENCE_DBM = -90;

export const DECIBEL_PARAMS = {
  l: { default: 30, min: LEVEL_MIN_DBM, max: LEVEL_MAX_DBM },
  z: {
    default: String(IMPEDANCE_RF_OHM),
    options: [String(IMPEDANCE_RF_OHM), String(IMPEDANCE_VIDEO_OHM)]
  },
  r: { default: 3, min: RATIO_MIN_DB, max: RATIO_MAX_DB },
  c: { default: serializeChain(DEFAULT_LEVEL_CHAIN) }
} satisfies ParamSpecs;

/** Pegel-Presets aus der Praxis (Werte in dBm). */
export const LEVEL_PRESETS = [
  { id: 'ble', label: 'Bluetooth LE 0 dBm', value: 0, hint: '1 mW Sendeleistung' },
  { id: 'wlan', label: 'WLAN 20 dBm', value: 20, hint: '100 mW EIRP-Grenze im 2,4-GHz-Band' },
  { id: 'handy', label: 'Mobiltelefon 23 dBm', value: 23, hint: '200 mW, 3GPP Leistungsklasse 3' },
  { id: 'pmr', label: 'PMR446 27 dBm', value: 27, hint: '500 mW ERP' },
  { id: 'watt', label: '1 W = 30 dBm', value: 30, hint: 'Bezugspunkt der Umrechnung' },
  { id: 'ukw', label: 'UKW-Sender 100 kW', value: 80, hint: '10⁵ W Sendeleistung' }
];

/** Verhältnis-Presets, die die Merkregeln greifbar machen (Werte in dB). */
export const RATIO_PRESETS = [
  { id: 'plus3', label: '+3 dB', value: 3, hint: 'doppelte Leistung' },
  { id: 'plus6', label: '+6 dB', value: 6, hint: 'vierfache Leistung, doppelte Spannung' },
  { id: 'plus10', label: '+10 dB', value: 10, hint: 'zehnfache Leistung' },
  { id: 'plus20', label: '+20 dB', value: 20, hint: 'hundertfache Leistung' },
  { id: 'minus3', label: '−3 dB', value: -3, hint: 'halbe Leistung' },
  { id: 'minus10', label: '−10 dB', value: -10, hint: 'ein Zehntel der Leistung' }
];

/** Zeichenmaße des Kettendiagramms. */
export const CHAIN_VIEW_WIDTH = 760;
export const CHAIN_ROW_HEIGHT = 30;
export const CHAIN_AXIS_LEFT = 12;
export const CHAIN_AXIS_RIGHT = 748;
export const CHAIN_LEVEL_MIN_DBM = -160;
export const CHAIN_LEVEL_MAX_DBM = 80;

/** Bildet einen Pegel auf die x-Achse des Kettendiagramms ab. */
export function chainX(levelDbm: number): number {
  const clamped = clamp(levelDbm, CHAIN_LEVEL_MIN_DBM, CHAIN_LEVEL_MAX_DBM);
  const span = CHAIN_LEVEL_MAX_DBM - CHAIN_LEVEL_MIN_DBM;
  return (
    CHAIN_AXIS_LEFT +
    ((clamped - CHAIN_LEVEL_MIN_DBM) / span) * (CHAIN_AXIS_RIGHT - CHAIN_AXIS_LEFT)
  );
}

/** Achsenmarken des Kettendiagramms in dBm. */
export const CHAIN_TICKS = [-160, -120, -80, -40, 0, 40, 80] as const;
