/**
 * Logik des dB-Spielplatzes (W10): Umrechnung dB ↔ Faktor (Leistung/Spannung),
 * Merkregeln und eine Kettenrechnung (Mini-Link-Budget).
 */
import { safeLog, safePow } from '$lib/utils/handlers';

/** Typische Empfängerempfindlichkeit als Referenzlinie der Kettenrechnung in dBm */
export const TYPICAL_RX_SENSITIVITY_DBM = -90;

/** Reglerbereich in dB */
export const DECIBEL_LIMITS = { min: -40, max: 40, default: 3 } as const;

/** dB → Leistungsfaktor 10^(dB/10) */
export function dbToPowerRatio(db: number): number {
  return safePow(10, db / 10, 0);
}

/** dB → Spannungsfaktor 10^(dB/20) */
export function dbToVoltageRatio(db: number): number {
  return safePow(10, db / 20, 0);
}

/** Leistungsverhältnis → dB (10·log₁₀) */
export function powerRatioToDb(ratio: number): number {
  return 10 * safeLog(ratio, 10, -Infinity);
}

/** Spannungsverhältnis → dB (20·log₁₀) */
export function voltageRatioToDb(ratio: number): number {
  return 20 * safeLog(ratio, 10, -Infinity);
}

/** Merkregeln, die als Chips angeboten werden */
export const DECIBEL_RULES = [
  { db: 3, label: '+3 dB = ×2 Leistung' },
  { db: 6, label: '+6 dB = ×4 Leistung (×2 Spannung)' },
  { db: 10, label: '+10 dB = ×10 Leistung' },
  { db: 20, label: '+20 dB = ×100 Leistung' },
  { db: -3, label: '−3 dB = Leistung halbiert' },
  { db: -10, label: '−10 dB = ein Zehntel' }
] as const;

/** Stützstellen der Umrechnungstabelle */
export const DECIBEL_TABLE_STEPS = [0, 1, 2, 3, 6, 10, 20, 30, 40, -3, -6, -10, -20] as const;

export interface DecibelTableRow {
  db: number;
  powerRatio: number;
  voltageRatio: number;
}

export function buildDecibelTable(steps: readonly number[] = DECIBEL_TABLE_STEPS): DecibelTableRow[] {
  return steps.map((db) => ({
    db,
    powerRatio: dbToPowerRatio(db),
    voltageRatio: dbToVoltageRatio(db)
  }));
}

export interface ChainStage {
  id: string;
  label: string;
  /** Gewinn (+) oder Verlust (−) in dB; für die Sendeleistung der Absolutpegel in dBm */
  db: number;
  min: number;
  max: number;
}

/** Standardkette: Sender → Kabel → Antenne → Strecke → Antenne → Empfänger */
export const DEFAULT_CHAIN: ChainStage[] = [
  { id: 'tx', label: 'Sendeleistung (dBm)', db: 20, min: -10, max: 40 },
  { id: 'cable', label: 'Kabelverlust', db: -3, min: -20, max: 0 },
  { id: 'txAntenna', label: 'Sendeantenne', db: 12, min: 0, max: 40 },
  { id: 'path', label: 'Freiraumdämpfung', db: -100, min: -160, max: -40 },
  { id: 'rxAntenna', label: 'Empfangsantenne', db: 12, min: 0, max: 40 }
];

export interface ChainPoint {
  stage: ChainStage;
  /** Pegel nach dieser Stufe in dBm */
  levelDbm: number;
}

/** Laufende Summe der Kette in dBm */
export function accumulateChain(stages: readonly ChainStage[]): ChainPoint[] {
  let level = 0;
  return stages.map((stage) => {
    level += stage.db;
    return { stage, levelDbm: level };
  });
}

/** Gesamtpegel am Ende der Kette in dBm */
export function chainTotalDbm(stages: readonly ChainStage[]): number {
  return stages.reduce((sum, stage) => sum + stage.db, 0);
}
