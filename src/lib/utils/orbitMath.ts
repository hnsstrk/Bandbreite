/**
 * Bahnmechanik für den Satellitenfunk: Umlaufzeit, Bahngeschwindigkeit,
 * Schrägentfernung, Signallaufzeit, Sichtbarkeitsdauer, Ausleuchtzone und
 * Dopplerverschiebung einer Kreisbahn.
 *
 * Grundlage ist das Zweikörperproblem mit kreisförmiger Bahn — für die
 * Abschätzungen, um die es hier geht, genügt das. Abplattung der Erde,
 * Luftwiderstand und Störungen durch Mond und Sonne bleiben unberücksichtigt.
 *
 * Quellen:
 * - IERS Conventions (2010) / WGS 84: geozentrische Gravitationskonstante
 *   µ = GM = 3,986 004 418 · 10^14 m³/s²
 * - ITU-R S.1257 und ITU-R P.618 (Geometrie der Erde-Weltraum-Strecke)
 * - Roddy, *Satellite Communications*, Kapitel „Orbits and Launching Methods"
 *
 * Alle Eingaben in SI-Einheiten (m, s, Hz), Winkel in Grad.
 */

import { EARTH_RADIUS_EQUATORIAL, SPEED_OF_LIGHT } from '$lib/data/constants';
import { safeDivide, safeLog } from '$lib/utils/handlers';

// ============================================================================
// Konstanten
// ============================================================================

/**
 * Geozentrische Gravitationskonstante µ = G · M_Erde in m³/s².
 * Quelle: WGS 84 / IERS Conventions 2010.
 */
export const EARTH_MU = 3.986004418e14;

/**
 * Länge des siderischen Tages in Sekunden (23 h 56 min 4,0905 s).
 * Ein geostationärer Satellit hat genau diese Umlaufzeit — nicht 24 h, denn er
 * muss der Erddrehung gegenüber dem Fixsternhimmel folgen.
 */
export const SIDEREAL_DAY_S = 86_164.0905;

/** Kleinster Elevationswinkel, unter dem eine Verbindung praktisch nutzbar ist. */
export const DEFAULT_MIN_ELEVATION_DEG = 10;

/** Grad je Vollkreis. */
const FULL_CIRCLE_DEG = 360;

const DEG = Math.PI / 180;

/** Grad in Bogenmaß. */
function toRad(deg: number): number {
  return deg * DEG;
}

/** Bogenmaß in Grad. */
function toDeg(rad: number): number {
  return rad / DEG;
}

// ============================================================================
// Bahnparameter
// ============================================================================

/** Bahnradius aus der Höhe über dem Äquator in m. */
export function orbitRadius(altitudeM: number): number {
  return EARTH_RADIUS_EQUATORIAL + altitudeM;
}

/**
 * Umlaufzeit einer Kreisbahn in Sekunden: T = 2π · √(r³/µ).
 *
 * Prüfwerte: 35 786 km → 86 165 s (23 h 56 min); 420 km → 5578 s (93 min).
 */
export function orbitalPeriod(altitudeM: number): number {
  const r = orbitRadius(altitudeM);
  if (!(r > 0)) return NaN;
  return 2 * Math.PI * Math.sqrt(safeDivide(r ** 3, EARTH_MU, NaN));
}

/** Bahngeschwindigkeit einer Kreisbahn in m/s: v = √(µ/r). */
export function orbitalVelocity(altitudeM: number): number {
  const r = orbitRadius(altitudeM);
  if (!(r > 0)) return NaN;
  return Math.sqrt(safeDivide(EARTH_MU, r, NaN));
}

/**
 * Bahnhöhe zu einer vorgegebenen Umlaufzeit in m — die Umkehrung des
 * dritten Keplerschen Gesetzes. Mit `SIDEREAL_DAY_S` ergibt sich die
 * geostationäre Höhe von rund 35 786 km.
 */
export function altitudeForPeriod(periodS: number): number {
  if (!(periodS > 0)) return NaN;
  const radius = Math.cbrt(safeDivide(EARTH_MU * periodS ** 2, 4 * Math.PI ** 2, NaN));
  return radius - EARTH_RADIUS_EQUATORIAL;
}

/** Höhe der geostationären Bahn über dem Äquator in m. */
export const GEOSTATIONARY_ALTITUDE_M = altitudeForPeriod(SIDEREAL_DAY_S);

// ============================================================================
// Geometrie der Erde-Weltraum-Strecke
// ============================================================================

/**
 * Schrägentfernung zwischen Erdfunkstelle und Satellit in m.
 *
 * d = R · [ √( ((R+h)/R)² − cos²ε ) − sin ε ]
 *
 * Bei ε = 90° (Satellit im Zenit) ergibt sich genau die Bahnhöhe.
 */
export function slantRange(altitudeM: number, elevationDeg: number): number {
  const R = EARTH_RADIUS_EQUATORIAL;
  const ratio = safeDivide(orbitRadius(altitudeM), R, NaN);
  const eps = toRad(elevationDeg);
  const radicand = ratio ** 2 - Math.cos(eps) ** 2;
  if (!(radicand >= 0)) return NaN;
  return R * (Math.sqrt(radicand) - Math.sin(eps));
}

/**
 * Halber Zentriwinkel γ in Grad, unter dem der Satellit noch über dem
 * Mindestelevationswinkel steht: γ = arccos( (R/(R+h)) · cos ε ) − ε.
 * Er bestimmt die Ausleuchtzone und die Dauer eines Überflugs.
 */
export function centralAngle(
  altitudeM: number,
  minElevationDeg: number = DEFAULT_MIN_ELEVATION_DEG
): number {
  const ratio = safeDivide(EARTH_RADIUS_EQUATORIAL, orbitRadius(altitudeM), NaN);
  const eps = toRad(minElevationDeg);
  const argument = ratio * Math.cos(eps);
  if (!(Math.abs(argument) <= 1)) return NaN;
  return toDeg(Math.acos(argument)) - minElevationDeg;
}

/**
 * Elevationswinkel in Grad, unter dem der Satellit von einer Erdfunkstelle aus
 * erscheint, die um den halben Zentriwinkel γ vom Fußpunkt entfernt liegt:
 *
 * tan ε = (cos γ − R/r) / sin γ   mit r = R + h
 *
 * Umkehrung von {@link centralAngle}. Prüfwerte (geostationär): γ = 0 → ε = 90°
 * (Satellit im Zenit), γ = arccos(R/r) = 81,3° → ε = 0° (Satellit am Horizont).
 *
 * Quelle: ITU-R S.1257, Anhang 1 (Geometrie der Erde-Weltraum-Strecke).
 */
export function elevationFromCentralAngle(altitudeM: number, centralAngleDeg: number): number {
  const ratio = safeDivide(EARTH_RADIUS_EQUATORIAL, orbitRadius(altitudeM), NaN);
  if (!Number.isFinite(ratio)) return NaN;
  const gamma = toRad(centralAngleDeg);
  return toDeg(Math.atan2(Math.cos(gamma) - ratio, Math.sin(gamma)));
}

/**
 * Schrägentfernung in m aus dem halben Zentriwinkel γ — Kosinussatz im Dreieck
 * Erdmittelpunkt, Erdfunkstelle, Satellit:
 *
 * d = √(R² + r² − 2·R·r·cos γ)
 *
 * Prüfwerte (geostationär): γ = 0 → 35 786 km (die Bahnhöhe), γ = 81,3° (Rand
 * der Sichtbarkeit) → 41 679 km.
 */
export function slantRangeFromCentralAngle(altitudeM: number, centralAngleDeg: number): number {
  const R = EARTH_RADIUS_EQUATORIAL;
  const r = orbitRadius(altitudeM);
  if (!(r > 0)) return NaN;
  const gamma = toRad(centralAngleDeg);
  const radicand = R ** 2 + r ** 2 - 2 * R * r * Math.cos(gamma);
  if (!(radicand >= 0)) return NaN;
  return Math.sqrt(radicand);
}

/** Radius der Ausleuchtzone auf der Erdoberfläche in m (Großkreisbogen). */
export function footprintRadius(
  altitudeM: number,
  minElevationDeg: number = DEFAULT_MIN_ELEVATION_DEG
): number {
  const gamma = centralAngle(altitudeM, minElevationDeg);
  if (!Number.isFinite(gamma)) return NaN;
  return EARTH_RADIUS_EQUATORIAL * toRad(gamma);
}

/**
 * Anteil der Erdoberfläche innerhalb der Ausleuchtzone (0 bis 1).
 * Kugelkappe: A = 2πR²(1 − cos γ), Kugel: 4πR².
 */
export function coverageFraction(
  altitudeM: number,
  minElevationDeg: number = DEFAULT_MIN_ELEVATION_DEG
): number {
  const gamma = centralAngle(altitudeM, minElevationDeg);
  if (!Number.isFinite(gamma)) return NaN;
  return (1 - Math.cos(toRad(gamma))) / 2;
}

// ============================================================================
// Laufzeit, Sichtbarkeit, Doppler
// ============================================================================

/** Einweg-Signallaufzeit über eine Strecke in Sekunden. */
export function propagationDelay(distanceM: number): number {
  return safeDivide(distanceM, SPEED_OF_LIGHT, NaN);
}

/**
 * Umlaufzeit des Signals (Erdfunkstelle → Satellit → Erdfunkstelle) in
 * Sekunden. Für einen geostationären Satelliten im Zenit sind das rund 239 ms.
 */
export function roundTripDelay(altitudeM: number, elevationDeg = 90): number {
  return 2 * propagationDelay(slantRange(altitudeM, elevationDeg));
}

/**
 * Dauer eines Überflugs in Sekunden — die Zeit, in der der Satellit über dem
 * Mindestelevationswinkel steht.
 *
 * Annahme: bester Fall eines zentralen Überflugs durch den Zenit, Erddrehung
 * vernachlässigt. Ein realer Überflug in Randlage dauert kürzer.
 */
export function visibilityDuration(
  altitudeM: number,
  minElevationDeg: number = DEFAULT_MIN_ELEVATION_DEG
): number {
  const gamma = centralAngle(altitudeM, minElevationDeg);
  const period = orbitalPeriod(altitudeM);
  if (!Number.isFinite(gamma) || !Number.isFinite(period)) return NaN;
  return period * safeDivide(2 * gamma, FULL_CIRCLE_DEG, NaN);
}

/**
 * Größtmögliche Dopplerverschiebung in Hz: Δf = f · v / c.
 *
 * Annahme: obere Schranke. Sie wird nur erreicht, wenn sich der Satellit exakt
 * radial zur Erdfunkstelle bewegt; beim Aufgang am Horizont ist die radiale
 * Geschwindigkeit etwas kleiner als die Bahngeschwindigkeit.
 */
export function maxDopplerShift(frequencyHz: number, altitudeM: number): number {
  const v = orbitalVelocity(altitudeM);
  if (!Number.isFinite(v)) return NaN;
  return frequencyHz * safeDivide(v, SPEED_OF_LIGHT, NaN);
}

/**
 * Antennengüte G/T in dB/K aus Gewinn und Systemrauschtemperatur.
 * Kennzahl jeder Empfangsstation im Satellitenfunk.
 */
export function figureOfMerit(gainDbi: number, systemNoiseTempK: number): number {
  return gainDbi - 10 * safeLog(systemNoiseTempK, 10, -Infinity);
}

// ============================================================================
// Zusammenfassung für die Anzeige
// ============================================================================

/** Alle abgeleiteten Größen einer Kreisbahn auf einen Blick. */
export interface OrbitSummary {
  altitudeM: number;
  radiusM: number;
  periodS: number;
  velocityMs: number;
  slantRangeM: number;
  oneWayDelayS: number;
  roundTripDelayS: number;
  centralAngleDeg: number;
  footprintRadiusM: number;
  coverageFraction: number;
  visibilityDurationS: number;
}

/** Berechnet alle Bahngrößen zu Höhe und Mindestelevation. */
export function summarizeOrbit(
  altitudeM: number,
  minElevationDeg: number = DEFAULT_MIN_ELEVATION_DEG
): OrbitSummary {
  const slant = slantRange(altitudeM, minElevationDeg);
  const oneWay = propagationDelay(slant);
  return {
    altitudeM,
    radiusM: orbitRadius(altitudeM),
    periodS: orbitalPeriod(altitudeM),
    velocityMs: orbitalVelocity(altitudeM),
    slantRangeM: slant,
    oneWayDelayS: oneWay,
    roundTripDelayS: 2 * oneWay,
    centralAngleDeg: centralAngle(altitudeM, minElevationDeg),
    footprintRadiusM: footprintRadius(altitudeM, minElevationDeg),
    coverageFraction: coverageFraction(altitudeM, minElevationDeg),
    visibilityDurationS: visibilityDuration(altitudeM, minElevationDeg)
  };
}
