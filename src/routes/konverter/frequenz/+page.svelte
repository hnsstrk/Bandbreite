<script lang="ts">
  import RelatedTopics from '$lib/components/ui/RelatedTopics.svelte';
  import FrequencyConverter from '$lib/components/converters/FrequencyConverter.svelte';
</script>

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

  <RelatedTopics href="/konverter/frequenz/" />
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

</style>
