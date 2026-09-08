<script lang="ts">
  /** Filter- und Sortierleiste der Senderdatenbank. */
  import { ALL_TRANSMITTERS, SCIENCE_TRANSMITTERS, TYPE_NAMES, type TransmitterSubtype } from '$lib/data/transmitters';
  import Button from './Button.svelte';
  import Select from './Select.svelte';
  import {
    AVAILABLE_SUBTYPES,
    AVAILABLE_TYPES,
    SCIENCE_IDS,
    SORT_OPTIONS,
    SUBTYPE_LABELS,
    type GroupFilter,
    type SortKey
  } from './transmitterDatabase.svelte';

  interface Props {
    query: string;
    group: GroupFilter;
    subtype: 'all' | TransmitterSubtype;
    sortKey: SortKey;
    ascending: boolean;
    onlyActive: boolean;
    /** Anzahl der aktuell sichtbaren Sender */
    visibleCount: number;
  }

  let {
    query = $bindable(),
    group = $bindable(),
    subtype = $bindable(),
    sortKey = $bindable(),
    ascending = $bindable(),
    onlyActive = $bindable(),
    visibleCount
  }: Props = $props();

  const utilityCount = ALL_TRANSMITTERS.filter(
    (t) => t.type === 'utility' && !SCIENCE_IDS.has(t.id)
  ).length;

  const GROUP_OPTIONS = [
    { value: 'all', label: `Alle Typen (${ALL_TRANSMITTERS.length})` },
    ...AVAILABLE_TYPES.map((type) => ({
      value: type,
      label: `${TYPE_NAMES[type].nameDE} (${ALL_TRANSMITTERS.filter((t) => t.type === type).length})`,
      group: 'Sendertyp'
    })),
    { value: 'group:utility', label: `Utility ohne Forschung (${utilityCount})`, group: 'Gruppe' },
    {
      value: 'group:science',
      label: `Forschung und Radioastronomie (${SCIENCE_TRANSMITTERS.length})`,
      group: 'Gruppe'
    }
  ];

  const SUBTYPE_OPTIONS = [
    { value: 'all', label: 'Alle Einordnungen' },
    ...AVAILABLE_SUBTYPES.map((entry) => ({
      value: entry,
      label: `${SUBTYPE_LABELS[entry]} (${ALL_TRANSMITTERS.filter((t) => t.subtype === entry).length})`
    }))
  ];

  function handleGroupChange(value: string) {
    group = value as GroupFilter;
  }

  function handleSubtypeChange(value: string) {
    subtype = value as 'all' | TransmitterSubtype;
  }

  function handleSortChange(value: string) {
    sortKey = value as SortKey;
  }

  function handleDirectionClick() {
    ascending = !ascending;
  }

  function handleActiveClick() {
    onlyActive = !onlyActive;
  }
</script>

<div class="tf">
  <div class="tf__field">
    <label class="tf__label" for="transmitter-search">Suche</label>
    <input
      id="transmitter-search"
      type="search"
      bind:value={query}
      class="input-field"
      placeholder="Name, Standort oder Land"
    />
  </div>

  <Select label="Typ" value={group} options={GROUP_OPTIONS} onchange={handleGroupChange} />
  <Select
    label="Einordnung"
    value={subtype}
    options={SUBTYPE_OPTIONS}
    onchange={handleSubtypeChange}
  />
  <Select label="Sortierung" value={sortKey} options={SORT_OPTIONS} onchange={handleSortChange} />
</div>

<div class="tf__toggles">
  <Button
    size="sm"
    variant={ascending ? 'ghost' : 'secondary'}
    pressed={!ascending}
    icon="chevron-down"
    onclick={handleDirectionClick}
  >
    {ascending ? 'Aufsteigend' : 'Absteigend'}
  </Button>
  <Button
    size="sm"
    variant={onlyActive ? 'primary' : 'ghost'}
    pressed={onlyActive}
    icon="filter"
    onclick={handleActiveClick}
  >
    Nur aktive Sender
  </Button>
  <span class="tf__count" role="status" aria-live="polite">
    {visibleCount} von {ALL_TRANSMITTERS.length} Sendern
  </span>
</div>

<style>
  .tf {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 13rem), 1fr));
    gap: 1rem;
  }

  .tf__field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .tf__label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink-muted);
  }

  .tf__toggles {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .tf__count {
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
    margin-inline-start: auto;
  }
</style>
