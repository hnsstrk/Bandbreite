<script lang="ts">
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import PowerDbChart from '$lib/components/charts/PowerDbChart.svelte';
</script>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Sendeleistungen im Frequenzspektrum</h1>
    <p class="header-description">
      Vergleich typischer Sendeleistungen verschiedener Kommunikations-, Radar- und Navigationssysteme
      über das elektromagnetische Frequenzspektrum.
    </p>
  </header>

  <section class="card">
    <div class="chart-container">
      <PowerDbChart />
    </div>
  </section>

  <!-- Info section -->
  <section class="card">
    <h2 class="text-heading-2">Über das Diagramm</h2>
    <p class="section-description">
      Typische Sendeleistungen verschiedener Kommunikations-, Radar-, Satelliten- und IoT-Systeme.
      X-Achse: Frequenz (unten) und Wellenlänge (oben). Y-Achse: Leistung in Watt (links) und dBm (rechts).
    </p>
    <div class="info-grid">
      <div class="info-card">
        <h4>Hohe Leistungen</h4>
        <p>Rundfunksender, Radarsysteme und militärische Anwendungen arbeiten mit Sendeleistungen bis in den Megawatt-Bereich.</p>
      </div>
      <div class="info-card">
        <h4>Mittlere Leistungen</h4>
        <p>Mobilfunk-Basisstationen, Amateurfunk und kommerzielle Kommunikationssysteme nutzen typischerweise Watt bis Kilowatt.</p>
      </div>
      <div class="info-card">
        <h4>Niedrige Leistungen</h4>
        <p>IoT-Geräte, WLAN, Bluetooth und andere Kurzstreckensysteme arbeiten im Milliwatt-Bereich.</p>
      </div>
    </div>
  </section>

  <!-- Related Tools -->
  <RelatedTopics href="/spektrum/sendeleistungen/" />
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

  .section-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-tertiary);
    margin: 0;
    line-height: var(--line-height-relaxed);
  }

  .chart-container {
    width: 100%;
    overflow-x: auto;
  }

  /* Info Grid */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .info-card {
    padding: 1rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border-subtle);
  }

  .info-card h4 {
    margin: 0 0 0.5rem 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .info-card p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
  }

  /* Tools Grid */
</style>
