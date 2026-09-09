<script lang="ts">
  import { NAV_TREE, findNode, type NavNode } from '$lib/data/navigation';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';

  const hub = findNode('/service/sitemap/');
  const tree = NAV_TREE;

  function countPlanned(nodes: NavNode[]): number {
    return nodes.reduce(
      (sum, node) => sum + (node.status === 'geplant' ? 1 : 0) + countPlanned(node.children ?? []),
      0
    );
  }

  function countAll(nodes: NavNode[]): number {
    return nodes.reduce((sum, node) => sum + 1 + countAll(node.children ?? []), 0);
  }

  const total = countAll(tree);
  const planned = countPlanned(tree);
</script>

{#snippet branch(nodes: NavNode[])}
  <ul class="sitemap-list">
    {#each nodes as node (node.id)}
      <li>
        {#if node.status === 'geplant'}
          <span class="sitemap-entry planned">
            {node.label}
            <span class="sitemap-badge">geplant</span>
          </span>
        {:else}
          <a class="sitemap-entry" href={node.href}>{node.label}</a>
        {/if}
        {#if node.description}
          <p class="sitemap-desc">{node.description}</p>
        {/if}
        {#if node.children?.length}
          {@render branch(node.children)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Sitemap</h1>
    <p class="header-description">{hub?.description}</p>
    <p class="sitemap-stats">
      {total} Einträge insgesamt, davon {planned} noch in Vorbereitung.
    </p>
  </header>

  <nav class="card" aria-label="Vollständige Seitenübersicht">
    {@render branch(tree)}
  </nav>

  <RelatedTopics href="/service/sitemap/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0 1rem;
  }

  .header-description {
    max-width: 65ch;
    margin-top: 0.5rem;
    font-size: var(--font-size-base);
    line-height: var(--line-height-relaxed);
    color: var(--color-text-secondary);
  }

  .sitemap-stats {
    margin-top: 0.25rem;
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
  }

  .sitemap-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .sitemap-list .sitemap-list {
    margin-left: 1rem;
    padding-left: 0.75rem;
    border-left: 1px solid var(--color-border-default);
  }

  .sitemap-list li {
    margin: 0.5rem 0;
  }

  .sitemap-entry {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-accent);
    text-decoration: none;
  }

  a.sitemap-entry:hover {
    text-decoration: underline;
  }

  .sitemap-entry.planned {
    color: var(--color-text-disabled);
    font-weight: var(--font-weight-normal);
  }

  .sitemap-badge {
    padding: 0.0625rem 0.5rem;
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-full);
  }

  .sitemap-desc {
    margin: 0.125rem 0 0 0;
    max-width: 70ch;
    font-size: var(--font-size-xs);
    line-height: 1.5;
    color: var(--color-text-tertiary);
  }
</style>
