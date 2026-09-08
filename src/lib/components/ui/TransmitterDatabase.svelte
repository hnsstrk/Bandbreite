<script lang="ts">
  /**
   * Durchsuchbare Senderdatenbank mit Filtern, Sortierung und Detailtafel.
   *
   * Filter- und Sortierlogik liegen in `transmitterDatabase.svelte.ts`,
   * die Detailtafel in `TransmitterDetails.svelte`.
   */
  import {
    ALL_TRANSMITTERS,
    type Transmitter,
    type TransmitterSubtype
  } from '$lib/data/transmitters';
  import { formatFrequency, formatPowerWatts } from '$lib/utils/formatting';
  import Badge from './Badge.svelte';
  import Button from './Button.svelte';
  import Card from './Card.svelte';
  import TransmitterDetails from './TransmitterDetails.svelte';
  import TransmitterFilters from './TransmitterFilters.svelte';
  import {
    STATUS_CONFIG,
    TYPE_COLORS,
    filterTransmitters,
    type GroupFilter,
    type SortKey
  } from './transmitterDatabase.svelte';

  interface Props {
    onSelectFrequency?: (hz: number) => void;
  }

  let { onSelectFrequency }: Props = $props();

  let query = $state('');
  let group = $state<GroupFilter>('all');
  let subtype = $state<'all' | TransmitterSubtype>('all');
  let sortKey = $state<SortKey>('frequency');
  let ascending = $state(true);
  let onlyActive = $state(false);
  let selectedId = $state<string | null>(null);

  let filtered = $derived(
    filterTransmitters({ query, group, subtype, onlyActive, sortKey, ascending })
  );

  let selected = $derived(filtered.find((t) => t.id === selectedId) ?? null);

  function handleRowClick(transmitter: Transmitter) {
    selectedId = selectedId === transmitter.id ? null : transmitter.id;
  }

  function handleResetClick() {
    query = '';
    group = 'all';
    subtype = 'all';
    sortKey = 'frequency';
    ascending = true;
    onlyActive = false;
    selectedId = null;
  }

</script>

<Card title="Senderdatenbank" subtitle="{ALL_TRANSMITTERS.length} Einträge" icon="database">
  {#snippet actions()}
    <Button size="sm" variant="ghost" icon="reset" onclick={handleResetClick}>
      Filter zurücksetzen
    </Button>
  {/snippet}

  <div class="txdb">
    <TransmitterFilters
      bind:query
      bind:group
      bind:subtype
      bind:sortKey
      bind:ascending
      bind:onlyActive
      visibleCount={filtered.length}
    />

    <ul class="txdb__list">
      {#each filtered as transmitter (transmitter.id)}
        <li>
          <button
            type="button"
            class="txdb__row"
            class:is-selected={selectedId === transmitter.id}
            aria-pressed={selectedId === transmitter.id}
            onclick={() => handleRowClick(transmitter)}
          >
            <span
              class="txdb__dot"
              style="background-color: {TYPE_COLORS[transmitter.type]}"
              aria-hidden="true"
            ></span>
            <span class="txdb__identity">
              <span class="txdb__name">{transmitter.nameDE}</span>
              <span class="txdb__place">
                {transmitter.location.name}, {transmitter.location.country}
              </span>
            </span>
            <span class="txdb__numbers">
              <span class="txdb__frequency">{formatFrequency(transmitter.frequencyHz)}</span>
              {#if transmitter.powerWatts}
                <span class="txdb__power">{formatPowerWatts(transmitter.powerWatts, 1)}</span>
              {/if}
            </span>
            <Badge tone={STATUS_CONFIG[transmitter.status].tone} dot srPrefix="Status">
              {STATUS_CONFIG[transmitter.status].label}
            </Badge>
          </button>
        </li>
      {/each}

      {#if filtered.length === 0}
        <li class="txdb__empty">Keine Sender gefunden. Filter zurücksetzen oder Suche ändern.</li>
      {/if}
    </ul>

    {#if selected}
      <TransmitterDetails
        transmitter={selected}
        onclose={() => (selectedId = null)}
        {onSelectFrequency}
      />
    {/if}

    <p class="txdb__footnote">
      Diese Datenbank dient Bildungszwecken. Aktuelle Frequenzen und Parameter können abweichen;
      das Feld „Zuletzt geprüft" nennt den Stand des jeweiligen Eintrags.
    </p>
  </div>
</Card>

<style>
  .txdb {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .txdb__list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 28rem;
    overflow-y: auto;
  }

  .txdb__row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.625rem 0.75rem;
    text-align: left;
    background: var(--color-sunken);
    border: 1px solid transparent;
    border-radius: var(--radius-control);
    cursor: pointer;
  }

  .txdb__row:hover {
    background: var(--color-hover);
  }

  .txdb__row.is-selected {
    background: var(--color-info-soft);
    border-color: var(--color-brand);
  }

  .txdb__dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: var(--radius-pill);
    flex: none;
  }

  .txdb__identity {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }

  .txdb__name {
    font-weight: var(--font-weight-medium);
    color: var(--color-ink);
  }

  .txdb__place {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .txdb__numbers {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
  }

  .txdb__power {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .txdb__empty {
    padding: 2rem;
    text-align: center;
    color: var(--color-ink-subtle);
  }

  .txdb__footnote {
    margin: 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }
</style>
