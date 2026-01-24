<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte';
</script>

<header class="header">
  <div class="header-content">
    <a href="/" class="logo">
      <span class="logo-icon" aria-hidden="true">&#128225;</span>
      <span class="logo-text">Bandbreite</span>
    </a>

    <div class="header-right">
      <p class="tagline">RF-Frequenzrechner</p>
      <ThemeToggle />
    </div>
  </div>
</header>

<style>
  .header {
    background-color: var(--color-bg-surface);
    color: var(--color-text-primary);
    padding: 1rem 1.5rem;
    box-shadow: var(--shadow-md);
    border-bottom: 1px solid var(--color-border-default);
    transition: background-color var(--transition-normal), border-color var(--transition-normal);
  }

  .header-content {
    max-width: 80rem;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text-primary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .logo:hover {
    color: var(--color-accent-primary);
  }

  .logo-icon {
    font-size: 1.5rem;
  }

  .logo-text {
    letter-spacing: -0.025em;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .tagline {
    font-size: 0.875rem;
    color: var(--color-text-tertiary);
    display: none;
  }

  @media (min-width: 640px) {
    .tagline {
      display: block;
    }
  }
</style>
