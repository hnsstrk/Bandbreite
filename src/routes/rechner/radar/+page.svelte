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
      Beruecksichtigt Sendeleistung, Antennengewinn, Radarquerschnitt und Empfaengerempfindlichkeit.
    </p>
  </header>

  <section class="calculator-section">
    <RadarRangeCalculator />
  </section>

  <section class="card">
    <h2 class="text-heading-2">Formel-Referenz</h2>
    <div class="formula-content">
      <p class="section-description">
        Die Radargleichung zur Berechnung der maximalen Reichweite:
      </p>
      <div class="formula-box">
        R<sub>max</sub> = &#8308;&#8730;((P<sub>t</sub> G<sup>2</sup> &#955;<sup>2</sup> &#963;) / ((4&#960;)<sup>3</sup> P<sub>min</sub>))
      </div>
      <p class="section-description">
        Wobei P<sub>t</sub> = Sendeleistung, G = Antennengewinn, &#955; = Wellenlaenge,
        &#963; = Radarquerschnitt (RCS), P<sub>min</sub> = minimale detektierbare Leistung.
      </p>
    </div>
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

  .section-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin: 0.75rem 0;
    line-height: var(--line-height-normal);
  }

  .formula-content {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .formula-box {
    background-color: var(--color-bg-code);
    padding: 1rem;
    border-radius: var(--radius-lg);
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    font-size: var(--font-size-lg);
    color: var(--color-text-primary);
    text-align: center;
    margin: 0.5rem 0;
  }
</style>
