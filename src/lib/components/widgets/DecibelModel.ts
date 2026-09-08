/**
 * Logik des dB-Spielplatzes (W10): Merkregeln, Reglerbereiche und die
 * Standardkette (Mini-Link-Budget).
 *
 * Gerechnet wird nicht hier: Umrechnung dB ↔ Faktor, die Merkregel-Tabelle
 * und die Kettensumme stehen in `$lib/utils/decibel` und werden von diesem
 * Modul nur weitergereicht — derselbe Rechenkern trägt den Pegelrechner
 * unter `/rechner/dezibel/`.
 */
import {
  accumulateChain,
  buildDecibelTable,
  chainTotalDbm,
  dbToPowerRatio,
  dbToVoltageRatio,
  powerRatioToDb,
  voltageRatioToDb,
  DECIBEL_TABLE_STEPS,
  type ChainPoint,
  type ChainStage as BaseChainStage,
  type DecibelTableRow
} from '$lib/utils/decibel';

export {
  accumulateChain,
  buildDecibelTable,
  chainTotalDbm,
  dbToPowerRatio,
  dbToVoltageRatio,
  powerRatioToDb,
  voltageRatioToDb,
  DECIBEL_TABLE_STEPS
};
export type { ChainPoint, DecibelTableRow };

/** Typische Empfängerempfindlichkeit als Referenzlinie der Kettenrechnung in dBm */
export const TYPICAL_RX_SENSITIVITY_DBM = -90;

/** Reglerbereich in dB */
export const DECIBEL_LIMITS = { min: -40, max: 40, default: 3 } as const;

/** Merkregeln, die als Chips angeboten werden */
export const DECIBEL_RULES = [
  { db: 3, label: '+3 dB = ×2 Leistung' },
  { db: 6, label: '+6 dB = ×4 Leistung (×2 Spannung)' },
  { db: 10, label: '+10 dB = ×10 Leistung' },
  { db: 20, label: '+20 dB = ×100 Leistung' },
  { db: -3, label: '−3 dB = Leistung halbiert' },
  { db: -10, label: '−10 dB = ein Zehntel' }
] as const;

/** Eine Stufe der Kette mit den Grenzen ihres Reglers. */
export interface ChainStage extends BaseChainStage {
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
