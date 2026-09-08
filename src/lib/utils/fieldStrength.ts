/**
 * Strahlungsleistung, Leistungsdichte und Feldstärke im Fernfeld.
 *
 * Die eine Stelle für den Weg „Sendeleistung → EIRP/ERP → Leistungsdichte →
 * Feldstärke → Empfangsleistung". Reine Funktionen ohne DOM-Bezug; das Widget
 * `widgets/FieldStrengthWidget.svelte` und das Kapitel
 * `/wissen/grundlagen/leistung-und-pegel/` greifen beide hierauf zu.
 *
 * Alle Beziehungen gelten für den **freien Raum im Fernfeld** einer Antenne
 * (ebene Welle, Feldwellenwiderstand Z₀). In der Nähe der Antenne oder mit
 * Bodenreflexion sind die Werte nicht mehr gültig.
 *
 * Quellen:
 * - Meinke/Gundlach, Taschenbuch der Hochfrequenztechnik (Strahlungsfeld,
 *   Feldwellenwiderstand, EIRP/ERP)
 * - Pozar, Microwave Engineering (Friis-Gleichung, Wirkfläche)
 * - ITU-R V.574-5 (Pegelgebrauch), IEEE Std 100 (EIRP, ERP, dBµV/m)
 */

import { FREE_SPACE_IMPEDANCE } from '$lib/data/constants';
import { GAIN_DIPOLE_DBI } from '$lib/data/antennas';
import { gainLinearFromDbi, effectiveApertureM2, wavelengthM } from '$lib/utils/antennaMath';
import { safeDivide, safeLog } from '$lib/utils/handlers';
import { wattToDbm } from '$lib/utils/conversions';
import { DBUV_PER_VOLT, VOLTAGE_DECADE_FACTOR } from '$lib/utils/decibel';

/** Vollwinkel einer Kugel: 4π sr — die Fläche einer Kugel ist 4π·r². */
export const SPHERE_SOLID_ANGLE = 4 * Math.PI;

/**
 * Zahlenwert der klassischen Feldstärkeformel E = √(k·P·G)/d.
 *
 * k = Z₀/(4π) ≈ 29,98 — in der Literatur meist auf **30** gerundet. Hier wird
 * bewusst mit dem exakten Z₀ gerechnet; die Rundung auf 30 ändert das Ergebnis
 * erst in der dritten Stelle.
 */
export const FIELD_STRENGTH_FACTOR = FREE_SPACE_IMPEDANCE / SPHERE_SOLID_ANGLE;

/** Gewinn eines verlustfreien Halbwellendipols als Faktor (≈ 1,64). */
export const DIPOLE_GAIN_LINEAR = gainLinearFromDbi(GAIN_DIPOLE_DBI);

// ============================================================================
// Strahlungsleistung: EIRP und ERP
// ============================================================================

/**
 * Äquivalente isotrope Strahlungsleistung EIRP = P_tx · G (Bezug: Kugelstrahler).
 *
 * @param txPowerW Sendeleistung an der Antenne in Watt
 * @param gainDbi Antennengewinn in dBi
 */
export function eirpWatt(txPowerW: number, gainDbi: number): number {
  if (txPowerW <= 0) return 0;
  return txPowerW * gainLinearFromDbi(gainDbi);
}

/**
 * Effektive Strahlungsleistung ERP = EIRP / 1,64 (Bezug: Halbwellendipol).
 * Der Unterschied beträgt genau den Dipolgewinn von 2,15 dB.
 */
export function erpWatt(eirpW: number): number {
  return safeDivide(eirpW, DIPOLE_GAIN_LINEAR, 0);
}

/** EIRP als Pegel in dBm: P_dBm + G_dBi. */
export function eirpDbm(txPowerW: number, gainDbi: number): number {
  return wattToDbm(txPowerW) + gainDbi;
}

/** ERP als Pegel in dBm: EIRP_dBm − 2,15 dB. */
export function erpDbm(txPowerW: number, gainDbi: number): number {
  return eirpDbm(txPowerW, gainDbi) - GAIN_DIPOLE_DBI;
}

// ============================================================================
// Leistungsdichte und Feldstärke
// ============================================================================

/**
 * Leistungsdichte im Abstand d: S = EIRP / (4π·d²).
 *
 * @param eirpW Äquivalente isotrope Strahlungsleistung in Watt
 * @param distanceM Abstand in Metern
 * @returns Leistungsdichte in W/m²
 */
export function powerDensityWattPerM2(eirpW: number, distanceM: number): number {
  if (eirpW <= 0 || distanceM <= 0) return 0;
  return safeDivide(eirpW, SPHERE_SOLID_ANGLE * distanceM * distanceM, 0);
}

/** Feldstärke aus der Leistungsdichte: E = √(S · Z₀) in V/m. */
export function fieldStrengthFromDensity(powerDensityW: number): number {
  if (powerDensityW <= 0) return 0;
  return Math.sqrt(powerDensityW * FREE_SPACE_IMPEDANCE);
}

/** Leistungsdichte aus der Feldstärke: S = E² / Z₀ in W/m². */
export function powerDensityFromField(fieldVPerM: number): number {
  if (fieldVPerM <= 0) return 0;
  return safeDivide(fieldVPerM * fieldVPerM, FREE_SPACE_IMPEDANCE, 0);
}

/** Magnetische Feldstärke der ebenen Welle: H = E / Z₀ in A/m. */
export function magneticFieldAPerM(fieldVPerM: number): number {
  return safeDivide(fieldVPerM, FREE_SPACE_IMPEDANCE, 0);
}

/**
 * Elektrische Feldstärke im Abstand d: E = √(Z₀/(4π) · EIRP) / d ≈ √(30·EIRP)/d.
 *
 * @param eirpW EIRP in Watt
 * @param distanceM Abstand in Metern
 * @returns Feldstärke in V/m
 */
export function fieldStrengthVPerM(eirpW: number, distanceM: number): number {
  if (eirpW <= 0 || distanceM <= 0) return 0;
  return safeDivide(Math.sqrt(FIELD_STRENGTH_FACTOR * eirpW), distanceM, 0);
}

/** Feldstärkepegel: E_dBµV/m = 20·log₁₀(E / 1 V/m) + 120. */
export function fieldStrengthDbuvPerM(fieldVPerM: number): number {
  if (fieldVPerM <= 0) return -Infinity;
  return VOLTAGE_DECADE_FACTOR * safeLog(fieldVPerM, 10, -Infinity) + DBUV_PER_VOLT;
}

/** dBµV/m → V/m. */
export function dbuvPerMToField(dbuvPerM: number): number {
  return Math.pow(10, (dbuvPerM - DBUV_PER_VOLT) / VOLTAGE_DECADE_FACTOR);
}

// ============================================================================
// Empfangsseite
// ============================================================================

/**
 * Empfangsleistung aus Leistungsdichte und Wirkfläche: P_rx = S · A_w.
 *
 * @param powerDensityW Leistungsdichte am Empfangsort in W/m²
 * @param apertureM2 Wirkfläche der Empfangsantenne in m²
 */
export function receivedPowerWatt(powerDensityW: number, apertureM2: number): number {
  if (powerDensityW <= 0 || apertureM2 <= 0) return 0;
  return powerDensityW * apertureM2;
}

// ============================================================================
// Gesamtrechnung
// ============================================================================

export interface FieldStrengthInput {
  /** Sendeleistung an der Antenne in Watt */
  txPowerW: number;
  /** Antennengewinn in dBi */
  gainDbi: number;
  /** Abstand in Metern */
  distanceM: number;
  /** Frequenz in Hz — nur für Wirkfläche und Empfangsleistung */
  frequencyHz?: number;
  /** Gewinn der Empfangsantenne in dBi (Vorgabe: isotrop) */
  rxGainDbi?: number;
}

export interface FieldStrengthResult {
  eirpW: number;
  eirpDbm: number;
  erpW: number;
  erpDbm: number;
  /** Leistungsdichte in W/m² */
  powerDensityW: number;
  /** Elektrische Feldstärke in V/m */
  fieldVPerM: number;
  /** Feldstärkepegel in dBµV/m */
  fieldDbuvPerM: number;
  /** Magnetische Feldstärke in A/m */
  magneticAPerM: number;
  /** Wirkfläche der Empfangsantenne in m² (0 ohne Frequenzangabe) */
  apertureM2: number;
  /** Empfangsleistung in Watt (0 ohne Frequenzangabe) */
  receivedW: number;
}

/** Rechnet einen Arbeitspunkt vollständig durch. */
export function computeFieldStrength(input: FieldStrengthInput): FieldStrengthResult {
  const { txPowerW, gainDbi, distanceM, frequencyHz = 0, rxGainDbi = 0 } = input;
  const eirpW = eirpWatt(txPowerW, gainDbi);
  const powerDensityW = powerDensityWattPerM2(eirpW, distanceM);
  const fieldVPerM = fieldStrengthVPerM(eirpW, distanceM);
  const apertureM2 = frequencyHz > 0 ? effectiveApertureM2(rxGainDbi, wavelengthM(frequencyHz)) : 0;

  return {
    eirpW,
    eirpDbm: eirpDbm(txPowerW, gainDbi),
    erpW: erpWatt(eirpW),
    erpDbm: erpDbm(txPowerW, gainDbi),
    powerDensityW,
    fieldVPerM,
    fieldDbuvPerM: fieldStrengthDbuvPerM(fieldVPerM),
    magneticAPerM: magneticFieldAPerM(fieldVPerM),
    apertureM2,
    receivedW: receivedPowerWatt(powerDensityW, apertureM2)
  };
}

/** Grenzen und Vorgabewerte des Feldstärke-Widgets. */
export const FIELD_STRENGTH_LIMITS = {
  txPowerW: { min: 0.001, max: 100_000, default: 10 },
  gainDbi: { min: 0, max: 50, default: 12 },
  distanceM: { min: 1, max: 100_000, default: 100 },
  frequencyHz: { min: 1e6, max: 40e9, default: 900e6 }
} as const;

/** Vergleichspunkte des Balkendiagramms (Abstände in Metern). */
export const FIELD_STRENGTH_DISTANCES_M = [1, 10, 100, 1000, 10_000] as const;
