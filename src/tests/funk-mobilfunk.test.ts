/**
 * Tests für Bandfilter, Balkengeometrie und Datenratenabschätzung des
 * Mobilfunk-Kapitels.
 */

import { describe, it, expect } from 'vitest';
import {
  EFFICIENCY_PRESETS,
  bandSpan,
  bandwidthHz,
  barGeometry,
  dataRateBps,
  filterBands,
  formatDataRate,
  technologyOptions
} from '$lib/components/funk/mobileBands.svelte';
import { MOBILE_BANDS } from '$lib/data/mobileNetworks';

const band = (id: string) => {
  const found = MOBILE_BANDS.find((entry) => entry.id === id);
  if (!found) throw new Error(`Band ${id} fehlt im Datensatz`);
  return found;
};

describe('filterBands', () => {
  it('liefert ohne Filter alle Bänder', () => {
    expect(filterBands({ technology: 'alle', duplex: 'alle' })).toHaveLength(MOBILE_BANDS.length);
  });

  it('filtert nach Duplexverfahren', () => {
    const tdd = filterBands({ technology: 'alle', duplex: 'TDD' });
    expect(tdd.length).toBeGreaterThan(0);
    expect(tdd.every((entry) => entry.duplex === 'TDD')).toBe(true);
  });

  it('filtert nach Technologie', () => {
    const gsm = filterBands({ technology: 'GSM', duplex: 'alle' });
    expect(gsm.every((entry) => entry.technologiesDE.includes('GSM'))).toBe(true);
    expect(gsm.map((entry) => entry.band)).toContain('B8 / n8');
  });

  it('kombiniert beide Filter', () => {
    const result = filterBands({ technology: 'GSM', duplex: 'TDD' });
    expect(result).toHaveLength(0);
  });

  it('leitet die Auswahlwerte aus dem Datensatz ab', () => {
    const options = technologyOptions();
    expect(options).toContain('LTE');
    expect(new Set(options).size).toBe(options.length);
  });
});

describe('bandSpan und bandwidthHz', () => {
  it('spannt bei Band 20 den Bereich von Downlink bis Uplink auf', () => {
    // Besonderheit: der Downlink liegt unterhalb des Uplinks.
    expect(bandSpan(band('band-n20'))).toEqual({ minHz: 791e6, maxHz: 862e6 });
    expect(bandwidthHz(band('band-n20'))).toBe(30e6);
  });

  it('nennt bei TDD die gemeinsame Bandbreite', () => {
    expect(bandwidthHz(band('band-n78'))).toBe(500e6);
  });
});

describe('barGeometry', () => {
  it('setzt den Uplink von Band 28 in die obere Hälfte', () => {
    const span = bandSpan(band('band-n28'));
    const uplink = barGeometry(band('band-n28').uplinkMinHz, band('band-n28').uplinkMaxHz, span);
    expect(uplink.leftPercent).toBe(0);
    expect(uplink.widthPercent).toBeCloseTo(45, 0);
  });

  it('bleibt innerhalb des Balkens', () => {
    for (const entry of MOBILE_BANDS) {
      const span = bandSpan(entry);
      for (const [from, to] of [
        [entry.uplinkMinHz, entry.uplinkMaxHz],
        [entry.downlinkMinHz, entry.downlinkMaxHz]
      ]) {
        const geometry = barGeometry(from, to, span);
        expect(geometry.leftPercent).toBeGreaterThanOrEqual(0);
        expect(geometry.leftPercent + geometry.widthPercent).toBeLessThanOrEqual(100.001);
      }
    }
  });
});

describe('dataRateBps', () => {
  it('rechnet R = B · η · N', () => {
    expect(dataRateBps(100e6, 5, 1)).toBe(500e6);
    expect(dataRateBps(100e6, 5, 4)).toBe(2e9);
  });

  it('behandelt unbrauchbare Eingaben als 0', () => {
    expect(dataRateBps(0, 5)).toBe(0);
    expect(dataRateBps(100e6, 0)).toBe(0);
    expect(dataRateBps(Number.NaN, 5)).toBe(0);
    expect(dataRateBps(100e6, 5, 0)).toBe(0);
  });

  it('verdoppelt sich mit der Bandbreite', () => {
    expect(dataRateBps(40e6, 2.5)).toBe(2 * dataRateBps(20e6, 2.5));
  });

  it('kennt nur sinnvolle Effizienz-Voreinstellungen', () => {
    expect(EFFICIENCY_PRESETS.length).toBeGreaterThan(0);
    expect(EFFICIENCY_PRESETS.every((preset) => preset.value > 0 && preset.value < 10)).toBe(true);
  });
});

describe('formatDataRate', () => {
  it('wählt die passende Einheit', () => {
    expect(formatDataRate(2e9)).toBe('2,0 Gbit/s');
    expect(formatDataRate(500e6)).toBe('500,0 Mbit/s');
    expect(formatDataRate(9600, 0)).toBe('10 kbit/s');
  });

  it('meldet unbrauchbare Werte mit Gedankenstrich', () => {
    expect(formatDataRate(0)).toBe('—');
    expect(formatDataRate(Number.NaN)).toBe('—');
  });
});
