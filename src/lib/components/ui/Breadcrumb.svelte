<script lang="ts">
  import { getBreadcrumbs } from '$lib/data/navigation';

  interface Props {
    /** Aktueller Pfad, üblicherweise `page.url.pathname`. */
    currentPath: string;
  }

  let { currentPath }: Props = $props();

  /**
   * Die Startseite ist ein 308-Redirect auf /spektrum/ — der Breadcrumb
   * verlinkt deshalb direkt auf das Ziel und spart den Umweg.
   */
  const HOME_HREF = '/spektrum/';

  const breadcrumbs = $derived(getBreadcrumbs(currentPath));
  const showHome = $derived(breadcrumbs[0]?.href !== HOME_HREF);
</script>

{#if breadcrumbs.length > 0}
  <nav aria-label="Brotkrümelnavigation" class="breadcrumb">
    <ol class="breadcrumb-list">
      {#if showHome}
        <li class="breadcrumb-item">
          <a href={HOME_HREF} class="breadcrumb-link">Start</a>
        </li>
      {/if}
      {#each breadcrumbs as item, index (item.href)}
        <li class="breadcrumb-item">
          {#if index > 0 || showHome}
            <span class="breadcrumb-separator" aria-hidden="true">›</span>
          {/if}
          {#if item.isLast}
            <span class="breadcrumb-current" aria-current="page">{item.label}</span>
          {:else if item.status === 'geplant'}
            <span class="breadcrumb-planned">{item.label}</span>
          {:else}
            <a href={item.href} class="breadcrumb-link">{item.label}</a>
          {/if}
        </li>
      {/each}
    </ol>
  </nav>
{/if}

<style>
  .breadcrumb {
    font-size: var(--font-size-sm);
    line-height: 1.5;
  }

  .breadcrumb-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .breadcrumb-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .breadcrumb-separator {
    margin: 0 0.125rem;
    color: var(--color-text-disabled);
  }

  .breadcrumb-link {
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .breadcrumb-link:hover {
    color: var(--color-text-accent);
    text-decoration: underline;
  }

  .breadcrumb-link:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  .breadcrumb-planned {
    color: var(--color-text-disabled);
  }

  .breadcrumb-current {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }

  @media (max-width: 640px) {
    .breadcrumb {
      font-size: 0.8125rem;
    }
  }
</style>
