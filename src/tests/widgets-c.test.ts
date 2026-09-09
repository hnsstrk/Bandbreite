/**
 * Rechenmodelle der fünf Widgets aus Welle C:
 * `radio-service-flow`, `bos-alarm-chain`, `cospas-sarsat-chain`, `fdd-tdd`
 * und `amateur-band-openings`.
 *
 * Die Referenzwerte stammen aus den im jeweiligen Modulkopf genannten Quellen
 * (VO Funk/TKG, ITU-R M.584-2, ETSI EN 300 392-2, Cospas-Sarsat C/S T.001,
 * 3GPP TS 36.101 / 38.101-1 / 38.211 / 38.213, Davies und ITU-R P.1239).
 */
import { describe, it, expect } from 'vitest';
import {
  exampleBandwidthHz,
  findExample,
  findStage,
  isCompleteTrace,
  stageIndex,
  FLOW_EXAMPLES,
  FLOW_STAGES,
  GRANT_LABEL
} from '$lib/components/widgets/RadioServiceFlowModel';
import {
  alertSignalDurationS,
  pocsagAlertDurationS,
  pocsagBatchDurationS,
  pocsagPreambleDurationS,
  stepAtProgress,
  stepFraction,
  stepStartFraction,
  tetraFrameDurationS,
  tetraSlotDurationS,
  totalWeight,
  zveiAlertDurationS,
  ALERT_PATHS,
  CHAIN_STEPS,
  POCSAG_BATCH_CODEWORDS,
  POCSAG_RATES_BPS,
  TETRA_MULTIFRAME_S
} from '$lib/components/widgets/BosAlarmChainModel';
import {
  beaconBandwidthHz,
  beaconDutyCycle,
  burstsPerHour,
  rescueStepAtProgress,
  segmentDopplerHz,
  segmentPeriodS,
  segmentUplinkDelayS,
  segmentZenithRangeM,
  BEACON_BURST_INTERVAL_S,
  BEACON_MAX_HZ,
  BEACON_MIN_HZ,
  HOMING_FREQUENCY_HZ,
  MEOSAR_LOCATION_CONFIDENCE,
  MEOSAR_LOCATION_RADIUS_M,
  MEOSAR_LOCATION_TIME_S,
  RESCUE_STEPS,
  SAR_SEGMENTS
} from '$lib/components/widgets/CospasSarsatModel';
import {
  blockWidthHz,
  duplexGapHz,
  duplexSpacingHz,
  findBand,
  guardRangeM,
  guardTimeS,
  isReversedDuplex,
  parsePattern,
  patternString,
  periodDurationS,
  slotDurationS,
  slotPattern,
  slotShares,
  symbolDurationS,
  FDD_BANDS,
  FDD_TDD_DEFAULTS,
  SYMBOLS_PER_SLOT,
  TDD_BANDS
} from '$lib/components/widgets/FddTddModel';
import {
  bandCenterMHz,
  bandOpenings,
  dayCurve,
  frequencyStatus,
  lufMHz,
  owfMHz,
  peakMufMHz,
  LUF_DAY_MHZ,
  LUF_NIGHT_MHZ,
  OPENING_BANDS,
  OPENING_BAND_IDS,
  OWF_FACTOR
} from '$lib/components/widgets/AmateurBandOpeningsModel';
import { mufMHz } from '$lib/components/widgets/IonosphereDayNightModel';
import { wrapLines } from '$lib/components/widgets/textWrap';
import { SPEED_OF_LIGHT } from '$lib/data/constants';

// ============================================================================
// 0 — Zeilenumbruch der Bühnentexte
// ============================================================================

describe('wrapLines', () => {
  it('bricht an Leerzeichen und hält die Zeilenbreite ein', () => {
    const lines = wrapLines('Der Weg von der Zuweisung bis zur Zuteilung', 20, 5);
    expect(lines.join(' ')).toBe('Der Weg von der Zuweisung bis zur Zuteilung');
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(20);
  });

  it('kürzt mit Auslassungszeichen, wenn der Text nicht passt', () => {
    const lines = wrapLines('eins zwei drei vier fuenf sechs sieben', 10, 2);
    expect(lines).toHaveLength(2);
    expect(lines[1].endsWith('…')).toBe(true);
  });

  it('lässt überlange Einzelwörter stehen und liefert für Leertext nichts', () => {
    expect(wrapLines('Frequenzbereichszuweisungsplanverordnung', 10, 2)).toEqual([
      'Frequenzbereichszuweisungsplanverordnung'
    ]);
    expect(wrapLines('   ', 10)).toEqual([]);
  });

  it('alle Beispieltexte des Flussdiagramms passen in drei Zeilen zu 62 Zeichen', () => {
    for (const example of FLOW_EXAMPLES) {
      for (const stage of FLOW_STAGES) {
        const lines = wrapLines(example.steps[stage.id], 62, 3);
        expect(lines.join('').includes('…'), `${example.id}/${stage.id}`).toBe(false);
      }
    }
  });
});

// ============================================================================
// 1 — radio-service-flow
// ============================================================================

describe('Vom Funkdienst zur Zuteilung', () => {
  it('vier Ebenen in fester Reihenfolge', () => {
    expect(FLOW_STAGES.map((stage) => stage.id)).toEqual([
      'zuweisung',
      'harmonisierung',
      'frequenzplan',
      'zuteilung'
    ]);
    expect(stageIndex('zuweisung')).toBe(0);
    expect(stageIndex('zuteilung')).toBe(FLOW_STAGES.length - 1);
  });

  it('jede Beispielspur hat zu jeder Ebene einen Eintrag', () => {
    for (const example of FLOW_EXAMPLES) {
      expect(isCompleteTrace(example), example.id).toBe(true);
    }
  });

  it('2,4-GHz-ISM: 2400 bis 2483,5 MHz sind 83,5 MHz breit und enden in einer Allgemeinzuteilung', () => {
    const ism = findExample('ism-2400');
    expect(ism.minHz).toBe(2400e6);
    expect(ism.maxHz).toBe(2483.5e6);
    expect(exampleBandwidthHz(ism)).toBeCloseTo(83.5e6, 3);
    expect(ism.grant).toBe('allgemein');
    expect(GRANT_LABEL[ism.grant]).toBe('Allgemeinzuteilung');
  });

  it('800-MHz-Mobilfunk endet in einer Einzelzuteilung, 2 m im Amateurfunk-Sonderweg', () => {
    expect(findExample('mobil-800').grant).toBe('einzel');
    expect(exampleBandwidthHz(findExample('amateur-2m'))).toBeCloseTo(2e6, 6);
    expect(findExample('amateur-2m').grant).toBe('amateur');
  });

  it('unbekannte Kennungen fallen auf den ersten Eintrag zurück', () => {
    expect(findStage('gibtsnicht').id).toBe(FLOW_STAGES[0].id);
    expect(findExample('gibtsnicht').id).toBe(FLOW_EXAMPLES[0].id);
  });
});

// ============================================================================
// 2 — bos-alarm-chain
// ============================================================================

describe('POCSAG-Funkruf (ITU-R M.584-2)', () => {
  it('ein Stapel besteht aus 17 Codewörtern zu 32 Bit = 544 Bit', () => {
    expect(POCSAG_BATCH_CODEWORDS).toBe(17);
    expect(POCSAG_BATCH_CODEWORDS * 32).toBe(544);
  });

  it('bei 1200 bit/s: Präambel 0,48 s, Stapel 0,4533 s, Aussendung 0,9333 s', () => {
    expect(pocsagPreambleDurationS(1200)).toBeCloseTo(0.48, 6);
    expect(pocsagBatchDurationS(1200)).toBeCloseTo(544 / 1200, 10);
    expect(pocsagBatchDurationS(1200)).toBeCloseTo(0.45333, 5);
    expect(pocsagAlertDurationS(1200, 1)).toBeCloseTo(0.93333, 5);
    expect(pocsagAlertDurationS(1200, 3)).toBeCloseTo(0.48 + 3 * (544 / 1200), 10);
  });

  it('doppelte Rate halbiert die Dauer, 512 bit/s ergibt 1,125 s Präambel', () => {
    expect(pocsagPreambleDurationS(512)).toBeCloseTo(1.125, 6);
    for (const rate of POCSAG_RATES_BPS) {
      expect(pocsagBatchDurationS(2 * rate)).toBeCloseTo(pocsagBatchDurationS(rate) / 2, 10);
    }
    expect(pocsagBatchDurationS(0)).toBe(0);
  });
});

describe('TETRA-Zeitraster (ETSI EN 300 392-2)', () => {
  it('Multirahmen 1,02 s = 18 Rahmen zu 56,67 ms = 72 Zeitschlitze zu 14,17 ms', () => {
    expect(tetraFrameDurationS() * 1000).toBeCloseTo(56.667, 3);
    expect(tetraSlotDurationS() * 1000).toBeCloseTo(14.167, 3);
    expect(tetraFrameDurationS() * 18).toBeCloseTo(TETRA_MULTIFRAME_S, 10);
    expect(tetraSlotDurationS() * 4 * 18).toBeCloseTo(TETRA_MULTIFRAME_S, 10);
  });
});

describe('Alarmierungswege und Kette', () => {
  it('ZVEI-Tonfolge: fünf Töne zu 70 ms sind 0,35 s', () => {
    expect(zveiAlertDurationS()).toBeCloseTo(0.35, 10);
    expect(alertSignalDurationS('zvei')).toBeCloseTo(0.35, 10);
  });

  it('alertSignalDurationS wählt je Weg die richtige Rechnung', () => {
    expect(alertSignalDurationS('pocsag', 1200, 1)).toBeCloseTo(0.93333, 5);
    expect(alertSignalDurationS('tetra')).toBeCloseTo(TETRA_MULTIFRAME_S, 10);
  });

  it('jeder Weg hat Träger, Nutzlast und Quelle', () => {
    for (const path of Object.values(ALERT_PATHS)) {
      expect(path.carrierDE.length, path.id).toBeGreaterThan(10);
      expect(path.payloadDE.length, path.id).toBeGreaterThan(10);
      expect(path.source.length, path.id).toBeGreaterThan(5);
    }
  });

  it('die fünf Glieder teilen die Darstellung lückenlos auf', () => {
    expect(CHAIN_STEPS).toHaveLength(5);
    expect(totalWeight()).toBe(7);
    const sum = CHAIN_STEPS.reduce((acc, _step, index) => acc + stepFraction(index), 0);
    expect(sum).toBeCloseTo(1, 10);
    expect(stepStartFraction(0)).toBe(0);
    expect(stepStartFraction(CHAIN_STEPS.length)).toBeCloseTo(1, 10);
  });

  it('stepAtProgress findet das Glied zum Fortschritt', () => {
    expect(stepAtProgress(0).index).toBe(0);
    expect(stepAtProgress(1).index).toBe(CHAIN_STEPS.length - 1);
    expect(stepAtProgress(-5).index).toBe(0);
    // Erstes Glied hat Anteil 1/7, das zweite reicht bis 3/7.
    expect(stepAtProgress(2 / 7).index).toBe(1);
    expect(stepAtProgress(2 / 7).localProgress).toBeCloseTo(0.5, 10);
    expect(stepAtProgress(3.5 / 7).index).toBe(2);
  });
});

// ============================================================================
// 3 — cospas-sarsat-chain
// ============================================================================

describe('406-MHz-Bake (Cospas-Sarsat C/S T.001)', () => {
  it('Bakenbereich 406,0 bis 406,1 MHz, also 100 kHz breit', () => {
    expect(BEACON_MIN_HZ).toBe(406.0e6);
    expect(BEACON_MAX_HZ).toBe(406.1e6);
    expect(beaconBandwidthHz()).toBeCloseTo(100e3, 3);
  });

  it('121,5 MHz bleibt die Peilfrequenz', () => {
    expect(HOMING_FREQUENCY_HZ).toBe(121.5e6);
  });

  it('alle 50 s eine Aussendung: 72 je Stunde, Tastverhältnis 0,88 %', () => {
    expect(burstsPerHour()).toBeCloseTo(72, 10);
    expect(BEACON_BURST_INTERVAL_S).toBe(50);
    expect(beaconDutyCycle()).toBeCloseTo(0.0088, 6);
  });
});

describe('Satellitensegmente', () => {
  it('LEOSAR umläuft die Erde in rund 102 min, GEOSAR in einem Tag', () => {
    expect(segmentPeriodS('leosar') / 60).toBeCloseTo(101.96, 1);
    expect(segmentPeriodS('geosar') / 3600).toBeCloseTo(23.93, 2);
    expect(segmentPeriodS('meosar')).toBeGreaterThan(segmentPeriodS('leosar'));
  });

  it('Signallaufzeit im Zenit wächst mit der Bahnhöhe', () => {
    expect(segmentUplinkDelayS('leosar') * 1000).toBeCloseTo(2.835, 3);
    expect(segmentUplinkDelayS('meosar') * 1000).toBeCloseTo(77.46, 2);
    expect(segmentUplinkDelayS('geosar') * 1000).toBeCloseTo(119.37, 2);
    for (const id of ['leosar', 'meosar', 'geosar'] as const) {
      expect(segmentZenithRangeM(id)).toBeCloseTo(SAR_SEGMENTS[id].altitudeM, 6);
      expect(segmentZenithRangeM(id)).toBeCloseTo(segmentUplinkDelayS(id) * SPEED_OF_LIGHT, 6);
    }
  });

  it('nur LEOSAR liefert eine brauchbare Dopplerverschiebung auf 406 MHz', () => {
    const leo = segmentDopplerHz('leosar');
    const geo = segmentDopplerHz('geosar');
    expect(leo / 1e3).toBeCloseTo(10.1, 1);
    expect(leo).toBeGreaterThan(segmentDopplerHz('meosar'));
    expect(segmentDopplerHz('meosar')).toBeGreaterThan(geo);
  });

  it('MEOSAR-Anforderung: 5 km, 95 %, 10 Minuten', () => {
    expect(MEOSAR_LOCATION_RADIUS_M).toBe(5000);
    expect(MEOSAR_LOCATION_TIME_S / 60).toBe(10);
    expect(MEOSAR_LOCATION_CONFIDENCE).toBeCloseTo(0.95, 10);
  });
});

describe('Rettungskette', () => {
  it('sechs Glieder von der Bake bis zur SAR-Einheit', () => {
    expect(RESCUE_STEPS.map((step) => step.id)).toEqual([
      'bake',
      'satellit',
      'lut',
      'mcc',
      'rcc',
      'sar'
    ]);
  });

  it('rescueStepAtProgress deckt den ganzen Bereich ab', () => {
    expect(rescueStepAtProgress(0).index).toBe(0);
    expect(rescueStepAtProgress(1).index).toBe(RESCUE_STEPS.length - 1);
    expect(rescueStepAtProgress(0.5).index).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================================
// 4 — fdd-tdd
// ============================================================================

describe('FDD: gepaartes Spektrum', () => {
  it('Band 20: Duplexabstand 41 MHz, je 30 MHz Blockbreite, Downlink unten', () => {
    const b20 = findBand(FDD_BANDS, 'band-n20');
    expect(b20.band).toContain('20');
    expect(duplexSpacingHz(b20)).toBeCloseTo(41e6, 3);
    expect(blockWidthHz(b20.uplinkMinHz, b20.uplinkMaxHz)).toBeCloseTo(30e6, 3);
    expect(blockWidthHz(b20.downlinkMinHz, b20.downlinkMaxHz)).toBeCloseTo(30e6, 3);
    expect(isReversedDuplex(b20)).toBe(true);
    expect(duplexGapHz(b20)).toBeCloseTo(11e6, 3);
  });

  it('Band 8 (900 MHz) hat 45 MHz Duplexabstand in der üblichen Lage', () => {
    const b8 = findBand(FDD_BANDS, 'band-n8');
    expect(duplexSpacingHz(b8)).toBeCloseTo(45e6, 3);
    expect(isReversedDuplex(b8)).toBe(false);
    expect(duplexGapHz(b8)).toBeCloseTo(10e6, 3);
  });

  it('jedes gepaarte Band hat einen positiven Duplexabstand, TDD-Bänder keinen', () => {
    expect(FDD_BANDS.length).toBeGreaterThan(3);
    for (const band of FDD_BANDS) {
      expect(duplexSpacingHz(band), band.band).toBeGreaterThan(0);
    }
    for (const band of TDD_BANDS) {
      expect(duplexSpacingHz(band), band.band).toBe(0);
      expect(band.uplinkMinHz).toBe(band.downlinkMinHz);
    }
  });
});

describe('TDD: Slot-Muster und Schutzzeit', () => {
  it('DDDSU: 60 % Downlink, 20 % Sonderslot, 20 % Uplink', () => {
    const pattern = slotPattern(FDD_TDD_DEFAULTS.dlSlots, FDD_TDD_DEFAULTS.ulSlots);
    expect(patternString(pattern)).toBe('DDDSU');
    const shares = slotShares(pattern);
    expect(shares.dl).toBeCloseTo(0.6, 10);
    expect(shares.special).toBeCloseTo(0.2, 10);
    expect(shares.ul).toBeCloseTo(0.2, 10);
    expect(shares.dl + shares.special + shares.ul).toBeCloseTo(1, 10);
  });

  it('mehr Downlink-Slots heben den Downlink-Anteil', () => {
    expect(slotShares(slotPattern(7, 2)).dl).toBeCloseTo(0.7, 10);
    expect(patternString(slotPattern(7, 2))).toBe('DDDDDDDSUU');
    expect(slotShares(slotPattern(1, 3)).ul).toBeCloseTo(0.6, 10);
    expect(patternString(slotPattern(0, 0))).toBe('S');
  });

  it('parsePattern liest ein Muster zurück und verwirft Fremdzeichen', () => {
    expect(patternString(parsePattern('dddsu'))).toBe('DDDSU');
    expect(patternString(parsePattern('D-D x S U'))).toBe('DDSU');
  });

  it('Numerologie: 30 kHz ergibt 0,5 ms Slot und 35,71 µs Symbol', () => {
    expect(slotDurationS(15e3) * 1000).toBeCloseTo(1, 10);
    expect(slotDurationS(30e3) * 1000).toBeCloseTo(0.5, 10);
    expect(slotDurationS(60e3) * 1000).toBeCloseTo(0.25, 10);
    expect(symbolDurationS(30e3) * 1e6).toBeCloseTo(35.714, 3);
    expect(symbolDurationS(30e3) * SYMBOLS_PER_SLOT).toBeCloseTo(slotDurationS(30e3), 12);
    expect(periodDurationS(slotPattern(3, 1), 30e3) * 1000).toBeCloseTo(2.5, 10);
  });

  it('zwei Schutzsymbole bei 30 kHz sind 71,4 µs und reichen für 10,7 km', () => {
    const guard = guardTimeS(2, 30e3);
    expect(guard * 1e6).toBeCloseTo(71.429, 3);
    expect(guardRangeM(guard) / 1000).toBeCloseTo(10.707, 3);
    expect(guardRangeM(guard)).toBeCloseTo((guard * SPEED_OF_LIGHT) / 2, 6);
    expect(guardTimeS(0, 30e3)).toBe(0);
    expect(guardRangeM(-1)).toBe(0);
  });
});

// ============================================================================
// 5 — amateur-band-openings
// ============================================================================

describe('Bandöffnungen im Tagesgang', () => {
  it('die acht Kurzwellenbänder liegen aufsteigend vor', () => {
    expect(OPENING_BANDS).toHaveLength(OPENING_BAND_IDS.length);
    const centers = OPENING_BANDS.map(bandCenterMHz);
    for (let i = 1; i < centers.length; i++) {
      expect(centers[i]).toBeGreaterThan(centers[i - 1]);
    }
    expect(bandCenterMHz(OPENING_BANDS[0])).toBeCloseTo(3.65, 10);
    expect(bandCenterMHz(OPENING_BANDS[3])).toBeCloseTo(14.175, 10);
  });

  it('MUF folgt dem Sekantengesetz aus data/propagation (foF2 = 9 MHz um 12 Uhr)', () => {
    // Kontrollwerte des Projektmodells: Faktor 2,816 bei 2000 km, 3,28 bei 3000 km.
    expect(mufMHz(12, 0)).toBeCloseTo(9.0, 2);
    expect(mufMHz(12, 2000)).toBeCloseTo(25.34, 2);
    expect(mufMHz(12, 2000) / mufMHz(12, 0)).toBeCloseTo(2.816, 3);
    expect(mufMHz(12, 3000)).toBeCloseTo(29.52, 2);
    // Nachts halbiert sich foF2 — die MUF sinkt im gleichen Verhältnis.
    expect(mufMHz(3, 2000)).toBeCloseTo(mufMHz(12, 2000) / 2, 1);
  });

  it('FOT sind 85 % der MUF', () => {
    expect(owfMHz(12, 2000)).toBeCloseTo(OWF_FACTOR * mufMHz(12, 2000), 10);
    expect(owfMHz(12, 2000)).toBeCloseTo(21.54, 2);
  });

  it('LUF steigt am Tag auf 5 MHz und fällt nachts auf den Nachtwert 1,8 MHz', () => {
    expect(lufMHz(12)).toBeCloseTo(LUF_DAY_MHZ, 6);
    // Nachts bleibt ein Prozent Restdichte der D-Schicht (LAYER_DENSITY):
    // 1,8 + 0,01 · (5 − 1,8) = 1,832 MHz.
    expect(lufMHz(3)).toBeCloseTo(1.832, 6);
    expect(lufMHz(3) - LUF_NIGHT_MHZ).toBeLessThan(0.05);
    expect(lufMHz(9)).toBeGreaterThan(LUF_NIGHT_MHZ);
    expect(lufMHz(9)).toBeLessThan(LUF_DAY_MHZ);
  });

  it('Status: 80 m mittags gedämpft, nachts offen; 10 m über der MUF geschlossen', () => {
    const mittags = bandOpenings(12, 2000);
    const nachts = bandOpenings(2, 2000);
    const status = (list: ReturnType<typeof bandOpenings>, id: string) =>
      list.find((entry) => entry.id === id)?.status;

    expect(status(mittags, 'band-80m')).toBe('gedaempft');
    expect(status(nachts, 'band-80m')).toBe('offen');
    expect(status(mittags, 'band-20m')).toBe('offen');
    expect(status(nachts, 'band-20m')).toBe('geschlossen');
    expect(status(mittags, 'band-10m')).toBe('geschlossen');
  });

  it('frequencyStatus prüft beide Schranken', () => {
    expect(frequencyStatus(1.0, 12, 2000)).toBe('gedaempft');
    expect(frequencyStatus(14.2, 12, 2000)).toBe('offen');
    expect(frequencyStatus(50, 12, 2000)).toBe('geschlossen');
  });

  it('Tageskurve deckt 0 bis 24 Uhr ab und hat ihr Maximum am Mittag', () => {
    const curve = dayCurve(2000, 145);
    expect(curve[0].hourOfDay).toBe(0);
    expect(curve[curve.length - 1].hourOfDay).toBe(24);
    const peak = curve.reduce((best, point) => (point.mufMHz > best.mufMHz ? point : best));
    expect(peak.hourOfDay).toBeCloseTo(12, 1);
    expect(peakMufMHz(2000)).toBeCloseTo(mufMHz(12, 2000), 1);
    // Größere Sprungdistanz hebt die MUF (flacherer Einfallswinkel).
    expect(peakMufMHz(4000)).toBeGreaterThan(peakMufMHz(1000));
  });
});
