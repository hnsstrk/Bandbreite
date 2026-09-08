import { describe, it, expect } from 'vitest';
import {
  amEnvelope,
  amSidebandPowerRatio,
  amplitudeToDb,
  besselJ,
  carsonBandwidthHz,
  constellationPoints,
  gaussianFrom,
  generateWaveform,
  messageIntegral,
  grayEncode,
  idealSpectralEfficiency,
  isDigitalKind,
  isOvermodulated,
  messageSample,
  mulberry32,
  noiseSigmaFromSnrDb,
  noisyConstellation,
  occupiedBandwidthHz,
  schemeBitsPerSymbol,
  spectrumLines,
  symbolRateFromBitRate,
  toBitString,
  type WaveformParams
} from '$lib/utils/modulationMath';

const BASE: WaveformParams = {
  carrierHz: 100,
  messageHz: 10,
  amDepth: 0.5,
  deviationHz: 20,
  phaseDeviationRad: 1
};

describe('Carson-Regel', () => {
  it('liefert für UKW-Rundfunk 180 kHz', () => {
    expect(carsonBandwidthHz(75_000, 15_000)).toBe(180_000);
  });

  it('liefert für Schmalband-FM 11 kHz', () => {
    expect(carsonBandwidthHz(2_500, 3_000)).toBe(11_000);
  });

  it('wird von occupiedBandwidthHz für FM und FSK verwendet', () => {
    const params = { ...BASE, deviationHz: 75_000, messageHz: 15_000 };
    expect(occupiedBandwidthHz('fm', params)).toBe(180_000);
    expect(occupiedBandwidthHz('fsk', params)).toBe(180_000);
  });

  it('nutzt für AM, ASK und BPSK die doppelte Nachrichtenfrequenz', () => {
    const params = { ...BASE, messageHz: 4_500 };
    expect(occupiedBandwidthHz('am', params)).toBe(9_000);
    expect(occupiedBandwidthHz('ask', params)).toBe(9_000);
    expect(occupiedBandwidthHz('bpsk', params)).toBe(9_000);
  });
});

describe('Amplitudenmodulation', () => {
  it('erkennt Übermodulation ab m > 1', () => {
    expect(isOvermodulated(1)).toBe(false);
    expect(isOvermodulated(1.2)).toBe(true);
  });

  it('lässt die Hüllkurve bei Übermodulation negativ werden', () => {
    expect(amEnvelope(1.5, -1)).toBeCloseTo(-0.5, 10);
    expect(amEnvelope(0.5, -1)).toBeCloseTo(0.5, 10);
  });

  it('berechnet den Seitenbandanteil der Leistung', () => {
    expect(amSidebandPowerRatio(1)).toBeCloseTo(1 / 3, 10);
    expect(amSidebandPowerRatio(0)).toBe(0);
  });
});

describe('Zeitbereich', () => {
  it('erzeugt gleich lange Spuren', () => {
    const wave = generateWaveform('am', BASE, 128, 0.1);
    expect(wave.time).toHaveLength(128);
    expect(wave.message).toHaveLength(128);
    expect(wave.carrier).toHaveLength(128);
    expect(wave.modulated).toHaveLength(128);
  });

  it('unterscheidet analoge und digitale Nachrichtensignale', () => {
    expect(isDigitalKind('fm')).toBe(false);
    expect(isDigitalKind('bpsk')).toBe(true);
    // Digitale Nachricht ist eine Rechteckfolge mit den Pegeln ±1
    expect(messageSample('bpsk', 0.01, BASE)).toBe(1);
    expect(messageSample('bpsk', 0.15, BASE)).toBe(-1);
  });

  it('schaltet den Träger bei ASK ab, wenn das Bit null ist', () => {
    const wave = generateWaveform('ask', BASE, 400, 0.2);
    const offSamples = wave.modulated.filter((_value, index) => wave.message[index] < 0);
    expect(offSamples.every((value) => value === 0)).toBe(true);
  });

  it('setzt die Phase über Framegrenzen hinweg stetig fort', () => {
    // Die Laufanimation zeichnet Fenster hintereinander; das letzte Sample
    // des ersten Fensters muss zum ersten des nächsten passen (P2-2).
    const params = { ...BASE, deviationHz: 40 };
    const fenster = 0.05;
    const erstes = generateWaveform('fm', params, 501, fenster, 0);
    const zweites = generateWaveform('fm', params, 501, fenster, fenster);
    const letzter = erstes.modulated.length - 1;
    // Beide Fenster stoßen bei t = fenster aneinander: gleicher Zeitpunkt,
    // gleicher Wert — die Phase läuft durch, statt je Bild neu zu beginnen.
    expect(zweites.time[0]).toBeCloseTo(erstes.time[letzter], 12);
    expect(zweites.modulated[0]).toBeCloseTo(erstes.modulated[letzter], 10);
    // Auch das Fenster nach dem nächsten passt noch (kein Aufsummieren).
    const drittes = generateWaveform('fm', params, 501, fenster, 2 * fenster);
    expect(drittes.modulated[0]).toBeCloseTo(zweites.modulated[letzter], 10);
  });

  it('integriert die Nachricht geschlossen', () => {
    // Analog: ∫₀ᵗ sin(ωτ)dτ = (1 − cos ωt)/ω, nach einer vollen Periode 0.
    expect(messageIntegral('fm', 1 / BASE.messageHz, BASE)).toBeCloseTo(0, 12);
    // Digital: nach einem Symbolpaar hebt sich +1 und −1 auf.
    const symbolS = 1 / BASE.messageHz;
    expect(messageIntegral('fsk', 2 * symbolS, BASE)).toBeCloseTo(0, 12);
    expect(messageIntegral('fsk', symbolS, BASE)).toBeCloseTo(symbolS, 12);
    expect(messageIntegral('fsk', symbolS / 2, BASE)).toBeCloseTo(symbolS / 2, 12);
  });

  it('startet die FSK-Phase ohne Versatz zum Träger', () => {
    const wave = generateWaveform('fsk', { ...BASE, deviationHz: 40 }, 128, 0.05);
    expect(wave.modulated[0]).toBeCloseTo(0, 12);
  });

  it('hält die Hüllkurve der Frequenzmodulation konstant', () => {
    const wave = generateWaveform('fm', { ...BASE, deviationHz: 30 }, 2000, 0.5);
    const peak = Math.max(...wave.modulated.map(Math.abs));
    expect(peak).toBeLessThanOrEqual(1 + 1e-9);
    expect(peak).toBeGreaterThan(0.9);
  });
});

describe('Besselreihe und Spektrum', () => {
  it('trifft die Referenzwerte der Besselfunktion', () => {
    expect(besselJ(0, 0)).toBe(1);
    expect(besselJ(1, 0)).toBe(0);
    expect(besselJ(0, 1)).toBeCloseTo(0.7651977, 6);
    expect(besselJ(1, 1)).toBeCloseTo(0.4400506, 6);
    expect(besselJ(0, 2.404826)).toBeCloseTo(0, 6);
  });

  it('gibt bei AM Träger und zwei Seitenbänder aus', () => {
    const lines = spectrumLines('am', { ...BASE, amDepth: 0.6 });
    expect(lines).toHaveLength(3);
    const carrier = lines.find((line) => line.offsetHz === 0);
    expect(carrier?.amplitude).toBe(1);
    expect(lines[0].amplitude).toBeCloseTo(0.3, 10);
  });

  it('gibt bei ASK halb so große Seitenlinien wie bei BPSK aus', () => {
    // Unipolares NRZ: 1/(πn) statt 2/(πn) — der Gleichanteil steckt im Träger.
    const ask = spectrumLines('ask', BASE);
    const bpsk = spectrumLines('bpsk', BASE);
    const erste = (lines: typeof ask, offset: number) =>
      lines.find((line) => line.offsetHz === offset)?.amplitude ?? 0;
    expect(erste(ask, BASE.messageHz)).toBeCloseTo(1 / Math.PI, 12);
    expect(erste(ask, 3 * BASE.messageHz)).toBeCloseTo(1 / (3 * Math.PI), 12);
    expect(erste(ask, BASE.messageHz)).toBeCloseTo(erste(bpsk, BASE.messageHz) / 2, 12);
    // Der Träger bleibt bei ASK erhalten.
    expect(erste(ask, 0)).toBeCloseTo(0.5, 12);
  });

  it('lässt bei BPSK den Träger weg', () => {
    const lines = spectrumLines('bpsk', BASE);
    expect(lines.some((line) => line.offsetHz === 0)).toBe(false);
  });

  it('erzeugt bei FM symmetrische Seitenbandpaare', () => {
    const lines = spectrumLines('fm', { ...BASE, deviationHz: 50, messageHz: 10 });
    const upper = lines.filter((line) => line.offsetHz > 0);
    const lower = lines.filter((line) => line.offsetHz < 0);
    expect(upper.length).toBe(lower.length);
    expect(upper.length).toBeGreaterThan(3);
  });

  it('begrenzt den Pegel nach unten', () => {
    expect(amplitudeToDb(1)).toBeCloseTo(0, 10);
    expect(amplitudeToDb(0)).toBe(-40);
    expect(amplitudeToDb(0.1)).toBeCloseTo(-20, 10);
  });
});

describe('Gray-Codierung und Konstellationen', () => {
  it('codiert nach g = i XOR (i >> 1)', () => {
    expect([0, 1, 2, 3].map(grayEncode)).toEqual([0, 1, 3, 2]);
    expect(toBitString(grayEncode(2), 2)).toBe('11');
  });

  it('liefert für 16-QAM 16 Punkte mit 4 Bit je Symbol', () => {
    const points = constellationPoints('qam16');
    expect(points).toHaveLength(16);
    expect(schemeBitsPerSymbol('qam16')).toBe(4);
    expect(points.every((point) => point.bits.length === 4)).toBe(true);
    expect(new Set(points.map((point) => point.bits)).size).toBe(16);
  });

  it('unterscheidet benachbarte 16-QAM-Punkte in genau einem Bit', () => {
    const points = constellationPoints('qam16');
    const LEVELS = 4;
    const hamming = (a: string, b: string) =>
      a.split('').reduce((sum, bit, index) => sum + (bit === b[index] ? 0 : 1), 0);
    for (let row = 0; row < LEVELS; row += 1) {
      for (let column = 0; column < LEVELS - 1; column += 1) {
        const left = points[row * LEVELS + column];
        const right = points[row * LEVELS + column + 1];
        expect(hamming(left.bits, right.bits)).toBe(1);
      }
    }
  });

  it('normiert die mittlere Symbolleistung auf 1', () => {
    for (const scheme of ['bpsk', 'qpsk', 'psk8', 'qam16', 'qam64'] as const) {
      const points = constellationPoints(scheme);
      const power =
        points.reduce((sum, point) => sum + point.i * point.i + point.q * point.q, 0) /
        points.length;
      expect(power).toBeCloseTo(1, 6);
    }
  });

  it('verteilt 64-QAM auf ein 8-mal-8-Raster mit 6 Bit', () => {
    const points = constellationPoints('qam64');
    expect(points).toHaveLength(64);
    expect(points.every((point) => point.bits.length === 6)).toBe(true);
    expect(idealSpectralEfficiency('qam64')).toBe(6);
  });

  it('legt BPSK auf die reelle Achse', () => {
    const points = constellationPoints('bpsk');
    expect(points).toHaveLength(2);
    expect(points[0].i).toBeCloseTo(1, 10);
    expect(points[1].i).toBeCloseTo(-1, 10);
    expect(Math.abs(points[1].q)).toBeLessThan(1e-10);
  });
});

describe('Rauschen', () => {
  it('ist bei gleichem Startwert reproduzierbar', () => {
    const first = mulberry32(42);
    const second = mulberry32(42);
    for (let index = 0; index < 5; index += 1) {
      expect(first()).toBe(second());
    }
  });

  it('liefert Werte im Einheitsintervall', () => {
    const random = mulberry32(7);
    for (let index = 0; index < 200; index += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('berechnet die Streuung aus dem Störabstand', () => {
    // 0 dB: Signalleistung 1, Rauschleistung 1, je Komponente 0,5
    expect(noiseSigmaFromSnrDb(0)).toBeCloseTo(Math.sqrt(0.5), 10);
    expect(noiseSigmaFromSnrDb(20)).toBeCloseTo(Math.sqrt(0.005), 10);
  });

  it('erzeugt reproduzierbare Streupunkte', () => {
    const points = constellationPoints('qpsk');
    const a = noisyConstellation(points, 15, 1234, 8);
    const b = noisyConstellation(points, 15, 1234, 8);
    expect(a).toHaveLength(32);
    expect(a).toEqual(b);
  });

  it('vergrößert die Streuung bei kleinerem Störabstand', () => {
    const points = constellationPoints('qpsk');
    const spread = (snrDb: number) => {
      const samples = noisyConstellation(points, snrDb, 99, 50);
      return samples.reduce((sum, sample) => {
        const ideal = points.find((point) => point.index === sample.index)!;
        return sum + Math.hypot(sample.i - ideal.i, sample.q - ideal.q);
      }, 0);
    };
    expect(spread(5)).toBeGreaterThan(spread(25));
  });

  it('liefert normalverteilte Werte mit Mittelwert nahe null', () => {
    const random = mulberry32(2024);
    let sum = 0;
    const COUNT = 5000;
    for (let index = 0; index < COUNT; index += 1) sum += gaussianFrom(random);
    expect(Math.abs(sum / COUNT)).toBeLessThan(0.05);
  });
});

describe('Symbolrate und Bitrate', () => {
  it('teilt die Bitrate durch die Bit je Symbol', () => {
    expect(symbolRateFromBitRate(1_000_000, 4)).toBe(250_000);
    expect(symbolRateFromBitRate(1_000_000, 0)).toBe(0);
  });
});
