<script lang="ts">
  import { browser } from '$app/environment';

  interface Props {
    /** Öffnet die Command-Palette. */
    onopen: () => void;
    /** Kompakte Darstellung (nur Lupe) für schmale Viewports. */
    compact?: boolean;
  }

  let { onopen, compact = false }: Props = $props();

  let shortcut = $state('Strg K');

  $effect(() => {
    if (!browser) return;
    const isApple = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
    shortcut = isApple ? '⌘ K' : 'Strg K';
  });
</script>

<button
  type="button"
  class="search-trigger"
  class:compact
  onclick={onopen}
  aria-keyshortcuts="Control+K"
  aria-label={`Suche öffnen (${shortcut})`}
>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
  {#if !compact}
    <span class="search-label">Suchen</span>
    <kbd class="search-kbd">{shortcut}</kbd>
  {/if}
</button>

<style>
  .search-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 44px;
    padding: 0.375rem 0.5rem 0.375rem 0.75rem;
    background-color: var(--color-elevated);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-md);
    color: var(--color-ink-subtle);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      color var(--transition-fast);
  }

  .search-trigger:hover {
    border-color: var(--color-line-strong);
    color: var(--color-ink);
  }

  .search-trigger:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }

  .search-trigger svg {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
  }

  .search-label {
    display: none;
  }

  @media (min-width: 900px) {
    .search-label {
      display: inline;
      min-width: 6rem;
      text-align: left;
    }
  }

  .search-kbd {
    display: none;
    padding: 0.125rem 0.375rem;
    font-family: inherit;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
    background-color: var(--color-surface);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-sm);
    white-space: nowrap;
  }

  @media (min-width: 900px) {
    .search-kbd {
      display: inline-block;
    }
  }

  .search-trigger.compact {
    width: 44px;
    padding: 0;
    justify-content: center;
  }
</style>
