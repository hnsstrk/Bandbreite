/**
 * Rechenmodell des Flugfunk-Widgets „VOR: Radial aus dem Phasenvergleich".
 * Referenz: ICAO Annex 10, Vol. I, §3.3 (Hilfsträger 9960 Hz, Drehung 30 Hz,
 * Vollausschlag ±10°, ein Punkt der Skala 2°).
 */
import { describe, it, expect } from 'vitest';
import {
  bearingToStation,
  normalizeBearing,
  phaseDifferenceDeg,
  shortestDifference,
  signalSample,
  vorChannelCount,
  vorIndication,
  VOR_CHANNEL_SPACING_HZ,
  VOR_DEGREES_PER_DOT,
  VOR_FULL_SCALE_DEG,
  VOR_MAX_HZ,
  VOR_MIN_HZ,
  VOR_ROTATION_HZ,
  VOR_SUBCARRIER_HZ
} from '$lib/components/widgets/VorModel';

describe('Kennwerte des Drehfunkfeuers', () => {
  it('Hilfsträger 9960 Hz, Drehung 30 Hz, Band 108 bis 117,975 MHz', () => {
    expect(VOR_SUBCARRIER_HZ).toBe(9960);
    expect(VOR_ROTATION_HZ).toBe(30);
    expect(VOR_MIN_HZ).toBe(108e6);
    expect(VOR_MAX_HZ).toBe(117.975e6);
    expect(VOR_CHANNEL_SPACING_HZ).toBe(50e3);
    // 108,000 bis 117,950 MHz im 50-kHz-Raster ergeben 200 Kanäle.
    expect(vorChannelCount()).toBe(200);
  });
});

describe('Winkelrechnung', () => {
  it('normalisiert auf 0 bis 360 Grad', () => {
    expect(normalizeBearing(-90)).toBe(270);
    expect(normalizeBearing(450)).toBe(90);
    expect(normalizeBearing(360)).toBe(0);
  });

  it('liefert die kürzeste Differenz mit Vorzeichen', () => {
    expect(shortestDifference(10, 350)).toBe(20);
    expect(shortestDifference(350, 10)).toBe(-20);
    expect(shortestDifference(90, 90)).toBe(0);
  });

  it('Phasendifferenz ist der Radial, die Gegenrichtung liegt 180 Grad weiter', () => {
    expect(phaseDifferenceDeg(90)).toBe(90);
    expect(phaseDifferenceDeg(-10)).toBe(350);
    expect(bearingToStation(90)).toBe(270);
    expect(bearingToStation(270)).toBe(90);
  });
});

describe('Anzeige des Empfängers', () => {
  it('Radial 090 mit Kurs 090: zentriert, FROM', () => {
    const result = vorIndication(90, 90);
    expect(result.flag).toBe('FROM');
    expect(result.deviationDeg).toBeCloseTo(0, 10);
    expect(result.deflection).toBeCloseTo(0, 10);
    expect(result.fullScale).toBe(false);
  });

  it('Radial 090 mit Kurs 270: zentriert, TO', () => {
    const result = vorIndication(90, 270);
    expect(result.flag).toBe('TO');
    expect(result.deviationDeg).toBeCloseTo(0, 10);
  });

  it('10 Grad Ablage sind Vollausschlag, 2 Grad ein Punkt', () => {
    const result = vorIndication(100, 90);
    expect(result.flag).toBe('FROM');
    expect(result.deviationDeg).toBeCloseTo(VOR_FULL_SCALE_DEG, 10);
    expect(result.deflection).toBeCloseTo(1, 10);
    expect(result.fullScale).toBe(true);
    expect(vorIndication(94, 90).dots).toBeCloseTo(4 / VOR_DEGREES_PER_DOT, 10);
  });

  it('der Ausschlag wird bei mehr als Vollausschlag gekappt', () => {
    expect(vorIndication(120, 90).deflection).toBe(1);
    expect(vorIndication(60, 90).deflection).toBe(-1);
  });

  it('kehrt das Vorzeichen im TO-Bereich um, damit die Seite stimmt', () => {
    const to = vorIndication(100, 270);
    expect(to.flag).toBe('TO');
    expect(to.deviationDeg).toBeCloseTo(-10, 10);
  });
});

describe('Signalverlauf', () => {
  it('Referenz- und veränderliches Signal fallen bei Radial 0 zusammen', () => {
    for (const fraction of [0, 0.25, 0.5, 0.75]) {
      expect(signalSample(fraction, 0)).toBeCloseTo(signalSample(fraction, 360), 10);
    }
  });

  it('bei Radial 90 liegt das veränderliche Signal eine Viertelperiode zurück', () => {
    expect(signalSample(0.25, 90)).toBeCloseTo(signalSample(0, 0), 10);
  });
});
