/**
 * Rechenmodell des Widgets „LEO-Überflug: Elevation und Doppler".
 *
 * Für eine Kreisbahn und eine feste Erdfunkstelle lässt sich ein Überflug in
 * geschlossener Form beschreiben. Die Bahnparameter (Umlaufzeit, Radius,
 * Schrägentfernung, Zentriwinkel) kommen aus `$lib/utils/orbitMath`; hier
 * kommen nur die Zeitabhängigkeit und die Radialgeschwindigkeit hinzu.
 *
 * Geometrie (sphärisches rechtwinkliges Dreieck):
 *   cos γ(t) = cos γ_max · cos(ω·t)          γ = Zentriwinkel, ω = 2π/T
 *   tan ε    = (cos γ − R/r) / sin γ         ε = Elevation
 *   d        = √(R² + r² − 2·R·r·cos γ)      d = Schrägentfernung
 *   ḋ        = R·r·ω·cos γ_max·sin(ω·t) / d  → f_d = −ḋ·f/c
 *
 * Quellen:
 * - ITU-R S.1257 und ITU-R P.618: Geometrie der Erde-Weltraum-Strecke.
 * - Roddy, *Satellite Communications*, Kap. „Orbits and Launching Methods".
 * - Bahnhöhen aus `$lib/data/satelliteSystems`.
 */
import { EARTH_RADIUS_EQUATORIAL, SPEED_OF_LIGHT } from '$lib/data/constants';
import {
  centralAngle,
  orbitRadius,
  orbitalPeriod,
  orbitalVelocity,
  DEFAULT_MIN_ELEVATION_DEG
} from '$lib/utils/orbitMath';
import { safeDivide } from '$lib/utils/handlers';

const DEG = Math.PI / 180;

/** Reglerbereiche; Voreinstellung ist ein Amateurfunksatellit im 2-m-Band. */
export const LEO_PASS_LIMITS = {
  altitudeM: { min: 300_000, max: 1_200_000, default: 550_000 },
  maxElevationDeg: { min: 10, max: 90, default: 60 },
  frequencyHz: { min: 100e6, max: 2.5e9, default: 145.8e6 }
} as const;

/** Elevation, ab der eine Verbindung praktisch nutzbar ist. */
export const LEO_USABLE_ELEVATION_DEG = DEFAULT_MIN_ELEVATION_DEG;

/** Elevation in Grad für einen Zentriwinkel γ (ebenfalls in Grad). */
export function elevationForCentralAngle(centralAngleDeg: number, altitudeM: number): number {
  const gamma = Math.abs(centralAngleDeg) * DEG;
  const k = safeDivide(EARTH_RADIUS_EQUATORIAL, orbitRadius(altitudeM), NaN);
  if (!Number.isFinite(k)) return NaN;
  if (gamma <= 1e-9) return 90;
  return Math.atan2(Math.cos(gamma) - k, Math.sin(gamma)) / DEG;
}

/** Schrägentfernung in m für einen Zentriwinkel γ (Kosinussatz). */
export function slantRangeForCentralAngle(centralAngleDeg: number, altitudeM: number): number {
  const gamma = Math.abs(centralAngleDeg) * DEG;
  const R = EARTH_RADIUS_EQUATORIAL;
  const r = orbitRadius(altitudeM);
  const radicand = R * R + r * r - 2 * R * r * Math.cos(gamma);
  return radicand > 0 ? Math.sqrt(radicand) : 0;
}

export interface PassSample {
  /** Zeit relativ zum Punkt der größten Annäherung in s */
  timeS: number;
  elevationDeg: number;
  slantRangeM: number;
  /** Radialgeschwindigkeit in m/s (positiv: Satellit entfernt sich) */
  rangeRateMs: number;
  /** Dopplerverschiebung in Hz (positiv: Annäherung) */
  dopplerHz: number;
}

export interface PassProfile {
  samples: PassSample[];
  /** Dauer des Überflugs über dem Horizont in s */
  durationS: number;
  /** Dauer über der nutzbaren Elevation in s */
  usableDurationS: number;
  /** Umlaufzeit der Bahn in s */
  periodS: number;
  /** Bahngeschwindigkeit in m/s */
  velocityMs: number;
  /** Kleinste Schrägentfernung (im Kulminationspunkt) in m */
  minRangeM: number;
  /** Größte Schrägentfernung (am Horizont) in m */
  maxRangeM: number;
  /** Größter Betrag der Dopplerverschiebung in Hz */
  maxDopplerHz: number;
}

/** Halber Bahnwinkel, in dem der Satellit über `elevationDeg` steht. */
function halfTravelAngleDeg(
  altitudeM: number,
  maxElevationDeg: number,
  elevationDeg: number
): number {
  const gammaHorizon = centralAngle(altitudeM, elevationDeg);
  const gammaMax = centralAngle(altitudeM, maxElevationDeg);
  if (!Number.isFinite(gammaHorizon) || !Number.isFinite(gammaMax)) return 0;
  const ratio = safeDivide(Math.cos(gammaHorizon * DEG), Math.cos(gammaMax * DEG), 0);
  if (!(ratio > 0) || ratio > 1) return 0;
  return Math.acos(ratio) / DEG;
}

/**
 * Vollständiges Profil eines Überflugs: Elevation, Entfernung und Doppler
 * über der Zeit, symmetrisch um den Kulminationspunkt.
 */
export function passProfile(
  altitudeM: number,
  maxElevationDeg: number,
  frequencyHz: number,
  samples: number = 121,
  horizonElevationDeg: number = 0
): PassProfile {
  const periodS = orbitalPeriod(altitudeM);
  const velocityMs = orbitalVelocity(altitudeM);
  const omega = safeDivide(2 * Math.PI, periodS, 0);
  const gammaMax = centralAngle(altitudeM, maxElevationDeg);
  const halfAngleDeg = halfTravelAngleDeg(altitudeM, maxElevationDeg, horizonElevationDeg);
  const usableHalfDeg = halfTravelAngleDeg(altitudeM, maxElevationDeg, LEO_USABLE_ELEVATION_DEG);
  const durationS = safeDivide(2 * halfAngleDeg * DEG, omega, 0);
  const R = EARTH_RADIUS_EQUATORIAL;
  const r = orbitRadius(altitudeM);

  const list: PassSample[] = [];
  const count = Math.max(3, samples);
  for (let i = 0; i < count; i++) {
    const theta = (-halfAngleDeg + (2 * halfAngleDeg * i) / (count - 1)) * DEG;
    const timeS = safeDivide(theta, omega, 0);
    const cosGamma = Math.cos(gammaMax * DEG) * Math.cos(theta);
    const gammaDeg = Math.acos(Math.min(1, Math.max(-1, cosGamma))) / DEG;
    const slantRangeM = slantRangeForCentralAngle(gammaDeg, altitudeM);
    const rangeRateMs = safeDivide(
      R * r * omega * Math.cos(gammaMax * DEG) * Math.sin(theta),
      slantRangeM,
      0
    );
    list.push({
      timeS,
      elevationDeg: elevationForCentralAngle(gammaDeg, altitudeM),
      slantRangeM,
      rangeRateMs,
      dopplerHz: safeDivide(-rangeRateMs * frequencyHz, SPEED_OF_LIGHT, 0)
    });
  }

  const ranges = list.map((sample) => sample.slantRangeM);
  const dopplers = list.map((sample) => Math.abs(sample.dopplerHz));
  return {
    samples: list,
    durationS,
    usableDurationS: safeDivide(2 * usableHalfDeg * DEG, omega, 0),
    periodS,
    velocityMs,
    minRangeM: ranges.length ? Math.min(...ranges) : 0,
    maxRangeM: ranges.length ? Math.max(...ranges) : 0,
    maxDopplerHz: dopplers.length ? Math.max(...dopplers) : 0
  };
}

/** Wert des Profils zu einem Zeitpunkt (nächstgelegene Stützstelle). */
export function sampleAt(profile: PassProfile, timeS: number): PassSample | undefined {
  if (!profile.samples.length) return undefined;
  return profile.samples.reduce((best, sample) =>
    Math.abs(sample.timeS - timeS) < Math.abs(best.timeS - timeS) ? sample : best
  );
}
