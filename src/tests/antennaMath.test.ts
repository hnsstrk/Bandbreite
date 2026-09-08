import { describe, it, expect } from 'vitest';
import {
  DEG_PER_RAD,
  arrayFactor,
  beamwidthFromGainDeg,
  dbiToDbd,
  effectiveApertureM2,
  farFieldDistanceM,
  fieldToDb,
  frontToBackRatioDb,
  gainDbiFromLinear,
  gainLinearFromDbi,
  gaussianMainLobe,
  halfPowerBeamwidthDeg,
  halfWaveDipolePattern,
  isotropicPattern,
  mainLobeAngleDeg,
  mismatchLossDb,
  parabolicBeamwidthDeg,
  parabolicGainDbi,
  patternField,
  reflectedPowerPercent,
  reflectionFromImpedance,
  reflectionFromVswr,
  returnLossDb,
  samplePattern,
  shortDipolePattern,
  steeringPhaseRad,
  vswrFromReflection,
  wavelengthM
} from '$lib/utils/antennaMath';
import { GAIN_DIPOLE_DBI, SYSTEM_IMPEDANCE_OHM } from '$lib/data/antennas';

const deg = (value: number) => value / DEG_PER_RAD;

describe('Grundumrechnungen', () => {
  it('rechnet Frequenz in Wellenlänge um', () => {
    expect(wavelengthM(300e6)).toBeCloseTo(0.999, 3);
    expect(wavelengthM(0)).toBe(0);
  });

  it('rechnet dBi in dBd um', () => {
    expect(dbiToDbd(GAIN_DIPOLE_DBI)).toBeCloseTo(0, 10);
    expect(dbiToDbd(12.15)).toBeCloseTo(10, 10);
  });

  it('rechnet Gewinn zwischen linear und dB um', () => {
    expect(gainLinearFromDbi(10)).toBeCloseTo(10, 10);
    expect(gainDbiFromLinear(100)).toBeCloseTo(20, 10);
  });

  it('berechnet die Wirkfläche eines isotropen Strahlers', () => {
    // A_eff = λ² / 4π bei G = 1
    const lambda = 0.1;
    expect(effectiveApertureM2(0, lambda)).toBeCloseTo((lambda * lambda) / (4 * Math.PI), 12);
  });

  it('berechnet den Fernfeldbeginn nach 2·D²/λ', () => {
    expect(farFieldDistanceM(1, 0.03)).toBeCloseTo(66.667, 3);
    expect(farFieldDistanceM(1, 0)).toBe(0);
  });
});

describe('Richtdiagramme', () => {
  it('strahlt isotrop in jede Richtung gleich', () => {
    expect(isotropicPattern()).toBe(1);
    expect(patternField({ type: 'isotrop' }, deg(37))).toBe(1);
  });

  it('erreicht beim Halbwellendipol bei 90° das Maximum und bei 0° eine Nullstelle', () => {
    expect(halfWaveDipolePattern(deg(90))).toBeCloseTo(1, 10);
    expect(halfWaveDipolePattern(deg(0))).toBe(0);
    expect(halfWaveDipolePattern(deg(180))).toBe(0);
    expect(halfWaveDipolePattern(deg(45))).toBeGreaterThan(0.6);
    expect(halfWaveDipolePattern(deg(45))).toBeLessThan(1);
  });

  it('bildet den Kurzdipol als Sinus ab', () => {
    expect(shortDipolePattern(deg(90))).toBeCloseTo(1, 10);
    expect(shortDipolePattern(deg(0))).toBeCloseTo(0, 10);
    expect(shortDipolePattern(deg(30))).toBeCloseTo(0.5, 10);
  });

  it('liefert für den Halbwellendipol rund 78° Halbwertsbreite', () => {
    const samples = samplePattern({ type: 'dipol' }, 0.5);
    expect(halfPowerBeamwidthDeg(samples)).toBeGreaterThan(76);
    expect(halfPowerBeamwidthDeg(samples)).toBeLessThan(80);
  });

  it('hält bei der Gaußkeule die vorgegebene Halbwertsbreite ein', () => {
    const HPBW = 30;
    expect(gaussianMainLobe(0, HPBW)).toBeCloseTo(1, 10);
    expect(gaussianMainLobe(deg(HPBW / 2), HPBW)).toBeCloseTo(Math.SQRT1_2, 6);
    expect(fieldToDb(gaussianMainLobe(deg(HPBW / 2), HPBW))).toBeCloseTo(-3.0103, 3);
  });

  it('misst die Halbwertsbreite einer Parabolkeule zurück', () => {
    const samples = samplePattern({ type: 'parabol', beamwidthDeg: 20 }, 0.25);
    expect(halfPowerBeamwidthDeg(samples)).toBeCloseTo(20, 0);
  });

  it('weist einer Yagi ein Vor-Rück-Verhältnis zu', () => {
    const samples = samplePattern({ type: 'yagi', beamwidthDeg: 45, frontToBackDb: 20 }, 0.5);
    expect(mainLobeAngleDeg(samples)).toBeCloseTo(0, 6);
    expect(frontToBackRatioDb(samples)).toBeCloseTo(20, 0);
  });

  it('begrenzt den Pegel nach unten auf −40 dB', () => {
    expect(fieldToDb(1)).toBeCloseTo(0, 10);
    expect(fieldToDb(0)).toBe(-40);
    expect(fieldToDb(0.001)).toBe(-40);
  });
});

describe('Gruppenantenne', () => {
  it('hat bei N = 4 und d = λ/2 die Hauptkeule quer zur Achse', () => {
    const spacing = 0.5;
    const beta = steeringPhaseRad(spacing, 90);
    expect(beta).toBeCloseTo(0, 10);
    expect(arrayFactor(4, spacing, beta, deg(90))).toBeCloseTo(1, 10);
    expect(arrayFactor(4, spacing, beta, deg(0))).toBeLessThan(0.3);

    const samples = samplePattern(
      { type: 'array', elementCount: 4, spacingWavelengths: spacing, steerDeg: 90 },
      0.5
    );
    expect(mainLobeAngleDeg(samples)).toBeCloseTo(90, 6);
  });

  it('erzeugt bei einem Element keinen Richteffekt', () => {
    expect(arrayFactor(1, 0.5, 0, deg(0))).toBe(1);
    expect(arrayFactor(1, 0.5, 0, deg(90))).toBe(1);
  });

  it('schwenkt die Hauptkeule mit dem Phasenschub', () => {
    const spacing = 0.5;
    const STEER_DEG = 60;
    const beta = steeringPhaseRad(spacing, STEER_DEG);
    expect(arrayFactor(8, spacing, beta, deg(STEER_DEG))).toBeCloseTo(1, 10);

    const samples = samplePattern(
      { type: 'array', elementCount: 8, spacingWavelengths: spacing, steerDeg: STEER_DEG },
      0.5
    );
    expect(mainLobeAngleDeg(samples)).toBeCloseTo(STEER_DEG, 0);
  });

  it('macht die Keule mit wachsender Elementzahl schmaler', () => {
    const narrow = halfPowerBeamwidthDeg(
      samplePattern(
        { type: 'array', elementCount: 16, spacingWavelengths: 0.5, steerDeg: 90 },
        0.25
      )
    );
    const wide = halfPowerBeamwidthDeg(
      samplePattern({ type: 'array', elementCount: 4, spacingWavelengths: 0.5, steerDeg: 90 }, 0.25)
    );
    expect(narrow).toBeLessThan(wide);
  });
});

describe('Parabolantenne', () => {
  it('liefert für D = 1 m bei 10 GHz und η = 0,55 rund 37,8 dBi', () => {
    const lambda = wavelengthM(10e9);
    const gain = parabolicGainDbi(1, lambda, 0.55);
    expect(gain).toBeGreaterThan(37.5);
    expect(gain).toBeLessThan(38.1);
    expect(gain).toBeCloseTo(37.81, 1);
  });

  it('gewinnt bei doppeltem Durchmesser 6 dB', () => {
    const lambda = wavelengthM(10e9);
    expect(parabolicGainDbi(2, lambda, 0.55) - parabolicGainDbi(1, lambda, 0.55)).toBeCloseTo(
      6.0206,
      3
    );
  });

  it('berechnet den Öffnungswinkel nach 70°·λ/D', () => {
    const lambda = wavelengthM(10e9);
    expect(parabolicBeamwidthDeg(1, lambda)).toBeCloseTo(2.0985, 3);
  });

  it('bringt Gewinn und Öffnungswinkel in Einklang', () => {
    // 70°·λ/D und sqrt(41253/G) dürfen sich nur um einen kleinen Faktor unterscheiden
    const lambda = wavelengthM(10e9);
    const fromGain = beamwidthFromGainDeg(parabolicGainDbi(1, lambda, 0.55));
    const fromDiameter = parabolicBeamwidthDeg(1, lambda);
    expect(fromGain / fromDiameter).toBeGreaterThan(0.8);
    expect(fromGain / fromDiameter).toBeLessThan(1.4);
  });
});

describe('Anpassung', () => {
  it('rechnet SWR 2 in Reflexionsfaktor 1/3 und 9,54 dB Rückflussdämpfung um', () => {
    const gamma = reflectionFromVswr(2);
    expect(gamma).toBeCloseTo(1 / 3, 10);
    expect(returnLossDb(gamma)).toBeCloseTo(9.542, 3);
    expect(reflectedPowerPercent(gamma)).toBeCloseTo(11.111, 3);
    expect(mismatchLossDb(gamma)).toBeCloseTo(0.5115, 3);
  });

  it('ist zwischen SWR und Reflexionsfaktor umkehrbar', () => {
    for (const vswr of [1, 1.5, 2, 3, 5, 10]) {
      expect(vswrFromReflection(reflectionFromVswr(vswr))).toBeCloseTo(vswr, 8);
    }
  });

  it('meldet bei perfekter Anpassung keine Reflexion', () => {
    expect(reflectionFromVswr(1)).toBe(0);
    expect(returnLossDb(0)).toBe(Infinity);
    expect(reflectedPowerPercent(0)).toBe(0);
    expect(mismatchLossDb(0)).toBe(0);
  });

  it('berechnet den Reflexionsfaktor aus den Impedanzen', () => {
    expect(reflectionFromImpedance(SYSTEM_IMPEDANCE_OHM, SYSTEM_IMPEDANCE_OHM)).toBe(0);
    // 100 Ohm an 50 Ohm ergibt Γ = 1/3, also SWR 2
    const gamma = reflectionFromImpedance(100, SYSTEM_IMPEDANCE_OHM);
    expect(gamma).toBeCloseTo(1 / 3, 10);
    expect(vswrFromReflection(gamma)).toBeCloseTo(2, 8);
  });
});
