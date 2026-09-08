<script lang="ts">
  /**
   * Eine aufklappbare Gruppe der mobilen Navigation: Schaltfläche mit
   * `aria-expanded`, darunter die Spalten des Mega-Menüs als Linkliste.
   * Geplante Ziele erscheinen als Text mit Etikett, nicht als Link.
   */
  import { page } from '$app/state';
  import { getNodesByIds, isActivePath, type NavGroup } from '$lib/data/navigation';

  interface Props {
    group: NavGroup;
    expanded: boolean;
    toggle: () => void;
    close: () => void;
  }

  let { group, expanded, toggle, close }: Props = $props();

  const columns = $derived(
    group.columns.map((column) => ({ label: column.label, nodes: getNodesByIds(column.itemIds) }))
  );

  const active = $derived(
    (group.href ? isActivePath(group.href, page.url.pathname) : false) ||
      columns.some((column) => column.nodes.some((node) => isActivePath(node.href, page.url.pathname)))
  );
</script>

<section class="drawer-section">
  <button type="button" class="drawer-group" class:active aria-expanded={expanded} onclick={toggle}>
    <span>{group.label}</span>
    <svg
      class="chevron"
      class:open={expanded}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  </button>

  {#if expanded}
    {#if group.href}
      <a class="drawer-link overview" href={group.href} onclick={close}>Übersicht</a>
    {/if}
    {#each columns as column (column.label)}
      <p class="drawer-column">{column.label}</p>
      {#each column.nodes as node (node.id)}
        {#if node.status === 'geplant'}
          <span class="drawer-link planned">
            {node.label}<span class="badge">geplant</span>
          </span>
        {:else}
          <a class="drawer-link" class:active={page.url.pathname === node.href} href={node.href} onclick={close}
            >{node.label}</a
          >
        {/if}
      {/each}
    {/each}
  {/if}
</section>

<style>
  .drawer-section {
    border-bottom: 1px solid var(--color-line-subtle);
  }

  .drawer-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 48px;
    padding: 0.75rem 1rem;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .drawer-group.active {
    color: var(--color-brand);
  }

  .chevron {
    width: 1rem;
    height: 1rem;
    transition: transform var(--transition-fast);
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .drawer-column {
    margin: 0.5rem 0 0.125rem 1.5rem;
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-ink-subtle);
  }

  .drawer-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 44px;
    padding: 0.625rem 1rem 0.625rem 1.5rem;
    font-size: var(--font-size-sm);
    color: var(--color-ink-muted);
    text-decoration: none;
  }

  .drawer-link.overview {
    font-weight: var(--font-weight-medium);
    padding-left: 1rem;
  }

  .drawer-link:hover,
  .drawer-link.active {
    color: var(--color-ink);
    background-color: var(--color-elevated);
  }

  .drawer-link.planned {
    color: var(--color-ink-faint);
  }

  .badge {
    padding: 0.0625rem 0.375rem;
    font-size: 0.6875rem;
    border: 1px solid var(--color-line-strong);
    border-radius: var(--radius-full);
  }
</style>
