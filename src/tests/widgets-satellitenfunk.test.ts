/**
 * Rechenmodell des Satellitenfunk-Widgets „LEO-Überflug".
 * Geprüft wird gegen die Bahnmechanik in `$lib/utils/orbitMath` und gegen
 * bekannte Größenordnungen (ISS in 400 km: rund 10 min Überflug im Zenit,
 * ±3,7 kHz Doppler auf 145,8 MHz).
 */
import { describe, it, expect } from 'vitest';
import {
  elevationForCentralAngle,
  passProfile,
  sampleAt,
  slantRangeForCentralAngle,
  LEO_PASS_LIMITS,
  LEO_USABLE_ELEVATION_DEG
} from '$lib/components/widgets/LeoPassModel';
import { centralAngle, maxDopplerShift, orbitalPeriod, slantRange } from '$lib/utils/orbitMath';

const ISS_ALTITUDE_M = 400_000;
const VHF_HZ = 145.8e6;

describe('Geometrie des Überflugs', () => {
  it('Zenitdurchgang: Zentriwinkel 0 bedeutet 90 Grad Elevation und Entfernung gleich Bahnhöhe', () => {
    expect(elevationForCentralAngle(0, ISS_ALTITUDE_M)).toBeCloseTo(90, 6);
    expect(slantRangeForCentralAngle(0, ISS_ALTITUDE_M)).toBeCloseTo(ISS_ALTITUDE_M, 3);
  });

  it('ist die Umkehrung von centralAngle aus orbitMath', () => {
    for (const elevation of [0, 5, 10, 30, 60, 85]) {
      const gamma = centralAngle(ISS_ALTITUDE_M, elevation);
      expect(elevationForCentralAngle(gamma, ISS_ALTITUDE_M), `ε=${elevation}`).toBeCloseTo(
        elevation,
        6
      );
    }
  });

  it('stimmt mit slantRange aus orbitMath überein', () => {
    for (const elevation of [0, 10, 45, 90]) {
      const gamma = centralAngle(ISS_ALTITUDE_M, elevation);
      expect(slantRangeForCentralAngle(gamma, ISS_ALTITUDE_M), `ε=${elevation}`).toBeCloseTo(
        slantRange(ISS_ALTITUDE_M, elevation),
        3
      );
    }
  });
});

describe('Profil eines Zenitdurchgangs (ISS, 400 km)', () => {
  const profile = passProfile(ISS_ALTITUDE_M, 90, VHF_HZ, 181);

  it('dauert über dem Horizont rund zehn Minuten', () => {
    expect(profile.periodS).toBeCloseTo(orbitalPeriod(ISS_ALTITUDE_M), 6);
    expect(profile.durationS / 60).toBeGreaterThan(9);
    expect(profile.durationS / 60).toBeLessThan(11);
    expect(profile.usableDurationS).toBeLessThan(profile.durationS);
  });

  it('beginnt und endet am Horizont und kulminiert im Zenit', () => {
    const first = profile.samples[0];
    const last = profile.samples[profile.samples.length - 1];
    const middle = profile.samples[(profile.samples.length - 1) / 2];
    expect(first.elevationDeg).toBeCloseTo(0, 6);
    expect(last.elevationDeg).toBeCloseTo(0, 6);
    expect(middle.elevationDeg).toBeCloseTo(90, 4);
    expect(middle.timeS).toBeCloseTo(0, 6);
    expect(profile.minRangeM).toBeCloseTo(ISS_ALTITUDE_M, 0);
    expect(profile.maxRangeM).toBeCloseTo(slantRange(ISS_ALTITUDE_M, 0), 0);
  });

  it('Doppler wechselt im Kulminationspunkt das Vorzeichen und bleibt unter f·v/c', () => {
    const first = profile.samples[0];
    const last = profile.samples[profile.samples.length - 1];
    const middle = profile.samples[(profile.samples.length - 1) / 2];
    expect(first.dopplerHz).toBeGreaterThan(0);
    expect(last.dopplerHz).toBeLessThan(0);
    expect(middle.dopplerHz).toBeCloseTo(0, 6);
    expect(first.dopplerHz).toBeCloseTo(-last.dopplerHz, 6);

    const schranke = maxDopplerShift(VHF_HZ, ISS_ALTITUDE_M);
    expect(schranke / 1000).toBeCloseTo(3.73, 2);
    expect(profile.maxDopplerHz).toBeLessThanOrEqual(schranke);
    expect(profile.maxDopplerHz).toBeGreaterThan(0.9 * schranke);
  });

  it('Radialgeschwindigkeit und Doppler haben entgegengesetzte Vorzeichen', () => {
    for (const sample of profile.samples) {
      expect(Math.sign(sample.dopplerHz)).toBe(-Math.sign(sample.rangeRateMs));
    }
  });
});

describe('Randdurchgänge', () => {
  it('ein Durchgang mit kleiner Höchstelevation dauert kürzer und bleibt weiter entfernt', () => {
    const hoch = passProfile(550_000, 80, VHF_HZ, 61);
    const flach = passProfile(550_000, 15, VHF_HZ, 61);
    expect(flach.durationS).toBeLessThan(hoch.durationS);
    expect(flach.minRangeM).toBeGreaterThan(hoch.minRangeM);
    expect(flach.maxDopplerHz).toBeLessThan(hoch.maxDopplerHz);
  });

  it('unter der nutzbaren Elevation gibt es kein nutzbares Fenster', () => {
    const knapp = passProfile(550_000, LEO_USABLE_ELEVATION_DEG - 5, VHF_HZ, 41);
    expect(knapp.usableDurationS).toBe(0);
    expect(knapp.durationS).toBeGreaterThan(0);
  });

  it('sampleAt findet die nächstgelegene Stützstelle', () => {
    const profile = passProfile(
      LEO_PASS_LIMITS.altitudeM.default,
      LEO_PASS_LIMITS.maxElevationDeg.default,
      LEO_PASS_LIMITS.frequencyHz.default,
      21
    );
    expect(sampleAt(profile, 0)?.timeS).toBeCloseTo(0, 6);
    expect(sampleAt(profile, -1e9)?.timeS).toBe(profile.samples[0].timeS);
  });
});
