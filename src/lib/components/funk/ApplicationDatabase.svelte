<script lang="ts">
  /**
   * Durchsuchbare Datenbank der Frequenzzuweisungen.
   *
   * Volltextsuche, Kategoriefilter, Frequenzfenster und Sortierung. Eine
   * Zeile ist eine Schaltfläche; die Auswahl öffnet die Detailtafel darunter.
   */
  import { untrack } from 'svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import NumberInput from '$lib/components/ui/NumberInput.svelte';
  import { ALL_APPLICATIONS, CATEGORY_NAMES } from '$lib/data/applications';
  import type { ApplicationCategory } from '$lib/data/applications';
  import { FREQUENCY_UNITS } from '$lib/data/units';
  import { formatFrequency } from '$lib/utils/formatting';
  import { formatFrequencyRange } from '$lib/data/bands';
  import ApplicationDetailPanel from './ApplicationDetailPanel.svelte';
  import { categoryCounts, queryApplications, widthHz, type SortKey } from './applicationFilter.svelte';

  interface Props {
    /** Vorbelegter Suchbegriff, etwa aus `?q=` eines Deep-Links */
    initialQuery?: string;
    /** Eintrag, dessen Detailtafel sofort offen sein soll */
    initialSelectedId?: string | null;
  }

  let { initialQuery = '', initialSelectedId = null }: Props = $props();

  // `untrack`: die Startwerte werden einmal übernommen. Ändert sich der
  // Deep-Link, baut die Seite die Datenbank per `{#key}` ohnehin neu auf.
  let query = $state(untrack(() => initialQuery));
  let category = $state('alle');
  let minHz = $state(0);
  let minUnit = $state('MHz');
  let maxHz = $state(0);
  let maxUnit = $state('MHz');
  let sortKey = $state<SortKey>('frequenz');
  let sortDir = $state<'asc' | 'desc'>('asc');
  let selectedId = $state<string | null>(untrack(() => initialSelectedId));

  const searchId = $props.id();

  const categoryOptions = [
    { value: 'alle', label: `Alle Kategorien (${ALL_APPLICATIONS.length})` },
    ...categoryCounts().map((entry) => ({
      value: entry.id,
      label: `${entry.label} (${entry.count})`
    }))
  ];

  const sortOptions: { value: SortKey; label: string }[] = [
    { value: 'frequenz', label: 'Frequenz' },
    { value: 'name', label: 'Bezeichnung' },
    { value: 'kategorie', label: 'Kategorie' },
    { value: 'breite', label: 'Bandbreite' }
  ];

  const rows = $derived(
    queryApplications({ query, category: category as ApplicationCategory | 'alle', minHz, maxHz }, sortKey, sortDir)
  );
  const selected = $derived(rows.find((app) => app.id === selectedId) ?? null);

  function reset() {
    query = '';
    category = 'alle';
    minHz = 0;
    maxHz = 0;
    sortKey = 'frequenz';
    sortDir = 'asc';
    selectedId = null;
  }
</script>

<section class="appdb" aria-label="Frequenzzuweisungen durchsuchen">
  <div class="filters">
    <div class="field">
      <label for={searchId}>Suche</label>
      <input id={searchId} type="search" bind:value={query} placeholder="z. B. WLAN, Radar, GSM" autocomplete="off" />
    </div>
    <Select label="Kategorie" bind:value={category} options={categoryOptions} />
    <NumberInput
      label="Von Frequenz"
      bind:value={minHz}
      bind:unit={minUnit}
      units={FREQUENCY_UNITS}
      min={0}
      hint="0 lässt die Untergrenze offen"
    />
    <NumberInput
      label="Bis Frequenz"
      bind:value={maxHz}
      bind:unit={maxUnit}
      units={FREQUENCY_UNITS}
      min={0}
      hint="0 lässt die Obergrenze offen"
    />
    <Select
      label="Sortieren nach"
      bind:value={() => sortKey as string, (next: string) => (sortKey = next as SortKey)}
      options={sortOptions.map((option) => ({ value: option.value, label: option.label }))}
    />
    <div class="field field--action">
      <Button
        icon="filter"
        onclick={() => (sortDir = sortDir === 'asc' ? 'desc' : 'asc')}
        title="Sortierrichtung umkehren"
      >
        {sortDir === 'asc' ? 'aufsteigend' : 'absteigend'}
      </Button>
      <Button icon="reset" variant="ghost" onclick={reset}>Zurücksetzen</Button>
    </div>
  </div>

  <p class="count" role="status">
    {rows.length} von {ALL_APPLICATIONS.length}
    {rows.length === 1 ? 'Eintrag' : 'Einträgen'}
  </p>

  {#if selected}
    <ApplicationDetailPanel application={selected} />
  {/if}

  <ul class="rows">
    {#each rows as app (app.id)}
      <li>
        <button
          type="button"
          class="row"
          class:row--selected={selectedId === app.id}
          aria-pressed={selectedId === app.id}
          onclick={() => (selectedId = selectedId === app.id ? null : app.id)}
        >
          <span class="row__name">{app.nameDE}</span>
          <span class="row__range">{formatFrequencyRange(app.minHz, app.maxHz)}</span>
          <span class="row__meta">{CATEGORY_NAMES[app.category]?.nameDE ?? app.category}</span>
          <span class="row__meta row__meta--right">{formatFrequency(widthHz(app), 0)} breit</span>
        </button>
      </li>
    {/each}
  </ul>

  {#if rows.length === 0}
    <p class="empty">Kein Eintrag passt zu dieser Auswahl. Suchbegriff kürzen oder das Frequenzfenster erweitern.</p>
  {/if}
</section>

<style>
  .appdb {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
    gap: 0.5rem 0.75rem;
    align-items: end;
    margin: 0;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .field--action {
    flex-direction: row;
    align-items: flex-end;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  label {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink);
  }

  input {
    min-height: 2.25rem;
    padding: 0.25rem 0.5rem;
    font-size: var(--font-size-sm);
    color: var(--color-ink);
    background-color: var(--color-input);
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-control);
  }

  .count {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
    border-top: 1px solid var(--color-line-subtle);
  }

  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0 0.75rem;
    width: 100%;
    padding: 0.25rem 0.25rem;
    text-align: left;
    background-color: transparent;
    border: 0;
    border-bottom: 1px solid var(--color-line-subtle);
    cursor: pointer;
  }

  .row:hover {
    background-color: var(--color-hover);
  }

  .row--selected {
    background-color: var(--color-brand-soft);
  }

  .row__name {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink);
  }

  .row__range {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
  }

  .row__meta {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .row__meta--right {
    text-align: right;
  }

  .empty {
    margin: 0.75rem 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }

  @media (min-width: 48rem) {
    .row {
      grid-template-columns: minmax(0, 2fr) minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 0.8fr);
      align-items: baseline;
    }

    .row__meta--right {
      text-align: left;
    }
  }
</style>
