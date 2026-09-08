/**
 * Bedienmodell und Szenenfarben des Wellenausbreitungs-Diagramms.
 *
 * Die fachlichen Daten (Modi, Schichten, Sprungzone) stehen in
 * `data/propagation.ts`; hier liegt nur, wie sie bedient und eingefärbt werden.
 */

import { LAYER_VISUALIZATIONS, PROPAGATION_MODES } from '$lib/data/propagation';

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
