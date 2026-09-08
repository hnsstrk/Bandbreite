<script lang="ts">
  import { page } from '$app/state';
  import { getNodesByIds, findNode, type NavGroup, type NavNode } from '$lib/data/navigation';
  import { megaMenuKeydown } from './header.svelte';

  interface Props {
    group: NavGroup;
    open: boolean;
    /** Panel schließen und Fokus zurück auf den Auslöser geben. */
    onclose: (returnFocus?: boolean) => void;
  }

  let { group, open, onclose }: Props = $props();

  let panel = $state<HTMLDivElement | null>(null);

  interface ResolvedColumn {
    label: string;
    href?: string;
    nodes: NavNode[];
  }

  const columns = $derived<ResolvedColumn[]>(
    group.columns.map((column) => ({
      label: column.label,
      href: column.href,
      nodes: getNodesByIds(column.itemIds)
    }))
  );

  const hub = $derived(group.href ? findNode(group.href) : undefined);

  function linkElements(): HTMLAnchorElement[] {
    return panel ? Array.from(panel.querySelectorAll<HTMLAnchorElement>('a[href]')) : [];
  }

  /** Erstes Element fokussieren — wird vom Header über bind:this aufgerufen. */
  export function focusFirst() {
    linkElements()[0]?.focus();
  }

  /** Letztes Element fokussieren. */
  export function focusLast() {
    linkElements().at(-1)?.focus();
  }

  function handleKeydown(event: KeyboardEvent) {
    megaMenuKeydown(event, linkElements(), columns.length, onclose);
  }
</script>

<div
  class="mega-menu"
  class:visible={open}
  class:multi={columns.length > 1}
  id={`megamenu-${group.id}`}
  bind:this={panel}
  onkeydown={handleKeydown}
  aria-hidden={!open}
  role="presentation"
>
  {#if hub}
    <a class="mega-overview" href={hub.href} onclick={() => onclose(false)} tabindex={open ? 0 : -1}>
      <span class="mega-overview-label">Übersicht: {hub.label}</span>
      {#if hub.description}
        <span class="mega-overview-desc">{hub.description}</span>
      {/if}
    </a>
  {/if}

  <div class="mega-columns">
    {#each columns as column, columnIndex (column.label)}
      <div class="mega-column" data-column={columnIndex}>
        {#if column.href}
          <a class="mega-column-title link" href={column.href} onclick={() => onclose(false)} tabindex={open ? 0 : -1}
            >{column.label}</a
          >
        {:else}
          <p class="mega-column-title">{column.label}</p>
        {/if}
        <ul class="mega-list">
          {#each column.nodes as node (node.id)}
            <li>
              {#if node.status === 'geplant'}
                <span class="mega-item planned">
                  <span class="mega-item-label">{node.label}</span>
                  <span class="badge">geplant</span>
                </span>
              {:else}
                <a
                  class="mega-item"
                  class:active={page.url.pathname === node.href}
                  href={node.href}
                  tabindex={open ? 0 : -1}
                  onclick={() => onclose(false)}
                >
                  <span class="mega-item-label">{node.label}</span>
                  {#if node.description}
                    <span class="mega-item-desc">{node.description}</span>
                  {/if}
                </a>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</div>

<style>
  .mega-menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.375rem;
    min-width: 20rem;
    max-width: min(56rem, calc(100vw - 2rem));
    padding: 0.75rem;
    background-color: var(--color-surface);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 50;
    /* Geschlossen ohne Layoutfläche: absolut positionierte Elemente zählen zur
       Scrollhöhe des Dokuments, `visibility: hidden` genügt also nicht. */
    display: none;
    opacity: 0;
    transform: translateY(-6px);
    pointer-events: none;
    transition:
      opacity 150ms ease-out,
      transform 150ms ease-out,
      display 150ms allow-discrete;
  }

  .mega-menu.visible {
    display: block;
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  @starting-style {
    .mega-menu.visible {
      opacity: 0;
      transform: translateY(-6px);
    }
  }

  .mega-menu.multi {
    min-width: 36rem;
  }

  .mega-overview {
    display: block;
    padding: 0.625rem 0.75rem;
    margin-bottom: 0.5rem;
    border-radius: var(--radius-md);
    background-color: var(--color-elevated);
    text-decoration: none;
  }

  .mega-overview:hover {
    background-color: var(--color-hover);
  }

  .mega-overview-label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-ink);
  }

  .mega-overview-desc {
    display: block;
    margin-top: 0.125rem;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .mega-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 0.75rem;
  }

  .mega-column-title {
    margin: 0 0 0.375rem 0;
    padding: 0 0.75rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--color-ink-subtle);
    text-decoration: none;
    display: block;
  }

  a.mega-column-title:hover {
    color: var(--color-brand);
    text-decoration: underline;
  }

  .mega-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .mega-item {
    display: block;
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-md);
    text-decoration: none;
    color: var(--color-ink-muted);
    transition:
      background-color var(--transition-fast),
      color var(--transition-fast);
  }

  a.mega-item:hover,
  a.mega-item:focus-visible,
  a.mega-item.active {
    background-color: var(--color-elevated);
    color: var(--color-ink);
  }

  .mega-item-label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: inherit;
  }

  .mega-item-desc {
    display: block;
    margin-top: 0.125rem;
    font-size: var(--font-size-xs);
    line-height: 1.4;
    color: var(--color-ink-subtle);
  }

  .mega-item.planned {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    color: var(--color-ink-faint);
    cursor: default;
  }

  .badge {
    flex-shrink: 0;
    padding: 0.0625rem 0.375rem;
    font-size: 0.6875rem;
    border-radius: var(--radius-full);
    border: 1px solid var(--color-line-strong);
    color: var(--color-ink-subtle);
  }
</style>
