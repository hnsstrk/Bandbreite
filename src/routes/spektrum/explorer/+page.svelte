<script lang="ts">
  import FrequencyBandExplorer from '$lib/components/charts/FrequencyBandExplorer.svelte';
</script>

<svelte:head>
  <title>Frequenzband-Explorer - Bandbreite</title>
  <meta name="description" content="Interaktiver Explorer für Frequenzbänder" />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Frequenzband-Explorer</h1>
    <p class="header-description">
      Erkunden Sie Frequenzbänder interaktiv. Vergleichen Sie ITU, IEEE und NATO Bandbezeichnungen
      und entdecken Sie typische Anwendungen in verschiedenen Frequenzbereichen.
    </p>
  </header>

  <section class="explorer-section">
    <FrequencyBandExplorer />
  </section>
</div>

<style>
  .page-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding: 0 1rem;
  }

  .page-header {
    margin-bottom: 0;
  }

  .header-description {
    font-size: var(--font-size-base);
    color: var(--color-text-secondary);
    margin-top: 0.5rem;
    line-height: var(--line-height-relaxed);
  }

  .explorer-section {
    width: 100%;
  }
</style>
