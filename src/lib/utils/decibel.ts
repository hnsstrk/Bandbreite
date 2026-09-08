/**
 * Pegelrechnung in Dezibel — die eine Stelle für Verhältnisse, Absolutpegel
 * und Ketten.
 *
 * Hier stehen ausschließlich reine Funktionen ohne DOM-Bezug. Der
 * dB-Spielplatz (`widgets/DecibelModel.ts`) und der Pegelrechner
 * (`calculators/decibelCalculator.svelte.ts`) greifen beide hierauf zu; es
 * gibt keine zweite Umrechnung.
 *
 * Vorzeichenkonvention: Leistungsverhältnisse werden mit 10·log₁₀ gerechnet,
 * Spannungs- und Feldstärkeverhältnisse mit 20·log₁₀ — an gleicher Impedanz
 * beschreiben beide denselben Pegel.
 *
 * Quellen:
 * - IEC 60027-3 (Logarithmische Größen und Einheiten)
 * - ITU-R V.574-5 (Gebrauch des Dezibels und des Nepers)
 * - IEEE Std 100 (dBm, dBW, dBµV)
 */

import { safeDivide, safeLog, safePow } from '$lib/utils/handlers';
import { dbmToWatt } from '$lib/utils/conversions';
import { SYSTEM_IMPEDANCE_OHM } from '$lib/data/antennas';

// ============================================================================
// Konstanten
// ============================================================================

/** Übliche Systemimpedanz der Hochfrequenztechnik in Ohm (Funk, Messtechnik). */
export const IMPEDANCE_RF_OHM = SYSTEM_IMPEDANCE_OHM;

/** Systemimpedanz der Antennen- und Kabeltechnik des Rundfunks in Ohm. */
export const IMPEDANCE_VIDEO_OHM = 75;

/** Wählbare Bezugsimpedanzen des Pegelrechners in Ohm. */
export const IMPEDANCE_OPTIONS_OHM = [IMPEDANCE_RF_OHM, IMPEDANCE_VIDEO_OHM] as const;

/** Abstand zwischen dBm (Bezug 1 mW) und dBW (Bezug 1 W): 10·log₁₀(1000). */
export const DBM_PER_DBW = 30;

/** 1 V entspricht 10⁶ µV, also 20·log₁₀(10⁶) = 120 dBµV. */
export const DBUV_PER_VOLT = 120;

/** Kennzahl der Leistungsrechnung: 10·log₁₀(x). */
export const POWER_DECADE_FACTOR = 10;

/** Kennzahl der Spannungsrechnung: 20·log₁₀(x). */
export const VOLTAGE_DECADE_FACTOR = 20;

// ============================================================================
// Verhältnisse: dB ↔ Faktor
// ============================================================================

/** dB → Leistungsfaktor 10^(dB/10). */
export function dbToPowerRatio(db: number): number {
  return safePow(10, db / POWER_DECADE_FACTOR, 0);
}

/** dB → Spannungsfaktor 10^(dB/20). */
export function dbToVoltageRatio(db: number): number {
  return safePow(10, db / VOLTAGE_DECADE_FACTOR, 0);
}

/** Leistungsverhältnis → dB (10·log₁₀). */
export function powerRatioToDb(ratio: number): number {
  return POWER_DECADE_FACTOR * safeLog(ratio, 10, -Infinity);
}

/** Spannungsverhältnis → dB (20·log₁₀). */
export function voltageRatioToDb(ratio: number): number {
  return VOLTAGE_DECADE_FACTOR * safeLog(ratio, 10, -Infinity);
}

/** Stützstellen der Merkregel-Tabelle in dB. */
export const DECIBEL_TABLE_STEPS = [0, 1, 2, 3, 6, 10, 20, 30, 40, -3, -6, -10, -20] as const;

export interface DecibelTableRow {
  db: number;
  powerRatio: number;
  voltageRatio: number;
}

/** Baut die Tabelle „dB → Leistungs- und Spannungsfaktor". */
export function buildDecibelTable(
  steps: readonly number[] = DECIBEL_TABLE_STEPS
): DecibelTableRow[] {
  return steps.map((db) => ({
    db,
    powerRatio: dbToPowerRatio(db),
    voltageRatio: dbToVoltageRatio(db)
  }));
}

// ============================================================================
// Absolutpegel: dBm, dBW, dBµV, Spannung
// ============================================================================

/** dBm → dBW: derselbe Pegel, Bezug 1 W statt 1 mW. */
export function dbmToDbw(dbm: number): number {
  return dbm - DBM_PER_DBW;
}

/** dBW → dBm. */
export function dbwToDbm(dbw: number): number {
  return dbw + DBM_PER_DBW;
}

/**
 * Spannung an einer Impedanz aus der Leistung: U = √(P · Z).
 *
 * @param watt Leistung in Watt
 * @param impedanceOhm Bezugsimpedanz in Ohm
 */
export function wattToVolt(watt: number, impedanceOhm: number = IMPEDANCE_RF_OHM): number {
  if (watt <= 0 || impedanceOhm <= 0) return 0;
  return Math.sqrt(watt * impedanceOhm);
}

/**
 * Leistung an einer Impedanz aus der Spannung: P = U² / Z.
 *
 * @param volt Effektivwert der Spannung in Volt
 * @param impedanceOhm Bezugsimpedanz in Ohm
 */
export function voltToWatt(volt: number, impedanceOhm: number = IMPEDANCE_RF_OHM): number {
  if (volt <= 0) return 0;
  return safeDivide(volt * volt, impedanceOhm, 0);
}

/** Spannung → dBµV: 20·log₁₀(U / 1 µV). */
export function voltToDbuv(volt: number): number {
  return VOLTAGE_DECADE_FACTOR * safeLog(volt, 10, -Infinity) + DBUV_PER_VOLT;
}

/** dBµV → Spannung in Volt. */
export function dbuvToVolt(dbuv: number): number {
  return safePow(10, (dbuv - DBUV_PER_VOLT) / VOLTAGE_DECADE_FACTOR, 0);
}

/**
 * Leistungspegel → Spannungspegel an einer Impedanz:
 * dBµV = dBm + 10·log₁₀(Z / Ω) + 90.
 *
 * Herleitung: U = √(P·Z); 20·log₁₀(U·10⁶) = 10·log₁₀(P·Z) + 120 und
 * 10·log₁₀(P/1 mW) = dBm liefert den Summanden 120 − 30 = 90.
 * An 50 Ω sind das rund 107 dB, an 75 Ω rund 108,75 dB.
 *
 * @param dbm Leistungspegel in dBm
 * @param impedanceOhm Bezugsimpedanz in Ohm
 */
export function dbmToDbuv(dbm: number, impedanceOhm: number = IMPEDANCE_RF_OHM): number {
  if (!Number.isFinite(dbm)) return dbm;
  return dbm + dbmToDbuvOffset(impedanceOhm);
}

/** dBµV → dBm an derselben Impedanz. */
export function dbuvToDbm(dbuv: number, impedanceOhm: number = IMPEDANCE_RF_OHM): number {
  if (!Number.isFinite(dbuv)) return dbuv;
  return dbuv - dbmToDbuvOffset(impedanceOhm);
}

/**
 * Abstand zwischen dBm und dBµV an einer Impedanz:
 * 10·log₁₀(Z / Ω) + 90 (an 50 Ω ≈ 106,99 dB).
 */
export function dbmToDbuvOffset(impedanceOhm: number = IMPEDANCE_RF_OHM): number {
  return POWER_DECADE_FACTOR * safeLog(impedanceOhm, 10, 0) + DBUV_PER_VOLT - DBM_PER_DBW;
}

/**
 * Vollständiger Pegelsatz eines Arbeitspunkts. Bezugsgröße ist immer die
 * Leistung in Watt; Spannung und dBµV gelten nur an der genannten Impedanz.
 */
export interface LevelSet {
  /** Leistung in Watt */
  watt: number;
  /** Leistungspegel in dBm (Bezug 1 mW) */
  dbm: number;
  /** Leistungspegel in dBW (Bezug 1 W) */
  dbw: number;
  /** Effektivwert der Spannung in Volt */
  volt: number;
  /** Spannungspegel in dBµV (Bezug 1 µV) */
  dbuv: number;
  /** Zugrunde gelegte Impedanz in Ohm */
  impedanceOhm: number;
}

/**
 * Rechnet einen Leistungspegel in alle übrigen Größen um.
 *
 * @param dbm Leistungspegel in dBm
 * @param impedanceOhm Bezugsimpedanz in Ohm
 */
export function levelsFromDbm(dbm: number, impedanceOhm: number = IMPEDANCE_RF_OHM): LevelSet {
  const watt = Number.isFinite(dbm) ? dbmToWatt(dbm) : 0;
  return {
    watt,
    dbm,
    dbw: dbmToDbw(dbm),
    volt: wattToVolt(watt, impedanceOhm),
    dbuv: dbmToDbuv(dbm, impedanceOhm),
    impedanceOhm
  };
}

// ============================================================================
// Kettenrechnung
// ============================================================================

/** Eine Stufe der Kette: Gewinn (+) oder Verlust (−) in dB. */
export interface ChainStage {
  id: string;
  label: string;
  /** Beitrag in dB; bei der ersten Stufe der Absolutpegel in dBm */
  db: number;
}

/** Eine Stufe mit dem Pegel, der hinter ihr anliegt. */
export interface ChainPoint<S extends ChainStage = ChainStage> {
  stage: S;
  /** Pegel nach dieser Stufe in dBm */
  levelDbm: number;
}

/** Laufende Summe der Kette in dBm. */
export function accumulateChain<S extends ChainStage>(stages: readonly S[]): ChainPoint<S>[] {
  let level = 0;
  return stages.map((stage) => {
    level += stage.db;
    return { stage, levelDbm: level };
  });
}

/** Gesamtpegel am Ende der Kette in dBm. */
export function chainTotalDbm(stages: readonly { db: number }[]): number {
  return stages.reduce((sum, stage) => sum + stage.db, 0);
}

/** Summe aller Gewinne der Kette in dB (Stufen mit positivem Beitrag). */
export function chainGainDb(stages: readonly { db: number }[]): number {
  return stages.reduce((sum, stage) => (stage.db > 0 ? sum + stage.db : sum), 0);
}

/** Summe aller Verluste der Kette in dB (als positive Zahl). */
export function chainLossDb(stages: readonly { db: number }[]): number {
  return stages.reduce((sum, stage) => (stage.db < 0 ? sum - stage.db : sum), 0);
}
