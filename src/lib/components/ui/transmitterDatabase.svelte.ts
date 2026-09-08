/**
 * Filter-, Sortier- und Beschriftungslogik der Senderdatenbank.
 *
 * Ausgelagert aus `TransmitterDatabase.svelte`, damit die Komponente unter
 * 300 Zeilen bleibt und die Logik ohne DOM prüfbar ist.
 */

import {
  ALL_TRANSMITTERS,
  SCIENCE_TRANSMITTERS,
  searchTransmitters,
  type Transmitter,
  type TransmitterStatus,
  type TransmitterSubtype,
  type TransmitterType
} from '$lib/data/transmitters';

/** Farbe je Sendertyp — ausschließlich Serien-Tokens. */
export const TYPE_COLORS: Record<TransmitterType, string> = {
  time_signal: 'var(--color-series-1)',
  broadcast_lw: 'var(--color-series-6)',
  broadcast_mw: 'var(--color-series-3)',
  broadcast_sw: 'var(--color-series-7)',
  broadcast_fm: 'var(--color-series-2)',
  navigation: 'var(--color-series-5)',
  amateur: 'var(--color-series-9)',
  utility: 'var(--color-series-8)'
};

/** Ton und Beschriftung je Betriebszustand. */
export const STATUS_CONFIG: Record<
  TransmitterStatus,
  { tone: 'success' | 'danger' | 'neutral'; label: string }
> = {
  active: { tone: 'success', label: 'Aktiv' },
  inactive: { tone: 'danger', label: 'Inaktiv' },
  unknown: { tone: 'neutral', label: 'Unbekannt' }
};

/** Deutsche Namen der feineren Einordnung. */
export const SUBTYPE_LABELS: Record<TransmitterSubtype, string> = {
  military_vlf: 'Militärische Längstwelle',
  radar: 'Radaranlage',
  gnss: 'Satellitennavigation',
  deep_space: 'Boden–Weltraum',
  research: 'Forschung und Empfang'
};

/** Art der Leistungsangabe — klärt, worauf sich `powerWatts` bezieht. */
export const POWER_TYPE_LABELS = {
  tx: 'Senderausgangsleistung',
  erp: 'ERP, bezogen auf den Halbwellendipol',
  eirp: 'EIRP, isotrop bezogen'
} as const;

/** IDs der Forschungsanlagen — sie tragen denselben Typ wie Utility-Stationen. */
export const SCIENCE_IDS = new Set(SCIENCE_TRANSMITTERS.map((entry) => entry.id));

/** Auswahl im Typfilter: einzelner Typ oder eine der beiden Datengruppen. */
export type GroupFilter = 'all' | TransmitterType | 'group:utility' | 'group:science';

/** Sortierschlüssel der Liste. */
export type SortKey = 'frequency' | 'name' | 'power' | 'country';

export const SORT_OPTIONS = [
  { value: 'frequency', label: 'Frequenz' },
  { value: 'name', label: 'Name' },
  { value: 'power', label: 'Sendeleistung' },
  { value: 'country', label: 'Land' }
];

/** Alle im Datenbestand vorkommenden Typen. */
export const AVAILABLE_TYPES = [...new Set(ALL_TRANSMITTERS.map((t) => t.type))];

/** Alle vorkommenden Einordnungen. */
export const AVAILABLE_SUBTYPES = [
  ...new Set(ALL_TRANSMITTERS.map((t) => t.subtype).filter(Boolean))
] as TransmitterSubtype[];

/** Prüft, ob ein Sender in die gewählte Gruppe fällt. */
export function matchesGroup(transmitter: Transmitter, filter: GroupFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'group:science') return SCIENCE_IDS.has(transmitter.id);
  if (filter === 'group:utility') {
    return transmitter.type === 'utility' && !SCIENCE_IDS.has(transmitter.id);
  }
  return transmitter.type === filter;
}

/** Vergleichsfunktion zum gewählten Sortierschlüssel. */
export function compareBy(key: SortKey) {
  return (a: Transmitter, b: Transmitter): number => {
    switch (key) {
      case 'name':
        return a.nameDE.localeCompare(b.nameDE, 'de');
      case 'power':
        return (a.powerWatts ?? -1) - (b.powerWatts ?? -1);
      case 'country':
        return (
          a.location.country.localeCompare(b.location.country, 'de') ||
          a.frequencyHz - b.frequencyHz
        );
      default:
        return a.frequencyHz - b.frequencyHz;
    }
  };
}

/** Zustand aller Filter. */
export interface FilterState {
  query: string;
  group: GroupFilter;
  subtype: 'all' | TransmitterSubtype;
  onlyActive: boolean;
  sortKey: SortKey;
  ascending: boolean;
}

/** Wendet Suche, Filter und Sortierung an. */
export function filterTransmitters(state: FilterState): Transmitter[] {
  const base = state.query.trim() ? searchTransmitters(state.query) : ALL_TRANSMITTERS;
  const result = base.filter(
    (transmitter) =>
      matchesGroup(transmitter, state.group) &&
      (state.subtype === 'all' || transmitter.subtype === state.subtype) &&
      (!state.onlyActive || transmitter.status === 'active')
  );
  const sorted = [...result].sort(compareBy(state.sortKey));
  return state.ascending ? sorted : sorted.reverse();
}

/** Monatsnamen für die Anzeige des Prüfstands. */
const MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember'
];

/** „2025-11" wird zu „November 2025". */
export function formatVerified(value: string | undefined): string | null {
  if (!value) return null;
  const [year, month] = value.split('-');
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : value;
}
