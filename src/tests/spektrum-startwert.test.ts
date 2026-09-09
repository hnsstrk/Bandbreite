/**
 * Startwert der Spektrumsseite (Entscheidung des Besitzers, Bericht 74).
 *
 * Ohne `?f=` startet `/spektrum/` auf 100 MHz. Geprüft werden die Konstante
 * selbst (Wert und Bandlage) und die Verwendung im Seiten-Wrapper: Der
 * URL-Parameter behält Vorrang, die Konstante ist nur der Rückfall.
 */
import { describe, it, expect } from 'vitest';
import {
  SPECTRUM_DEFAULT_FREQUENCY_HZ,
  SPECTRUM_MAX_GAMMA_HZ,
  SPECTRUM_MIN_HZ
} from '$lib/data/spectrum';
import { convertToHz } from '$lib/utils/conversions';
import { getBandsForFrequency } from '$lib/data/bands';

const SEITE = import.meta.glob('/src/routes/spektrum/+page.svelte', {
  query: '?raw',
  import: 'default',
  eager: true
}) as Record<string, string>;

const quelltext = SEITE['/src/routes/spektrum/+page.svelte'];

describe('SPECTRUM_DEFAULT_FREQUENCY_HZ', () => {
  it('entspricht 100 MHz', () => {
    expect(SPECTRUM_DEFAULT_FREQUENCY_HZ).toBe(convertToHz(100, 'MHz'));
    expect(SPECTRUM_DEFAULT_FREQUENCY_HZ).toBe(1e8);
  });

  it('liegt innerhalb der darstellbaren Spektrumsgrenzen', () => {
    expect(SPECTRUM_DEFAULT_FREQUENCY_HZ).toBeGreaterThanOrEqual(SPECTRUM_MIN_HZ);
    expect(SPECTRUM_DEFAULT_FREQUENCY_HZ).toBeLessThanOrEqual(SPECTRUM_MAX_GAMMA_HZ);
  });

  it('fällt in das VHF-Band (UKW-Rundfunk)', () => {
    const namen = getBandsForFrequency(SPECTRUM_DEFAULT_FREQUENCY_HZ).map((band) => band.name);
    expect(namen).toContain('VHF');
  });
});

describe('/spektrum/ Seiten-Wrapper', () => {
  it('nutzt die Konstante als Startwert statt einer Magic Number', () => {
    expect(quelltext).toContain('SPECTRUM_DEFAULT_FREQUENCY_HZ');
    expect(quelltext).toContain('frequencyFromUrl() ?? SPECTRUM_DEFAULT_FREQUENCY_HZ');
  });
});
