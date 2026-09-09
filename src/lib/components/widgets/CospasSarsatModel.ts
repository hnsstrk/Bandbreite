/**
 * Rechenmodell des Widgets „Rettungskette Cospas-Sarsat".
 *
 * Eine 406-MHz-Bake (EPIRB auf See, ELT im Luftfahrzeug, PLB an der Person)
 * sendet kurze, kodierte Impulse. Satelliten nehmen sie auf, geben sie an eine
 * Bodenstation (LUT) weiter, von dort laufen Alarm und Position über ein
 * Mission Control Centre (MCC) zur zuständigen Rettungsleitstelle (RCC) und
 * schließlich zur Rettungseinheit.
 *
 * Berechnet werden nur Größen, die aus Bahnhöhe und Frequenz folgen:
 * Umlaufzeit, Signallaufzeit und die Dopplerverschiebung, aus der die
 * LEOSAR-Ortung überhaupt erst entsteht. Bahnmechanik aus
 * `$lib/utils/orbitMath` — nicht dupliziert.
 *
 * **Zeiten:** Die Kette hat keine allgemeingültige Dauer. Belegt sind nur die
 * Systemanforderung an MEOSAR (unabhängige Ortung binnen 10 min auf 5 km, in
 * 95 % der Fälle) und die Tatsache, dass LEOSAR auf einen Überflug warten
 * muss — ein Umlauf dauert rund 100 Minuten. Alles andere ist in der Grafik
 * als *schematisch* gekennzeichnet und trägt keine Zeitachse.
 *
 * Quellen:
 * - Cospas-Sarsat C/S T.001 — 406-MHz-Bakenspezifikation (Frequenzbereich,
 *   Impulsdauer, Sendeabstand, Nachrichtenlänge)
 * - Cospas-Sarsat System Description / C/S R.012 — Systemaufbau LEOSAR,
 *   GEOSAR, MEOSAR mit LUT, MCC und RCC; MEOSAR-Ortungsanforderung
 * - ITU RR Appendix 15 und ITU-R M.633 — 406,0–406,1 MHz für Notfunkbaken,
 *   121,5 MHz als Peilfrequenz
 * - Bahnhöhen: Galileo, GPS und Glonass tragen die MEOSAR-Nutzlasten
 */

import { SPEED_OF_LIGHT } from '$lib/data/constants';
import { maxDopplerShift, orbitalPeriod, propagationDelay } from '$lib/utils/orbitMath';
import { safeDivide } from '$lib/utils/handlers';

// ============================================================================
// Bake
// ============================================================================

/** Unteres Ende des Bakenbereichs in Hz (C/S T.001). */
export const BEACON_MIN_HZ = 406.0e6;
/** Oberes Ende des Bakenbereichs in Hz. */
export const BEACON_MAX_HZ = 406.1e6;
/** Peilfrequenz für die letzten Kilometer in Hz. */
export const HOMING_FREQUENCY_HZ = 121.5e6;
/** Mittlerer Abstand zweier Aussendungen in s (mit Zufallsanteil). */
export const BEACON_BURST_INTERVAL_S = 50;
/** Dauer einer Aussendung mit kurzer Nachricht (112 Bit) in s. */
export const BEACON_BURST_SHORT_S = 0.44;
/** Dauer einer Aussendung mit langer Nachricht (144 Bit) in s. */
export const BEACON_BURST_LONG_S = 0.52;
/** Nennsendeleistung einer 406-MHz-Bake in W. */
export const BEACON_POWER_W = 5;

/** Breite des Bakenbereichs in Hz. */
export function beaconBandwidthHz(): number {
  return BEACON_MAX_HZ - BEACON_MIN_HZ;
}

/** Zahl der Aussendungen je Stunde beim gegebenen Sendeabstand. */
export function burstsPerHour(intervalS: number = BEACON_BURST_INTERVAL_S): number {
  return safeDivide(3600, intervalS, 0);
}

/** Tastverhältnis der Bake: Sendedauer je Sendeabstand, 0 … 1. */
export function beaconDutyCycle(
  burstS: number = BEACON_BURST_SHORT_S,
  intervalS: number = BEACON_BURST_INTERVAL_S
): number {
  return safeDivide(burstS, intervalS, 0);
}

// ============================================================================
// Satellitensegmente
// ============================================================================

/** Die drei Satellitensegmente des Systems. */
export type SarSegment = 'leosar' | 'meosar' | 'geosar';

/** Eigenschaften eines Segments. */
export interface SegmentInfo {
  id: SarSegment;
  label: string;
  /** Bahnhöhe in m */
  altitudeM: number;
  /** Trägersysteme der Nutzlast */
  carriersDE: string;
  /** Wie die Position entsteht */
  locationDE: string;
  /** Was das für die Wartezeit bedeutet */
  latencyDE: string;
  source: string;
}

/**
 * Bahnhöhen: LEOSAR rund 850 km (Sonnensynchron- und Polarbahnen), MEOSAR auf
 * den Navigationssatelliten (Galileo 23 222 km — hier als Bezug genommen),
 * GEOSAR im geostationären Ring.
 */
export const SAR_SEGMENTS: Record<SarSegment, SegmentInfo> = {
  leosar: {
    id: 'leosar',
    label: 'LEOSAR — niedrige Umlaufbahn',
    altitudeM: 850_000,
    carriersDE: 'polare Wettersatelliten, rund 850 km Bahnhöhe',
    locationDE:
      'Ortung über die Dopplerverschiebung: Der Satellit misst, wie sich die empfangene ' +
      'Frequenz während des Überflugs verschiebt, und rechnet daraus die Position der Bake.',
    latencyDE:
      'Die Bake wird erst gehört, wenn ein Satellit über ihr steht — ein Umlauf dauert rund ' +
      '100 Minuten. Im Speicherbetrieb kommt die Wartezeit bis zur nächsten Bodenstation hinzu.',
    source: 'Cospas-Sarsat System Description; C/S T.001'
  },
  meosar: {
    id: 'meosar',
    label: 'MEOSAR — mittlere Umlaufbahn',
    altitudeM: 23_222_000,
    carriersDE: 'Nutzlasten auf Galileo, GPS und Glonass',
    locationDE:
      'Mehrere Satelliten hören dieselbe Aussendung gleichzeitig. Aus Laufzeit- und ' +
      'Frequenzunterschieden zwischen ihnen entsteht die Position — schon aus einer einzigen ' +
      'Aussendung.',
    latencyDE:
      'Nahezu durchgehende Sicht: Die Aussendung wird ohne Zwischenspeicherung weitergereicht. ' +
      'Die Systemanforderung nennt eine unabhängige Ortung binnen 10 Minuten auf 5 km genau, ' +
      'in 95 % der Fälle.',
    source: 'Cospas-Sarsat MEOSAR-Systemanforderung; C/S R.012'
  },
  geosar: {
    id: 'geosar',
    label: 'GEOSAR — geostationär',
    altitudeM: 35_786_000,
    carriersDE: 'geostationäre Wettersatelliten',
    locationDE:
      'Keine Dopplerortung — der Satellit steht still über dem Äquator. Eine Position gibt es ' +
      'nur, wenn die Bake ihre eigene Satellitennavigationsposition mitsendet.',
    latencyDE:
      'Der Alarm ist sofort da, weil der Satellit dauerhaft in Sicht ist. Ohne mitgesendete ' +
      'Position weiß die Leitstelle jedoch nur, wer ruft — nicht wo.',
    source: 'Cospas-Sarsat System Description'
  }
};

/** Anforderung an die MEOSAR-Ortung: Radius in m. */
export const MEOSAR_LOCATION_RADIUS_M = 5000;
/** Anforderung an die MEOSAR-Ortung: Zeitspanne in s. */
export const MEOSAR_LOCATION_TIME_S = 600;
/** Anforderung an die MEOSAR-Ortung: Erfüllungsgrad, 0 … 1. */
export const MEOSAR_LOCATION_CONFIDENCE = 0.95;

/** Umlaufzeit des Segments in s (geostationär: ein siderischer Tag). */
export function segmentPeriodS(segment: SarSegment): number {
  return orbitalPeriod(SAR_SEGMENTS[segment].altitudeM);
}

/** Einfache Signallaufzeit Bake → Satellit im Zenit, in s. */
export function segmentUplinkDelayS(segment: SarSegment): number {
  return propagationDelay(SAR_SEGMENTS[segment].altitudeM);
}

/**
 * Obere Schranke der Dopplerverschiebung auf 406 MHz: f · v / c mit der
 * Bahngeschwindigkeit des Segments. Nur LEOSAR nutzt sie zur Ortung.
 */
export function segmentDopplerHz(segment: SarSegment, frequencyHz: number = BEACON_MIN_HZ): number {
  return maxDopplerShift(frequencyHz, SAR_SEGMENTS[segment].altitudeM);
}

/** Weglänge Bake → Satellit im Zenit in m (Kontrollgröße zur Laufzeit). */
export function segmentZenithRangeM(segment: SarSegment): number {
  return segmentUplinkDelayS(segment) * SPEED_OF_LIGHT;
}

// ============================================================================
// Rettungskette
// ============================================================================

/** Ein Glied der Rettungskette. */
export interface RescueStep {
  id: string;
  label: string;
  /** Ausgeschriebene Bezeichnung */
  fullNameDE: string;
  /** Kurzform für die schmale Beschriftung in der Grafik */
  shortDE: string;
  detailDE: string;
  /** Schematischer Anteil an der Darstellung — **keine Zeitangabe** */
  weight: number;
}

/**
 * Die sechs Glieder von der Bake bis zur Rettungseinheit. `weight` steuert
 * nur die Bildbreite und den Ablauf der Animation.
 */
export const RESCUE_STEPS: RescueStep[] = [
  {
    id: 'bake',
    label: 'Bake',
    fullNameDE: 'EPIRB, ELT oder PLB auf 406 MHz',
    shortDE: 'EPIRB, ELT, PLB',
    detailDE:
      'Die Bake sendet alle rund 50 Sekunden eine knappe halbe Sekunde lang. Die Nachricht ' +
      'enthält die weltweit eindeutige Kennung, den Bakentyp und — sofern vorhanden — die ' +
      'eigene Satellitennavigationsposition.',
    weight: 1
  },
  {
    id: 'satellit',
    label: 'Satellit',
    fullNameDE: 'LEOSAR, MEOSAR oder GEOSAR',
    shortDE: 'LEO, MEO, GEO',
    detailDE:
      'Der Satellit empfängt die Aussendung und gibt sie weiter. Ob dabei eine Position ' +
      'entsteht und wie lange das dauert, hängt allein am Segment.',
    weight: 2
  },
  {
    id: 'lut',
    label: 'LUT',
    fullNameDE: 'Local User Terminal — Bodenstation',
    shortDE: 'Bodenstation',
    detailDE:
      'Die Bodenstation demoduliert die Nachricht und rechnet die Position aus: bei LEOSAR aus ' +
      'dem Dopplerverlauf des Überflugs, bei MEOSAR aus den Messungen mehrerer Satelliten.',
    weight: 1
  },
  {
    id: 'mcc',
    label: 'MCC',
    fullNameDE: 'Mission Control Centre',
    shortDE: 'Kontrollzentrum',
    detailDE:
      'Das nationale Kontrollzentrum prüft die Meldung, schlägt die Bakenkennung in der ' +
      'Registrierungsdatenbank nach und leitet sie an die zuständige Stelle weiter — im Zweifel ' +
      'über die Landesgrenze hinweg an ein anderes MCC.',
    weight: 1
  },
  {
    id: 'rcc',
    label: 'RCC',
    fullNameDE: 'Rescue Coordination Centre — Rettungsleitstelle',
    shortDE: 'Leitstelle',
    detailDE:
      'Die Rettungsleitstelle bewertet die Lage, versucht den Halter zu erreichen und alarmiert ' +
      'die Einheiten. Erst hier wird aus einem Datensatz ein Einsatz.',
    weight: 1
  },
  {
    id: 'sar',
    label: 'SAR-Einheit',
    fullNameDE: 'Seenotrettungskreuzer, Hubschrauber, Bergwacht',
    shortDE: 'Kreuzer, Heli',
    detailDE:
      'Auf den letzten Kilometern peilt die Einheit die Bake auf 121,5 MHz an — dafür, und nur ' +
      'dafür, ist diese Frequenz an der Bake noch vorhanden.',
    weight: 1
  }
];

/** Summe der schematischen Anteile. */
export function totalRescueWeight(steps: RescueStep[] = RESCUE_STEPS): number {
  return steps.reduce((sum, step) => sum + step.weight, 0);
}

/** Anteil 0 … 1, an dem ein Glied beginnt. */
export function rescueStartFraction(index: number, steps: RescueStep[] = RESCUE_STEPS): number {
  const before = steps.slice(0, Math.max(0, index)).reduce((sum, step) => sum + step.weight, 0);
  return safeDivide(before, totalRescueWeight(steps), 0);
}

/** Anteil 0 … 1 der Breite eines Glieds. */
export function rescueFraction(index: number, steps: RescueStep[] = RESCUE_STEPS): number {
  const step = steps[index];
  return step ? safeDivide(step.weight, totalRescueWeight(steps), 0) : 0;
}

/** Welches Glied ist bei einem Fortschritt 0 … 1 aktiv? */
export function rescueStepAtProgress(
  progress: number,
  steps: RescueStep[] = RESCUE_STEPS
): { index: number; localProgress: number } {
  if (!steps.length) return { index: 0, localProgress: 0 };
  const p = Math.min(0.999999, Math.max(0, progress));
  for (let index = 0; index < steps.length; index++) {
    const start = rescueStartFraction(index, steps);
    const width = rescueFraction(index, steps);
    if (p < start + width) {
      return { index, localProgress: width > 0 ? (p - start) / width : 0 };
    }
  }
  return { index: steps.length - 1, localProgress: 1 };
}
