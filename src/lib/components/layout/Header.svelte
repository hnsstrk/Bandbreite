<script lang="ts">
  import { page } from '$app/state';
  import ThemeToggle from './ThemeToggle.svelte';

  // Navigation state
  let mobileMenuOpen = $state(false);
  let activeDropdown = $state<string | null>(null);

  interface NavSubItem {
    href: string;
    label: string;
  }

  interface NavItem {
    id: string;
    label: string;
    items: NavSubItem[];
  }

  const navItems: NavItem[] = [
    {
      id: 'rechner',
      label: 'Rechner',
      items: [
        { href: '/rechner/fspl', label: 'FSPL-Rechner' },
        { href: '/rechner/link-budget', label: 'Link Budget' },
        { href: '/rechner/radar', label: 'Radar-Reichweite' },
        { href: '/rechner/kanalkapazitaet', label: 'Kanalkapazitaet' },
        { href: '/rechner/skin-tiefe', label: 'Skin-Tiefe' },
        { href: '/rechner/fresnel', label: 'Fresnel-Zone' }
      ]
    },
    {
      id: 'spektrum',
      label: 'Spektrum',
      items: [
        { href: '/', label: 'Uebersicht' },
        { href: '/spektrum/explorer', label: 'Frequenzband-Explorer' },
        { href: '/spektrum/ionosphaere', label: 'Ionosphaere' },
        { href: '/spektrum/anwendungen', label: 'Anwendungen' }
      ]
    },
    {
      id: 'datenbanken',
      label: 'Datenbanken',
      items: [
        { href: '/datenbanken/sender', label: 'Senderdatenbank' },
        { href: '/datenbanken/historie', label: 'Historie' }
      ]
    }
  ];

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    if (!mobileMenuOpen) {
      activeDropdown = null;
    }
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
    activeDropdown = null;
  }

  function toggleDropdown(id: string) {
    activeDropdown = activeDropdown === id ? null : id;
  }

  function handleDropdownKeydown(event: KeyboardEvent, id: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDropdown(id);
    } else if (event.key === 'Escape') {
      activeDropdown = null;
    }
  }

  function handleMouseEnter(id: string) {
    activeDropdown = id;
  }

  function handleMouseLeave() {
    activeDropdown = null;
  }

  function isActiveSection(item: NavItem): boolean {
    return item.items.some(subItem => page.url.pathname === subItem.href);
  }
</script>

<header class="header safe-area-top">
  <div class="header-content">
    <a href="/" class="logo" onclick={closeMobileMenu}>
      <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M2 12h2M6 12h2M10 12h2M14 12h2M18 12h2M22 12h2"/>
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 5v2M12 17v2"/>
      </svg>
      <span class="logo-text">Bandbreite</span>
    </a>

    <!-- Desktop Navigation -->
    <nav class="desktop-nav" aria-label="Hauptnavigation">
      {#each navItems as item (item.id)}
        <div
          class="nav-dropdown"
          role="navigation"
          onmouseenter={() => handleMouseEnter(item.id)}
          onmouseleave={handleMouseLeave}
        >
          <button
            type="button"
            class="nav-link dropdown-trigger"
            class:active={isActiveSection(item)}
            aria-expanded={activeDropdown === item.id}
            aria-haspopup="true"
            onclick={() => toggleDropdown(item.id)}
            onkeydown={(e) => handleDropdownKeydown(e, item.id)}
          >
            {item.label}
            <svg class="dropdown-icon" class:open={activeDropdown === item.id} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          {#if activeDropdown === item.id}
            <div class="dropdown-menu" role="menu">
              {#each item.items as subItem (subItem.href)}
                <a
                  href={subItem.href}
                  class="dropdown-item"
                  class:active={page.url.pathname === subItem.href}
                  role="menuitem"
                  onclick={() => { activeDropdown = null; }}
                >
                  {subItem.label}
                </a>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </nav>

    <div class="header-right">
      <p class="tagline">RF-Frequenzrechner</p>
      <ThemeToggle />

      <!-- Mobile Menu Button -->
      <button
        type="button"
        class="mobile-menu-btn"
        onclick={toggleMobileMenu}
        aria-label={mobileMenuOpen ? 'Menue schliessen' : 'Menue oeffnen'}
        aria-expanded={mobileMenuOpen}
      >
        {#if mobileMenuOpen}
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        {:else}
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12h18M3 6h18M3 18h18"/>
          </svg>
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Navigation Menu -->
  {#if mobileMenuOpen}
    <nav class="mobile-nav-menu" aria-label="Mobile Navigation">
      {#each navItems as item (item.id)}
        <div class="mobile-nav-section">
          <button
            type="button"
            class="mobile-nav-header"
            class:active={isActiveSection(item)}
            onclick={() => toggleDropdown(item.id)}
            aria-expanded={activeDropdown === item.id}
          >
            <span>{item.label}</span>
            <svg class="dropdown-icon" class:open={activeDropdown === item.id} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          {#if activeDropdown === item.id}
            <div class="mobile-nav-submenu">
              {#each item.items as subItem (subItem.href)}
                <a
                  href={subItem.href}
                  class="mobile-nav-link"
                  class:active={page.url.pathname === subItem.href}
                  onclick={closeMobileMenu}
                >
                  {subItem.label}
                </a>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </nav>
  {/if}
</header>

<style>
  .header {
    background-color: var(--color-bg-surface);
    color: var(--color-text-primary);
    padding: 0.75rem 1rem;
    box-shadow: var(--shadow-md);
    border-bottom: 1px solid var(--color-border-default);
    transition: background-color var(--transition-normal), border-color var(--transition-normal);
    position: sticky;
    top: 0;
    z-index: 40;
  }

  @media (min-width: 640px) {
    .header {
      padding: 1rem 1.5rem;
    }
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
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text-primary);
    text-decoration: none;
    transition: color var(--transition-fast);
    min-height: 44px;
  }

  @media (min-width: 640px) {
    .logo {
      font-size: 1.25rem;
    }
  }

  .logo:hover {
    color: var(--color-accent-primary);
  }

  .logo-icon {
    width: 1.5rem;
    height: 1.5rem;
    flex-shrink: 0;
  }

  .logo-text {
    letter-spacing: -0.025em;
  }

  /* Desktop Navigation */
  .desktop-nav {
    display: none;
    align-items: center;
    gap: 0.25rem;
  }

  @media (min-width: 768px) {
    .desktop-nav {
      display: flex;
    }
  }

  .nav-dropdown {
    position: relative;
  }

  .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: color var(--transition-fast), background-color var(--transition-fast);
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .nav-link:hover,
  .nav-link.active {
    color: var(--color-text-primary);
    background-color: var(--color-bg-elevated);
  }

  .dropdown-trigger {
    display: flex;
    align-items: center;
  }

  .dropdown-icon {
    width: 1rem;
    height: 1rem;
    transition: transform var(--transition-fast);
  }

  .dropdown-icon.open {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    min-width: 200px;
    background-color: var(--color-bg-surface);
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 0.5rem;
    z-index: 50;
    margin-top: 0.25rem;
  }

  .dropdown-item {
    display: block;
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: color var(--transition-fast), background-color var(--transition-fast);
  }

  .dropdown-item:hover,
  .dropdown-item.active {
    color: var(--color-text-primary);
    background-color: var(--color-bg-elevated);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  @media (min-width: 640px) {
    .header-right {
      gap: 1rem;
    }
  }

  .tagline {
    font-size: 0.875rem;
    color: var(--color-text-tertiary);
    display: none;
  }

  @media (min-width: 1024px) {
    .tagline {
      display: block;
    }
  }

  /* Mobile Menu Button */
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0.5rem;
    background: transparent;
    border: none;
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: color var(--transition-fast), background-color var(--transition-fast);
  }

  .mobile-menu-btn:hover {
    color: var(--color-text-primary);
    background-color: var(--color-bg-elevated);
  }

  @media (min-width: 768px) {
    .mobile-menu-btn {
      display: none;
    }
  }

  .menu-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  /* Mobile Navigation Menu */
  .mobile-nav-menu {
    display: flex;
    flex-direction: column;
    padding: 1rem 0;
    border-top: 1px solid var(--color-border-default);
    margin-top: 0.75rem;
  }

  @media (min-width: 768px) {
    .mobile-nav-menu {
      display: none;
    }
  }

  .mobile-nav-section {
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .mobile-nav-section:last-child {
    border-bottom: none;
  }

  .mobile-nav-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.875rem 1rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-primary);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color var(--transition-fast), background-color var(--transition-fast);
  }

  .mobile-nav-header:hover {
    background-color: var(--color-bg-elevated);
  }

  .mobile-nav-header.active {
    color: var(--color-accent-primary);
  }

  .mobile-nav-submenu {
    display: flex;
    flex-direction: column;
    padding-bottom: 0.5rem;
  }

  .mobile-nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem 0.75rem 1.5rem;
    font-size: 0.9375rem;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast), background-color var(--transition-fast);
    min-height: 44px;
  }

  .mobile-nav-link:hover,
  .mobile-nav-link:active {
    color: var(--color-text-primary);
    background-color: var(--color-bg-elevated);
  }

  .mobile-nav-link.active {
    color: var(--color-accent-primary);
    font-weight: 500;
  }
</style>
