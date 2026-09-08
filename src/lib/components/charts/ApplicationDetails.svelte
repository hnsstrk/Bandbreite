<script lang="ts">
  /** Auswahlliste und Detailtafel der Frequenzbelegung. */
  import { CATEGORY_NAMES, type RFApplication } from '$lib/data/applications';
  import { formatFrequencyRange } from '$lib/data/bands';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { CATEGORY_TOKENS } from './applicationOverlayData';

  interface Props {
    applications: RFApplication[];
    selectedId: string | null;
    onselect: (id: string | null) => void;
  }

  let { applications, selectedId, onselect }: Props = $props();

  let selected = $derived(applications.find((app) => app.id === selectedId) ?? null);

  function handleEntryClick(app: RFApplication) {
    onselect(selectedId === app.id ? null : app.id);
  }
</script>

<ul class="ao-list" aria-label="Dienste zur Auswahl">
  {#each applications as app (app.id)}
    <li>
      <button
        type="button"
        class="ao-entry"
        class:is-selected={selectedId === app.id}
        aria-pressed={selectedId === app.id}
        onclick={() => handleEntryClick(app)}
      >
        <span
          class="ao-swatch"
          style="background: {CATEGORY_TOKENS[app.category]}"
          aria-hidden="true"
        ></span>
        <span class="ao-name">{app.nameDE}</span>
        <span class="ao-range">{formatFrequencyRange(app.minHz, app.maxHz)}</span>
      </button>
    </li>
  {/each}
  {#if applications.length === 0}
    <li class="ao-empty">Keine Dienste in den gew\u00e4hlten Kategorien.</li>
  {/if}
</ul>

{#if selected}
  <Card
    title={selected.nameDE}
    subtitle={formatFrequencyRange(selected.minHz, selected.maxHz)}
    level={3}
    tone="sunken"
  >
    {#snippet actions()}
      <Button
        size="sm"
        variant="ghost"
        iconOnly
        icon="close"
        label="Auswahl aufheben"
        onclick={() => onselect(null)}
      />
    {/snippet}

    <p class="ao-description">{selected.descriptionDE}</p>

    <dl class="ao-meta">
      <div>
        <dt>Kategorie</dt>
        <dd>{CATEGORY_NAMES[selected.category].nameDE}</dd>
      </div>
      {#if selected.region}
        <div><dt>Region</dt><dd>{selected.region}</dd></div>
      {/if}
      {#if selected.standard}
        <div><dt>Standard</dt><dd>{selected.standard}</dd></div>
      {/if}
      {#if selected.notes}
        <div><dt>Hinweis</dt><dd>{selected.notes}</dd></div>
      {/if}
    </dl>
  </Card>
{:else}
  <p class="ao-hint">
    {applications.length} Dienste sichtbar. Ein Klick auf einen Eintrag zeigt die Einzelheiten.
    \u00dcberlappungen sind normal \u2014 B\u00e4nder werden oft prim\u00e4r und sekund\u00e4r zugewiesen oder regional
    unterschiedlich genutzt.
  </p>
{/if}

<style>
  .ao-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
    max-height: 18rem;
    overflow-y: auto;
  }

  .ao-entry {
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

  .ao-entry:hover {
    background: var(--color-hover);
  }

  .ao-entry.is-selected {
    background: var(--color-info-soft);
    border-color: var(--color-brand);
    color: var(--color-ink);
  }

  .ao-swatch {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 2px;
    display: inline-block;
    flex: none;
  }

  .ao-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ao-range {
    font-family: var(--font-mono);
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
    flex: none;
  }

  .ao-empty,
  .ao-hint {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }

  .ao-description {
    margin: 0 0 0.75rem 0;
    color: var(--color-ink-muted);
    line-height: var(--line-height-relaxed);
  }

  .ao-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
    gap: 0.75rem;
    margin: 0;
  }

  .ao-meta dt {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .ao-meta dd {
    margin: 0;
    color: var(--color-ink);
  }
</style>
