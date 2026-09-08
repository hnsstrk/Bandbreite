/**
 * Tests für die Logik des Bandplan-Visualisierers.
 */

import { describe, it, expect } from 'vitest';
import {
  BAND_STATUS_LABELS,
  CLASS_POWER_W,
  MODE_LABELS,
  bandCenterHz,
  bandWavelengthM,
  bandWidthHz,
  bandsForClass,
  openingHint,
  placeSegments,
  powerLimitFor,
  powerUnitLabel
} from '$lib/components/funk/amateurBandplan.svelte';
import {
  AMATEUR_BANDS,
  POWER_CLASS_A_W,
  POWER_CLASS_E_W,
  POWER_CLASS_N_EIRP_W
} from '$lib/data/amateurBands';

const band = (id: string) => {
  const found = AMATEUR_BANDS.find((entry) => entry.id === id);
  if (!found) throw new Error(`Band ${id} fehlt im Datensatz`);
  return found;
};

describe('bandsForClass', () => {
  it('liefert für „alle“ den vollständigen Datensatz', () => {
    expect(bandsForClass('alle')).toHaveLength(AMATEUR_BANDS.length);
  });

  it('gibt der Klasse N nur die drei Einsteigerbänder', () => {
    const names = bandsForClass('N').map((entry) => entry.nameDE);
    expect(names).toEqual(['10 m', '2 m', '70 cm']);
  });

  it('gibt der Klasse A mindestens so viele Bänder wie der Klasse E', () => {
    expect(bandsForClass('A').length).toBeGreaterThanOrEqual(bandsForClass('E').length);
  });
});

describe('powerLimitFor', () => {
  it('nennt für Klasse A die Bandgrenze', () => {
    expect(powerLimitFor(band('band-20m'), 'A')).toEqual({
      value: POWER_CLASS_A_W,
      unit: 'W PEP'
    });
  });

  it('begrenzt Klasse E auf die Klassenleistung', () => {
    const limit = powerLimitFor(band('band-80m'), 'E');
    expect(limit).toEqual({ value: POWER_CLASS_E_W, unit: 'W PEP' });
  });

  it('beachtet strengere Bandgrenzen vor der Klassengrenze', () => {
    // Das 60-m-Band ist auf 15 W EIRP begrenzt, also unter der Klassenleistung.
    const limit = powerLimitFor(band('band-60m'), 'A');
    expect(limit?.value).toBe(15);
    expect(limit?.unit).toBe('W EIRP');
  });

  it('begrenzt Klasse N auf 10 W EIRP', () => {
    expect(powerLimitFor(band('band-2m'), 'N')).toEqual({
      value: POWER_CLASS_N_EIRP_W,
      unit: 'W EIRP'
    });
  });

  it('liefert null für ein der Klasse verschlossenes Band', () => {
    expect(powerLimitFor(band('band-20m'), 'N')).toBeNull();
  });

  it('kennt die Klassenleistungen', () => {
    expect(CLASS_POWER_W.A).toBe(POWER_CLASS_A_W);
    expect(CLASS_POWER_W.E).toBe(POWER_CLASS_E_W);
    expect(CLASS_POWER_W.N).toBe(POWER_CLASS_N_EIRP_W);
    expect(powerUnitLabel('eirp')).toBe('W EIRP');
    expect(powerUnitLabel('erp')).toBe('W ERP');
    expect(powerUnitLabel('pep')).toBe('W PEP');
  });
});

describe('placeSegments', () => {
  it('legt das erste Segment an den Bandanfang', () => {
    const placed = placeSegments(band('band-2m'));
    expect(placed[0].leftPercent).toBeCloseTo(0, 6);
    expect(placed.length).toBe(band('band-2m').segments.length);
  });

  it('bleibt für jedes Band innerhalb der Balkenbreite', () => {
    for (const entry of AMATEUR_BANDS) {
      for (const placed of placeSegments(entry)) {
        expect(placed.leftPercent).toBeGreaterThanOrEqual(0);
        expect(placed.leftPercent + placed.widthPercent).toBeLessThanOrEqual(100.001);
        expect(placed.modeLabel).toBe(MODE_LABELS[placed.segment.mode]);
      }
    }
  });
});

describe('Bandkennzahlen', () => {
  it('rechnet Bandmitte, Breite und Wellenlänge des 2-m-Bandes', () => {
    const zweiMeter = band('band-2m');
    expect(bandCenterHz(zweiMeter)).toBe(145e6);
    expect(bandWidthHz(zweiMeter)).toBe(2e6);
    // λ = c / f ≈ 2,07 m bei 145 MHz
    expect(bandWavelengthM(zweiMeter)).toBeCloseTo(2.067, 2);
  });

  it('beschriftet jeden Zuweisungsstatus mit echten Umlauten', () => {
    for (const entry of AMATEUR_BANDS) {
      expect(BAND_STATUS_LABELS[entry.status]).toBeDefined();
      expect(BAND_STATUS_LABELS[entry.status]).not.toMatch(/aer$|sekundaer|primaer/);
    }
  });

  it('nennt für tiefe Bänder die Nacht und für hohe die Sichtverbindung', () => {
    expect(openingHint(band('band-80m'))).toMatch(/Nacht/i);
    expect(openingHint(band('band-70cm'))).toMatch(/Sicht|quasioptisch/i);
  });
});
