<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte';

  // Navigation state for mobile menu
  let mobileMenuOpen = $state(false);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
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
      <a href="/" class="nav-link">Rechner</a>
      <a href="/link-budget" class="nav-link">Link Budget</a>
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
      <a href="/" class="mobile-nav-link" onclick={closeMobileMenu}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        Rechner
      </a>
      <a href="/link-budget" class="mobile-nav-link" onclick={closeMobileMenu}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        Link Budget
      </a>
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
    gap: 0.5rem;
  }

  @media (min-width: 768px) {
    .desktop-nav {
      display: flex;
    }
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
  }

  .nav-link:hover {
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

  .mobile-nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    text-decoration: none;
    border-radius: var(--radius-md);
    transition: color var(--transition-fast), background-color var(--transition-fast);
    min-height: 44px;
  }

  .mobile-nav-link:hover,
  .mobile-nav-link:active {
    color: var(--color-text-primary);
    background-color: var(--color-bg-elevated);
  }

  .mobile-nav-link svg {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }
</style>
