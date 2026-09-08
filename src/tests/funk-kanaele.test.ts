/**
 * Tests für die Kanalumrechnung von DAB+, DVB-T2 und UKW.
 */

import { describe, it, expect } from 'vitest';
import {
  FM_BAND_MAX_HZ,
  FM_BAND_MIN_HZ,
  FM_CHANNEL_COUNT,
  dabBlock,
  dabBlockForFrequency,
  dvbT2Channel,
  dvbT2ChannelForFrequency,
  fmNearestRaster,
  fmRasterFrequency,
  isOnFmRaster
} from '$lib/components/funk/broadcastChannels.svelte';
import {
  DAB_BLOCKS,
  DAB_BLOCK_BANDWIDTH_HZ,
  DVBT2_CHANNELS,
  DVBT2_CHANNEL_BANDWIDTH_HZ,
  DVBT2_CHANNEL_OFFSET_HZ
} from '$lib/data/broadcast';

describe('DAB-Blöcke', () => {
  it('liefert Mitte und Grenzen von Block 11C', () => {
    const block = dabBlock('11C');
    expect(block?.centerHz).toBe(220352000);
    expect(block?.bandwidthHz).toBe(DAB_BLOCK_BANDWIDTH_HZ);
    expect(block?.minHz).toBe(220352000 - DAB_BLOCK_BANDWIDTH_HZ / 2);
    expect(block?.maxHz).toBe(220352000 + DAB_BLOCK_BANDWIDTH_HZ / 2);
  });

  it('ist bei der Blockbezeichnung tolerant', () => {
    expect(dabBlock(' 5c ')?.centerHz).toBe(178352000);
    expect(dabBlock('13Z')).toBeUndefined();
  });

  it('findet den Block zu einer Frequenz', () => {
    expect(dabBlockForFrequency(220352000)?.label).toBe('11C');
    expect(dabBlockForFrequency(220e6)?.label).toBe('11C');
    expect(dabBlockForFrequency(160e6)).toBeUndefined();
  });

  it('lässt zwischen den Blöcken Lücken', () => {
    // Die Blöcke sind 1,536 MHz breit, der Rasterabstand ist größer.
    const zwischenraum = (DAB_BLOCKS[1].centerHz + DAB_BLOCKS[0].centerHz) / 2;
    expect(dabBlockForFrequency(zwischenraum)).toBeUndefined();
  });
});

describe('DVB-T2-Kanäle', () => {
  it('folgt der Regel 306 MHz + 8 MHz · Kanalnummer', () => {
    for (const entry of DVBT2_CHANNELS) {
      expect(entry.centerHz).toBe(
        DVBT2_CHANNEL_OFFSET_HZ + DVBT2_CHANNEL_BANDWIDTH_HZ * entry.channel
      );
    }
  });

  it('liefert Grenzen von Kanal 21', () => {
    const channel = dvbT2Channel(21);
    expect(channel?.centerHz).toBe(474e6);
    expect(channel?.minHz).toBe(470e6);
    expect(channel?.maxHz).toBe(478e6);
  });

  it('kennt keine Kanäle außerhalb von 21 bis 48', () => {
    expect(dvbT2Channel(20)).toBeUndefined();
    expect(dvbT2Channel(49)).toBeUndefined();
  });

  it('findet den Kanal zu einer Frequenz', () => {
    expect(dvbT2ChannelForFrequency(546e6)?.label).toBe('Kanal 30');
    expect(dvbT2ChannelForFrequency(700e6)).toBeUndefined();
  });
});

describe('UKW-Raster', () => {
  it('beginnt bei 87,5 MHz und endet bei 108,0 MHz', () => {
    expect(fmRasterFrequency(1)).toBe(FM_BAND_MIN_HZ);
    expect(fmRasterFrequency(FM_CHANNEL_COUNT)).toBeCloseTo(FM_BAND_MAX_HZ, 6);
    expect(FM_CHANNEL_COUNT).toBe(206);
  });

  it('weist Plätze außerhalb zurück', () => {
    expect(fmRasterFrequency(0)).toBeUndefined();
    expect(fmRasterFrequency(FM_CHANNEL_COUNT + 1)).toBeUndefined();
    expect(fmRasterFrequency(1.5)).toBeUndefined();
  });

  it('rundet auf den nächsten Rasterplatz', () => {
    const treffer = fmNearestRaster(98.74e6);
    expect(treffer?.frequencyHz).toBeCloseTo(98.7e6, 0);
    expect(Math.abs(treffer?.offsetHz ?? 0)).toBeCloseTo(40e3, 0);
  });

  it('erkennt Frequenzen exakt auf dem Raster', () => {
    expect(isOnFmRaster(98.7e6)).toBe(true);
    expect(isOnFmRaster(98.75e6)).toBe(false);
  });

  it('liefert außerhalb von Band II nichts', () => {
    expect(fmNearestRaster(80e6)).toBeUndefined();
    expect(fmNearestRaster(120e6)).toBeUndefined();
  });
});
