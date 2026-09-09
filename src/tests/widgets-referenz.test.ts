/**
 * Referenzwerte der Diagramm- und Widget-Modelle (Validierung 2026-09).
 *
 * Jeder Block rechnet zwei bis drei Stützpunkte nach, die sich aus den
 * genannten Quellen von Hand prüfen lassen (Skolnik, ITU-R P.525/526/530/676,
 * ICAO Annex 10 Vol. IV, Balanis, Pozar, Meinke/Gundlach). Die Zahlen hier
 * sind bewusst als Literale eingetragen, nicht aus den Utilities abgeleitet —
 * sonst prüfte der Test nur, dass eine Funktion sich selbst gleicht.
 */
import { describe, expect, it } from 'vitest';
import { computeDoppler } from '$lib/components/widgets/DopplerModel';
import { computeFmcw, rangeFromBeatFrequency } from '$lib/components/widgets/FmcwModel';
import { computeBlindSpeeds, computeStagger } from '$lib/components/widgets/BlindSpeedModel';
import {
  computeSsrTiming,
  interrogationPulses,
  replyPulses,
  squawkPulseStates,
  MODE_S_P6_OFFSET_US,
  P1_P2_SPACING_US
} from '$lib/components/widgets/SsrModel';
import { computeFresnelScene } from '$lib/components/widgets/FresnelModel';
import {
  calculateFresnelParameter,
  calculateKnifeEdgeLossFromNu,
  evaluateFresnelClearance
} from '$lib/utils/fresnelMath';
import { fieldSamples, frontVector } from '$lib/components/widgets/EmWaveModel';
import { computeFieldStrength, fieldStrengthDbuvPerM } from '$lib/utils/fieldStrength';
import {
  generateWindowCurve,
  findNearestPoint
} from '$lib/components/widgets/AttenuationWindowsModel';
import { calculateAtmosphericAttenuation } from '$lib/utils/atmosphericAttenuation';
import {
  computePropagationScene,
  estimateGroundWaveRangeKm
} from '$lib/components/widgets/PropagationModel';
import {
  calculateRadioHorizon,
  calculateSkipDistanceForFrequency,
  estimateMUF
} from '$lib/data/propagation';
import { chainTotalDbm } from '$lib/utils/decibel';
import { DEFAULT_CHAIN } from '$lib/components/widgets/DecibelModel';
import { relativeRadarRange } from '$lib/components/widgets/RcsComparisonModel';
import {
  carsonBandwidthHz,
  constellationPoints,
  fmModulationIndex,
  noiseSigmaFromSnrDb,
  occupiedBandwidthHz,
  spectrumLines,
  type ConstellationScheme
} from '$lib/utils/modulationMath';
import {
  halfPowerBeamwidthDeg,
  parabolicBeamwidthDeg,
  parabolicGainDbi,
  reflectionFromVswr,
  returnLossDb,
  mismatchLossDb,
  samplePattern,
  wavelengthM
} from '$lib/utils/antennaMath';
import {
  calculateFSPL,
  calculateShannonCapacity,
  calculateSkinDepth
} from '$lib/utils/calculations';
import { GEOSTATIONARY_ALTITUDE_M, orbitalPeriod, SIDEREAL_DAY_S } from '$lib/utils/orbitMath';
import { criticalFrequency, maximumUsableFrequency } from '$lib/components/charts/ionosphericData';

const C = 299_792_458;

describe('Doppler-Widget (Skolnik §3.1: f_d = 2·v·f/c)', () => {
  it('X-Band 10 GHz, 30 m/s → +2001 Hz; Entfernen → negativ', () => {
    expect(computeDoppler(30, 10e9, C).dopplerHz).toBeCloseTo(2001.4, 0);
    expect(computeDoppler(-30, 10e9, C).dopplerHz).toBeCloseTo(-2001.4, 0);
    expect(computeDoppler(-30, 10e9, C).direction).toBe('entfernt');
  });

  it('Verkehrsradar 24,125 GHz, 50 km/h → 2235 Hz', () => {
    expect(computeDoppler(50 / 3.6, 24.125e9, C).dopplerHz).toBeCloseTo(2235.3, 0);
  });
});

describe('FMCW-Widget (Skolnik §3.3)', () => {
  it('B = 1 GHz, T = 50 µs, R = 100 m → f_b = 13,34 MHz, ΔR = 15 cm', () => {
    const r = computeFmcw(100, 1e9, 50e-6, C);
    expect(r.beatHz / 1e6).toBeCloseTo(13.34, 1);
    expect(r.rangeResolutionM).toBeCloseTo(0.1499, 3);
    expect(r.delayS * 1e9).toBeCloseTo(667.1, 0);
    expect(rangeFromBeatFrequency(r.beatHz, 1e9, 50e-6, C)).toBeCloseTo(100, 6);
  });

  it('4 GHz Bandbreite → 3,75 cm Auflösung, unabhängig von T und R', () => {
    expect(computeFmcw(5, 4e9, 10e-6, C).rangeResolutionM * 100).toBeCloseTo(3.75, 1);
    expect(computeFmcw(300, 4e9, 200e-6, C).rangeResolutionM * 100).toBeCloseTo(3.75, 1);
  });
});

describe('Blindgeschwindigkeits-Widget (Skolnik §3.2)', () => {
  it('3 GHz, PRF 1 kHz → v_b = 50 m/s, ±v_u = 25 m/s, R_u = 150 km', () => {
    const r = computeBlindSpeeds(1000, 3e9, 4, C);
    expect(r.firstBlindSpeedMs).toBeCloseTo(49.97, 1);
    expect(r.unambiguousVelocityMs).toBeCloseTo(24.98, 1);
    expect(r.unambiguousRangeM / 1000).toBeCloseTo(149.9, 0);
    expect(r.blindSpeedsMs[3]).toBeCloseTo(4 * 49.97, 1);
  });

  it('Staffelung 1000/1200 Hz (5:6) → erste gemeinsame Lücke bei 6·v_b', () => {
    const s = computeStagger(1000, 1200, 3e9, C);
    expect(s.gainFactor).toBeCloseTo(6, 6);
    expect(s.commonBlindSpeedMs).toBeCloseTo(299.8, 0);
  });
});

describe('Sekundärradar-Widget (ICAO Annex 10 Vol. IV, Kap. 3.1)', () => {
  it('100 km → 667,1 µs Laufzeit + 3 µs Transponder = 670,1 µs', () => {
    const t = computeSsrTiming(100_000, 'a', C);
    expect(t.roundTripUs).toBeCloseTo(667.1, 1);
    expect(t.totalUs).toBeCloseTo(670.1, 1);
  });

  it('Modus A/C: P3 bei 8 bzw. 21 µs; Modus S: P6 beginnt 4,75 µs nach P1', () => {
    expect(interrogationPulses('a').find((p) => p.id === 'p3')?.startUs).toBe(8);
    expect(interrogationPulses('c').find((p) => p.id === 'p3')?.startUs).toBe(21);
    expect(interrogationPulses('s').find((p) => p.id === 'p6')?.startUs).toBe(
      P1_P2_SPACING_US + MODE_S_P6_OFFSET_US
    );
    expect(P1_P2_SPACING_US + MODE_S_P6_OFFSET_US).toBeCloseTo(4.75, 6);
  });

  it('Antwortrahmen: F2 bei 20,3 µs, Raster 1,45 µs, Reihenfolge C1 A1 C2 A2 C4 A4 X B1 D1 B2 D2 B4 D4', () => {
    const pulses = replyPulses('7500');
    expect(pulses.find((p) => p.id === 'f2')?.startUs).toBeCloseTo(20.3, 6);
    expect(pulses.find((p) => p.id === 'c1')?.startUs).toBeCloseTo(1.45, 6);
    expect(pulses.find((p) => p.id === 'd4')?.startUs).toBeCloseTo(13 * 1.45, 6);
    const active = pulses.filter((p) => p.kind === 'data' && p.active).map((p) => p.label);
    // 7500: A = 7 (A1 A2 A4), B = 5 (B1 B4), C = D = 0
    expect(active).toEqual(['A1', 'A2', 'A4', 'B1', 'B4']);
    expect(squawkPulseStates('1200')).toMatchObject({ A1: true, B2: true, A2: false, C1: false });
  });
});

describe('Fresnel-Widget (ITU-R P.526 §4.1, P.530)', () => {
  it('10 km, 5,8 GHz → r₁ in der Mitte 11,37 m; 60-%-Regel bei 10 m Hindernis frei', () => {
    const scene = computeFresnelScene(10_000, 5.8e9, 0.5, 10, 20, C);
    expect(scene.midRadiusM).toBeCloseTo(11.37, 1);
    expect(scene.clearance.clearanceFraction).toBeCloseTo(0.88, 2);
    expect(scene.clearance.status).toBe('frei');
    expect(scene.clearance.lossDb).toBe(0);
  });

  it('Knife-Edge: ν = 0 → 6,0 dB, ν = 1 → 13,9 dB, ν = −0,78 → 0 dB (P.526 Gl. 31)', () => {
    expect(calculateKnifeEdgeLossFromNu(0)).toBeCloseTo(6.03, 1);
    expect(calculateKnifeEdgeLossFromNu(1)).toBeCloseTo(13.93, 1);
    expect(calculateKnifeEdgeLossFromNu(-0.78)).toBe(0);
    expect(calculateKnifeEdgeLossFromNu(-1)).toBe(0);
  });

  it('Kante auf der Sichtlinie: ν = 0, Status blockiert erst unterhalb, Verlust ≈ 6 dB', () => {
    const lambda = C / 5.8e9;
    expect(calculateFresnelParameter(0, lambda, 5000, 5000)).toBe(0);
    const onLos = evaluateFresnelClearance(lambda, 5000, 5000, 0);
    expect(onLos.lossDb).toBeCloseTo(6.03, 1);
    expect(onLos.status).toBe('eingeschraenkt');
    expect(evaluateFresnelClearance(lambda, 5000, 5000, 5).status).toBe('blockiert');
  });
});

describe('EM-Wellen-Widget: Rechtssystem und Drehsinn (IEEE Std 145, Balanis §2.12)', () => {
  const polarizations = ['linear-v', 'linear-h', 'rhcp', 'lhcp'] as const;

  it('E × H zeigt in Ausbreitungsrichtung (+x) für jede Polarisation', () => {
    for (const polarization of polarizations) {
      for (const s of fieldSamples({ cycles: 2, samples: 40, phaseRad: 0.4, polarization })) {
        const cross = s.ey * s.hz - s.ez * s.hy;
        expect(cross).toBeGreaterThanOrEqual(-1e-12);
        expect(cross).toBeCloseTo(s.ey * s.ey + s.ez * s.ez, 12);
      }
    }
  });

  it('RHCP: E dreht am festen Ort mit der Zeit von +y nach +z (rechte Hand um +x)', () => {
    const start = frontVector(0, 'rhcp');
    const quarter = frontVector(Math.PI / 2, 'rhcp');
    expect(start.ey).toBeCloseTo(1, 12);
    expect(start.ez).toBeCloseTo(0, 12);
    expect(quarter.ey).toBeCloseTo(0, 12);
    expect(quarter.ez).toBeCloseTo(1, 12);
  });

  it('LHCP dreht gegensinnig: nach einer Viertelperiode zeigt E nach −z', () => {
    expect(frontVector(Math.PI / 2, 'lhcp').ez).toBeCloseTo(-1, 12);
  });

  it('Momentaufnahme: Phase wächst mit x, die Welle läuft nach +x', () => {
    // E_y = cos(kx − ωt): ein Punkt gleicher Phase wandert mit t nach +x.
    const earlier = fieldSamples({ cycles: 1, samples: 101, phaseRad: 0, polarization: 'rhcp' });
    const later = fieldSamples({
      cycles: 1,
      samples: 101,
      phaseRad: Math.PI / 2,
      polarization: 'rhcp'
    });
    const peak = (samples: typeof earlier) =>
      samples.reduce((best, s) => (s.ey > best.ey ? s : best), samples[0]).x;
    expect(peak(earlier)).toBeCloseTo(0, 6);
    expect(peak(later)).toBeCloseTo(0.25, 6);
  });
});

describe('Feldstärke-Widget (Meinke/Gundlach: E = √(30·EIRP)/d)', () => {
  it('10 W, 12 dBi, 100 m → EIRP 158,5 W, E = 0,689 V/m = 116,8 dBµV/m', () => {
    const r = computeFieldStrength({ txPowerW: 10, gainDbi: 12, distanceM: 100 });
    expect(r.eirpW).toBeCloseTo(158.49, 1);
    expect(r.eirpDbm).toBeCloseTo(52, 6);
    expect(r.erpW).toBeCloseTo(96.6, 0);
    expect(r.fieldVPerM).toBeCloseTo(0.689, 3);
    expect(r.fieldDbuvPerM).toBeCloseTo(116.8, 1);
    expect(r.powerDensityW * 1000).toBeCloseTo(1.261, 2);
  });

  it('20 dB je Dekade Abstand, 1 V/m = 120 dBµV/m', () => {
    expect(fieldStrengthDbuvPerM(1)).toBeCloseTo(120, 9);
    const a = computeFieldStrength({ txPowerW: 10, gainDbi: 12, distanceM: 100 }).fieldDbuvPerM;
    const b = computeFieldStrength({ txPowerW: 10, gainDbi: 12, distanceM: 1000 }).fieldDbuvPerM;
    expect(a - b).toBeCloseTo(20, 6);
  });
});

describe('Dämpfungsfenster-Widget (ITU-R P.676-13, 1013,25 hPa, 15 °C, 7,5 g/m³)', () => {
  const standard = { temperatureK: 288.15, pressureHpa: 1013.25, waterVaporDensity: 7.5 };

  it('Sauerstoffkomplex 60 GHz ≈ 15 dB/km, Wasserdampf 22,235 GHz ≈ 0,19 dB/km, 183,31 GHz ≈ 28 dB/km', () => {
    expect(calculateAtmosphericAttenuation(60, standard).total).toBeGreaterThan(13);
    expect(calculateAtmosphericAttenuation(60, standard).total).toBeLessThan(16);
    const h2o22 = calculateAtmosphericAttenuation(22.235, standard);
    expect(h2o22.total).toBeGreaterThan(0.16);
    expect(h2o22.total).toBeLessThan(0.22);
    expect(h2o22.waterVapor).toBeGreaterThan(h2o22.oxygen);
    const h2o183 = calculateAtmosphericAttenuation(183.31, standard).total;
    expect(h2o183).toBeGreaterThan(25);
    expect(h2o183).toBeLessThan(31);
  });

  it('Fenster: 35 GHz ≈ 0,1 dB/km, 94 GHz ≈ 0,4 dB/km; trockene Luft senkt nur den Wasserdampfanteil', () => {
    const curve = generateWindowCurve(7.5);
    expect(findNearestPoint(curve, 35)?.total).toBeGreaterThan(0.07);
    expect(findNearestPoint(curve, 35)?.total).toBeLessThan(0.15);
    expect(findNearestPoint(curve, 94)?.total).toBeGreaterThan(0.3);
    expect(findNearestPoint(curve, 94)?.total).toBeLessThan(0.6);
    const dry = generateWindowCurve(0);
    expect(findNearestPoint(dry, 22.235)?.waterVapor).toBe(0);
    // Der Sauerstoffanteil hängt über den Trockenluftdruck p − e nur schwach vom Wasserdampf ab (< 2 %).
    const oxygenDry = findNearestPoint(dry, 60)?.oxygen ?? 0;
    const oxygenStandard = findNearestPoint(curve, 60)?.oxygen ?? 1;
    expect(Math.abs(oxygenDry / oxygenStandard - 1)).toBeLessThan(0.02);
  });
});

describe('Ausbreitungs-Sandkasten und Ionosphären-Diagramm (ITU-R P.834, P.1239)', () => {
  it('Radiohorizont k = 4/3: 30 m → 22,6 km, 10 m → 13,0 km, Summe 35,6 km', () => {
    expect(calculateRadioHorizon(30)).toBeCloseTo(22.57, 1);
    expect(calculateRadioHorizon(10)).toBeCloseTo(13.03, 1);
    expect(computePropagationScene(30, 10, 145e6, true).losMaxKm).toBeCloseTo(35.6, 1);
    expect(computePropagationScene(30, 10, 145e6, true).mode).toBe('sichtlinie');
  });

  it('MUF(3000 km) nach dem Sekantengesetz: foF2 8,4 MHz, h = 300 km → Faktor ≈ 3,3', () => {
    expect(estimateMUF(8.4, 3000, 300) / 8.4).toBeCloseTo(3.28, 1);
    expect(estimateMUF(8.4, 0, 300)).toBeCloseTo(8.4, 9);
  });

  it('Sprungdistanz 14 MHz bei foF2 5,5 MHz, h = 300 km ≈ 1660 km; f ≤ foF2 → 0 km', () => {
    const skip = calculateSkipDistanceForFrequency(14, 5.5, 300);
    expect(skip).not.toBeNull();
    expect(skip ?? 0).toBeGreaterThan(1600);
    expect(skip ?? 0).toBeLessThan(1720);
    expect(calculateSkipDistanceForFrequency(5, 5.5, 300)).toBe(0);
    expect(calculateSkipDistanceForFrequency(30, 5.5, 300)).toBeNull();
  });

  it('Ionosphären-Diagramm: F10,7 = 100 → foF2 5,5 MHz, MUF ≈ 18 MHz', () => {
    const foF2 = criticalFrequency(100, false);
    expect(foF2).toBeCloseTo(5.5, 1);
    expect(maximumUsableFrequency(foF2)).toBeCloseTo(18, 0);
  });

  it('Bodenwellen-Faustregel läuft monoton von 300 km (30 kHz) auf 30 km (3 MHz)', () => {
    expect(estimateGroundWaveRangeKm(30e3)).toBeCloseTo(300, 6);
    expect(estimateGroundWaveRangeKm(3e6)).toBeCloseTo(30, 6);
    expect(estimateGroundWaveRangeKm(300e3)).toBeCloseTo(Math.sqrt(300 * 30), 3);
  });
});

describe('Dezibel-Spielplatz und RCS-Vergleich', () => {
  it('Standardkette 20 − 3 + 12 − 100 + 12 = −59 dBm', () => {
    expect(chainTotalDbm(DEFAULT_CHAIN)).toBeCloseTo(-59, 9);
  });

  it('Reichweite ∝ σ^¼: 100 m² gegen 1 m² → 3,16-fach, 0,01 m² → 0,316', () => {
    expect(relativeRadarRange(100, 1)).toBeCloseTo(3.162, 3);
    expect(relativeRadarRange(0.01, 1)).toBeCloseTo(0.3162, 3);
  });
});

describe('Modulations-Widgets (ITU-R SM.328, Carson)', () => {
  it('UKW: Δf 75 kHz, f_max 15 kHz → B = 180 kHz, β = 5', () => {
    expect(carsonBandwidthHz(75_000, 15_000)).toBe(180_000);
    expect(fmModulationIndex(75_000, 15_000)).toBe(5);
    expect(
      occupiedBandwidthHz('fm', {
        carrierHz: 1e6,
        messageHz: 15_000,
        amDepth: 0,
        deviationHz: 75_000,
        phaseDeviationRad: 0
      })
    ).toBe(180_000);
  });

  it('AM mit m = 0,6: Seitenbänder je 0,3 des Trägers; FM β = 2,405 löscht den Träger (J₀-Nullstelle)', () => {
    const am = spectrumLines('am', {
      carrierHz: 45_000,
      messageHz: 3_000,
      amDepth: 0.6,
      deviationHz: 0,
      phaseDeviationRad: 0
    });
    expect(am.find((l) => l.offsetHz === 3000)?.amplitude).toBeCloseTo(0.3, 9);
    const fm = spectrumLines('fm', {
      carrierHz: 45_000,
      messageHz: 1_000,
      amDepth: 0,
      deviationHz: 2404.8,
      phaseDeviationRad: 0
    });
    expect(fm.find((l) => l.offsetHz === 0)?.amplitude ?? 0).toBeLessThan(0.002);
  });

  it('Konstellationen sind auf mittlere Symbolleistung 1 normiert; σ bei 20 dB = 0,0707', () => {
    for (const scheme of ['bpsk', 'qpsk', 'psk8', 'qam16', 'qam64'] as ConstellationScheme[]) {
      const points = constellationPoints(scheme);
      const mean = points.reduce((sum, p) => sum + p.i * p.i + p.q * p.q, 0) / points.length;
      expect(mean).toBeCloseTo(1, 9);
    }
    expect(noiseSigmaFromSnrDb(20)).toBeCloseTo(0.0707, 4);
    // 16-QAM: Eckpunkt liegt bei 3/√10 ≈ 0,949 und Nachbarpunkte unterscheiden sich in genau einem Bit
    const qam = constellationPoints('qam16');
    expect(Math.max(...qam.map((p) => p.i))).toBeCloseTo(3 / Math.sqrt(10), 9);
    const bitsAt = (i: number, q: number) =>
      qam.find((p) => Math.abs(p.i - i) < 1e-9 && Math.abs(p.q - q) < 1e-9)?.bits ?? '';
    const step = 2 / Math.sqrt(10);
    const differing = [...bitsAt(-3 / Math.sqrt(10), 3 / Math.sqrt(10))].filter(
      (bit, index) => bit !== bitsAt(-3 / Math.sqrt(10) + step, 3 / Math.sqrt(10))[index]
    ).length;
    expect(differing).toBe(1);
  });
});

describe('Antennen-Widgets (Balanis, Kraus, IEEE Std 1785)', () => {
  it('Halbwellendipol: Halbwertsbreite ≈ 78°, Kurzdipol 90°, Maximum bei 90° zur Achse', () => {
    const dipole = samplePattern({ type: 'dipol' }, 0.5);
    expect(halfPowerBeamwidthDeg(dipole)).toBeGreaterThanOrEqual(77.5);
    expect(halfPowerBeamwidthDeg(dipole)).toBeLessThanOrEqual(79.5);
    const short = samplePattern({ type: 'kurzdipol' }, 0.5);
    expect(halfPowerBeamwidthDeg(short)).toBeGreaterThanOrEqual(89.5);
    expect(halfPowerBeamwidthDeg(short)).toBeLessThanOrEqual(90.5);
    expect(dipole.find((s) => s.angleDeg === 90)?.field).toBeCloseTo(1, 9);
    expect(dipole.find((s) => s.angleDeg === 0)?.field).toBeCloseTo(0, 9);
  });

  it('Parabol 60 cm, 11 GHz, η 0,6 → 34,6 dBi, HPBW 3,2°', () => {
    const lambda = wavelengthM(11e9);
    expect(parabolicGainDbi(0.6, lambda, 0.6)).toBeCloseTo(34.6, 0);
    expect(parabolicBeamwidthDeg(0.6, lambda)).toBeCloseTo(3.18, 1);
  });

  it('SWR 2:1 → |Γ| = 1/3, RL 9,54 dB, 11,1 % reflektiert, Fehlanpassung 0,51 dB', () => {
    const gamma = reflectionFromVswr(2);
    expect(gamma).toBeCloseTo(1 / 3, 9);
    expect(returnLossDb(gamma)).toBeCloseTo(9.54, 2);
    expect(mismatchLossDb(gamma)).toBeCloseTo(0.512, 2);
  });
});

describe('Rechner-Diagramme (ITU-R P.525, Shannon, Pozar)', () => {
  it('FSPL 2,4 GHz, 100 m → 80,05 dB; +20 dB je Dekade', () => {
    expect(calculateFSPL(100, 2.4e9)).toBeCloseTo(80.05, 1);
    expect(calculateFSPL(1000, 2.4e9) - calculateFSPL(100, 2.4e9)).toBeCloseTo(20, 6);
  });

  it('Shannon: 20 dB → 6,66 bit/s/Hz, 0 dB → 1 bit/s/Hz', () => {
    expect(calculateShannonCapacity(1, 20)).toBeCloseTo(6.658, 2);
    expect(calculateShannonCapacity(1, 0)).toBeCloseTo(1, 9);
  });

  it('Skin-Tiefe Seewasser (4 S/m) bei 1 MHz ≈ 25 cm', () => {
    expect(calculateSkinDepth(1e6, 4)).toBeCloseTo(0.2516, 3);
  });

  it('Orbit: geostationär bei 35 786 km, Umlauf = siderischer Tag', () => {
    expect(GEOSTATIONARY_ALTITUDE_M / 1000).toBeCloseTo(35_786, -1);
    expect(orbitalPeriod(GEOSTATIONARY_ALTITUDE_M)).toBeCloseTo(SIDEREAL_DAY_S, 3);
  });
});
