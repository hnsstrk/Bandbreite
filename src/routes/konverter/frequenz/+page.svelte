<script lang="ts">
  import FrequencyConverter from '$lib/components/converters/FrequencyConverter.svelte';
</script>

<svelte:head>
  <title>Frequenzkonverter - Bandbreite</title>
  <meta name="description" content="Umrechnung zwischen Frequenz und Wellenlänge für das gesamte elektromagnetische Spektrum." />
  <meta property="og:title" content="Frequenzkonverter | Bandbreite" />
  <meta property="og:description" content="Umrechnung zwischen Frequenz und Wellenlänge für das gesamte elektromagnetische Spektrum." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Frequenzkonverter | Bandbreite" />
  <meta name="twitter:description" content="Umrechnung zwischen Frequenz und Wellenlänge für das gesamte elektromagnetische Spektrum." />
</svelte:head>

<div class="page-content">
  <header class="page-header">
    <h1 class="text-heading-1">Frequenzkonverter</h1>
    <p class="header-description">
      Umrechnung zwischen Frequenz und Wellenlänge.
      Gib einen Wert ein – der andere wird automatisch berechnet.
    </p>
  </header>

  <section class="card">
    <FrequencyConverter />
  </section>

  <section class="card info-section">
    <h2 class="text-heading-2">Grundformel</h2>
    <p>
      Die Beziehung zwischen Frequenz und Wellenlänge wird durch die Lichtgeschwindigkeit bestimmt:
    </p>
    <div class="formula-box">
      <span class="formula">λ = c / f</span>
      <span class="formula-legend">λ: Wellenlänge (m) &nbsp;|&nbsp; c: Lichtgeschwindigkeit (299.792.458 m/s) &nbsp;|&nbsp; f: Frequenz (Hz)</span>
    </div>
  </section>

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
      <a href="/wissen/frequenzbaender" class="tool-link">
        <strong>Frequenzbänder</strong>
        <span>ITU, IEEE und NATO Bänder</span>
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
    max-width: 65ch;
  }

  .info-section p {
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
  }

  .formula-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem;
    background: var(--color-bg-elevated);
    border-radius: var(--radius-md);
  }

  .formula {
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    font-size: var(--font-size-xl);
    color: var(--color-accent-primary);
  }

  .formula-legend {
    font-size: var(--font-size-xs);
    color: var(--color-text-tertiary);
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
