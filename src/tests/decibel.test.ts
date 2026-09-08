/**
 * Rechenkern der Pegelrechnung (`$lib/utils/decibel`).
 *
 * Verglichen werden Zahlenwerte, nie formatierte Zeichenketten.
 */

import { describe, it, expect } from 'vitest';
import {
  DBM_PER_DBW,
  DBUV_PER_VOLT,
  IMPEDANCE_RF_OHM,
  IMPEDANCE_VIDEO_OHM,
  accumulateChain,
  buildDecibelTable,
  chainGainDb,
  chainLossDb,
  chainTotalDbm,
  dbToPowerRatio,
  dbToVoltageRatio,
  dbmToDbuv,
  dbmToDbuvOffset,
  dbmToDbw,
  dbuvToDbm,
  dbuvToVolt,
  dbwToDbm,
  levelsFromDbm,
  powerRatioToDb,
  voltToDbuv,
  voltToWatt,
  voltageRatioToDb,
  wattToVolt
} from '$lib/utils/decibel';
import { dbmToWatt, wattToDbm } from '$lib/utils/conversions';

describe('Verhältnis und Dezibel', () => {
  it('rechnet die Merkregeln korrekt', () => {
    expect(dbToPowerRatio(3)).toBeCloseTo(1.9953, 4);
    expect(dbToPowerRatio(10)).toBeCloseTo(10, 10);
    expect(dbToPowerRatio(-10)).toBeCloseTo(0.1, 10);
    expect(dbToVoltageRatio(6)).toBeCloseTo(1.9953, 4);
    expect(dbToVoltageRatio(20)).toBeCloseTo(10, 10);
  });

  it('ist in beide Richtungen konsistent', () => {
    expect(powerRatioToDb(dbToPowerRatio(7.5))).toBeCloseTo(7.5, 10);
    expect(voltageRatioToDb(dbToVoltageRatio(-12.5))).toBeCloseTo(-12.5, 10);
  });

  it('zählt Spannungen mit 20·log₁₀', () => {
    expect(voltageRatioToDb(2)).toBeCloseTo(6.0206, 4);
    expect(powerRatioToDb(2)).toBeCloseTo(3.0103, 4);
  });

  it('baut eine Tabelle aus den gewünschten Stufen', () => {
    const rows = buildDecibelTable([0, 10, -3]);
    expect(rows).toHaveLength(3);
    expect(rows[0].powerRatio).toBeCloseTo(1, 10);
    expect(rows[1].powerRatio).toBeCloseTo(10, 10);
    expect(rows[2].powerRatio).toBeCloseTo(0.5012, 4);
  });
});

describe('Absolutpegel', () => {
  it('setzt 1 W gleich 30 dBm und 0 dBW', () => {
    expect(wattToDbm(1)).toBeCloseTo(30, 10);
    expect(dbmToDbw(30)).toBeCloseTo(0, 10);
    expect(dbwToDbm(0)).toBeCloseTo(30, 10);
    expect(DBM_PER_DBW).toBe(30);
  });

  it('rechnet 0 dBm an 50 Ω in rund 107 dBµV um', () => {
    expect(dbmToDbuvOffset(IMPEDANCE_RF_OHM)).toBeCloseTo(106.9897, 4);
    expect(dbmToDbuv(0, IMPEDANCE_RF_OHM)).toBeCloseTo(106.9897, 4);
    // 1 W = 30 dBm entspricht rund 137 dBµV an 50 Ω
    expect(dbmToDbuv(wattToDbm(1), IMPEDANCE_RF_OHM)).toBeCloseTo(136.9897, 4);
  });

  it('berücksichtigt die Bezugsimpedanz', () => {
    expect(dbmToDbuv(0, IMPEDANCE_VIDEO_OHM)).toBeCloseTo(108.7506, 4);
    expect(dbuvToDbm(dbmToDbuv(-70, IMPEDANCE_VIDEO_OHM), IMPEDANCE_VIDEO_OHM)).toBeCloseTo(
      -70,
      10
    );
  });

  it('verknüpft Leistung und Spannung über die Impedanz', () => {
    expect(wattToVolt(1, 50)).toBeCloseTo(Math.sqrt(50), 10);
    expect(voltToWatt(Math.sqrt(50), 50)).toBeCloseTo(1, 10);
    expect(voltToDbuv(1)).toBeCloseTo(DBUV_PER_VOLT, 10);
    expect(dbuvToVolt(DBUV_PER_VOLT)).toBeCloseTo(1, 10);
    // Der Weg über die Spannung liefert denselben dBµV-Wert wie der über dBm.
    expect(voltToDbuv(wattToVolt(1, 50))).toBeCloseTo(dbmToDbuv(30, 50), 8);
  });

  it('liefert einen vollständigen Pegelsatz', () => {
    const levels = levelsFromDbm(30, IMPEDANCE_RF_OHM);
    expect(levels.watt).toBeCloseTo(1, 10);
    expect(levels.dbw).toBeCloseTo(0, 10);
    expect(levels.dbuv).toBeCloseTo(136.9897, 4);
    expect(levels.volt).toBeCloseTo(7.0711, 4);
    expect(levels.impedanceOhm).toBe(IMPEDANCE_RF_OHM);
  });

  it('bleibt bei kleinen Pegeln stabil', () => {
    const levels = levelsFromDbm(-100);
    expect(levels.watt).toBeCloseTo(dbmToWatt(-100), 20);
    expect(levels.dbuv).toBeCloseTo(6.9897, 4);
  });
});

describe('Kettenrechnung', () => {
  const kette = [
    { id: 'tx', label: 'Sender', db: 20 },
    { id: 'cable', label: 'Kabel', db: -3 },
    { id: 'ant', label: 'Antenne', db: 12 },
    { id: 'path', label: 'Strecke', db: -100 }
  ];

  it('summiert die Stufen laufend auf', () => {
    const punkte = accumulateChain(kette);
    expect(punkte.map((p) => p.levelDbm)).toEqual([20, 17, 29, -71]);
  });

  it('nennt Gesamtpegel, Gewinne und Verluste', () => {
    expect(chainTotalDbm(kette)).toBe(-71);
    expect(chainGainDb(kette)).toBe(32);
    expect(chainLossDb(kette)).toBe(103);
  });

  it('behandelt die leere Kette', () => {
    expect(accumulateChain([])).toEqual([]);
    expect(chainTotalDbm([])).toBe(0);
  });
});
