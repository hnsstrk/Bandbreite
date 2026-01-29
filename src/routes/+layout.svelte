<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import Breadcrumb from '$lib/components/ui/Breadcrumb.svelte';

  let { children } = $props();
</script>

<div class="app-container">
  <Header />
  {#if $page.url.pathname !== '/'}
    <div class="breadcrumb-container">
      <Breadcrumb currentPath={$page.url.pathname} />
    </div>
  {/if}
  <main class="main-content">
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
    background-color: var(--color-bg-secondary, #f9fafb);
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  .main-content {
    flex-grow: 1;
    width: 100%;
    padding: 2rem 0.5rem;
  }
</style>
