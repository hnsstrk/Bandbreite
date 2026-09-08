/**
 * Auswahllogik der Banddetail-Randspalte (`$lib/components/bandDetail.ts`).
 */

import { describe, it, expect } from 'vitest';
import {
  MAX_SIDEBAR_APPLICATIONS,
  applicationsFor,
  bandsAt,
  lookupFrequency,
  pickPrimaryBand,
  resolveSelectedBand
} from '$lib/components/bandDetail';
import { ITU_BANDS, IEEE_BANDS, type FrequencyBand } from '$lib/data/bands';

const band = (id: string, minHz: number, maxHz: number): FrequencyBand =>
  ({ id, name: id, nameDE: id, minHz, maxHz, color: '#000000', category: 'ieee' }) as FrequencyBand;

describe('bandsAt', () => {
  it('liefert nichts ohne brauchbare Frequenz', () => {
    expect(bandsAt(ITU_BANDS, null)).toEqual([]);
    expect(bandsAt(ITU_BANDS, 0)).toEqual([]);
    expect(bandsAt(ITU_BANDS, -5)).toEqual([]);
  });

  it('findet das UHF-Band bei 900 MHz', () => {
    const treffer = bandsAt(ITU_BANDS, 900e6);
    expect(treffer.length).toBeGreaterThan(0);
    expect(treffer.every((b) => 900e6 >= b.minHz && 900e6 <= b.maxHz)).toBe(true);
  });

  it('schließt die Bandgrenzen ein', () => {
    const bands = [band('a', 100, 200)];
    expect(bandsAt(bands, 100)).toHaveLength(1);
    expect(bandsAt(bands, 200)).toHaveLength(1);
    expect(bandsAt(bands, 201)).toHaveLength(0);
  });

  it('findet bei 10 GHz ein IEEE-Band', () => {
    expect(bandsAt(IEEE_BANDS, 10e9).length).toBeGreaterThan(0);
  });
});

describe('resolveSelectedBand', () => {
  const gewaehlt = band('x', 1e9, 2e9);

  it('behält das Band, solange die Frequenz darin liegt', () => {
    expect(resolveSelectedBand(gewaehlt, 1.5e9)).toBe(gewaehlt);
  });

  it('verwirft das Band, sobald die Frequenz herausläuft', () => {
    expect(resolveSelectedBand(gewaehlt, 3e9)).toBeNull();
    expect(resolveSelectedBand(gewaehlt, 5e8)).toBeNull();
  });

  it('behält das Band ohne eingestellte Frequenz', () => {
    expect(resolveSelectedBand(gewaehlt, null)).toBe(gewaehlt);
  });

  it('bleibt ohne Auswahl leer', () => {
    expect(resolveSelectedBand(null, 1.5e9)).toBeNull();
  });
});

describe('lookupFrequency', () => {
  it('nimmt die geometrische Bandmitte', () => {
    expect(lookupFrequency(band('x', 1e6, 1e8), null)).toBeCloseTo(1e7, 0);
  });

  it('nimmt sonst die eingestellte Frequenz', () => {
    expect(lookupFrequency(null, 2.4e9)).toBe(2.4e9);
    expect(lookupFrequency(null, null)).toBeNull();
  });
});

describe('pickPrimaryBand', () => {
  const leer = { selected: null, ieee: [], itu: [], nato: [], civilian: [] };

  it('bevorzugt die Auswahl', () => {
    const gewaehlt = band('sel', 1, 2);
    expect(pickPrimaryBand({ ...leer, selected: gewaehlt, ieee: [band('ieee', 1, 2)] })).toBe(
      gewaehlt
    );
  });

  it('nimmt danach IEEE, dann ITU, dann NATO, dann zivil', () => {
    const ieee = band('ieee', 1, 2);
    const itu = band('itu', 1, 2);
    const nato = band('nato', 1, 2);
    const zivil = band('zivil', 1, 2);
    expect(pickPrimaryBand({ ...leer, ieee: [ieee], itu: [itu] })).toBe(ieee);
    expect(pickPrimaryBand({ ...leer, itu: [itu], nato: [nato] })).toBe(itu);
    expect(pickPrimaryBand({ ...leer, nato: [nato], civilian: [zivil] })).toBe(nato);
    expect(pickPrimaryBand({ ...leer, civilian: [zivil] })).toBe(zivil);
  });

  it('liefert null, wenn nichts passt', () => {
    expect(pickPrimaryBand(leer)).toBeNull();
  });
});

describe('applicationsFor', () => {
  it('nimmt bei Bandauswahl alle überlappenden Dienste', () => {
    const treffer = applicationsFor(band('ism', 2.4e9, 2.5e9), null);
    expect(treffer.length).toBeGreaterThan(0);
    expect(treffer.every((app) => app.minHz < 2.5e9 && app.maxHz > 2.4e9)).toBe(true);
  });

  it('nimmt ohne Bandauswahl den Punkttreffer', () => {
    const treffer = applicationsFor(null, 2.45e9);
    expect(treffer.length).toBeGreaterThan(0);
    expect(treffer.every((app) => 2.45e9 >= app.minHz && 2.45e9 <= app.maxHz)).toBe(true);
  });

  it('liefert ohne Frequenz nichts', () => {
    expect(applicationsFor(null, null)).toEqual([]);
    expect(applicationsFor(null, 0)).toEqual([]);
  });

  it('begrenzt die Anzeige auf eine sinnvolle Zahl', () => {
    expect(MAX_SIDEBAR_APPLICATIONS).toBeGreaterThan(5);
    expect(MAX_SIDEBAR_APPLICATIONS).toBeLessThan(50);
  });
});
