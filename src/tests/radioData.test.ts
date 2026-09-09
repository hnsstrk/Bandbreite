/**
 * Struktur- und Referenzwert-Tests für die Funk-Datendateien
 *
 * Geprüft werden:
 * - src/lib/data/radioServices.ts
 * - src/lib/data/amateurBands.ts
 * - src/lib/data/mobileNetworks.ts
 * - src/lib/data/broadcast.ts
 * - src/lib/data/emergencyFrequencies.ts
 * - src/lib/data/modulation.ts
 * - src/lib/data/antennas.ts
 *
 * Die Referenzwerte stammen aus den in den Datendateien genannten Quellen
 * (ITU RR, ETSI, 3GPP, ICAO, IARU R1, AFuV).
 */

import { describe, it, expect } from 'vitest';

import { SPEED_OF_LIGHT } from '$lib/data/constants';

import {
  RADIO_SERVICES,
  RADIO_SERVICE_GROUP_LABELS,
  getServicesForFrequency
} from '$lib/data/radioServices';

import {
  AMATEUR_BANDS,
  POWER_CLASS_A_W,
  POWER_CLASS_E_W,
  POWER_CLASS_E_VHF_W,
  POWER_CLASS_E_SHF_W,
  POWER_CLASS_N_EIRP_W,
  POWER_CLASS_N_ERP_10M_W,
  POWER_CLASS_N_ERP_VHF_W,
  POWER_MICROWAVE_CLASS_A_W,
  POWER_30M_W,
  POWER_60M_ERP_W,
  POWER_LF_MF_ERP_W,
  getAmateurBandForFrequency,
  getAmateurSegmentForFrequency,
  getBandsForLicenseClass
} from '$lib/data/amateurBands';

import {
  MOBILE_GENERATIONS,
  MOBILE_BANDS,
  getMobileBandsForFrequency
} from '$lib/data/mobileNetworks';

import {
  BROADCAST_RANGES,
  SHORTWAVE_BANDS,
  DAB_BLOCKS,
  DAB_BLOCK_BANDWIDTH_HZ,
  DAB_BLOCKS_DE,
  DAB_BAND_III_MIN_HZ,
  DAB_BAND_III_MAX_HZ,
  DAB_CHANNEL_13_MAX_HZ,
  DVBT2_CHANNELS,
  DVBT2_CHANNEL_BANDWIDTH_HZ,
  DVBT2_CHANNEL_OFFSET_HZ,
  DVBT2_BAND_MIN_HZ,
  DVBT2_BAND_MAX_HZ,
  FM_MAX_DEVIATION_HZ,
  FM_MAX_AUDIO_HZ,
  AM_CHANNEL_SPACING_R1_HZ,
  SATELLITE_TV_BANDS,
  getDabBlockRange,
  getDvbT2ChannelRange
} from '$lib/data/broadcast';

import {
  EMERGENCY_FREQUENCIES,
  getEmergencyFrequenciesByDomain,
  findEmergencyFrequenciesNear
} from '$lib/data/emergencyFrequencies';

import {
  MODULATIONS,
  carsonBandwidthHz,
  fmModulationIndex,
  bitsPerSymbol,
  spreadingGainDb,
  getModulationsByClass
} from '$lib/data/modulation';

import {
  ANTENNA_TYPES,
  GAIN_DIPOLE_DBI,
  DIPOLE_IMPEDANCE_OHM,
  PARABOLIC_EFFICIENCY_TYPICAL,
  parabolicGainLinear,
  parabolicGainDbi,
  parabolicBeamwidthDeg,
  arrayGainDbi,
  dbdToDbi,
  getAntennasByCategory
} from '$lib/data/antennas';

// ============================================================================
// Hilfsfunktionen
// ============================================================================

function expectUniqueIds(ids: string[]) {
  expect(new Set(ids).size).toBe(ids.length);
}

/** Wellenlänge in Metern für eine Frequenz in Hertz. */
function wavelengthM(frequencyHz: number): number {
  return SPEED_OF_LIGHT / frequencyHz;
}

// ============================================================================
// radioServices.ts
// ============================================================================

describe('RADIO_SERVICES', () => {
  it('ist eine nicht leere Liste mit eindeutigen IDs', () => {
    expect(RADIO_SERVICES.length).toBeGreaterThan(0);
    expectUniqueIds(RADIO_SERVICES.map((s) => s.id));
  });

  it('hat für jeden Dienst Pflichtfelder und mindestens eine Zuweisung', () => {
    for (const service of RADIO_SERVICES) {
      expect(service.nameDE).toBeTruthy();
      expect(service.nameEN).toBeTruthy();
      expect(service.descriptionDE.length).toBeGreaterThan(20);
      expect(service.source).toBeTruthy();
      expect(service.examplesDE.length).toBeGreaterThan(0);
      expect(service.allocations.length).toBeGreaterThan(0);
    }
  });

  it('hat in jeder Zuweisung minHz < maxHz und positive Frequenzen', () => {
    for (const service of RADIO_SERVICES) {
      for (const a of service.allocations) {
        expect(a.minHz).toBeGreaterThan(0);
        expect(a.minHz).toBeLessThan(a.maxHz);
        expect(Number.isFinite(a.maxHz)).toBe(true);
        expect(a.label).toBeTruthy();
      }
    }
  });

  it('listet die Zuweisungen je Dienst aufsteigend nach Frequenz', () => {
    for (const service of RADIO_SERVICES) {
      for (let i = 0; i < service.allocations.length - 1; i++) {
        expect(service.allocations[i].minHz).toBeLessThanOrEqual(service.allocations[i + 1].minHz);
      }
    }
  });

  it('verwendet nur bekannte Gruppen', () => {
    for (const service of RADIO_SERVICES) {
      expect(RADIO_SERVICE_GROUP_LABELS[service.group]).toBeTruthy();
    }
  });

  it('ordnet 156,8 MHz (UKW-Kanal 16) dem Seefunkdienst zu', () => {
    const ids = getServicesForFrequency(156.8e6).map((s) => s.id);
    expect(ids).toContain('seefunkdienst');
  });

  it('ordnet 1575,42 MHz dem satellitengestützten Funknavigationsdienst zu', () => {
    const ids = getServicesForFrequency(1575.42e6).map((s) => s.id);
    expect(ids).toContain('funknavigation-satellit');
  });

  it('liefert für ungültige Frequenzen eine leere Liste', () => {
    expect(getServicesForFrequency(0)).toEqual([]);
    expect(getServicesForFrequency(-1)).toEqual([]);
    expect(getServicesForFrequency(NaN)).toEqual([]);
  });
});

// ============================================================================
// amateurBands.ts
// ============================================================================

describe('AMATEUR_BANDS', () => {
  it('ist nach Frequenz sortiert und hat eindeutige IDs', () => {
    expectUniqueIds(AMATEUR_BANDS.map((b) => b.id));
    for (let i = 0; i < AMATEUR_BANDS.length - 1; i++) {
      expect(AMATEUR_BANDS[i].minHz).toBeLessThan(AMATEUR_BANDS[i + 1].minHz);
    }
  });

  // AFuV Anlage 1 Buchstabe A, lfd. Nrn. 1 bis 44 (Nr. 45 „> 275 GHz“ ohne Status)
  it('bildet alle 27 Bänder von 135,7 kHz bis 250 GHz ab', () => {
    expect(AMATEUR_BANDS).toHaveLength(27);
    expect(AMATEUR_BANDS[0].minHz).toBe(135.7e3);
    expect(AMATEUR_BANDS[AMATEUR_BANDS.length - 1].maxHz).toBe(250e9);
  });

  it('lässt die Bänder einander nicht überlappen', () => {
    for (let i = 0; i < AMATEUR_BANDS.length - 1; i++) {
      expect(AMATEUR_BANDS[i].maxHz).toBeLessThan(AMATEUR_BANDS[i + 1].minHz);
    }
  });

  it('hat für jedes Band minHz < maxHz, positive Leistung und Quelle', () => {
    for (const band of AMATEUR_BANDS) {
      expect(band.minHz).toBeGreaterThan(0);
      expect(band.minHz).toBeLessThan(band.maxHz);
      expect(band.maxPowerClassAW).toBeGreaterThan(0);
      expect(band.licenseClasses.length).toBeGreaterThan(0);
      expect(band.source).toBeTruthy();
      expect(band.notesDE.length).toBeGreaterThan(20);
    }
  });

  it('hat je Band überschneidungsfreie Segmente innerhalb der Bandgrenzen', () => {
    for (const band of AMATEUR_BANDS) {
      let previousMax = band.minHz;
      for (const segment of band.segments) {
        expect(segment.minHz).toBeLessThan(segment.maxHz);
        expect(segment.minHz).toBeGreaterThanOrEqual(band.minHz);
        expect(segment.maxHz).toBeLessThanOrEqual(band.maxHz);
        expect(segment.minHz).toBeGreaterThanOrEqual(previousMax);
        previousMax = segment.maxHz;
      }
    }
  });

  // Referenzwerte: IARU R1 / AFuV Anlage 1
  it('bildet das 2-m-Band mit 144-146 MHz ab (Region 1)', () => {
    const band = AMATEUR_BANDS.find((b) => b.id === 'band-2m');
    expect(band).toBeDefined();
    expect(band!.minHz).toBe(144e6);
    expect(band!.maxHz).toBe(146e6);
  });

  it('bildet das 6-m-Band mit 50-52 MHz ab (Region 1, nicht 54 MHz)', () => {
    const band = AMATEUR_BANDS.find((b) => b.id === 'band-6m');
    expect(band!.minHz).toBe(50e6);
    expect(band!.maxHz).toBe(52e6);
  });

  it('enthält die WARC-Bänder 30 m, 17 m und 12 m', () => {
    const ids = AMATEUR_BANDS.map((b) => b.id);
    expect(ids).toContain('band-30m');
    expect(ids).toContain('band-17m');
    expect(ids).toContain('band-12m');
  });

  it('enthält die LF/MF-Bänder 2200 m (135,7-137,8 kHz) und 630 m (472-479 kHz)', () => {
    const b2200 = AMATEUR_BANDS.find((b) => b.id === 'band-2200m');
    expect(b2200!.minHz).toBe(135.7e3);
    expect(b2200!.maxHz).toBe(137.8e3);
    const b630 = AMATEUR_BANDS.find((b) => b.id === 'band-630m');
    expect(b630!.minHz).toBe(472e3);
    expect(b630!.maxHz).toBe(479e3);
  });

  // AFuV Anlage 1, lfd. Nr. 7: 9,14 W ERP (≙ 15 W EIRP), nur Klasse A
  it('begrenzt das 60-m-Band auf 5351,5-5366,5 kHz mit 9,14 W ERP', () => {
    const band = AMATEUR_BANDS.find((b) => b.id === 'band-60m');
    expect(band!.minHz).toBe(5351.5e3);
    expect(band!.maxHz).toBe(5366.5e3);
    expect(band!.maxPowerClassAW).toBe(POWER_60M_ERP_W);
    expect(band!.powerLimitType).toBe('erp');
    expect(band!.licenseClasses).toEqual(['A']);
  });

  it('begrenzt das 30-m-Band auf 150 W PEP (Sekundärstatus)', () => {
    const band = AMATEUR_BANDS.find((b) => b.id === 'band-30m');
    expect(band!.maxPowerClassAW).toBe(POWER_30M_W);
    expect(band!.status).toBe('sekundaer');
  });

  it('gibt der Klasse N nur 10 m, 2 m und 70 cm frei', () => {
    const ids = getBandsForLicenseClass('N').map((b) => b.id);
    expect(ids.sort()).toEqual(['band-10m', 'band-2m', 'band-70cm'].sort());
    expect(POWER_CLASS_N_EIRP_W).toBe(10);
  });

  // AFuV Anlage 1, lfd. Nrn. 14, 17 und 18
  it('gibt der Klasse N 10 W ERP auf 10 m und 6,1 W ERP auf 2 m und 70 cm', () => {
    const zehn = AMATEUR_BANDS.find((b) => b.id === 'band-10m')!;
    expect(zehn.powerLimits.N).toEqual({ watt: POWER_CLASS_N_ERP_10M_W, type: 'erp' });
    for (const id of ['band-2m', 'band-70cm']) {
      const band = AMATEUR_BANDS.find((b) => b.id === id)!;
      expect(band.powerLimits.N).toEqual({ watt: POWER_CLASS_N_ERP_VHF_W, type: 'erp' });
    }
  });

  // AFuV Anlage 1: Kurzwelle nur 160 m, 80 m, 15 m und 10 m
  it('gibt der Klasse E auf Kurzwelle nur 160 m, 80 m, 15 m und 10 m', () => {
    const kurzwelle = getBandsForLicenseClass('E').filter((b) => b.maxHz <= 30e6);
    expect(kurzwelle.map((b) => b.id).sort()).toEqual(
      ['band-10m', 'band-15m', 'band-160m', 'band-80m'].sort()
    );
    for (const band of kurzwelle) {
      expect(band.powerLimits.E).toEqual({ watt: POWER_CLASS_E_W, type: 'pep' });
    }
  });

  // AFuV Anlage 1, lfd. Nrn. 17 bis 21 bzw. 22 bis 34
  it('staffelt die Klasse E nach 75 W auf 2 m bis 23 cm und 5 W ab 13 cm', () => {
    for (const id of ['band-2m', 'band-70cm', 'band-23cm']) {
      expect(AMATEUR_BANDS.find((b) => b.id === id)!.powerLimits.E).toEqual({
        watt: POWER_CLASS_E_VHF_W,
        type: 'pep'
      });
    }
    const mikrowelle = [
      'band-13cm',
      'band-9cm',
      'band-6cm',
      'band-3cm',
      'band-1_2cm',
      'band-6mm',
      'band-4mm',
      'band-2_5mm',
      'band-2mm',
      'band-1_2mm'
    ];
    for (const id of mikrowelle) {
      const band = AMATEUR_BANDS.find((b) => b.id === id)!;
      expect(band.powerLimits.E).toEqual({ watt: POWER_CLASS_E_SHF_W, type: 'pep' });
      expect(band.maxPowerClassAW).toBe(POWER_MICROWAVE_CLASS_A_W);
    }
  });

  // AFuV Anlage 1, lfd. Nrn. 1 und 2: nur Klasse A, 1 W ERP
  it('gibt 2200 m und 630 m nur der Klasse A mit 1 W ERP', () => {
    for (const id of ['band-2200m', 'band-630m']) {
      const band = AMATEUR_BANDS.find((b) => b.id === id)!;
      expect(band.licenseClasses).toEqual(['A']);
      expect(band.powerLimits.A).toEqual({ watt: POWER_LF_MF_ERP_W, type: 'erp' });
    }
  });

  // AFuV Anlage 1, lfd. Nr. 24
  it('führt das 9-cm-Band mit 3400-3475 MHz und 75 W PEP', () => {
    const band = AMATEUR_BANDS.find((b) => b.id === 'band-9cm')!;
    expect(band.minHz).toBe(3400e6);
    expect(band.maxHz).toBe(3475e6);
    expect(band.maxPowerClassAW).toBe(POWER_MICROWAVE_CLASS_A_W);
  });

  // AFuV Anlage 1, lfd. Nrn. 35 bis 44
  it('führt die fünf Millimeterbänder oberhalb 24,25 GHz', () => {
    const namen = AMATEUR_BANDS.filter((b) => b.minHz > 24.25e9).map((b) => b.nameDE);
    expect(namen).toEqual(['6 mm', '4 mm', '2,5 mm', '2 mm', '1,2 mm']);
  });

  // AFuV Anlage 1, lfd. Nr. 35: 47–47,2 GHz, primär, 75 W PEP / 5 W PEP
  it('führt das 6-mm-Band mit 47-47,2 GHz als primär zugewiesen', () => {
    const band = AMATEUR_BANDS.find((b) => b.id === 'band-6mm')!;
    expect(band.minHz).toBe(47e9);
    expect(band.maxHz).toBe(47.2e9);
    expect(band.status).toBe('primaer');
    expect(band.licenseClasses).toEqual(['A', 'E']);
    expect(band.powerLimits.A).toEqual({ watt: POWER_MICROWAVE_CLASS_A_W, type: 'pep' });
    expect(band.powerLimits.E).toEqual({ watt: POWER_CLASS_E_SHF_W, type: 'pep' });
  });

  // AFuV Anlage 1, lfd. Nrn. 36 bis 39: 76–81 GHz durchgehend sekundär
  it('fasst 76-81 GHz zum sekundären 4-mm-Band zusammen', () => {
    const band = AMATEUR_BANDS.find((b) => b.id === 'band-4mm')!;
    expect(band.minHz).toBe(76e9);
    expect(band.maxHz).toBe(81e9);
    expect(band.status).toBe('sekundaer');
  });

  // AFuV Anlage 1, lfd. Nr. 40 bzw. Nrn. 41 und 42
  it('führt 122,25-123 GHz sekundär und 134-141 GHz gemischt', () => {
    const zweiKomma5 = AMATEUR_BANDS.find((b) => b.id === 'band-2_5mm')!;
    expect(zweiKomma5.minHz).toBe(122.25e9);
    expect(zweiKomma5.maxHz).toBe(123e9);
    expect(zweiKomma5.status).toBe('sekundaer');
    const zwei = AMATEUR_BANDS.find((b) => b.id === 'band-2mm')!;
    expect(zwei.minHz).toBe(134e9);
    expect(zwei.maxHz).toBe(141e9);
    expect(zwei.status).toBe('gemischt');
  });

  // AFuV Anlage 1, lfd. Nrn. 43 und 44: 241–248 GHz sekundär, 248–250 GHz primär
  it('führt das 1,2-mm-Band mit 241-250 GHz und einem Satellitensegment', () => {
    const band = AMATEUR_BANDS.find((b) => b.id === 'band-1_2mm')!;
    expect(band.minHz).toBe(241e9);
    expect(band.maxHz).toBe(250e9);
    expect(band.status).toBe('gemischt');
    expect(band.powerLimits.A).toEqual({ watt: POWER_MICROWAVE_CLASS_A_W, type: 'pep' });
    const satellit = band.segments.find((segment) => segment.mode === 'satellit')!;
    expect(satellit.minHz).toBe(248e9);
    expect(satellit.maxHz).toBe(250e9);
  });

  // AFuV Anlage 1, lfd. Nrn. 3 bis 5 bzw. 15 und 16
  it('modelliert die Teilbereiche von 160 m und 6 m', () => {
    const b160 = AMATEUR_BANDS.find((b) => b.id === 'band-160m')!;
    expect(b160.powerSubranges?.map((r) => [r.minHz, r.maxHz])).toEqual([
      [1850e3, 1890e3],
      [1890e3, 2000e3]
    ]);
    expect(b160.powerSubranges?.[1].limits.A?.watt).toBe(10);
    const b6 = AMATEUR_BANDS.find((b) => b.id === 'band-6m')!;
    expect(b6.powerSubranges?.[0]).toMatchObject({ minHz: 50.4e6, maxHz: 52e6 });
  });

  it('hält licenseClasses und powerLimits deckungsgleich', () => {
    for (const band of AMATEUR_BANDS) {
      expect(Object.keys(band.powerLimits).sort()).toEqual([...band.licenseClasses].sort());
      for (const limit of Object.values(band.powerLimits)) {
        expect(limit.watt).toBeGreaterThan(0);
        expect(['pep', 'erp', 'eirp']).toContain(limit.type);
      }
      expect(band.powerLimits.A).toEqual({
        watt: band.maxPowerClassAW,
        type: band.powerLimitType
      });
      expect(band.sourceRef).toBeTruthy();
    }
  });

  it('nutzt für die Klasse A die Regelleistung von 750 W PEP', () => {
    const band = AMATEUR_BANDS.find((b) => b.id === 'band-20m');
    expect(band!.maxPowerClassAW).toBe(POWER_CLASS_A_W);
    expect(POWER_CLASS_A_W).toBe(750);
  });

  it('findet Band und Segment für 145,500 MHz (FM-Simplex-Anruf)', () => {
    const band = getAmateurBandForFrequency(145.5e6);
    expect(band?.id).toBe('band-2m');
    const segment = getAmateurSegmentForFrequency(145.5e6);
    expect(segment?.mode).toBe('fm');
  });

  it('findet für 100 MHz kein Amateurband', () => {
    expect(getAmateurBandForFrequency(100e6)).toBeUndefined();
    expect(getAmateurBandForFrequency(0)).toBeUndefined();
  });
});

// ============================================================================
// mobileNetworks.ts
// ============================================================================

describe('MOBILE_GENERATIONS', () => {
  it('ist chronologisch sortiert und hat eindeutige IDs', () => {
    expectUniqueIds(MOBILE_GENERATIONS.map((g) => g.id));
    for (let i = 0; i < MOBILE_GENERATIONS.length - 1; i++) {
      expect(MOBILE_GENERATIONS[i].yearWorldwide).toBeLessThan(
        MOBILE_GENERATIONS[i + 1].yearWorldwide
      );
    }
  });

  it('hat plausible Datenraten, Bandbreiten und Latenzen', () => {
    for (const gen of MOBILE_GENERATIONS) {
      expect(gen.channelBandwidthsHz.length).toBeGreaterThan(0);
      for (const bw of gen.channelBandwidthsHz) expect(bw).toBeGreaterThan(0);
      // 1G kannte keine paketvermittelte Nutzdatenrate; deshalb >= 0
      expect(gen.typicalDownlinkBps).toBeGreaterThanOrEqual(0);
      expect(gen.peakDownlinkBps).toBeGreaterThan(gen.typicalDownlinkBps);
      expect(gen.latencyMs).toBeGreaterThan(0);
      expect(gen.yearGermany).toBeGreaterThanOrEqual(gen.yearWorldwide);
    }
  });

  it('bildet GSM mit 200-kHz-Kanalraster ab', () => {
    const gsm = MOBILE_GENERATIONS.find((g) => g.id === 'gen-2g');
    expect(gsm!.channelBandwidthsHz).toContain(200e3);
    expect(gsm!.yearGermany).toBe(1992);
  });
});

describe('MOBILE_BANDS', () => {
  it('hat eindeutige IDs und plausible Grenzen', () => {
    expectUniqueIds(MOBILE_BANDS.map((b) => b.id));
    for (const band of MOBILE_BANDS) {
      expect(band.downlinkMinHz).toBeGreaterThan(0);
      expect(band.downlinkMinHz).toBeLessThan(band.downlinkMaxHz);
      // Nur SDL-Bänder (Supplemental Downlink) haben keinen Uplink
      if (band.duplex === 'SDL') {
        expect(band.uplinkMinHz).toBe(0);
        expect(band.uplinkMaxHz).toBe(0);
      } else {
        expect(band.uplinkMinHz).toBeGreaterThan(0);
        expect(band.uplinkMinHz).toBeLessThan(band.uplinkMaxHz);
      }
      expect(band.technologiesDE.length).toBeGreaterThan(0);
    }
  });

  it('bildet bei TDD-Bändern Uplink und Downlink identisch ab', () => {
    for (const band of MOBILE_BANDS.filter((b) => b.duplex === 'TDD')) {
      expect(band.uplinkMinHz).toBe(band.downlinkMinHz);
      expect(band.uplinkMaxHz).toBe(band.downlinkMaxHz);
    }
  });

  // Referenzwert: 3GPP TS 38.101-1
  it('bildet n78 mit 3300-3800 MHz ab', () => {
    const n78 = MOBILE_BANDS.find((b) => b.id === 'band-n78');
    expect(n78!.downlinkMinHz).toBe(3300e6);
    expect(n78!.downlinkMaxHz).toBe(3800e6);
    expect(n78!.duplex).toBe('TDD');
  });

  // Referenzwert: 3GPP TS 36.101 Tab. 5.5-1
  it('bildet Band 28 mit UL 703-748 MHz und DL 758-803 MHz ab', () => {
    const b28 = MOBILE_BANDS.find((b) => b.id === 'band-n28');
    expect(b28!.uplinkMinHz).toBe(703e6);
    expect(b28!.uplinkMaxHz).toBe(748e6);
    expect(b28!.downlinkMinHz).toBe(758e6);
    expect(b28!.downlinkMaxHz).toBe(803e6);
  });

  // Referenzwert: 3GPP TS 36.101 — bei Band 20 liegt der Downlink unter dem Uplink
  it('bildet Band 20 mit DL 791-821 MHz und UL 832-862 MHz ab', () => {
    const b20 = MOBILE_BANDS.find((b) => b.id === 'band-n20');
    expect(b20!.downlinkMinHz).toBe(791e6);
    expect(b20!.downlinkMaxHz).toBe(821e6);
    expect(b20!.uplinkMinHz).toBe(832e6);
    expect(b20!.uplinkMaxHz).toBe(862e6);
    expect(b20!.downlinkMinHz).toBeLessThan(b20!.uplinkMinHz);
  });

  it('erkennt 3600 MHz als n78 in beiden Richtungen', () => {
    const hits = getMobileBandsForFrequency(3600e6);
    const n78 = hits.find((h) => h.band.id === 'band-n78');
    expect(n78?.direction).toBe('beide');
  });

  it('erkennt 800 MHz Downlink von Band 20', () => {
    const hits = getMobileBandsForFrequency(800e6);
    const b20 = hits.find((h) => h.band.id === 'band-n20');
    expect(b20?.direction).toBe('downlink');
  });

  it('liefert für ungültige Frequenzen eine leere Liste', () => {
    expect(getMobileBandsForFrequency(0)).toEqual([]);
    expect(getMobileBandsForFrequency(NaN)).toEqual([]);
  });
});

// ============================================================================
// broadcast.ts
// ============================================================================

describe('BROADCAST_RANGES', () => {
  it('hat eindeutige IDs und minHz < maxHz', () => {
    expectUniqueIds(BROADCAST_RANGES.map((r) => r.id));
    for (const r of BROADCAST_RANGES) {
      expect(r.minHz).toBeGreaterThan(0);
      expect(r.minHz).toBeLessThan(r.maxHz);
      expect(r.rasterHz).toBeGreaterThanOrEqual(0);
    }
  });

  // Referenzwert: GE75, ITU-Region 1
  it('bildet die Mittelwelle mit 526,5-1606,5 kHz und 9-kHz-Raster ab', () => {
    const mw = BROADCAST_RANGES.find((r) => r.id === 'mw');
    expect(mw!.minHz).toBe(526.5e3);
    expect(mw!.maxHz).toBe(1606.5e3);
    expect(mw!.rasterHz).toBe(AM_CHANNEL_SPACING_R1_HZ);
    expect(AM_CHANNEL_SPACING_R1_HZ).toBe(9e3);
  });

  it('bildet UKW mit 87,5-108 MHz ab', () => {
    const fm = BROADCAST_RANGES.find((r) => r.id === 'fm');
    expect(fm!.minHz).toBe(87.5e6);
    expect(fm!.maxHz).toBe(108e6);
  });
});

describe('SHORTWAVE_BANDS', () => {
  it('ist aufsteigend sortiert und überschneidungsfrei', () => {
    for (let i = 0; i < SHORTWAVE_BANDS.length - 1; i++) {
      expect(SHORTWAVE_BANDS[i].minHz).toBeLessThan(SHORTWAVE_BANDS[i].maxHz);
      expect(SHORTWAVE_BANDS[i].maxHz).toBeLessThanOrEqual(SHORTWAVE_BANDS[i + 1].minHz);
    }
  });

  // Referenzwert: ITU RR Art. 5 — das 11-m-Band beginnt bei 25 670 kHz
  it('bildet das 11-m-Band mit 25 670-26 100 kHz ab', () => {
    const b11 = SHORTWAVE_BANDS.find((b) => b.nameDE === '11 m');
    expect(b11!.minHz).toBe(25670e3);
    expect(b11!.maxHz).toBe(26100e3);
  });

  // Referenzwert: ITU RR Art. 5 — 4995-5005 kHz ist Normalfrequenzbereich
  it('lässt zwischen den beiden 60-m-Teilbändern den Normalfrequenzbereich frei', () => {
    const unten = SHORTWAVE_BANDS.find((b) => b.nameDE.startsWith('60 m (unterer'));
    const oben = SHORTWAVE_BANDS.find((b) => b.nameDE.startsWith('60 m (oberer'));
    expect(unten!.maxHz).toBe(4995e3);
    expect(oben!.minHz).toBe(5005e3);
  });

  it('markiert die Tropenbänder gesondert', () => {
    const tropical = SHORTWAVE_BANDS.filter((b) => b.tropical);
    expect(tropical.length).toBeGreaterThanOrEqual(4);
    for (const b of tropical) expect(b.maxHz).toBeLessThanOrEqual(5060e3);
  });
});

describe('DAB_BLOCKS', () => {
  it('hat eindeutige Blockbezeichnungen und ist aufsteigend sortiert', () => {
    expectUniqueIds(DAB_BLOCKS.map((b) => b.block));
    for (let i = 0; i < DAB_BLOCKS.length - 1; i++) {
      expect(DAB_BLOCKS[i].centerHz).toBeLessThan(DAB_BLOCKS[i + 1].centerHz);
    }
  });

  it('hält die in Deutschland genutzten Blöcke im VHF-Band III (174-230 MHz)', () => {
    const half = DAB_BLOCK_BANDWIDTH_HZ / 2;
    for (const block of DAB_BLOCKS_DE) {
      expect(block.centerHz - half).toBeGreaterThanOrEqual(DAB_BAND_III_MIN_HZ);
      expect(block.centerHz + half).toBeLessThanOrEqual(DAB_BAND_III_MAX_HZ);
    }
    expect(DAB_BAND_III_MAX_HZ).toBe(230e6);
    expect(DAB_BLOCKS_DE).toHaveLength(32);
    expect(DAB_BLOCKS_DE[0].block).toBe('5A');
    expect(DAB_BLOCKS_DE[DAB_BLOCKS_DE.length - 1].block).toBe('12D');
  });

  // Referenzwerte: ETSI-Kanaltabelle Band III / EBU-Factsheet „Use of Band III“
  it('führt die Blöcke 13A bis 13F im Kanal 13 (230-240 MHz) als national ungenutzt', () => {
    const erwartet: Array<[string, number]> = [
      ['13A', 230_784_000],
      ['13B', 232_496_000],
      ['13C', 234_208_000],
      ['13D', 235_776_000],
      ['13E', 237_488_000],
      ['13F', 239_200_000]
    ];
    const half = DAB_BLOCK_BANDWIDTH_HZ / 2;
    for (const [name, centerHz] of erwartet) {
      const block = DAB_BLOCKS.find((b) => b.block === name);
      expect(block, `Block ${name} fehlt`).toBeDefined();
      expect(block!.centerHz).toBe(centerHz);
      expect(block!.usedInGermany).toBe(false);
      expect(block!.noteDE).toBeTruthy();
      expect(block!.centerHz - half).toBeGreaterThanOrEqual(DAB_BAND_III_MAX_HZ);
      expect(block!.centerHz + half).toBeLessThanOrEqual(DAB_CHANNEL_13_MAX_HZ);
    }
    expect(DAB_CHANNEL_13_MAX_HZ).toBe(240e6);
  });

  // Von CENELEC in die Schutzabstände gelegte Zwischenblöcke
  it('führt die Zwischenblöcke 10N, 11N und 12N als national ungenutzt', () => {
    const erwartet: Array<[string, number]> = [
      ['10N', 210_096_000],
      ['11N', 217_088_000],
      ['12N', 224_096_000]
    ];
    for (const [name, centerHz] of erwartet) {
      const block = DAB_BLOCKS.find((b) => b.block === name);
      expect(block, `Block ${name} fehlt`).toBeDefined();
      expect(block!.centerHz).toBe(centerHz);
      expect(block!.usedInGermany).toBe(false);
    }
  });

  it('umfasst 41 Blöcke, davon 32 in Deutschland genutzt', () => {
    expect(DAB_BLOCKS).toHaveLength(41);
    expect(DAB_BLOCKS.filter((b) => !b.usedInGermany)).toHaveLength(9);
  });

  // Referenzwert: T-DAB-Raster Region 1 (GE06)
  it('legt Block 5C auf 178,352 MHz', () => {
    const block5c = DAB_BLOCKS.find((b) => b.block === '5C');
    expect(block5c!.centerHz).toBe(178_352_000);
  });

  it('legt Block 11C auf 220,352 MHz (Bundesmux 1)', () => {
    expect(DAB_BLOCKS.find((b) => b.block === '11C')!.centerHz).toBe(220_352_000);
  });

  it('berechnet die Blockgrenzen aus Mitte und 1,536 MHz Bandbreite', () => {
    expect(DAB_BLOCK_BANDWIDTH_HZ).toBe(1.536e6);
    const range = getDabBlockRange('5C');
    expect(range).toEqual({ minHz: 178_352_000 - 768_000, maxHz: 178_352_000 + 768_000 });
    expect(getDabBlockRange('99Z')).toBeUndefined();
  });
});

describe('DVBT2_CHANNELS', () => {
  it('folgt dem europäischen 8-MHz-Raster (Mitte = 306 MHz + 8 MHz · N)', () => {
    expect(DVBT2_CHANNEL_BANDWIDTH_HZ).toBe(8e6);
    for (const ch of DVBT2_CHANNELS) {
      expect(ch.centerHz).toBe(DVBT2_CHANNEL_OFFSET_HZ + DVBT2_CHANNEL_BANDWIDTH_HZ * ch.channel);
    }
  });

  // Referenzwert: Kanal 21 = 474 MHz
  it('legt Kanal 21 auf 474 MHz', () => {
    expect(DVBT2_CHANNELS.find((c) => c.channel === 21)!.centerHz).toBe(474e6);
  });

  it('umfasst die Kanäle 21 bis 48 innerhalb 470-694 MHz', () => {
    expect(DVBT2_CHANNELS[0].channel).toBe(21);
    expect(DVBT2_CHANNELS[DVBT2_CHANNELS.length - 1].channel).toBe(48);
    const half = DVBT2_CHANNEL_BANDWIDTH_HZ / 2;
    for (const ch of DVBT2_CHANNELS) {
      expect(ch.centerHz - half).toBeGreaterThanOrEqual(DVBT2_BAND_MIN_HZ);
      expect(ch.centerHz + half).toBeLessThanOrEqual(DVBT2_BAND_MAX_HZ);
    }
    expect(DVBT2_BAND_MAX_HZ).toBe(694e6);
  });

  it('berechnet die Kanalgrenzen', () => {
    expect(getDvbT2ChannelRange(21)).toEqual({ minHz: 470e6, maxHz: 478e6 });
    expect(getDvbT2ChannelRange(20)).toBeUndefined();
  });
});

describe('SATELLITE_TV_BANDS', () => {
  it('hat eindeutige IDs und minHz < maxHz', () => {
    expectUniqueIds(SATELLITE_TV_BANDS.map((b) => b.id));
    for (const b of SATELLITE_TV_BANDS) {
      expect(b.minHz).toBeGreaterThan(0);
      expect(b.minHz).toBeLessThan(b.maxHz);
    }
  });
});

// ============================================================================
// emergencyFrequencies.ts
// ============================================================================

describe('EMERGENCY_FREQUENCIES', () => {
  it('hat eindeutige IDs und positive Frequenzen', () => {
    expectUniqueIds(EMERGENCY_FREQUENCIES.map((f) => f.id));
    for (const f of EMERGENCY_FREQUENCIES) {
      expect(f.frequencyHz).toBeGreaterThan(0);
      if (f.frequencyMaxHz !== undefined) {
        expect(f.frequencyMaxHz).toBeGreaterThan(f.frequencyHz);
      }
      expect(f.descriptionDE.length).toBeGreaterThan(20);
      expect(f.source).toBeTruthy();
    }
  });

  it('führt Einträge mit mehreren Kanälen als Kanalliste innerhalb der Hüllkurve', () => {
    for (const f of EMERGENCY_FREQUENCIES) {
      if (!f.channelsHz) continue;
      expect(f.channelsHz.length).toBeGreaterThan(1);
      expect(f.channelsHz[0]).toBe(f.frequencyHz);
      expect(f.channelsHz[f.channelsHz.length - 1]).toBe(f.frequencyMaxHz);
      for (let i = 0; i < f.channelsHz.length - 1; i++) {
        expect(f.channelsHz[i]).toBeLessThan(f.channelsHz[i + 1]);
      }
    }
  });

  // Referenzwert: ITU RR Anhang 18
  it('führt UKW-Kanal 16 mit 156,800 MHz', () => {
    const ch16 = EMERGENCY_FREQUENCIES.find((f) => f.id === 'vhf-ch16');
    expect(ch16!.frequencyHz).toBe(156.8e6);
    expect(ch16!.purpose).toBe('notruf');
  });

  it('führt UKW-Kanal 70 (DSC) mit 156,525 MHz', () => {
    expect(EMERGENCY_FREQUENCIES.find((f) => f.id === 'vhf-ch70')!.frequencyHz).toBe(156.525e6);
  });

  // Referenzwert: ICAO Annex 10 — 243 MHz ist exakt das Doppelte von 121,5 MHz
  it('führt 121,5 MHz und 243 MHz als getrennte Einträge', () => {
    const a = EMERGENCY_FREQUENCIES.find((f) => f.id === 'air-121_5')!;
    const b = EMERGENCY_FREQUENCIES.find((f) => f.id === 'air-243')!;
    expect(a.frequencyHz).toBe(121.5e6);
    expect(b.frequencyHz).toBe(243e6);
    expect(b.frequencyHz).toBe(2 * a.frequencyHz);
  });

  // Referenzwert: COSPAS-SARSAT C/S T.001
  it('führt die Notfunkbaken mit 406,0-406,1 MHz', () => {
    const sarsat = EMERGENCY_FREQUENCIES.find((f) => f.id === 'sarsat-406')!;
    expect(sarsat.frequencyHz).toBe(406e6);
    expect(sarsat.frequencyMaxHz).toBe(406.1e6);
    // Der Bereich ist nur 100 kHz breit, nicht 284 MHz wie im alten ELT-Eintrag
    expect(sarsat.frequencyMaxHz! - sarsat.frequencyHz).toBe(100e3);
  });

  it('führt die sechs Freenet-Kanäle einzeln auf', () => {
    const freenet = EMERGENCY_FREQUENCIES.find((f) => f.id === 'freenet')!;
    expect(freenet.channelsHz).toHaveLength(6);
    expect(freenet.channelsHz).toContain(149.05e6);
    // Die Lücke zwischen 149,0500 und 149,0875 MHz gehört nicht zu Freenet
    expect(freenet.channelsHz).not.toContain(149.0625e6);
  });

  it('filtert nach Fachbereich', () => {
    const see = getEmergencyFrequenciesByDomain('see');
    expect(see.length).toBeGreaterThan(5);
    for (const f of see) expect(f.domain).toBe('see');
  });

  it('findet Kanal 16 bei 156,801 MHz mit 5 kHz Toleranz', () => {
    const hits = findEmergencyFrequenciesNear(156.801e6, 5e3).map((f) => f.id);
    expect(hits).toContain('vhf-ch16');
  });

  it('trifft bei Kanallisten nur nahe eines Kanals, nicht dazwischen', () => {
    // 10 MHz liegt zwischen den HF-DSC-Kanälen 8414,5 und 12577 kHz
    const between = findEmergencyFrequenciesNear(10e6, 1e3).map((f) => f.id);
    expect(between).not.toContain('hf-dsc-set');
    const onChannel = findEmergencyFrequenciesNear(8414.5e3, 1e3).map((f) => f.id);
    expect(onChannel).toContain('hf-dsc-set');
  });

  it('liefert für ungültige Frequenzen eine leere Liste', () => {
    expect(findEmergencyFrequenciesNear(0, 1e3)).toEqual([]);
    expect(findEmergencyFrequenciesNear(NaN, 1e3)).toEqual([]);
  });
});

// ============================================================================
// modulation.ts
// ============================================================================

describe('carsonBandwidthHz', () => {
  // Referenzwert: UKW-Rundfunk mit 75 kHz Hub und 15 kHz NF -> 180 kHz
  it('liefert 180 kHz für den UKW-Rundfunk (75 kHz Hub, 15 kHz NF)', () => {
    expect(carsonBandwidthHz(FM_MAX_DEVIATION_HZ, FM_MAX_AUDIO_HZ)).toBe(180e3);
  });

  it('liefert 11 kHz für Schmalband-FM (2,5 kHz Hub, 3 kHz NF)', () => {
    expect(carsonBandwidthHz(2.5e3, 3e3)).toBe(11e3);
  });

  it('liefert 0 für negative Eingaben', () => {
    expect(carsonBandwidthHz(-1, 1e3)).toBe(0);
    expect(carsonBandwidthHz(1e3, -1)).toBe(0);
  });
});

describe('fmModulationIndex', () => {
  it('liefert beta = 5 für den UKW-Rundfunk', () => {
    expect(fmModulationIndex(FM_MAX_DEVIATION_HZ, FM_MAX_AUDIO_HZ)).toBe(5);
  });

  it('liefert 0 bei Modulationsfrequenz 0', () => {
    expect(fmModulationIndex(75e3, 0)).toBe(0);
  });
});

describe('bitsPerSymbol', () => {
  it('liefert log2(M) für gängige Stufenzahlen', () => {
    expect(bitsPerSymbol(2)).toBe(1);
    expect(bitsPerSymbol(4)).toBe(2);
    expect(bitsPerSymbol(16)).toBe(4);
    expect(bitsPerSymbol(64)).toBe(6);
    expect(bitsPerSymbol(256)).toBe(8);
  });

  it('liefert 0 für ungültige Stufenzahlen', () => {
    expect(bitsPerSymbol(1)).toBe(0);
    expect(bitsPerSymbol(0)).toBe(0);
  });
});

describe('spreadingGainDb', () => {
  // Referenzwert: GPS C/A, 1,023 Mchip/s bei 50 Bit/s -> ca. 43 dB
  it('liefert rund 43 dB für GPS C/A', () => {
    expect(spreadingGainDb(1.023e6, 50)).toBeCloseTo(43.1, 1);
  });

  it('liefert 0 bei ungültigen Raten', () => {
    expect(spreadingGainDb(0, 50)).toBe(0);
    expect(spreadingGainDb(1e6, 0)).toBe(0);
  });
});

describe('MODULATIONS', () => {
  it('hat eindeutige IDs und Pflichtfelder', () => {
    expectUniqueIds(MODULATIONS.map((m) => m.id));
    for (const m of MODULATIONS) {
      expect(m.abbr).toBeTruthy();
      expect(m.nameDE).toBeTruthy();
      expect(m.typicalBandwidthHz).toBeGreaterThan(0);
      expect(m.applicationsDE.length).toBeGreaterThan(0);
      expect(m.source).toBeTruthy();
      expect(m.descriptionDE.length).toBeGreaterThan(40);
    }
  });

  it('setzt bei analogen Verfahren Bit/Symbol und spektrale Effizienz auf 0', () => {
    for (const m of getModulationsByClass('analog')) {
      expect(m.bitsPerSymbol).toBe(0);
      expect(m.spectralEfficiencyBpsPerHz).toBe(0);
    }
  });

  it('hält bei M-QAM die Beziehung Bit/Symbol = log2(M) ein', () => {
    const cases: Array<[string, number]> = [
      ['qam16', 16],
      ['qam64', 64],
      ['qam256', 256],
      ['qpsk', 4],
      ['bpsk', 2]
    ];
    for (const [id, states] of cases) {
      const m = MODULATIONS.find((x) => x.id === id)!;
      expect(m.bitsPerSymbol).toBe(bitsPerSymbol(states));
    }
  });

  it('gibt für FM die belegte Bandbreite nach Carson an', () => {
    const fm = MODULATIONS.find((m) => m.id === 'fm')!;
    expect(fm.typicalBandwidthHz).toBe(carsonBandwidthHz(FM_MAX_DEVIATION_HZ, FM_MAX_AUDIO_HZ));
  });
});

// ============================================================================
// antennas.ts
// ============================================================================

describe('Antennen-Formeln', () => {
  // Referenzwert: D = 1 m bei 10 GHz, eta = 0,55 -> ca. 37,8 dBi
  it('liefert rund 37,8 dBi für einen 1-m-Spiegel bei 10 GHz', () => {
    const gain = parabolicGainDbi(1, wavelengthM(10e9), PARABOLIC_EFFICIENCY_TYPICAL);
    expect(gain).toBeCloseTo(37.8, 1);
  });

  it('gewinnt 6 dB bei Verdopplung des Spiegeldurchmessers', () => {
    const lambda = wavelengthM(10e9);
    const g1 = parabolicGainDbi(1, lambda);
    const g2 = parabolicGainDbi(2, lambda);
    expect(g2 - g1).toBeCloseTo(6.02, 2);
  });

  it('gewinnt 6 dB bei Verdopplung der Frequenz', () => {
    const g10 = parabolicGainDbi(1, wavelengthM(10e9));
    const g20 = parabolicGainDbi(1, wavelengthM(20e9));
    expect(g20 - g10).toBeCloseTo(6.02, 2);
  });

  it('liefert 0 bzw. -Infinity für ungültige Eingaben', () => {
    expect(parabolicGainLinear(0, 0.03)).toBe(0);
    expect(parabolicGainLinear(1, 0)).toBe(0);
    expect(parabolicGainDbi(0, 0.03)).toBe(-Infinity);
  });

  it('berechnet den Halbwertsöffnungswinkel nach 70 Grad · lambda / D', () => {
    // 1-m-Spiegel bei 10 GHz: 70 · 0,03 m / 1 m = ca. 2,1 Grad
    expect(parabolicBeamwidthDeg(1, wavelengthM(10e9))).toBeCloseTo(2.1, 1);
    expect(parabolicBeamwidthDeg(0, 0.03)).toBe(0);
  });

  it('addiert 10·log10(N) beim Gruppengewinn', () => {
    expect(arrayGainDbi(5, 64)).toBeCloseTo(5 + 18.06, 2);
    expect(arrayGainDbi(5, 1)).toBe(5);
    expect(arrayGainDbi(5, 0)).toBe(5);
  });

  it('rechnet dBd korrekt in dBi um', () => {
    expect(dbdToDbi(0)).toBe(GAIN_DIPOLE_DBI);
    expect(dbdToDbi(10)).toBeCloseTo(12.15, 10);
    expect(GAIN_DIPOLE_DBI).toBe(2.15);
  });
});

describe('ANTENNA_TYPES', () => {
  it('hat eindeutige IDs und plausible Werte', () => {
    expectUniqueIds(ANTENNA_TYPES.map((a) => a.id));
    for (const a of ANTENNA_TYPES) {
      expect(a.nameDE).toBeTruthy();
      expect(a.gainMinDbi).toBeLessThanOrEqual(a.gainMaxDbi);
      expect(a.beamwidthDeg).toBeGreaterThan(0);
      expect(a.beamwidthDeg).toBeLessThanOrEqual(360);
      expect(a.impedanceOhm).toBeGreaterThanOrEqual(0);
      expect(a.relativeBandwidthPercent).toBeGreaterThanOrEqual(0);
      expect(a.applicationsDE.length).toBeGreaterThan(0);
      expect(a.source).toBeTruthy();
    }
  });

  it('führt den isotropen Strahler mit 0 dBi als Referenz', () => {
    const iso = ANTENNA_TYPES.find((a) => a.id === 'isotrop')!;
    expect(iso.gainMinDbi).toBe(0);
    expect(iso.gainMaxDbi).toBe(0);
    expect(iso.category).toBe('referenz');
  });

  it('führt den Halbwellendipol mit 2,15 dBi und 73,1 Ohm', () => {
    const dipol = ANTENNA_TYPES.find((a) => a.id === 'dipol')!;
    expect(dipol.gainMinDbi).toBe(GAIN_DIPOLE_DBI);
    expect(dipol.impedanceOhm).toBe(DIPOLE_IMPEDANCE_OHM);
    expect(DIPOLE_IMPEDANCE_OHM).toBeCloseTo(73.1, 1);
  });

  it('filtert nach Bauform', () => {
    const flaechen = getAntennasByCategory('flaechen');
    expect(flaechen.length).toBeGreaterThan(0);
    for (const a of flaechen) expect(a.category).toBe('flaechen');
  });
});
