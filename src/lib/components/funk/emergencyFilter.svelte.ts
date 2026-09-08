/**
 * Filter- und Anzeigelogik der Not- und Sicherheitsfrequenzen.
 *
 * Die Tabelle auf `/wissen/funktechnik/notfrequenzen/` ist eine reine
 * Nachschlagehilfe; die Logik hier bestimmt, was zu einer Sucheingabe passt und
 * wie eine Frequenzangabe lesbar wird.
 */

import {
  EMERGENCY_FREQUENCIES,
  type EmergencyDomain,
  type EmergencyFrequency,
  type EmergencyPurpose
} from '$lib/data/emergencyFrequencies';
import { formatFrequency } from '$lib/utils/formatting';
import { formatFrequencyRange } from '$lib/data/bands';

/** Anzeigetexte der Fachbereiche. */
export const DOMAIN_LABELS: Record<EmergencyDomain, string> = {
  see: 'Seefunk',
  luft: 'Flugfunk',
  land: 'Landfunk und BOS',
  satellit: 'Satellitengestützt',
  amateur: 'Amateurfunk',
  jedermann: 'Jedermannfunk'
};

/** Anzeigetexte der Einsatzzwecke. */
export const PURPOSE_LABELS: Record<EmergencyPurpose, string> = {
  notruf: 'Notruf',
  anruf: 'Anruf und Verkehrsaufnahme',
  sicherheit: 'Sicherheit und Warnung',
  ortung: 'Ortung und Peilung',
  ueberwachung: 'Überwachung',
  historisch: 'historisch'
};

/** Filterzustand der Tabelle. */
export interface EmergencyFilter {
  domain: EmergencyDomain | 'alle';
  purpose: EmergencyPurpose | 'alle';
  query: string;
}

/** Leerer Filter — zeigt alle Einträge. */
export const EMPTY_EMERGENCY_FILTER: EmergencyFilter = {
  domain: 'alle',
  purpose: 'alle',
  query: ''
};

/** Lesbare Frequenzangabe: Einzelfrequenz, Kanalliste oder Bereich. */
export function frequencyLabel(entry: EmergencyFrequency): string {
  if (entry.channelsHz && entry.channelsHz.length > 0) {
    return entry.channelsHz.map((hz) => formatFrequency(hz, hz < 1e6 ? 1 : 3)).join(' · ');
  }
  if (entry.frequencyMaxHz && entry.frequencyMaxHz > entry.frequencyHz) {
    return formatFrequencyRange(entry.frequencyHz, entry.frequencyMaxHz);
  }
  return formatFrequency(entry.frequencyHz, entry.frequencyHz < 1e6 ? 1 : 3);
}

/** Sortierschlüssel: die niedrigste beteiligte Frequenz. */
export function sortKeyHz(entry: EmergencyFrequency): number {
  if (entry.channelsHz && entry.channelsHz.length > 0) return Math.min(...entry.channelsHz);
  return entry.frequencyHz;
}

/** Trifft der Suchbegriff auf den Eintrag zu? */
export function matchesQuery(entry: EmergencyFrequency, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) return true;
  const haystack = [
    entry.nameDE,
    entry.descriptionDE,
    entry.modulationDE,
    entry.source,
    DOMAIN_LABELS[entry.domain],
    PURPOSE_LABELS[entry.purpose],
    frequencyLabel(entry)
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

/** Gefilterte und nach Frequenz sortierte Einträge. */
export function filterEmergency(
  filter: EmergencyFilter,
  entries: EmergencyFrequency[] = EMERGENCY_FREQUENCIES
): EmergencyFrequency[] {
  return entries
    .filter((entry) => filter.domain === 'alle' || entry.domain === filter.domain)
    .filter((entry) => filter.purpose === 'alle' || entry.purpose === filter.purpose)
    .filter((entry) => matchesQuery(entry, filter.query))
    .sort((a, b) => sortKeyHz(a) - sortKeyHz(b));
}

/** Bereiche mit Anzahl der Einträge, für die Filterauswahl. */
export function domainCounts(
  entries: EmergencyFrequency[] = EMERGENCY_FREQUENCIES
): { id: EmergencyDomain; label: string; count: number }[] {
  const order = Object.keys(DOMAIN_LABELS) as EmergencyDomain[];
  return order
    .map((id) => ({
      id,
      label: DOMAIN_LABELS[id],
      count: entries.filter((entry) => entry.domain === id).length
    }))
    .filter((domain) => domain.count > 0);
}
