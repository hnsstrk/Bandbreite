<script lang="ts">
  /**
   * Kartenraster für gleichrangige Begriffe (Radartypen, Ausbreitungsmodi, Schichten).
   * Die Kartentitel sind Überschriften eine Ebene unter dem umgebenden Abschnitt.
   */
  import type { CardsBlock } from '$lib/content/types';

  interface Props {
    block: CardsBlock;
    /** Überschriftenebene der Kartentitel */
    level: 3 | 4;
  }

  let { block, level }: Props = $props();
</script>

<ul class="cards cards--{block.columns ?? 2}">
  {#each block.items as item (item.title)}
    <li class="card-item">
      <svelte:element this={`h${level}`} class="card-item__title">{item.title}</svelte:element>
      {#if item.subtitle}
        <p class="card-item__subtitle">{item.subtitle}</p>
      {/if}
      {#if item.html}
        <p class="card-item__text">{@html item.html}</p>
      {/if}
      {#if item.facts?.length}
        <dl class="card-item__facts">
          {#each item.facts as fact (fact.label)}
            <div class="card-item__fact">
              <dt>{fact.label}</dt>
              <dd>{@html fact.value}</dd>
            </div>
          {/each}
        </dl>
      {/if}
      {#if item.points?.length}
        <ul class="card-item__points">
          {#each item.points as point (point)}
            <li>{@html point}</li>
          {/each}
        </ul>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .cards {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0.875rem;
    list-style: none;
    margin: 1.25rem 0;
    padding: 0;
  }

  @media (min-width: 640px) {
    .cards--2,
    .cards--3 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .cards--3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .card-item {
    padding: 0.875rem 1rem;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-control);
    background-color: var(--color-surface);
  }

  .card-item__title {
    margin: 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .card-item__subtitle {
    margin: 0.125rem 0 0;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .card-item__text {
    margin: 0.5rem 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
    line-height: var(--line-height-relaxed);
  }

  .card-item__facts {
    margin: 0.625rem 0 0;
    display: grid;
    gap: 0.25rem;
    font-size: var(--font-size-xs);
  }

  .card-item__fact {
    display: grid;
    grid-template-columns: 7rem minmax(0, 1fr);
    gap: 0.5rem;
  }

  .card-item__fact dt {
    color: var(--color-ink-subtle);
  }

  .card-item__fact dd {
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-mono);
  }

  .card-item__points {
    margin: 0.625rem 0 0;
    padding-left: 1.125rem;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
  }

  .card-item__points li + li {
    margin-top: 0.25rem;
  }
</style>
