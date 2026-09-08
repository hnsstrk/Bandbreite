<script lang="ts">
  /**
   * Trefferliste der Suchseite: erst der Frequenz-Modus (Aktionen und passende
   * Bänder), dann die Ergebnisgruppen als Listen mit eigener Überschrift.
   */
  import Icon from '$lib/components/ui/Icon.svelte';
  import { formatFrequency } from '$lib/utils/formatting';
  import { slugify } from '$lib/utils/slug';
  import type { FrequencyResult, SearchPageGroup } from './searchPage';

  interface Props {
    groups: SearchPageGroup[];
    /** Erkannte Frequenz mit Aktionen, sonst null */
    frequency: FrequencyResult | null;
  }

  let { groups, frequency }: Props = $props();

  const frequencyLabel = $derived(
    frequency
      ? `${formatFrequency(frequency.parsed.hz, 3)}${frequency.parsed.assumedUnit ? ' (MHz angenommen)' : ''}`
      : ''
  );
</script>

{#if frequency}
  <section class="group" aria-labelledby="gruppe-frequenz">
    <h2 class="group__title" id="gruppe-frequenz">Frequenz {frequencyLabel}</h2>
    <ul class="group__list">
      {#each frequency.actions as action (action.id)}
        <li>
          <a class="hit" href={action.href}>
            <span class="hit__label">{action.label}</span>
            {#if action.sublabel}<span class="hit__sub">{action.sublabel}</span>{/if}
          </a>
        </li>
      {/each}
    </ul>
    {#if frequency.matches.length > 0}
      <h3 class="group__subtitle">Bänder und Dienste in diesem Bereich</h3>
      <ul class="group__list">
        {#each frequency.matches as entry (entry.id)}
          <li>
            <a class="hit" href={entry.href}>
              <span class="hit__label">{entry.title}</span>
              {#if entry.subtitle}<span class="hit__sub">{entry.subtitle}</span>{/if}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/if}

{#each groups as group (group.type)}
  {@const headingId = `gruppe-${slugify(group.label)}`}
  <section class="group" aria-labelledby={headingId}>
    <h2 class="group__title" id={headingId}>
      {group.label}
      <span class="group__count">{group.entries.length}</span>
    </h2>
    <ul class="group__list">
      {#each group.entries as entry (entry.id)}
        <li>
          <a class="hit" href={entry.href}>
            <span class="hit__label">
              {entry.title}
              <Icon name="chevron-right" size={16} />
            </span>
            {#if entry.subtitle}<span class="hit__sub">{entry.subtitle}</span>{/if}
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/each}

<style>
  .group {
    margin-bottom: 2rem;
  }

  .group__title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.5rem;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .group__subtitle {
    margin: 1rem 0 0.5rem;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink-muted);
  }

  .group__count {
    padding: 0.0625rem 0.5rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink-subtle);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-full);
  }

  .group__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .hit {
    display: block;
    height: 100%;
    padding: 0.625rem 0.75rem;
    text-decoration: none;
    background-color: var(--color-surface);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-control);
  }

  .hit:hover {
    border-color: var(--color-brand);
    background-color: var(--color-hover);
  }

  .hit__label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink);
  }

  .hit__sub {
    display: block;
    margin-top: 0.125rem;
    font-size: var(--font-size-xs);
    line-height: var(--line-height-normal);
    color: var(--color-ink-subtle);
  }
</style>
