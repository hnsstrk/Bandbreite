<script lang="ts">
  import { page } from '$app/state';
  import { getNodesByIds, type NavGroup, type NavNode } from '$lib/data/navigation';
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
    margin-top: 0;
    min-width: 16rem;
    max-width: min(48rem, calc(100vw - 1.5rem));
    padding: 0.5rem;
    background-color: var(--color-surface);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-sm);
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
    min-width: 30rem;
  }

  .mega-columns {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    gap: 0.75rem;
  }

  .mega-column-title {
    margin: 0 0 0.25rem 0;
    padding: 0 0.375rem;
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
    padding: 0.1875rem 0.375rem;
    border-radius: 0;
    text-decoration: none;
    color: var(--color-ink-muted);
    transition: color var(--transition-fast);
  }

  a.mega-item:hover,
  a.mega-item:focus-visible,
  a.mega-item.active {
    color: var(--color-brand);
  }

  .mega-item-label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-normal);
    color: inherit;
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
    font-size: var(--text-2xs);
    color: var(--color-ink-faint);
  }
</style>
