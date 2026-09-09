/**
 * Rechenmodelle der Rundfunk-Widgets: UKW-Multiplex (ITU-R BS.450, IEC 62106)
 * und DAB-Gleichwellennetz (ETSI EN 300 401, Tab. 38).
 */
import { describe, it, expect } from 'vitest';
import {
  componentsForMode,
  computeFmMultiplex,
  FM_DEVIATION_LIMITS,
  MPX_COMPONENTS,
  MPX_MODES,
  RDS_HALF_BANDWIDTH_HZ,
  STEREO_SUBCARRIER_HZ
} from '$lib/components/widgets/FmMultiplexModel';
import {
  blockBandwidthHz,
  carrierSpacingFromSymbol,
  computeDabSfn,
  delayForPathDifference,
  guardDistanceM,
  maxSpacingForGuardM,
  DAB_MODES,
  DAB_NOMINAL_BANDWIDTH_HZ
} from '$lib/components/widgets/DabSfnModel';
import { FM_CHANNEL_RASTER_HZ, FM_PILOT_TONE_HZ, RDS_SUBCARRIER_HZ } from '$lib/data/broadcast';
import { SPEED_OF_LIGHT } from '$lib/data/constants';

describe('UKW-Multiplexsignal', () => {
  it('Hilfsträger ist das Doppelte des Pilottons (38 kHz)', () => {
    expect(STEREO_SUBCARRIER_HZ).toBe(2 * FM_PILOT_TONE_HZ);
    expect(STEREO_SUBCARRIER_HZ).toBe(38_000);
  });

  it('Lage der vier Anteile im Basisband', () => {
    const byId = Object.fromEntries(MPX_COMPONENTS.map((part) => [part.id, part]));
    expect(byId.summe.maxHz).toBe(15_000);
    expect(byId.pilot.minHz).toBe(19_000);
    expect(byId.differenz.minHz).toBe(23_000);
    expect(byId.differenz.maxHz).toBe(53_000);
    expect(byId.rds.minHz).toBe(RDS_SUBCARRIER_HZ - RDS_HALF_BANDWIDTH_HZ);
    expect(byId.rds.maxHz).toBe(59_400);
  });

  it('Carson-Bandbreite: Mono 180 kHz, Stereo 256 kHz, Stereo mit RDS 268,8 kHz', () => {
    const hub = FM_DEVIATION_LIMITS.default;
    expect(hub).toBe(75_000);
    expect(computeFmMultiplex(hub, 'mono').bandwidthHz).toBeCloseTo(180_000, 6);
    expect(computeFmMultiplex(hub, 'stereo').bandwidthHz).toBeCloseTo(256_000, 6);
    expect(computeFmMultiplex(hub, 'stereo-rds').bandwidthHz).toBeCloseTo(268_800, 6);
  });

  it('Modulationsindex und Rasterbedarf', () => {
    const mono = computeFmMultiplex(75_000, 'mono');
    expect(mono.modulationIndex).toBeCloseTo(5, 10);
    expect(mono.rasterSlots).toBeCloseTo(180_000 / FM_CHANNEL_RASTER_HZ, 10);
    expect(mono.fitsInRaster).toBe(false);
  });

  it('mehr Anteile bedeuten mehr Bandbreite', () => {
    const werte = MPX_MODES.map((mode) => computeFmMultiplex(60_000, mode.id).bandwidthHz);
    expect(werte[0]).toBeLessThan(werte[1]);
    expect(werte[1]).toBeLessThan(werte[2]);
  });

  it('nur die Anteile der Betriebsart werden gezeichnet', () => {
    expect(componentsForMode(MPX_MODES[0]).map((part) => part.id)).toEqual(['summe']);
    expect(componentsForMode(MPX_MODES[2])).toHaveLength(4);
  });

  it('unbekannte Betriebsart fällt auf Stereo zurück', () => {
    expect(computeFmMultiplex(75_000, 'gibt-es-nicht').mode.id).toBe('stereo');
  });
});

describe('DAB-Gleichwellennetz', () => {
  it('Schutzintervall des Modus I entspricht 73,7 km Wegunterschied', () => {
    const modeI = DAB_MODES[0];
    expect(modeI.guardS).toBeCloseTo(246e-6, 12);
    expect(guardDistanceM(modeI.guardS)).toBeCloseTo(0.000246 * SPEED_OF_LIGHT, 6);
    expect(guardDistanceM(modeI.guardS) / 1000).toBeCloseTo(73.75, 2);
  });

  it('jeder Modus belegt 1,536 MHz und hat Δf = 1/T_u', () => {
    for (const mode of DAB_MODES) {
      expect(blockBandwidthHz(mode), mode.id).toBeCloseTo(DAB_NOMINAL_BANDWIDTH_HZ, 6);
      expect(carrierSpacingFromSymbol(mode.usefulSymbolS), mode.id).toBeCloseTo(
        mode.carrierSpacingHz,
        6
      );
    }
  });

  it('in der Mitte zwischen zwei Sendern gibt es keinen Laufzeitunterschied', () => {
    const result = computeDabSfn(60_000, 0.5, DAB_MODES[0].guardS);
    expect(result.pathDifferenceM).toBeCloseTo(0, 6);
    expect(result.delayS).toBe(0);
    expect(result.withinGuard).toBe(true);
    // Zwei gleich starke Signale addieren sich zu +3,01 dB.
    expect(result.combinedGainDb).toBeCloseTo(10 * Math.log10(2), 6);
    expect(result.levelDifferenceDb).toBeCloseTo(0, 6);
  });

  it('80 km Wegunterschied liegen außerhalb des Schutzintervalls (Modus I)', () => {
    const result = computeDabSfn(100_000, 0.1, DAB_MODES[0].guardS);
    expect(result.distance1M).toBeCloseTo(10_000, 6);
    expect(result.distance2M).toBeCloseTo(90_000, 6);
    expect(result.pathDifferenceM).toBeCloseTo(80_000, 6);
    expect(result.delayS).toBeCloseTo(80_000 / SPEED_OF_LIGHT, 12);
    expect(result.delayS * 1e6).toBeCloseTo(266.9, 1);
    expect(result.withinGuard).toBe(false);
    expect(result.combinedGainDb).toBe(0);
    expect(result.marginM).toBeLessThan(0);
    // Freiraum: neunfache Entfernung sind 10·2·log₁₀(9) ≈ 19,1 dB Unterschied.
    expect(result.levelDifferenceDb).toBeCloseTo(20 * Math.log10(9), 6);
  });

  it('kurze Schutzintervalle verlangen kleine Netze', () => {
    expect(maxSpacingForGuardM(DAB_MODES[2].guardS)).toBeLessThan(
      maxSpacingForGuardM(DAB_MODES[0].guardS)
    );
    expect(delayForPathDifference(0)).toBe(0);
  });
});
