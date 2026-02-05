<script lang="ts">
  import HistoricalTimeline from '$lib/components/charts/HistoricalTimeline.svelte';
</script>

<svelte:head>
  <title>Historie - Bandbreite</title>
  <meta name="description" content="Geschichte der Funktechnik und Frequenznutzung" />
  <meta property="og:title" content="Historie | Bandbreite" />
  <meta property="og:description" content="Geschichte der Funktechnik und Frequenznutzung" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Historie | Bandbreite" />
  <meta name="twitter:description" content="Geschichte der Funktechnik und Frequenznutzung" />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Geschichte der Funktechnik</h1>
    <p class="header-description">
      Eine Zeitreise durch die Geschichte der Funktechnik und Frequenznutzung.
      Von den ersten Funkexperimenten bis zu modernen Kommunikationssystemen.
    </p>
  </header>

  <section class="timeline-section">
    <HistoricalTimeline />
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

  .timeline-section {
    width: 100%;
  }
</style>
