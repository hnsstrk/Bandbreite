<script lang="ts">
  import ApplicationOverlay from '$lib/components/charts/ApplicationOverlay.svelte';
</script>

<svelte:head>
  <title>Anwendungen - Bandbreite</title>
  <meta name="description" content="Frequenzband-Anwendungen und -Zuweisungen" />
  <meta property="og:title" content="Anwendungen | Bandbreite" />
  <meta property="og:description" content="Frequenzband-Anwendungen und -Zuweisungen" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Anwendungen | Bandbreite" />
  <meta name="twitter:description" content="Frequenzband-Anwendungen und -Zuweisungen" />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Anwendungen nach Frequenzband</h1>
    <p class="header-description">
      Übersicht der typischen Anwendungen und Dienste in verschiedenen Frequenzbändern.
      Von Rundfunk über Mobilfunk bis hin zu Radar- und Satellitenanwendungen.
    </p>
  </header>

  <section class="application-section">
    <ApplicationOverlay />
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

  .application-section {
    width: 100%;
  }
</style>
