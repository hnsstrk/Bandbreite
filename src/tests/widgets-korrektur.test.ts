/**
 * Referenzwerte der Diagramm-Korrektur (W10):
 *
 * 1. Orbit-Szene — Elevationswinkel und Schrägentfernung aus der Geometrie
 *    (`utils/orbitMath.ts`) statt aus dem logarithmisch gezeichneten Radius.
 * 2. Konstellationsdiagramm — benötigter Störabstand für BER = 10⁻⁶ aus den
 *    Fehlerformeln (`utils/modulationMath.ts`) statt „+3 dB je Bit".
 * 3. Tote Zone — Sprungdistanz und Bodenwellenreichweite aus
 *    `data/propagation.ts` statt sinnbildlicher Fläche.
 *
 * Quellen der Sollwerte: ITU-R S.1257 (Erde-Weltraum-Geometrie),
 * Proakis/Salehi *Digital Communications* 5. Aufl. Kap. 4 und Sklar 2. Aufl.
 * Tab. 4.1 (Fehlerraten), Davies *Ionospheric Radio* §6 (Spiegelmodell),
 * ITU-R P.834 (Radiohorizont).
 */
import { describe, expect, it } from 'vitest';
import { EARTH_RADIUS_EQUATORIAL } from '$lib/data/constants';
import {
  centralAngle,
  elevationFromCentralAngle,
  slantRange,
  slantRangeFromCentralAngle,
  GEOSTATIONARY_ALTITUDE_M
} from '$lib/utils/orbitMath';
import {
  bitErrorRate,
  noiseSigmaFromSnrDb,
  qFunction,
  REFERENCE_BER,
  requiredEbN0Db,
  requiredSnrDb,
  schemeBitsPerSymbol,
  type ConstellationScheme
} from '$lib/utils/modulationMath';
import {
  calculateSkipDistanceForFrequency,
  estimateGroundWaveRangeKm,
  losDistanceKm,
  maxSingleHopDistanceKm,
  FOF2_PRESETS,
  SKIP_ZONE_PARAMS
} from '$lib/data/propagation';
import {
  distanceTicks,
  distanceToX,
  sceneDistances,
  SPORADIC_E_ALTITUDE_KM
} from '$lib/components/charts/wavePropagationData';

const KM = 1000;

describe('Orbit-Szene: Sichtlinie, Elevation und Schrägentfernung', () => {
  it('geostationär im Zenit: Elevation 90°, Schrägentfernung 35 786 km', () => {
    expect(GEOSTATIONARY_ALTITUDE_M / KM).toBeCloseTo(35786, 0);
    expect(elevationFromCentralAngle(GEOSTATIONARY_ALTITUDE_M, 0)).toBeCloseTo(90, 6);
    expect(slantRangeFromCentralAngle(GEOSTATIONARY_ALTITUDE_M, 0) / KM).toBeCloseTo(35786, 0);
  });

  it('geostationär am Rand der Sichtbarkeit: Elevation 0°, Schrägentfernung 41 679 km', () => {
    const gammaMax = centralAngle(GEOSTATIONARY_ALTITUDE_M, 0);
    expect(gammaMax).toBeCloseTo(81.3, 1);
    expect(elevationFromCentralAngle(GEOSTATIONARY_ALTITUDE_M, gammaMax)).toBeCloseTo(0, 6);
    expect(slantRangeFromCentralAngle(GEOSTATIONARY_ALTITUDE_M, gammaMax) / KM).toBeCloseTo(
      41679,
      0
    );
  });

  it('Elevation und Zentriwinkel sind zueinander invers, die Schrägentfernung stimmt überein', () => {
    for (const altitudeKm of [420, 780, 20180, 35786]) {
      for (const elevationDeg of [0, 5, 10, 45, 89]) {
        const altitudeM = altitudeKm * KM;
        const gamma = centralAngle(altitudeM, elevationDeg);
        expect(elevationFromCentralAngle(altitudeM, gamma)).toBeCloseTo(elevationDeg, 6);
        expect(slantRangeFromCentralAngle(altitudeM, gamma)).toBeCloseTo(
          slantRange(altitudeM, elevationDeg),
          3
        );
      }
    }
  });

  it('die Sichtlinie schneidet die Erde nicht — geprüft an der gezeichneten Geometrie', () => {
    // Dieselbe Konstruktion wie in `OrbitScene.svelte`: Erdmittelpunkt im
    // Ursprung, Satellit senkrecht darüber, Bodenstation um γ versetzt.
    for (const altitudeKm of [420, 20180, 35786]) {
      const altitudeM = altitudeKm * KM;
      const r = (EARTH_RADIUS_EQUATORIAL + altitudeM) / KM;
      const earthKm = EARTH_RADIUS_EQUATORIAL / KM;
      for (const elevationDeg of [0, 10, 30]) {
        const gamma = (centralAngle(altitudeM, elevationDeg) * Math.PI) / 180;
        const station = { x: earthKm * Math.sin(gamma), y: earthKm * Math.cos(gamma) };
        const satellite = { x: 0, y: r };
        // Kleinster Abstand des Erdmittelpunkts von der Strecke Station–Satellit
        const dx = satellite.x - station.x;
        const dy = satellite.y - station.y;
        const t = Math.min(
          1,
          Math.max(0, -(station.x * dx + station.y * dy) / (dx * dx + dy * dy))
        );
        const closest = Math.hypot(station.x + t * dx, station.y + t * dy);
        expect(closest).toBeGreaterThanOrEqual(earthKm - 1e-6);
        // Länge der gezeichneten Sichtlinie = Schrägentfernung des Modells
        expect(Math.hypot(dx, dy)).toBeCloseTo(slantRange(altitudeM, elevationDeg) / KM, 6);
      }
    }
  });
});

describe('Konstellationsdiagramm: Störabstand für BER 10⁻⁶', () => {
  it('Q(x) trifft die Tabellenwerte der Normalverteilung', () => {
    expect(qFunction(0)).toBeCloseTo(0.5, 12);
    expect(qFunction(1)).toBeCloseTo(0.158_655_254, 9);
    expect(qFunction(2)).toBeCloseTo(0.022_750_132, 9);
    expect(qFunction(3)).toBeCloseTo(0.001_349_898, 9);
    expect(qFunction(4.753_424)).toBeCloseTo(1e-6, 9);
    expect(qFunction(-1)).toBeCloseTo(1 - 0.158_655_254, 9);
  });

  it('E_b/N₀ für BER 10⁻⁶ entspricht der Literatur (Proakis, Sklar)', () => {
    // Literatur rundet auf 10,5 / 14,0 / 14,4 / 18,8 dB — hier auf zwei Stellen.
    const expected: Record<ConstellationScheme, number> = {
      bpsk: 10.53,
      qpsk: 10.53,
      psk8: 13.95,
      qam16: 14.4,
      qam64: 18.78
    };
    for (const [scheme, ebN0] of Object.entries(expected) as [ConstellationScheme, number][]) {
      expect(requiredEbN0Db(scheme)).toBeCloseTo(ebN0, 2);
      expect(bitErrorRate(scheme, requiredEbN0Db(scheme))).toBeCloseTo(REFERENCE_BER, 12);
    }
  });

  it('E_s/N₀ = E_b/N₀ + 10·log₁₀(Bit je Symbol)', () => {
    const expected: Record<ConstellationScheme, number> = {
      bpsk: 10.53,
      qpsk: 13.54,
      psk8: 18.72,
      qam16: 20.42,
      qam64: 26.56
    };
    for (const [scheme, esN0] of Object.entries(expected) as [ConstellationScheme, number][]) {
      expect(requiredSnrDb(scheme)).toBeCloseTo(esN0, 2);
      expect(requiredSnrDb(scheme)).toBeCloseTo(
        requiredEbN0Db(scheme) + 10 * Math.log10(schemeBitsPerSymbol(scheme)),
        9
      );
    }
  });

  it('der Bedarf wächst mit der Zustandszahl', () => {
    const order: ConstellationScheme[] = ['bpsk', 'qpsk', 'psk8', 'qam16', 'qam64'];
    for (let index = 1; index < order.length; index += 1) {
      expect(requiredSnrDb(order[index])).toBeGreaterThan(requiredSnrDb(order[index - 1]));
    }
  });

  it('die Rauschstreuung folgt aus E_s/N₀: σ = √(1/(2·E_s/N₀))', () => {
    for (const snrDb of [0, 10, 13.5, 20, 26.6]) {
      expect(noiseSigmaFromSnrDb(snrDb)).toBeCloseTo(
        Math.sqrt(1 / (2 * Math.pow(10, snrDb / 10))),
        12
      );
    }
    expect(noiseSigmaFromSnrDb(20)).toBeCloseTo(0.0707, 4);
  });
});

describe('Tote Zone: Sprungdistanz statt sinnbildlicher Fläche', () => {
  it('14 MHz, foF2 7 MHz, 300 km Reflexionshöhe → 1127 km Sprungdistanz', () => {
    expect(calculateSkipDistanceForFrequency(14, 7, 300)).toBeCloseTo(1126.96, 1);
  });

  it('f ≤ foF2 ergibt 0 km, f über der MUF ergibt keine Reflexion', () => {
    expect(calculateSkipDistanceForFrequency(5, 7, 300)).toBe(0);
    expect(calculateSkipDistanceForFrequency(14, FOF2_PRESETS.night, 350)).toBeNull();
  });

  it('größter Einfachsprung: 3836 km an der F2-Schicht, 2351 km an der Es-Schicht', () => {
    expect(maxSingleHopDistanceKm(300)).toBeCloseTo(3835.8, 1);
    expect(maxSingleHopDistanceKm(SPORADIC_E_ALTITUDE_KM)).toBeCloseTo(2351.0, 1);
    expect(maxSingleHopDistanceKm(0)).toBe(0);
  });

  it('Bodenwellenreichweite bleibt nach dem Umzug nach data/propagation gleich', () => {
    expect(estimateGroundWaveRangeKm(30e3)).toBeCloseTo(300, 6);
    expect(estimateGroundWaveRangeKm(3e6)).toBeCloseTo(30, 6);
    expect(estimateGroundWaveRangeKm(300e3)).toBeCloseTo(Math.sqrt(300 * 30), 3);
    expect(estimateGroundWaveRangeKm(14e6)).toBeCloseTo(13.9, 1);
  });

  it('Szene bei 14 MHz am Tag: tote Zone von 14 km bis 692 km', () => {
    const scene = sceneDistances('sky-wave', 14, false);
    expect(scene.foF2MHz).toBeCloseTo(FOF2_PRESETS.day, 6);
    expect(scene.reflectionHeightKm).toBe(SKIP_ZONE_PARAMS.reflectionHeightKm.day);
    expect(scene.groundWaveKm).toBeCloseTo(13.9, 1);
    expect(scene.skipKm).toBeCloseTo(692.1, 1);
    expect(scene.rxKm).toBeCloseTo(692.1, 1);
    expect(scene.spanKm).toBeGreaterThan(scene.rxKm);
  });

  it('Szene der übrigen Modi kommt aus demselben Modell', () => {
    expect(sceneDistances('line-of-sight', 145, false).rxKm).toBeCloseTo(losDistanceKm(30, 10), 9);
    expect(sceneDistances('line-of-sight', 145, false).rxKm).toBeCloseTo(35.61, 2);
    expect(sceneDistances('ground-wave', 0.5, false).rxKm).toBeCloseTo(73.5, 1);
    expect(sceneDistances('sporadic-e', 50, false).rxKm).toBeCloseTo(2351.0, 1);
  });

  it('die Entfernungsachse bildet 0 km auf den Sender und die Spannweite auf die Breite ab', () => {
    const scene = sceneDistances('sky-wave', 14, false);
    expect(distanceToX(0, scene.spanKm, 800)).toBe(0);
    expect(distanceToX(scene.spanKm, scene.spanKm, 800)).toBeCloseTo(800, 9);
    expect(distanceToX(scene.rxKm, scene.spanKm, 800)).toBeCloseTo(640, 6);

    const ticks = distanceTicks(scene.spanKm);
    expect(ticks[0]).toBe(0);
    expect(ticks.length).toBeGreaterThanOrEqual(4);
    expect(ticks[ticks.length - 1]).toBeLessThanOrEqual(scene.spanKm);
  });
});
