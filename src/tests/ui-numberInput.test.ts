/**
 * Unit-Tests für src/lib/components/ui/numberInput.svelte.ts
 *
 * Geprüft werden die Abbildung zwischen Reglerposition und Wert
 * (linear und logarithmisch), das Begrenzen, die Einheitenumrechnung
 * und die Validierungsmeldungen.
 */

import { describe, it, expect } from 'vitest';
import {
  SLIDER_RESOLUTION,
  applyFieldInput,
  canUseLogScale,
  clampToRange,
  formatFieldValue,
  fromBaseValue,
  parseFieldInput,
  pickBestUnit,
  positionToValue,
  roundToStep,
  toBaseValue,
  validateValue,
  valueToPosition,
  type UnitOption
} from '../lib/components/ui/numberInput.svelte';

describe('canUseLogScale', () => {
  it('erlaubt logarithmische Skalen nur bei positivem, aufsteigendem Bereich', () => {
    expect(canUseLogScale(1, 100)).toBe(true);
    expect(canUseLogScale(0, 100)).toBe(false);
    expect(canUseLogScale(-1, 100)).toBe(false);
    expect(canUseLogScale(100, 100)).toBe(false);
    expect(canUseLogScale(Number.NaN, 100)).toBe(false);
  });
});

describe('valueToPosition (linear)', () => {
  it('bildet die Bereichsgrenzen auf 0 und die Auflösung ab', () => {
    expect(valueToPosition(0, 0, 100)).toBe(0);
    expect(valueToPosition(100, 0, 100)).toBe(SLIDER_RESOLUTION);
  });

  it('bildet die Mitte auf die halbe Auflösung ab', () => {
    expect(valueToPosition(50, 0, 100)).toBe(SLIDER_RESOLUTION / 2);
  });

  it('begrenzt Werte außerhalb des Bereichs', () => {
    expect(valueToPosition(-20, 0, 100)).toBe(0);
    expect(valueToPosition(500, 0, 100)).toBe(SLIDER_RESOLUTION);
  });

  it('liefert 0 bei ungültigen Bereichen', () => {
    expect(valueToPosition(5, 10, 10)).toBe(0);
    expect(valueToPosition(Number.NaN, 0, 100)).toBe(0);
  });
});

describe('valueToPosition (logarithmisch)', () => {
  it('setzt die geometrische Mitte auf die halbe Auflösung', () => {
    // 1 kHz … 100 kHz, geometrische Mitte = 10 kHz
    expect(valueToPosition(10_000, 1_000, 100_000, 'log')).toBe(SLIDER_RESOLUTION / 2);
  });

  it('fällt bei nicht positiven Grenzen auf die lineare Abbildung zurück', () => {
    expect(valueToPosition(50, 0, 100, 'log')).toBe(SLIDER_RESOLUTION / 2);
  });
});

describe('positionToValue', () => {
  it('ist zur linearen Hinabbildung invers', () => {
    const value = 42;
    const position = valueToPosition(value, 0, 100);
    expect(positionToValue(position, 0, 100)).toBeCloseTo(value, 6);
  });

  it('ist zur logarithmischen Hinabbildung invers', () => {
    // Die Reglerauflösung von 1000 Schritten über 8,5 Dekaden erlaubt
    // rund 2 % Abweichung je Schritt — mehr darf es nicht sein.
    const value = 2.4e9;
    const position = valueToPosition(value, 1e3, 3e11, 'log');
    const roundTrip = positionToValue(position, 1e3, 3e11, 'log');
    expect(Math.abs(roundTrip / value - 1)).toBeLessThan(0.02);
  });

  it('begrenzt Positionen außerhalb der Skala', () => {
    expect(positionToValue(-100, 10, 20)).toBe(10);
    expect(positionToValue(SLIDER_RESOLUTION * 5, 10, 20)).toBe(20);
  });

  it('liefert das Minimum bei ungültigen Bereichen', () => {
    expect(positionToValue(500, 10, 10)).toBe(10);
  });
});

describe('roundToStep', () => {
  it('rundet auf Vielfache des Schrittes', () => {
    expect(roundToStep(7, 5)).toBe(5);
    expect(roundToStep(8, 5)).toBe(10);
  });

  it('nutzt das Minimum als Ausgangspunkt', () => {
    expect(roundToStep(12, 5, 2)).toBe(12);
    expect(roundToStep(13, 5, 2)).toBe(12);
    expect(roundToStep(15, 5, 2)).toBe(17);
  });

  it('lässt den Wert bei step = any unverändert', () => {
    expect(roundToStep(7.1234, 'any')).toBe(7.1234);
  });

  it('lässt den Wert bei unsinnigem Schritt unverändert', () => {
    expect(roundToStep(7.5, 0)).toBe(7.5);
    expect(roundToStep(7.5, -1)).toBe(7.5);
  });
});

describe('clampToRange', () => {
  it('begrenzt beidseitig', () => {
    expect(clampToRange(5, 10, 20)).toBe(10);
    expect(clampToRange(25, 10, 20)).toBe(20);
    expect(clampToRange(15, 10, 20)).toBe(15);
  });

  it('lässt fehlende Grenzen offen', () => {
    expect(clampToRange(-500, undefined, 20)).toBe(-500);
    expect(clampToRange(500, 10, undefined)).toBe(500);
  });

  it('ersetzt ungültige Zahlen durch das Minimum', () => {
    expect(clampToRange(Number.NaN, 3, 9)).toBe(3);
    expect(clampToRange(Number.NaN)).toBe(0);
  });
});

describe('Einheitenumrechnung', () => {
  it('rechnet in die Basiseinheit und zurück', () => {
    expect(toBaseValue(2.4, 1e9)).toBe(2.4e9);
    expect(fromBaseValue(2.4e9, 1e9)).toBeCloseTo(2.4, 9);
  });

  it('liefert 0 statt unendlich bei Faktor 0', () => {
    expect(fromBaseValue(5, 0)).toBe(0);
  });
});

describe('applyFieldInput', () => {
  const MHZ = 1e6;
  const GHZ = 1e9;

  it('liest deutsche und englische Schreibweise', () => {
    expect(parseFieldInput('2,4', GHZ)).toBeCloseTo(2.4e9, 3);
    expect(parseFieldInput('2.4', GHZ)).toBeCloseTo(2.4e9, 3);
  });

  it('erkennt Tausendertrenner in beiden Schreibweisen', () => {
    expect(parseFieldInput('1.000,5', MHZ)).toBeCloseTo(1000.5e6, 3);
    expect(parseFieldInput('1,000.5', MHZ)).toBeCloseTo(1000.5e6, 3);
    expect(parseFieldInput('1.234.567', MHZ)).toBeCloseTo(1234567e6, 3);
    expect(parseFieldInput('144 800', MHZ)).toBeCloseTo(144800e6, 3);
  });

  it('meldet Zwischenzustände als unlesbar', () => {
    expect(parseFieldInput('', MHZ)).toBeNull();
    expect(parseFieldInput('-', MHZ)).toBeNull();
    expect(parseFieldInput('abc', MHZ)).toBeNull();
  });

  it('bestätigt nur beim Abschluss', () => {
    expect(applyFieldInput('24', MHZ, 'typing')).toEqual({ value: 24e6, commit: false });
    expect(applyFieldInput('24', MHZ, 'commit')).toEqual({ value: 24e6, commit: true });
    // Ohne Angabe gilt die Eingabe als noch nicht bestätigt.
    expect(applyFieldInput('24', MHZ).commit).toBe(false);
  });

  it('lässt die Einheit während einer mehrstelligen Eingabe in Ruhe', () => {
    // „24000" in MHz: kein Zwischenschritt darf einen Einheitenwechsel
    // auslösen, sonst wird die nächste Ziffer in GHz gedeutet (P1-1).
    const schritte = ['2', '24', '240', '2400', '24000'];
    for (const schritt of schritte) {
      expect(applyFieldInput(schritt, MHZ, 'typing').commit, schritt).toBe(false);
    }
    // Erst der Abschluss meldet den Wert — 24 000 MHz = 24 GHz.
    const abschluss = applyFieldInput('24000', MHZ, 'commit');
    expect(abschluss.commit).toBe(true);
    expect(abschluss.value).toBeCloseTo(24e9, 3);
  });
});

describe('validateValue', () => {
  it('akzeptiert Werte im Bereich', () => {
    expect(validateValue(5, { min: 0, max: 10 })).toEqual({ valid: true, message: null });
  });

  it('meldet Unterschreitung mit Einheit', () => {
    const result = validateValue(-1, { min: 0, max: 10, unitSymbol: 'dB' });
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Wert muss mindestens 0 dB betragen.');
  });

  it('meldet Überschreitung', () => {
    const result = validateValue(11, { min: 0, max: 10 });
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Wert darf höchstens 10 betragen.');
  });

  it('meldet ungültige Zahlen', () => {
    expect(validateValue(Number.NaN).message).toBe('Bitte eine gültige Zahl eingeben.');
  });

  it('nennt die Grenze in der Anzeigeeinheit, nicht in der Basiseinheit', () => {
    // 300 GHz als Obergrenze, angezeigt wird in GHz.
    const result = validateValue(4e11, {
      min: 1e3,
      max: 3e11,
      unitSymbol: 'GHz',
      factor: 1e9
    });
    expect(result.message).toBe('Wert darf höchstens 300 GHz betragen.');
  });
});

describe('formatFieldValue', () => {
  it('gibt Null schlicht aus', () => {
    expect(formatFieldValue(0)).toBe('0');
  });

  it('kürzt überflüssige Nachkommastellen und schreibt deutsch', () => {
    expect(formatFieldValue(2.5)).toBe('2,5');
    expect(formatFieldValue(1234.5678)).toBe('1234,57');
  });

  it('setzt im Eingabefeld bewusst keinen Tausendertrenner', () => {
    expect(formatFieldValue(1234567)).toBe('1234567');
  });

  it('weicht bei extremen Größenordnungen auf die Exponentialform aus', () => {
    expect(formatFieldValue(1e20)).toContain('e+');
    expect(formatFieldValue(1e-12)).toContain('e-');
  });

  it('liefert einen leeren String bei ungültigen Zahlen', () => {
    expect(formatFieldValue(Number.NaN)).toBe('');
  });
});

describe('pickBestUnit', () => {
  const units: UnitOption[] = [
    { id: 'hz', symbol: 'Hz', factor: 1 },
    { id: 'khz', symbol: 'kHz', factor: 1e3 },
    { id: 'mhz', symbol: 'MHz', factor: 1e6 },
    { id: 'ghz', symbol: 'GHz', factor: 1e9 }
  ];

  it('wählt die größte Einheit mit Anzeigewert >= 1', () => {
    expect(pickBestUnit(2.4e9, units)?.id).toBe('ghz');
    expect(pickBestUnit(868e6, units)?.id).toBe('mhz');
    expect(pickBestUnit(50, units)?.id).toBe('hz');
  });

  it('fällt bei 0 auf die kleinste Einheit zurück', () => {
    expect(pickBestUnit(0, units)?.id).toBe('hz');
  });

  it('kommt mit einer leeren Liste zurecht', () => {
    expect(pickBestUnit(1, [])).toBeUndefined();
  });
});
