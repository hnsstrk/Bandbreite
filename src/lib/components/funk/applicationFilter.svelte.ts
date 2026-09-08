/**
 * Such-, Filter- und Sortierlogik der Funkdienst-Datenbank.
 *
 * Grundlage sind die Frequenzzuweisungen aus `data/applications.ts`. Die
 * Funktionen sind rein, damit sich Filterkombinationen ohne DOM prüfen lassen.
 */

import {
  ALL_APPLICATIONS,
  CATEGORY_NAMES,
  type ApplicationCategory,
  type RFApplication
} from '$lib/data/applications';
import { IEEE_BANDS, ITU_BANDS } from '$lib/data/bands';
import { frequencyToWavelength } from '$lib/utils/calculations';

/** Sortierschlüssel der Tabelle. */
export type SortKey = 'frequenz' | 'name' | 'kategorie' | 'breite';

/** Filterzustand der Datenbank. */
export interface ApplicationFilter {
  query: string;
  category: ApplicationCategory | 'alle';
  /** Untergrenze des Suchfensters in Hz; 0 bedeutet „offen“. */
  minHz: number;
  /** Obergrenze des Suchfensters in Hz; 0 oder Infinity bedeutet „offen“. */
  maxHz: number;
}

/** Leerer Filter — zeigt alle Einträge. */
export const EMPTY_APPLICATION_FILTER: ApplicationFilter = {
  query: '',
  category: 'alle',
  minHz: 0,
  maxHz: 0
};

/** Anzeigetexte der Regionen. */
export const REGION_LABELS: Record<string, string> = {
  worldwide: 'weltweit',
  europe: 'Europa',
  usa: 'USA',
  asia: 'Asien'
};

/** Kategorien mit deutscher Bezeichnung und Anzahl der Einträge. */
export function categoryCounts(
  applications: RFApplication[] = ALL_APPLICATIONS
): { id: ApplicationCategory; label: string; count: number }[] {
  const ids = Object.keys(CATEGORY_NAMES) as ApplicationCategory[];
  return ids
    .map((id) => ({
      id,
      label: CATEGORY_NAMES[id]?.nameDE ?? id,
      count: applications.filter((app) => app.category === id).length
    }))
    .filter((entry) => entry.count > 0);
}

/** Trifft der Suchbegriff auf den Eintrag zu? */
export function matchesQuery(app: RFApplication, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return true;
  const haystack = [
    // Die ID steht mit im Heuhaufen, damit ein Deep-Link `?q=<id>` aus der
    // Befehlspalette genau diesen Eintrag findet.
    app.id,
    app.nameDE,
    app.name,
    app.descriptionDE,
    app.description,
    app.standard ?? '',
    app.notes ?? '',
    CATEGORY_NAMES[app.category]?.nameDE ?? ''
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

/** Überlappt der Eintrag mit dem eingestellten Frequenzfenster? */
export function matchesRange(app: RFApplication, minHz: number, maxHz: number): boolean {
  const lower = Number.isFinite(minHz) && minHz > 0 ? minHz : 0;
  const upper = Number.isFinite(maxHz) && maxHz > 0 ? maxHz : Number.POSITIVE_INFINITY;
  if (upper < lower) return false;
  return app.maxHz >= lower && app.minHz <= upper;
}

/** Bandbreite eines Eintrags in Hz. */
export function widthHz(app: RFApplication): number {
  return app.maxHz - app.minHz;
}

/** Gefilterte Einträge, noch unsortiert. */
export function filterApplications(
  filter: ApplicationFilter,
  applications: RFApplication[] = ALL_APPLICATIONS
): RFApplication[] {
  return applications
    .filter((app) => filter.category === 'alle' || app.category === filter.category)
    .filter((app) => matchesRange(app, filter.minHz, filter.maxHz))
    .filter((app) => matchesQuery(app, filter.query));
}

/** Sortierung nach Schlüssel und Richtung. */
export function sortApplications(
  applications: RFApplication[],
  key: SortKey,
  direction: 'asc' | 'desc' = 'asc'
): RFApplication[] {
  const factor = direction === 'asc' ? 1 : -1;
  const sorted = [...applications].sort((a, b) => {
    switch (key) {
      case 'name':
        return a.nameDE.localeCompare(b.nameDE, 'de') * factor;
      case 'kategorie': {
        const labelA = CATEGORY_NAMES[a.category]?.nameDE ?? a.category;
        const labelB = CATEGORY_NAMES[b.category]?.nameDE ?? b.category;
        return (labelA.localeCompare(labelB, 'de') || a.minHz - b.minHz) * factor;
      }
      case 'breite':
        return (widthHz(a) - widthHz(b)) * factor;
      default:
        return (a.minHz - b.minHz) * factor;
    }
  });
  return sorted;
}

/** Filtern und Sortieren in einem Schritt. */
export function queryApplications(
  filter: ApplicationFilter,
  key: SortKey = 'frequenz',
  direction: 'asc' | 'desc' = 'asc',
  applications: RFApplication[] = ALL_APPLICATIONS
): RFApplication[] {
  return sortApplications(filterApplications(filter, applications), key, direction);
}

/** Mittenfrequenz eines Eintrags in Hz. */
export function centerHz(app: RFApplication): number {
  return (app.minHz + app.maxHz) / 2;
}

/** Zusatzangaben für die Detailansicht. */
export interface ApplicationDetail {
  centerHz: number;
  wavelengthM: number;
  ituBands: string[];
  ieeeBands: string[];
  categoryLabel: string;
  regionLabel: string;
}

/** ITU- und IEEE-Bandzuordnung, Wellenlänge und Beschriftungen. */
export function applicationDetail(app: RFApplication): ApplicationDetail {
  const overlaps = (min: number, max: number) => app.maxHz >= min && app.minHz <= max;
  return {
    centerHz: centerHz(app),
    wavelengthM: frequencyToWavelength(centerHz(app)),
    ituBands: ITU_BANDS.filter((band) => overlaps(band.minHz, band.maxHz)).map(
      (band) => band.name
    ),
    ieeeBands: IEEE_BANDS.filter((band) => overlaps(band.minHz, band.maxHz)).map(
      (band) => band.name
    ),
    categoryLabel: CATEGORY_NAMES[app.category]?.nameDE ?? app.category,
    regionLabel: app.region ? (REGION_LABELS[app.region] ?? app.region) : 'nicht angegeben'
  };
}
