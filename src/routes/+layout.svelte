<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import CommandPalette from '$lib/components/layout/CommandPalette.svelte';
  import Breadcrumb from '$lib/components/ui/Breadcrumb.svelte';
  import Metadata from '$lib/components/ui/Metadata.svelte';
  import LearningPathBar from '$lib/components/learning/LearningPathBar.svelte';
  import { searchDialog } from '$lib/components/layout/searchDialog.svelte';

  let { children } = $props();

  const title = $derived(page.data.title as string | undefined);
  const description = $derived(page.data.description as string | undefined);
  // Portalseite und Spektrum-Dashboard tragen keine Brotkrümel.
  const showBreadcrumb = $derived(page.url.pathname !== '/' && page.url.pathname !== '/spektrum/');
</script>

<Metadata {title} {description} />

<div class="app-container">
  <a href="#main-content" class="skip-to-content">Zum Inhalt springen</a>
  <Header onsearch={() => searchDialog.show()} />
  <LearningPathBar />

  {#if showBreadcrumb}
    <div class="breadcrumb-bar">
      <Breadcrumb currentPath={page.url.pathname} />
    </div>
  {/if}

  <main id="main-content" class="main-content">
    {@render children()}
  </main>

  <Footer />
</div>

<CommandPalette bind:open={searchDialog.open} />

<style>
  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-bg-base);
    color: var(--color-text-primary);
    transition:
      background-color var(--transition-normal),
      color var(--transition-normal);
  }

  .breadcrumb-bar {
    width: 100%;
    padding: 0.75rem var(--page-gutter) 0;
  }

  /* Bewusst ohne max-width: das Spektrum und die Datenbanken nutzen die volle
     Viewportbreite; Lesebreite regeln die Seiten selbst (ArticleLayout, .prose). */
  .main-content {
    flex-grow: 1;
    width: 100%;
    padding: 1.5rem var(--page-gutter) 2rem;
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
