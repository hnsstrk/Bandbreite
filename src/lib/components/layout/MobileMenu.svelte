<script lang="ts">
  import { page } from '$app/state';
  import { browser } from '$app/environment';
  import {
    NAV_GROUPS,
    getNodesByIds,
    isActivePath,
    type NavGroup,
    type NavNode
  } from '$lib/data/navigation';

  interface Props {
    open: boolean;
    close: () => void;
    onsearch: () => void;
  }

  let { open, close, onsearch }: Props = $props();

  let drawer = $state<HTMLDivElement | null>(null);
  let expanded = $state<Record<string, boolean>>({});
  let lastFocused: HTMLElement | null = null;

  function isActiveGroup(group: NavGroup): boolean {
    if (group.href && isActivePath(group.href, page.url.pathname)) return true;
    return columnsOf(group).some((column) =>
      column.nodes.some((node) => isActivePath(node.href, page.url.pathname))
    );
  }

  function columnsOf(group: NavGroup): { label: string; nodes: NavNode[] }[] {
    return group.columns.map((column) => ({
      label: column.label,
      nodes: getNodesByIds(column.itemIds)
    }));
  }

  function toggle(id: string) {
    expanded = { ...expanded, [id]: !expanded[id] };
  }

  function focusables(): HTMLElement[] {
    if (!drawer) return [];
    return Array.from(
      drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    ).filter((element) => element.offsetParent !== null);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const items = focusables();
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  $effect(() => {
    if (!browser || !open) return;
    lastFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    queueMicrotask(() => focusables()[0]?.focus());
    return () => {
      document.body.style.overflow = '';
      lastFocused?.focus();
    };
  });
</script>

{#if open}
  <div class="drawer-backdrop" role="presentation" onclick={close}></div>
  <div
    class="drawer safe-area-top"
    id="mobile-menu"
    role="dialog"
    aria-modal="true"
    aria-label="Navigation"
    tabindex="-1"
    bind:this={drawer}
    onkeydown={handleKeydown}
  >
    <div class="drawer-head">
      <button
        type="button"
        class="drawer-search"
        onclick={() => {
          close();
          onsearch();
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        Seite, Band oder Frequenz suchen
      </button>
      <button type="button" class="drawer-close" onclick={close} aria-label="Menü schließen">
        ✕
      </button>
    </div>

    <nav class="drawer-nav" aria-label="Mobile Navigation">
      {#each NAV_GROUPS as group (group.id)}
        <section class="drawer-section">
          <button
            type="button"
            class="drawer-group"
            class:active={isActiveGroup(group)}
            aria-expanded={Boolean(expanded[group.id])}
            onclick={() => toggle(group.id)}
          >
            <span>{group.label}</span>
            <svg
              class="chevron"
              class:open={expanded[group.id]}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {#if expanded[group.id]}
            {#if group.href}
              <a class="drawer-link overview" href={group.href} onclick={close}>Übersicht</a>
            {/if}
            {#each columnsOf(group) as column (column.label)}
              <p class="drawer-column">{column.label}</p>
              {#each column.nodes as node (node.id)}
                {#if node.status === 'geplant'}
                  <span class="drawer-link planned">
                    {node.label}<span class="badge">geplant</span>
                  </span>
                {:else}
                  <a
                    class="drawer-link"
                    class:active={page.url.pathname === node.href}
                    href={node.href}
                    onclick={close}>{node.label}</a
                  >
                {/if}
              {/each}
            {/each}
          {/if}
        </section>
      {/each}
    </nav>
  </div>
{/if}

<style>
  .drawer-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgb(0 0 0 / 0.45);
    z-index: 60;
  }
  @media (min-width: 1024px) {
    .drawer-backdrop,
    .drawer {
      display: none;
    }
  }

  .drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(22rem, 90vw);
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-surface);
    border-left: 1px solid var(--color-border-default);
    z-index: 61;
    overflow-y: auto;
  }

  .drawer-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-bottom: 1px solid var(--color-border-default);
  }
  .drawer-search svg {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  .drawer-search {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 44px;
    padding: 0.5rem 0.75rem;
    font-size: var(--font-size-sm);
    text-align: left;
    color: var(--color-text-tertiary);
    background-color: var(--color-bg-elevated);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    cursor: pointer;
  }
  .drawer-close {
    width: 44px;
    height: 44px;
    color: var(--color-text-secondary);
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .drawer-nav {
    display: flex;
    flex-direction: column;
    padding-bottom: 2rem;
  }  .drawer-section {
    border-bottom: 1px solid var(--color-border-subtle);
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
    color: var(--color-text-primary);
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .drawer-group.active {
    color: var(--color-accent-primary);
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
    color: var(--color-text-tertiary);
  }
  .drawer-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 44px;
    padding: 0.625rem 1rem 0.625rem 1.5rem;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    text-decoration: none;
  }
  .drawer-link.overview {
    font-weight: var(--font-weight-medium);
    padding-left: 1rem;
  }
  .drawer-link:hover,
  .drawer-link.active {
    color: var(--color-text-primary);
    background-color: var(--color-bg-elevated);
  }
  .drawer-link.planned {
    color: var(--color-text-disabled);
  }

  .badge {
    padding: 0.0625rem 0.375rem;
    font-size: 0.6875rem;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-full);
  }
</style>
