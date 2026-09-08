/**
 * Tests der Bahnmechanik für den Satellitenfunk.
 *
 * Prüfwerte stammen aus allgemein bekannten Bahndaten: die geostationäre Bahn
 * mit einem siderischen Tag Umlaufzeit und die Internationale Raumstation mit
 * rund 93 Minuten. Verglichen werden Zahlenwerte, keine formatierten Zeichen.
 */

import { describe, it, expect } from 'vitest';
import {
  DEFAULT_MIN_ELEVATION_DEG,
  EARTH_MU,
  GEOSTATIONARY_ALTITUDE_M,
  SIDEREAL_DAY_S,
  altitudeForPeriod,
  centralAngle,
  coverageFraction,
  figureOfMerit,
  footprintRadius,
  maxDopplerShift,
  orbitRadius,
  orbitalPeriod,
  orbitalVelocity,
  propagationDelay,
  roundTripDelay,
  slantRange,
  summarizeOrbit,
  visibilityDuration
} from '$lib/utils/orbitMath';
import { EARTH_RADIUS_EQUATORIAL, SPEED_OF_LIGHT } from '$lib/data/constants';
import { GEO_ALTITUDE_M, ISS_ALTITUDE_M } from '$lib/data/satelliteSystems';

const MINUTE_S = 60;
const HOUR_S = 3600;

describe('Bahnradius und Umlaufzeit', () => {
  it('addiert die Höhe zum Äquatorradius', () => {
    expect(orbitRadius(0)).toBe(EARTH_RADIUS_EQUATORIAL);
    expect(orbitRadius(GEO_ALTITUDE_M)).toBeCloseTo(42_164_137, 0);
  });

  it('liefert für die geostationäre Höhe einen siderischen Tag', () => {
    const period = orbitalPeriod(GEO_ALTITUDE_M);
    expect(period).toBeCloseTo(SIDEREAL_DAY_S, -1);
    // 23 h 56 min, nicht 24 h
    expect(Math.floor(period / HOUR_S)).toBe(23);
    expect(Math.round((period % HOUR_S) / MINUTE_S)).toBe(56);
  });

  it('liefert für die ISS rund 93 Minuten', () => {
    const minutes = orbitalPeriod(ISS_ALTITUDE_M) / MINUTE_S;
    expect(minutes).toBeGreaterThan(92);
    expect(minutes).toBeLessThan(94);
  });

  it('folgt dem dritten Keplerschen Gesetz: T² ∝ r³', () => {
    const a = orbitalPeriod(500_000);
    const b = orbitalPeriod(20_000_000);
    const ra = orbitRadius(500_000);
    const rb = orbitRadius(20_000_000);
    expect((a * a) / ra ** 3).toBeCloseTo((b * b) / rb ** 3, 20);
  });

  it('kehrt die Rechnung um und findet die geostationäre Höhe', () => {
    expect(altitudeForPeriod(SIDEREAL_DAY_S)).toBeCloseTo(GEO_ALTITUDE_M, -2);
    expect(GEOSTATIONARY_ALTITUDE_M / 1000).toBeCloseTo(35_786, 0);
  });

  it('meldet unbrauchbare Eingaben statt zu raten', () => {
    expect(Number.isNaN(altitudeForPeriod(0))).toBe(true);
    expect(Number.isNaN(orbitalPeriod(-EARTH_RADIUS_EQUATORIAL * 2))).toBe(true);
  });
});

describe('Bahngeschwindigkeit', () => {
  it('liefert für die ISS rund 7,66 km/s', () => {
    expect(orbitalVelocity(ISS_ALTITUDE_M) / 1000).toBeCloseTo(7.66, 1);
  });

  it('liefert für die geostationäre Bahn rund 3,07 km/s', () => {
    expect(orbitalVelocity(GEO_ALTITUDE_M) / 1000).toBeCloseTo(3.07, 1);
  });

  it('erfüllt v = √(µ/r)', () => {
    const h = 1_000_000;
    expect(orbitalVelocity(h)).toBeCloseTo(Math.sqrt(EARTH_MU / orbitRadius(h)), 6);
  });
});

describe('Schrägentfernung und Laufzeit', () => {
  it('ist im Zenit gleich der Bahnhöhe', () => {
    expect(slantRange(GEO_ALTITUDE_M, 90)).toBeCloseTo(GEO_ALTITUDE_M, 3);
  });

  it('wächst zum Horizont hin', () => {
    expect(slantRange(GEO_ALTITUDE_M, 10)).toBeGreaterThan(slantRange(GEO_ALTITUDE_M, 40));
  });

  it('ergibt für den geostationären Satelliten im Zenit rund 239 ms hin und zurück', () => {
    const ms = roundTripDelay(GEO_ALTITUDE_M) * 1000;
    expect(ms).toBeGreaterThan(238);
    expect(ms).toBeLessThan(240);
  });

  it('bleibt bei niedriger Bahn im Bereich weniger Millisekunden', () => {
    expect(roundTripDelay(ISS_ALTITUDE_M) * 1000).toBeLessThan(10);
  });

  it('rechnet die Laufzeit mit der Lichtgeschwindigkeit', () => {
    expect(propagationDelay(SPEED_OF_LIGHT)).toBeCloseTo(1, 9);
  });
});

describe('Sichtbarkeit und Ausleuchtzone', () => {
  it('gibt der ISS einen Überflug von etwa sechs Minuten', () => {
    const minutes = visibilityDuration(ISS_ALTITUDE_M, DEFAULT_MIN_ELEVATION_DEG) / MINUTE_S;
    expect(minutes).toBeGreaterThan(5);
    expect(minutes).toBeLessThan(8);
  });

  it('verkürzt den Überflug, wenn ein höherer Elevationswinkel gefordert wird', () => {
    expect(visibilityDuration(ISS_ALTITUDE_M, 30)).toBeLessThan(
      visibilityDuration(ISS_ALTITUDE_M, 5)
    );
  });

  it('gibt der geostationären Bahn einen Zentriwinkel von rund 81°', () => {
    expect(centralAngle(GEO_ALTITUDE_M, 0)).toBeCloseTo(81.3, 0);
  });

  it('deckt aus der geostationären Bahn etwa 42 % der Erdoberfläche ab', () => {
    const fraction = coverageFraction(GEO_ALTITUDE_M, 0);
    expect(fraction).toBeGreaterThan(0.4);
    expect(fraction).toBeLessThan(0.45);
  });

  it('gibt der ISS eine Ausleuchtzone von rund 1400 km Radius', () => {
    const km = footprintRadius(ISS_ALTITUDE_M, DEFAULT_MIN_ELEVATION_DEG) / 1000;
    expect(km).toBeGreaterThan(1200);
    expect(km).toBeLessThan(1600);
  });
});

describe('Doppler und Antennengüte', () => {
  it('ergibt für die ISS auf 145,8 MHz einige Kilohertz', () => {
    const shift = maxDopplerShift(145.8e6, ISS_ALTITUDE_M);
    expect(shift).toBeGreaterThan(3000);
    expect(shift).toBeLessThan(4000);
  });

  it('wächst linear mit der Frequenz', () => {
    const a = maxDopplerShift(437e6, ISS_ALTITUDE_M);
    const b = maxDopplerShift(2 * 437e6, ISS_ALTITUDE_M);
    expect(b / a).toBeCloseTo(2, 9);
  });

  it('ist auf der geostationären Bahn für den festen Beobachter belanglos klein im Vergleich', () => {
    expect(maxDopplerShift(1e9, GEO_ALTITUDE_M)).toBeLessThan(
      maxDopplerShift(1e9, ISS_ALTITUDE_M)
    );
  });

  it('rechnet G/T als Gewinn minus 10·log₁₀(T)', () => {
    expect(figureOfMerit(40, 100)).toBeCloseTo(20, 9);
  });
});

describe('Zusammenfassung', () => {
  it('füllt alle Felder mit endlichen Zahlen', () => {
    const summary = summarizeOrbit(GEO_ALTITUDE_M, DEFAULT_MIN_ELEVATION_DEG);
    for (const [key, value] of Object.entries(summary)) {
      expect(Number.isFinite(value), key).toBe(true);
    }
    expect(summary.roundTripDelayS).toBeCloseTo(2 * summary.oneWayDelayS, 12);
  });
});
