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
  powerSubrangeTexts,
  powerUnitLabel
} from '$lib/components/funk/amateurBandplan.svelte';
import {
  AMATEUR_BANDS,
  POWER_CLASS_A_W,
  POWER_CLASS_E_W,
  POWER_CLASS_E_SHF_W,
  POWER_CLASS_E_VHF_W,
  POWER_CLASS_N_EIRP_W,
  POWER_CLASS_N_ERP_VHF_W,
  POWER_MICROWAVE_CLASS_A_W,
  POWER_60M_ERP_W
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

  it('lässt der Klasse E nur die siebzehn Bänder der AFuV Anlage 1', () => {
    const namen = bandsForClass('E').map((entry) => entry.nameDE);
    expect(namen).toEqual([
      '160 m',
      '80 m',
      '15 m',
      '10 m',
      '2 m',
      '70 cm',
      '23 cm',
      '13 cm',
      '9 cm',
      '6 cm',
      '3 cm',
      '1,2 cm',
      '6 mm',
      '4 mm',
      '2,5 mm',
      '2 mm',
      '1,2 mm'
    ]);
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
    // AFuV Anlage 1, lfd. Nr. 7: 9,14 W ERP, weit unter der Klassenleistung.
    const limit = powerLimitFor(band('band-60m'), 'A');
    expect(limit?.value).toBe(POWER_60M_ERP_W);
    expect(limit?.unit).toBe('W ERP');
  });

  it('begrenzt Klasse N auf 2 m auf 6,1 W ERP (≙ 10 W EIRP)', () => {
    expect(powerLimitFor(band('band-2m'), 'N')).toEqual({
      value: POWER_CLASS_N_ERP_VHF_W,
      unit: 'W ERP'
    });
  });

  it('staffelt Klasse E nach Frequenz statt pauschal 100 W anzunehmen', () => {
    expect(powerLimitFor(band('band-2m'), 'E')).toEqual({
      value: POWER_CLASS_E_VHF_W,
      unit: 'W PEP'
    });
    expect(powerLimitFor(band('band-13cm'), 'E')).toEqual({
      value: POWER_CLASS_E_SHF_W,
      unit: 'W PEP'
    });
  });

  it('senkt die Klasse A ab 13 cm auf 75 W PEP', () => {
    expect(powerLimitFor(band('band-13cm'), 'A')).toEqual({
      value: POWER_MICROWAVE_CLASS_A_W,
      unit: 'W PEP'
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

describe('powerSubrangeTexts', () => {
  it('nennt die drei gestaffelten Grenzen des 160-m-Bandes', () => {
    const texte = powerSubrangeTexts(band('band-160m'), 'A');
    expect(texte).toHaveLength(2);
    expect(texte[0]).toContain('75');
    expect(texte[1]).toContain('10');
  });

  it('liefert für Bänder ohne Teilbereiche ein leeres Ergebnis', () => {
    expect(powerSubrangeTexts(band('band-20m'), 'A')).toEqual([]);
  });

  it('überspringt Teilbereiche, die der Klasse nicht offenstehen', () => {
    expect(powerSubrangeTexts(band('band-6m'), 'E')).toEqual([]);
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
    expect(openingHint(band('band-1_2mm'))).toMatch(/Sicht|quasioptisch/i);
  });

  it('beschriftet die Millimeterbänder mit Wellenlängen im Millimeterbereich', () => {
    expect(bandWavelengthM(band('band-6mm'))).toBeCloseTo(0.00637, 4);
    expect(bandWavelengthM(band('band-1_2mm'))).toBeCloseTo(0.00122, 4);
    expect(bandWidthHz(band('band-4mm'))).toBe(5e9);
  });
});
