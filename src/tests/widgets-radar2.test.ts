/**
 * Tests der Rechenmodelle der zweiten Radar-Widget-Reihe:
 * FMCW (Beat-Frequenz und Auflösung), Blindgeschwindigkeiten mit gestaffelter
 * PRF und Sekundärradar (Impulslagen, Squawk-Bitmuster, Zeitbilanz).
 */
import { describe, it, expect } from 'vitest';
import {
  computeFmcw,
  rangeFromBeatFrequency,
  resolutionCells,
  FMCW_LIMITS,
  FMCW_DELAY_WARN_FRACTION
} from '$lib/components/widgets/FmcwModel';
import {
  computeBlindSpeeds,
  computeStagger,
  msToKmh,
  BLIND_SPEED_LIMITS,
  BLIND_SPEED_ORDERS
} from '$lib/components/widgets/BlindSpeedModel';
import {
  computeSsrTiming,
  interrogationDurationUs,
  interrogationPulses,
  interrogationSpacingUs,
  modeSReplyPulses,
  parseSquawk,
  replyPulses,
  squawkDigits,
  squawkPulseStates,
  DEFAULT_SQUAWK,
  MODE_A_P1_P3_US,
  MODE_C_P1_P3_US,
  MODE_S_REPLY_BITS,
  REPLY_FRAME_US,
  REPLY_SLOTS,
  REPLY_SLOT_US,
  SQUAWK_CODE_COUNT,
  SSR_INTERROGATION_HZ,
  SSR_REPLY_HZ,
  TRANSPONDER_DELAY_US
} from '$lib/components/widgets/SsrModel';

import {
  radarHubArticle,
  radarGrundlagenArticle,
  radarVerfahrenArticle,
  radarSekundaerArticle
} from '$lib/content/radar';
import { findWidget, widgetIdsInArticle } from '$lib/data/widgets';

const C = 299792458;

describe('computeFmcw', () => {
  it('Standardwerte: Laufzeit, Beat-Frequenz und Auflösung passen zusammen', () => {
    const result = computeFmcw(
      FMCW_LIMITS.rangeM.default,
      FMCW_LIMITS.bandwidthHz.default,
      FMCW_LIMITS.rampDurationS.default,
      C
    );
    // 100 m → 667 ns Laufzeit
    expect(result.delayS * 1e9).toBeCloseTo(667.1, 0);
    // 1 GHz über 50 µs → 20 THz/s Steilheit
    expect(result.slopeHzPerS / 1e12).toBeCloseTo(20, 6);
    expect(result.beatHz / 1e6).toBeCloseTo(13.34, 1);
    expect(result.rangeResolutionM).toBeCloseTo(0.1499, 3);
  });

  it('ΔR hängt nur von der Bandbreite ab, nicht von der Rampendauer', () => {
    const a = computeFmcw(100, 2e9, 20e-6, C);
    const b = computeFmcw(250, 2e9, 200e-6, C);
    expect(a.rangeResolutionM).toBeCloseTo(b.rangeResolutionM, 12);
  });

  it('rangeFromBeatFrequency ist die Umkehrung der Beat-Frequenz', () => {
    const result = computeFmcw(180, 1.5e9, 80e-6, C);
    expect(rangeFromBeatFrequency(result.beatHz, 1.5e9, 80e-6, C)).toBeCloseTo(180, 6);
  });

  it('meldet eine kritisch lange Laufzeit erst oberhalb der Warnschwelle', () => {
    const kurz = computeFmcw(50, 1e9, 100e-6, C);
    expect(kurz.delayCritical).toBe(false);
    const lang = computeFmcw(3000, 1e9, 20e-6, C);
    expect(lang.delayFraction).toBeGreaterThanOrEqual(FMCW_DELAY_WARN_FRACTION);
    expect(lang.delayCritical).toBe(true);
  });

  it('zählt die auflösbaren Entfernungszellen', () => {
    expect(resolutionCells(150, 0.15)).toBe(1000);
    expect(resolutionCells(0, 0.15)).toBe(0);
    expect(resolutionCells(150, 0)).toBe(0);
  });
});

describe('computeBlindSpeeds', () => {
  it('S-Band 3 GHz, 1 kHz PRF → erste Blindgeschwindigkeit 50 m/s', () => {
    const result = computeBlindSpeeds(1000, 3e9, BLIND_SPEED_ORDERS, C);
    expect(result.wavelengthM).toBeCloseTo(0.09993, 4);
    expect(result.firstBlindSpeedMs).toBeCloseTo(49.97, 1);
    expect(result.blindSpeedsMs).toHaveLength(BLIND_SPEED_ORDERS);
    expect(msToKmh(result.firstBlindSpeedMs)).toBeCloseTo(179.9, 0);
  });

  it('eindeutige Geschwindigkeit ist die halbe erste Blindgeschwindigkeit', () => {
    const result = computeBlindSpeeds(BLIND_SPEED_LIMITS.prfHz.default, 3e9, 4, C);
    expect(result.unambiguousVelocityMs).toBeCloseTo(result.firstBlindSpeedMs / 2, 9);
  });

  it('höhere PRF verschiebt Blindgeschwindigkeiten nach oben und R_u nach unten', () => {
    const langsam = computeBlindSpeeds(500, 3e9, 4, C);
    const schnell = computeBlindSpeeds(2000, 3e9, 4, C);
    expect(schnell.firstBlindSpeedMs).toBeGreaterThan(langsam.firstBlindSpeedMs);
    expect(schnell.unambiguousRangeM).toBeLessThan(langsam.unambiguousRangeM);
  });

  it('Staffelung 1000/1200 Hz verschiebt die Lücke um den Faktor 6', () => {
    const stagger = computeStagger(1000, 1200, 3e9, C);
    const einzeln = computeBlindSpeeds(1000, 3e9, 1, C);
    expect(stagger.gainFactor).toBeCloseTo(6, 6);
    expect(stagger.commonBlindSpeedMs).toBeCloseTo(6 * einzeln.firstBlindSpeedMs, 6);
  });
});

describe('SsrModel: Abfrage und Antwortrahmen', () => {
  it('nennt die beiden Frequenzen der Luftfahrt', () => {
    expect(SSR_INTERROGATION_HZ).toBe(1030e6);
    expect(SSR_REPLY_HZ).toBe(1090e6);
  });

  it('Modus A fragt mit 8 µs, Modus C mit 21 µs Impulsabstand', () => {
    expect(interrogationSpacingUs('a')).toBe(MODE_A_P1_P3_US);
    expect(interrogationSpacingUs('c')).toBe(MODE_C_P1_P3_US);
    expect(interrogationPulses('a').map((p) => p.label)).toEqual(['P1', 'P2', 'P3']);
    expect(interrogationPulses('a')[2].startUs).toBe(8);
    expect(interrogationPulses('c')[2].startUs).toBe(21);
  });

  it('Modus S sendet statt P3 den Datenimpuls P6', () => {
    const pulses = interrogationPulses('s');
    expect(pulses.map((p) => p.id)).toEqual(['p1', 'p2', 'p6']);
    expect(pulses[2].startUs).toBeCloseTo(4.75, 9);
    expect(interrogationDurationUs('s')).toBeCloseTo(21, 9);
  });

  it('Antwortrahmen: F1, 13 Zeitschlitze im 1,45-µs-Raster, F2 bei 20,3 µs', () => {
    const pulses = replyPulses(DEFAULT_SQUAWK);
    expect(pulses[0].label).toBe('F1');
    expect(pulses.at(-1)?.label).toBe('F2');
    expect(pulses.at(-1)?.startUs).toBeCloseTo(REPLY_FRAME_US, 9);
    expect(pulses.filter((p) => p.kind === 'data')).toHaveLength(REPLY_SLOTS.length);
    expect(pulses[1].startUs).toBeCloseTo(REPLY_SLOT_US, 9);
    // 14 Rasterschritte füllen den Rahmen exakt aus
    expect(14 * REPLY_SLOT_US).toBeCloseTo(REPLY_FRAME_US, 9);
  });

  it('SPI erscheint nur, wenn er angefordert wird', () => {
    expect(replyPulses(DEFAULT_SQUAWK).some((p) => p.id === 'spi')).toBe(false);
    expect(replyPulses(DEFAULT_SQUAWK, true).at(-1)?.id).toBe('spi');
  });

  it('Modus-S-Antwort: vier Preambelimpulse und 56 Datenbits', () => {
    const pulses = modeSReplyPulses();
    expect(pulses.filter((p) => p.kind === 'frame')).toHaveLength(4);
    const block = pulses.at(-1);
    expect(block?.startUs).toBe(8);
    expect(block?.widthUs).toBe(MODE_S_REPLY_BITS.kurz);
    expect(modeSReplyPulses(true).at(-1)?.widthUs).toBe(MODE_S_REPLY_BITS.lang);
  });
});

describe('SsrModel: Squawk-Codes', () => {
  it('akzeptiert nur vier Oktalziffern', () => {
    expect(parseSquawk('7700')).toBe('7700');
    expect(parseSquawk(' 0000 ')).toBe('0000');
    expect(parseSquawk('7800')).toBeNull();
    expect(parseSquawk('770')).toBeNull();
    expect(parseSquawk('77000')).toBeNull();
  });

  it('kennt 4096 Codes', () => {
    expect(SQUAWK_CODE_COUNT).toBe(4096);
  });

  it('zerlegt 7700 in die Ziffern A=7, B=7, C=0, D=0', () => {
    expect(squawkDigits('7700')).toEqual({ A: 7, B: 7, C: 0, D: 0 });
  });

  it('Squawk 7700 (Luftnotfall) setzt alle A- und B-Impulse, sonst keine', () => {
    const states = squawkPulseStates('7700');
    const gesetzt = REPLY_SLOTS.filter((slot) => states[slot]);
    // Reihenfolge im Rahmen: C1 A1 C2 A2 C4 A4 X B1 D1 B2 D2 B4 D4
    expect(gesetzt).toEqual(['A1', 'A2', 'A4', 'B1', 'B2', 'B4']);
    expect(states.X).toBe(false);
    expect([states.C1, states.C2, states.C4]).toEqual([false, false, false]);
    expect([states.D1, states.D2, states.D4]).toEqual([false, false, false]);
  });

  it('Squawk 0000 setzt keinen einzigen Informationsimpuls', () => {
    const states = squawkPulseStates('0000');
    expect(REPLY_SLOTS.every((slot) => states[slot] === false)).toBe(true);
  });

  it('Squawk 1234 bildet die Wertigkeiten 1, 2 und 4 ab', () => {
    const states = squawkPulseStates('1234');
    // A = 1 → nur A1; B = 2 → nur B2; C = 3 → C1 und C2; D = 4 → nur D4
    expect([states.A1, states.A2, states.A4]).toEqual([true, false, false]);
    expect([states.B1, states.B2, states.B4]).toEqual([false, true, false]);
    expect([states.C1, states.C2, states.C4]).toEqual([true, true, false]);
    expect([states.D1, states.D2, states.D4]).toEqual([false, false, true]);
  });

  it('behandelt ungültige Codes wie 0000', () => {
    expect(squawkDigits('abcd')).toEqual({ A: 0, B: 0, C: 0, D: 0 });
  });
});

describe('computeSsrTiming', () => {
  it('100 km → 667,1 µs Laufzeit, mit 3 µs Transponderverzögerung 670,1 µs', () => {
    const timing = computeSsrTiming(100_000, 'a', C);
    expect(timing.roundTripUs).toBeCloseTo(667.13, 1);
    expect(timing.onewayUs).toBeCloseTo(333.56, 1);
    expect(timing.transponderDelayUs).toBe(TRANSPONDER_DELAY_US);
    expect(timing.totalUs).toBeCloseTo(670.13, 1);
  });

  it('Laufzeit wächst linear mit der Entfernung', () => {
    const nah = computeSsrTiming(50_000, 'a', C);
    const fern = computeSsrTiming(200_000, 'a', C);
    expect(fern.roundTripUs / nah.roundTripUs).toBeCloseTo(4, 9);
  });

  it('die mögliche Abfragerate sinkt mit der Entfernung', () => {
    const nah = computeSsrTiming(20_000, 'a', C);
    const fern = computeSsrTiming(300_000, 'a', C);
    expect(nah.maxInterrogationRateHz).toBeGreaterThan(fern.maxInterrogationRateHz);
    expect(fern.maxInterrogationRateHz).toBeGreaterThan(0);
  });
});

describe('Radar-Kapitel als Daten', () => {
  const ARTICLES = [
    radarHubArticle,
    radarGrundlagenArticle,
    radarVerfahrenArticle,
    radarSekundaerArticle
  ];

  it('deckt Hub und drei Unterkapitel mit Trailing Slash ab', () => {
    expect(ARTICLES.map((a) => a.href)).toEqual([
      '/wissen/radar/',
      '/wissen/radar/grundlagen/',
      '/wissen/radar/verfahren/',
      '/wissen/radar/sekundaerradar/'
    ]);
  });

  it.each(ARTICLES.map((a) => [a.href, a] as const))(
    '%s: Lernziele, gefüllte Abschnitte, eindeutige Anker ohne Umlaute',
    (_href, article) => {
      expect(article.goals.length).toBeGreaterThanOrEqual(3);
      expect(article.sections.length).toBeGreaterThanOrEqual(3);
      expect(article.sources?.length ?? 0).toBeGreaterThan(0);
      const ids = article.sections.map((section) => section.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
      for (const section of article.sections) {
        expect(section.blocks.length).toBeGreaterThan(0);
      }
    }
  );

  it('bettet die neuen Widgets ein und alle haben Katalogdaten', () => {
    const used = ARTICLES.flatMap((article) => widgetIdsInArticle(article));
    expect(used).toContain('fmcw');
    expect(used).toContain('blind-speed');
    expect(used).toContain('ssr-interrogation');
    expect(used).toContain('radar-pulse');
    expect(used).toContain('rcs-comparison');
    expect(used).toContain('doppler');
    for (const id of used) {
      const meta = findWidget(id);
      expect(meta, id).toBeDefined();
      expect(ARTICLES.map((a) => a.href)).toContain(meta?.chapterHref);
    }
  });
});
