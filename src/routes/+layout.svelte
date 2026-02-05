<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Breadcrumb from '$lib/components/ui/Breadcrumb.svelte';

  let { children } = $props();
</script>

<div class="app-container">
  <a href="#main-content" class="skip-to-content">Zum Inhalt springen</a>
  <Header />
  {#if $page.url.pathname !== '/'}
    <div class="breadcrumb-container">
      <Breadcrumb currentPath={$page.url.pathname} />
    </div>
  {/if}
  <main id="main-content" class="main-content">
    {@render children()}
  </main>
  <Footer />
</div>

<style>
  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-base);
    color: var(--color-text-primary);
    transition: background-color var(--transition-normal), color var(--transition-normal);
  }

  .breadcrumb-container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.75rem 1rem;
    background-color: var(--color-bg-elevated);
    border-bottom: 1px solid var(--color-border-default);
  }

  .main-content {
    flex-grow: 1;
    width: 100%;
    padding: 2rem 0.5rem;
  }

  .skip-to-content {
    position: absolute;
    left: -9999px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
    z-index: 100;
  }
  .skip-to-content:focus {
    position: fixed;
    top: 0.5rem;
    left: 0.5rem;
    width: auto;
    height: auto;
    padding: 0.75rem 1.5rem;
    background-color: var(--color-bg-surface);
    color: var(--color-text-primary);
    border: 2px solid var(--color-border-focus);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    box-shadow: var(--shadow-lg);
    z-index: 100;
  }
</style>
