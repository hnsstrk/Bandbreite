/**
 * Strahlungsleistung, Leistungsdichte und Feldstärke ($lib/utils/fieldStrength).
 *
 * Prüfstein sind die beiden Referenzfälle der Lehrbücher:
 *  - 1 W an einer isotropen Antenne erzeugt in 1 m Abstand 5,48 V/m,
 *  - ein EIRP von 1 W entspricht einem ERP von 0,61 W (2,15 dB Unterschied).
 */

import { describe, it, expect } from 'vitest';
import {
  DIPOLE_GAIN_LINEAR,
  FIELD_STRENGTH_DISTANCES_M,
  FIELD_STRENGTH_FACTOR,
  FIELD_STRENGTH_LIMITS,
  SPHERE_SOLID_ANGLE,
  computeFieldStrength,
  dbuvPerMToField,
  eirpDbm,
  eirpWatt,
  erpDbm,
  erpWatt,
  fieldStrengthDbuvPerM,
  fieldStrengthFromDensity,
  fieldStrengthVPerM,
  magneticFieldAPerM,
  powerDensityFromField,
  powerDensityWattPerM2,
  receivedPowerWatt
} from '$lib/utils/fieldStrength';
import { FREE_SPACE_IMPEDANCE } from '$lib/data/constants';
import { GAIN_DIPOLE_DBI } from '$lib/data/antennas';
import { effectiveApertureM2, wavelengthM } from '$lib/utils/antennaMath';

describe('Konstanten', () => {
  it('leitet den Zahlenwert 30 der klassischen Formel aus Z₀ ab', () => {
    expect(FIELD_STRENGTH_FACTOR).toBeCloseTo(FREE_SPACE_IMPEDANCE / SPHERE_SOLID_ANGLE, 12);
    expect(FIELD_STRENGTH_FACTOR).toBeCloseTo(29.98, 2);
  });

  it('kennt den Dipolgewinn als Faktor (2,15 dB ≈ 1,64)', () => {
    expect(DIPOLE_GAIN_LINEAR).toBeCloseTo(1.64, 2);
    expect(10 * Math.log10(DIPOLE_GAIN_LINEAR)).toBeCloseTo(GAIN_DIPOLE_DBI, 6);
  });

  it('führt sinnvolle Reglergrenzen und Vergleichsabstände', () => {
    for (const limit of Object.values(FIELD_STRENGTH_LIMITS)) {
      expect(limit.min).toBeLessThan(limit.default);
      expect(limit.default).toBeLessThanOrEqual(limit.max);
    }
    expect([...FIELD_STRENGTH_DISTANCES_M]).toEqual([1, 10, 100, 1000, 10_000]);
  });
});

describe('EIRP und ERP', () => {
  it('multipliziert Leistung und Gewinn', () => {
    expect(eirpWatt(1, 0)).toBeCloseTo(1, 9);
    expect(eirpWatt(1, 10)).toBeCloseTo(10, 6);
    expect(eirpWatt(10, 3)).toBeCloseTo(19.9526, 3);
  });

  it('liefert für 1 W EIRP genau 0,61 W ERP', () => {
    expect(erpWatt(eirpWatt(1, 0))).toBeCloseTo(0.61, 2);
  });

  it('trennt EIRP und ERP um den Dipolgewinn', () => {
    expect(eirpDbm(1, 0)).toBeCloseTo(30, 6);
    expect(eirpDbm(1, 0) - erpDbm(1, 0)).toBeCloseTo(GAIN_DIPOLE_DBI, 9);
    expect(erpDbm(1, 12)).toBeCloseTo(30 + 12 - GAIN_DIPOLE_DBI, 6);
  });

  it('gibt bei unsinniger Leistung null zurück', () => {
    expect(eirpWatt(0, 20)).toBe(0);
    expect(eirpWatt(-5, 20)).toBe(0);
    expect(erpWatt(0)).toBe(0);
  });
});

describe('Leistungsdichte', () => {
  it('verteilt das EIRP auf die Kugelfläche', () => {
    expect(powerDensityWattPerM2(1, 1)).toBeCloseTo(1 / (4 * Math.PI), 12);
    expect(powerDensityWattPerM2(4 * Math.PI, 1)).toBeCloseTo(1, 9);
  });

  it('folgt dem 1/d²-Gesetz', () => {
    const nah = powerDensityWattPerM2(10, 100);
    const fern = powerDensityWattPerM2(10, 200);
    expect(nah / fern).toBeCloseTo(4, 6);
  });

  it('schützt vor Abstand null', () => {
    expect(powerDensityWattPerM2(10, 0)).toBe(0);
    expect(powerDensityWattPerM2(10, -1)).toBe(0);
  });
});

describe('Feldstärke', () => {
  it('liefert den Referenzfall 1 W, 0 dBi, 1 m → 5,48 V/m', () => {
    expect(fieldStrengthVPerM(eirpWatt(1, 0), 1)).toBeCloseTo(5.48, 2);
  });

  it('stimmt mit dem Weg über die Leistungsdichte überein', () => {
    const eirp = eirpWatt(25, 14);
    const direkt = fieldStrengthVPerM(eirp, 250);
    const ueberDichte = fieldStrengthFromDensity(powerDensityWattPerM2(eirp, 250));
    expect(direkt).toBeCloseTo(ueberDichte, 12);
  });

  it('rechnet Feldstärke und Leistungsdichte verlustfrei hin und zurück', () => {
    const dichte = powerDensityFromField(5.48);
    expect(fieldStrengthFromDensity(dichte)).toBeCloseTo(5.48, 9);
    expect(dichte).toBeCloseTo(5.48 * 5.48 / FREE_SPACE_IMPEDANCE, 12);
  });

  it('koppelt E und H über den Feldwellenwiderstand', () => {
    expect(magneticFieldAPerM(FREE_SPACE_IMPEDANCE)).toBeCloseTo(1, 9);
  });

  it('fällt mit 1/d, also 20 dB je Dekade', () => {
    const eirp = eirpWatt(10, 8);
    expect(fieldStrengthVPerM(eirp, 10)).toBeCloseTo(fieldStrengthVPerM(eirp, 1) / 10, 9);
    const nah = fieldStrengthDbuvPerM(fieldStrengthVPerM(eirp, 100));
    const fern = fieldStrengthDbuvPerM(fieldStrengthVPerM(eirp, 1000));
    expect(nah - fern).toBeCloseTo(20, 6);
  });

  it('kostet die doppelte Entfernung 6,02 dB', () => {
    const eirp = eirpWatt(1, 0);
    const a = fieldStrengthDbuvPerM(fieldStrengthVPerM(eirp, 50));
    const b = fieldStrengthDbuvPerM(fieldStrengthVPerM(eirp, 100));
    expect(a - b).toBeCloseTo(20 * Math.log10(2), 6);
  });
});

describe('Feldstärkepegel in dBµV/m', () => {
  it('setzt 1 V/m auf 120 dBµV/m', () => {
    expect(fieldStrengthDbuvPerM(1)).toBeCloseTo(120, 9);
    expect(fieldStrengthDbuvPerM(1e-6)).toBeCloseTo(0, 9);
  });

  it('rechnet hin und zurück', () => {
    expect(dbuvPerMToField(fieldStrengthDbuvPerM(0.0135))).toBeCloseTo(0.0135, 9);
  });

  it('liefert für Feldstärke null keinen endlichen Pegel', () => {
    expect(fieldStrengthDbuvPerM(0)).toBe(-Infinity);
  });
});

describe('Empfangsseite', () => {
  it('nutzt die Wirkfläche A = G·λ²/(4π)', () => {
    const lambda = wavelengthM(900e6);
    expect(effectiveApertureM2(0, lambda)).toBeCloseTo((lambda * lambda) / (4 * Math.PI), 12);
  });

  it('multipliziert Leistungsdichte und Wirkfläche', () => {
    expect(receivedPowerWatt(2, 0.5)).toBeCloseTo(1, 12);
    expect(receivedPowerWatt(0, 0.5)).toBe(0);
    expect(receivedPowerWatt(2, 0)).toBe(0);
  });
});

describe('computeFieldStrength', () => {
  const ergebnis = computeFieldStrength({
    txPowerW: 10,
    gainDbi: 8,
    distanceM: 100,
    frequencyHz: 900e6
  });

  it('rechnet den Arbeitspunkt vollständig durch', () => {
    expect(ergebnis.eirpW).toBeCloseTo(10 * Math.pow(10, 0.8), 6);
    expect(ergebnis.eirpDbm).toBeCloseTo(40 + 8, 6);
    expect(ergebnis.erpDbm).toBeCloseTo(ergebnis.eirpDbm - GAIN_DIPOLE_DBI, 9);
    expect(ergebnis.powerDensityW).toBeCloseTo(
      powerDensityWattPerM2(ergebnis.eirpW, 100),
      12
    );
    expect(ergebnis.fieldDbuvPerM).toBeCloseTo(fieldStrengthDbuvPerM(ergebnis.fieldVPerM), 12);
    expect(ergebnis.receivedW).toBeCloseTo(ergebnis.powerDensityW * ergebnis.apertureM2, 15);
  });

  it('lässt Wirkfläche und Empfangsleistung ohne Frequenz weg', () => {
    const ohne = computeFieldStrength({ txPowerW: 10, gainDbi: 8, distanceM: 100 });
    expect(ohne.apertureM2).toBe(0);
    expect(ohne.receivedW).toBe(0);
    expect(ohne.fieldVPerM).toBeCloseTo(ergebnis.fieldVPerM, 12);
  });

  it('bleibt bei unsinnigen Eingaben endlich', () => {
    const leer = computeFieldStrength({ txPowerW: 0, gainDbi: 0, distanceM: 0 });
    expect(leer.eirpW).toBe(0);
    expect(leer.powerDensityW).toBe(0);
    expect(leer.fieldVPerM).toBe(0);
    expect(leer.magneticAPerM).toBe(0);
  });
});
