<script lang="ts">
  import { getRelatedTopics } from '$lib/data/relations';

  interface Props {
    /** Pfad der aktuellen Seite. */
    href: string;
    /** Überschrift der Kartenreihe. */
    title?: string;
    /** Höchstzahl der Karten. */
    max?: number;
  }

  let { href, title = 'Verwandte Themen', max = 6 }: Props = $props();

  const topics = $derived(getRelatedTopics(href, { max }));
</script>

{#if topics.length > 0}
  <section class="related card" aria-labelledby="verwandte-themen">
    <h2 class="text-heading-2" id="verwandte-themen">{title}</h2>
    <ul class="related-grid">
      {#each topics as topic (topic.node.id)}
        <li>
          <a class="related-card" href={topic.node.href}>
            <span class="related-title">{topic.node.label}</span>
            <span class="related-reason">{topic.reason}</span>
            <span class="related-arrow" aria-hidden="true">→</span>
          </a>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
    gap: 0.75rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .related-card {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 0.25rem 0.75rem;
    height: 100%;
    padding: 0.875rem 1rem;
    background-color: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    text-decoration: none;
    transition:
      border-color var(--transition-fast),
      transform var(--transition-fast);
  }

  .related-card:hover {
    border-color: var(--color-accent-primary);
    transform: translateY(-2px);
  }

  .related-title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .related-reason {
    grid-column: 1;
    font-size: var(--font-size-xs);
    line-height: 1.4;
    color: var(--color-text-secondary);
  }

  .related-arrow {
    grid-row: 1 / span 2;
    grid-column: 2;
    color: var(--color-text-muted);
    transition: transform var(--transition-fast);
  }

  .related-card:hover .related-arrow {
    transform: translateX(3px);
    color: var(--color-accent-primary);
  }
</style>
