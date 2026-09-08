<script lang="ts">
  import { browser } from '$app/environment';
  import { NAV_GROUPS } from '$lib/data/navigation';
  import MobileMenuGroup from './MobileMenuGroup.svelte';

  interface Props {
    open: boolean;
    close: () => void;
    onsearch: () => void;
  }

  let { open, close, onsearch }: Props = $props();

  let drawer = $state<HTMLDivElement | null>(null);
  let expanded = $state<Record<string, boolean>>({});
  let lastFocused: HTMLElement | null = null;

  function toggle(id: string) {
    expanded = { ...expanded, [id]: !expanded[id] };
  }

  function focusables(): HTMLElement[] {
    if (!drawer) return [];
    return Array.from(drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter(
      (element) => element.offsetParent !== null
    );
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
      <button type="button" class="drawer-close" onclick={close} aria-label="Menü schließen"> ✕ </button>
    </div>

    <nav class="drawer-nav" aria-label="Mobile Navigation">
      {#each NAV_GROUPS as group (group.id)}
        <MobileMenuGroup {group} expanded={Boolean(expanded[group.id])} toggle={() => toggle(group.id)} {close} />
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

  .drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(22rem, 90vw);
    display: flex;
    flex-direction: column;
    background-color: var(--color-surface);
    border-left: 1px solid var(--color-line);
    z-index: 61;
    overflow-y: auto;
  }

  .drawer-head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-bottom: 1px solid var(--color-line);
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
    color: var(--color-ink-subtle);
    background-color: var(--color-elevated);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-md);
    cursor: pointer;
  }
  .drawer-close {
    width: 44px;
    height: 44px;
    color: var(--color-ink-muted);
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .drawer-nav {
    display: flex;
    flex-direction: column;
    padding-bottom: 2rem;
  }

  /* Zuletzt, damit die Regel gegen `.drawer { display: flex }` gewinnt:
     bei gleicher Spezifität entscheidet die Reihenfolge. */
  @media (min-width: 1024px) {
    .drawer-backdrop,
    .drawer {
      display: none;
    }
  }
</style>
