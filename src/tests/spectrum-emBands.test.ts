/**
 * P1-5 (light): Die beiden gleichnamigen Exporte `EM_BANDS` in
 * `data/bands.ts` und `data/spectrum.ts` sowie `EXTENDED_EM_BANDS` (die im
 * Spektrum tatsächlich gezeichnete Reihe) wurden VOR einer möglichen
 * Zusammenführung verglichen. Ergebnis: Grenzen und Farben stimmen NICHT
 * überein — eine Zusammenführung würde die Darstellung ändern und ist deshalb
 * nicht erfolgt. Dieser Test hält die Abweichungen fest; verschwinden sie,
 * schlägt er an und die Exporte können zusammengeführt werden.
 */
import { describe, it, expect } from 'vitest';
import { EM_BANDS as BANDS_EM } from '$lib/data/bands';
import { EM_BANDS as SPECTRUM_EM, SPECTRUM_MIN_HZ, SPECTRUM_MAX_GAMMA_HZ } from '$lib/data/spectrum';
import { EXTENDED_EM_BANDS } from '$lib/components/spectrumBands';

const bounds = (bands: ReadonlyArray<{ minHz: number; maxHz: number }>) =>
  bands.map((b) => [b.minHz, b.maxHz] as const);

describe('EM_BANDS: bands.ts vs. spectrum.ts (Zusammenführung blockiert)', () => {
  it('haben dieselbe Anzahl grober Bereiche, aber andere Grenzen', () => {
    expect(BANDS_EM.length).toBe(SPECTRUM_EM.length);
    expect(bounds(BANDS_EM)).not.toEqual(bounds(SPECTRUM_EM));
  });

  it('dokumentiert die bekannten Abweichungen (Bericht 04, Befund 11/55)', () => {
    const byName = <T extends { name: string }>(bands: ReadonlyArray<T>, name: string): T =>
      bands.find((b) => b.name === name)!;
    // Radio: 3 Hz–300 GHz (bands.ts) gegen 3 kHz–300 MHz (spectrum.ts)
    expect(byName(BANDS_EM, 'Radio').minHz).toBe(3);
    expect(byName(BANDS_EM, 'Radio').maxHz).toBe(300e9);
    expect(byName(SPECTRUM_EM, 'Radio').minHz).toBe(3e3);
    expect(byName(SPECTRUM_EM, 'Radio').maxHz).toBe(3e8);
    // Gamma: offen (Infinity) gegen 3 ZHz
    expect(byName(BANDS_EM, 'Gamma').maxHz).toBe(Infinity);
    expect(byName(SPECTRUM_EM, 'Gamma').maxHz).toBe(3e21);
    // Farben: nur Radio stimmt überein
    const colorsBands = BANDS_EM.map((b) => b.color);
    const colorsSpectrum = SPECTRUM_EM.map((b) => b.color);
    const same = colorsBands.filter((c, i) => c === colorsSpectrum[i]);
    expect(same).toEqual(['#3b82f6']);
  });
});

describe('EXTENDED_EM_BANDS (gezeichnete EM-Reihe)', () => {
  it('deckt den darstellbaren Bereich lückenlos ab', () => {
    const sorted = [...EXTENDED_EM_BANDS].sort((a, b) => a.minHz - b.minHz);
    expect(sorted[0].minHz).toBe(SPECTRUM_MIN_HZ);
    expect(sorted.at(-1)!.maxHz).toBeGreaterThanOrEqual(SPECTRUM_MAX_GAMMA_HZ);
    // Ohne das überlappende Mikrowellenband schließen alle Bänder aneinander an
    const chain = sorted.filter((b) => b.id !== 'em-microwave');
    for (let i = 1; i < chain.length; i++) {
      expect(chain[i].minHz, chain[i].id).toBe(chain[i - 1].maxHz);
    }
  });

  it('ist feiner als beide EM_BANDS-Varianten und daher keine Teilmenge davon', () => {
    expect(EXTENDED_EM_BANDS.length).toBeGreaterThan(BANDS_EM.length);
    expect(bounds(EXTENDED_EM_BANDS)).not.toEqual(bounds(BANDS_EM));
    expect(bounds(EXTENDED_EM_BANDS)).not.toEqual(bounds(SPECTRUM_EM));
  });

  it('hat eindeutige IDs und echte Umlaute in den deutschen Namen', () => {
    const ids = EXTENDED_EM_BANDS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const band of EXTENDED_EM_BANDS) {
      expect(band.nameDE, band.id).not.toMatch(/oe|ae|ue/);
    }
  });
});
