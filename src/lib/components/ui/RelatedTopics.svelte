<script lang="ts">
  import { getRelatedTopics } from '$lib/data/relations';

  interface Props {
    /** Pfad der aktuellen Seite. */
    href: string;
    /** Überschrift der Liste. */
    title?: string;
    /** Höchstzahl der Einträge. */
    max?: number;
  }

  let { href, title = 'Verwandte Themen', max = 6 }: Props = $props();

  const topics = $derived(getRelatedTopics(href, { max }));
</script>

{#if topics.length > 0}
  <section class="related" aria-labelledby="verwandte-themen">
    <h2 class="related__title" id="verwandte-themen">{title}</h2>
    <ul class="related__list">
      {#each topics as topic (topic.node.id)}
        <li class="related__row">
          <a class="related__link" href={topic.node.href}>{topic.node.label}</a>
          <span class="related__reason">{topic.reason}</span>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  /* Überschrift plus Linkliste mit Trennlinien — keine Karten. */
  .related {
    margin-top: 1rem;
  }

  .related__title {
    margin: 0 0 0.25rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink-subtle);
  }

  .related__list {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--color-line-subtle);
  }

  .related__row {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 0 0.5rem;
    padding: 0.25rem 0;
    border-bottom: 1px solid var(--color-line-subtle);
  }

  .related__link {
    font-size: var(--font-size-sm);
    color: var(--color-brand);
    text-decoration: none;
  }

  .related__link:hover {
    text-decoration: underline;
  }

  .related__reason {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }
</style>
