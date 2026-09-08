<script lang="ts">
  import { getHubChildren, findNode } from '$lib/data/navigation';
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';

  const hub = findNode('/rechner/');
  const items = getHubChildren('/rechner/');
</script>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Rechner</h1>
    <p class="header-description">{hub?.description}</p>
  </header>

  <ul class="hub-grid">
    {#each items as item (item.id)}
      <li>
        {#if item.status === 'geplant'}
          <div class="hub-card planned">
            <h2>{item.label}</h2>
            <p>{item.description}</p>
            <span class="hub-badge">geplant</span>
          </div>
        {:else}
          <a class="hub-card" href={item.href}>
            <h2>{item.label}</h2>
            <p>{item.description}</p>
            <span class="hub-arrow" aria-hidden="true">→</span>
          </a>
        {/if}
      </li>
    {/each}
  </ul>

  <RelatedTopics href="/rechner/" />
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 0 1rem;
  }

  .header-description {
    max-width: 65ch;
    margin-top: 0.5rem;
    font-size: var(--font-size-base);
    line-height: var(--line-height-relaxed);
    color: var(--color-text-secondary);
  }

  .hub-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    grid-auto-rows: 1fr;
    gap: 1rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .hub-card {
    position: relative;
    display: block;
    height: 100%;
    padding: 1.25rem 2.25rem 1.25rem 1.25rem;
    background-color: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    text-decoration: none;
    transition:
      border-color var(--transition-fast),
      transform var(--transition-fast);
  }

  a.hub-card:hover {
    border-color: var(--color-accent-primary);
    transform: translateY(-2px);
  }

  .hub-card h2 {
    margin: 0 0 0.375rem 0;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .hub-card p {
    margin: 0;
    font-size: var(--font-size-sm);
    line-height: var(--line-height-relaxed);
    color: var(--color-text-secondary);
  }

  .hub-card.planned {
    border-style: dashed;
  }

  .hub-card.planned h2,
  .hub-card.planned p {
    color: var(--color-text-disabled);
  }

  .hub-badge {
    display: inline-block;
    margin-top: 0.625rem;
    padding: 0.0625rem 0.5rem;
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-full);
  }

  .hub-arrow {
    position: absolute;
    top: 1.25rem;
    right: 1rem;
    color: var(--color-text-muted);
  }
</style>
