<script lang="ts">
  import TransmitterDatabase from '$lib/components/ui/TransmitterDatabase.svelte';
</script>

<svelte:head>
  <title>Senderdatenbank - Bandbreite</title>
  <meta name="description" content="Datenbank fuer Rundfunk- und Kommunikationssender" />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Senderdatenbank</h1>
    <p class="header-description">
      Durchsuchen Sie die Datenbank bekannter Rundfunk- und Kommunikationssender.
      Finden Sie Informationen zu Frequenzen, Standorten und Sendeleistungen.
    </p>
  </header>

  <section class="database-section">
    <TransmitterDatabase />
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

  .database-section {
    width: 100%;
  }
</style>
