<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import {
    buildGroups,
    readRecents,
    rememberRecent,
    isTypingTarget,
    type PaletteGroup,
    type PaletteItem
  } from './commandPalette.svelte';

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  let query = $state('');
  let activeIndex = $state(0);
  let inputEl = $state<HTMLInputElement | null>(null);
  let closeEl = $state<HTMLButtonElement | null>(null);
  let recents = $state<PaletteItem[]>([]);
  let lastFocused: HTMLElement | null = null;

  const groups = $derived<PaletteGroup[]>(buildGroups(query, recents));
  const flatItems = $derived(groups.flatMap((group) => group.items));

  $effect(() => {
    // Auswahl zurücksetzen, sobald sich die Eingabe ändert.
    query;
    activeIndex = 0;
  });

  $effect(() => {
    if (!browser || !open) return;
    lastFocused = document.activeElement as HTMLElement | null;
    recents = readRecents();
    document.body.style.overflow = 'hidden';
    queueMicrotask(() => inputEl?.focus());
    return () => {
      document.body.style.overflow = '';
    };
  });

  function close() {
    open = false;
    query = '';
    lastFocused?.focus();
  }

  function select(item: PaletteItem) {
    recents = rememberRecent(item);
    close();
    goto(item.href);
  }

  function handleWindowKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (open) close();
      else open = true;
      return;
    }
    if (!open && event.key === '/' && !isTypingTarget(event.target)) {
      event.preventDefault();
      open = true;
    }
  }

  function handleDialogKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      activeIndex = flatItems.length ? (activeIndex + 1) % flatItems.length : 0;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      activeIndex = flatItems.length ? (activeIndex - 1 + flatItems.length) % flatItems.length : 0;
    } else if (event.key === 'Enter') {
      const item = flatItems[activeIndex];
      if (item) {
        event.preventDefault();
        select(item);
      }
    } else if (event.key === 'Tab') {
      // Fokusfalle mit zwei Stationen: Eingabefeld und Schließen-Schaltfläche.
      // Der Tabulator wandert zwischen beiden, in beide Richtungen.
      event.preventDefault();
      const atInput = document.activeElement === inputEl;
      (atInput ? closeEl : inputEl)?.focus();
    }
  }

  function indexOf(item: PaletteItem): number {
    return flatItems.findIndex((entry) => entry.id === item.id);
  }
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if open}
  <div class="palette-backdrop" role="presentation" onclick={close}></div>
  <div
    class="palette"
    role="dialog"
    aria-modal="true"
    aria-label="Suche"
    tabindex="-1"
    onkeydown={handleDialogKeydown}
  >
    <div class="palette-input-row">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        bind:this={inputEl}
        bind:value={query}
        type="text"
        class="palette-input"
        placeholder="Seite, Band, Dienst oder Frequenz suchen …"
        role="combobox"
        aria-expanded="true"
        aria-controls="palette-results"
        aria-activedescendant={flatItems[activeIndex] ? `palette-item-${activeIndex}` : undefined}
        aria-label="Suchbegriff"
        autocomplete="off"
      />
      <button
        type="button"
        class="palette-close"
        bind:this={closeEl}
        onclick={close}
        aria-label="Suche schließen"
      >
        Esc
      </button>
    </div>

    <div class="palette-results" id="palette-results" role="listbox" aria-label="Suchergebnisse">
      {#each groups as group (group.label)}
        <p class="palette-group">{group.label}</p>
        {#each group.items as item (item.id)}
          {@const index = indexOf(item)}
          <a
            href={item.href}
            id={`palette-item-${index}`}
            class="palette-item"
            class:active={index === activeIndex}
            role="option"
            aria-selected={index === activeIndex}
            onmouseenter={() => (activeIndex = index)}
            onclick={(event) => {
              event.preventDefault();
              select(item);
            }}
          >
            <span class="palette-item-label">{item.label}</span>
            {#if item.sublabel}<span class="palette-item-sub">{item.sublabel}</span>{/if}
          </a>
        {/each}
      {/each}

      {#if groups.length === 0}
        <p class="palette-empty">
          {query.trim() ? `Keine Treffer für „${query}".` : 'Tippen, um zu suchen.'}
        </p>
      {/if}
    </div>

    <p class="palette-hint">
      <span>↑ ↓ auswählen</span><span>↵ öffnen</span><span>Esc schließen</span>
    </p>
  </div>
{/if}

<style>
  .palette-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgb(0 0 0 / 0.45);
    z-index: 90;
  }

  .palette {
    position: fixed;
    top: 10vh;
    left: 50%;
    transform: translateX(-50%);
    width: min(40rem, calc(100vw - 2rem));
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-surface);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: 91;
    overflow: hidden;
  }

  .palette-input-row {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-line);
    color: var(--color-ink-subtle);
  }

  .palette-input-row svg {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
  }

  .palette-input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    font-size: var(--font-size-base);
    color: var(--color-ink);
  }

  .palette-input:focus {
    outline: none;
  }

  .palette-close {
    padding: 0.25rem 0.5rem;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
    background-color: var(--color-elevated);
    border: 1px solid var(--color-line);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .palette-results {
    overflow-y: auto;
    padding: 0.5rem;
  }

  .palette-group {
    margin: 0.5rem 0 0.25rem 0.5rem;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-ink-subtle);
  }

  .palette-item {
    display: block;
    padding: 0.5rem 0.625rem;
    border-radius: var(--radius-md);
    text-decoration: none;
  }

  .palette-item.active {
    background-color: var(--color-elevated);
  }

  .palette-item-label {
    display: block;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink);
  }

  .palette-item-sub {
    display: block;
    margin-top: 0.0625rem;
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }

  .palette-empty {
    margin: 0;
    padding: 1.25rem 0.75rem;
    text-align: center;
    font-size: var(--font-size-sm);
    color: var(--color-ink-subtle);
  }

  .palette-hint {
    display: flex;
    gap: 1rem;
    margin: 0;
    padding: 0.5rem 1rem;
    border-top: 1px solid var(--color-line);
    font-size: var(--font-size-xs);
    color: var(--color-ink-subtle);
  }
</style>
