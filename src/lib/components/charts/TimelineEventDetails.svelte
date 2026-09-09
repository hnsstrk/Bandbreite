<script lang="ts">
  /** Auswahlliste und Detailtafel des Zeitstrahls. */
  import { CATEGORY_CONFIG, HISTORICAL_EVENTS, type HistoricalEvent } from '$lib/data/history';
  import { formatFrequency } from '$lib/utils/formatting';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { CATEGORY_TOKENS, SIGNIFICANCE_LABELS } from './timelineData';

  interface Props {
    events: HistoricalEvent[];
    selectedId: string | null;
    onselect: (id: string | null) => void;
  }

  let { events, selectedId, onselect }: Props = $props();

  let selected = $derived(events.find((event) => event.id === selectedId) ?? null);

  function frequencyText(event: HistoricalEvent): string | null {
    if (!event.frequencyHz) return null;
    return event.frequencyHzMax
      ? `${formatFrequency(event.frequencyHz)} – ${formatFrequency(event.frequencyHzMax)}`
      : formatFrequency(event.frequencyHz);
  }

  function handleEntryClick(event: HistoricalEvent) {
    onselect(selectedId === event.id ? null : event.id);
  }
</script>

<ul class="tl-list" aria-label="Ereignisse zur Auswahl">
  {#each events as event (event.id)}
    <li>
      <button
        type="button"
        class="tl-entry"
        class:is-selected={selectedId === event.id}
        aria-pressed={selectedId === event.id}
        onclick={() => handleEntryClick(event)}
      >
        <span class="tl-year">{event.year}</span>
        <span class="tl-swatch" style="background: {CATEGORY_TOKENS[event.category]}" aria-hidden="true"></span>
        <span class="tl-title">{event.titleDE}</span>
      </button>
    </li>
  {/each}
  {#if events.length === 0}
    <li class="tl-empty">Keine Ereignisse in den gewählten Kategorien.</li>
  {/if}
</ul>

{#if selected}
  <Card
    title="{selected.year} · {selected.titleDE}"
    subtitle={CATEGORY_CONFIG[selected.category].nameDE}
    level={3}
    tone="sunken"
  >
    {#snippet actions()}
      <Button size="sm" variant="ghost" iconOnly icon="close" label="Auswahl aufheben" onclick={() => onselect(null)} />
    {/snippet}

    <p class="tl-description">{selected.descriptionDE}</p>

    <dl class="tl-meta">
      {#if selected.person}
        <div>
          <dt>Person</dt>
          <dd>{selected.person}</dd>
        </div>
      {/if}
      {#if selected.location}
        <div>
          <dt>Ort</dt>
          <dd>{selected.location}</dd>
        </div>
      {/if}
      {#if frequencyText(selected)}
        <div>
          <dt>Frequenz</dt>
          <dd>{frequencyText(selected)}</dd>
        </div>
      {/if}
      <div>
        <dt>Bedeutung</dt>
        <dd>
          <Badge tone={selected.significance === 'major' ? 'brand' : 'neutral'}>
            {SIGNIFICANCE_LABELS[selected.significance]}
          </Badge>
        </dd>
      </div>
    </dl>
  </Card>
{:else}
  <p class="tl-hint">
    {events.length} von {HISTORICAL_EVENTS.length} Ereignissen sichtbar. Ein Klick auf einen Eintrag zeigt die Einzelheiten.
  </p>
{/if}

<style>
  .tl-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 18rem;
    overflow-y: auto;
  }

  .tl-entry {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.375rem 0.5rem;
    text-align: left;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-control);
    cursor: pointer;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
  }

  .tl-entry:hover {
    background: var(--color-hover);
  }

  .tl-entry.is-selected {
    background: var(--color-info-soft);
    border-color: var(--color-brand);
    color: var(--color-ink);
  }

  .tl-year {
    font-family: var(--font-mono);
    color: var(--color-ink-subtle);
    flex: none;
  }

  .tl-swatch {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: var(--radius-pill);
    display: inline-block;
    flex: none;
  }

  .tl-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tl-empty,
  .tl-hint {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }

  .tl-description {
    margin: 0 0 0.75rem 0;
    color: var(--color-ink-muted);
    line-height: var(--line-height-relaxed);
  }

  .tl-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
    gap: 0.75rem;
    margin: 0;
  }

  .tl-meta dt {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .tl-meta dd {
    margin: 0;
    color: var(--color-ink);
  }
</style>
