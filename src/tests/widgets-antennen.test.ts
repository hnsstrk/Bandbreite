/**
 * Rechenmodell der Strom- und Spannungsverteilung auf dem Dipol
 * (Widget `DipoleCurrentWidget`) im Kapitel „Antennen".
 *
 * Referenz: Balanis, Antenna Theory, Kap. 4.5 — sinusförmige Stromverteilung
 * I(z) = I₀·sin(k·(h − |z|)), R_r = 73 Ω für den λ/2-Dipol; Kraus, Antennas —
 * R_r = 20·π²·(L/λ)² für den kurzen Dipol.
 */
import { describe, it, expect } from 'vitest';
import {
  DIPOLE_LIMITS,
  DIPOLE_PRESETS,
  HALF_WAVE_RESISTANCE_OHM,
  dipoleSamples,
  feedCurrentFraction,
  feedImpedanceNote,
  peakCurrent,
  rawCurrent,
  rawVoltage,
  shortDipoleResistanceOhm
} from '$lib/components/widgets/DipoleCurrentModel';

describe('DipoleCurrentModel: stehende Welle auf dem Draht', () => {
  it('macht den Strom an den Drahtenden null', () => {
    expect(rawCurrent(0.25, 0.5)).toBeCloseTo(0, 12);
    expect(rawCurrent(-0.25, 0.5)).toBeCloseTo(0, 12);
    expect(rawCurrent(0.5, 0.5)).toBe(0); // außerhalb des Drahts
    // und legt beim λ/2-Dipol den Strombauch in den Speisepunkt
    expect(rawCurrent(0, 0.5)).toBeCloseTo(1, 12);
  });

  it('setzt die Spannung um 90° versetzt: Bauch am Ende, Knoten in der Mitte', () => {
    expect(rawVoltage(0.25, 0.5)).toBeCloseTo(1, 12);
    expect(rawVoltage(0, 0.5)).toBeCloseTo(0, 12);
    expect(rawVoltage(0.5, 0.5)).toBe(0);
  });

  it('liefert für den λ/2-Dipol vollen und für den Ganzwellendipol keinen Speisestrom', () => {
    expect(feedCurrentFraction(0.5)).toBeCloseTo(1, 6);
    expect(feedCurrentFraction(1)).toBeCloseTo(0, 6);
    expect(feedCurrentFraction(1.5)).toBeCloseTo(1, 6);
    // λ/4-Schenkel je Seite ist der Halbwellendipol; kürzer sinkt der Strom nicht,
    // weil auf das Maximum normiert wird
    expect(feedCurrentFraction(0.25)).toBeCloseTo(1, 6);
    expect(peakCurrent(0.5)).toBeCloseTo(1, 6);
  });

  it('nennt den Strahlungswiderstand des kurzen und des λ/2-Dipols', () => {
    expect(HALF_WAVE_RESISTANCE_OHM).toBeCloseTo(73.1, 6);
    expect(shortDipoleResistanceOhm(0.1)).toBeCloseTo(20 * Math.PI ** 2 * 0.01, 12);
    expect(shortDipoleResistanceOhm(0.1)).toBeCloseTo(1.974, 3);
    expect(shortDipoleResistanceOhm(0.05)).toBeCloseTo(0.4935, 4);
  });

  it('tastet den ganzen Draht ab und normiert auf das Strommaximum', () => {
    const samples = dipoleSamples(0.5, 41);
    expect(samples).toHaveLength(41);
    expect(samples[0].zWavelengths).toBeCloseTo(-0.25, 9);
    expect(samples[samples.length - 1].zWavelengths).toBeCloseTo(0.25, 9);
    expect(samples[0].current).toBeCloseTo(0, 9);
    expect(samples[samples.length - 1].current).toBeCloseTo(0, 9);
    expect(Math.max(...samples.map((s) => Math.abs(s.current)))).toBeCloseTo(1, 6);
  });

  it('ordnet die Fußpunktimpedanz qualitativ ein', () => {
    expect(feedImpedanceNote(0.5)).toContain('Strombauch');
    expect(feedImpedanceNote(1)).toContain('Stromknoten');
    expect(feedImpedanceNote(0.85)).toContain('Bauch und Knoten');
  });

  it('nennt sinnvolle Reglergrenzen und Sprungmarken', () => {
    expect(DIPOLE_LIMITS.lengthWavelengths.default).toBe(0.5);
    expect(DIPOLE_LIMITS.lengthWavelengths.max).toBeGreaterThanOrEqual(1);
    expect(DIPOLE_PRESETS.map((preset) => preset.value)).toContain(0.5);
  });
});
