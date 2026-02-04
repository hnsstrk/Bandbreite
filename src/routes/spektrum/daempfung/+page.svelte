<script lang="ts">
  import AtmosphericInputs from '$lib/components/converters/AtmosphericInputs.svelte';
  import AttenuationChart from '$lib/components/charts/AttenuationChart.svelte';
</script>

<svelte:head>
  <title>Atmosphärische Dämpfung - Bandbreite</title>
  <meta name="description" content="Atmosphärische Dämpfung durch Sauerstoff und Wasserdampf nach ITU-R P.676. Absorptionspeaks bei 22 GHz und 60 GHz." />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Atmosphärische Dämpfung</h1>
    <p class="header-description">
      Dämpfung elektromagnetischer Wellen durch atmosphärische Gase.
      Berechnung nach ITU-R P.676 für Sauerstoff und Wasserdampf.
    </p>
  </header>

  <section class="card">
    <h2 class="text-heading-2">Dämpfungsdiagramm</h2>
    <p class="section-description">
      Dämpfung durch Sauerstoff und Wasserdampf nach ITU-R P.676.
      Die Resonanzbereiche bei 22 GHz (H₂O) und 60 GHz (O₂) sind markiert.
    </p>
    <AtmosphericInputs />
    <div class="chart-container chart-margin-top">
      <AttenuationChart />
    </div>
  </section>

  <!-- Absorption Peaks Info -->
  <section class="card">
    <h2 class="text-heading-2">Absorptionspeaks</h2>
    <div class="info-grid">
      <div class="info-card">
        <h4>Wasserdampf (22 GHz)</h4>
        <p>Wassermoleküle in der Atmosphäre absorbieren bei 22,235 GHz besonders stark. Dieser Peak beeinflusst Satellitenverbindungen und Erdbeobachtung im K-Band.</p>
      </div>
      <div class="info-card">
        <h4>Sauerstoff (60 GHz)</h4>
        <p>Sauerstoffmoleküle erzeugen einen breiten Absorptionspeak um 60 GHz. Dies begrenzt die Reichweite im V-Band, ermöglicht aber sichere Kurzstreckenkommunikation (z.B. WiGig).</p>
      </div>
      <div class="info-card">
        <h4>Atmosphärische Fenster</h4>
        <p>Zwischen den Absorptionspeaks existieren Frequenzfenster mit geringer Dämpfung. Diese werden bevorzugt für Satellitenkommunikation und Radioastronomie genutzt.</p>
      </div>
    </div>
  </section>

  <!-- Practical implications -->
  <section class="card">
    <h2 class="text-heading-2">Praktische Bedeutung</h2>
    <p class="section-description">
      Die atmosphärische Dämpfung ist ein wichtiger Faktor bei der Planung von Funkstrecken, insbesondere bei höheren Frequenzen.
    </p>
    <div class="info-grid">
      <div class="info-card">
        <h4>Satellitenkommunikation</h4>
        <p>Bei Ka-Band (26–40 GHz) und V-Band (40–75 GHz) Verbindungen muss die atmosphärische Dämpfung in der Linkbudget-Berechnung berücksichtigt werden.</p>
      </div>
      <div class="info-card">
        <h4>5G und Mobilfunk</h4>
        <p>Millimeterwellen-Bänder (mmWave) für 5G bei 28 GHz und 39 GHz liegen in Bereichen mit moderater atmosphärischer Dämpfung.</p>
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
      <a href="/spektrum/sendeleistungen" class="tool-link">
        <strong>Sendeleistungen</strong>
        <span>Leistung über Frequenz</span>
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
    margin: 0.75rem 0;
    line-height: var(--line-height-relaxed);
  }

  .chart-container {
    width: 100%;
    overflow-x: auto;
  }

  .chart-margin-top {
    margin-top: 1rem;
  }

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
