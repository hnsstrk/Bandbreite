<script lang="ts">
  import RadarRangeCalculator from '$lib/components/calculators/RadarRangeCalculator.svelte';
</script>

<svelte:head>
  <title>Radar-Reichweite - Bandbreite</title>
  <meta name="description" content="Berechnung der Radar-Reichweite basierend auf der Radargleichung" />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Radar-Reichweite</h1>
    <p class="header-description">
      Berechnen Sie die maximale Reichweite eines Radarsystems basierend auf der Radargleichung.
      Berücksichtigt Sendeleistung, Antennengewinn, Radarquerschnitt und Empfängerempfindlichkeit.
    </p>
  </header>

  <section class="calculator-section">
    <RadarRangeCalculator />
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

  .calculator-section {
    width: 100%;
  }

</style>
