<script lang="ts">
  /**
   * Suchfeld der Portalseite. Es ist bewusst kein Eingabefeld, sondern eine
   * Schaltfläche: Sie öffnet dieselbe Command-Palette wie die Lupe im
   * Kopfbereich und die Tastenfolge Strg + K.
   */
  import { browser } from '$app/environment';
  import Icon from '$lib/components/ui/Icon.svelte';
  import { searchDialog } from '$lib/components/layout/searchDialog.svelte';

  let shortcut = $state('Strg K');

  $effect(() => {
    if (!browser) return;
    const isApple = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
    shortcut = isApple ? '⌘ K' : 'Strg K';
  });

  function handleSearchClick() {
    searchDialog.show();
  }
</script>

<button
  type="button"
  class="portal-search"
  onclick={handleSearchClick}
  aria-keyshortcuts="Control+K"
  aria-label={`Suche öffnen (${shortcut})`}
>
  <span class="portal-search__icon" aria-hidden="true"><Icon name="search" size={20} /></span>
  <span class="portal-search__text">Frequenz, Band, Dienst oder Kapitel suchen …</span>
  <kbd class="portal-search__kbd">{shortcut}</kbd>
</button>

<p class="portal-search__hint">
  Auch Frequenzen wie <span class="portal-search__sample">2,4 GHz</span> oder
  <span class="portal-search__sample">77,5 kHz</span> werden erkannt.
</p>

<style>
  .portal-search {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    min-height: 2.75rem;
    padding: 0.5rem 0.75rem;
    text-align: left;
    background-color: var(--color-surface);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-control);
    color: var(--color-ink-subtle);
    font-size: var(--font-size-base);
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      color var(--transition-fast);
  }

  .portal-search:hover {
    border-color: var(--color-brand);
    color: var(--color-ink);
  }

  .portal-search:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }

  .portal-search__icon {
    display: inline-flex;
    color: var(--color-brand);
  }

  .portal-search__text {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .portal-search__kbd {
    display: none;
    padding: 0.125rem 0.5rem;
    font-family: inherit;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
    background-color: var(--color-elevated);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-sm);
    white-space: nowrap;
  }

  @media (min-width: 640px) {
    .portal-search__kbd {
      display: inline-block;
    }
  }

  .portal-search__hint {
    margin: 0.25rem 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }

  .portal-search__sample {
    font-family: var(--font-mono);
    color: var(--color-ink-muted);
  }
</style>
