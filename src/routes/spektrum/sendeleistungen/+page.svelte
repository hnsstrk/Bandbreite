<script lang="ts">
  import PowerDbChart from '$lib/components/charts/PowerDbChart.svelte';
</script>

<svelte:head>
  <title>Sendeleistungen im Frequenzspektrum - Bandbreite</title>
  <meta name="description" content="Übersicht typischer Sendeleistungen verschiedener Funksysteme über das elektromagnetische Spektrum: von IoT und WLAN bis Rundfunk und Radar." />
  <meta property="og:title" content="Sendeleistungen im Frequenzspektrum | Bandbreite" />
  <meta property="og:description" content="Übersicht typischer Sendeleistungen verschiedener Funksysteme über das elektromagnetische Spektrum: von IoT und WLAN bis Rundfunk und Radar." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Sendeleistungen im Frequenzspektrum | Bandbreite" />
  <meta name="twitter:description" content="Übersicht typischer Sendeleistungen verschiedener Funksysteme über das elektromagnetische Spektrum: von IoT und WLAN bis Rundfunk und Radar." />
</svelte:head>

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
  <section class="card">
    <h2 class="text-heading-2">Verwandte Werkzeuge</h2>
    <div class="tools-grid">
      <a href="/spektrum" class="tool-link">
        <strong>EM-Spektrum & Bänder</strong>
        <span>Interaktive Bandübersicht</span>
      </a>
      <a href="/rechner/fspl" class="tool-link">
        <strong>FSPL-Rechner</strong>
        <span>Freiraumdämpfung berechnen</span>
      </a>
      <a href="/rechner/link-budget" class="tool-link">
        <strong>Link Budget</strong>
        <span>Signalpfad-Analyse</span>
      </a>
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
  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .tool-link {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border-subtle);
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .tool-link:hover {
    border-color: var(--color-accent-primary);
    background: var(--color-bg-surface);
  }

  .tool-link strong {
    color: var(--color-text-primary);
    margin-bottom: 0.25rem;
  }

  .tool-link span {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
  }
</style>
