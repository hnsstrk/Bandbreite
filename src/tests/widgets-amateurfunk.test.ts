/**
 * Rechenmodell des Amateurfunk-Widgets „Betriebsarten im Maßstab":
 * Bandbreiten, Rauschleistung k·T·B und der Gewinn gegenüber SSB.
 */
import { describe, it, expect } from 'vitest';
import {
  fitsScale,
  findMode,
  noiseAdvantageDb,
  noiseFloorDbm,
  referenceBandwidthHz,
  scaleFraction,
  AMATEUR_MODES,
  MODE_SCALES,
  REFERENCE_MODE_ID
} from '$lib/components/widgets/ModeBandwidthModel';
import { calculateThermalNoiseDbm } from '$lib/utils/calculations';

describe('Betriebsarten-Katalog', () => {
  it('ist nach Bandbreite aufsteigend sortiert und eindeutig', () => {
    const ids = AMATEUR_MODES.map((mode) => mode.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (let i = 1; i < AMATEUR_MODES.length; i++) {
      expect(AMATEUR_MODES[i].bandwidthHz).toBeGreaterThan(AMATEUR_MODES[i - 1].bandwidthHz);
    }
  });

  it('nennt die Bezugswerte: FT8 50 Hz, SSB 2,7 kHz, FM 12,5 kHz', () => {
    expect(findMode('ft8')?.bandwidthHz).toBe(50);
    expect(findMode('ssb')?.bandwidthHz).toBe(2700);
    expect(findMode('fm')?.bandwidthHz).toBe(12_500);
    expect(referenceBandwidthHz()).toBe(2700);
    expect(REFERENCE_MODE_ID).toBe('ssb');
  });
});

describe('Rauschen und Gewinn', () => {
  it('FT8 nimmt gegenüber SSB 17,3 dB weniger Rauschen auf', () => {
    expect(noiseAdvantageDb(50, 2700)).toBeCloseTo(10 * Math.log10(54), 10);
    expect(noiseAdvantageDb(50, 2700)).toBeCloseTo(17.32, 2);
  });

  it('halbe Bandbreite sind genau 3 dB', () => {
    expect(noiseAdvantageDb(1350, 2700)).toBeCloseTo(10 * Math.log10(2), 10);
    expect(noiseAdvantageDb(2700, 2700)).toBeCloseTo(0, 10);
    expect(noiseAdvantageDb(0, 2700)).toBe(0);
  });

  it('Rauschleistung folgt N = k·T·B: 2,7 kHz ergeben −139,7 dBm bei 290 K', () => {
    expect(noiseFloorDbm(2700)).toBeCloseTo(calculateThermalNoiseDbm(2700), 12);
    expect(noiseFloorDbm(2700)).toBeCloseTo(-139.66, 2);
    expect(noiseFloorDbm(50)).toBeCloseTo(-157.0, 1);
    // Zehnfache Bandbreite sind 10 dB mehr Rauschen.
    expect(noiseFloorDbm(27_000) - noiseFloorDbm(2700)).toBeCloseTo(10, 6);
  });
});

describe('Maßstab der Balken', () => {
  it('kappt breitere Betriebsarten und meldet sie', () => {
    const schmal = MODE_SCALES[0].spanHz;
    expect(scaleFraction(2700, schmal)).toBeCloseTo(0.9, 10);
    expect(scaleFraction(12_500, schmal)).toBe(1);
    expect(fitsScale(2700, schmal)).toBe(true);
    expect(fitsScale(12_500, schmal)).toBe(false);
    expect(fitsScale(12_500, MODE_SCALES[1].spanHz)).toBe(true);
    expect(scaleFraction(2700, 0)).toBe(0);
  });

  it('im größten Maßstab passen alle Betriebsarten', () => {
    const span = MODE_SCALES[MODE_SCALES.length - 1].spanHz;
    for (const mode of AMATEUR_MODES) {
      expect(fitsScale(mode.bandwidthHz, span), mode.id).toBe(true);
    }
  });
});
