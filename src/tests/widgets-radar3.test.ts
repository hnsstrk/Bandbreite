/**
 * Rechenmodelle der dritten Radar-Widget-Reihe: Radargleichung (Reichweite
 * über Sendeleistung), Pulskompression und der Modus-S-Antwortrahmen DF17.
 * Referenzen: Skolnik, Introduction to Radar Systems, 3. Aufl., Gl. 1.7 und
 * §6.5; ICAO Annex 10 Vol. IV, §3.1.2.3.
 */
import { describe, it, expect } from 'vitest';
import {
  computeRadarRange,
  powerFraction,
  radarParameters,
  radarRangeCurve,
  rangeScaling,
  RADAR_RANGE_DOUBLING_FACTOR,
  RADAR_RANGE_FREQUENCY_HZ,
  RADAR_RANGE_LIMITS,
  RADAR_RANGE_LOSS_DB
} from '$lib/components/widgets/RadarRangeModel';
import {
  chirpSample,
  computePulseCompression,
  matchedFilterAmplitude,
  matchedFilterDb,
  FIRST_SIDELOBE_AT,
  FIRST_SIDELOBE_DB,
  PULSE_COMPRESSION_LIMITS
} from '$lib/components/widgets/PulseCompressionModel';
import {
  addressSpace,
  fieldForBit,
  fieldTiming,
  frameDurationUs,
  preamblePulses,
  toBinary,
  totalFieldBits,
  DF17_FIELDS,
  DF17_FORMAT_NUMBER,
  DF17_TOTAL_BITS,
  MODE_S_BIT_RATE_BPS
} from '$lib/components/widgets/ModeSFrameModel';
import {
  MODE_S_ADDRESS_BITS,
  MODE_S_PREAMBLE_US,
  MODE_S_REPLY_BITS
} from '$lib/components/widgets/SsrModel';
import { calculateRadarMaxRange, calculateRadarReceivedPowerDbm } from '$lib/utils/radar';
import { frequencyToWavelength } from '$lib/utils/calculations';
import {
  radarGrundlagenArticle,
  radarVerfahrenArticle,
  radarSekundaerArticle
} from '$lib/content/radar';
import { findWidget, widgetIdsInArticle } from '$lib/data/widgets';

const BASIS = {
  txPowerW: RADAR_RANGE_LIMITS.txPowerW.default,
  antennaGainDbi: RADAR_RANGE_LIMITS.antennaGainDbi.default,
  rcsM2: RADAR_RANGE_LIMITS.rcsM2.default,
  minPowerDbm: RADAR_RANGE_LIMITS.minPowerDbm.default
};

describe('Radargleichung als Kurve', () => {
  it('nutzt die Wellenlänge der eingestellten Frequenz und die Systemverluste', () => {
    const params = radarParameters(BASIS);
    expect(params.wavelengthM).toBeCloseTo(frequencyToWavelength(RADAR_RANGE_FREQUENCY_HZ), 12);
    expect(params.wavelengthM * 100).toBeCloseTo(10.71, 2);
    expect(params.systemLossDb).toBe(RADAR_RANGE_LOSS_DB);
  });

  it('16-fache Sendeleistung verdoppelt die Reichweite', () => {
    const einfach = computeRadarRange(BASIS);
    const sechzehnfach = computeRadarRange({
      ...BASIS,
      txPowerW: BASIS.txPowerW * RADAR_RANGE_DOUBLING_FACTOR
    });
    expect(sechzehnfach.rangeM / einfach.rangeM).toBeCloseTo(2, 9);
    expect(einfach.powerForDoubleRangeW).toBe(BASIS.txPowerW * 16);
  });

  it('16-facher Radarquerschnitt wirkt genauso', () => {
    const einfach = computeRadarRange(BASIS);
    const gross = computeRadarRange({ ...BASIS, rcsM2: BASIS.rcsM2 * 16 });
    expect(gross.rangeM / einfach.rangeM).toBeCloseTo(2, 9);
  });

  it('vierfacher Antennengewinn verdoppelt die Reichweite (G wirkt quadratisch)', () => {
    const einfach = computeRadarRange(BASIS);
    const stark = computeRadarRange({
      ...BASIS,
      antennaGainDbi: BASIS.antennaGainDbi + 10 * Math.log10(4)
    });
    expect(stark.rangeM / einfach.rangeM).toBeCloseTo(2, 6);
    // 6,0 dB statt 6,02 dB verfehlen die Verdopplung knapp.
    const knapp = computeRadarRange({ ...BASIS, antennaGainDbi: BASIS.antennaGainDbi + 6 });
    expect(knapp.rangeM / einfach.rangeM).toBeCloseTo(1.995, 3);
  });

  it('Probe: bei R_max kommt genau die Empfindlichkeit an, auf halber Strecke 12 dB mehr', () => {
    const result = computeRadarRange(BASIS);
    expect(result.receivedAtMaxDbm).toBeCloseTo(BASIS.minPowerDbm, 6);
    expect(result.receivedAtHalfDbm - result.receivedAtMaxDbm).toBeCloseTo(20 * Math.log10(4), 6);
    expect(calculateRadarReceivedPowerDbm(radarParameters(BASIS), result.rangeM)).toBeCloseTo(
      BASIS.minPowerDbm,
      6
    );
  });

  it('rangeScaling ist die vierte Wurzel', () => {
    expect(rangeScaling(16)).toBeCloseTo(2, 12);
    expect(rangeScaling(10)).toBeCloseTo(1.7783, 4);
    expect(rangeScaling(0)).toBe(0);
  });

  it('die Kurve steigt monoton und deckt die Reglerspanne ab', () => {
    const curve = radarRangeCurve(BASIS, 25);
    expect(curve).toHaveLength(25);
    expect(curve[0].txPowerW).toBeCloseTo(RADAR_RANGE_LIMITS.txPowerW.min, 6);
    expect(curve[curve.length - 1].txPowerW).toBeCloseTo(RADAR_RANGE_LIMITS.txPowerW.max, 6);
    for (let i = 1; i < curve.length; i++) {
      expect(curve[i].rangeM).toBeGreaterThan(curve[i - 1].rangeM);
    }
    expect(curve[0].rangeM).toBeCloseTo(
      calculateRadarMaxRange(
        radarParameters({ ...BASIS, txPowerW: RADAR_RANGE_LIMITS.txPowerW.min }),
        BASIS.minPowerDbm
      ),
      6
    );
  });

  it('powerFraction bildet die logarithmische Achse ab', () => {
    expect(powerFraction(RADAR_RANGE_LIMITS.txPowerW.min)).toBeCloseTo(0, 12);
    expect(powerFraction(RADAR_RANGE_LIMITS.txPowerW.max)).toBeCloseTo(1, 12);
    expect(powerFraction(0)).toBe(0);
  });
});

describe('Pulskompression', () => {
  it('1 MHz Bandbreite und 100 µs Impuls ergeben Gewinn 100 (20 dB)', () => {
    const result = computePulseCompression(1e6, 100e-6);
    expect(result.gain).toBeCloseTo(100, 9);
    expect(result.gainDb).toBeCloseTo(20, 9);
    expect(result.compressedS).toBeCloseTo(1e-6, 12);
    expect(result.compressedFraction).toBeCloseTo(0.01, 9);
  });

  it('Auflösung folgt der Bandbreite, nicht der Sendedauer: 15 km werden zu 150 m', () => {
    const result = computePulseCompression(1e6, 100e-6);
    expect(result.rawResolutionM / 1000).toBeCloseTo(14.99, 2);
    expect(result.compressedResolutionM).toBeCloseTo(149.9, 1);
    expect(result.rawResolutionM / result.compressedResolutionM).toBeCloseTo(result.gain, 6);
  });

  it('Standardwerte der Regler bleiben sinnvoll', () => {
    const result = computePulseCompression(
      PULSE_COMPRESSION_LIMITS.bandwidthHz.default,
      PULSE_COMPRESSION_LIMITS.pulseWidthS.default
    );
    expect(result.gain).toBeGreaterThan(1);
    expect(result.compressedResolutionM).toBeLessThan(result.rawResolutionM);
  });

  it('das angepasste Filter liefert eine si-Funktion mit Nullstellen bei Vielfachen von 1/B', () => {
    expect(matchedFilterAmplitude(0)).toBe(1);
    expect(matchedFilterAmplitude(1)).toBeCloseTo(0, 12);
    expect(matchedFilterAmplitude(2)).toBeCloseTo(0, 12);
    expect(matchedFilterAmplitude(-1)).toBeCloseTo(0, 12);
    expect(Math.abs(matchedFilterAmplitude(0.5))).toBeCloseTo(2 / Math.PI, 9);
  });

  it('der erste Nebenzipfel liegt bei −13,26 dB (Skolnik: −13,2 dB)', () => {
    expect(matchedFilterDb(FIRST_SIDELOBE_AT)).toBeCloseTo(FIRST_SIDELOBE_DB, 2);
    expect(matchedFilterDb(0)).toBeCloseTo(0, 9);
    expect(matchedFilterDb(1, -40)).toBe(-40);
  });

  it('die Momentanfrequenz des Chirps steigt: mehr Nulldurchgänge am Ende', () => {
    const zaehle = (von: number, bis: number) => {
      let wechsel = 0;
      let vorher = chirpSample(von, 4, 20);
      for (let i = 1; i <= 400; i++) {
        const u = von + ((bis - von) * i) / 400;
        const wert = chirpSample(u, 4, 20);
        if (Math.sign(wert) !== Math.sign(vorher)) wechsel++;
        vorher = wert;
      }
      return wechsel;
    };
    expect(zaehle(0.8, 1)).toBeGreaterThan(zaehle(0, 0.2));
    expect(chirpSample(0, 4, 20)).toBeCloseTo(1, 12);
  });
});

describe('Modus-S-Antwortrahmen DF17', () => {
  it('die fünf Felder ergeben zusammen 112 Bit', () => {
    expect(DF17_TOTAL_BITS).toBe(MODE_S_REPLY_BITS.lang);
    expect(DF17_TOTAL_BITS).toBe(112);
    expect(totalFieldBits()).toBe(DF17_TOTAL_BITS);
    expect(DF17_FIELDS).toHaveLength(5);
  });

  it('die Felder schließen lückenlos aneinander an', () => {
    let erwartet = 1;
    for (const field of DF17_FIELDS) {
      expect(field.startBit, field.id).toBe(erwartet);
      erwartet += field.bits;
    }
    expect(erwartet - 1).toBe(DF17_TOTAL_BITS);
  });

  it('Bit 9 bis 32 tragen die 24 Bit lange ICAO-Adresse', () => {
    expect(fieldForBit(9)?.id).toBe('aa');
    expect(fieldForBit(32)?.id).toBe('aa');
    expect(fieldForBit(33)?.id).toBe('me');
    expect(fieldForBit(113)).toBeUndefined();
    expect(fieldForBit(9)?.bits).toBe(MODE_S_ADDRESS_BITS);
    expect(addressSpace()).toBe(16_777_216);
  });

  it('Zeitlage: Datenblock ab 8 µs, ein Bit je Mikrosekunde, Rahmen 120 µs', () => {
    expect(MODE_S_BIT_RATE_BPS).toBe(1e6);
    expect(frameDurationUs()).toBe(120);
    expect(frameDurationUs(MODE_S_REPLY_BITS.kurz)).toBe(64);
    const adresse = fieldTiming(DF17_FIELDS[2]);
    expect(adresse.startUs).toBe(16);
    expect(adresse.durationUs).toBe(24);
    const pruefung = fieldTiming(DF17_FIELDS[4]);
    expect(pruefung.startUs + pruefung.durationUs).toBe(frameDurationUs());
  });

  it('die Preambel besteht aus vier Impulsen bei 0; 1,0; 3,5 und 4,5 µs', () => {
    const pulses = preamblePulses();
    expect(pulses.map((pulse) => pulse.startUs)).toEqual([...MODE_S_PREAMBLE_US]);
    expect(pulses).toHaveLength(4);
    for (const pulse of pulses) {
      expect(pulse.widthUs).toBe(0.5);
    }
  });

  it('DF17 steht binär als 10001 in den ersten fünf Bit', () => {
    expect(DF17_FORMAT_NUMBER).toBe(17);
    expect(toBinary(DF17_FORMAT_NUMBER, 5)).toBe('10001');
    expect(toBinary(0, 3)).toBe('000');
    expect(toBinary(-1, 5)).toBe('');
  });
});

describe('Einbindung in die Kapitel', () => {
  it('die neuen Widgets stehen in ihren Kapiteln', () => {
    expect(widgetIdsInArticle(radarGrundlagenArticle)).toContain('radar-range');
    expect(widgetIdsInArticle(radarVerfahrenArticle)).toContain('pulse-compression');
    expect(widgetIdsInArticle(radarSekundaerArticle)).toContain('mode-s-frame');
  });

  it('und tragen Katalogeinträge mit passendem Kapitel', () => {
    expect(findWidget('radar-range')?.chapterHref).toBe('/wissen/radar/grundlagen/');
    expect(findWidget('pulse-compression')?.chapterHref).toBe('/wissen/radar/verfahren/');
    expect(findWidget('mode-s-frame')?.chapterHref).toBe('/wissen/radar/sekundaerradar/');
  });
});
