/**
 * Rechenmodell der OFDM-Unterträger (Widget `OfdmWidget`) im Kapitel
 * „Modulation".
 *
 * Referenz: 3GPP TS 36.211 — LTE mit Δf = 15 kHz, also T_s = 66,67 µs;
 * ein Ressourcenblock aus zwölf Unterträgern belegt 180 kHz.
 */
import { describe, it, expect } from 'vitest';
import {
  DVBT_8K_SPACING_HZ,
  LTE_SUBCARRIER_SPACING_HZ,
  OFDM_LIMITS,
  crosstalkAtCenter,
  grossBitRateBps,
  nominalBandwidthHz,
  nullToNullBandwidthHz,
  sinc,
  spacingFromDurationHz,
  spectrumSamples,
  subcarrierAmplitude,
  subcarrierFrequencies,
  symbolDurationS
} from '$lib/components/widgets/OfdmModel';

describe('OfdmModel: orthogonale Unterträger', () => {
  it('rechnet die si-Funktion mit Nullstellen bei ganzen Zahlen', () => {
    expect(sinc(0)).toBe(1);
    expect(sinc(1)).toBeCloseTo(0, 12);
    expect(sinc(-3)).toBeCloseTo(0, 12);
    expect(sinc(0.5)).toBeCloseTo(2 / Math.PI, 12);
    expect(sinc(0.5)).toBeCloseTo(0.6366, 4);
  });

  it('verknüpft Symboldauer und Trägerabstand über Δf = 1/T_s (LTE: 66,67 µs)', () => {
    expect(symbolDurationS(LTE_SUBCARRIER_SPACING_HZ)).toBeCloseTo(66.667e-6, 9);
    expect(spacingFromDurationHz(66.6667e-6)).toBeCloseTo(15_000, 0);
    expect(symbolDurationS(DVBT_8K_SPACING_HZ)).toBeCloseTo(896e-6, 6);
    expect(symbolDurationS(0)).toBe(0);
  });

  it('legt die Träger symmetrisch um die Mitte', () => {
    expect(subcarrierFrequencies(4, 15_000)).toEqual([-22_500, -7500, 7500, 22_500]);
    expect(subcarrierFrequencies(3, 15_000)).toEqual([-15_000, 0, 15_000]);
    expect(subcarrierFrequencies(1, 15_000)).toEqual([0]);
  });

  it('erfüllt die Orthogonalität: auf jeder Trägermitte sind alle anderen null', () => {
    const spacing = 15_000;
    const centers = subcarrierFrequencies(8, spacing);
    for (const target of centers) {
      for (const other of centers) {
        const amplitude = subcarrierAmplitude(target, other, spacing);
        if (target === other) expect(amplitude).toBeCloseTo(1, 12);
        else expect(Math.abs(amplitude), `${target}/${other}`).toBeLessThan(1e-9);
      }
    }
    expect(crosstalkAtCenter(8, spacing)).toBeLessThan(1e-9);
    expect(crosstalkAtCenter(1, spacing)).toBe(0);
  });

  it('nennt die Bandbreiten eines LTE-Ressourcenblocks (12 Träger = 180 kHz)', () => {
    expect(nominalBandwidthHz(12, LTE_SUBCARRIER_SPACING_HZ)).toBe(180_000);
    expect(nullToNullBandwidthHz(12, LTE_SUBCARRIER_SPACING_HZ)).toBe(195_000);
  });

  it('rechnet die Bruttodatenrate aus Trägerzahl, Bit je Symbol und Δf', () => {
    // 12 Träger, 64-QAM (6 Bit), 15 kHz → 1,08 Mbit/s ohne Schutzintervall
    expect(grossBitRateBps(12, 6, LTE_SUBCARRIER_SPACING_HZ)).toBe(1_080_000);
    expect(grossBitRateBps(2, 1, 1000)).toBe(2000);
    expect(grossBitRateBps(0, 6, 15_000)).toBe(0);
  });

  it('tastet das Spektrum symmetrisch über den Ausschnitt ab', () => {
    const samples = spectrumSamples(4, 15_000, 1.5, 101);
    expect(samples).toHaveLength(101);
    expect(samples[0].frequencyHz).toBeCloseTo(-samples[samples.length - 1].frequencyHz, 6);
    expect(samples[0].amplitudes).toHaveLength(4);
    // In der Mitte des Ausschnitts überlappen sich alle Träger
    const middle = samples[Math.floor(samples.length / 2)];
    expect(middle.amplitudes.some((amplitude) => Math.abs(amplitude) > 0.1)).toBe(true);
  });

  it('nennt sinnvolle Reglergrenzen', () => {
    expect(OFDM_LIMITS.subcarriers.min).toBeGreaterThanOrEqual(2);
    expect(OFDM_LIMITS.spacingHz.default).toBe(LTE_SUBCARRIER_SPACING_HZ);
  });
});
