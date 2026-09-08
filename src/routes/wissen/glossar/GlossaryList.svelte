<script lang="ts">
  /**
   * Liste der Glossarbegriffe, nach Anfangsbuchstaben gruppiert.
   *
   * Jeder Begriff trägt eine Anker-ID (`#dbm`) und ist damit direkt
   * verlinkbar; die Verweise zeigen auf Rechner, Kapitel oder andere Begriffe.
   */
  import Badge from '$lib/components/ui/Badge.svelte';
  import { findNode } from '$lib/data/navigation';
  import {
    categoryLabel,
    findGlossaryEntry,
    groupByLetter,
    type GlossaryEntry
  } from '$lib/data/glossary';

  interface Props {
    entries: GlossaryEntry[];
  }

  let { entries }: Props = $props();

  let groups = $derived(groupByLetter(entries));

  /** Beschriftung eines Verweises: Seitentitel oder Begriff des Ankers. */
  function relatedLabel(href: string): string {
    if (href.startsWith('#')) {
      return findGlossaryEntry(href.slice(1))?.term ?? href.slice(1);
    }
    return findNode(href)?.label ?? href;
  }
</script>

{#if entries.length === 0}
  <p class="glossary__empty">
    Kein Begriff passt zu dieser Suche. Andere Schreibweise probieren oder den
    Filter zurücksetzen.
  </p>
{:else}
  {#each groups as group (group.letter)}
    <section class="glossary__group" aria-labelledby="buchstabe-{group.letter}">
      <h2 class="glossary__letter" id="buchstabe-{group.letter}">{group.letter}</h2>
      <dl class="glossary__list">
        {#each group.entries as entry (entry.id)}
          <div class="glossary__entry" id={entry.id}>
            <dt class="glossary__term">
              <a class="glossary__anchor" href="#{entry.id}" aria-label="Link zu {entry.term}">
                {entry.term}
              </a>
              <Badge tone="neutral" size="sm">{categoryLabel(entry.category)}</Badge>
              {#if entry.unit}
                <span class="glossary__unit">Einheit: {entry.unit}</span>
              {/if}
            </dt>
            <dd class="glossary__body">
              <p class="glossary__short">{entry.short}</p>
              {#if entry.long}
                <p class="glossary__long">{entry.long}</p>
              {/if}
              {#if entry.formula}
                <p class="glossary__formula">{entry.formula}</p>
              {/if}
              {#if entry.related.length > 0}
                <p class="glossary__related">
                  <span class="glossary__related-label">Verwandt:</span>
                  {#each entry.related as href, index (href)}
                    <a {href}>{relatedLabel(href)}</a
                    >{#if index < entry.related.length - 1}<span aria-hidden="true">·</span>{/if}
                  {/each}
                </p>
              {/if}
              {#if entry.source}
                <p class="glossary__source">Quelle: {entry.source}</p>
              {/if}
            </dd>
          </div>
        {/each}
      </dl>
    </section>
  {/each}
{/if}

<style>
  .glossary__empty {
    color: var(--color-ink-muted);
  }

  .glossary__group {
    margin-bottom: 2rem;
  }

  .glossary__letter {
    margin: 0 0 0.75rem;
    padding-bottom: 0.25rem;
    border-bottom: 2px solid var(--color-line);
    font-family: var(--font-mono);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-brand-ink);
    scroll-margin-top: 5rem;
  }

  .glossary__list {
    display: grid;
    gap: 1rem;
    margin: 0;
  }

  .glossary__entry {
    padding: 0.875rem 1rem;
    background-color: var(--color-surface);
    border: 1px solid var(--color-line-subtle);
    border-radius: var(--radius-lg);
    scroll-margin-top: 5rem;
  }

  .glossary__entry:target {
    border-color: var(--color-brand);
  }

  .glossary__term {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .glossary__anchor {
    color: inherit;
    text-decoration: none;
  }

  .glossary__anchor:hover {
    text-decoration: underline;
  }

  .glossary__unit {
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-normal);
    color: var(--color-ink-subtle);
  }

  .glossary__body {
    margin: 0.375rem 0 0;
  }

  .glossary__short,
  .glossary__long {
    margin: 0 0 0.5rem;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--color-ink-muted);
  }

  .glossary__formula {
    margin: 0 0 0.5rem;
    padding: 0.375rem 0.625rem;
    background-color: var(--color-sunken);
    border-radius: var(--radius-control);
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
    color: var(--color-ink);
    overflow-x: auto;
  }

  .glossary__related {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin: 0;
    font-size: var(--font-size-xs);
  }

  .glossary__related-label {
    color: var(--color-ink-subtle);
  }

  .glossary__source {
    margin: 0.375rem 0 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }
</style>
