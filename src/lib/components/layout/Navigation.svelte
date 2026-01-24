<script lang="ts">
  import { page } from '$app/state';

  interface NavItem {
    href: string;
    label: string;
  }

  const navItems: NavItem[] = [
    { href: '/', label: 'Startseite' },
    { href: '/link-budget', label: 'Link Budget' }
  ];

  let mobileMenuOpen = $state(false);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<nav class="navigation">
  <div class="nav-container">
    <div class="nav-content">
      <!-- Logo / Brand -->
      <a href="/" class="nav-brand">Bandbreite</a>

      <!-- Desktop Navigation -->
      <ul class="nav-list">
        {#each navItems as item (item.href)}
          <li>
            <a
              href={item.href}
              class="nav-link"
              class:active={page.url.pathname === item.href}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>

      <!-- Mobile Hamburger Button -->
      <button
        type="button"
        class="mobile-menu-btn"
        onclick={toggleMobileMenu}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-menu"
        aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
      >
        {#if mobileMenuOpen}
          <!-- Close Icon (X) -->
          <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <!-- Hamburger Icon -->
          <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        {/if}
      </button>
    </div>

    <!-- Mobile Navigation Menu -->
    {#if mobileMenuOpen}
      <div id="mobile-menu" class="mobile-menu">
        <ul class="mobile-nav-list">
          {#each navItems as item (item.href)}
            <li>
              <a
                href={item.href}
                onclick={closeMobileMenu}
                class="mobile-nav-link"
                class:active={page.url.pathname === item.href}
              >
                {item.label}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</nav>

<style>
  .navigation {
    background-color: var(--color-bg-elevated);
    border-bottom: 1px solid var(--color-border-default);
    transition: background-color var(--transition-normal), border-color var(--transition-normal);
  }

  .nav-container {
    padding: 0 1rem;
  }

  .nav-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0;
  }

  .nav-brand {
    font-weight: 600;
    font-size: 1.125rem;
    color: var(--color-text-primary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .nav-brand:hover {
    color: var(--color-accent-primary);
  }

  .nav-list {
    display: none;
    list-style: none;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
  }

  @media (min-width: 768px) {
    .nav-list {
      display: flex;
    }
  }

  .nav-link {
    display: block;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .nav-link:hover {
    background-color: var(--color-bg-surface);
    color: var(--color-text-primary);
  }

  .nav-link.active {
    background-color: var(--color-bg-surface);
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .mobile-menu-btn {
    display: block;
    padding: 0.5rem;
    border-radius: var(--radius-md);
    border: none;
    background-color: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .mobile-menu-btn:hover {
    background-color: var(--color-bg-surface);
    color: var(--color-text-primary);
  }

  .mobile-menu-btn:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
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

  .mobile-menu {
    padding-bottom: 1rem;
  }

  @media (min-width: 768px) {
    .mobile-menu {
      display: none;
    }
  }

  .mobile-nav-list {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .mobile-nav-link {
    display: block;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .mobile-nav-link:hover {
    background-color: var(--color-bg-surface);
    color: var(--color-text-primary);
  }

  .mobile-nav-link.active {
    background-color: var(--color-bg-surface);
    color: var(--color-text-primary);
    font-weight: 500;
  }
</style>
