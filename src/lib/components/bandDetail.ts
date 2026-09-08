/**
 * Auswahllogik der Banddetail-Randspalte.
 *
 * Reine Funktionen ohne DOM- und Runes-Bezug, damit `BandDetailSidebar.svelte`
 * nur noch Darstellung enthält und die Regeln (welches Band ist führend, welche
 * Frequenz wird nachgeschlagen, welche Dienste passen) prüfbar bleiben.
 */
import type { FrequencyBand } from '$lib/data/bands';
import {
  ALL_APPLICATIONS,
  getApplicationsForFrequency,
  type RFApplication
} from '$lib/data/applications';

/** Höchstzahl der aufgelisteten Dienste. */
export const MAX_SIDEBAR_APPLICATIONS = 15;

/** Alle Bänder einer Liste, die die Frequenz enthalten. */
export function bandsAt<T extends FrequencyBand>(
  bands: readonly T[],
  frequencyHz: number | null
): T[] {
  if (!frequencyHz || frequencyHz <= 0) return [];
  return bands.filter((band) => frequencyHz >= band.minHz && frequencyHz <= band.maxHz);
}

/**
 * Ein angeklicktes Band gilt nur so lange, wie die eingestellte Frequenz noch
 * darin liegt — sonst hätte die Randspalte einen veralteten Kopf.
 */
export function resolveSelectedBand(
  selectedBand: FrequencyBand | null,
  frequencyHz: number | null
): FrequencyBand | null {
  if (!selectedBand) return null;
  if (frequencyHz && (frequencyHz < selectedBand.minHz || frequencyHz > selectedBand.maxHz))
    return null;
  return selectedBand;
}

/**
 * Nachgeschlagen wird die geometrische Bandmitte, solange ein Band gewählt ist,
 * sonst die eingestellte Frequenz.
 */
export function lookupFrequency(
  effectiveBand: FrequencyBand | null,
  frequencyHz: number | null
): number | null {
  if (effectiveBand) return Math.sqrt(effectiveBand.minHz * effectiveBand.maxHz);
  return frequencyHz;
}

/** Reihenfolge der Kopfzeile: Auswahl vor IEEE vor ITU vor NATO vor zivil. */
export function pickPrimaryBand(candidates: {
  selected: FrequencyBand | null;
  ieee: FrequencyBand[];
  itu: FrequencyBand[];
  nato: FrequencyBand[];
  civilian: FrequencyBand[];
}): FrequencyBand | null {
  return (
    candidates.selected ??
    candidates.ieee[0] ??
    candidates.itu[0] ??
    candidates.nato[0] ??
    candidates.civilian[0] ??
    null
  );
}

/**
 * Dienste eines gewählten Bandes überlappen dessen Bereich; ohne Bandauswahl
 * zählt der Punkttreffer der Frequenz.
 */
export function applicationsFor(
  effectiveBand: FrequencyBand | null,
  lookupFrequencyHz: number | null
): RFApplication[] {
  if (effectiveBand) {
    return ALL_APPLICATIONS.filter(
      (app) => app.minHz < effectiveBand.maxHz && app.maxHz > effectiveBand.minHz
    );
  }
  if (!lookupFrequencyHz || lookupFrequencyHz <= 0) return [];
  return getApplicationsForFrequency(lookupFrequencyHz);
}
