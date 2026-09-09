/**
 * Bedienmodell und Szenenfarben des Wellenausbreitungs-Diagramms.
 *
 * Die fachlichen Daten (Modi, Schichten, Sprungzone) stehen in
 * `data/propagation.ts`; hier liegt nur, wie sie bedient und eingefärbt werden.
 */

import {
  calculateSkipDistanceForFrequency,
  estimateGroundWaveRangeKm,
  FOF2_PRESETS,
  LAYER_VISUALIZATIONS,
  losDistanceKm,
  maxSingleHopDistanceKm,
  PROPAGATION_MODES,
  SKIP_ZONE_PARAMS
} from '$lib/data/propagation';

/** Höhe des dargestellten Ausschnitts in Kilometern. */
export const MAX_ALTITUDE_KM = 450;

/** Höhenmarken der linken Achse. */
export const ALTITUDE_TICKS_KM = [100, 200, 300, 400] as const;

/** Frequenzbereich des Reglers in Megahertz. */
export const FREQUENCY_MIN_MHZ = 0.03;
export const FREQUENCY_MAX_MHZ = 3000;

/** Anzahl der Sterne im Nachthimmel. */
export const STAR_COUNT = 30;

/** Auswahl der Ausbreitungsmodi. */
export const MODE_OPTIONS = [
  { id: 'ground-wave', label: 'Bodenwelle', hint: 'LF und MF, folgt der Erdoberfläche' },
  { id: 'sky-wave', label: 'Raumwelle', hint: 'HF, Reflexion an der Ionosphäre' },
  { id: 'line-of-sight', label: 'Sichtverbindung', hint: 'VHF und UHF, direkter Weg' },
  { id: 'sporadic-e', label: 'Sporadische E', hint: 'VHF-Überreichweiten' }
];

/** Tag- und Nachtauswahl. */
export const TIME_OPTIONS = [
  { value: 'day', label: 'Tag' },
  { value: 'night', label: 'Nacht' }
];

/** Zusammengefasste F-Schicht der Nacht. */
export const NIGHT_F_LAYER = {
  id: 'f-layer-night',
  name: 'F-Schicht',
  altitudeMinKm: 150,
  altitudeMaxKm: 400,
  fillColor: 'var(--color-series-1)',
  fillOpacity: 0.3,
  strokeColor: 'var(--color-series-1)',
  opacity: 0.8
};

/** Empfohlener Modus zur eingestellten Frequenz. */
export function recommendedMode(frequencyMHz: number): string {
  const hz = frequencyMHz * 1e6;
  if (hz < 3e6) return 'ground-wave';
  if (hz <= 30e6) return 'sky-wave';
  if (hz <= 150e6) return 'sporadic-e';
  return 'line-of-sight';
}

/** Findet den ausgewählten Modus, mit Raumwelle als Rückfall. */
export function modeById(id: string) {
  return PROPAGATION_MODES.find((mode) => mode.id === id) ?? PROPAGATION_MODES[1];
}

/** Sichtbare Ionosphärenschichten je Tageszeit. */
export function visibleLayers(isNight: boolean) {
  return LAYER_VISUALIZATIONS.filter((layer) => {
    if (!isNight) return layer.dayOpacity > 0;
    // Nachts verschwindet die D-Schicht, F1 verschmilzt mit F2.
    if (layer.id === 'd-layer' || layer.id === 'f1-layer') return false;
    return layer.nightOpacity > 0;
  });
}

/** Rechnet eine Höhe in eine Y-Koordinate der Zeichenfläche um. */
export function altitudeToY(altitudeKm: number, chartHeight: number): number {
  return chartHeight - 60 - (altitudeKm / MAX_ALTITUDE_KM) * (chartHeight - 80);
}

/** Kürzt eine Eigenschaft für die Legende. */
export function shortCharacteristic(text: string): string {
  return text.length > 30 ? `${text.slice(0, 28)}…` : text;
}

// ============================================================================
// Entfernungsmodell der Szene
// ============================================================================

/** Höhe der sporadischen E-Schicht in km (ITU-R P.534). */
export const SPORADIC_E_ALTITUDE_KM = 110;

/**
 * Antennenhöhen der Sichtverbindung in Metern.
 * Annahme: 30 m Sendemast, 10 m Empfangsantenne — dieselben Werte wie im
 * Ausbreitungs-Sandkasten (`PROPAGATION_LIMITS`).
 */
export const LOS_ANTENNA_HEIGHT_M = { tx: 30, rx: 10 } as const;

/** Sicherheitsabstand am rechten Rand: die Strecke füllt 80 % der Achse. */
const SPAN_FACTOR = 1.25;

export interface WaveDistances {
  /** Dargestellte Streckenlänge der Entfernungsachse in km */
  spanKm: number;
  /** Entfernung des Empfängers in km */
  rxKm: number;
  /** Reichweite der Bodenwelle in km (Faustregel) */
  groundWaveKm: number;
  /**
   * Erster Aufsetzpunkt der Raumwelle in km:
   * 0 = auch Steilstrahlung wird reflektiert (f ≤ foF2, keine tote Zone),
   * null = keine Reflexion (f über der MUF).
   */
  skipKm: number | null;
  /** Reflexionshöhe der F-Schicht in km */
  reflectionHeightKm: number;
  /** Kritische Frequenz foF2 in MHz */
  foF2MHz: number;
  /** Radiohorizont beider Antennen in km */
  losKm: number;
}

/**
 * Alle Entfernungen der Szene aus dem Modell in `$lib/data/propagation`:
 * Bodenwellenreichweite, Sprungdistanz, Radiohorizont und der größte
 * Einfachsprung an der sporadischen E-Schicht.
 */
export function sceneDistances(
  modeId: string,
  frequencyMHz: number,
  isNight: boolean
): WaveDistances {
  const reflectionHeightKm = isNight
    ? SKIP_ZONE_PARAMS.reflectionHeightKm.night
    : SKIP_ZONE_PARAMS.reflectionHeightKm.day;
  const foF2MHz = isNight ? FOF2_PRESETS.night : FOF2_PRESETS.day;
  const groundWaveKm = estimateGroundWaveRangeKm(frequencyMHz * 1e6);
  const skipKm = calculateSkipDistanceForFrequency(frequencyMHz, foF2MHz, reflectionHeightKm);
  const losKm = losDistanceKm(LOS_ANTENNA_HEIGHT_M.tx, LOS_ANTENNA_HEIGHT_M.rx);
  const maxHopKm = maxSingleHopDistanceKm(reflectionHeightKm);

  let rxKm: number;
  if (modeId === 'ground-wave') rxKm = groundWaveKm;
  else if (modeId === 'line-of-sight') rxKm = losKm;
  else if (modeId === 'sporadic-e') rxKm = maxSingleHopDistanceKm(SPORADIC_E_ALTITUDE_KM);
  // Raumwelle: bis zum ersten Aufsetzpunkt; ohne tote Zone bis zum größten Einfachsprung
  else rxKm = skipKm && skipKm > 0 ? skipKm : maxHopKm;

  return {
    spanKm: Math.max(rxKm * SPAN_FACTOR, 1),
    rxKm,
    groundWaveKm,
    skipKm,
    reflectionHeightKm,
    foF2MHz,
    losKm
  };
}

/** Rechnet eine Entfernung in eine X-Koordinate der Zeichenfläche um. */
export function distanceToX(distanceKm: number, spanKm: number, chartWidth: number): number {
  if (!(spanKm > 0)) return 0;
  return (distanceKm / spanKm) * chartWidth;
}

/** Erlaubte Schrittweiten der Entfernungsachse (1-2-5-Folge). */
const TICK_STEPS = [1, 2, 5];
/** Angestrebte Zahl der Marken auf der Entfernungsachse. */
const TICK_TARGET = 5;

/** Marken der Entfernungsachse in km, gerundet auf die 1-2-5-Folge. */
export function distanceTicks(spanKm: number): number[] {
  if (!(spanKm > 0)) return [0];
  const raw = spanKm / TICK_TARGET;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = (TICK_STEPS.find((factor) => factor * magnitude >= raw) ?? 10) * magnitude;
  const ticks: number[] = [];
  for (let value = 0; value <= spanKm + step / 2; value += step) {
    if (value <= spanKm) ticks.push(Math.round(value * 1000) / 1000);
  }
  return ticks;
}
