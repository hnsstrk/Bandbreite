/**
 * P1-5 (light): Es gab zwei gleichnamige `EM_BANDS`-Exporte — in
 * `data/bands.ts` und in `data/spectrum.ts`. Der Vergleich (Bericht 51,
 * Abschnitt 5) zeigte abweichende Grenzen und Farben, eine Zusammenführung
 * hätte die Darstellung verändert. Da der Export in `data/spectrum.ts` keinen
 * einzigen Konsumenten hatte, ist er gelöscht; verbindlich sind seither
 * `EM_BANDS` aus `data/bands.ts` (grobe Einteilung) und `EXTENDED_EM_BANDS`
 * aus `components/spectrumBands.ts` (die tatsächlich gezeichnete Reihe).
 *
 * Dieser Test hält beide Definitionen als Regression fest.
 */
import { describe, it, expect } from 'vitest';
import { EM_BANDS } from '$lib/data/bands';
import * as spectrumData from '$lib/data/spectrum';
import { SPECTRUM_MIN_HZ, SPECTRUM_MAX_GAMMA_HZ } from '$lib/data/spectrum';
import { EXTENDED_EM_BANDS } from '$lib/components/spectrumBands';

const bounds = (bands: ReadonlyArray<{ minHz: number; maxHz: number }>) =>
  bands.map((b) => [b.minHz, b.maxHz] as const);

describe('EM_BANDS (data/bands.ts) — einzige grobe Einteilung', () => {
  it('data/spectrum.ts exportiert keine zweite Bänderliste mehr', () => {
    expect(Object.keys(spectrumData)).not.toContain('EM_BANDS');
    expect(Object.keys(spectrumData)).not.toContain('emBands');
  });

  it('deckt Radio bis Gamma lückenlos ab', () => {
    expect(EM_BANDS.map((b) => b.id)).toEqual([
      'em-radio',
      'em-microwave',
      'em-infrared',
      'em-visible',
      'em-ultraviolet',
      'em-xray',
      'em-gamma'
    ]);
    // Ohne das bewusst überlappende Mikrowellenband schließen alle Bänder an
    const chain = EM_BANDS.filter((b) => b.id !== 'em-microwave');
    expect(chain[0].minHz).toBe(3);
    for (let i = 1; i < chain.length; i++) {
      expect(chain[i].minHz, chain[i].id).toBe(chain[i - 1].maxHz);
    }
    expect(chain.at(-1)!.maxHz).toBe(Infinity);
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

  it('ist feiner als EM_BANDS und daher keine Teilmenge davon', () => {
    expect(EXTENDED_EM_BANDS.length).toBeGreaterThan(EM_BANDS.length);
    expect(bounds(EXTENDED_EM_BANDS)).not.toEqual(bounds(EM_BANDS));
  });

  it('hat eindeutige IDs und echte Umlaute in den deutschen Namen', () => {
    const ids = EXTENDED_EM_BANDS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const band of EXTENDED_EM_BANDS) {
      expect(band.nameDE, band.id).not.toMatch(/oe|ae|ue/);
    }
  });
});
