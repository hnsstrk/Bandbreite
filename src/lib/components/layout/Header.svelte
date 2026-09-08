<script lang="ts">
  import { page } from '$app/state';
  import ThemeToggle from './ThemeToggle.svelte';
  import MobileMenu from './MobileMenu.svelte';
  import MegaMenu from './MegaMenu.svelte';
  import SearchTrigger from './SearchTrigger.svelte';
  import { NAV_GROUPS } from '$lib/data/navigation';
  import { focusLeaves, isActiveGroup, watchDesktopWidth } from './header.svelte';

  interface Props {
    /** Öffnet die Command-Palette. */
    onsearch: () => void;
  }

  let { onsearch }: Props = $props();

  let mobileMenuOpen = $state(false);
  let activeGroup = $state<string | null>(null);
  let headerElement = $state<HTMLElement | null>(null);
  const panels = $state<Record<string, MegaMenu | undefined>>({});

  function closeGroup(returnFocus = false) {
    const id = activeGroup;
    activeGroup = null;
    if (returnFocus && id) {
      const trigger = document.querySelector<HTMLElement>(`[data-trigger="${id}"]`);
      trigger?.focus();
    }
  }

  function toggleGroup(id: string, event?: MouseEvent) {
    event?.stopPropagation();
    activeGroup = activeGroup === id ? null : id;
  }

  function handleTriggerKeydown(event: KeyboardEvent, id: string) {
    if (event.key === 'Escape') return closeGroup();
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    activeGroup = id;
    const first = event.key === 'ArrowDown';
    queueMicrotask(() => (first ? panels[id]?.focusFirst() : panels[id]?.focusLast()));
  }

  function handleClickOutside(event: MouseEvent) {
    if (activeGroup && headerElement && !headerElement.contains(event.target as Node)) {
      activeGroup = null;
    }
  }

  /** Tabulator aus dem Kopfbereich heraus schließt das Mega-Menü. */
  function handleFocusOut(event: FocusEvent) {
    if (activeGroup && focusLeaves(headerElement, event.relatedTarget)) activeGroup = null;
  }

  $effect(() => {
    if (!activeGroup) return;
    const timeoutId = setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  });

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  // Ab der Desktop-Breite gibt es die Schublade nicht mehr.
  $effect(() => (mobileMenuOpen ? watchDesktopWidth(closeMobileMenu) : undefined));
</script>

<header class="header safe-area-top" bind:this={headerElement} onfocusout={handleFocusOut}>
  <div class="header-content">
    <a href="/" class="logo" onclick={closeMobileMenu}>
      <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M2 12h2M6 12h2M10 12h2M14 12h2M18 12h2M22 12h2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 5v2M12 17v2" />
      </svg>
      <span class="logo-text">Bandbreite</span>
    </a>

    <nav class="desktop-nav" aria-label="Hauptnavigation">
      <ul class="nav-list">
        {#each NAV_GROUPS as group (group.id)}
          <li class="nav-item">
            <button
              type="button"
              class="nav-link"
              class:active={isActiveGroup(group, page.url.pathname)}
              class:open={activeGroup === group.id}
              aria-expanded={activeGroup === group.id}
              aria-controls={`megamenu-${group.id}`}
              data-trigger={group.id}
              onclick={(event) => toggleGroup(group.id, event)}
              onkeydown={(event) => handleTriggerKeydown(event, group.id)}
            >
              {group.label}
              <svg
                class="chevron"
                class:open={activeGroup === group.id}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <MegaMenu bind:this={panels[group.id]} {group} open={activeGroup === group.id} onclose={closeGroup} />
          </li>
        {/each}
      </ul>
    </nav>

    <div class="header-right">
      <SearchTrigger onopen={onsearch} />
      <ThemeToggle />
      <button
        type="button"
        class="mobile-menu-btn"
        onclick={toggleMobileMenu}
        aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          {#if mobileMenuOpen}
            <path d="M18 6L6 18M6 6l12 12" />
          {:else}
            <path d="M3 12h18M3 6h18M3 18h18" />
          {/if}
        </svg>
      </button>
    </div>
  </div>
</header>

<!-- Außerhalb des <header>: dessen backdrop-filter würde sonst zum Containing Block
     für den fixed positionierten Drawer und ihn auf die Headerhöhe beschneiden. -->
<MobileMenu open={mobileMenuOpen} close={closeMobileMenu} {onsearch} />

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 40;
    padding: 0.75rem clamp(1rem, 3vw, 1.5rem);
    color: var(--color-ink);
    background-color: color-mix(in srgb, var(--color-surface) 88%, transparent);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--color-line);
    box-shadow: var(--shadow-sm);
    transition:
      background-color var(--transition-normal),
      border-color var(--transition-normal);
  }

  .header-content {
    max-width: 80rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 44px;
    font-size: 1.125rem;
    font-weight: var(--font-weight-bold);
    letter-spacing: -0.025em;
    color: var(--color-ink);
    text-decoration: none;
  }

  .logo:hover {
    color: var(--color-brand);
  }

  .logo-icon {
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
  }

  .desktop-nav {
    display: none;
  }

  .nav-list {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-item {
    position: relative;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-height: 44px;
    padding: 0.5rem 0.75rem;
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-ink-muted);
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition:
      color var(--transition-fast),
      background-color var(--transition-fast);
  }

  .nav-link:hover,
  .nav-link.active,
  .nav-link.open {
    color: var(--color-ink);
    background-color: var(--color-elevated);
  }

  .nav-link:focus-visible {
    outline: 2px solid var(--color-focus-ring);
    outline-offset: 2px;
  }

  .chevron {
    width: 0.875rem;
    height: 0.875rem;
    transition: transform var(--transition-fast);
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0.5rem;
    color: var(--color-ink-muted);
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
  }

  .mobile-menu-btn:hover {
    background-color: var(--color-elevated);
  }

  .mobile-menu-btn svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  @media (min-width: 1024px) {
    .desktop-nav {
      display: block;
    }
    .mobile-menu-btn {
      display: none;
    }
  }
</style>
