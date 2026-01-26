<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';

  let { children } = $props();
</script>

<div class="app-container">
  <Header />
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

  .main-content {
    flex-grow: 1;
    width: 100%;
    padding: 2rem 0.5rem;
  }
</style>
