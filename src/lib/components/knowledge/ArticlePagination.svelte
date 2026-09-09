<script lang="ts">
  /**
   * Vorheriges/nächstes Kapitel innerhalb desselben Hubs, abgeleitet aus dem
   * Navigationsbaum (`getSiblings`/`getParent` in $lib/data/navigation).
   * Geplante Seiten werden übersprungen.
   */
  import { getParent, getSiblings, findNode, type NavNode } from '$lib/data/navigation';
  import Icon from '$lib/components/ui/Icon.svelte';

  interface Props {
    href: string;
  }

  let { href }: Props = $props();

  const neighbours = $derived.by(() => {
    const current = findNode(href);
    const parent = getParent(href);
    const siblings = getSiblings(href);
    if (!current || !parent) return { prev: undefined, next: undefined } as { prev?: NavNode; next?: NavNode };
    const ordered = (parent.children ?? []).filter(
      (node) => node.status === 'live' && (node.href === current.href || siblings.includes(node))
    );
    const index = ordered.findIndex((node) => node.href === current.href);
    return {
      prev: index > 0 ? ordered[index - 1] : undefined,
      next: index >= 0 ? ordered[index + 1] : undefined
    };
  });
</script>

{#if neighbours.prev || neighbours.next}
  <nav class="pagination" aria-label="Kapitelnavigation">
    {#if neighbours.prev}
      <a class="pagination__link pagination__link--prev" href={neighbours.prev.href}>
        <Icon name="chevron-left" size={18} />
        <span class="pagination__text">
          <span class="pagination__kicker">Vorheriges Kapitel</span>
          <span class="pagination__label">{neighbours.prev.label}</span>
        </span>
      </a>
    {:else}
      <span></span>
    {/if}
    {#if neighbours.next}
      <a class="pagination__link pagination__link--next" href={neighbours.next.href}>
        <span class="pagination__text">
          <span class="pagination__kicker">Nächstes Kapitel</span>
          <span class="pagination__label">{neighbours.next.label}</span>
        </span>
        <Icon name="chevron-right" size={18} />
      </a>
    {/if}
  </nav>
{/if}

<style>
  /* Schlichte Textlinks, durch eine Linie vom Kapitel getrennt. */
  .pagination {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 1.25rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-line-subtle);
  }

  .pagination__link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0;
    border: 0;
    background: none;
    color: var(--color-brand);
    text-decoration: none;
    font-size: var(--font-size-sm);
  }

  .pagination__link:hover {
    text-decoration: underline;
  }

  .pagination__link--next {
    justify-content: flex-end;
    text-align: right;
  }

  .pagination__text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .pagination__kicker {
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .pagination__label {
    font-weight: var(--font-weight-normal);
  }
</style>
