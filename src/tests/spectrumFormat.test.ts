/**
 * Kurzformate des Spektrums (`components/spectrumFormat.ts`).
 *
 * Die Funktionen ersetzen die früheren `toFixed`-Helfer in
 * `spectrumState.svelte.ts`. Der Regressionsteil vergleicht gegen die alte
 * Implementierung: gleiche Einheit, gleiche Stellenzahl — nur das
 * Dezimalzeichen ist jetzt das Komma (und „um" wurde zu „μm").
 */
import { describe, it, expect } from 'vitest';
import {
  formatFrequencyLocal,
  formatWavelengthLocal,
  formatZoom
} from '$lib/components/spectrumFormat';

/** Frühere Implementierung (Bericht 42, „Gemeldet, nicht geändert"). */
function legacyFrequency(hz: number): string {
  if (hz >= 1e18) return `${(hz / 1e18).toFixed(1)} EHz`;
  if (hz >= 1e15) return `${(hz / 1e15).toFixed(1)} PHz`;
  if (hz >= 1e12) return `${(hz / 1e12).toFixed(1)} THz`;
  if (hz >= 1e9) return `${(hz / 1e9).toFixed(1)} GHz`;
  if (hz >= 1e6) return `${(hz / 1e6).toFixed(1)} MHz`;
  if (hz >= 1e3) return `${(hz / 1e3).toFixed(1)} kHz`;
  return `${hz.toFixed(0)} Hz`;
}

function legacyWavelength(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(0)} km`;
  if (meters >= 1) return `${meters.toFixed(meters >= 10 ? 0 : 1)} m`;
  if (meters >= 0.01) return `${(meters * 100).toFixed(meters >= 0.1 ? 0 : 1)} cm`;
  if (meters >= 0.001) return `${(meters * 1000).toFixed(meters >= 0.01 ? 0 : 1)} mm`;
  if (meters >= 1e-6) return `${(meters * 1e6).toFixed(meters >= 1e-5 ? 0 : 1)} um`;
  if (meters >= 1e-9) return `${(meters * 1e9).toFixed(meters >= 1e-8 ? 0 : 1)} nm`;
  if (meters >= 1e-12) return `${(meters * 1e12).toFixed(meters >= 1e-11 ? 0 : 1)} pm`;
  return `${(meters * 1e15).toFixed(0)} fm`;
}

/** Alte Ausgabe ins de-DE-Format übertragen (Mantissen < 1000, also ohne Tausenderpunkt). */
const toGerman = (s: string) => s.replace('.', ',').replace(' um', ' μm');

describe('formatFrequencyLocal', () => {
  it('formatiert die Achsenwerte des Spektrums', () => {
    expect(formatFrequencyLocal(3)).toBe('3 Hz');
    expect(formatFrequencyLocal(300)).toBe('300 Hz');
    expect(formatFrequencyLocal(3e3)).toBe('3,0 kHz');
    expect(formatFrequencyLocal(299.8e6)).toBe('299,8 MHz');
    expect(formatFrequencyLocal(433e6)).toBe('433,0 MHz');
    expect(formatFrequencyLocal(2.4e9)).toBe('2,4 GHz');
    expect(formatFrequencyLocal(1e15)).toBe('1,0 PHz');
    expect(formatFrequencyLocal(3e19)).toBe('30,0 EHz');
  });

  it('stimmt mit der früheren Implementierung bis auf das Dezimalkomma überein', () => {
    for (let exp = 0; exp <= 19; exp += 0.5) {
      for (const m of [1, 1.5, 2.99, 7.04]) {
        const hz = m * Math.pow(10, exp);
        expect(formatFrequencyLocal(hz), `${hz} Hz`).toBe(toGerman(legacyFrequency(hz)));
      }
    }
  });
});

describe('Rundung an der exakten Mitte', () => {
  // `toFixed` rundet das binäre Double (7,05 ≈ 7,0499…) ab, `Intl.NumberFormat`
  // die kürzeste Dezimaldarstellung („7,05") kaufmännisch auf. Der einzige
  // Unterschied zur alten Implementierung — für Achsenticks (Zehnerpotenzen,
  // 299,8 …) ohne Bedeutung, für Cursorwerte die erwartbare Lesart.
  it('rundet x,x5 kaufmännisch auf', () => {
    expect(formatFrequencyLocal(7.05e3)).toBe('7,1 kHz');
    expect(formatWavelengthLocal(1.45)).toBe('1,5 m');
  });
});

describe('formatWavelengthLocal', () => {
  it('formatiert Cursor- und Tooltip-Werte', () => {
    expect(formatWavelengthLocal(14)).toBe('14 m');
    expect(formatWavelengthLocal(1.5)).toBe('1,5 m');
    expect(formatWavelengthLocal(0.69236)).toBe('69 cm');
    expect(formatWavelengthLocal(0.05)).toBe('5,0 cm');
    expect(formatWavelengthLocal(1e-4)).toBe('100 μm');
    expect(formatWavelengthLocal(5e-7)).toBe('500 nm');
    expect(formatWavelengthLocal(1e-15)).toBe('1 fm');
  });

  it('setzt ab 1000 km den Tausenderpunkt', () => {
    expect(formatWavelengthLocal(30_000_000)).toBe('30.000 km');
    expect(formatWavelengthLocal(999_310_000)).toBe('999.310 km');
  });

  it('stimmt unterhalb von 1000 km mit der früheren Implementierung überein', () => {
    for (let exp = -15; exp <= 5; exp += 0.5) {
      for (const m of [1, 1.5, 2.99, 9.99]) {
        const meters = m * Math.pow(10, exp);
        expect(formatWavelengthLocal(meters), `${meters} m`).toBe(
          toGerman(legacyWavelength(meters))
        );
      }
    }
  });
});

describe('formatZoom', () => {
  it('zeigt eine Nachkommastelle unter 10 und ganze Zahlen darüber', () => {
    expect(formatZoom(1)).toBe('1,0x');
    expect(formatZoom(1.5)).toBe('1,5x');
    expect(formatZoom(2.25)).toBe('2,3x');
    expect(formatZoom(15)).toBe('15x');
    expect(formatZoom(100)).toBe('100x');
  });
});
