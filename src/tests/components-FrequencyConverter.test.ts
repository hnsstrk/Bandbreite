/**
 * Komponententests für FrequencyConverter (geschützte Kernkomponente, E3 / P0-1).
 *
 * Fixiert das Sollverhalten der `$bindable`-Synchronisation in beide Richtungen:
 * (a) Prop-Änderung von außen (Bandklick auf /spektrum/) erreicht die Anzeige
 *     samt automatischer Einheitenwahl,
 * (b) Eingaben propagieren nach außen,
 * (c) nach (a) überschreibt die nächste Eingabe nur den neuen Wert — nie den alten,
 * (d) Presets setzen Wert und Einheit,
 * (e) ungültige Eingaben erzeugen kein NaN.
 *
 * Geprüft werden Prop-Werte, Einheiten-Selects und geparste Feldwerte — keine
 * formatierten Dezimalstrings. Die Sync-Tests nutzen bewusst Werte, die in der
 * gewählten Einheit ganzzahlig sind; die Dezimalanzeige im `number`-Feld hat
 * einen eigenen Test am Ende.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import FrequencyConverter from '$lib/components/converters/FrequencyConverter.svelte';
import { createBindableHost } from './helpers/bindableHost.svelte';
import { convertToHz, convertFromHz, convertToMeters, convertFromMeters } from '$lib/utils/conversions';
import { frequencyToWavelength, wavelengthToFrequency } from '$lib/utils/calculations';
import { FREQUENCY_CONVERTER_PRESETS } from '$lib/data/presets';

const START_HZ = convertToHz(100, 'MHz');
/** Bandmitte als „Bandklick" — ganzzahlig in GHz, damit die Anzeige prüfbar bleibt. */
const BAND_HZ = 2e9;

function felder() {
  return {
    frequenz: screen.getByLabelText('Frequenz') as HTMLInputElement,
    frequenzEinheit: screen.getByLabelText('Frequenzeinheit') as HTMLSelectElement,
    wellenlaenge: screen.getByLabelText('Wellenlänge') as HTMLInputElement,
    wellenlaengeEinheit: screen.getByLabelText('Wellenlängeneinheit') as HTMLSelectElement
  };
}

function wert(input: HTMLInputElement): number {
  return parseFloat(input.value);
}

function mitHost(start: number | null = START_HZ) {
  const host = createBindableHost<number | null>('frequencyHz', start);
  render(FrequencyConverter, { props: host.props });
  return { host, f: felder() };
}

describe('FrequencyConverter: Startzustand', () => {
  it('zeigt den Startwert in der Vorgabeeinheit MHz, Wellenlänge in m', () => {
    render(FrequencyConverter, { props: { frequencyHz: START_HZ } });
    const f = felder();
    expect(f.frequenzEinheit.value).toBe('MHz');
    expect(wert(f.frequenz)).toBe(convertFromHz(START_HZ, 'MHz'));
    expect(f.wellenlaengeEinheit.value).toBe('m');
  });
});

describe('FrequencyConverter: (a) Prop-Änderung von außen', () => {
  it('folgt einem neuen frequencyHz per rerender inkl. Einheitenwahl', async () => {
    const { rerender } = render(FrequencyConverter, { props: { frequencyHz: START_HZ } });
    await rerender({ frequencyHz: BAND_HZ });
    const f = felder();
    expect(f.frequenzEinheit.value).toBe('GHz');
    expect(wert(f.frequenz)).toBe(convertFromHz(BAND_HZ, 'GHz'));
    // Wellenlänge (≈ 15 cm) folgt mit lesbarer Einheit
    expect(f.wellenlaengeEinheit.value).toBe('cm');
  });

  it('folgt einem gebundenen Elternwert (Bandklick-Szenario)', () => {
    const { host, f } = mitHost();

    host.value = BAND_HZ;
    flushSync();
    expect(f.frequenzEinheit.value).toBe('GHz');
    expect(wert(f.frequenz)).toBe(2);

    // Sehr tiefe und sehr hohe Bandmitten bleiben lesbar
    host.value = 10;
    flushSync();
    expect(f.frequenzEinheit.value).toBe('Hz');
    expect(wert(f.frequenz)).toBe(10);
    expect(f.wellenlaengeEinheit.value).toBe('km');

    host.value = 5e14;
    flushSync();
    expect(f.frequenzEinheit.value).toBe('THz');
    expect(wert(f.frequenz)).toBe(500);
    expect(f.wellenlaengeEinheit.value).toBe('nm');
  });

  it('leert die Felder, wenn der Elternteil null setzt', () => {
    const { host, f } = mitHost();
    host.value = null;
    flushSync();
    expect(f.frequenz.value).toBe('');
    expect(f.wellenlaenge.value).toBe('');
  });
});

describe('FrequencyConverter: (b) Eingabe propagiert nach außen', () => {
  it('schreibt eine Frequenzeingabe in der aktiven Einheit als Hz ins Prop', async () => {
    const { host, f } = mitHost();
    await fireEvent.input(f.frequenz, { target: { value: '150' } });
    expect(host.value).toBeCloseTo(convertToHz(150, 'MHz'), 3);
    // Einheit bleibt beim Tippen unangetastet
    expect(f.frequenzEinheit.value).toBe('MHz');
  });

  it('rechnet eine Wellenlängeneingabe in die Frequenz um', async () => {
    const { host, f } = mitHost();
    await fireEvent.input(f.wellenlaenge, { target: { value: '2' } });
    expect(host.value).toBeCloseTo(wavelengthToFrequency(convertToMeters(2, 'm')), 3);
  });

  it('ändert beim Einheitenwechsel nur die Anzeige, nicht das Prop', async () => {
    const { host, f } = mitHost();
    await fireEvent.change(f.frequenzEinheit, { target: { value: 'kHz' } });
    expect(host.value).toBe(START_HZ);
    expect(wert(f.frequenz)).toBe(convertFromHz(START_HZ, 'kHz'));
  });
});

describe('FrequencyConverter: (c) keine veraltete Kopie', () => {
  it('überschreibt nach einer Prop-Änderung nur den neuen Wert', async () => {
    const { host, f } = mitHost();

    // Bandklick von außen → 2 GHz, Einheit GHz
    host.value = BAND_HZ;
    flushSync();
    expect(host.value).toBe(BAND_HZ);

    // Nächste Eingabe „5" gilt in der neuen Einheit: 5 GHz — nicht 5 MHz,
    // und der alte Startwert darf nirgends mehr auftauchen.
    await fireEvent.input(f.frequenz, { target: { value: '5' } });
    expect(host.value).toBeCloseTo(convertToHz(5, 'GHz'), 3);
    expect(host.value).not.toBe(START_HZ);
    expect(wert(f.frequenz)).toBe(5);
  });

  it('hält Prop und Anzeige auch über mehrere Wechsel hinweg konsistent', async () => {
    const { host, f } = mitHost();

    await fireEvent.input(f.frequenz, { target: { value: '433' } });
    expect(host.value).toBeCloseTo(convertToHz(433, 'MHz'), 3);

    host.value = 868e6;
    flushSync();
    expect(wert(f.frequenz)).toBe(868);
    expect(f.frequenzEinheit.value).toBe('MHz');

    await fireEvent.input(f.frequenz, { target: { value: '870' } });
    expect(host.value).toBeCloseTo(convertToHz(870, 'MHz'), 3);
  });

  it('wechselt die Einheit nur bei fremden Änderungen, nicht bei eigenen', async () => {
    const { host, f } = mitHost();
    await fireEvent.change(f.frequenzEinheit, { target: { value: 'kHz' } });
    // 2 000 000 kHz = 2 GHz – vom Nutzer so eingegeben, Einheit bleibt kHz
    await fireEvent.input(f.frequenz, { target: { value: '2000000' } });
    expect(host.value).toBeCloseTo(BAND_HZ, 3);
    expect(f.frequenzEinheit.value).toBe('kHz');
  });
});

describe('FrequencyConverter: (d) Presets', () => {
  it('setzt Prop, Anzeige und Einheit GHz für jedes Preset', async () => {
    const { host, f } = mitHost();
    for (const preset of FREQUENCY_CONVERTER_PRESETS) {
      const button = screen.getByTitle(new RegExp(`^${preset.label.replace('.', '\\.')} - `));
      await fireEvent.click(button);
      expect(host.value).toBe(preset.hz);
      expect(f.frequenzEinheit.value).toBe('GHz');
      const inGHz = convertFromHz(preset.hz, 'GHz');
      if (Number.isInteger(inGHz)) expect(wert(f.frequenz)).toBe(inGHz);
    }
  });
});

describe('FrequencyConverter: (e) ungültige Eingaben', () => {
  it('liefert null statt NaN bei leerer, unvollständiger oder unlesbarer Eingabe', async () => {
    const { host, f } = mitHost();
    for (const roh of ['', '-', 'abc']) {
      await fireEvent.input(f.frequenz, { target: { value: roh } });
      expect(host.value, `Eingabe „${roh}"`).toBeNull();
      expect(Number.isNaN(host.value)).toBe(false);
      expect(f.wellenlaenge.value).toBe('');
    }
    // Danach ist der Konverter weiter benutzbar
    await fireEvent.input(f.frequenz, { target: { value: '1' } });
    expect(host.value).toBeCloseTo(convertToHz(1, 'MHz'), 3);
  });

  it('behandelt Wellenlänge 0 und negative Werte als leer', async () => {
    const { host, f } = mitHost();
    for (const roh of ['0', '-3']) {
      await fireEvent.input(f.wellenlaenge, { target: { value: roh } });
      expect(host.value, `Eingabe „${roh}"`).toBeNull();
    }
  });
});

describe('FrequencyConverter: Dezimalanzeige im number-Feld', () => {
  // `<input type="number">` akzeptiert laut HTML-Spezifikation nur den
  // Dezimalpunkt; ein Komma-String wird vom Browser zu „" bereinigt.
  it('zeigt nicht ganzzahlige Werte (2,4 GHz, λ = 2,998 m) im Feld an', async () => {
    const { host, f } = mitHost();
    expect(wert(f.wellenlaenge)).toBeCloseTo(convertFromMeters(frequencyToWavelength(START_HZ), 'm'), 3);
    host.value = 2.4e9;
    flushSync();
    expect(wert(f.frequenz)).toBeCloseTo(2.4, 6);
  });
});
