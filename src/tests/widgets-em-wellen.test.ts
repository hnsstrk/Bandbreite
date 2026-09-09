/**
 * Rechenmodelle der beiden neuen Widgets im Kapitel „Elektromagnetische
 * Wellen": Zonengrenzen um eine Antenne (NearFarFieldModel) und
 * Polarisationsverlust bei Verdrehung (PolarizationLossModel).
 *
 * Referenzwerte: Balanis, Antenna Theory, Abschnitt 2.2.4 (Zonengrenzen);
 * Pozar, Microwave Engineering (Polarisationsverlustfaktor cos²α).
 */
import { describe, it, expect } from 'vitest';
import {
  NEAR_FAR_LIMITS,
  REACTIVE_FACTOR,
  decadeTicks,
  isElectricallyLarge,
  logPosition,
  radiatingNearFieldStartM,
  reactiveBoundaryM,
  zoneAt,
  zoneBoundaries
} from '$lib/components/widgets/NearFarFieldModel';
import {
  TILT_LIMITS,
  circularLossDb,
  lossCurve,
  lossDbFromFactor,
  projectedFieldFactor,
  tiltLossFactor,
  tiltLossPercent,
  tiltResult,
  toRadians
} from '$lib/components/widgets/PolarizationLossModel';
import { CROSS_POLARIZATION_LOSS_DB } from '$lib/components/widgets/EmWaveModel';
import { SPEED_OF_LIGHT } from '$lib/data/constants';

const GHZ = 1e9;
/** λ bei 1 GHz = 0,299 792 458 m */
const LAMBDA_1GHZ = SPEED_OF_LIGHT / GHZ;

describe('NearFarFieldModel: Zonengrenzen', () => {
  it('rechnet die Grenzen einer 1-m-Apertur bei 1 GHz (Balanis)', () => {
    const bounds = zoneBoundaries(GHZ, 1);
    expect(bounds.wavelengthM).toBeCloseTo(0.299_792_458, 9);
    // λ/2π
    expect(bounds.lambdaOverTwoPiM).toBeCloseTo(LAMBDA_1GHZ / (2 * Math.PI), 6);
    expect(bounds.lambdaOverTwoPiM).toBeCloseTo(0.047_714, 5);
    // 0,62·√(D³/λ)
    expect(bounds.radiatingStartM).toBeCloseTo(0.62 * Math.sqrt(1 / LAMBDA_1GHZ), 6);
    expect(bounds.radiatingStartM).toBeCloseTo(1.132_4, 3);
    // 2·D²/λ
    expect(bounds.farFieldStartM).toBeCloseTo(2 / LAMBDA_1GHZ, 4);
    expect(bounds.farFieldStartM).toBeCloseTo(6.671_3, 3);
    expect(bounds.apertureInWavelengths).toBeCloseTo(3.336, 3);
  });

  it('benutzt den Balanis-Vorfaktor 0,62', () => {
    expect(REACTIVE_FACTOR).toBe(0.62);
    expect(radiatingNearFieldStartM(2, 0.5)).toBeCloseTo(0.62 * Math.sqrt(8 / 0.5), 9);
    expect(radiatingNearFieldStartM(0, 0.5)).toBe(0);
  });

  it('nimmt bei elektrisch kleinen Antennen λ/2π als reaktive Grenze', () => {
    // D = 5 cm bei 100 MHz: λ = 3 m, 0,62·√(D³/λ) ≈ 4 mm, λ/2π ≈ 0,477 m
    const boundary = reactiveBoundaryM(0.05, 3);
    expect(boundary).toBeCloseTo(3 / (2 * Math.PI), 6);
    expect(isElectricallyLarge(zoneBoundaries(100e6, 0.05))).toBe(false);
    expect(isElectricallyLarge(zoneBoundaries(GHZ, 1))).toBe(true);
  });

  it('ordnet einen Beobachtungspunkt der richtigen Zone zu', () => {
    const bounds = zoneBoundaries(GHZ, 1);
    expect(zoneAt(0.5, bounds)).toBe('reaktiv');
    expect(zoneAt(3, bounds)).toBe('strahlend');
    expect(zoneAt(10, bounds)).toBe('fern');
    expect(zoneAt(bounds.farFieldStartM, bounds)).toBe('fern');
  });

  it('hält die Grenzen in der Reihenfolge reaktiv < fern', () => {
    for (const frequency of [1e6, 1e8, 1e10, 1e11]) {
      for (const aperture of [0.02, 0.6, 10]) {
        const bounds = zoneBoundaries(frequency, aperture);
        expect(bounds.reactiveEndM, `${frequency}/${aperture}`).toBeLessThanOrEqual(
          bounds.farFieldStartM
        );
      }
    }
  });

  it('bildet Abstände logarithmisch auf 0 … 1 ab und klemmt außerhalb', () => {
    expect(logPosition(0.1, 0.1, 100)).toBeCloseTo(0, 9);
    expect(logPosition(1, 0.1, 100)).toBeCloseTo(1 / 3, 9);
    expect(logPosition(100, 0.1, 100)).toBeCloseTo(1, 9);
    expect(logPosition(1000, 0.1, 100)).toBe(1);
    expect(logPosition(0, 0.1, 100)).toBe(0);
  });

  it('setzt Dekadenmarken innerhalb des Bereichs', () => {
    expect(decadeTicks(0.05, 500)).toEqual([0.1, 1, 10, 100]);
    expect(decadeTicks(0, 10)).toEqual([]);
  });

  it('nennt sinnvolle Reglergrenzen', () => {
    expect(NEAR_FAR_LIMITS.frequencyHz.min).toBeLessThan(NEAR_FAR_LIMITS.frequencyHz.default);
    expect(NEAR_FAR_LIMITS.frequencyHz.default).toBeLessThan(NEAR_FAR_LIMITS.frequencyHz.max);
    expect(NEAR_FAR_LIMITS.apertureM.min).toBeGreaterThan(0);
  });
});

describe('PolarizationLossModel: cos²α', () => {
  it('liefert die Lehrbuchwerte für 0°, 45°, 60° und 90°', () => {
    expect(tiltLossFactor(0)).toBeCloseTo(1, 12);
    expect(tiltLossFactor(45)).toBeCloseTo(0.5, 12);
    expect(tiltLossFactor(60)).toBeCloseTo(0.25, 12);
    expect(tiltLossFactor(90)).toBeCloseTo(0, 12);

    expect(tiltResult(0).lossDb).toBeCloseTo(0, 9);
    expect(tiltResult(45).lossDb).toBeCloseTo(3.0103, 4);
    expect(tiltResult(60).lossDb).toBeCloseTo(6.0206, 4);
    expect(tiltResult(30).lossDb).toBeCloseTo(1.2494, 4);
  });

  it('begrenzt den Verlust bei 90° auf die praktische Entkopplung', () => {
    const result = tiltResult(90);
    expect(result.lossDb).toBe(CROSS_POLARIZATION_LOSS_DB);
    expect(result.capped).toBe(true);
    expect(tiltResult(45).capped).toBe(false);
    expect(lossDbFromFactor(0)).toBe(CROSS_POLARIZATION_LOSS_DB);
  });

  it('rechnet Leistungsanteil und Feldanteil ineinander um', () => {
    expect(tiltLossPercent(60)).toBeCloseTo(25, 9);
    expect(projectedFieldFactor(60)).toBeCloseTo(0.5, 12);
    expect(projectedFieldFactor(45)).toBeCloseTo(Math.SQRT1_2, 12);
    expect(projectedFieldFactor(45) ** 2).toBeCloseTo(tiltLossFactor(45), 12);
    expect(lossDbFromFactor(0.5)).toBeCloseTo(3.0103, 4);
    expect(toRadians(180)).toBeCloseTo(Math.PI, 12);
  });

  it('nennt für zirkulare Gegenstellen die festen 3,01 dB', () => {
    expect(circularLossDb()).toBeCloseTo(3.0103, 4);
  });

  it('liefert eine monoton steigende Verlustkurve über den ganzen Winkelbereich', () => {
    const curve = lossCurve();
    expect(curve).toHaveLength(91);
    expect(curve[0].angleDeg).toBe(0);
    expect(curve[curve.length - 1].angleDeg).toBe(TILT_LIMITS.angleDeg.max);
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].lossDb, `${curve[i].angleDeg}°`).toBeGreaterThanOrEqual(curve[i - 1].lossDb);
    }
  });
});
