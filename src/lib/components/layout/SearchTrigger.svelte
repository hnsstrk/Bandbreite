<script lang="ts">
  /**
   * Auslöser der Command-Palette.
   *
   * Datenblatt-Stil: ein schlichtes Feld mit 1-px-Rahmen. Beschriftung und
   * Tastenkürzel erscheinen ausschließlich auf Zeigergeräten ab 64 rem
   * (`@media (hover: hover) and (min-width: 64rem)`) — auf Touch und schmalen
   * Anzeigen bleibt nur die Lupe als Icon-Schaltfläche.
   */
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
    justify-content: center;
    gap: 0.375rem;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    background-color: transparent;
    border: 1px solid var(--color-line);
    border-radius: var(--radius-sm);
    color: var(--color-ink-subtle);
    font-family: inherit;
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

  .search-trigger svg {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  /* Beschriftung und Kürzel nur dort, wo eine Tastatur zu erwarten ist. */
  .search-label,
  .search-kbd {
    display: none;
  }

  .search-kbd {
    padding: 0 0.25rem;
    font-family: inherit;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-sm);
    white-space: nowrap;
  }

  @media (hover: hover) and (min-width: 64rem) {
    .search-trigger:not(.compact) {
      width: auto;
      justify-content: flex-start;
      padding: 0 0.375rem 0 0.5rem;
    }

    .search-trigger:not(.compact) .search-label {
      display: inline;
      min-width: 4rem;
      text-align: left;
    }

    .search-trigger:not(.compact) .search-kbd {
      display: inline-block;
    }
  }
</style>
