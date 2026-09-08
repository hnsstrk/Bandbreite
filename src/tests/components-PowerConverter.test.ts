/**
 * Komponententests für PowerConverter (geschützte Kernkomponente, E3 / P0-1).
 *
 * Gleiches Muster wie FrequencyConverter: `$bindable`-Sync in beide Richtungen.
 * (a) Prop-Änderung von außen erreicht die Anzeige samt Einheitenwahl,
 * (b) Eingaben propagieren nach außen,
 * (c) nach (a) überschreibt die nächste Eingabe nur den neuen Wert,
 * (d) dB-Einheitenwechsel (der Konverter hat keine Presets),
 * (e) ungültige Eingaben erzeugen kein NaN.
 *
 * Geprüft werden Prop-Werte, Einheiten-Selects und geparste Feldwerte — keine
 * formatierten Dezimalstrings; die Dezimalanzeige hat einen eigenen Test am Ende.
 */
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import PowerConverter from '$lib/components/converters/PowerConverter.svelte';
import { createBindableHost } from './helpers/bindableHost.svelte';
import { wattToDbm, wattToDbW, dbmToWatt, dbWToWatt, convertToWatt, convertFromWatt } from '$lib/utils/conversions';

const START_W = 1;
const EXTERN_W = 0.002;

function felder() {
  return {
    watt: screen.getByLabelText('Leistung') as HTMLInputElement,
    wattEinheit: screen.getByLabelText('Leistungseinheit (Watt)') as HTMLSelectElement,
    db: screen.getByLabelText('Leistung in dB') as HTMLInputElement,
    dbEinheit: screen.getByLabelText('Leistungseinheit (dB)') as HTMLSelectElement
  };
}

function wert(input: HTMLInputElement): number {
  return parseFloat(input.value);
}

function mitHost(start: number | null = START_W) {
  const host = createBindableHost<number | null>('powerWatt', start);
  render(PowerConverter, { props: host.props });
  return { host, f: felder() };
}

describe('PowerConverter: Startzustand', () => {
  it('zeigt den Startwert in W und dBm', () => {
    render(PowerConverter, { props: { powerWatt: START_W } });
    const f = felder();
    expect(f.wattEinheit.value).toBe('w');
    expect(wert(f.watt)).toBe(START_W);
    expect(f.dbEinheit.value).toBe('dbm');
    expect(wert(f.db)).toBe(wattToDbm(START_W));
  });
});

describe('PowerConverter: (a) Prop-Änderung von außen', () => {
  it('folgt einem neuen powerWatt per rerender inkl. Einheitenwahl', async () => {
    const { rerender } = render(PowerConverter, { props: { powerWatt: START_W } });
    await rerender({ powerWatt: EXTERN_W });
    const f = felder();
    expect(f.wattEinheit.value).toBe('mw');
    expect(wert(f.watt)).toBe(convertFromWatt(EXTERN_W, 'mw'));
  });

  it('folgt einem gebundenen Elternwert', () => {
    const { host, f } = mitHost();

    host.value = 2000;
    flushSync();
    expect(f.wattEinheit.value).toBe('kw');
    expect(wert(f.watt)).toBe(2);

    host.value = 5e-6;
    flushSync();
    expect(f.wattEinheit.value).toBe('uw');
    expect(wert(f.watt)).toBe(5);

    host.value = null;
    flushSync();
    expect(f.watt.value).toBe('');
    expect(f.db.value).toBe('');
  });
});

describe('PowerConverter: (b) Eingabe propagiert nach außen', () => {
  it('schreibt eine Watt-Eingabe in der aktiven Einheit als W ins Prop', async () => {
    const { host, f } = mitHost();
    await fireEvent.input(f.watt, { target: { value: '2' } });
    expect(host.value).toBeCloseTo(convertToWatt(2, 'w'), 9);
    expect(f.wattEinheit.value).toBe('w');
  });

  it('rechnet eine dBm-Eingabe in Watt um', async () => {
    const { host, f } = mitHost();
    await fireEvent.input(f.db, { target: { value: '30' } });
    expect(host.value).toBeCloseTo(dbmToWatt(30), 9);
  });

  it('ändert beim Einheitenwechsel nur die Anzeige, nicht das Prop', async () => {
    const { host, f } = mitHost();
    await fireEvent.change(f.wattEinheit, { target: { value: 'mw' } });
    expect(host.value).toBe(START_W);
    expect(wert(f.watt)).toBe(convertFromWatt(START_W, 'mw'));
  });
});

describe('PowerConverter: (c) keine veraltete Kopie', () => {
  it('überschreibt nach einer Prop-Änderung nur den neuen Wert', async () => {
    const { host, f } = mitHost();

    host.value = EXTERN_W;
    flushSync();
    expect(f.wattEinheit.value).toBe('mw');

    // „5" gilt jetzt in mW — nicht 5 W, und nicht der alte Startwert.
    await fireEvent.input(f.watt, { target: { value: '5' } });
    expect(host.value).toBeCloseTo(convertToWatt(5, 'mw'), 9);
    expect(host.value).not.toBe(START_W);
    expect(wert(f.watt)).toBe(5);
  });

  it('wechselt die Einheit nur bei fremden Änderungen, nicht bei eigenen', async () => {
    const { host, f } = mitHost();
    await fireEvent.change(f.wattEinheit, { target: { value: 'mw' } });
    await fireEvent.input(f.watt, { target: { value: '2000' } });
    expect(host.value).toBeCloseTo(2, 9);
    expect(f.wattEinheit.value).toBe('mw');
  });
});

describe('PowerConverter: (d) dB-Einheit', () => {
  it('wechselt zwischen dBm und dBW ohne das Prop zu verändern', async () => {
    const { host, f } = mitHost();
    await fireEvent.change(f.dbEinheit, { target: { value: 'dbw' } });
    expect(host.value).toBe(START_W);
    expect(wert(f.db)).toBe(wattToDbW(START_W));
    await fireEvent.input(f.db, { target: { value: '10' } });
    expect(host.value).toBeCloseTo(dbWToWatt(10), 9);
  });
});

describe('PowerConverter: (e) ungültige Eingaben', () => {
  it('liefert null statt NaN bei leerer, unlesbarer, negativer oder Null-Eingabe', async () => {
    const { host, f } = mitHost();
    for (const roh of ['', 'abc', '-1', '0']) {
      await fireEvent.input(f.watt, { target: { value: roh } });
      expect(host.value, `Eingabe „${roh}"`).toBeNull();
      expect(Number.isNaN(host.value)).toBe(false);
      expect(f.db.value).toBe('');
    }
    await fireEvent.input(f.watt, { target: { value: '3' } });
    expect(host.value).toBeCloseTo(3, 9);
  });

  it('leert das Prop bei leerer dB-Eingabe', async () => {
    const { host, f } = mitHost();
    await fireEvent.input(f.db, { target: { value: '' } });
    expect(host.value).toBeNull();
  });
});

describe('PowerConverter: Dezimalanzeige im number-Feld', () => {
  // `<input type="number">` akzeptiert laut HTML-Spezifikation nur den
  // Dezimalpunkt; ein Komma-String wird vom Browser zu „" bereinigt.
  it('zeigt nicht ganzzahlige Werte (2 W = 33,01 dBm; 2,5 kW) im Feld an', async () => {
    const { host, f } = mitHost();
    await fireEvent.input(f.watt, { target: { value: '2' } });
    expect(wert(f.db)).toBeCloseTo(wattToDbm(2), 3);
    host.value = 2500;
    flushSync();
    expect(wert(f.watt)).toBeCloseTo(2.5, 6);
  });
});
